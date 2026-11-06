"use strict";
/* ===== Song data ===== */
const BPM = 96, B = 60 / BPM, LINE = 8; // beats per lyric line
const CH = { G: [55, 0], C: [48, 0], D: [50, 0], Em: [52, 1], Am: [57, 1] };
const CHORUS = [
  "Oh, happy birthday, Diana!", "Lift your voices, sing it loud!",
  "The best mama in the whole wide world,", "Lord, you know she makes me proud!",
  "Happy birthday, Diana Acker,", "Heaven smiled the day you came.",
  "Ain't nobody like my mama,", "Gonna shout her name!"
];
const SECTIONS = [
  { id: "intro", label: "Intro", pre: 8, drums: "stomp", chords: ["G", "G", "C", "G"], slide: 1,
    lines: ["Mmm, yeah…", "Gather 'round now, y'all…", "Let me tell you 'bout my mama…"] },
  { id: "verse1", label: "Verse 1", banner: "☀️ ROAD TRIP WITH MAMA ☀️", drums: "full", chords: ["G", "C", "G", "D"], lines: [
    "Mornin' sun on the dashboard glow,", "94.7 on the radio,", "JB and Sandy crackin' jokes all day,", "And Mama laughin' all the way.",
    "She was the smartest woman that I knew,", "Funny as the day was blue,", "She raised me up on rock 'n' roll and grace,",
    "With a twinkle in her eye and a smile upon her face."] },
  { id: "chorus", label: "Chorus", banner: "🔥 SING IT, CHOIR! 🔥", drums: "full", choir: 1, chords: ["C", "G", "Em", "D"],
    lines: [...CHORUS, "(Diana! Diana!)"] },
  { id: "verse2", label: "Verse 2", banner: "🤘 ROCK 'N' ROLL MAMA 🤘", pre: 8, slide: 1, drums: "rock", chords: ["Em", "C", "G", "D"], lines: [
    "Turn it up when the guitars scream,", "Aerosmith and AC/DC,", "Metallica shakin' the windowpane,", "She'd rock out singin' in the pourin' rain.",
    "She didn't teach me just to sit up straight,", "She taught me how to feel the music, how to celebrate,",
    "Every song was a sermon, every ride was a prayer,", "With the volume up high and the wind in her hair."] },
  { id: "chorus2", label: "Chorus", banner: "🔥 ONE MORE TIME! 🔥", drums: "full", choir: 1, chords: ["C", "G", "Em", "D"], lines: CHORUS },
  { id: "bridge", label: "Bridge — the getaway", banner: "🚨 THE GREAT TP GETAWAY 🚨", pre: 4, drums: "claps", talk: 1, chords: ["Em", "C", "G", "D"], lines: [
    "Toilet paper flyin' 'cross the Brauels' yard,", "Rolls in the trees, we were workin' hard,", "Then we heard a door, and she yelled, \"Get in!\"",
    "And Mama hit that gas with a devilish grin!", "Like a NASCAR driver outrunnin' hell itself,", "Tires squealin', laughin' like nobody else,",
    "Hearts poundin', tears rollin' down,", "Best getaway in the whole dang town!"] },
  { id: "build", label: "Build", banner: "🙌 HERE WE GO 🙌", drums: "full", choir: 1, chords: ["C", "D", "Em", "D"], lines: [
    "And I'd do it all again,", "Every song, every mile, every grin,", "'Cause the greatest gift I ever had",
    "Was the love of my mama, and the times we had!"] },
  { id: "final", label: "Final Chorus — KEY CHANGE", banner: "⚡ KEY CHANGE!!! ⚡", pre: 4, key: 2, drums: "rock", choir: 1, chords: ["C", "G", "Em", "D"],
    lines: [...CHORUS, "(Diana! Diana! Ohhh, Diana!)"] },
  { id: "outro", label: "Outro", banner: "🌅", drums: "none", chords: ["G", "C", "G", "G"], post: 8, lines: [
    "Happy birthday, Mama…", "Thank you for the music…", "Thank you for the laughter…", "And thank you for the getaway car.", "Mmm… I love you, Mama."] }
];

