const $ = (id) => document.getElementById(id);
const api = window.api || {
  // browser fallback so the UI can be opened outside Electron for testing
  pickVideo: async () => null, pickFont: async () => null, saveSong: async () => false,
  loadSong: async () => null, openOutput() {}, toggleFullscreen() {}, sendState() {},
  outputReady() {}, onState() {}, onOutputClosed() {},
};

const SECTION_COLORS = { Verse: '#4f8cff', Refrain: '#2fbf71', Chorus: '#ff6b6b', Bridge: '#ffb020' };
const BASE_FONTS = ['Arial', 'Arial Black', 'Impact', 'Segoe UI', 'Calibri', 'Verdana', 'Tahoma', 'Trebuchet MS',
  'Georgia', 'Times New Roman', 'Palatino Linotype', 'Garamond', 'Courier New', 'Comic Sans MS', 'Brush Script MT'];

const doc = {
  sections: [],
  palette: ['#ff2d55', '#ff9500', '#ffd60a', '#30d158', '#0a84ff', '#bf5af2', '#ffffff', '#000000'],
  customFonts: [],
  fonts: [...BASE_FONTS],
  videoUrl: '', videoName: '',
};
const live = { slide: -1, blank: false, seq: 0, flashSeq: 0, paletteIdx: -1 };
let uid = 1;

const stage = new Stage($('preview'));

/* ---------- slides ---------- */
function buildSlides() {
  const out = [];
  doc.sections.forEach((sec, si) => {
    sec.text.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean)
      .forEach((t) => out.push({ si, text: t }));
  });
  return out;
}

/* ---------- state ---------- */
function buildState() {
  const slides = buildSlides();
  const cur = slides[live.slide];
  const sec = cur && doc.sections[cur.si];
  return {
    text: cur ? cur.text : '',
    label: sec ? sec.name : '',
    blank: live.blank || !cur,
    seq: live.seq,
    flashSeq: live.flashSeq,
    bgMode: doc.bgMode || 'color',
    videoUrl: doc.videoUrl,
    deviceId: $('deviceSel').value || '',
    loop: $('loop').checked,
    bgColor: doc.bgColor || $('bgColor').value,
    tint: $('tint').value / 100,
    colorMs: +$('colorMs').value,
    flashColor: $('flashColor').value,
    flashMs: +$('flashMs').value,
    transition: $('transition').value,
    duration: +$('duration').value,
    fontFamily: $('fontFamily').value,
    customFonts: doc.customFonts,
    fontSize: +$('fontSize').value,
    lineHeight: +$('lineHeight').value,
    color: $('color').value,
    outline: +$('outline').value,
    outlineColor: $('outlineColor').value,
    bold: $('bold').checked,
    italic: $('italic').checked,
    upper: $('upper').checked,
    shadow: $('shadow').checked,
    showLabel: $('showLabel').checked,
    align: doc.align || 'center',
  };
}

function push() {
  const s = buildState();
  stage.apply(s);
  api.sendState(s);
}

/* ---------- navigation ---------- */
function goto(i, { silent } = {}) {
  const slides = buildSlides();
  if (!slides.length) return;
  i = Math.max(0, Math.min(slides.length - 1, i));
  const changedSlide = i !== live.slide || live.blank;
  live.slide = i;
  live.blank = false;
  live.seq++;
  if (changedSlide && !silent) autoColor(slides[i]);
  renderSlides();
  push();
}
function autoColor(slide) {
  const sec = doc.sections[slide.si];
  if ($('useSectionColor').checked && sec && sec.color) setBg(sec.color);
  else if ($('cycleColor').checked) {
    live.paletteIdx = (live.paletteIdx + 1) % doc.palette.length;
    setBg(doc.palette[live.paletteIdx]);
  }
}
function setBg(color) {
  doc.bgColor = color;
  $('bgColor').value = color;
  renderPalette();
}
const next = () => goto(live.slide + 1);
const prev = () => goto(live.slide - 1);
function toggleBlank() { live.blank = !live.blank; live.seq++; push(); renderSlides(); }
function flash() { live.flashSeq++; push(); }
function trigger(i) { live.paletteIdx = i; setBg(doc.palette[i]); push(); }

