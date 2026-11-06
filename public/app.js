"use strict";
/* ===== Song data ===== */
// The song is public/song.m4a; word timings come from timing.js (TIMING).
const B = 60 / TIMING.bpm, BEAT0 = TIMING.beat0;
const CHORUS = [
  "Oh, happy birthday, Diana!", "Lift your voices, sing it loud!",
  "The best mama in the whole wide world,", "Lord, you know she makes me proud!",
  "Happy birthday, Diana Acker,", "Heaven smiled the day you came.",
  "Ain't nobody like my mama,", "Gonna shout her name!"
];
const SECTIONS = [
  { id: "intro", label: "Intro", drums: "stomp",
    lines: ["Mmm, yeah…", "Gather 'round now, y'all…", "Let me tell you 'bout my mama…"] },
  { id: "verse1", label: "Verse 1", banner: "☀️ ROAD TRIP WITH MAMA ☀️", drums: "full", lines: [
    "Mornin' sun on the dashboard glow,", "94.7 on the radio,", "JB and Sandy crackin' jokes all day,", "And Mama laughin' all the way.",
    "She was the smartest woman that I knew,", "Funny as the day was blue,", "She raised me up on rock 'n' roll and grace,",
    "With a twinkle in her eye and a smile upon her face."] },
  { id: "chorus", label: "Chorus", banner: "🔥 SING IT, CHOIR! 🔥", drums: "full", choir: 1,
    lines: [...CHORUS, "(Diana! Diana!)"] },
  { id: "verse2", label: "Verse 2", banner: "🤘 ROCK 'N' ROLL MAMA 🤘", drums: "rock", lines: [
    "Turn it up when the guitars scream,", "Aerosmith and AC/DC,", "Metallica shakin' the windowpane,", "She'd rock out singin' in the pourin' rain.",
    "She didn't teach me just to sit up straight,", "She taught me how to feel the music, how to celebrate,",
    "Every song was a sermon, every ride was a prayer,", "With the volume up high and the wind in her hair."] },
  { id: "chorus2", label: "Chorus", banner: "🔥 ONE MORE TIME! 🔥", drums: "full", choir: 1, lines: CHORUS },
  { id: "bridge", label: "Bridge — the getaway", banner: "🚨 THE GREAT TP GETAWAY 🚨", drums: "claps", lines: [
    "Toilet paper flyin' 'cross the Brauels' yard,", "Rolls in the trees, we were workin' hard,", "Then we heard a door, and she yelled, \"Get in!\"",
    "And Mama hit that gas with a devilish grin!", "Like a NASCAR driver outrunnin' hell itself,", "Tires squealin', laughin' like nobody else,",
    "Hearts poundin', tears rollin' down,", "Best getaway in the whole dang town!"] },
  { id: "build", label: "Build", banner: "🙌 HERE WE GO 🙌", drums: "full", choir: 1, lines: [
    "And I'd do it all again,", "Every song, every mile, every grin,", "'Cause the greatest gift I ever had",
    "Was the love of my mama, and the times we had!"] },
  { id: "final", label: "Final Chorus — KEY CHANGE", banner: "⚡ KEY CHANGE!!! ⚡", drums: "rock", choir: 1,
    lines: [...CHORUS, "(Diana! Diana! Ohhh, Diana!)"] },
  { id: "outro", label: "Outro", banner: "🌅", drums: "none", lines: [
    "Happy birthday, Mama…", "Thank you for the music…", "Thank you for the laughter…", "And thank you for the getaway car.", "Mmm… I love you, Mama."] }
];

/* Family photos per section (public/photos) */
const PH = n => `photos/p${String(n).padStart(2, "0")}.jpg`;
const PHOTOS = { intro: [8, 12], verse1: [2, 1, 11, 3], chorus: [4, 14, 9, 7], verse2: [6, 15, 2], chorus2: [13, 11, 7, 3],
  bridge: [10, 5], build: [12, 8, 14], final: [9, 13, 4, 6, 7, 2], outro: [15, 5, 12, 8] };

/* ===== Timeline (from the real recording) ===== */
const lines = [], sections = [], songEnd = TIMING.duration;
(function build() {
  let k = 0;
  SECTIONS.forEach((s, si) => {
    const first = k;
    s.lines.forEach((text, li) => {
      const ts = TIMING.lines[k++];
      const words = text.split(/\s+/).map((w, i) => ({ w, t: ts[i], d: Math.min(.6, (ts[i + 1] ?? ts[i] + .5) - ts[i]) }));
      lines.push({ sec: si, text, shout: text.startsWith("("), start: ts[0] - .3, words, li });
    });
    sections.push({ ...s, start: si ? TIMING.lines[first][0] - 1 : 0 });
  });
  lines.forEach((l, i) => { l.end = lines[i + 1] ? lines[i + 1].start : songEnd; });
  sections.forEach((s, i) => { s.end = sections[i + 1] ? sections[i + 1].start : songEnd; s.startBeat = Math.round((s.start - BEAT0) / B); });
})();
const song = document.getElementById("song");

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
  const t = song.currentTime;
  if (song.ended || t >= songEnd - .05) { finish(); return; }
  // section & line
  let si = sections.findIndex(s => t >= s.start && t < s.end);
  if (si !== curSec && si >= 0) { curSec = si; enterSection(si); }
  let li = lines.findIndex(l => t >= l.start && t < l.end);
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
  const bpos = (t - BEAT0) / B, ph = bpos % 1, beatN = Math.floor(bpos);
  const hype = s && (s.choir || s.id === "verse2" || s.id === "final") ? 1.6 : s && s.id === "outro" ? .4 : 1;
  singer.head.style.transform = `rotate(${Math.sin(bpos * Math.PI) * 7 * hype}deg) translateY(${-Math.abs(Math.sin(bpos * Math.PI)) * 6 * hype}px)`;
  singer.mouth.style.transform = `scale(${1 + open * .6}, ${1 + open * 4.5})`;
  singer.brows.style.transform = `translateY(${-open * 7}px)`;
  const strum = bpos % 1;
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
  playing = false; $("end").classList.add("show");
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
  setLine(-1); song.currentTime = 0; song.play(); playing = true; document.body.className = "s-intro"; frame();
}
$("play").onclick = go; $("again").onclick = go; $("restart").onclick = go;
$("pause").onclick = () => {
  if (!playing) return;
  paused = !paused; paused ? song.pause() : song.play();
  $("pause").textContent = paused ? "▶" : "⏸";
};