/* Family photos per section (public/photos) */
const PH = n => `photos/p${String(n).padStart(2, "0")}.jpg`;
const PHOTOS = { intro: [8, 12], verse1: [2, 1, 11, 3], chorus: [4, 14, 9, 7], verse2: [6, 15, 2], chorus2: [13, 11, 7, 3],
  bridge: [10, 5], build: [12, 8, 14], final: [9, 13, 4, 6, 7, 2], outro: [15, 5, 12, 8] };

/* ===== Timeline ===== */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const PENTA = [0, 2, 4, 7, 9];
const lines = [], sections = [];
let songEnd = 0;
(function build() {
  let beat = 0, rand = rng(1947);
  for (const s of SECTIONS) {
    const start = beat;
    beat += s.pre || 0;
    const key = s.key || 0;
    s.lines.forEach((text, li) => {
      const shout = text.startsWith("(");
      const ws = text.split(/\s+/);
      const span = shout ? 6 : 6.5, step = Math.min(1, span / ws.length);
      const bar = Math.floor((beat - start) / 4);
      let deg = 2 + Math.floor(rand() * 3);
      const words = ws.map((w, i) => {
        if (!shout) deg = Math.max(0, Math.min(8, deg + Math.round((rand() - .5) * (s.talk ? 1.4 : 3))));
        if (i === ws.length - 1 && !shout) deg = 5; // land on the tonic
        const midi = 55 + key + Math.floor(deg / 5) * 12 + PENTA[deg % 5] - 12 * (deg >= 5 && s.talk ? 1 : 0);
        return { w, t: (beat + 0.5 + i * (shout ? 1.5 : step)) * B, d: step * B * .9, midi };
      });
      lines.push({ sec: sections.length, text, shout, start: beat * B, end: (beat + LINE) * B, words, li, bar });
      beat += LINE;
    });
    beat += s.post || 0;
    sections.push({ ...s, start: start * B, end: beat * B, startBeat: start, endBeat: beat });
  }
  songEnd = beat * B;
})();

/* ===== Audio ===== */
let ctx, master, noise, events = [], evIdx = 0, T0 = 0, timer = null;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function env(g, t, a, peak, d, sus = 0.0001) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d);
}
function osc(type, f, t, end, dest) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(end); return o; }
function gain(dest, v = 1) { const g = ctx.createGain(); g.gain.value = v; g.connect(dest); return g; }
function filt(type, f, q, dest) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(dest); return b; }
function noiseSrc(t, dur, dest) { const n = ctx.createBufferSource(); n.buffer = noise; n.connect(dest); n.start(t, Math.random() * .5); n.stop(t + dur); }

