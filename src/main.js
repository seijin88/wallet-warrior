/* ============================================================
   WALLET WARRIORS — MAIN.JS  (8-bit JRPG Edition)
   Features: Wallet Scanner + Rabby / multi-wallet connect + Unicity Wager
   ============================================================ */
import './styles.css';
import { WagerSession, wagerUI, unicityWallet, unicityWalletUI } from './wager.js';

// ============================================================
// STATE
// ============================================================
let isConnected   = false;
let walletAddress = '';
let connectedProvider = null;
let battleInProgress  = false;
let battleTimer       = null;
let hp1 = 100, hp2 = 100;
let scanRunning = false;

// ============================================================
// DATA — CHARACTERS
// ============================================================
const characterData = {
  classes: [
    { name:'SHADOW TRADER', key:'shadow', emoji:'🧙',
      titles:['Devourer of Dips','Phantom of Charts','Silent Accumulator'],
      skills:['buy the dip','diamond hands','chart read','rug detect'] },
    { name:'MOON CHASER',   key:'moon',   emoji:'🦅',
      titles:['Rider of Rockets','Ascension Prophet','Moonbound Acolyte'],
      skills:['moon shot','FOMO resist','leverage up','escape velocity'] },
    { name:'DEGEN KING',    key:'degen',  emoji:'👑',
      titles:['Lord of Leverage','The Reckless One','Chaos Incarnate'],
      skills:['ape in','yolo trade','liquidation','respawn'] },
    { name:'DIAMOND LORD',  key:'diamond',emoji:'💎',
      titles:['The Unshaken','Bearer of Losses','Iron Will Sentinel'],
      skills:['never sell','iron grip','hodl aura','loss absorb'] },
    { name:'SPEED ROGUE',   key:'speed',  emoji:'⚡',
      titles:['Blink Executor','The Microsecond','Ghost in Mempool'],
      skills:['flash trade','mev block','snipe entry','gas boost'] },
    { name:'YIELD DRUID',   key:'yield',  emoji:'🌾',
      titles:['Harvester of APY','Compounder Prime','The Patient One'],
      skills:['auto compound','lp farm','yield shield','harvest'] },
  ],
  badgePools: [
    ['💎 DIAM. HANDS','🔥 TOP 1%','⚡ SPEED'],
    ['🌙 MOON BELIEVER','📈 BULL RUNNER','🎯 SNIPER'],
    ['🦍 APE ARMY','💀 RUG SURVIVOR','👑 DEGEN LEG'],
    ['❄️ ICE NERVES','🏔️ BEAR VET','🛡️ NEVER LIQ'],
    ['👻 GHOST TRADER','⚗️ MEV RESIST','🌀 ARB MASTER'],
    ['🌾 1000% APY','🔄 AUTO-COMP','💧 LP WARRIOR'],
  ],
};

