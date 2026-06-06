# Wallet Warriors - Web3 Gaming Platform Specification

## Project Overview
- **Project Name**: Wallet Warriors
- **Type**: Single-page landing website
- **Core Functionality**: Web3 gaming platform where crypto portfolios become playable RPG characters
- **Target Users**: Crypto traders, NFT gamers, Web3 enthusiasts

---

## UI/UX Specification

### Layout Structure

**Page Sections:**
1. **Navigation Bar** - Fixed top, logo + nav links + wallet connect button
2. **Hero Section** - Full viewport height, main headline + CTA + animated background
3. **Features Section** - 5 feature cards in horizontal scroll/grid
4. **Character Card Section** - Showcase RPG character from wallet
5. **Live Arena Section** - Real-time PvP battles display
6. **Leaderboard Section** - Top wallets rankings
7. **Footer** - Links and copyright

**Responsive Breakpoints:**
- Mobile: < 768px (stacked layout, reduced animations)
- Tablet: 768px - 1199px (2-column grids)
- Desktop: ≥ 1200px (full layout)

### Visual Design

**Color Palette:**
- Primary Background: `#0a0a0f` (near black)
- Secondary Background: `#0d1117` (deep navy)
- Glass Panel: `rgba(20, 25, 40, 0.7)` with backdrop blur
- Neon Blue: `#00d4ff` (primary accent)
- Gold: `#ffd700` (premium/legendary)
- Purple: `#8b5cf6` (magic/mystical)
- Text Primary: `#ffffff`
- Text Secondary: `#94a3b8`
- Danger/ATK: `#ef4444`
- Defense: `#22c55e`
- Agility: `#f59e0b`
- Luck: `#ec4899`

**Typography:**
- Headings: 'Orbitron', sans-serif (futuristic gaming font)
- Body: 'Rajdhani', sans-serif (clean tech feel)
- Monospace (stats): 'JetBrains Mono', monospace
- Hero Title: 72px (desktop), 42px (mobile)
- Section Titles: 48px (desktop), 32px (mobile)
- Body Text: 18px
- Stats: 14px uppercase

**Spacing System:**
- Section Padding: 120px vertical (desktop), 60px (mobile)
- Card Padding: 32px
- Element Gap: 24px
- Border Radius: 16px (cards), 8px (buttons), 4px (small elements)

**Visual Effects:**
- Glassmorphism: `backdrop-filter: blur(20px)` with semi-transparent backgrounds
- Neon Glow: `box-shadow: 0 0 30px rgba(0, 212, 255, 0.3)`
- Gold shimmer animation on hover
- Particle effect background (CSS-only)
- Scan line overlay for terminal aesthetic

### Components

**Navigation:**
- Logo with glowing effect
- Nav links with underline hover animation
- "Connect Wallet" button with gradient border

**Hero Section:**
- Animated geometric background pattern
- Main title with gradient text
- Subtitle with typewriter effect
- CTA buttons: "Connect Wallet" (primary), "View Demo" (secondary)
- Floating crypto icons animation

**Feature Cards:**
- Icon with glow effect
- Title
- Description
- Hover: lift + enhanced glow

**Character Card:**
- Character portrait/avatar (generated from wallet)
- Class badge: "Shadow Trader"
- Level indicator with XP bar
- Stats grid (ATK, DEF, AGI, LUCK) with colored bars
- Power Score with animated counter
- Equipment/nft badges

**Live Arena:**
- Two character cards battling
- VS badge in center
- HP bars depleting animation
- Battle log
- "Watch Live" indicator

**Leaderboard:**
- Rank number with medal icons (gold/silver/bronze)
- Wallet address (truncated)
- Character name/class
- Power score
- Win rate percentage

---

## Functionality Specification

### Core Features
1. **Wallet Connect** - Simulated wallet connection (demo mode)
2. **Character Generation** - Generate random RPG character from "wallet"
3. **Live Arena** - Simulated battle with animated HP bars
4. **Leaderboard** - Dynamic rankings with mock data
5. **Stats Animation** - Count-up animations on scroll

### User Interactions
- Click "Connect Wallet" → Show loading → Display connected state with mock address
- Click "Generate Character" → Show random character card
- Click "Watch Battle" → Start simulated arena battle
- Scroll → Trigger stats animations
- Hover cards → Glow effects

### Data Handling
- Mock data for leaderboard (10 entries)
- Random character generation on "Connect"
- Simulated battle with random outcomes

### Edge Cases
- Wallet already connected → Show disconnect option
- Mobile view → Stack all elements vertically

---

## Acceptance Criteria

1. ✓ Page loads with animated hero section
2. ✓ Navigation is fixed and functional
3. ✓ Connect wallet button triggers demo flow
4. ✓ Character card displays with all stats
5. ✓ Live arena shows animated battle
6. ✓ Leaderboard displays 10 ranked wallets
7. ✓ All hover effects work smoothly
8. ✓ Responsive on mobile/tablet/desktop
9. ✓ No console errors
10. ✓ Glassmorphism effects visible
11. ✓ Animations run at 60fps