const I = {
  stomp(t, v = 1) {
    const g = gain(master); env(g, t, .004, .9 * v, .28);
    const o = osc("sine", 160, t, t + .35, g); o.frequency.exponentialRampToValueAtTime(42, t + .14);
    const g2 = gain(master); env(g2, t, .002, .35 * v, .08); noiseSrc(t, .1, filt("lowpass", 500, 1, g2));
  },
  clap(t, v = 1) {
    const g = gain(master); const f = filt("bandpass", 1300, .9, g);
    g.gain.setValueAtTime(0.0001, t);
    [0, .011, .022].forEach(o => { g.gain.setValueAtTime(.55 * v, t + o); g.gain.exponentialRampToValueAtTime(.08, t + o + .009); });
    g.gain.setValueAtTime(.45 * v, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + .2);
    noiseSrc(t, .22, f);
  },
  hat(t, v = 1) { const g = gain(master); env(g, t, .001, .12 * v, .05); noiseSrc(t, .07, filt("highpass", 7000, 1, g)); },
  crash(t) { const g = gain(master); env(g, t, .002, .25, 1.6); noiseSrc(t, 1.7, filt("highpass", 4000, .5, g)); },
  bass(t, m, d) {
    const g = gain(master); env(g, t, .01, .38, d, .05); g.gain.setValueAtTime(.05, t + d); g.gain.exponentialRampToValueAtTime(.0001, t + d + .08);
    const f = filt("lowpass", 420, 2, g); osc("triangle", mtof(m), t, t + d + .1, f); osc("sawtooth", mtof(m), t, t + d + .1, gain(f, .3));
  },
  strum(t, ch, key, d, v = 1, down = 1) {
    const [r, minor] = CH[ch], root = r + key, notes = [root, root + 7, root + 12, root + 12 + (minor ? 3 : 4), root + 19, root + 24];
    const g = gain(master, .06 * v); const f = filt("lowpass", 2600, .7, g);
    (down ? notes : notes.slice().reverse()).forEach((n, i) => {
      const s = t + i * .012, ng = gain(f); env(ng, s, .004, 1, d * .9, .0001);
      osc("sawtooth", mtof(n), s, s + d, ng);
    });
  },
  pad(t, ch, key, d, choir) {
    const [r, minor] = CH[ch], root = r + key + 12, notes = [root, root + (minor ? 3 : 4), root + 7, root + 12];
    const g = gain(master); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(choir ? .09 : .05, t + .25);
    g.gain.setValueAtTime(choir ? .09 : .05, t + d - .1); g.gain.exponentialRampToValueAtTime(.0001, t + d + .2);
    const dest = choir ? filt("bandpass", 820, 1.4, g) : filt("lowpass", 1400, .5, g);
    const f2 = choir ? filt("bandpass", 1180, 2, g) : null; // second "aah" formant
    notes.forEach(n => [1, .996].forEach(det => { const o = osc("sawtooth", mtof(n) * det, t, t + d + .3, dest); if (f2) o.connect(f2); }));
  },
  slide(t, from, to, d) {
    const g = gain(master); env(g, t, .02, .14, d, .03); g.gain.setValueAtTime(.03, t + d); g.gain.exponentialRampToValueAtTime(.0001, t + d + .15);
    const sh = ctx.createWaveShaper(); const c = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; c[i] = Math.tanh(x * 3); } sh.curve = c;
    const f = filt("lowpass", 2200, 3, g); sh.connect(f);
    const o = osc("sawtooth", mtof(from), t, t + d + .2, sh); o.frequency.exponentialRampToValueAtTime(mtof(to), t + .18);
    const lfo = osc("sine", 5.5, t, t + d + .2, gain(o.frequency, mtof(to) * .012));
  },
  voice(t, m, d, talk) { // the legendary gravel kazoo
    const g = gain(master); env(g, t, .02, talk ? .07 : .11, d, .05); g.gain.setValueAtTime(.05, t + d); g.gain.exponentialRampToValueAtTime(.0001, t + d + .1);
    const f1 = filt("bandpass", 650, 4, g), f2 = filt("bandpass", 1150, 5, g);
    const o = osc("sawtooth", mtof(m) * .97, t, t + d + .15, f1); o.connect(f2);
    o.frequency.exponentialRampToValueAtTime(mtof(m), t + .06); // scoop up into the note
    osc("sine", 6, t, t + d + .15, gain(o.frequency, mtof(m) * .015));
    const gr = gain(f1, .05); noiseSrc(t, d, gr); // gravel
  },
  shout(t) {
    const g = gain(master); env(g, t, .02, .3, .35);
    const f = filt("bandpass", 900, 1.5, g); f.frequency.exponentialRampToValueAtTime(600, t + .35);
    for (let i = 0; i < 6; i++) osc("sawtooth", 180 + Math.random() * 160, t + Math.random() * .03, t + .45, f);
    noiseSrc(t, .4, gain(f, .6));
  }
};