// ============================================================
// DATA — LEADERBOARD
// ============================================================
const leaderboardData = {
  global: [
    { rank:1,  name:'VoidWalker',   addr:'0xDEAD...BEEF', cls:'SHADOW TRADER', clsKey:'shadow', emoji:'🧙', power:9847, w:412, l:31,  streak:'🔥W21' },
    { rank:2,  name:'CryptoKnight', addr:'0xABCD...1234', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🦅', power:8912, w:387, l:44,  streak:'🔥W14' },
    { rank:3,  name:'DiamondLord',  addr:'0x1111...FFFF', cls:'DIAMOND LORD',  clsKey:'diamond',emoji:'💎', power:8504, w:321, l:55,  streak:'🔥W8'  },
    { rank:4,  name:'DegenKing',    addr:'0xFACE...CAFE', cls:'DEGEN KING',    clsKey:'degen',  emoji:'👑', power:7663, w:298, l:89,  streak:'🔥W5'  },
    { rank:5,  name:'ShadowBlade',  addr:'0x7F3a...9c4E', cls:'SHADOW TRADER', clsKey:'shadow', emoji:'⚔️',power:6991, w:244, l:67,  streak:'W3'    },
    { rank:6,  name:'NFTSorcerer',  addr:'0x55AA...BB99', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🔮', power:6234, w:201, l:88,  streak:'W1'    },
    { rank:7,  name:'YieldFarmer',  addr:'0xBEEF...DEAD', cls:'YIELD DRUID',   clsKey:'yield',  emoji:'🌾', power:5872, w:178, l:94,  streak:'L2'    },
    { rank:8,  name:'WhaleKing',    addr:'0x9999...0000', cls:'DEGEN KING',    clsKey:'degen',  emoji:'🐋', power:5541, w:156, l:101, streak:'W4'    },
    { rank:9,  name:'ArbiTrader',   addr:'0x2222...AAAA', cls:'MOON CHASER',   clsKey:'moon',   emoji:'⚡', power:4987, w:134, l:112, streak:'L1'    },
    { rank:10, name:'GasGuru',      addr:'0xCCCC...3333', cls:'SPEED ROGUE',   clsKey:'speed',  emoji:'🎯', power:4421, w:112, l:98,  streak:'W2'    },
  ],
  weekly: [
    { rank:1,  name:'WeeklyHunter', addr:'0xW001...AAAA', cls:'DEGEN KING',    clsKey:'degen',  emoji:'👑', power:3120, w:44, l:3,  streak:'🔥W18' },
    { rank:2,  name:'MondayMage',   addr:'0xW002...BBBB', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🌙', power:2980, w:38, l:7,  streak:'🔥W11' },
    { rank:3,  name:'TurboTrade',   addr:'0xW003...CCCC', cls:'SPEED ROGUE',   clsKey:'speed',  emoji:'⚡', power:2734, w:35, l:9,  streak:'🔥W7'  },
    { rank:4,  name:'AlphaMiner',   addr:'0xW004...DDDD', cls:'SHADOW TRADER', clsKey:'shadow', emoji:'🧙', power:2501, w:30, l:12, streak:'W3'    },
    { rank:5,  name:'FlashLoan',    addr:'0xW005...EEEE', cls:'MOON CHASER',   clsKey:'moon',   emoji:'💫', power:2314, w:28, l:15, streak:'W2'    },
    { rank:6,  name:'PortfolioG',   addr:'0xW006...FFFF', cls:'DIAMOND LORD',  clsKey:'diamond',emoji:'💎', power:2100, w:24, l:18, streak:'L1'    },
    { rank:7,  name:'SmartMoney',   addr:'0xW007...1111', cls:'YIELD DRUID',   clsKey:'yield',  emoji:'🌾', power:1987, w:21, l:19, streak:'W1'    },
    { rank:8,  name:'SwapKing',     addr:'0xW008...2222', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🔄', power:1812, w:18, l:22, streak:'L3'    },
    { rank:9,  name:'LiquidLord',   addr:'0xW009...3333', cls:'DEGEN KING',    clsKey:'degen',  emoji:'💧', power:1677, w:15, l:24, streak:'W2'    },
    { rank:10, name:'GasGhost',     addr:'0xW010...4444', cls:'SPEED ROGUE',   clsKey:'speed',  emoji:'👻', power:1543, w:12, l:26, streak:'L2'    },
  ],
  defi: [
    { rank:1,  name:'YieldMaxxer',  addr:'0xD001...AAAA', cls:'YIELD DRUID',   clsKey:'yield',  emoji:'🌾', power:8221, w:334, l:41,  streak:'🔥W19' },
    { rank:2,  name:'LPKing',       addr:'0xD002...BBBB', cls:'DEGEN KING',    clsKey:'degen',  emoji:'💧', power:7912, w:298, l:54,  streak:'🔥W12' },
    { rank:3,  name:'CompoundG',    addr:'0xD003...CCCC', cls:'DIAMOND LORD',  clsKey:'diamond',emoji:'💎', power:7341, w:267, l:61,  streak:'🔥W9'  },
    { rank:4,  name:'AaveArcher',   addr:'0xD004...DDDD', cls:'SHADOW TRADER', clsKey:'shadow', emoji:'🏹', power:6788, w:241, l:77,  streak:'W6'    },
    { rank:5,  name:'CurveWitch',   addr:'0xD005...EEEE', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🔮', power:6123, w:211, l:88,  streak:'W4'    },
    { rank:6,  name:'UniSwapG',     addr:'0xD006...FFFF', cls:'SPEED ROGUE',   clsKey:'speed',  emoji:'⚡', power:5670, w:189, l:94,  streak:'W2'    },
    { rank:7,  name:'MakerDao',     addr:'0xD007...1111', cls:'DEGEN KING',    clsKey:'degen',  emoji:'👑', power:5210, w:167, l:103, streak:'L1'    },
    { rank:8,  name:'SushiMage',    addr:'0xD008...2222', cls:'YIELD DRUID',   clsKey:'yield',  emoji:'🍣', power:4890, w:144, l:112, streak:'W3'    },
    { rank:9,  name:'PancakePro',   addr:'0xD009...3333', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🥞', power:4412, w:121, l:121, streak:'L2'    },
    { rank:10, name:'BalancerB',    addr:'0xD010...4444', cls:'DIAMOND LORD',  clsKey:'diamond',emoji:'⚖️',power:3998, w:99,  l:131, streak:'W1'    },
  ],
  nft: [
    { rank:1,  name:'ApeGod',       addr:'0xN001...AAAA', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🦍', power:9112, w:401, l:28,  streak:'🔥W24' },
    { rank:2,  name:'PunkLord',     addr:'0xN002...BBBB', cls:'DEGEN KING',    clsKey:'degen',  emoji:'😈', power:8634, w:367, l:39,  streak:'🔥W16' },
    { rank:3,  name:'BlurBlade',    addr:'0xN003...CCCC', cls:'SPEED ROGUE',   clsKey:'speed',  emoji:'💨', power:8010, w:312, l:51,  streak:'🔥W10' },
    { rank:4,  name:'OpenSeaG',     addr:'0xN004...DDDD', cls:'SHADOW TRADER', clsKey:'shadow', emoji:'🌊', power:7401, w:278, l:64,  streak:'W7'    },
    { rank:5,  name:'RaribleR',     addr:'0xN005...EEEE', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🎨', power:6788, w:244, l:78,  streak:'W4'    },
    { rank:6,  name:'SudoSwapS',    addr:'0xN006...FFFF', cls:'DIAMOND LORD',  clsKey:'diamond',emoji:'🔷', power:6201, w:211, l:91,  streak:'W2'    },
    { rank:7,  name:'MagicEden',    addr:'0xN007...1111', cls:'MOON CHASER',   clsKey:'moon',   emoji:'🪄', power:5688, w:178, l:104, streak:'L1'    },
    { rank:8,  name:'FloorPump',    addr:'0xN008...2222', cls:'DEGEN KING',    clsKey:'degen',  emoji:'⬆️',power:5211, w:156, l:117, streak:'W3'    },
    { rank:9,  name:'WashTrade',    addr:'0xN009...3333', cls:'SPEED ROGUE',   clsKey:'speed',  emoji:'🌀', power:4721, w:133, l:128, streak:'L2'    },
    { rank:10, name:'LiquidNFT',    addr:'0xN010...4444', cls:'MOON CHASER',   clsKey:'moon',   emoji:'💦', power:4198, w:112, l:139, streak:'W1'    },
  ],
};

// ============================================================
// DATA — SCANNER MOCK PROFILES
// ============================================================
const scanProfiles = [
  {
    netWorth:'$248,412', pnl:'+$91,204', pnlPos:true, winRate:'73.4%', txs:'4,812', since:'2019',
    risk:22,
    tokens:[
      { icon:'🔷', name:'ETH',  amount:'42.3',  value:'$147K', change:'+4.2%', up:true  },
      { icon:'🟡', name:'BTC',  amount:'1.24',  value:'$71K',  change:'+1.8%', up:true  },
      { icon:'🔵', name:'USDC', amount:'18,400',value:'$18.4K',change:'0.0%',  up:true  },
      { icon:'🦄', name:'UNI',  amount:'3,200', value:'$9.8K', change:'-2.1%', up:false },
      { icon:'🐱', name:'SHIB', amount:'4.1B',  value:'$1.9K', change:'+12.3%',up:true  },
    ],
    trades:[
      { type:'buy',  token:'ETH',   amount:'5 ETH',    pnl:'+$8,240',  pos:true,  time:'2h ago'  },
      { type:'sell', token:'LINK',  amount:'1,200 LNK',pnl:'+$3,120',  pos:true,  time:'8h ago'  },
      { type:'buy',  token:'ARB',   amount:'10,000',   pnl:'-$880',    pos:false, time:'1d ago'  },
      { type:'sell', token:'MATIC', amount:'8,000',    pnl:'+$1,640',  pos:true,  time:'2d ago'  },
      { type:'buy',  token:'BTC',   amount:'0.24 BTC', pnl:'+$14,200', pos:true,  time:'5d ago'  },
    ],
    clsIdx: 3, // DIAMOND LORD
    level: 67, atk:62, def:91, agi:44, lck:58,
  },
  {
    netWorth:'$18,840', pnl:'-$4,201', pnlPos:false, winRate:'41.2%', txs:'12,044', since:'2021',
    risk:81,
    tokens:[
      { icon:'🐕', name:'DOGE',  amount:'420,000', value:'$9.2K',  change:'+8.1%',  up:true  },
      { icon:'🚀', name:'PEPE',  amount:'88M',     value:'$4.4K',  change:'+44.2%', up:true  },
      { icon:'🔷', name:'ETH',   amount:'1.8',     value:'$4.2K',  change:'+4.2%',  up:true  },
      { icon:'💀', name:'LUNA2', amount:'220,000', value:'$880',   change:'-66.6%', up:false },
    ],
    trades:[
      { type:'buy',  token:'PEPE',  amount:'120M',     pnl:'+$2,800',  pos:true,  time:'1h ago'  },
      { type:'sell', token:'LUNA2', amount:'500K',     pnl:'-$18,200', pos:false, time:'3d ago'  },
      { type:'buy',  token:'DOGE',  amount:'200K',     pnl:'+$1,100',  pos:true,  time:'4d ago'  },
      { type:'sell', token:'SHIB',  amount:'2B',       pnl:'-$440',    pos:false, time:'6d ago'  },
    ],
    clsIdx: 2, // DEGEN KING
    level: 28, atk:88, def:18, agi:77, lck:91,
  },
  {
    netWorth:'$1,204,880', pnl:'+$604,210', pnlPos:true, winRate:'88.1%', txs:'924', since:'2017',
    risk:8,
    tokens:[
      { icon:'🔷', name:'ETH',   amount:'340.0',   value:'$941K',  change:'+4.2%', up:true },
      { icon:'🟡', name:'BTC',   amount:'2.4',     value:'$137K',  change:'+1.8%', up:true },
      { icon:'🔵', name:'USDC',  amount:'80,000',  value:'$80K',   change:'0.0%',  up:true },
      { icon:'🏦', name:'AAVE',  amount:'420',     value:'$37K',   change:'+3.1%', up:true },
    ],
    trades:[
      { type:'buy',  token:'ETH',   amount:'20 ETH',   pnl:'+$54,000', pos:true, time:'3d ago'  },
      { type:'sell', token:'AAVE',  amount:'200 AAVE', pnl:'+$8,400',  pos:true, time:'1w ago'  },
      { type:'buy',  token:'BTC',   amount:'0.5 BTC',  pnl:'+$28,000', pos:true, time:'2w ago'  },
      { type:'buy',  token:'USDC',  amount:'50K',      pnl:'$0',       pos:true, time:'3w ago'  },
    ],
    clsIdx: 3, // DIAMOND LORD
    level: 94, atk:71, def:98, agi:52, lck:77,
  },
];

const classColors = {
  shadow:  { bg:'rgba(184,127,255,0.1)', border:'#b87fff', color:'#b87fff' },
  moon:    { bg:'rgba(126,200,227,0.1)', border:'#7ec8e3', color:'#7ec8e3' },
  diamond: { bg:'rgba(127,255,111,0.1)', border:'#7fff6f', color:'#7fff6f' },
  degen:   { bg:'rgba(247,201,72,0.1)',  border:'#f7c948', color:'#f7c948' },
  speed:   { bg:'rgba(255,170,68,0.1)',  border:'#ffaa44', color:'#ffaa44' },
  yield:   { bg:'rgba(85,221,204,0.1)',  border:'#55ddcc', color:'#55ddcc' },
};

// ============================================================
// HELPERS
// ============================================================
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function $(id) { return document.getElementById(id); }

function setPixelBar(barId, filled, total, type) {
  const bar = $(barId);
  if (!bar) return;
  bar.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const pip = document.createElement('div');
    pip.className = `pixel-pip ${type}-pip${i >= filled ? ' empty' : ''}`;
    bar.appendChild(pip);
  }
}

function setBarWidth(id, pct) {
  const el = $(id);
  if (el) el.style.width = Math.max(0, pct) + '%';
}

// ============================================================
// NAVBAR
// ============================================================
window.addEventListener('scroll', () => {
  $('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

function scrollToSection(id) {
  $(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
}
window.scrollToSection = scrollToSection;

// ============================================================
// WALLET DETECTION — runs on modal open
// ============================================================
function detectWallets() {
  const eth = window.ethereum;
  const providers = eth?.providers ?? [];

  const rabbyP    = eth?.isRabby ? eth : providers.find(p => p.isRabby);
  const metaMaskP = (eth?.isMetaMask && !eth?.isRabby) ? eth
                  : providers.find(p => p.isMetaMask && !p.isRabby);

  updateWalletTag('rabbyTag',    rabbyP,    'RABBY DETECTED ✓', 'NOT INSTALLED');
  updateWalletTag('metamaskTag', metaMaskP, 'DETECTED ✓',       'NOT INSTALLED');
}

function updateWalletTag(tagId, provider, foundText, missingText) {
  const el = $(tagId);
  if (!el) return;
  el.textContent = provider ? foundText : missingText;
  el.className   = 'wo-tag ' + (provider ? 'detected' : 'not-found');

  if (provider) {
    const btn = el.closest('.wallet-option');
    const rec = btn?.querySelector('.wo-recommended');
    if (rec) { rec.className = 'wo-installed'; rec.textContent = '✓ READY'; }
  }
}

// ============================================================
// WALLET CONNECT FLOW
// ============================================================
function connectWallet() {
  if (isConnected) { disconnectWallet(); return; }
  $('modalOverlay').classList.add('open');
  detectWallets();
}
window.connectWallet = connectWallet;

function closeModal() { $('modalOverlay').classList.remove('open'); }
window.closeModal = closeModal;

// Resolve the right EIP-1193 provider for each wallet name
function resolveProvider(name) {
  const eth = window.ethereum;
  const providers = eth?.providers ?? [];
  switch (name) {
    case 'Rabby':    return eth?.isRabby ? eth : providers.find(p => p.isRabby) ?? null;
    case 'MetaMask': return (eth?.isMetaMask && !eth?.isRabby) ? eth
                          : providers.find(p => p.isMetaMask && !p.isRabby) ?? null;
    case 'Coinbase': return eth?.isCoinbaseWallet ? eth
                          : providers.find(p => p.isCoinbaseWallet) ?? null;
    case 'OKX':      return window.okxwallet ?? null;
    case 'Phantom':  return window.phantom?.ethereum ?? null;
    default:         return eth ?? null;
  }
}

async function requestAccounts(provider) {
  if (!provider?.request) return null;
  try {
    const accounts = await provider.request({ method:'eth_requestAccounts' });
    if (accounts?.length) {
      const a = accounts[0];
      return a.slice(0,6) + '...' + a.slice(-4).toUpperCase();
    }
  } catch (e) {
    console.warn('User rejected wallet connect:', e.message);
  }
  return null;
}

async function selectWallet(name) {
  $('modalBody').innerHTML = `
    <div class="modal-loading">
      <div class="pixel-loader">
        <div class="pixel-loader-dot"></div>
        <div class="pixel-loader-dot"></div>
        <div class="pixel-loader-dot"></div>
      </div>
      <div class="loading-text">CONNECTING TO ${name}...<br/>SCANNING BLOCKCHAIN...<br/>READING WALLET DATA...</div>
    </div>`;

  const provider  = resolveProvider(name);
  const realAddr  = await requestAccounts(provider);

  await delay(1600);

  $('modalBody').innerHTML = `
    <div class="modal-loading">
      <div class="pixel-loader">
        <div class="pixel-loader-dot" style="background:var(--pixel-green)"></div>
        <div class="pixel-loader-dot" style="background:var(--pixel-green)"></div>
        <div class="pixel-loader-dot" style="background:var(--pixel-green)"></div>
      </div>
      <div class="loading-text" style="color:var(--pixel-green)">
        ★ WALLET CONNECTED ★<br/>GENERATING CHARACTER...
      </div>
    </div>`;

  await delay(900);
  finishConnect(name, realAddr, provider);
}
window.selectWallet = selectWallet;

function finishConnect(name, realAddr, provider) {
  isConnected = true;
  connectedProvider = provider;
  walletAddress = realAddr
    ?? ('0x' + Math.random().toString(16).slice(2,6).toUpperCase()
        + '...' + Math.random().toString(16).slice(2,6).toUpperCase());

  const btn = $('connectBtn');
  btn.classList.add('connected');
  btn.querySelector('.btn-text').textContent = walletAddress;
  btn.querySelector('.btn-icon').textContent = '✓';

  // Prefill scanner with connected address
  const scanInput = $('scanInput');
  if (scanInput && scanInput.value === '') scanInput.value = walletAddress;

  closeModal();
  generateCharacter();
}

function disconnectWallet() {
  isConnected = false; walletAddress = ''; connectedProvider = null;
  const btn = $('connectBtn');
  btn.classList.remove('connected');
  btn.querySelector('.btn-text').textContent = 'CONNECT';
  btn.querySelector('.btn-icon').textContent = '▶';
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// CHARACTER GENERATION
// ============================================================
function generateCharacter() {
  const cls    = characterData.classes[rnd(0, characterData.classes.length - 1)];
  const badges = characterData.badgePools[rnd(0, characterData.badgePools.length - 1)];
  const atk    = rnd(40, 95); const def = rnd(30, 95);
  const agi    = rnd(40, 95); const lck = rnd(30, 95);
  const level  = rnd(5, 80);
  const power  = Math.floor((atk + def + agi + lck) * (level * 0.55) + rnd(0, 400));
  const addr   = isConnected ? walletAddress
               : '0x' + Math.random().toString(16).slice(2,6).toUpperCase()
               + '...' + Math.random().toString(16).slice(2,6).toUpperCase();
  const title  = cls.titles[rnd(0, cls.titles.length - 1)];

  const card = $('mainCharCard');
  card.style.opacity = '0';

  setTimeout(() => {
    $('charClass').textContent      = cls.name;
    $('charLevel').textContent      = level;
    $('charEmoji').textContent      = cls.emoji;
    $('charAddress').textContent    = addr;
    $('charTitle').textContent      = title;
    $('atkVal').textContent         = atk;
    $('defVal').textContent         = def;
    $('agiVal').textContent         = agi;
    $('lckVal').textContent         = lck;
    $('charPowerScore').textContent = power.toLocaleString();

    setPixelBar('charHpBar', Math.round((atk / 99) * 8), 8, 'hp');
    setPixelBar('charMpBar', Math.round((def / 99) * 6), 6, 'mp');

    $('charSkills').innerHTML = cls.skills.map(s => `<span class="rpg-skill">${s}</span>`).join('');
    $('charBadges').innerHTML = badges.map(b => `<span class="rpg-badge">${b}</span>`).join('');

    card.style.opacity = '1';
    card.style.transition = 'opacity 0.2s steps(4)';
  }, 200);
}
window.generateCharacter = generateCharacter;

// ============================================================
// WALLET SCANNER
// ============================================================
function presetScan(addr) {
  $('scanInput').value = addr;
  runScan();
}
window.presetScan = presetScan;

async function runScan() {
  if (scanRunning) return;
  const raw = $('scanInput').value.trim();
  if (!raw) { flashInput(); return; }

  scanRunning = true;
  const btn = $('scanBtn');
  btn.disabled = true;
  btn.textContent = '⏳ SCANNING...';

  // Show stage
  $('scannerStage').style.display = 'block';
  $('scanResults').style.display  = 'none';

  // Reset pipeline
  resetPipeline();

  // Step 1 — resolving
  await activateStep('pStep1', 1200);
  // Step 2 — on-chain
  await activateStep('pStep2', 1400);
  // Step 3 — analytics
  await activateStep('pStep3', 1100);
  // Step 4 — rpg class
  await activateStep('pStep4', 900);

  // Pick a profile based on input hash
  const profileIdx = Math.abs(hashString(raw)) % scanProfiles.length;
  const profile = scanProfiles[profileIdx];

  renderScanResults(raw, profile);

  btn.disabled = false;
  btn.textContent = '🔍 SCAN WALLET';
  scanRunning = false;
}
window.runScan = runScan;

function resetPipeline() {
  ['pStep1','pStep2','pStep3','pStep4'].forEach(id => {
    const el = $(id);
    el.classList.remove('active','done');
    el.querySelector('.ps-status').textContent = 'WAIT';
    el.querySelector('.ps-status').classList.remove('blink');
  });
}

async function activateStep(stepId, duration) {
  const el = $(stepId);
  el.classList.add('active');
  el.querySelector('.ps-status').textContent = '...';
  el.querySelector('.ps-status').classList.add('blink');
  await delay(duration);
  el.classList.remove('active');
  el.classList.add('done');
  el.querySelector('.ps-status').textContent = 'DONE';
  el.querySelector('.ps-status').classList.remove('blink');
}

function renderScanResults(inputAddr, p) {
  const cls = characterData.classes[p.clsIdx];
  const displayAddr = inputAddr.length > 12
    ? inputAddr.slice(0,6) + '...' + inputAddr.slice(-4).toUpperCase()
    : inputAddr;

  // Overview
  $('scanAddr').textContent    = displayAddr;
  $('scanNetWorth').textContent = p.netWorth;
  $('scanPnl').textContent     = p.pnl;
  $('scanPnl').style.color     = p.pnlPos ? 'var(--pixel-green)' : 'var(--pixel-red)';
  $('scanWinRate').textContent = p.winRate;
  $('scanTxs').textContent     = p.txs;
  $('scanSince').textContent   = p.since;

  // Risk meter
  $('riskBarFill').style.width = p.risk + '%';
  const riskEl = $('riskScore');
  riskEl.textContent = p.risk + '/100';
  riskEl.style.color = p.risk < 30 ? 'var(--pixel-green)'
                     : p.risk < 60 ? 'var(--pixel-orange)'
                     : 'var(--pixel-red)';

  // Tokens
  $('scanTokens').innerHTML = p.tokens.map(t => `
    <div class="scan-token-row">
      <span class="stoken-icon">${t.icon}</span>
      <div class="stoken-info">
        <span class="stoken-name">${t.name}</span>
        <span class="stoken-amount">${t.amount} tokens</span>
      </div>
      <span class="stoken-value">${t.value}</span>
      <span class="stoken-change ${t.up ? 'up' : 'down'}">${t.change}</span>
    </div>`).join('');

  // RPG card
  $('scanCharClass').textContent  = cls.name;
  $('scanCharLevel').textContent  = p.level;
  $('scanCharEmoji').textContent  = cls.emoji;
  $('scanCharAddr').textContent   = displayAddr;
  $('scanCharTitle').textContent  = cls.titles[0];
  $('scanAtk').textContent        = p.atk;
  $('scanDef').textContent        = p.def;
  $('scanAgi').textContent        = p.agi;
  $('scanLck').textContent        = p.lck;

  const power = Math.floor((p.atk + p.def + p.agi + p.lck) * (p.level * 0.55));
  $('scanPowerScore').textContent = power.toLocaleString();

  setPixelBar('scanHpBar', Math.round((p.atk / 99) * 8), 8, 'hp');
  setPixelBar('scanMpBar', Math.round((p.def / 99) * 6), 6, 'mp');

  $('scanSkills').innerHTML = cls.skills.map(s => `<span class="rpg-skill">${s}</span>`).join('');

  // Trades
  $('scanTrades').innerHTML = p.trades.map(t => `
    <div class="scan-trade-row">
      <span class="strade-type ${t.type}">${t.type.toUpperCase()}</span>
      <span class="strade-token">${t.token}</span>
      <span class="strade-amount">${t.amount}</span>
      <span class="strade-pnl ${t.pos ? 'pos' : 'neg'}">${t.pnl}</span>
      <span class="strade-time">${t.time}</span>
    </div>`).join('');

  // Show results with pixel flash
  $('scanResults').style.display = 'grid';
  $('scanResults').style.opacity = '0';
  setTimeout(() => {
    $('scanResults').style.opacity = '1';
    $('scanResults').style.transition = 'opacity 0.3s steps(6)';
    $('scanResults').scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, 50);
}

function flashInput() {
  const wrap = document.querySelector('.scanner-input-wrap');
  wrap.style.borderColor = 'var(--pixel-red)';
  setTimeout(() => { wrap.style.borderColor = 'var(--pixel-blue)'; }, 800);
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return h;
}

// Enter key triggers scan
document.getElementById('scanInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') runScan();
});

// ============================================================
// BATTLE
// ============================================================
const battleMessages = [
  (a) => `⚔ ${a} attacks for ${rnd(5,14)} DMG!`,
  (b) => `🛡 ${b} blocks the strike!`,
  (a) => `💥 CRITICAL HIT! ${a} deals ${rnd(15,28)} DMG!`,
  (b) => `⚡ ${b} casts SPEED BOOST!`,
  (a) => `🔥 ${a} unleashes portfolio rage!`,
  (b) => `💎 ${b} activates DIAMOND SHIELD!`,
  (a) => `🌙 ${a} channels MOON ENERGY! +${rnd(5,12)} HP!`,
  (b) => `👑 ${b} counters with DEGEN FORCE!`,
  (a) => `📊 ${a} reads the chart — precision strike!`,
  (b) => `💀 ${b} barely survives — 1 HP remaining!`,
];

function startBattle() {
  if (battleInProgress) return;
  battleInProgress = true;
  hp1 = 100; hp2 = 100;
  setBarWidth('hpBar1', 100); setBarWidth('hpBar2', 100);
  $('hp1').textContent = 100; $('hp2').textContent = 100;

  const btn = $('battleBtn');
  btn.disabled = true;
  btn.textContent = '⚔ BATTLING...';

  const log = $('battleLog');
  log.innerHTML = '<div class="log-entry pixel-text-gold">▶ BATTLE BEGINS!</div>';

  const n1 = 'MoonChaser', n2 = 'ShadowBlade';
  let round = 0;

  battleTimer = setInterval(() => {
    round++;
    const dmg    = rnd(6, 18);
    const action = Math.random();
    const isCrit = action > 0.85;
    const isHeal = action < 0.10;

    if (Math.random() > 0.5) {
      hp2 = Math.max(0, hp2 - (isCrit ? dmg * 2 : dmg));
      if (isHeal) hp1 = Math.min(100, hp1 + rnd(3,8));
    } else {
      hp1 = Math.max(0, hp1 - (isCrit ? dmg * 2 : dmg));
      if (isHeal) hp2 = Math.min(100, hp2 + rnd(3,8));
    }

    setBarWidth('hpBar1', hp1); setBarWidth('hpBar2', hp2);
    $('hp1').textContent = hp1; $('hp2').textContent = hp2;

    const msgFn = battleMessages[rnd(0, battleMessages.length - 1)];
    const entry = document.createElement('div');
    entry.className = 'log-entry' + (isCrit ? ' crit' : isHeal ? ' heal' : '');
    entry.textContent = msgFn(Math.random() > 0.5 ? n1 : n2);
    log.insertBefore(entry, log.firstChild);

    if (hp1 <= 0 || hp2 <= 0 || round >= 20) {
      clearInterval(battleTimer);
      battleInProgress = false;
      const winner = hp1 > hp2 ? n1 : n2;
      const winEntry = document.createElement('div');
      winEntry.className = 'log-entry win';
      winEntry.textContent = `🏆 ${winner} WINS! VICTORY!`;
      log.insertBefore(winEntry, log.firstChild);
      btn.disabled = false;
      btn.textContent = '⚔ NEW BATTLE';

      setTimeout(() => {
        hp1 = 100; hp2 = 100;
        setBarWidth('hpBar1', 100); setBarWidth('hpBar2', 100);
        $('hp1').textContent = 100; $('hp2').textContent = 100;
        log.innerHTML = '<div class="log-entry blink">▶ PRESS START TO BATTLE...</div>';
        btn.textContent = '⚔ START BATTLE';
      }, 3500);
    }
  }, 650);
}
window.startBattle = startBattle;

// ============================================================
// LEADERBOARD
// ============================================================
function renderLeaderboard(tab) {
  const data   = leaderboardData[tab];
  const medals = ['🥇','🥈','🥉'];
  $('lbBody').innerHTML = data.map((p, i) => {
    const total = p.w + p.l;
    const wr = total > 0 ? ((p.w / total) * 100).toFixed(1) : '0.0';
    const wrColor = +wr >= 70 ? 'var(--pixel-green)' : +wr >= 50 ? 'var(--pixel-orange)' : 'var(--pixel-red)';
    const clr = classColors[p.clsKey] ?? classColors.shadow;
    return `
      <div class="lb-row ${i < 3 ? 'rank-'+(i+1) : ''}">
        <div class="lb-rank">${i < 3 ? medals[i] : p.rank}</div>
        <div class="lb-warrior">
          <span class="lb-avatar">${p.emoji}</span>
          <div>
            <span class="lb-name">${p.name}</span>
            <span class="lb-addr">${p.addr}</span>
          </div>
        </div>
        <div><span class="lb-class" style="background:${clr.bg};border-color:${clr.border};color:${clr.color}">${p.cls}</span></div>
        <div class="lb-power">${p.power.toLocaleString()}</div>
        <div class="lb-wl"><span class="w">${p.w}W</span>/<span class="l">${p.l}L</span></div>
        <div class="lb-winrate" style="color:${wrColor}">${wr}%</div>
        <div class="lb-streak">${p.streak}</div>
      </div>`;
  }).join('');
}

function switchTab(el, tab) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderLeaderboard(tab);
}
window.switchTab = switchTab;

// ============================================================
// COUNTER ANIMATION
// ============================================================
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const isFloat  = target % 1 !== 0;
  const duration = 1800;
  const start    = performance.now();
  const update   = (now) => {
    const p    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = isFloat ? (target * ease).toFixed(1) : Math.floor(target * ease).toLocaleString();
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
function setupAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    '.feature-card,.pixel-section-head,.char-info-panel,.arena-stage,.lb-table,.lb-tabs,.recent-battles,.scanner-input-row,.scan-pipeline'
  ).forEach(el => { el.classList.add('fade-up'); obs.observe(el); });

  const heroStatObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('[data-target]').forEach(animateCounter);
      heroStatObs.disconnect();
    }
  }, { threshold: 0.5 });
  const hs = document.querySelector('.hero-stats');
  if (hs) heroStatObs.observe(hs);
}

// ============================================================
// PIXEL STARS
// ============================================================
function initStars() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.3';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    s: Math.random() > 0.7 ? 2 : 1,
    t: Math.random() * Math.PI * 2, sp: Math.random() * 0.02 + 0.005,
  }));
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.t += s.sp;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * Math.abs(Math.sin(s.t))})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    });
    requestAnimationFrame(draw);
  };
  draw();
}

