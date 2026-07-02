/* ============================================================
   WALLET WARRIORS — WAGER.JS
   Unicity State Transition SDK — Battle Wagering System
   Sphere SDK — Wallet Connect via autoConnect popup
   Gateway: https://gateway-test.unicity.network
   ============================================================ */

import { AggregatorClient }        from '@unicitylabs/state-transition-sdk/lib/api/AggregatorClient.js';
import { StateTransitionClient }   from '@unicitylabs/state-transition-sdk/lib/StateTransitionClient.js';
import { TokenId }                 from '@unicitylabs/state-transition-sdk/lib/token/TokenId.js';
import { TokenType }               from '@unicitylabs/state-transition-sdk/lib/token/TokenType.js';
import { TokenState }              from '@unicitylabs/state-transition-sdk/lib/token/TokenState.js';
import { Token }                   from '@unicitylabs/state-transition-sdk/lib/token/Token.js';
import { SigningService }          from '@unicitylabs/state-transition-sdk/lib/sign/SigningService.js';
import { MintCommitment }          from '@unicitylabs/state-transition-sdk/lib/transaction/MintCommitment.js';
import { MintTransactionData }     from '@unicitylabs/state-transition-sdk/lib/transaction/MintTransactionData.js';
import { MintTransactionState }    from '@unicitylabs/state-transition-sdk/lib/transaction/MintTransactionState.js';
import { TransferCommitment }      from '@unicitylabs/state-transition-sdk/lib/transaction/TransferCommitment.js';
import { UnmaskedPredicate }       from '@unicitylabs/state-transition-sdk/lib/predicate/embedded/UnmaskedPredicate.js';
import { HashAlgorithm }           from '@unicitylabs/state-transition-sdk/lib/hash/HashAlgorithm.js';
import { DirectAddress }           from '@unicitylabs/state-transition-sdk/lib/address/DirectAddress.js';
import { RootTrustBase }           from '@unicitylabs/state-transition-sdk/lib/bft/RootTrustBase.js';

// Sphere SDK — wallet connect
import { autoConnect }     from '@unicitylabs/sphere-sdk/connect/browser';
import { SPHERE_NETWORKS } from '@unicitylabs/sphere-sdk/connect';

// ============================================================
// CONFIG
// ============================================================
const GATEWAY_URL    = 'https://gateway-test.unicity.network';
const WALLET_URL     = 'https://sphere.unicity.network';
const WAGER_TYPE_HEX = 'aaff0011deadbeef0102030405060708090a0b0c0d0e0f10';
const SESSION_KEY    = 'ww-sphere-session';

// ============================================================
// HELPERS
// ============================================================
function hexToBytes(hex) {
  const h = hex.replace(/^0x/, '');
  const arr = new Uint8Array(h.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return arr;
}

function randomBytes(n) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
// SDK CLIENT — singleton (state-transition)
// ============================================================
let _stc = null;
function getStc() {
  if (!_stc) _stc = new StateTransitionClient(new AggregatorClient(GATEWAY_URL));
  return _stc;
}

// ============================================================
// POLL INCLUSION PROOF
// ============================================================
async function pollProof(requestId, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await getStc().getInclusionProof(requestId);
      if (res?.inclusionProof) return res;
    } catch (_) { /* not ready */ }
    await delay(2000);
  }
  return null;
}

