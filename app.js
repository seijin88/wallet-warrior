/* ============================================================
   WALLET WARRIORS — APP.JS
   ============================================================ */

// ---- STATE ----
let isConnected = false;
let walletAddress = '';
let battleInProgress = false;
let battleTimer = null;

// ---- LEADERBOARD DATA ----
const leaderboardData = {
  global: [
    { rank: 1, name: 'VoidWalker', addr: '0xDEAD...BEEF', cls: 'SHADOW TRADER', clsKey: 'shadow-trader', emoji: '🧙', power: 9847, w: 412, l: 31, streak: '🔥 W21' },
    { rank: 2, name: 'CryptoKnight', addr: '0xABCD...1234', cls: 'MOON CHASER', clsKey: 'moon-chaser', emoji: '🦅', power: 8912, w: 387, l: 44, streak: '🔥 W14' },
    { rank: 3, name: 'DiamondLord', addr: '0x1111...FFFF', cls: 'DIAMOND LORD', clsKey: 'diamond-lord', emoji: '💎', power: 8504, w: 321, l: 55, streak: '🔥 W8' },
    { rank: 4, name: 'DegenKing', addr: '0xFACE...CAFE', cls: 'DEGEN KING', clsKey: 'degen-king', emoji: '👑', power: 7663, w: 298, l: 89, streak: '🔥 W5' },
    { rank: 5, name: 'ShadowBlade', addr: '0x7F3a...9c4E', cls: 'SHADOW TRADER', clsKey: 'shadow-trader', emoji: '⚔️', power: 6991, w: 244, l: 67, streak: 'W3' },
    { rank: 6, name: 'NFTSorcerer', addr: '0x55AA...BB99', cls: 'NFT SORCERER', clsKey: 'moon-chaser', emoji: '🔮', power: 6234, w: 201, l: 88, streak: 'W1' },
    { rank: 7, name: 'YieldFarmer', addr: '0xBEEF...DEAD', cls: 'YIELD DRUID', clsKey: 'diamond-lord', emoji: '🌾', power: 5872, w: 178, l: 94, streak: 'L2' },
    { rank: 8, name: 'WhaleKing', addr: '0x9999...0000', cls: 'WHALE TITAN', clsKey: 'degen-king', emoji: '🐋', power: 5541, w: 156, l: 101, streak: 'W4' },
    { rank: 9, name: 'ArbiTrader', addr: '0x2222...AAAA', cls: 'MOON CHASER', clsKey: 'moon-chaser', emoji: '⚡', power: 4987, w: 134, l: 112, streak: 'L1' },
    { rank: 10, name: 'GasGuru', addr: '0xCCCC...3333', cls: 'SPEED ROGUE', clsKey: 'shadow-trader', emoji: '🎯', power: 4421, w: 112, l: 98, streak: 'W2' },
  ],
  weekly: [
    { rank: 1, name: 'WeeklyHunter', addr: '0xW001...AAAA', cls: 'DEGEN KING', clsKey: 'degen-king', emoji: '👑', power: 3120, w: 44, l: 3, streak: '🔥 W18' },
    { rank: 2, name: 'MondayMage', addr: '0xW002...BBBB', cls: 'MOON CHASER', clsKey: 'moon-chaser', emoji: '🌙', power: 2980, w: 38, l: 7, streak: '🔥 W11' },
    { rank: 3, name: 'TurboTrade', addr: '0xW003...CCCC', cls: 'SPEED ROGUE', clsKey: 'shadow-trader', emoji: '⚡', power: 2734, w: 35, l: 9, streak: '🔥 W7' },
    { rank: 4, name: 'AlphaMiner', addr: '0xW004...DDDD', cls: 'SHADOW TRADER', clsKey: 'shadow-trader', emoji: '🧙', power: 2501, w: 30, l: 12, streak: 'W3' },
    { rank: 5, name: 'FlashLoan', addr: '0xW005...EEEE', cls: 'ARBI PHANTOM', clsKey: 'moon-chaser', emoji: '💫', power: 2314, w: 28, l: 15, streak: 'W2' },
    { rank: 6, name: 'PortfolioG', addr: '0xW006...FFFF', cls: 'DIAMOND LORD', clsKey: 'diamond-lord', emoji: '💎', power: 2100, w: 24, l: 18, streak: 'L1' },
    { rank: 7, name: 'SmartMoney', addr: '0xW007...1111', cls: 'YIELD DRUID', clsKey: 'diamond-lord', emoji: '🌾', power: 1987, w: 21, l: 19, streak: 'W1' },
    { rank: 8, name: 'SwapKing', addr: '0xW008...2222', cls: 'MOON CHASER', clsKey: 'moon-chaser', emoji: '🔄', power: 1812, w: 18, l: 22, streak: 'L3' },
    { rank: 9, name: 'LiquidLord', addr: '0xW009...3333', cls: 'DEGEN KING', clsKey: 'degen-king', emoji: '💧', power: 1677, w: 15, l: 24, streak: 'W2' },
    { rank: 10, name: 'GasGhost', addr: '0xW010...4444', cls: 'SPEED ROGUE', clsKey: 'shadow-trader', emoji: '👻', power: 1543, w: 12, l: 26, streak: 'L2' },
  ],
  defi: [
    { rank: 1, name: 'YieldMaxxer', addr: '0xD001...AAAA', cls: 'YIELD DRUID', clsKey: 'diamond-lord', emoji: '🌾', power: 8221, w: 334, l: 41, streak: '🔥 W19' },
    { rank: 2, name: 'LPKing', addr: '0xD002...BBBB', cls: 'LIQUIDITY GOD', clsKey: 'degen-king', emoji: '💧', power: 7912, w: 298, l: 54, streak: '🔥 W12' },
    { rank: 3, name: 'CompoundG', addr: '0xD003...CCCC', cls: 'DIAMOND LORD', clsKey: 'diamond-lord', emoji: '💎', power: 7341, w: 267, l: 61, streak: '🔥 W9' },
    { rank: 4, name: 'AaveArcher', addr: '0xD004...DDDD', cls: 'SHADOW TRADER', clsKey: 'shadow-trader', emoji: '🏹', power: 6788, w: 241, l: 77, streak: 'W6' },
    { rank: 5, name: 'CurveWitch', addr: '0xD005...EEEE', cls: 'MOON CHASER', clsKey: 'moon-chaser', emoji: '🔮', power: 6123, w: 211, l: 88, streak: 'W4' },
    { rank: 6, name: 'UniSwapG', addr: '0xD006...FFFF', cls: 'SPEED ROGUE', clsKey: 'shadow-trader', emoji: '⚡', power: 5670, w: 189, l: 94, streak: 'W2' },
    { rank: 7, name: 'MakerDao', addr: '0xD007...1111', cls: 'DEGEN KING', clsKey: 'degen-king', emoji: '👑', power: 5210, w: 167, l: 103, streak: 'L1' },
    { rank: 8, name: 'SushiMage', addr: '0xD008...2222', cls: 'YIELD DRUID', clsKey: 'diamond-lord', emoji: '🍣', power: 4890, w: 144, l: 112, streak: 'W3' },
    { rank: 9, name: 'PancakePro', addr: '0xD009...3333', cls: 'MOON CHASER', clsKey: 'moon-chaser', emoji: '🥞', power: 4412, w: 121, l: 121, streak: 'L2' },
    { rank: 10, name: 'BalancerB', addr: '0xD010...4444', cls: 'DIAMOND LORD', clsKey: 'diamond-lord', emoji: '⚖️', power: 3998, w: 99, l: 131, streak: 'W1' },
  ],
  nft: [
    { rank: 1, name: 'ApeGod', addr: '0xN001...AAAA', cls: 'NFT SORCERER', clsKey: 'moon-chaser', emoji: '🦍', power: 9112, w: 401, l: 28, streak: '🔥 W24' },
    { rank: 2, name: 'PunkLord', addr: '0xN002...BBBB', cls: 'DEGEN KING', clsKey: 'degen-king', emoji: '😈', power: 8634, w: 367, l: 39, streak: '🔥 W16' },
    { rank: 3, name: 'BlurBlade', addr: '0xN003...CCCC', cls: 'SPEED ROGUE', clsKey: 'shadow-trader', emoji: '💨', power: 8010, w: 312, l: 51, streak: '🔥 W10' },
    { rank: 4, name: 'OpenSeaG', addr: '0xN004...DDDD', cls: 'SHADOW TRADER', clsKey: 'shadow-trader', emoji: '🌊', power: 7401, w: 278, l: 64, streak: 'W7' },
    { rank: 5, name: 'RaribleR', addr: '0xN005...EEEE', cls: 'MOON CHASER', clsKey: 'moon-chaser', emoji: '🎨', power: 6788, w: 244, l: 78, streak: 'W4' },
    { rank: 6, name: 'SudoSwapS', addr: '0xN006...FFFF', cls: 'DIAMOND LORD', clsKey: 'diamond-lord', emoji: '🔷', power: 6201, w: 211, l: 91, streak: 'W2' },
    { rank: 7, name: 'MagicEden', addr: '0xN007...1111', cls: 'NFT SORCERER', clsKey: 'moon-chaser', emoji: '🪄', power: 5688, w: 178, l: 104, streak: 'L1' },
    { rank: 8, name: 'FloorPump', addr: '0xN008...2222', cls: 'DEGEN KING', clsKey: 'degen-king', emoji: '⬆️', power: 5211, w: 156, l: 117, streak: 'W3' },
    { rank: 9, name: 'WashTrade', addr: '0xN009...3333', cls: 'SPEED ROGUE', clsKey: 'shadow-trader', emoji: '🌀', power: 4721, w: 133, l: 128, streak: 'L2' },
    { rank: 10, name: 'LiquidNFT', addr: '0xN010...4444', cls: 'MOON CHASER', clsKey: 'moon-chaser', emoji: '💦', power: 4198, w: 112, l: 139, streak: 'W1' },
  ]
};