// ============================================================
// MODAL OUTSIDE CLICK
// ============================================================
$('modalOverlay').addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });

// ============================================================
// UNICITY WALLET — SPHERE CONNECT (popup flow)
// ============================================================
async function connectUnicityWallet() {
  if (unicityWallet.isConnected()) {
    await unicityWallet.disconnect();
    return;
  }
  try {
    await unicityWallet.connect();
  } catch (err) {
    console.warn('[UniWallet] connect failed:', err.message);
  }
}
window.connectUnicityWallet = connectUnicityWallet;

// Auto-reconnect on page load if we have a saved session
(async () => {
  const saved = sessionStorage.getItem('ww-sphere-session');
  if (saved) {
    try {
      await unicityWallet.connect();   // silent=true because session exists
    } catch (_) {
      sessionStorage.removeItem('ww-sphere-session');
    }
  }
})();

// ============================================================
// UNICITY WAGER FUNCTIONS
// ============================================================
let _wagerSession = null;

function setWagerAmount(val) {
  const el = document.getElementById('wagerAmount');
  if (el) el.value = val;
}
window.setWagerAmount = setWagerAmount;

async function wagerMint() {
  const amount = parseInt(document.getElementById('wagerAmount')?.value || '100', 10);
  if (isNaN(amount) || amount < 10) {
    wagerUI.setStatus('error', 'Enter a valid wager amount (min 10 WAR).');
    return;
  }

  // Disable mint button during operation
  const mintBtn   = document.getElementById('wagerMintBtn');
  const settleBtn = document.getElementById('wagerSettleBtn');
  if (mintBtn) mintBtn.disabled = true;

  _wagerSession = new WagerSession();
  const result = await _wagerSession.mint(amount, '0xABC1...FF9', '0x7F3a...9c4E');

  if (result.success) {
    // Show token id
    const tokenEl = document.getElementById('wagerTokenId');
    if (tokenEl) tokenEl.textContent = result.tokenId.slice(0, 14) + '...';
    // Enable settle button
    if (settleBtn) settleBtn.disabled = false;
  } else {
    if (mintBtn) mintBtn.disabled = false;
  }
}
window.wagerMint = wagerMint;