function addEv(t, fn) { events.push({ t, fn }); }
function compose() {
  events = [];
  for (const s of sections) {
    const key = s.key || 0;
    for (let b = s.startBeat; b < s.endBeat; b++) {
      const t = b * B, rel = b - s.startBeat, bar = Math.floor(rel / 4), bb = rel % 4;
      const ch = s.chords[bar % s.chords.length];
      const root = CH[ch][0] + key - 12;
      // drums
      if (s.drums !== "none") {
        if (bb % 2 === 0 && s.drums !== "claps") addEv(t, () => I.stomp(T0 + t, s.drums === "rock" ? 1.1 : 1));
        if (bb % 2 === 1) addEv(t, () => I.clap(T0 + t, s.drums === "claps" ? .8 : 1));
        if (s.drums === "rock") { addEv(t + B / 2, () => I.hat(T0 + t + B / 2)); addEv(t, () => I.hat(T0 + t, .7)); if (bb === 2) addEv(t + B / 2, () => I.stomp(T0 + t + B / 2, .7)); }
        if (s.drums === "full") addEv(t + B / 2, () => I.hat(T0 + t + B / 2, .6));
      }
      if (rel === 0 && (s.choir || s.id === "final" || s.id === "verse2")) addEv(t, () => I.crash(T0 + t));
      // guitar & bass
      if (s.drums === "claps") { if (bb === 0) addEv(t, () => I.strum(T0 + t, ch, key, B * 3.5, .6)); }
      else if (s.drums === "none") { if (bb === 0 || bb === 2) addEv(t, () => I.strum(T0 + t, ch, key, B * 2.2, .7)); }
      else {
        addEv(t, () => I.strum(T0 + t, ch, key, B * .9, 1, 1));
        if (bb !== 0) addEv(t + B / 2, () => I.strum(T0 + t + B / 2, ch, key, B * .45, .6, 0));
        addEv(t, () => I.bass(T0 + t, bb === 3 ? root + 7 : root, B * .8));
      }
      if ((s.choir || s.id === "outro") && bb === 0) addEv(t, () => I.pad(T0 + t, ch, key, B * 4, !!s.choir));
      // slide guitar licks in the pre-roll and line gaps
      if (s.slide && rel < (s.pre || 0) && bb === 0) addEv(t, () => I.slide(T0 + t, root + 22, root + 24, B * 1.6));
      if (s.slide && rel < (s.pre || 0) && bb === 2) addEv(t, () => I.slide(T0 + t, root + 29, root + 31, B * 1.4));
      if (s.id === "build" && b === s.endBeat - 1) [0, .25, .5, .75].forEach(o => addEv(t + o * B, () => I.stomp(T0 + t + o * B, .9)));
    }
  }
  const endT = songEnd - 8 * B;
  addEv(endT, () => I.strum(T0 + endT, "G", 0, 6, .9)); addEv(endT, () => I.slide(T0 + endT, 72, 74, 4));
  for (const l of lines) for (const w of l.words) addEv(w.t, l.shout ? () => I.shout(T0 + w.t) : () => I.voice(T0 + w.t, w.midi, w.d, sections[l.sec].talk));
  events.sort((a, b) => a.t - b.t);
}

function pump() {
  const now = ctx.currentTime - T0;
  while (evIdx < events.length && events[evIdx].t < now + .25) { const e = events[evIdx++]; if (e.t > now - .05) e.fn(); }
}

function startAudio() {
  if (ctx) ctx.close();
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ctx.destination);
  master = gain(comp, .8);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  compose(); evIdx = 0; T0 = ctx.currentTime + .3;
  clearInterval(timer); timer = setInterval(pump, 40); pump();
}

/* ===== Visuals ===== */
const $ = id => document.getElementById(id);
const cv = $("fx"), cx = cv.getContext("2d");
let W, H, parts = [];
function resize() { const r = devicePixelRatio || 1; W = innerWidth; H = innerHeight; cv.width = W * r; cv.height = H * r; cx.setTransform(r, 0, 0, r, 0, 0); }
addEventListener("resize", resize); resize();
const COLORS = ["#ff004c", "#ffd400", "#00d26a", "#00b3ff", "#ff7bd5", "#ff9f00", "#fff"];
const pick = a => a[Math.random() * a.length | 0];

