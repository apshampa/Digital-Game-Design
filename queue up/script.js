'use strict';
/* ═══════════════════════════════════════════════════════════════
   QUEUE UP! — script.js  (complete rebuild)
   Gameplay: "Is This Seat Taken?" style — full-screen isometric
   scene, geometric block characters dragged to numbered queue
   positions on the scene floor. Expression feedback only.
   ═══════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════
   1. CHARACTER ART — geometric block figures, muted palette
      viewBox: 0 0 60 90
      Structure: head (circle/rect) + body (rounded rect) + legs
      Expressions via mouth/brow paths inside head
══════════════════════════════════════════════════════════════ */
const CharArt = (() => {

  /* Mouth paths (drawn in head-local coords, head cx=30, cy=28) */
  const MOUTH = {
    happy: 'M 23 32 Q 30 38 37 32',
    sad: 'M 23 36 Q 30 30 37 36',
    angry: 'M 22 35 Q 30 29 38 35',
    neutral: 'M 24 33 Q 30 33 36 33',
  };
  /* Brow lines */
  const BROW = {
    happy: '',
    neutral: '',
    sad: `<line x1="20" y1="20" x2="27" y2="23" stroke-width="2.2" stroke-linecap="round"/>
              <line x1="33" y1="23" x2="40" y2="20" stroke-width="2.2" stroke-linecap="round"/>`,
    angry: `<line x1="19" y1="22" x2="28" y2="26" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="32" y1="26" x2="41" y2="22" stroke-width="2.5" stroke-linecap="round"/>`,
  };

  /* Eye variants */
  function eyes(mood, ec) {
    if (mood === 'angry') {
      return `
        <ellipse cx="24" cy="27" rx="4" ry="3.2" fill="${ec}"/>
        <ellipse cx="36" cy="27" rx="4" ry="3.2" fill="${ec}"/>
        <circle cx="24.8" cy="26.5" r="1.4" fill="white" opacity="0.6"/>
        <circle cx="36.8" cy="26.5" r="1.4" fill="white" opacity="0.6"/>`;
    }
    if (mood === 'sad') {
      return `
        <circle cx="24" cy="27" r="4" fill="${ec}"/>
        <circle cx="36" cy="27" r="4" fill="${ec}"/>
        <circle cx="25" cy="26" r="1.5" fill="white" opacity="0.55"/>
        <ellipse cx="22" cy="33" rx="1.5" ry="2" fill="#9ACFE8" opacity="0.7"/>`;
    }
    return `
      <circle cx="24" cy="27" r="4.2" fill="${ec}"/>
      <circle cx="36" cy="27" r="4.2" fill="${ec}"/>
      <circle cx="25.5" cy="25.8" r="1.6" fill="white" opacity="0.55"/>
      <circle cx="37.5" cy="25.8" r="1.6" fill="white" opacity="0.55"/>`;
  }

  /* Head shapes */
  function head(shape, fc, sc) {
    const s = `fill="${fc}" stroke="${sc}" stroke-width="1.8"`;
    switch (shape) {
      case 'circle': return `<circle cx="30" cy="28" r="18" ${s}/>`;
      case 'rounded': return `<rect x="13" y="11" width="34" height="34" rx="12" ${s}/>`;
      case 'wide': return `<ellipse cx="30" cy="28" rx="20" ry="16" ${s}/>`;
      case 'tall': return `<ellipse cx="30" cy="28" rx="14" ry="20" ${s}/>`;
      default: return `<circle cx="30" cy="28" r="18" ${s}/>`;
    }
  }

  /* Body shapes */
  function body(shape, bc, sc) {
    const s = `fill="${bc}" stroke="${sc}" stroke-width="1.8"`;
    switch (shape) {
      case 'round': return `<ellipse cx="30" cy="62" rx="16" ry="14" ${s}/>`;
      case 'square': return `<rect x="13" y="50" width="34" height="26" rx="6" ${s}/>`;
      case 'tall': return `<rect x="16" y="48" width="28" height="30" rx="8" ${s}/>`;
      case 'wide': return `<ellipse cx="30" cy="62" rx="20" ry="11" ${s}/>`;
      case 'diamond': return `<polygon points="30,48 46,62 30,76 14,62" ${s}/>`;
      default: return `<rect x="14" y="50" width="32" height="26" rx="7" ${s}/>`;
    }
  }

  /**
   * Build a complete character SVG string
   * @param {object} cfg  - artConfig from character data
   * @param {string} mood - happy | sad | angry | neutral
   * @returns {string} full SVG markup
   */
  function build(cfg, mood = 'happy') {
    const fc = cfg.faceColor;
    const sc = cfg.strokeColor;
    const bc = cfg.bodyColor;
    const ec = cfg.eyeColor;
    const brows = (BROW[mood] || '').replace(/stroke="/g, `stroke="${sc}"`);
    const mouth = MOUTH[mood] || MOUTH.neutral;

    return `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg" class="char-svg">
  <!-- Accessory -->
  ${cfg.accessory || ''}
  <!-- Head -->
  ${head(cfg.headShape, fc, sc)}
  <!-- Face -->
  <g stroke="${sc}">
    ${brows}
    ${eyes(mood, ec)}
    <path d="${mouth}" fill="none" stroke="${sc}" stroke-width="2" stroke-linecap="round"/>
  </g>
  <!-- Body -->
  ${body(cfg.bodyShape, bc, sc)}
  <!-- Body detail -->
  ${cfg.bodyDetail || ''}
  <!-- Legs -->
  <rect x="19" y="73" width="8" height="14" rx="4" fill="${bc}" stroke="${sc}" stroke-width="1.5"/>
  <rect x="33" y="73" width="8" height="14" rx="4" fill="${bc}" stroke="${sc}" stroke-width="1.5"/>
  <!-- Shoes -->
  <ellipse cx="23" cy="87" rx="6" ry="3.5" fill="${cfg.shoeColor}" stroke="${sc}" stroke-width="1.2"/>
  <ellipse cx="37" cy="87" rx="6" ry="3.5" fill="${cfg.shoeColor}" stroke="${sc}" stroke-width="1.2"/>
</svg>`;
  }

  return { build };
})();


/* ══════════════════════════════════════════════════════════════
   2. SCENE BACKGROUNDS — isometric SVG illustrations
      Each fills viewBox 0 0 390 700 (portrait phone-shaped)
      Scene top (~upper 55%) = environment (counter, furniture)
      Scene bottom (~lower 45%) = open floor where queue stands
══════════════════════════════════════════════════════════════ */
const Scenes = {

  /* ── AIRPORT ─────────────────────────────────────────────── */
  airport: `
<defs>
  <linearGradient id="aFloor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#DDD7CB"/>
    <stop offset="100%" stop-color="#CEC8BA"/>
  </linearGradient>
  <linearGradient id="aWall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#C5B9AA"/>
    <stop offset="100%" stop-color="#B5A898"/>
  </linearGradient>
  <linearGradient id="aSky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#A8C4D8"/>
    <stop offset="100%" stop-color="#C8DDE8"/>
  </linearGradient>
</defs>

<!-- Sky behind windows -->
<!-- Full Background -->
<image href="Airport.png" xlink:href="Airport.png" x="0" y="0" width="390" height="700" preserveAspectRatio="xMidYMid slice" />

<!-- Rope barrier stanchions (keep for depth if they align) -->
<circle cx="52"  cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="50" y="285" width="4" height="38" fill="#C8A840"/>
<circle cx="130" cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="128" y="285" width="4" height="38" fill="#C8A840"/>
<circle cx="208" cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="206" y="285" width="4" height="38" fill="#C8A840"/>
<circle cx="286" cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="284" y="285" width="4" height="38" fill="#C8A840"/>
<circle cx="364" cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="362" y="285" width="4" height="38" fill="#C8A840"/>

<path d="M 52 295 Q 91 300 130 295 Q 169 300 208 295 Q 247 300 286 295 Q 325 300 364 295"
  stroke="#C8A840" stroke-width="2.5" fill="none" opacity="0.7" stroke-linecap="round"/>

<!-- Rope barrier stanchions -->
<circle cx="52"  cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="50" y="285" width="4" height="38" fill="#C8A840"/>
<circle cx="130" cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="128" y="285" width="4" height="38" fill="#C8A840"/>
<circle cx="208" cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="206" y="285" width="4" height="38" fill="#C8A840"/>
<circle cx="286" cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="284" y="285" width="4" height="38" fill="#C8A840"/>
<circle cx="364" cy="290" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="362" y="285" width="4" height="38" fill="#C8A840"/>

<!-- Rope line -->
<path d="M 52 295 Q 91 300 130 295 Q 169 300 208 295 Q 247 300 286 295 Q 325 300 364 295"
  stroke="#C8A840" stroke-width="2.5" fill="none" opacity="0.7" stroke-linecap="round"/>

<!-- Luggage items on floor -->
<rect x="14" y="310" width="28" height="22" rx="4" fill="#8B6B50" opacity="0.6"/>
<rect x="18" y="307" width="20" height="5" rx="2" fill="#7A5C42" opacity="0.6"/>
<rect x="330" y="305" width="32" height="26" rx="4" fill="#5A6B8A" opacity="0.6"/>
<rect x="336" y="301" width="20" height="5" rx="2" fill="#4A5B7A" opacity="0.6"/>
<rect x="350" y="340" width="22" height="18" rx="3" fill="#8A7B6A" opacity="0.5"/>
  `,

  /* ── CAFÉ ─────────────────────────────────────────────────── */
  cafe: `
<defs>
  <linearGradient id="cFloor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#E0D4C4"/>
    <stop offset="100%" stop-color="#D4C8B4"/>
  </linearGradient>
  <linearGradient id="cWall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#F2E8D8"/>
    <stop offset="100%" stop-color="#E4D8C4"/>
  </linearGradient>
</defs>

<!-- Wall -->
<!-- Full Background -->
<image href="CAFE.png" xlink:href="CAFE.png" x="0" y="0" width="390" height="700" preserveAspectRatio="xMidYMid slice" />

<!-- Rope queue -->
<circle cx="52"  cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="50" y="303" width="4" height="35" fill="#C8A840"/>
<circle cx="130" cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="128" y="303" width="4" height="35" fill="#C8A840"/>
<circle cx="208" cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="206" y="303" width="4" height="35" fill="#C8A840"/>
<circle cx="286" cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="284" y="303" width="4" height="35" fill="#C8A840"/>
<circle cx="364" cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="362" y="303" width="4" height="35" fill="#C8A840"/>
<path d="M 52 312 Q 91 318 130 312 Q 169 318 208 312 Q 247 318 286 312 Q 325 318 364 312"
  stroke="#C8A840" stroke-width="2.5" fill="none" opacity="0.7" stroke-linecap="round"/>

<!-- Rope queue -->
<circle cx="52"  cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="50" y="303" width="4" height="35" fill="#C8A840"/>
<circle cx="130" cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="128" y="303" width="4" height="35" fill="#C8A840"/>
<circle cx="208" cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="206" y="303" width="4" height="35" fill="#C8A840"/>
<circle cx="286" cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="284" y="303" width="4" height="35" fill="#C8A840"/>
<circle cx="364" cy="308" r="5" fill="#B8A040" stroke="#A08C30" stroke-width="1.2"/>
<rect x="362" y="303" width="4" height="35" fill="#C8A840"/>
<path d="M 52 312 Q 91 318 130 312 Q 169 318 208 312 Q 247 318 286 312 Q 325 318 364 312"
  stroke="#C8A840" stroke-width="2.5" fill="none" opacity="0.7" stroke-linecap="round"/>

<!-- Cozy seating area (side, not in queue path) -->
<rect x="320" y="340" width="60" height="42" rx="6" fill="#9E7858" opacity="0.5"/>
<rect x="328" y="335" width="44" height="8"  rx="3" fill="#8A6848" opacity="0.5"/>
<rect x="15"  y="360" width="55" height="38" rx="6" fill="#9E7858" opacity="0.5"/>
<rect x="22"  y="355" width="42" height="8"  rx="3" fill="#8A6848" opacity="0.5"/>
  `,

  /* ── HOSPITAL ─────────────────────────────────────────────── */
  hospital: `
<defs>
  <linearGradient id="hFloor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D8E8E8"/>
    <stop offset="100%" stop-color="#C8DCDC"/>
  </linearGradient>
  <linearGradient id="hWall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ECF5F5"/>
    <stop offset="100%" stop-color="#DCEAEA"/>
  </linearGradient>
</defs>

<!-- Full Background -->
<image href="Hospital.png" xlink:href="Hospital.png" x="0" y="0" width="390" height="700" preserveAspectRatio="xMidYMid slice" />

<!-- Floor markers -->
<rect x="48"  y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>
<rect x="126" y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>
<rect x="204" y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>
<rect x="282" y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>
<rect x="360" y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>

<!-- Queue line tape -->
<line x1="0" y1="340" x2="390" y2="340" stroke="#B05A5A" stroke-width="1.8" stroke-dasharray="14,10" opacity="0.4"/>
<!-- Floor markers -->
<rect x="48"  y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>
<rect x="126" y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>
<rect x="204" y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>
<rect x="282" y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>
<rect x="360" y="328" width="7" height="24" rx="3.5" fill="#B05A5A" opacity="0.55"/>

<!-- Waiting area chairs at far bottom -->
<rect x="20"  y="620" width="46" height="30" rx="5" fill="#88ACAC" opacity="0.6"/>
<rect x="22"  y="613" width="42" height="10" rx="4" fill="#70A0A0" opacity="0.6"/>
<rect x="80"  y="620" width="46" height="30" rx="5" fill="#88ACAC" opacity="0.6"/>
<rect x="82"  y="613" width="42" height="10" rx="4" fill="#70A0A0" opacity="0.6"/>
<rect x="264" y="620" width="46" height="30" rx="5" fill="#88ACAC" opacity="0.6"/>
<rect x="266" y="613" width="42" height="10" rx="4" fill="#70A0A0" opacity="0.6"/>
<rect x="324" y="620" width="46" height="30" rx="5" fill="#88ACAC" opacity="0.6"/>
<rect x="326" y="613" width="42" height="10" rx="4" fill="#70A0A0" opacity="0.6"/>
<!-- Coffee table between chairs -->
<rect x="148" y="628" width="94" height="18" rx="5" fill="#C0A870" opacity="0.5"/>
  `,

  /* ── BUS STOP ─────────────────────────────────────────────── */
  busstop: `
<defs>
  <linearGradient id="bsSky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#A8C4B8"/>
    <stop offset="100%" stop-color="#C4D8CC"/>
  </linearGradient>
  <linearGradient id="bsPave" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#C8C0B0"/>
    <stop offset="100%" stop-color="#B8B0A0"/>
  </linearGradient>
  <linearGradient id="bsRoad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#7A7870"/>
    <stop offset="100%" stop-color="#6A6860"/>
  </linearGradient>
</defs>

<!-- Sky -->
<!-- Full Background -->
<image href="BUS.jpg" xlink:href="BUS.jpg" x="0" y="0" width="390" height="700" preserveAspectRatio="xMidYMid slice" />

<!-- Queue spots on pavement (golden dots) -->
<circle cx="52"  cy="274" r="6" fill="#C8A840" opacity="0.45"/>
<circle cx="130" cy="274" r="6" fill="#C8A840" opacity="0.45"/>
<circle cx="208" cy="274" r="6" fill="#C8A840" opacity="0.45"/>
<circle cx="286" cy="274" r="6" fill="#C8A840" opacity="0.45"/>
<circle cx="364" cy="274" r="6" fill="#C8A840" opacity="0.45"/>

<!-- Queue spots on pavement (golden dots) -->
<circle cx="52"  cy="274" r="6" fill="#C8A840" opacity="0.45"/>
<circle cx="130" cy="274" r="6" fill="#C8A840" opacity="0.45"/>
<circle cx="208" cy="274" r="6" fill="#C8A840" opacity="0.45"/>
<circle cx="286" cy="274" r="6" fill="#C8A840" opacity="0.45"/>
<circle cx="364" cy="274" r="6" fill="#C8A840" opacity="0.45"/>

<!-- Approaching bus (partial, bottom of screen) -->
<g transform="translate(68, 650)">
  <rect x="0" y="0" width="180" height="50" rx="6" fill="#D4C870" stroke="#B8AC58" stroke-width="1.5"/>
  <rect x="8"  y="8"  width="28" height="18" rx="3" fill="#7AB8D4" opacity="0.85"/>
  <rect x="44" y="8"  width="28" height="18" rx="3" fill="#7AB8D4" opacity="0.85"/>
  <rect x="80" y="8"  width="28" height="18" rx="3" fill="#7AB8D4" opacity="0.85"/>
  <rect x="116" y="8" width="28" height="18" rx="3" fill="#7AB8D4" opacity="0.85"/>
  <rect x="0"  y="30" width="180" height="8" fill="#B8AC58" opacity="0.4"/>
  <rect x="4"  y="34" width="42" height="12" rx="3" fill="#B04030"/>
  <text x="25" y="44" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif" font-weight="700">42</text>
  <rect x="52" y="34" width="100" height="12" rx="3" fill="#1A2040"/>
  <text x="102" y="44" text-anchor="middle" fill="white" font-size="7" font-family="sans-serif">CITY CENTRE</text>
</g>
  `
};


/* ══════════════════════════════════════════════════════════════
   3. SCENARIO + CHARACTER DATA
══════════════════════════════════════════════════════════════ */

/* Per-scenario: where the queue slots sit on screen.
   Positions are in CSS px relative to the viewport.
   queueY = vertical center of the queue row.
   slotXs = horizontal center of each slot, in order.
   These are expressed as % of viewport so they're responsive. */
const QUEUE_LAYOUT = {
  airport: { yPct: 0.62, xStartPct: 0.10, xStepPct: 0.20 },
  cafe: { yPct: 0.65, xStartPct: 0.10, xStepPct: 0.20 },
  hospital: { yPct: 0.63, xStartPct: 0.10, xStepPct: 0.20 },
  busstop: { yPct: 0.58, xStartPct: 0.10, xStepPct: 0.20 },
};

const SCENARIOS = {

  /* ── AIRPORT ──────────────────────────────────────────────── */
  airport: {
    id: 'airport', name: '✈️  Airport',
    prompt: 'Arrange the queue — most urgent boards first',
    theme: 'theme-airport',
    levels: [
      {
        title: 'Level 1 · Boarding Rush',
        characters: [
          {
            id: 1, name: 'Mrs. Kapoor', priority: 1, excuse: 'Flight in 8 mins!',
            sadMsg: 'I\'ll miss my flight…', angryMsg: 'I\'M GOING TO MISS IT!! 😡',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4A882', eyeColor: '#3A2A20', strokeColor: '#7A5840',
              bodyColor: '#C17C5E', shoeColor: '#6A3828',
              accessory: `<rect x="12" y="2" width="36" height="9" rx="3" fill="#7A4830" stroke="#5A3020" stroke-width="1.2"/>
                         <rect x="8"  y="9" width="44" height="4" rx="2" fill="#7A4830"/>` }
          },
          {
            id: 2, name: 'Officer Dev', priority: 2, excuse: 'Active duty orders',
            sadMsg: 'Duty can\'t wait…', angryMsg: 'I HAVE ORDERS!! 😤',
            artConfig: {
              headShape: 'rounded', bodyShape: 'square',
              faceColor: '#C8A880', eyeColor: '#2A2820', strokeColor: '#5A5038',
              bodyColor: '#5A7060', shoeColor: '#2A3028',
              accessory: `<rect x="12" y="2" width="36" height="10" rx="3" fill="#3A4A38" stroke="#2A3828" stroke-width="1.2"/>`,
              bodyDetail: `<rect x="18" y="56" width="24" height="5" rx="2" fill="#C8A040" opacity="0.8"/>`
            }
          },
          {
            id: 3, name: 'Baby Arya', priority: 3, excuse: 'Family boards early',
            sadMsg: 'Baby won\'t stop crying…', angryMsg: 'WAAAH!! 😭',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#E8C898', eyeColor: '#3A2820', strokeColor: '#C8A040',
              bodyColor: '#E8C040', shoeColor: '#C8A030',
              bodyDetail: `<text x="30" y="68" text-anchor="middle" font-size="12" fill="white">🍼</text>`
            }
          },
          {
            id: 4, name: 'Dr. Mehta', priority: 4, excuse: 'Medical conference',
            sadMsg: 'Missing my session…', angryMsg: 'Important speech!! 😠',
            artConfig: {
              headShape: 'rounded', bodyShape: 'tall',
              faceColor: '#D4B898', eyeColor: '#2A2820', strokeColor: '#4A7058',
              bodyColor: '#4A7058', shoeColor: '#2A3828',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="10" fill="white">Rx</text>`
            }
          },
          {
            id: 5, name: 'Tourist Ron', priority: 5, excuse: 'No rush, early flight',
            sadMsg: 'Oh well, I can wait…', angryMsg: 'This is annoying! 😒',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4B080', eyeColor: '#3A2820', strokeColor: '#7A6858',
              bodyColor: '#9080B0', shoeColor: '#6A5898',
              accessory: `<ellipse cx="30" cy="8" rx="20" ry="9" fill="#C07840" stroke="#A06030" stroke-width="1.2"/>
                         <rect x="26" y="0" width="8" height="14" rx="3" fill="#C07840" stroke="#A06030" stroke-width="1.2"/>`,
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">📷</text>`
            }
          },
        ]
      },
      {
        title: 'Level 2 · Overcrowded Gate',
        characters: [
          {
            id: 1, name: 'Granny Loo', priority: 1, excuse: 'Wheelchair needed!',
            sadMsg: 'My joints ache so much!', angryMsg: 'I\'M 87 YEARS OLD!! 😡',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D8C8A8', eyeColor: '#5A5050', strokeColor: '#7A7060',
              bodyColor: '#9A9088', shoeColor: '#5A5248',
              bodyDetail: `<text x="30" y="65" text-anchor="middle" font-size="11" fill="#5A5248">🦯</text>`
            }
          },
          {
            id: 2, name: 'Pilot Kim', priority: 2, excuse: 'I\'M the co-pilot!!',
            sadMsg: 'Who is flying?!', angryMsg: 'PLANE NEEDS ME!! ✈️',
            artConfig: {
              headShape: 'rounded', bodyShape: 'square',
              faceColor: '#C8B090', eyeColor: '#2A2820', strokeColor: '#3A4060',
              bodyColor: '#3A4060', shoeColor: '#1A2030',
              accessory: `<rect x="12" y="2" width="36" height="10" rx="3" fill="#1A2030" stroke="#0A1020" stroke-width="1.2"/>
                         <rect x="20" y="3" width="20" height="5" rx="2" fill="#C8A040"/>`,
              bodyDetail: `<rect x="18" y="56" width="24" height="4" rx="2" fill="#C8A040" opacity="0.8"/>`
            }
          },
          {
            id: 3, name: 'The Twins', priority: 3, excuse: '5 kids + stroller!',
            sadMsg: 'Kids melting down…', angryMsg: 'WE HAVE 5 KIDS!! 😩',
            artConfig: {
              headShape: 'wide', bodyShape: 'wide',
              faceColor: '#D4A878', eyeColor: '#2A2820', strokeColor: '#B06830',
              bodyColor: '#C07838', shoeColor: '#904820',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="13" fill="white">👶</text>`
            }
          },
          {
            id: 4, name: 'Exec Elena', priority: 4, excuse: 'First class, lounge full',
            sadMsg: 'This is unacceptable…', angryMsg: 'Do you know who I AM?! 😤',
            artConfig: {
              headShape: 'tall', bodyShape: 'tall',
              faceColor: '#C8A888', eyeColor: '#2A2820', strokeColor: '#3A3A3A',
              bodyColor: '#3A3A3A', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">💼</text>`
            }
          },
          {
            id: 5, name: 'Med Student', priority: 5, excuse: 'Exam in another city!',
            sadMsg: 'My whole future…', angryMsg: 'I STUDIED ALL NIGHT!! 😭',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C8B098', eyeColor: '#2A2820', strokeColor: '#4A8068',
              bodyColor: '#4A8068', shoeColor: '#2A4838',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">📚</text>`
            }
          },
          {
            id: 6, name: 'Tourist Raj', priority: 6, excuse: 'Holiday, no real rush',
            sadMsg: 'Vacation delayed a bit…', angryMsg: 'Fine, I suppose 🙄',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4A870', eyeColor: '#2A2820', strokeColor: '#C09040',
              bodyColor: '#C09040', shoeColor: '#907020',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">🏖️</text>`
            }
          },
        ]
      },
      {
        title: 'Level 3 · International Chaos',
        characters: [
          {
            id: 1, name: 'Amb. Nkosi', priority: 1, excuse: 'UN summit, dipl. passport',
            sadMsg: 'Summit can\'t wait…', angryMsg: 'DIPLOMATIC IMMUNITY!! 🌍',
            artConfig: {
              headShape: 'rounded', bodyShape: 'tall',
              faceColor: '#8A7060', eyeColor: '#2A2020', strokeColor: '#3A4060',
              bodyColor: '#3A4060', shoeColor: '#1A2030',
              accessory: `<rect x="12" y="2" width="36" height="10" rx="3" fill="#1A2030"/><rect x="22" y="3" width="16" height="5" rx="2" fill="#C8A040"/>`
            }
          },
          {
            id: 2, name: 'Doctor Lee', priority: 2, excuse: 'Organ on ice, must fly NOW',
            sadMsg: 'Someone\'s life at stake…', angryMsg: 'THIS IS LIFE OR DEATH!! 🏥',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C8A888', eyeColor: '#2A2820', strokeColor: '#B04040',
              bodyColor: '#B04040', shoeColor: '#2A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">🫀</text>`
            }
          },
          {
            id: 3, name: 'Nana Osei', priority: 3, excuse: 'Elderly, 87, needs help',
            sadMsg: 'My hip is aching…', angryMsg: 'I\'M 87 YEARS OLD!! 😡',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C8B898', eyeColor: '#5A5050', strokeColor: '#7A7868',
              bodyColor: '#9A9888', shoeColor: '#5A5848',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="#5A5848">🦯</text>`
            }
          },
          {
            id: 4, name: 'Maya & Baby', priority: 4, excuse: 'Infant under 2',
            sadMsg: 'Baby crying nonstop…', angryMsg: 'BABY NEEDS TO BOARD!! 😭',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#D4A898', eyeColor: '#2A2820', strokeColor: '#B07880',
              bodyColor: '#B07880', shoeColor: '#8A5058',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="13" fill="white">🤱</text>`
            }
          },
          {
            id: 5, name: 'Sgt. Priya', priority: 5, excuse: 'Military deployment',
            sadMsg: 'Unit is waiting…', angryMsg: 'I HAVE ORDERS!! 💂',
            artConfig: {
              headShape: 'rounded', bodyShape: 'square',
              faceColor: '#C8A878', eyeColor: '#2A2820', strokeColor: '#5A6830',
              bodyColor: '#5A6830', shoeColor: '#2A3010'
            }
          },
          {
            id: 6, name: 'Journo Max', priority: 6, excuse: 'Breaking story, must file',
            sadMsg: 'Story won\'t break itself…', angryMsg: 'THE PUBLIC NEEDS TO KNOW!! 📰',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C8B898', eyeColor: '#2A2820', strokeColor: '#6A6858',
              bodyColor: '#7A7868', shoeColor: '#3A3828',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">📰</text>`
            }
          },
          {
            id: 7, name: 'Biz. Fatima', priority: 7, excuse: 'Business class, platinum',
            sadMsg: 'I pay for priority…', angryMsg: 'WHERE\'S MY PRIORITY?! 😤',
            artConfig: {
              headShape: 'tall', bodyShape: 'tall',
              faceColor: '#C8A890', eyeColor: '#2A2820', strokeColor: '#7A5898',
              bodyColor: '#7A5898', shoeColor: '#4A2868',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">💳</text>`
            }
          },
        ]
      }
    ]
  },

  /* ── CAFÉ ──────────────────────────────────────────────────── */
  cafe: {
    id: 'cafe', name: '☕  Café',
    prompt: 'Who needs their coffee most urgently?',
    theme: 'theme-cafe',
    levels: [
      {
        title: 'Level 1 · Morning Rush',
        characters: [
          {
            id: 1, name: 'Nurse Ayo', priority: 1, excuse: '12hr night shift just ended',
            sadMsg: 'Running on empty…', angryMsg: 'I WORKED ALL NIGHT!! 😤',
            artConfig: {
              headShape: 'circle', bodyShape: 'tall',
              faceColor: '#8A7060', eyeColor: '#2A2020', strokeColor: '#4A8068',
              bodyColor: '#4A8068', shoeColor: '#2A4838',
              accessory: `<rect x="14" y="2" width="32" height="8" rx="3" fill="white" stroke="#ccc" stroke-width="1.2"/><rect x="22" y="2" width="16" height="5" fill="#B04040"/>`
            }
          },
          {
            id: 2, name: 'Tired Dad', priority: 2, excuse: 'Baby up ALL night',
            sadMsg: 'Haven\'t slept since Tue…', angryMsg: 'THE BABY WON\'T STOP!! 😭',
            artConfig: {
              headShape: 'rounded', bodyShape: 'round',
              faceColor: '#C8B090', eyeColor: '#3A2820', strokeColor: '#5A7890',
              bodyColor: '#5A7890', shoeColor: '#2A4860',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">👶</text>`
            }
          },
          {
            id: 3, name: 'Student Mia', priority: 3, excuse: 'Exam in 20 minutes!',
            sadMsg: 'Going to fail…', angryMsg: 'I STUDIED ALL NIGHT!! 😩',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4A870', eyeColor: '#2A2820', strokeColor: '#B07830',
              bodyColor: '#B07830', shoeColor: '#804820',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">📖</text>`
            }
          },
          {
            id: 4, name: 'Dev Rohan', priority: 4, excuse: 'Production is DOWN!!',
            sadMsg: 'Servers are burning…', angryMsg: 'EVERYTHING IS ON FIRE!! 💻',
            artConfig: {
              headShape: 'rounded', bodyShape: 'square',
              faceColor: '#C8A888', eyeColor: '#2A2820', strokeColor: '#A04040',
              bodyColor: '#A04040', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">💻</text>`
            }
          },
          {
            id: 5, name: 'Office Sam', priority: 5, excuse: 'Just checking emails',
            sadMsg: 'Ah well, could be worse…', angryMsg: 'This wait is too long! 😒',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#C8B898', eyeColor: '#3A3030', strokeColor: '#7A7868',
              bodyColor: '#7A7868', shoeColor: '#3A3828',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="11" fill="white">📱</text>`
            }
          },
        ]
      },
      {
        title: 'Level 2 · Loyalty Showdown',
        characters: [
          {
            id: 1, name: 'Chef Isabelle', priority: 1, excuse: 'Catering 200 in 1 hour',
            sadMsg: 'Event is ruined…', angryMsg: '200 HUNGRY GUESTS!! 👩‍🍳',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4A888', eyeColor: '#2A2820', strokeColor: '#A04040',
              bodyColor: '#A04040', shoeColor: '#1A1A1A',
              accessory: `<ellipse cx="30" cy="9" rx="14" ry="12" fill="white" stroke="#ccc" stroke-width="1.2"/>
                         <ellipse cx="30" cy="6" rx="12" ry="10" fill="white"/>`,
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">🍳</text>`
            }
          },
          {
            id: 2, name: 'Nurse (ICU)', priority: 2, excuse: 'ICU break — 4 mins only!',
            sadMsg: 'Break is nearly over…', angryMsg: 'PATIENTS NEED ME BACK!! 😡',
            artConfig: {
              headShape: 'circle', bodyShape: 'tall',
              faceColor: '#8A7060', eyeColor: '#2A2020', strokeColor: '#4A8068',
              bodyColor: '#4A8068', shoeColor: '#2A4838',
              accessory: `<rect x="14" y="2" width="32" height="8" rx="3" fill="white" stroke="#ccc" stroke-width="1.2"/><rect x="22" y="2" width="16" height="5" fill="#B04040"/>`
            }
          },
          {
            id: 3, name: 'Writer Priya', priority: 3, excuse: 'Deadline in 15 mins!',
            sadMsg: 'Editor will kill me…', angryMsg: 'THE PIECE ISN\'T WRITTEN!! ✍️',
            artConfig: {
              headShape: 'tall', bodyShape: 'round',
              faceColor: '#C8A8C8', eyeColor: '#3A2840', strokeColor: '#8058A0',
              bodyColor: '#8058A0', shoeColor: '#4A2860',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">✍️</text>`
            }
          },
          {
            id: 4, name: 'Loyalty Lou', priority: 4, excuse: 'Gold member, 500 visits!',
            sadMsg: 'GOLD tier and waiting??', angryMsg: '500 VISITS AND THIS?! 🌟',
            artConfig: {
              headShape: 'rounded', bodyShape: 'wide',
              faceColor: '#D8B870', eyeColor: '#2A2010', strokeColor: '#B09030',
              bodyColor: '#C0A838', shoeColor: '#806818',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="white">⭐</text>`
            }
          },
          {
            id: 5, name: 'First Timer', priority: 5, excuse: 'New here, don\'t know rules',
            sadMsg: 'I\'m so confused…', angryMsg: 'Nobody told me!! 😶',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C8C0B0', eyeColor: '#4A4840', strokeColor: '#8A8878',
              bodyColor: '#9A9888', shoeColor: '#5A5848'
            }
          },
          {
            id: 6, name: 'Tourist Mei', priority: 6, excuse: 'Tour bus starts soon-ish',
            sadMsg: 'Tour might leave…', angryMsg: 'Tour bus won\'t wait! 🗺️',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C8B890', eyeColor: '#2A2820', strokeColor: '#4A7858',
              bodyColor: '#587A58', shoeColor: '#2A4830',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">🗺️</text>`
            }
          },
        ]
      },
      {
        title: 'Level 3 · Decaf Disaster',
        characters: [
          {
            id: 1, name: 'Paramedic Al', priority: 1, excuse: 'Ambulance running outside!',
            sadMsg: 'Someone needs help NOW…', angryMsg: 'AMBULANCE IS RUNNING!! 🚑',
            artConfig: {
              headShape: 'rounded', bodyShape: 'square',
              faceColor: '#C8A888', eyeColor: '#2A2820', strokeColor: '#A04040',
              bodyColor: '#A04040', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="13" fill="white">🚑</text>`
            }
          },
          {
            id: 2, name: 'Chef Marco', priority: 2, excuse: 'No beans! Opens in 10!',
            sadMsg: 'No espresso to serve…', angryMsg: 'WE HAVE NO COFFEE!! 😱',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4A888', eyeColor: '#2A2820', strokeColor: '#904040',
              bodyColor: '#904040', shoeColor: '#1A1A1A',
              accessory: `<ellipse cx="30" cy="9" rx="14" ry="12" fill="white" stroke="#ccc" stroke-width="1.2"/>`,
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">👨‍🍳</text>`
            }
          },
          {
            id: 3, name: 'Prof. Dana', priority: 3, excuse: 'Lecture in 5, 300 students!',
            sadMsg: '300 waiting…', angryMsg: 'I TEACH 300 PEOPLE!! 👩‍🏫',
            artConfig: {
              headShape: 'rounded', bodyShape: 'tall',
              faceColor: '#C8B098', eyeColor: '#2A2820', strokeColor: '#4A6898',
              bodyColor: '#4A6898', shoeColor: '#1A2848',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">📋</text>`
            }
          },
          {
            id: 4, name: 'Bride Zara', priority: 4, excuse: 'Wedding in 2 hours!!',
            sadMsg: 'I\'m getting married today…', angryMsg: 'IT\'S MY WEDDING DAY!! 👰',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#D4C8B8', eyeColor: '#3A3028', strokeColor: '#A8A098',
              bodyColor: '#F0EDE8', shoeColor: '#C8B8C0',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="13" fill="#8A8878">💍</text>`
            }
          },
          {
            id: 5, name: 'Coder Yuki', priority: 5, excuse: 'Investor demo in 30 min!',
            sadMsg: 'Startup might die…', angryMsg: 'INVESTOR DEMO IN 30!! 💻',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C8B0C8', eyeColor: '#2A2030', strokeColor: '#7858A0',
              bodyColor: '#7858A0', shoeColor: '#482860',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">💻</text>`
            }
          },
          {
            id: 6, name: 'Reporter Ben', priority: 6, excuse: 'Live broadcast in 45 min',
            sadMsg: 'On-air without caffeine…', angryMsg: 'GOING ON AIR SOON! 🎙️',
            artConfig: {
              headShape: 'rounded', bodyShape: 'square',
              faceColor: '#C8B898', eyeColor: '#3A3830', strokeColor: '#6A6858',
              bodyColor: '#6A6858', shoeColor: '#2A2818',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">🎙️</text>`
            }
          },
          {
            id: 7, name: 'Regular Joe', priority: 7, excuse: 'Daily ritual',
            sadMsg: 'Morning ritual disrupted…', angryMsg: 'I come here EVERY DAY!! 😤',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#D4A870', eyeColor: '#2A2820', strokeColor: '#B07830',
              bodyColor: '#B07830', shoeColor: '#804820',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="white">☕</text>`
            }
          },
        ]
      }
    ]
  },

  /* ── HOSPITAL ──────────────────────────────────────────────── */
  hospital: {
    id: 'hospital', name: '🏥  Hospital',
    prompt: 'Triage the queue — most urgent goes first',
    theme: 'theme-hospital',
    levels: [
      {
        title: 'Level 1 · ER Intake',
        characters: [
          {
            id: 1, name: 'Mr. Okafor', priority: 1, excuse: 'Chest pains — 20 min!',
            sadMsg: 'Pain getting worse…', angryMsg: 'I MIGHT HAVE A HEART ATTACK!! 💔',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#8A6858', eyeColor: '#2A2020', strokeColor: '#A04040',
              bodyColor: '#A04040', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">💔</text>`
            }
          },
          {
            id: 2, name: 'Child Layla', priority: 2, excuse: 'Fever 40.2°C, won\'t stop!',
            sadMsg: 'I feel so hot…', angryMsg: 'I\'M BURNING UP!! 🤒',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#E8C0B0', eyeColor: '#2A2820', strokeColor: '#C06060',
              bodyColor: '#C06060', shoeColor: '#804040'
            }
          },
          {
            id: 3, name: 'Builder Tom', priority: 3, excuse: 'Deep saw cut, bleeding',
            sadMsg: 'Blood won\'t stop…', angryMsg: 'I\'M STILL BLEEDING!! 🩹',
            artConfig: {
              headShape: 'rounded', bodyShape: 'square',
              faceColor: '#C8A880', eyeColor: '#2A2820', strokeColor: '#B07830',
              bodyColor: '#B07830', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">🔨</text>`
            }
          },
          {
            id: 4, name: 'Sprain Sara', priority: 4, excuse: 'Twisted ankle, can\'t walk',
            sadMsg: 'Every step agony…', angryMsg: 'I CAN\'T WALK!! 🦶',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4B898', eyeColor: '#2A2820', strokeColor: '#C09840',
              bodyColor: '#C09840', shoeColor: '#806820',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🦶</text>`
            }
          },
          {
            id: 5, name: 'Cold Carl', priority: 5, excuse: 'Bad cold, started yesterday',
            sadMsg: 'I feel terrible, but ok…', angryMsg: 'Sneezing ALL DAY!! 🤧',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#C8C0B8', eyeColor: '#4A4840', strokeColor: '#8A8878',
              bodyColor: '#9A9888', shoeColor: '#5A5848',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="#5A5848">🤧</text>`
            }
          },
        ]
      },
      {
        title: 'Level 2 · Busy Saturday',
        characters: [
          {
            id: 1, name: 'Stroke Mike', priority: 1, excuse: 'Face drooping, speech slurred!',
            sadMsg: 'Something\'s very wrong…', angryMsg: 'CAN\'T SPEAK PROPERLY!! 🧠',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C0A8C0', eyeColor: '#2A2030', strokeColor: '#806898',
              bodyColor: '#806898', shoeColor: '#482858',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🧠</text>`
            }
          },
          {
            id: 2, name: 'Bee Sting Kim', priority: 2, excuse: 'Allergic! Throat tightening!',
            sadMsg: 'Barely breathing…', angryMsg: 'I CAN\'T BREATHE!! 🐝',
            artConfig: {
              headShape: 'rounded', bodyShape: 'round',
              faceColor: '#D4A888', eyeColor: '#2A2820', strokeColor: '#A04040',
              bodyColor: '#A04040', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🐝</text>`
            }
          },
          {
            id: 3, name: 'Broken Wrist', priority: 3, excuse: 'Fell skating, bone visible!',
            sadMsg: 'The pain is intense…', angryMsg: 'THE BONE IS OUT!! 🦴',
            artConfig: {
              headShape: 'circle', bodyShape: 'square',
              faceColor: '#C0C8D8', eyeColor: '#2A2838', strokeColor: '#4870A0',
              bodyColor: '#4870A0', shoeColor: '#1A2840',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🦴</text>`
            }
          },
          {
            id: 4, name: 'Burn Victim', priority: 4, excuse: 'Kitchen burn, large area',
            sadMsg: 'It stings so much…', angryMsg: 'This burn is serious!! 🔥',
            artConfig: {
              headShape: 'rounded', bodyShape: 'round',
              faceColor: '#D4A898', eyeColor: '#2A2820', strokeColor: '#A04040',
              bodyColor: '#A04040', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🔥</text>`
            }
          },
          {
            id: 5, name: 'Dizzy Diana', priority: 5, excuse: 'Severe dizziness, can\'t stand',
            sadMsg: 'Everything is spinning…', angryMsg: 'ROOM WON\'T STOP!! 😵',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#C0B0D0', eyeColor: '#2A2038', strokeColor: '#806898',
              bodyColor: '#806898', shoeColor: '#482858',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="white">😵</text>`
            }
          },
          {
            id: 6, name: 'Rash Rick', priority: 6, excuse: 'Itchy rash, stable though',
            sadMsg: 'Very itchy…', angryMsg: 'Itchy for HOURS!! 😤',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4B898', eyeColor: '#2A2820', strokeColor: '#B09040',
              bodyColor: '#B09040', shoeColor: '#706020',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">😤</text>`
            }
          },
        ]
      },
      {
        title: 'Level 3 · Critical Triage',
        characters: [
          {
            id: 1, name: 'Trauma Anna', priority: 1, excuse: 'Car crash, unconscious before!',
            sadMsg: 'Head is pounding…', angryMsg: 'I WAS IN A CRASH!! 🚨',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C0A898', eyeColor: '#2A2820', strokeColor: '#A04040',
              bodyColor: '#A04040', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🚨</text>`
            }
          },
          {
            id: 2, name: 'Overdose Ali', priority: 2, excuse: 'Suspected overdose, just now',
            sadMsg: 'I feel so sick…', angryMsg: 'PLEASE HELP ME NOW!! ⚠️',
            artConfig: {
              headShape: 'wide', bodyShape: 'wide',
              faceColor: '#C0B0D0', eyeColor: '#2A2038', strokeColor: '#806898',
              bodyColor: '#806898', shoeColor: '#482858',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="white">⚠️</text>`
            }
          },
          {
            id: 3, name: 'Asthma Jake', priority: 3, excuse: 'Inhaler NOT working!!',
            sadMsg: 'Can\'t get enough air…', angryMsg: 'INHALER FAILED!! 😮‍💨',
            artConfig: {
              headShape: 'rounded', bodyShape: 'round',
              faceColor: '#C0C8D8', eyeColor: '#2A2838', strokeColor: '#4870A0',
              bodyColor: '#4870A0', shoeColor: '#1A2840',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">💨</text>`
            }
          },
          {
            id: 4, name: 'Fracture Fen', priority: 4, excuse: 'Complex leg fracture',
            sadMsg: 'Pain is unbearable…', angryMsg: 'I FELL OFF A ROOF!! 🦽',
            artConfig: {
              headShape: 'circle', bodyShape: 'square',
              faceColor: '#D4A878', eyeColor: '#2A2820', strokeColor: '#B07830',
              bodyColor: '#B07830', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🦽</text>`
            }
          },
          {
            id: 5, name: 'Infection Ira', priority: 5, excuse: 'Red lines spreading!',
            sadMsg: 'Getting worse…', angryMsg: 'RED LINES SPREAD!! 🦠',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C0D0C0', eyeColor: '#1A2820', strokeColor: '#4A7858',
              bodyColor: '#4A7858', shoeColor: '#2A4838',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🦠</text>`
            }
          },
          {
            id: 6, name: 'Migraine Mo', priority: 6, excuse: 'Worst migraine, 3 days!',
            sadMsg: 'Light hurts so much…', angryMsg: '3 DAYS OF THIS PAIN!! 🤯',
            artConfig: {
              headShape: 'wide', bodyShape: 'wide',
              faceColor: '#C0B0D0', eyeColor: '#2A2038', strokeColor: '#806898',
              bodyColor: '#806898', shoeColor: '#482858',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="white">🤯</text>`
            }
          },
          {
            id: 7, name: 'Sprain Simon', priority: 7, excuse: 'Sprained wrist, tennis',
            sadMsg: 'Hurts to move it…', angryMsg: 'Quite sore actually! 🎾',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4B898', eyeColor: '#2A2820', strokeColor: '#B09040',
              bodyColor: '#B09040', shoeColor: '#706020',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🎾</text>`
            }
          },
        ]
      }
    ]
  },

  /* ── BUS STOP ──────────────────────────────────────────────── */
  busstop: {
    id: 'busstop', name: '🚌  Bus Stop',
    prompt: 'Who should board the bus first?',
    theme: 'theme-busstop',
    levels: [
      {
        title: 'Level 1 · Daily Commute',
        characters: [
          {
            id: 1, name: 'Nani Patel', priority: 1, excuse: 'Elderly, knees aching',
            sadMsg: 'My knees hurt so much…', angryMsg: 'I\'M TOO OLD TO STAND!! 😤',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D8C0A0', eyeColor: '#4A4040', strokeColor: '#7A7060',
              bodyColor: '#9A9088', shoeColor: '#5A5248',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="#5A5248">🦯</text>`
            }
          },
          {
            id: 2, name: 'Priya + Baby', priority: 2, excuse: 'Newborn, needs a seat',
            sadMsg: 'Baby is getting fussy…', angryMsg: 'MY BABY NEEDS TO SIT!! 😭',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#D4A8B8', eyeColor: '#2A2030', strokeColor: '#B07888',
              bodyColor: '#B07888', shoeColor: '#804858',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="13" fill="white">🤱</text>`
            }
          },
          {
            id: 3, name: 'Nurse Ananya', priority: 3, excuse: '12hr shift starts in 5!',
            sadMsg: 'Patients are waiting…', angryMsg: 'PATIENTS NEED ME NOW!! 😡',
            artConfig: {
              headShape: 'circle', bodyShape: 'tall',
              faceColor: '#8A7868', eyeColor: '#2A2020', strokeColor: '#4A8878',
              bodyColor: '#4A8878', shoeColor: '#2A4848'
            }
          },
          {
            id: 4, name: 'Student Arun', priority: 4, excuse: 'Exam in 20, bus only way',
            sadMsg: 'I\'ll definitely fail…', angryMsg: 'THIS IS MY ONLY EXAM!! 😩',
            artConfig: {
              headShape: 'rounded', bodyShape: 'round',
              faceColor: '#D4A870', eyeColor: '#2A2820', strokeColor: '#C09040',
              bodyColor: '#C09040', shoeColor: '#806020',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="11" fill="white">📖</text>`
            }
          },
          {
            id: 5, name: 'Office Worker', priority: 5, excuse: 'Just heading home',
            sadMsg: 'Standing isn\'t bad…', angryMsg: 'I pay taxes for this!! 😒',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#C8B898', eyeColor: '#3A3028', strokeColor: '#7A7868',
              bodyColor: '#7A7868', shoeColor: '#3A3828',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="white">💻</text>`
            }
          },
        ]
      },
      {
        title: 'Level 2 · Rainy Day Rush',
        characters: [
          {
            id: 1, name: 'Granny Rose', priority: 1, excuse: '87 yrs old, soaking wet',
            sadMsg: 'Completely drenched…', angryMsg: 'I\'M 87, LET ME IN!! 👵',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D8C8A8', eyeColor: '#5A5050', strokeColor: '#7A7868',
              bodyColor: '#9A9888', shoeColor: '#5A5848',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="#5A5848">☔</text>`
            }
          },
          {
            id: 2, name: 'Dr. Ramesh', priority: 2, excuse: 'Emergency call — must rush!',
            sadMsg: 'Patient really needs me…', angryMsg: 'SOMEONE IS WAITING!! 🏥',
            artConfig: {
              headShape: 'rounded', bodyShape: 'square',
              faceColor: '#C8A888', eyeColor: '#2A2820', strokeColor: '#A04040',
              bodyColor: '#A04040', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🩺</text>`
            }
          },
          {
            id: 3, name: 'Job Interview', priority: 3, excuse: 'Interview in 10, can\'t be late!',
            sadMsg: 'Dream job slipping…', angryMsg: 'IT\'S MY DREAM JOB!! 😤',
            artConfig: {
              headShape: 'tall', bodyShape: 'tall',
              faceColor: '#C8B098', eyeColor: '#2A2820', strokeColor: '#5060A0',
              bodyColor: '#5060A0', shoeColor: '#202840',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">💼</text>`
            }
          },
          {
            id: 4, name: 'School Run', priority: 4, excuse: 'Kids late for school',
            sadMsg: 'Teacher will be upset…', angryMsg: 'THEY\'LL MISS ASSEMBLY!! 😱',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C8A8C8', eyeColor: '#2A2030', strokeColor: '#886898',
              bodyColor: '#886898', shoeColor: '#484058',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🏫</text>`
            }
          },
          {
            id: 5, name: 'Delivery Guy', priority: 5, excuse: '15 parcels, time-sensitive',
            sadMsg: 'Ratings are tanking…', angryMsg: 'RATINGS AT RISK!! 😠',
            artConfig: {
              headShape: 'rounded', bodyShape: 'wide',
              faceColor: '#D4A870', eyeColor: '#2A2820', strokeColor: '#C08030',
              bodyColor: '#C08030', shoeColor: '#804820',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="white">📦</text>`
            }
          },
          {
            id: 6, name: 'Tourist Pair', priority: 6, excuse: 'Hotel checkout, mild rush',
            sadMsg: 'Might miss checkout…', angryMsg: 'OUR BAGS ARE OUTSIDE!! 🧳',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#C0C8D8', eyeColor: '#2A2838', strokeColor: '#507890',
              bodyColor: '#507890', shoeColor: '#203050',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🧳</text>`
            }
          },
        ]
      },
      {
        title: 'Level 3 · Last Bus Home',
        characters: [
          {
            id: 1, name: 'Lost Tourist', priority: 1, excuse: 'No money, no phone, lost',
            sadMsg: 'I don\'t know where I am…', angryMsg: 'I\'M TOTALLY LOST!! 😰',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D4B0A0', eyeColor: '#2A2820', strokeColor: '#B06858',
              bodyColor: '#B06858', shoeColor: '#783830',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">❓</text>`
            }
          },
          {
            id: 2, name: 'Pregnant Mom', priority: 2, excuse: '8 months pregnant',
            sadMsg: 'Feet so swollen…', angryMsg: 'I\'M 8 MONTHS PREGNANT!! 😤',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#D4A8B8', eyeColor: '#2A2030', strokeColor: '#B07888',
              bodyColor: '#C09090', shoeColor: '#907080',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="13" fill="white">🤰</text>`
            }
          },
          {
            id: 3, name: 'Night Shift', priority: 3, excuse: 'Worked 16hrs, barely awake',
            sadMsg: 'Might fall asleep standing…', angryMsg: 'BEEN UP 16 HOURS!! 😵',
            artConfig: {
              headShape: 'rounded', bodyShape: 'tall',
              faceColor: '#C8B898', eyeColor: '#3A3028', strokeColor: '#5A6068',
              bodyColor: '#5A6068', shoeColor: '#1A1A1A',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">😴</text>`
            }
          },
          {
            id: 4, name: 'Senior Pass', priority: 4, excuse: 'Senior citizen, monthly pass',
            sadMsg: 'Senior pass should count…', angryMsg: 'I HAVE A PASS!! 😡',
            artConfig: {
              headShape: 'circle', bodyShape: 'round',
              faceColor: '#D8B888', eyeColor: '#3A3028', strokeColor: '#7A6848',
              bodyColor: '#8A7858', shoeColor: '#4A3828',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🎫</text>`
            }
          },
          {
            id: 5, name: 'Concert Kids', priority: 5, excuse: 'Group, booked tickets',
            sadMsg: 'Gonna miss the concert…', angryMsg: 'WE HAVE TICKETS!! 🎟️',
            artConfig: {
              headShape: 'circle', bodyShape: 'square',
              faceColor: '#C0B0D0', eyeColor: '#2A2038', strokeColor: '#706898',
              bodyColor: '#706898', shoeColor: '#302848',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🎟️</text>`
            }
          },
          {
            id: 6, name: 'Stray Pup Fan', priority: 6, excuse: 'Rescued a dog',
            sadMsg: 'Puppy is shivering…', angryMsg: 'THE PUPPY CAN\'T WAIT!! 🐶',
            artConfig: {
              headShape: 'rounded', bodyShape: 'round',
              faceColor: '#C0D0B8', eyeColor: '#2A2820', strokeColor: '#608058',
              bodyColor: '#608058', shoeColor: '#304028',
              bodyDetail: `<text x="30" y="64" text-anchor="middle" font-size="12" fill="white">🐶</text>`
            }
          },
          {
            id: 7, name: 'Regular Raj', priority: 7, excuse: 'Same bus every day',
            sadMsg: 'Routine slightly off…', angryMsg: 'HERE EVERY DAY!! 😤',
            artConfig: {
              headShape: 'circle', bodyShape: 'wide',
              faceColor: '#C8B898', eyeColor: '#3A3028', strokeColor: '#6A7078',
              bodyColor: '#6A7078', shoeColor: '#2A3038',
              bodyDetail: `<text x="30" y="62" text-anchor="middle" font-size="12" fill="white">🚌</text>`
            }
          },
        ]
      }
    ]
  }
};