// ---- CHARACTER GENERATION DATA ----
const characterData = {
  classes: [
    { name: 'SHADOW TRADER', key: 'shadow-trader', emoji: '🧙', titles: ['Devourer of Dips', 'Phantom of the Charts', 'The Silent Accumulator'] },
    { name: 'MOON CHASER', key: 'moon-chaser', emoji: '🦅', titles: ['Rider of Rockets', 'Ascension Prophet', 'Moonbound Acolyte'] },
    { name: 'DEGEN KING', key: 'degen-king', emoji: '👑', titles: ['Lord of Leverage', 'The Reckless One', 'Chaos Incarnate'] },
    { name: 'DIAMOND LORD', key: 'diamond-lord', emoji: '💎', titles: ['The Unshaken', 'Bearer of Losses', 'Iron Will Sentinel'] },
    { name: 'SPEED ROGUE', key: 'shadow-trader', emoji: '⚡', titles: ['Blink Executor', 'The Microsecond', 'Ghost in the Mempool'] },
    { name: 'YIELD DRUID', key: 'diamond-lord', emoji: '🌾', titles: ['Harvester of APY', 'Compounder Prime', 'The Patient One'] },
  ],
  badgePools: [
    ['💎 Diamond Hands', '🔥 Top 1%', '⚡ Speed Trader'],
    ['🌙 Moon Believer', '📈 Bull Run Survivor', '🎯 Precision Sniper'],
    ['🦍 Ape Army', '💀 Rug Survivor x3', '👑 Degen Legend'],
    ['❄️ Ice Nerves', '🏔️ Bear Market Vet', '🛡️ Never Liquidated'],
    ['👻 Ghost Trader', '⚗️ MEV Resistant', '🌀 Arb Master'],
    ['🌾 1000% APY', '🔄 Auto-Compound King', '💧 LP Warrior'],
  ]
};