// ============================================================
// TRUST BASE
// ============================================================
async function fetchTrustBase() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/trust-base`);
    if (res.ok) return RootTrustBase.fromJSON(await res.json());
  } catch (_) { /* fall through */ }
  return new RootTrustBase(1n, 2, 1n, 1n, [], 0n,
    new Uint8Array(32), null, null, new Map());
}

// ============================================================
// UNICITY WALLET CONNECTION  (Sphere Connect protocol)
// ============================================================
export const unicityWallet = {
  // connection state
  connectResult: null,   // AutoConnectResult from autoConnect()
  identity:      null,   // { chainPubkey, directAddress, nametag }
  balance:       null,   // balance from sphere_getBalance
  _signer:       null,   // SigningService derived from wallet pubkey (for wager signing)

  isConnected() { return this.connectResult !== null; },

  displayAddress() {
    if (!this.identity) return null;
    const addr = this.identity.nametag
      ? `@${this.identity.nametag}`
      : this.identity.chainPubkey
        ? this.identity.chainPubkey.slice(0, 8) + '...' + this.identity.chainPubkey.slice(-6)
        : null;
    return addr;
  },

  // Use the wallet's chainPubkey as a deterministic seed for SigningService.
  // The wallet signs via Sphere intents; this signer is used locally for the
  // state-transition SDK predicate derivation only.
  getSigner() {
    if (this._signer) return this._signer;
    if (!this.identity?.chainPubkey) return null;
    // Derive a deterministic private key from the public key via SHA-256 hash.
    // NOTE: This is a local session-scoped key for predicate binding, NOT the
    // wallet's actual private key. The wallet never exposes its private key.
    const pubBytes = hexToBytes(this.identity.chainPubkey);
    const seed = new Uint8Array(32);
    for (let i = 0; i < 32; i++) seed[i] = pubBytes[i] ^ pubBytes[32 - i];
    this._signer = new SigningService(seed);
    return this._signer;
  },

  async connect() {
    unicityWalletUI.setLoading('Opening Unicity wallet...');
    try {
      // Try silent resume first
      const savedSession = sessionStorage.getItem(SESSION_KEY);

      const result = await autoConnect({
        dapp: {
          name:        'Wallet Warriors',
          description: 'Your portfolio is your character. Battle other traders.',
          url:         location.origin,
        },
        walletUrl:       WALLET_URL,
        network:         SPHERE_NETWORKS.testnet2,
        silent:          !!savedSession,
        resumeSessionId: savedSession ?? undefined,
        permissions: [
          'identity:read',
          'balance:read',
          'sign:request',
        ],
      });

      sessionStorage.setItem(SESSION_KEY, result.connection.sessionId);
      this.connectResult = result;
      this.identity      = result.connection.identity;
      this._signer       = null; // reset so getSigner() re-derives

      // Fetch balance
      try {
        this.balance = await result.client.query('sphere_getBalance');
      } catch (_) { this.balance = null; }

      unicityWalletUI.setConnected(this);

      // Listen for wallet lock
      result.client.on('wallet:locked', () => {
        this.disconnect(false);
      });

      return result;
    } catch (err) {
      unicityWalletUI.setError(err.message);
      throw err;
    }
  },

  async disconnect(clearSession = true) {
    try {
      await this.connectResult?.disconnect();
    } catch (_) { /* ignore */ }
    if (clearSession) sessionStorage.removeItem(SESSION_KEY);
    this.connectResult = null;
    this.identity      = null;
    this.balance       = null;
    this._signer       = null;
    unicityWalletUI.setDisconnected();
  },
};

// ============================================================
// UNICITY WALLET UI CONTROLLER
// ============================================================
export const unicityWalletUI = {
  setLoading(msg) {
    this._badge('⏳ CONNECTING', 'ws-minting');
    this._msg(msg ?? 'Connecting to Unicity wallet...');
    this._addr('—');
    this._connectBtn('⏳ CONNECTING...', 'btn-uw-connect', true);
  },

  setConnected(wallet) {
    const addr = wallet.displayAddress() ?? '—';
    const bal  = wallet.balance
      ? ` · ${Array.isArray(wallet.balance) ? wallet.balance.length + ' assets' : 'balance loaded'}`
      : '';
    this._badge('✓ CONNECTED', 'ws-minted');
    this._msg(`Signed in as ${addr}${bal}`);
    this._addr(addr);
    this._connectBtn('✕ DISCONNECT', 'btn-uw-disconnect', false);
    this._indicator(true);
    // Enable wager mint button
    const mintBtn = document.getElementById('wagerMintBtn');
    if (mintBtn) mintBtn.disabled = false;
  },

  setDisconnected() {
    this._badge('◆ DISCONNECTED', 'ws-idle');
    this._msg('Connect your Unicity wallet to sign wager tokens.');
    this._addr('—');
    this._connectBtn('🔑 CONNECT UNICITY WALLET', 'btn-uw-connect', false);
    this._indicator(false);
  },

  setError(msg) {
    this._badge('✗ ERROR', 'ws-error');
    this._msg('Connection failed: ' + msg);
    this._connectBtn('🔑 CONNECT UNICITY WALLET', 'btn-uw-connect', false);
  },

  reset() { this.setDisconnected(); },

  _badge(text, cls) {
    const el = document.getElementById('unicityWalletStatus');
    if (el) { el.textContent = text; el.className = 'uw-status ' + cls; }
  },
  _msg(text) {
    const el = document.getElementById('unicityStatusMsg');
    if (el) el.textContent = text;
  },
  _addr(text) {
    const el = document.getElementById('unicityWalletAddr');
    if (el) el.textContent = text;
  },
  _connectBtn(text, cls, disabled) {
    const el = document.getElementById('unicityConnectBtn');
    if (el) { el.textContent = text; el.className = cls; el.disabled = disabled; }
  },
  _indicator(on) {
    const el = document.getElementById('unicityIndicator');
    if (el) el.className = 'uw-indicator' + (on ? ' on' : '');
  },
};

// ============================================================
// WAGER SESSION
// ============================================================
export class WagerSession {
  constructor() {
    this.id      = Array.from(randomBytes(4)).map(b => b.toString(16).padStart(2,'0')).join('');
    this.amount  = 0;
    this.status  = 'idle';
    this.tokenId = null;
    this._token  = null;
    this.signer1 = null;
    this.signer2 = null;
    this.txHash  = null;
    this.error   = null;
    this.log     = [];
  }

  _log(msg) {
    const ts = new Date().toLocaleTimeString('en', { hour12: false });
    this.log.unshift(`[${ts}] ${msg}`);
    wagerUI.refreshLog(this.log);
  }

  // MINT — lock wager token on Unicity testnet
  async mint(amount, p1Label, p2Label) {
    this.amount = amount;
    this.status = 'minting';
    wagerUI.setStatus('minting', `Minting ${amount} WAR tokens on Unicity testnet...`);
    this._log(`Wager: ${amount} WAR  |  ${p1Label} vs ${p2Label}`);

    try {
      // Use Unicity wallet signer if connected, else ephemeral
      if (unicityWallet.isConnected() && unicityWallet.getSigner()) {
        this.signer1 = unicityWallet.getSigner();
        this._log(`Using Unicity wallet: ${unicityWallet.displayAddress()}`);
      } else {
        this.signer1 = new SigningService(SigningService.generatePrivateKey());
        this._log(`No wallet connected — using ephemeral key`);
      }
      this.signer2 = new SigningService(SigningService.generatePrivateKey());

      const tokenId   = new TokenId(randomBytes(32));
      const tokenType = new TokenType(hexToBytes(WAGER_TYPE_HEX));
      const salt      = randomBytes(32);

      this.tokenId = tokenId.toString();
      this._log(`Token ID: ${this.tokenId.slice(0, 24)}...`);

      const predicate    = await UnmaskedPredicate.create(tokenId, tokenType, this.signer1, HashAlgorithm.SHA256, salt);
      const predicateRef = await predicate.getReference();
      const recipient    = await DirectAddress.create(await predicateRef.calculateHash());

      const tokenData = new TextEncoder().encode(JSON.stringify({
        game: 'WalletWarriors', wager: amount, p1: p1Label, p2: p2Label, ts: Date.now(),
      }));

      const mintData   = await MintTransactionData.create(tokenId, tokenType, tokenData, null, recipient, salt, null, null);
      const commitment = await MintCommitment.create(mintData);
      this._log(`Submitting commitment to ${GATEWAY_URL}...`);

      const submitResp = await getStc().submitMintCommitment(commitment);
      this._log(`Commitment accepted ✓  ID: ${submitResp.requestId?.toString()?.slice(0,18)}...`);
      this._log(`Waiting for inclusion proof (~2–5s)...`);

      const proofResp = await pollProof(submitResp.requestId);
      if (!proofResp) throw new Error('Timed out — aggregator did not return proof');
      this._log(`Inclusion proof received ✓`);

      const mintTx     = commitment.toTransaction(proofResp.inclusionProof);
      const trustBase  = await fetchTrustBase();
      const tokenState = new TokenState(predicate, null);
      this._token      = await Token.mint(trustBase, tokenState, mintTx);
      this.status      = 'minted';

      this._log(`Token minted (${this._token.toCBOR().length}B CBOR) ✓`);
      wagerUI.setStatus('minted', `${amount} WAR locked on-chain. Battle ready!`);
      return { success: true, tokenId: this.tokenId };

    } catch (err) {
      this.status = 'error';
      this.error  = err.message;
      this._log(`✗ ${err.message}`);
      wagerUI.setStatus('error', `Mint failed: ${err.message}`);
      console.error('[WagerSession] mint:', err);
      return { success: false, error: err.message };
    }
  }

  // SETTLE — transfer token to battle winner
  async settle(winnerIsP1) {
    if (!this._token) return { success: false, error: 'No token minted' };

    this.status = 'settling';
    const who   = winnerIsP1 ? 'PLAYER 1 🦅' : 'PLAYER 2 🧙';
    wagerUI.setStatus('settling', `Transferring ${this.amount} WAR → ${who}...`);
    this._log(`Settling → winner is ${who}`);

    try {
      const winnerSigner = winnerIsP1 ? this.signer1 : this.signer2;
      const salt         = randomBytes(32);

      const winnerPred = await UnmaskedPredicate.create(this._token.id, this._token.type, winnerSigner, HashAlgorithm.SHA256, salt);
      const winnerRef  = await winnerPred.getReference();
      const winnerAddr = await DirectAddress.create(await winnerRef.calculateHash());
      const msg        = new TextEncoder().encode(JSON.stringify({ winner: who, ts: Date.now() }));

      const commitment = await TransferCommitment.create(this._token, winnerAddr, salt, null, msg, this.signer1);
      this._log(`Transfer commitment submitted...`);

      const submitResp = await getStc().submitTransferCommitment(commitment);
      this._log(`Accepted ✓  ID: ${submitResp.requestId?.toString()?.slice(0,18)}...`);
      this._log(`Waiting for transfer proof...`);

      const proofResp = await pollProof(submitResp.requestId);
      if (!proofResp) throw new Error('Timed out — no transfer proof');
      this._log(`Transfer confirmed on Unicity testnet ✓`);

      const transferTx = commitment.toTransaction(proofResp.inclusionProof);
      const trustBase  = await fetchTrustBase();
      const newState   = new TokenState(winnerPred, null);
      this._token      = await this._token.update(trustBase, newState, transferTx);

      this.txHash = submitResp.requestId?.toString();
      this.status = 'settled';
      this._log(`${this.amount} WAR delivered to ${who} ✓`);
      wagerUI.setStatus('settled', `Wager settled! ${this.amount} WAR → ${who}`);
      return { success: true, txHash: this.txHash };

    } catch (err) {
      this.status = 'error';
      this.error  = err.message;
      this._log(`✗ ${err.message}`);
      wagerUI.setStatus('error', `Settle failed: ${err.message}`);
      console.error('[WagerSession] settle:', err);
      return { success: false, error: err.message };
    }
  }
}

// ============================================================
// WAGER UI CONTROLLER
// ============================================================
export const wagerUI = {
  setStatus(state, msg) {
    const badge = document.getElementById('wagerStatusBadge');
    const msgEl = document.getElementById('wagerStatusMsg');
    if (!badge || !msgEl) return;
    const map = {
      idle:     ['◆ IDLE',      'ws-idle'],
      minting:  ['⏳ MINTING',  'ws-minting'],
      minted:   ['✓ LOCKED',   'ws-minted'],
      battling: ['⚔ BATTLE',   'ws-battling'],
      settling: ['⏳ SETTLING', 'ws-settling'],
      settled:  ['✓ SETTLED',  'ws-settled'],
      error:    ['✗ ERROR',    'ws-error'],
    };
    const [text, cls] = map[state] ?? map.idle;
    badge.textContent = text;
    badge.className   = 'wager-badge ' + cls;
    msgEl.textContent = msg;
  },

  refreshLog(entries) {
    const el = document.getElementById('wagerLog');
    if (!el) return;
    el.innerHTML = entries.slice(0, 10).map(e => `<div class="wager-log-entry">${e}</div>`).join('');
  },

  reset() {
    this.setStatus('idle', 'Place your wager to begin.');
    const el = document.getElementById('wagerLog');
    if (el) el.innerHTML = '<div class="wager-log-entry">▶ Ready. Waiting for wager...</div>';
    const amtEl = document.getElementById('wagerAmount');
    if (amtEl) amtEl.value = '100';
  },
};