/* ══════════════════════════════════════════════════════════════
   4. GAME STATE
══════════════════════════════════════════════════════════════ */
const State = {
  screen: 'title',
  scenario: null,
  levelIdx: 0,
  chars: [],    // active shuffled characters with state/bubble
  score: 0,
  gameId: 0,     // incremented each goGame; ignore stale win timers
  drag: {
    active: false,
    charId: null,
    ghostEl: null,
    offX: 0, offY: 0,
    srcPos: 0,      // queue position index being dragged
  }
};

let evalWinTimer = null;
function clearEvalWinTimer() {
  if (evalWinTimer !== null) {
    clearTimeout(evalWinTimer);
    evalWinTimer = null;
  }
}


/* ══════════════════════════════════════════════════════════════
   5. SCREEN MANAGER
══════════════════════════════════════════════════════════════ */
const Screens = {
  show(id) {
    const el = document.getElementById(id);
    if (!el) return;
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    el.style.display = 'flex';
    requestAnimationFrame(() => el.classList.add('active'));
    State.screen = id;
  },

  goTitle() {
    clearEvalWinTimer();
    document.body.className = '';
    this.show('screen-title');
  },

  goSelect() {
    clearEvalWinTimer();
    document.body.className = '';
    this.show('screen-select');
  },

  goGame(scenarioId, levelIdx) {
    clearEvalWinTimer();
    const scen = SCENARIOS[scenarioId];
    if (!scen || !scen.levels || !scen.levels.length) {
      console.error('Unknown scenario:', scenarioId);
      this.goSelect();
      return;
    }
    const idx = Math.max(0, Math.min(levelIdx | 0, scen.levels.length - 1));
    const level = scen.levels[idx];
    if (!level || !level.characters || !level.characters.length) {
      console.error('Invalid level:', scenarioId, levelIdx);
      this.goSelect();
      return;
    }

    State.gameId += 1;
    State.scenario = scenarioId;
    State.levelIdx = idx;

    /* Shuffle characters, reset state */
    State.chars = shuffle(level.characters).map((c, i) => ({
      ...c,
      artConfig: { ...c.artConfig },
      pos: i,       // current queue position (0 = front)
      state: 'happy',
      bubble: null,
    }));

    document.body.className = scen.theme;
    document.getElementById('overlay-win')?.classList.add('hidden');
    document.getElementById('overlay-done')?.classList.add('hidden');
    this.show('screen-game');

    try {
      SceneRenderer.renderBackground(scenarioId);
      HUD.update(scen, level);
      QueueRenderer.render();
      Evaluator.run();
      QueueRenderer.render(true);
    } catch (err) {
      console.error(err);
      this.goSelect();
    }
  }
};