async function wagerSettle() {
  if (!_wagerSession || _wagerSession.status !== 'minted') {
    wagerUI.setStatus('error', 'Mint a wager token first.');
    return;
  }

  const settleBtn = document.getElementById('wagerSettleBtn');
  if (settleBtn) settleBtn.disabled = true;

  // Determine winner from last battle result (hp1 vs hp2)
  const winner = hp1 >= hp2 ? 'player1' : 'player2';
  const result = await _wagerSession.settleToWinner(winner);

  if (result.success) {
    const txEl = document.getElementById('wagerTxHash');
    if (txEl && result.txHash) txEl.textContent = result.txHash.slice(0, 14) + '...';
  } else {
    if (settleBtn) settleBtn.disabled = false;
  }
}
window.wagerSettle = wagerSettle;

function wagerReset() {
  _wagerSession = null;
  wagerUI.reset();
  const mintBtn   = document.getElementById('wagerMintBtn');
  const settleBtn = document.getElementById('wagerSettleBtn');
  if (mintBtn)   mintBtn.disabled   = false;
  if (settleBtn) settleBtn.disabled = true;
  const tokenEl = document.getElementById('wagerTokenId');
  const txEl    = document.getElementById('wagerTxHash');
  if (tokenEl) tokenEl.textContent = 'PENDING';
  if (txEl)    txEl.textContent    = 'PENDING';
}
window.wagerReset = wagerReset;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderLeaderboard('global');
  setPixelBar('heroHpBar', 7, 8, 'hp');
  setPixelBar('heroMpBar', 5, 6, 'mp');
  setPixelBar('charHpBar', 7, 8, 'hp');
  setPixelBar('charMpBar', 5, 6, 'mp');
  setupAnimations();
  initStars();
});