// ---- NAVBAR SCROLL EFFECT ----
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- SMOOTH SCROLL ----
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- WALLET CONNECT ----
function connectWallet() {
  if (isConnected) {
    disconnectWallet();
    return;
  }
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function selectWallet(walletName) {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="modal-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Connecting to ${walletName}...<br/>Scanning blockchain history...</div>
    </div>
  `;
  setTimeout(() => {
    modalBody.innerHTML = `
      <div class="modal-loading">
        <div class="loading-spinner" style="border-top-color: var(--clr-green)"></div>
        <div class="loading-text" style="color: var(--clr-green)">✓ Wallet connected<br/>Generating your character...</div>
      </div>
    `;
    setTimeout(() => {
      finishConnect(walletName);
    }, 1000);
  }, 1800);
}

function finishConnect(walletName) {
  isConnected = true;
  walletAddress = '0x' + Math.random().toString(16).slice(2, 6).toUpperCase() + '...' + Math.random().toString(16).slice(2, 6).toUpperCase();

  const btn = document.getElementById('connectBtn');
  btn.classList.add('connected');
  btn.querySelector('.btn-text').textContent = walletAddress;
  btn.querySelector('.btn-icon').textContent = '✓';

  closeModal();
  generateCharacter(true);
}

function disconnectWallet() {
  isConnected = false;
  walletAddress = '';
  const btn = document.getElementById('connectBtn');
  btn.classList.remove('connected');
  btn.querySelector('.btn-text').textContent = 'Connect Wallet';
  btn.querySelector('.btn-icon').textContent = '◈';
}

// ---- CHARACTER GENERATION ----
function generateCharacter(fromConnect = false) {
  const cls = characterData.classes[Math.floor(Math.random() * characterData.classes.length)];
  const badges = characterData.badgePools[Math.floor(Math.random() * characterData.badgePools.length)];
  const atk = Math.floor(Math.random() * 35) + 55;
  const def = Math.floor(Math.random() * 50) + 30;
  const agi = Math.floor(Math.random() * 35) + 55;
  const lck = Math.floor(Math.random() * 50) + 30;
  const level = Math.floor(Math.random() * 60) + 10;
  const power = Math.floor((atk + def + agi + lck) * (level * 0.6) + Math.random() * 500);
  const addr = isConnected ? walletAddress : '0x' + Math.random().toString(16).slice(2, 6).toUpperCase() + '...' + Math.random().toString(16).slice(2, 6).toUpperCase();
  const title = cls.titles[Math.floor(Math.random() * cls.titles.length)];

  // Animate out
  const card = document.getElementById('mainCharCard');
  card.style.opacity = '0';
  card.style.transform = 'scale(0.95)';

  setTimeout(() => {
    document.getElementById('charClass').textContent = cls.name;
    document.getElementById('charClass').className = 'card-class-badge ' + cls.key;
    document.getElementById('charLevel').textContent = level;
    document.getElementById('charEmoji').textContent = cls.emoji;
    document.getElementById('charAddress').textContent = addr;
    document.getElementById('charTitle').textContent = title;
    document.getElementById('charPowerScore').textContent = power.toLocaleString();

    document.getElementById('atkVal').textContent = atk;
    document.getElementById('defVal').textContent = def;
    document.getElementById('agiVal').textContent = agi;
    document.getElementById('lckVal').textContent = lck;

    document.getElementById('atkBar').style.setProperty('--val', atk + '%');
    document.getElementById('defBar').style.setProperty('--val', def + '%');
    document.getElementById('agiBar').style.setProperty('--val', agi + '%');
    document.getElementById('lckBar').style.setProperty('--val', lck + '%');

    // Reset bars
    ['atkBar','defBar','agiBar','lckBar'].forEach(id => {
      const bar = document.getElementById(id);
      bar.classList.remove('animate');
    });

    document.getElementById('charBadges').innerHTML = badges.map(b => `<span class="badge-item">${b}</span>`).join('');

    // Animate in
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
    card.style.transition = 'opacity 0.4s, transform 0.4s';

    setTimeout(() => {
      ['atkBar','defBar','agiBar','lckBar'].forEach(id => {
        document.getElementById(id).classList.add('animate');
      });
    }, 100);

  }, 300);
}

// ---- ARENA BATTLE ----
let hp1 = 100;
let hp2 = 100;

const battleMessages = [
  (a1, a2) => `⚔️ ${a1} strikes for ${Math.floor(Math.random()*15)+5} damage!`,
  (a1, a2) => `🛡️ ${a2} blocks the attack!`,
  (a1, a2) => `💥 CRITICAL HIT! ${a1} deals massive damage!`,
  (a1, a2) => `⚡ ${a2} activates Speed Boost!`,
  (a1, a2) => `🔥 ${a1} unleashes portfolio rage!`,
  (a1, a2) => `💎 ${a2} uses Diamond Hands shield!`,
  (a1, a2) => `🌙 ${a1} channels moon energy!`,
  (a1, a2) => `👑 ${a2} counters with degen force!`,
];

function startBattle() {
  if (battleInProgress) return;
  battleInProgress = true;
  hp1 = 100;
  hp2 = 100;

  const btn = document.getElementById('battleBtn');
  btn.disabled = true;
  btn.textContent = '⚔️ Battle in Progress...';

  const log = document.getElementById('battleLog');
  log.innerHTML = '<div class="log-entry">⚡ Battle begins!</div>';

  updateHP(hp1, hp2);

  const name1 = 'MoonChaser';
  const name2 = 'ShadowBlade';

  let round = 0;
  battleTimer = setInterval(() => {
    round++;

    // Random damage
    const dmg1 = Math.floor(Math.random() * 12) + 6;
    const dmg2 = Math.floor(Math.random() * 10) + 4;

    // Random attacker
    if (Math.random() > 0.5) {
      hp2 = Math.max(0, hp2 - dmg1);
    } else {
      hp1 = Math.max(0, hp1 - dmg2);
    }

    updateHP(hp1, hp2);

    // Add log message
    const msg = battleMessages[Math.floor(Math.random() * battleMessages.length)](name1, name2);
    const isCrit = msg.includes('CRITICAL');
    const entry = document.createElement('div');
    entry.className = 'log-entry' + (isCrit ? ' critical' : '');
    entry.textContent = msg;
    log.insertBefore(entry, log.firstChild);

    // Check end condition
    if (hp1 <= 0 || hp2 <= 0 || round >= 18) {
      endBattle(hp1, hp2, name1, name2);
    }
  }, 700);
}

function updateHP(h1, h2) {
  document.getElementById('hp1').textContent = h1;
  document.getElementById('hp2').textContent = h2;
  document.getElementById('hpBar1').style.width = h1 + '%';
  document.getElementById('hpBar2').style.width = h2 + '%';

  const hpVal1 = document.getElementById('hp1');
  const hpVal2 = document.getElementById('hp2');
  hpVal1.style.color = h1 < 30 ? 'var(--clr-red)' : 'var(--clr-green)';
  hpVal2.style.color = h2 < 30 ? 'var(--clr-red)' : 'var(--clr-green)';
}

function endBattle(h1, h2, name1, name2) {
  clearInterval(battleTimer);
  battleInProgress = false;

  const winner = h1 > h2 ? name1 : name2;
  const log = document.getElementById('battleLog');
  const entry = document.createElement('div');
  entry.className = 'log-entry win';
  entry.textContent = `🏆 ${winner} WINS THE BATTLE!`;
  log.insertBefore(entry, log.firstChild);

  const btn = document.getElementById('battleBtn');
  btn.disabled = false;
  btn.textContent = '⚔️ New Battle';

  // Reset HP after 3 seconds
  setTimeout(() => {
    hp1 = 100; hp2 = 100;
    updateHP(100, 100);
    log.innerHTML = '<div class="log-entry">⚡ Ready for next battle...</div>';
    btn.textContent = '⚔️ Start Battle';
  }, 3000);
}

// ---- LEADERBOARD ----
let currentTab = 'global';

function switchTab(el, tab) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  currentTab = tab;
  renderLeaderboard(tab);
}

function renderLeaderboard(tab) {
  const data = leaderboardData[tab];
  const body = document.getElementById('lbBody');

  const rankMedals = ['🥇', '🥈', '🥉'];

  body.innerHTML = data.map((p, i) => {
    const rankClass = i < 3 ? `rank-${i + 1}` : '';
    const rankDisplay = i < 3 ? `<span class="rank-medal">${rankMedals[i]}</span>` : `<span style="font-family:var(--font-mono);color:var(--text-muted)">${p.rank}</span>`;
    const total = p.w + p.l;
    const winRate = total > 0 ? ((p.w / total) * 100).toFixed(1) : '0.0';
    const wrColor = parseFloat(winRate) >= 70 ? 'var(--clr-green)' : parseFloat(winRate) >= 50 ? 'var(--clr-amber)' : 'var(--clr-red)';
    const streakColor = p.streak.startsWith('🔥') || p.streak.startsWith('W') ? 'var(--clr-amber)' : 'var(--clr-red)';

    return `
      <div class="lb-row ${rankClass}">
        <div class="lb-rank">${rankDisplay}</div>
        <div class="lb-warrior">
          <span class="lb-avatar">${p.emoji}</span>
          <div>
            <div class="lb-name">${p.name}</div>
            <div class="lb-addr">${p.addr}</div>
          </div>
        </div>
        <div>
          <span class="lb-class-badge ${p.clsKey}">${p.cls}</span>
        </div>
        <div class="lb-power">${p.power.toLocaleString()}</div>
        <div class="lb-wl"><span class="w">${p.w}W</span> / <span class="l">${p.l}L</span></div>
        <div class="lb-winrate" style="color:${wrColor}">${winRate}%</div>
        <div class="lb-streak" style="color:${streakColor}">${p.streak}</div>
      </div>
    `;
  }).join('');
}

// ---- HERO STAT COUNTER ----
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isFloat = target % 1 !== 0;
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;

    if (isFloat) {
      el.textContent = current.toFixed(1);
    } else {
      el.textContent = Math.floor(current).toLocaleString();
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ---- SCROLL ANIMATIONS ----
function setupScrollAnimations() {
  // Add fade-up to sections
  const targets = document.querySelectorAll('.feature-card, .section-header, .char-layout, .arena-stage, .leaderboard-table, .recent-battles, .lb-tabs');
  targets.forEach(el => el.classList.add('fade-up'));

  // Animate stat bars when visible
  const statBars = document.querySelectorAll('.stat-bar');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Trigger stat bar animations
        if (entry.target.classList.contains('character-card') || entry.target.querySelector('.stat-bar')) {
          setTimeout(() => {
            entry.target.querySelectorAll('.stat-bar').forEach(bar => {
              bar.classList.add('animate');
            });
          }, 300);
        }

        // Counter animations for hero stats
        const counters = entry.target.querySelectorAll('[data-target]');
        counters.forEach(counter => animateCounter(counter));
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));

  // Hero stats counter
  const heroStatsEl = document.querySelector('.hero-stats');
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.hstat-value').forEach(animateCounter);
      heroObserver.disconnect();
    }
  }, { threshold: 0.5 });
  if (heroStatsEl) heroObserver.observe(heroStatsEl);

  // Trigger hero card stat bars immediately
  setTimeout(() => {
    document.querySelectorAll('#heroCard .stat-bar').forEach(bar => bar.classList.add('animate'));
    document.querySelectorAll('#mainCharCard .stat-bar').forEach(bar => bar.classList.add('animate'));
  }, 800);
}

// ---- PARTICLES ----
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.4 + 0.1,
    color: ['#00d4ff', '#8b5cf6', '#ffd700'][Math.floor(Math.random() * 3)],
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });

    // Draw connections
    ctx.globalAlpha = 0.08;
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(drawParticles);
  }

  drawParticles();
}

// ---- MODAL OUTSIDE CLICK ----
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderLeaderboard('global');
  initParticles();
  setupScrollAnimations();
});