/* ══════════════════════════════════════════════════════════════
   6. SCENE / BACKGROUND RENDERER
══════════════════════════════════════════════════════════════ */
const SceneRenderer = {
  renderBackground(scenarioId) {
    const svg = document.getElementById('scene-svg');
    svg.innerHTML = Scenes[scenarioId] || '';
  }
};


/* ══════════════════════════════════════════════════════════════
   7. HUD UPDATER
══════════════════════════════════════════════════════════════ */
const HUD = {
  update(scen, level) {
    document.getElementById('hud-scene').textContent = scen.name;
    document.getElementById('hud-level').textContent = level.title;
    document.getElementById('ribbon-text').textContent = scen.prompt;
    document.getElementById('score-val').textContent = State.score;
  },
  updateScore() {
    document.getElementById('score-val').textContent = State.score;
  }
};


/* ══════════════════════════════════════════════════════════════
   8. QUEUE RENDERER
   Characters are positioned absolutely over the scene SVG.
   Queue runs horizontally across the lower open floor area.
   Position is calculated based on viewport size and scene layout.
══════════════════════════════════════════════════════════════ */
const QueueRenderer = {

  /* Compute the pixel positions for each queue slot */
  getSlotPositions() {
    const vw = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    /* Layout viewport only — matches coords for position:absolute inside fixed #screen-game */
    const vh = Math.max(320, window.innerHeight || document.documentElement.clientHeight || 320);
    const scen = State.scenario;
    const layout = QUEUE_LAYOUT[scen] || QUEUE_LAYOUT.airport;

    /* Keep slots between top HUD / ribbon and bottom bar + character stack (~170px) */
    const topReserve = Math.min(vh * 0.2, 130);
    const bottomReserve = Math.min(vh * 0.24, 200);
    const yRaw = vh * layout.yPct;
    const y = Math.max(topReserve + 40, Math.min(yRaw, vh - bottomReserve));
    const n = State.chars.length;
    const charW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--char-w')) || 72;

    /* Distribute slots evenly across width with padding */
    const totalW = vw - 32;
    const step = Math.min(layout.xStepPct * vw, (totalW - charW) / Math.max(n - 1, 1));
    const startX = (vw - (step * (n - 1) + charW)) / 2 + charW / 2;

    return State.chars.map((_, i) => ({
      x: startX + i * step,
      y: y,
    }));
  },

  render(preserveExisting = false) {
    const field = document.getElementById('char-field');
    const slotsEl = document.getElementById('queue-slots');
    const positions = this.getSlotPositions();
    const charW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--char-w')) || 72;

    /* ── Slot markers (dashed circles on floor) ── */
    slotsEl.innerHTML = '';
    positions.forEach((pos, i) => {
      const m = document.createElement('div');
      m.className = 'slot-marker';
      m.style.left = pos.x + 'px';
      m.style.top = pos.y + 'px';
      m.innerHTML = `<span class="slot-num">${i + 1}</span>`;
      slotsEl.appendChild(m);
    });

    if (preserveExisting) {
      /* Quick update — just reposition + update state visuals */
      State.chars.forEach((c, i) => {
        const el = field.querySelector(`[data-char-id="${c.id}"]`);
        if (!el) return;
        const pos = positions[i];
        el.style.left = (pos.x - charW / 2) + 'px';
        el.style.top = (pos.y - 90) + 'px';
        el.dataset.pos = i;
        el.dataset.state = c.state;

        /* Update badge */
        const badge = el.querySelector('.char-badge');
        if (badge) badge.textContent = i + 1;

        /* Update SVG face */
        const svgWrap = el.querySelector('.char-svg-wrap');
        if (svgWrap) svgWrap.innerHTML = CharArt.build(c.artConfig, c.state);

        /* Update label */
        const lbl = el.querySelector('.char-label');
        if (lbl) {
          lbl.style.borderColor = this.stateColor(c.state);
        }

        /* Update bubble */
        const oldBub = el.querySelector('.speech-bub');
        if (oldBub) oldBub.remove();
        if (c.state !== 'happy' && c.bubble) {
          const bub = document.createElement('div');
          bub.className = `speech-bub ${c.state}`;
          bub.textContent = c.bubble;
          el.appendChild(bub);
        }

        if (i === State.drag.srcPos && State.drag.active) {
          el.classList.add('is-dragging');
        } else {
          el.classList.remove('is-dragging');
        }
      });
      return;
    }

    /* Full re-render */
    field.innerHTML = '';

    State.chars.forEach((c, i) => {
      const pos = positions[i];
      const piece = document.createElement('div');
      piece.className = 'char-piece char-enter';
      piece.dataset.charId = c.id;
      piece.dataset.pos = i;
      piece.dataset.state = c.state;
      piece.style.left = (pos.x - charW / 2) + 'px';
      piece.style.top = (pos.y - 90) + 'px';
      piece.style.animationDelay = (i * 0.07) + 's';

      piece.innerHTML = `
        <div class="char-badge">${i + 1}</div>
        <div class="char-svg-wrap">${CharArt.build(c.artConfig, c.state)}</div>
        <div class="char-label" style="border-color:${this.stateColor(c.state)}">
          <span class="char-label-name">${c.name}</span>
          <span class="char-label-excuse">${c.excuse}</span>
        </div>
      `;

      if (c.state !== 'happy' && c.bubble) {
        const bub = document.createElement('div');
        bub.className = `speech-bub ${c.state}`;
        bub.textContent = c.bubble;
        piece.appendChild(bub);
      }

      field.appendChild(piece);
    });

    /* Attach drag handlers */
    DragEngine.attach();
  },

  stateColor(state) {
    if (state === 'happy') return '#7B9E87';
    if (state === 'sad') return '#C4A45A';
    if (state === 'angry') return '#C4756A';
    return 'transparent';
  }
};


