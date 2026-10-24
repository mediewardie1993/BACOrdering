// Renders one lyrics "stage" (background video/color + lyric text) from a state object.
// Used by both the control-window preview and the output window.
class Stage {
  constructor(root) {
    this.root = root;
    root.classList.add('stage');
    root.innerHTML =
      '<video class="bg-video" muted playsinline autoplay hidden></video>' +
      '<div class="tint"></div><div class="text-layer"></div>' +
      '<div class="label" hidden></div><div class="flash"></div>';
    this.video = root.querySelector('.bg-video');
    this.tint = root.querySelector('.tint');
    this.layer = root.querySelector('.text-layer');
    this.label = root.querySelector('.label');
    this.flashEl = root.querySelector('.flash');
    this.bgKey = null;
    this.stream = null;
    this.seq = null;
    this.flashSeq = null;
    this.fonts = new Set();
    this.current = null;
  }

  apply(s) {
    this.applyFonts(s.customFonts || []);
    this.applyBackground(s);
    this.applyFlash(s);
    this.applyText(s);
  }

  applyFonts(list) {
    for (const f of list) {
      if (this.fonts.has(f.url)) continue;
      this.fonts.add(f.url);
      new FontFace(f.name, `url("${f.url}")`).load()
        .then((ff) => { document.fonts.add(ff); if (this.current) this.current.style.fontFamily = this.current.style.fontFamily; })
        .catch(() => {});
    }
  }

  applyBackground(s) {
    const t = this.tint.style;
    t.transitionDuration = (s.colorMs ?? 400) + 'ms';
    t.backgroundColor = s.bgColor || '#000000';
    const hasVideo = (s.bgMode === 'video' && s.videoUrl) || (s.bgMode === 'device' && s.deviceId);
    t.opacity = hasVideo ? String(s.tint ?? 0) : '1';

    const key = s.bgMode + '|' + (s.videoUrl || '') + '|' + (s.deviceId || '') + '|' + (s.loop ? 1 : 0);
    if (key === this.bgKey) return;
    this.bgKey = key;
    this.stopStream();
    const v = this.video;
    if (s.bgMode === 'video' && s.videoUrl) {
      v.hidden = false;
      v.srcObject = null;
      v.src = s.videoUrl;
      v.loop = !!s.loop;
      v.play().catch(() => {});
    } else if (s.bgMode === 'device' && s.deviceId) {
      v.hidden = false;
      v.removeAttribute('src');
      v.loop = false;
      navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: s.deviceId } }, audio: false })
        .then((st) => {
          if (this.bgKey !== key) { st.getTracks().forEach((x) => x.stop()); return; }
          this.stream = st;
          v.srcObject = st;
          v.play().catch(() => {});
        })
        .catch(() => { v.hidden = true; });
    } else {
      v.hidden = true;
      v.removeAttribute('src');
      v.srcObject = null;
    }
  }

  stopStream() {
    if (this.stream) this.stream.getTracks().forEach((x) => x.stop());
    this.stream = null;
  }

  applyFlash(s) {
    if (this.flashSeq === null) { this.flashSeq = s.flashSeq; return; }
    if (s.flashSeq === this.flashSeq) return;
    this.flashSeq = s.flashSeq;
    const f = this.flashEl;
    f.style.background = s.flashColor || '#ffffff';
    f.style.setProperty('--flash-ms', (s.flashMs ?? 600) + 'ms');
    f.classList.remove('go');
    void f.offsetWidth;
    f.classList.add('go');
  }

  applyText(s) {
    const text = s.blank ? '' : (s.text || '');
    const changed = this.seq !== s.seq;
    this.seq = s.seq;
    this.label.hidden = !(s.showLabel && s.label && !s.blank);
    this.label.textContent = s.label || '';
    if (changed) {
      const old = this.current;
      if (old) {
        old.classList.add('leave');
        old.style.setProperty('--dur', Math.max(150, (s.duration ?? 600) * 0.6) + 'ms');
        setTimeout(() => old.remove(), (s.duration ?? 600) + 100);
      }
      this.current = null;
      if (text) this.current = this.makeLine(text, s);
    }
    if (this.current) this.style(this.current, s);
  }

  makeLine(text, s) {
    const el = document.createElement('div');
    el.className = 'line';
    el.style.setProperty('--dur', (s.duration ?? 600) + 'ms');
    const tr = s.transition || 'fade';
    if (tr === 'typewriter') {
      const words = text.split(/(\s+)/);
      let i = 0;
      for (const w of words) {
        if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(w)); continue; }
        const sp = document.createElement('span');
        sp.className = 'word';
        sp.textContent = w;
        sp.style.animationDelay = (i++ * ((s.duration ?? 600) / 8)) + 'ms';
        el.appendChild(sp);
      }
    } else {
      el.textContent = text;
      if (tr !== 'none') el.classList.add('enter-' + tr);
    }
    this.layer.appendChild(el);
    return el;
  }

  style(el, s) {
    const st = el.style;
    st.fontFamily = s.fontFamily ? `"${s.fontFamily}", sans-serif` : 'sans-serif';
    st.fontSize = (s.fontSize ?? 9) + 'cqh';
    st.fontWeight = s.bold ? '800' : '500';
    st.fontStyle = s.italic ? 'italic' : 'normal';
    st.color = s.color || '#ffffff';
    st.textAlign = s.align || 'center';
    st.textTransform = s.upper ? 'uppercase' : 'none';
    st.lineHeight = String(s.lineHeight ?? 1.2);
    const o = s.outline ?? 0;
    st.webkitTextStroke = o > 0 ? `${o * 0.1}cqh ${s.outlineColor || '#000'}` : '0';
    st.paintOrder = 'stroke fill';
    st.textShadow = s.shadow ? '0 .5cqh 2cqh rgba(0,0,0,.85), 0 0 .6cqh rgba(0,0,0,.6)' : 'none';
  }
}
window.Stage = Stage;