function firework(x = Math.random() * W, y = H * (.12 + Math.random() * .3)) {
  const c = pick(COLORS);
  for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, s = 2 + Math.random() * 5; parts.push({ k: "spark", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 70, c }); }
}
function confetti(n = 6) { for (let i = 0; i < n; i++) parts.push({ k: "conf", x: Math.random() * W, y: -10, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6, life: 400, c: pick(COLORS) }); }
function rain(n = 8) { for (let i = 0; i < n; i++) parts.push({ k: "rain", x: Math.random() * W * 1.2, y: -20, vx: -3, vy: 16, life: 90 }); }
function tp(n = 2) { for (let i = 0; i < n; i++) parts.push({ k: "tp", x: Math.random() * W, y: H + 20, vx: (Math.random() - .5) * 6, vy: -10 - Math.random() * 6, r: 0, life: 160, trail: [] }); }
function emoji(e, n = 1) { for (let i = 0; i < n; i++) parts.push({ k: "emo", e, x: Math.random() * W, y: H + 30, vx: (Math.random() - .5) * 1.5, vy: -1.5 - Math.random() * 2, life: 500, s: 24 + Math.random() * 30 }); }

function drawParts() {
  cx.clearRect(0, 0, W, H);
  parts = parts.filter(p => p.life-- > 0 && p.y < H + 60 && p.y > -80);
  for (const p of parts) {
    p.x += p.vx; p.y += p.vy;
    if (p.k === "spark") { p.vy += .08; p.vx *= .98; cx.globalAlpha = p.life / 70; cx.fillStyle = p.c; cx.fillRect(p.x, p.y, 3, 3); }
    else if (p.k === "conf") { p.r += .1; cx.globalAlpha = 1; cx.fillStyle = p.c; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillRect(-4, -7, 8, 14 * Math.abs(Math.cos(p.r))); cx.restore(); }
    else if (p.k === "rain") { cx.globalAlpha = .5; cx.strokeStyle = "#9cf"; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x + 3, p.y - 16); cx.stroke(); }
    else if (p.k === "tp") {
      p.vy += .25; p.r += .2; p.trail.push([p.x, p.y]); if (p.trail.length > 30) p.trail.shift();
      cx.globalAlpha = 1; cx.strokeStyle = "#fff"; cx.lineWidth = 6; cx.beginPath(); p.trail.forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); cx.stroke(); cx.lineWidth = 1;
      cx.fillStyle = "#f4f4f4"; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillRect(-10, -12, 20, 24); cx.fillStyle = "#c9b79c"; cx.fillRect(-4, -12, 8, 24); cx.restore();
    }
    else if (p.k === "emo") { cx.globalAlpha = Math.min(1, p.life / 100); cx.font = p.s + "px serif"; cx.fillText(p.e, p.x, p.y); p.x += Math.sin(p.y / 40); }
  }
  cx.globalAlpha = 1;
}

const singer = { head: $("head"), arm: $("arm"), leg: $("legR"), mouth: $("mouthG"), brows: $("brows"), stage: $("stage") };
const lineEl = $("line"), nextEl = $("next"), secEl = $("section"), shoutEl = $("shout"), bannerEl = $("banner"), choirEls = [...document.querySelectorAll(".cm")];
let curLine = -1, curSec = -1, curWord = -1, lastBeat = -1, playing = false, paused = false, spin = 0;

function pop(text) { shoutEl.textContent = text; shoutEl.classList.remove("pop"); void shoutEl.offsetWidth; shoutEl.classList.add("pop"); }
function banner(text) { bannerEl.textContent = text; bannerEl.classList.remove("show"); void bannerEl.offsetWidth; bannerEl.classList.add("show"); }
function flash(a = .9) { $("flash").animate([{ opacity: a }, { opacity: 0 }], { duration: 400 }); }
function flyPlane() {
  const p = $("plane"); p.classList.remove("go"); void p.offsetWidth; p.classList.add("go");
  pop("✈️ CAPTAIN MAMA! ✈️");
  if (ctx) { // engine buzz with a fly-by doppler swoop
    const t = ctx.currentTime, g = gain(master); g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(.12, t + 2); g.gain.exponentialRampToValueAtTime(.0001, t + 7);
    const o = osc("sawtooth", 70, t, t + 7.1, filt("lowpass", 600, 2, g));
    o.frequency.linearRampToValueAtTime(95, t + 3); o.frequency.linearRampToValueAtTime(60, t + 7);
    osc("square", 28, t, t + 7.1, gain(o.frequency, 8)); // propeller chop
  }
}
function driveCar() { const c = $("car"); c.classList.remove("go"); void c.offsetWidth; c.classList.add("go"); }