/* ---------- sections ---------- */
function addSection(type, name) {
  const count = doc.sections.filter((s) => s.type === type).length;
  doc.sections.push({
    id: uid++, type, name: name || (count ? `${type} ${count + 1}` : type),
    color: SECTION_COLORS[type] || '#9aa0b4', text: '',
  });
  renderSections(); renderSlides(); save();
}
function renderSections() {
  const box = $('sections');
  box.innerHTML = '';
  doc.sections.forEach((sec, i) => {
    const el = document.createElement('div');
    el.className = 'sec';
    el.style.borderLeftColor = sec.color;
    el.innerHTML = '<div class="head"><input class="name"><input type="color" title="Section background color (used when enabled)">' +
      '<button data-a="up">↑</button><button data-a="down">↓</button><button data-a="del">✕</button></div><textarea placeholder="Type lyrics. Blank line = new slide."></textarea>';
    const name = el.querySelector('.name');
    const col = el.querySelector('input[type=color]');
    const ta = el.querySelector('textarea');
    name.value = sec.name; col.value = sec.color; ta.value = sec.text;
    name.oninput = () => { sec.name = name.value; renderSlides(); save(); };
    col.oninput = () => { sec.color = col.value; el.style.borderLeftColor = sec.color; save(); };
    ta.oninput = () => { sec.text = ta.value; renderSlides(); save(); };
    el.querySelector('[data-a=up]').onclick = () => move(i, -1);
    el.querySelector('[data-a=down]').onclick = () => move(i, 1);
    el.querySelector('[data-a=del]').onclick = () => { doc.sections.splice(i, 1); live.slide = -1; renderSections(); renderSlides(); push(); save(); };
    box.appendChild(el);
  });
}
function move(i, d) {
  const j = i + d;
  if (j < 0 || j >= doc.sections.length) return;
  [doc.sections[i], doc.sections[j]] = [doc.sections[j], doc.sections[i]];
  live.slide = -1;
  renderSections(); renderSlides(); save();
}
function renderSlides() {
  const slides = buildSlides();
  $('slideCount').textContent = slides.length ? `(${slides.length})` : '';
  const box = $('slides');
  box.innerHTML = '';
  if (!slides.length) { box.innerHTML = '<p class="hint">Add a section and type some lyrics.</p>'; return; }
  let lastSi = -1, group = null;
  slides.forEach((s, i) => {
    if (s.si !== lastSi) {
      lastSi = s.si;
      group = document.createElement('div');
      group.className = 'slidegroup';
      const sec = doc.sections[s.si];
      group.innerHTML = '<div class="gl"></div>';
      group.firstChild.textContent = sec.name;
      group.firstChild.style.borderLeftColor = sec.color;
      box.appendChild(group);
    }
    const d = document.createElement('div');
    d.className = 'slide' + (i === live.slide && !live.blank ? ' live' : '');
    d.textContent = s.text;
    d.onclick = () => goto(i);
    group.appendChild(d);
  });
}

/* ---------- palette ---------- */
function renderPalette() {
  const box = $('palette');
  box.innerHTML = '';
  doc.palette.forEach((c, i) => {
    const sw = document.createElement('div');
    sw.className = 'sw';
    sw.innerHTML = '<div class="chip"></div><input type="color">';
    const chip = sw.firstChild, pick = sw.lastChild;
    chip.style.background = c;
    chip.textContent = i + 1;
    if (c.toLowerCase() === (doc.bgColor || '').toLowerCase()) chip.classList.add('active');
    pick.value = c;
    chip.onclick = () => trigger(i);
    pick.oninput = () => { doc.palette[i] = pick.value; chip.style.background = pick.value; save(); };
    box.appendChild(sw);
  });
}