/* ══════════════════════════════════════════════════════════════
   9. DRAG ENGINE
   Characters can be dragged to any position in the queue.
   No snapping back — placement is always accepted.
   Feedback comes only via expression change.
══════════════════════════════════════════════════════════════ */
const DragEngine = {
  _onDownBound: null,

  attach() {
    const field = document.getElementById('char-field');
    if (!this._onDownBound) {
      this._onDownBound = this.onDown.bind(this);
      field.addEventListener('pointerdown', this._onDownBound);
    }
  },

  onDown(e) {
    const piece = e.target.closest('.char-piece');
    if (!piece) return;
    e.preventDefault();

    const charId = +piece.dataset.charId;
    const srcPos = +piece.dataset.pos;
    const rect = piece.getBoundingClientRect();

    window.GameAudio?.play('pickup');

    State.drag.active = true;
    State.drag.charId = charId;
    State.drag.srcPos = srcPos;
    State.drag.offX = e.clientX - rect.left;
    State.drag.offY = e.clientY - rect.top;

    /* Build ghost */
    const ghost = piece.cloneNode(true);
    ghost.id = 'drag-ghost';
    ghost.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:${rect.width}px;
      left:${e.clientX - State.drag.offX}px;
      top:${e.clientY - State.drag.offY}px;
    `;
    ghost.querySelector('.speech-bub')?.remove();
    document.body.appendChild(ghost);
    State.drag.ghostEl = ghost;

    piece.classList.add('is-dragging');

    window.addEventListener('pointermove', this._moveHandler = this.onMove.bind(this));
    window.addEventListener('pointerup', this._upHandler = this.onUp.bind(this));
    window.addEventListener('pointercancel', this._upHandler);
  },

  onMove(e) {
    if (!State.drag.active) return;
    const d = State.drag;
    d.ghostEl.style.left = (e.clientX - d.offX) + 'px';
    d.ghostEl.style.top = (e.clientY - d.offY) + 'px';

    /* Highlight closest slot */
    const positions = QueueRenderer.getSlotPositions();
    const charW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--char-w')) || 72;
    let closest = null, bestDist = Infinity;

    positions.forEach((pos, i) => {
      const cx = pos.x, cy = pos.y;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy + 45);
      if (dist < bestDist) { bestDist = dist; closest = i; }
    });

    /* Swap in array if hovering different slot */
    if (closest !== null && closest !== d.srcPos && bestDist < 90) {
      const arr = State.chars;
      const fromIdx = arr.findIndex(c => c.id === d.charId);
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(closest, 0, moved);
      d.srcPos = closest;
      QueueRenderer.render(true);
    }

    /* Highlight active slot marker */
    document.querySelectorAll('.slot-marker').forEach((m, i) => {
      m.classList.toggle('active', i === closest && bestDist < 90);
    });
  },

  onUp(e) {
    if (!State.drag.active) return;
    State.drag.active = false;

    window.GameAudio?.play('drop');

    State.drag.ghostEl?.remove();
    State.drag.ghostEl = null;

    document.querySelectorAll('.char-piece.is-dragging').forEach(p => p.classList.remove('is-dragging'));
    document.querySelectorAll('.slot-marker.active').forEach(m => m.classList.remove('active'));

    window.removeEventListener('pointermove', this._moveHandler);
    window.removeEventListener('pointerup', this._upHandler);
    window.removeEventListener('pointercancel', this._upHandler);

    /* Evaluate and re-render */
    Evaluator.run();
    QueueRenderer.render(false);
  }
};


/* ══════════════════════════════════════════════════════════════
   10. EVALUATOR — expression feedback per position
══════════════════════════════════════════════════════════════ */
const Evaluator = {
  run() {
    const chars = State.chars;
    if (!chars.length) return 0;
    clearEvalWinTimer();
    const sorted = [...chars].sort((a, b) => a.priority - b.priority);
    let happyCount = 0;

    chars.forEach((c, i) => {
      const correctIdx = sorted.indexOf(c);
      const delta = Math.abs(i - correctIdx);

      if (delta === 0) {
        c.state = 'happy'; c.bubble = null; happyCount++;
      } else if (delta === 1) {
        c.state = 'sad'; c.bubble = c.sadMsg;
      } else {
        c.state = 'angry'; c.bubble = c.angryMsg;
      }
    });

    const pct = Math.round(happyCount / chars.length * 100);
    this.updateBar(pct);

    if (pct === 100) {
      const gid = State.gameId;
      evalWinTimer = setTimeout(() => {
        evalWinTimer = null;
        if (gid === State.gameId && State.screen === 'screen-game') this.winLevel();
      }, 700);
    }
    return pct;
  },

  updateBar(pct) {
    const fill = document.getElementById('harmony-fill');
    const label = document.getElementById('harmony-label');
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.backgroundPosition = ((100 - pct) * 2) + '% 0';
    }
    if (label) label.textContent = pct + '%';
  },

  winLevel() {
    const scen = SCENARIOS[State.scenario];
    if (!scen || !State.chars.length) return;
    const isLast = State.levelIdx >= scen.levels.length - 1;
    const pts = State.chars.length * 20;
    State.score += pts;
    HUD.updateScore();

    if (isLast) {
      document.getElementById('ov-total').textContent = State.score;
      document.getElementById('overlay-done').classList.remove('hidden');
    } else {
      document.getElementById('ov-pts-val').textContent = pts;
      document.getElementById('ov-title').textContent = this.winPhrase();
      /* Show happy mini-chars in overlay */
      const row = document.getElementById('ov-chars');
      row.innerHTML = '';
      State.chars.slice(0, 5).forEach(c => {
        row.innerHTML += CharArt.build(c.artConfig, 'happy');
      });
      document.getElementById('overlay-win').classList.remove('hidden');
    }
    window.GameAudio?.play('win');
  },

  winPhrase() {
    const phrases = [
      'Queue Sorted! 🎉',
      'Order Restored! ✨',
      'Perfectly Lined Up! 🌟',
      'Queue Genius! 🏆',
      'That\'s the Queue! 👏',
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
};


/* ══════════════════════════════════════════════════════════════
   11. UTILITIES
══════════════════════════════════════════════════════════════ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


/* ══════════════════════════════════════════════════════════════
   12. INIT — wire up all buttons
══════════════════════════════════════════════════════════════ */
(function init() {

  /* Title → Select */
  document.getElementById('btn-title-play').addEventListener('click', () => {
    window.GameAudio?.play('click');
    Screens.goSelect();
  });

  /* Scenario cards */
  document.querySelectorAll('.scen-card').forEach(card => {
    card.addEventListener('click', () => {
      window.GameAudio?.play('click');
      State.score = 0;
      Screens.goGame(card.dataset.scenario, 0);
    });
  });

  /* Back button (game → select) */
  document.getElementById('btn-back').addEventListener('click', () => {
    window.GameAudio?.play('click');
    clearEvalWinTimer();
    Screens.goSelect();
  });

  /* Win overlay — next level */
  document.getElementById('btn-next').addEventListener('click', () => {
    document.getElementById('overlay-win').classList.add('hidden');
    clearEvalWinTimer();
    const scen = SCENARIOS[State.scenario];
    const next = State.levelIdx + 1;
    if (!scen || next >= scen.levels.length) {
      Screens.goSelect();
      return;
    }
    Screens.goGame(State.scenario, next);
  });

  /* Win overlay — menu */
  document.getElementById('btn-menu').addEventListener('click', () => {
    document.getElementById('overlay-win').classList.add('hidden');
    clearEvalWinTimer();
    Screens.goSelect();
  });

  /* Done overlay — play again */
  document.getElementById('btn-again').addEventListener('click', () => {
    document.getElementById('overlay-done').classList.add('hidden');
    State.score = 0;
    Screens.goGame(State.scenario, 0);
  });

  /* Done overlay — menu */
  document.getElementById('btn-menu2').addEventListener('click', () => {
    document.getElementById('overlay-done').classList.add('hidden');
    clearEvalWinTimer();
    Screens.goSelect();
  });

  function repositionGame() {
    if (State.screen === 'screen-game') {
      QueueRenderer.render(State.drag.active);
    }
  }
  window.addEventListener('resize', repositionGame);
  window.visualViewport?.addEventListener('resize', repositionGame);
  window.visualViewport?.addEventListener('scroll', repositionGame);

  /* Start */
  Screens.goTitle();

  /* Sound Effects */
  const sounds = {
    pickup: new Audio('a_cute_pick_up_voice_#3-1775118509839.mp3'),
    drop: new Audio('a_cute_drop_voice_fo_#3-1775118574501.mp3'),
    click: new Audio('click.mp3'),
    win: new Audio('a_cute_light_soft_dr_#3-1775119108282.mp3')
  };

  function playSound(key) {
    const s = sounds[key];
    if (s) {
      s.currentTime = 0;
      s.play().catch(e => { });
    }
  }
window.addEventListener('load', () => {
  const music = document.getElementById('bg-music');

  // Try autoplay
  music.volume = 0.5;
  music.play().catch(() => {
    // If autoplay blocked, start on first user interaction
    document.addEventListener('click', () => {
      music.play();
    }, { once: true });
  });
});
  /* Expose playSound to other modules */
  window.GameAudio = { play: playSound };

})();