let phFlip = 0;
function showPhoto(n) {
  const a = $("ph" + phFlip), b = $("ph" + (phFlip ^ 1));
  b.onload = () => { b.classList.remove("on"); void b.offsetWidth; b.classList.add("on"); a.classList.remove("on"); };
  b.src = PH(n); phFlip ^= 1;
}
function polaroid(n, side) {
  const d = document.createElement("div"); d.className = "polaroid fly";
  d.style.setProperty("--r", (side ? 8 : -8) + "deg"); d.style[side ? "right" : "left"] = "3vw"; d.style.top = "14vh";
  d.innerHTML = `<img src="${PH(n)}" alt="">`; document.body.appendChild(d); setTimeout(() => d.remove(), 4300);
}

function setLine(i) {
  const l = lines[i];
  lineEl.className = l && l.shout ? "shoutline" : "";
  lineEl.innerHTML = l ? l.words.map(w => `<span>${w.w.replace(/</g, "&lt;")}</span>`).join(" ") : "";
  const n = lines[i + 1]; nextEl.textContent = n ? n.text : "";
}

function enterSection(i) {
  const s = sections[i];
  document.body.className = "s-" + s.id;
  secEl.textContent = s.label;
  if (s.banner) banner(s.banner);
  if (s.id === "final") { flash(1); for (let k = 0; k < 5; k++) setTimeout(() => firework(), k * 150); }
  if (s.id === "bridge") tp(6);
}

function onLine(l) {
  const s = sections[l.sec], ps = PHOTOS[s.id];
  if (ps) showPhoto(ps[l.li % ps.length]);
  if (s.id === "bridge") { if (l.li === 0 || l.li === 1) tp(8); if (l.li >= 2) driveCar(); }
  if ((s.id === "verse2" && (l.li === 0 || l.li === 6)) || (s.id === "final" && (l.li === 1 || l.li === 6)) || (s.id === "build" && l.li === 1) || (s.id === "intro" && l.li === 2)) flyPlane();
  if (s.id === "verse2" && l.li === 0) polaroid(6, 1); // Rock & Roll Hall of Fame
  if (s.id === "verse1" && l.li === 4) polaroid(1, 0); // smartest woman I knew
  if (s.id === "chorus" && l.li === 2) polaroid(13, 1);
  if (s.id === "build" && l.li === 3) polaroid(12, 0); // the best place to be is together
  if (s.id === "outro" && l.li === 4) polaroid(8, 1);
  if (s.id === "verse2" && l.li === 1) { pop("AC/DC!"); flash(.7); }
  if (s.id === "verse2" && l.li === 2) pop("🤘METALLICA🤘");
  if (s.id === "verse1" && l.li === 1) pop("94.7!");
  if (s.id === "outro") emoji(pick(["❤️", "💖", "🎵", "🎸", "🚗"]), 4);
}

function onWord(l, w) {
  const clean = w.w.replace(/[^A-Za-z]/g, "").toLowerCase();
  if (clean === "diana" || l.shout) { pop(l.shout ? "DIANA!" : "DIANA!"); choirEls.forEach(c => { c.classList.add("yell"); setTimeout(() => c.classList.remove("yell"), 350); }); firework(); }
  if (clean === "nascar") pop("🏁 NASCAR 🏁");
  if (clean === "gas" || clean === "squealin") { pop("SKRRRT!"); document.body.classList.add("shake"); setTimeout(() => document.body.classList.remove("shake"), 260); }
  if (clean === "heaven") flash(.5);
  if (clean === "acker") pop("ACKER!!!");
  if (clean === "aerosmith") pop("AEROSMITH!");
}