/* ---------- fonts ---------- */
function renderFonts() {
  const sel = $('fontFamily'), keep = sel.value;
  sel.innerHTML = '';
  const names = [...new Set([...doc.customFonts.map((f) => f.name), ...doc.fonts])];
  names.forEach((n) => {
    const o = document.createElement('option');
    o.value = n; o.textContent = n; o.style.fontFamily = `"${n}"`;
    sel.appendChild(o);
  });
  if (keep && names.includes(keep)) sel.value = keep;
}
async function loadFontFile() {
  const f = await api.pickFont();
  if (!f) return;
  if (!doc.customFonts.some((x) => x.url === f.url)) doc.customFonts.push(f);
  renderFonts();
  $('fontFamily').value = f.name;
  push(); save();
}
async function loadSystemFonts() {
  try {
    const list = await window.queryLocalFonts();
    doc.fonts = [...new Set(list.map((f) => f.family))].sort((a, b) => a.localeCompare(b));
    renderFonts(); push();
  } catch (e) {
    alert('Could not read installed fonts. Use "Load font file…" instead.');
  }
}

/* ---------- background ---------- */
function setMode(m) {
  doc.bgMode = m;
  document.querySelectorAll('#bgMode button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  $('bgVideoBox').hidden = m !== 'video';
  $('bgDeviceBox').hidden = m !== 'device';
  if (m === 'device') refreshDevices();
  push(); save();
}
async function refreshDevices() {
  try {
    const tmp = await navigator.mediaDevices.getUserMedia({ video: true });
    tmp.getTracks().forEach((t) => t.stop());
  } catch (e) { /* permission denied or no device */ }
  const devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
  const sel = $('deviceSel'), keep = sel.value;
  sel.innerHTML = '';
  devs.forEach((d, i) => {
    const o = document.createElement('option');
    o.value = d.deviceId; o.textContent = d.label || `Video source ${i + 1}`;
    sel.appendChild(o);
  });
  if (keep) sel.value = keep;
  if (!devs.length) sel.innerHTML = '<option value="">No video sources found</option>';
  push();
}

/* ---------- save / load ---------- */
const FIELDS = ['loop', 'tint', 'colorMs', 'flashColor', 'flashMs', 'transition', 'duration', 'fontFamily', 'fontSize',
  'lineHeight', 'color', 'outline', 'outlineColor', 'bold', 'italic', 'upper', 'shadow', 'showLabel', 'useSectionColor', 'cycleColor'];
function snapshot() {
  const settings = {};
  FIELDS.forEach((k) => { const e = $(k); settings[k] = e.type === 'checkbox' ? e.checked : e.value; });
  return { version: 1, ...doc, fonts: undefined, settings };
}
function restore(d) {
  doc.sections = d.sections || [];
  doc.palette = d.palette || doc.palette;
  doc.customFonts = d.customFonts || [];
  doc.videoUrl = d.videoUrl || ''; doc.videoName = d.videoName || '';
  doc.bgColor = d.bgColor; doc.bgMode = d.bgMode || 'color'; doc.align = d.align || 'center';
  uid = Math.max(1, ...doc.sections.map((s) => s.id || 0)) + 1;
  renderFonts();
  Object.entries(d.settings || {}).forEach(([k, v]) => {
    const e = $(k); if (!e) return;
    if (e.type === 'checkbox') e.checked = !!v; else e.value = v;
  });
  if (doc.bgColor) $('bgColor').value = doc.bgColor;
  $('videoName').textContent = doc.videoName || 'none';
  syncOutputs();
  document.querySelectorAll('#align button').forEach((b) => b.classList.toggle('on', b.dataset.align === doc.align));
  live.slide = -1; live.blank = false; live.seq++;
  renderSections(); renderSlides(); renderPalette();
  setMode(doc.bgMode);
}
function save() {
  try { localStorage.setItem('mlf-song', JSON.stringify(snapshot())); } catch (e) { /* storage unavailable */ }
}
function syncOutputs() {
  [['tint', v => v + '%'], ['colorMs', v => v + ' ms'], ['flashMs', v => v + ' ms'], ['duration', v => v + ' ms'],
    ['fontSize', v => v], ['lineHeight', v => v]].forEach(([k, f]) => { $(k + 'O').textContent = f($(k).value); });
}

/* ---------- wiring ---------- */
document.querySelectorAll('[data-add]').forEach((b) => (b.onclick = () => addSection(b.dataset.add)));
$('btnAddCustom').onclick = () => {
  const n = $('customName').value.trim();
  if (!n) { $('customName').focus(); return; }
  addSection('Custom', n); $('customName').value = '';
};
$('customName').onkeydown = (e) => { if (e.key === 'Enter') $('btnAddCustom').click(); };
$('btnNext').onclick = next;
$('btnPrev').onclick = prev;
$('btnBlank').onclick = toggleBlank;
$('btnFlash').onclick = flash;
$('btnOutput').onclick = () => { api.openOutput(); setTimeout(push, 400); };
$('btnFull').onclick = () => api.toggleFullscreen();
$('btnNew').onclick = () => { if (confirm('Start a new empty song?')) { restore({ sections: [] }); save(); } };
$('btnSave').onclick = () => api.saveSong(JSON.stringify(snapshot(), null, 2));
$('btnOpen').onclick = async () => {
  const t = await api.loadSong();
  if (!t) return;
  try { restore(JSON.parse(t)); save(); } catch (e) { alert('That file is not a valid song.'); }
};
$('btnPickVideo').onclick = async () => {
  const v = await api.pickVideo();
  if (!v) return;
  doc.videoUrl = v.url; doc.videoName = v.name;
  $('videoName').textContent = v.name;
  push(); save();
};
$('btnRefreshDevices').onclick = refreshDevices;
$('deviceSel').onchange = push;
document.querySelectorAll('#bgMode button').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
document.querySelectorAll('#align button').forEach((b) => (b.onclick = () => {
  doc.align = b.dataset.align;
  document.querySelectorAll('#align button').forEach((x) => x.classList.toggle('on', x === b));
  push(); save();
}));
$('bgColor').oninput = () => { doc.bgColor = $('bgColor').value; renderPalette(); push(); save(); };
$('btnLoadFont').onclick = loadFontFile;
$('btnSysFonts').onclick = loadSystemFonts;
FIELDS.forEach((k) => {
  $(k).addEventListener('input', () => { syncOutputs(); push(); save(); });
  $(k).addEventListener('change', () => { push(); save(); });
});
$('transition').addEventListener('change', () => { live.seq++; push(); }); // replay so the new transition shows
api.onOutputClosed(() => {});

window.addEventListener('keydown', (e) => {
  const t = e.target.tagName;
  if (t === 'TEXTAREA' || (t === 'INPUT' && e.target.type !== 'range' && e.target.type !== 'color' && e.target.type !== 'checkbox')) return;
  if (t === 'SELECT' || t === 'BUTTON') e.target.blur();
  const k = e.key.toLowerCase();
  if (k === ' ' || k === 'arrowright' || k === 'pagedown') { e.preventDefault(); next(); }
  else if (k === 'arrowleft' || k === 'pageup') { e.preventDefault(); prev(); }
  else if (k === 'b') toggleBlank();
  else if (k === 'f') flash();
  else if (/^[1-8]$/.test(k)) trigger(+k - 1);
});

/* ---------- boot ---------- */
renderFonts();
let saved = null;
try { saved = JSON.parse(localStorage.getItem('mlf-song')); } catch (e) { /* ignore */ }
if (saved) restore(saved);
else {
  renderPalette(); syncOutputs(); setMode('color');
  addSection('Verse'); addSection('Chorus');
  doc.sections[0].text = 'Amazing grace, how sweet the sound\nThat saved a wretch like me\n\nI once was lost, but now am found\nWas blind, but now I see';
  doc.sections[1].text = 'Welcome to Medward Lyrics Flasher\nPress Space for the next slide';
  renderSections(); renderSlides();
}
push();