function frame() {
  if (!playing) return;
  requestAnimationFrame(frame);
  const t = ctx.currentTime - T0;
  if (t < 0) return;
  if (t > songEnd) { finish(); return; }
  // section & line
  let si = sections.findIndex(s => t >= s.start && t < s.end);
  if (si !== curSec && si >= 0) { curSec = si; enterSection(si); }
  let li = lines.findIndex(l => t >= l.start - B && t < l.end - B);
  if (li === -1) li = curLine;
  if (li !== curLine) { curLine = li; curWord = -1; setLine(li); if (lines[li]) onLine(lines[li]); }
  const L = lines[curLine], s = sections[curSec];
  let open = 0;
  if (L) {
    let wi = -1; L.words.forEach((w, i) => { if (t >= w.t) wi = i; });
    if (wi !== curWord && wi >= 0) { curWord = wi; const spans = lineEl.children; for (let k = 0; k < spans.length; k++) spans[k].classList.toggle("on", k === wi); onWord(L, L.words[wi]); }
    if (wi >= 0) { const w = L.words[wi]; const dt = t - w.t; open = dt < w.d ? Math.max(.3, 1 - dt / (w.d * 1.4)) : 0; }
  }
  // beat-driven body
  const bpos = t / B, ph = bpos % 1, beatN = Math.floor(bpos);
  const hype = s && (s.choir || s.id === "verse2" || s.id === "final") ? 1.6 : s && s.id === "outro" ? .4 : 1;
  singer.head.style.transform = `rotate(${Math.sin(bpos * Math.PI) * 7 * hype}deg) translateY(${-Math.abs(Math.sin(bpos * Math.PI)) * 6 * hype}px)`;
  singer.mouth.style.transform = `scale(${1 + open * .6}, ${1 + open * 4.5})`;
  singer.brows.style.transform = `translateY(${-open * 7}px)`;
  const strum = (bpos * 2) % 1;
  singer.arm.style.transform = `rotate(${(strum < .5 ? strum : 1 - strum) * 50 * (s && s.drums === "none" ? .4 : 1) - 10}deg)`;
  const stompPh = (bpos % 2) / 2; // stomp on 1 & 3
  singer.leg.style.transform = `rotate(${stompPh > .7 ? -(stompPh - .7) * 70 : stompPh < .1 ? -21 + stompPh * 210 : 0}deg)`;
  if (beatN !== lastBeat) {
    lastBeat = beatN;
    const rel = beatN - (s ? s.startBeat : 0);
    if (s && (s.choir) && rel % 4 === 0) firework();
    if (s && s.id === "verse2" && rel % 8 === 0) flash(.6);
    if (s && s.id === "build" && rel % 2 === 0) firework(W / 2, H * .4);
    if (beatN % 2 === 0 && s && s.drums !== "claps" && s.drums !== "none") singer.stage.animate([{ transform: "translateX(-50%) translateY(0)" }, { transform: "translateX(-50%) translateY(6px)" }, { transform: "translateX(-50%) translateY(0)" }], { duration: 150 });
  }
  if (s) {
    if (s.id === "final") { confetti(3); spin += 1.2; document.body.style.setProperty("--spin", spin + "deg"); }
    if (s.id === "verse2") rain(6);
    if (s.id === "chorus2" && Math.random() < .05) confetti(4);
  }
  drawParts();
}

function finish() {
  playing = false; clearInterval(timer); $("end").classList.add("show");
  const heart = () => { if (playing) return; emoji(pick(["❤️", "💖", "🎂", "🎉", "🎸"]), 2); confetti(4); drawParts(); requestAnimationFrame(heart); };
  heart(); showPhoto(12);
}

(function collage() {
  const c = $("collage"); if (!c) return;
  for (let i = 1; i <= 15; i++) { const im = new Image(); im.src = PH(i); im.alt = "";
    im.style.left = ((i * 37) % 90) - 5 + "vw"; im.style.top = ((i * 53) % 85) - 5 + "vh"; im.style.transform = `rotate(${(i % 5 - 2) * 7}deg)`; c.appendChild(im); }
})();

function go() {
  $("start").style.display = "none"; $("end").classList.remove("show");
  curLine = curSec = curWord = lastBeat = -1; parts = []; paused = false; $("pause").textContent = "⏸";
  setLine(-1); startAudio(); playing = true; document.body.className = "s-intro"; frame();
}
$("play").onclick = go; $("again").onclick = go; $("restart").onclick = go;
$("pause").onclick = () => {
  if (!ctx || !playing) return;
  paused = !paused; paused ? ctx.suspend() : ctx.resume();
  $("pause").textContent = paused ? "▶" : "⏸";
};
