(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const stage = $('#stage');
  const content = $('#content');
  const titleEl = $('#title');
  const subEl = $('#subtitle');
  const timeEl = $('#time');
  const remEl = $('#remaining');
  const bar = $('#bar');
  const fill = bar.querySelector('.bar-fill');
  const inH = $('#inH'), inM = $('#inM'), inS = $('#inS');
  const btnStart = $('#btnStart');
  const panel = $('#settings');

  const SETTINGS_KEY = 'adhdTimer.settings.v1';
  const STATE_KEY = 'adhdTimer.state.v1';

  // ---------- Options ----------

  const FONTS = {
    'Inter': '"Inter", system-ui, sans-serif',
    'Poppins': '"Poppins", sans-serif',
    'Montserrat': '"Montserrat", sans-serif',
    'Nunito': '"Nunito", sans-serif',
    'Space Grotesk': '"Space Grotesk", sans-serif',
    'Oswald': '"Oswald", sans-serif',
    'Bebas Neue': '"Bebas Neue", sans-serif',
    'Archivo Black': '"Archivo Black", sans-serif',
    'Orbitron': '"Orbitron", sans-serif',
    'Righteous': '"Righteous", sans-serif',
    'Playfair Display': '"Playfair Display", serif',
    'Pacifico': '"Pacifico", cursive',
    'JetBrains Mono': '"JetBrains Mono", monospace',
    'Roboto Mono': '"Roboto Mono", monospace',
    'System': 'system-ui, -apple-system, "Segoe UI", sans-serif',
  };
  const FONT_OPTS = Object.keys(FONTS).map((f) => [f, f]);
  const WEIGHTS = [['300', 'Light'], ['400', 'Regular'], ['600', 'Semibold'], ['700', 'Bold'], ['800', 'Extra bold'], ['900', 'Black']];
  const ALIGN = [['left', 'Left'], ['center', 'Center'], ['right', 'Right']];

  const DEFAULTS = {
    titleShow: true, titleText: 'Deep Work', titleFont: 'Poppins', titleSize: 7, titleWeight: '700',
    titleColor: '#ffffff', titleAlign: 'center', titleSpacing: 0,

    subShow: true, subText: 'One thing at a time', subFont: 'Inter', subSize: 3.2, subWeight: '400',
    subColor: '#aab4d4', subAlign: 'center', subSpacing: 0.02,

    timeShow: true, timeFont: 'Space Grotesk', timeSize: 24, timeWeight: '700',
    timeColor: '#ffffff', timeAlign: 'center', timeSpacing: 0, timeShift: false,

    remShow: true, remFormat: 'words', remSuffix: 'left', remFont: 'Inter', remSize: 3.2, remWeight: '600',
    remColor: '#cfd6ee', remAlign: 'center', remSpacing: 0.02,

    contentV: 'center', gap: 1.5, padX: 6, textGlow: true,

    barPos: 'below', barMode: 'drain', barDir: 'ltr', barHeight: 7, barRadius: 60, barInset: 0,
    barStyle: 'glossy', barShine: true, barGlow: 18, bgBarOpacity: 0.35,
    barColor: '#3b82f6', trackColor: '#050814', trackOpacity: 0.6,

    shiftOn: true, shiftSmooth: true,
    shift1: '#22c55e', shift2: '#facc15', shift3: '#f97316', shift4: '#ef4444',
    yellowAt: 50, orangeAt: 25, redAt: 10,

    bgColor: '#0b1020', bgColor2: '#1e2a52', bgGradient: true, accent: '#22c55e',

    soundOn: true, sound: 'chime', volume: 0.7, soundRepeat: '0', flashOn: true, flashColor: '#ef4444',

    autoHide: true, wakeLock: true,
  };

  // Theme presets only touch look-related keys; text content and alert settings are kept.
  const KEEP_ON_THEME = ['titleText', 'subText', 'remSuffix', 'titleShow', 'subShow', 'timeShow', 'remShow',
    'soundOn', 'sound', 'volume', 'soundRepeat', 'flashOn', 'autoHide', 'wakeLock'];
  const THEMES = {
    Midnight: {},
    Daylight: {
      bgColor: '#eef2f9', bgColor2: '#ffffff', titleColor: '#1b2236', subColor: '#5a6683',
      timeColor: '#111827', remColor: '#374151', trackColor: '#8d99b3', trackOpacity: 0.35,
      textGlow: false, accent: '#2563eb', barColor: '#2563eb',
    },
    Candy: {
      bgColor: '#24093a', bgColor2: '#6a1f7a', titleColor: '#ffe4f5', subColor: '#f0abfc',
      timeColor: '#ffffff', remColor: '#f5d0fe', titleFont: 'Pacifico', titleWeight: '400',
      timeFont: 'Nunito', timeWeight: '900', barColor: '#ec4899', shiftOn: false, accent: '#ec4899',
      trackColor: '#1a0526',
    },
    Terminal: {
      bgColor: '#000000', bgColor2: '#06180c', titleColor: '#4ade80', subColor: '#22c55e',
      timeColor: '#4ade80', remColor: '#86efac', titleFont: 'JetBrains Mono', subFont: 'JetBrains Mono',
      timeFont: 'JetBrains Mono', remFont: 'JetBrains Mono', titleAlign: 'left', subAlign: 'left',
      timeAlign: 'left', remAlign: 'left', barStyle: 'flat', barShine: false, barRadius: 0,
      barColor: '#22c55e', shiftOn: false, accent: '#16a34a', trackColor: '#0b2414',
    },
    Sunset: {
      bgColor: '#1a0b14', bgColor2: '#5a2333', titleColor: '#ffedd5', subColor: '#fdba74',
      timeColor: '#fff7ed', remColor: '#fed7aa', titleFont: 'Playfair Display', titleWeight: '800',
      timeFont: 'Bebas Neue', timeWeight: '400', timeSize: 30, accent: '#f97316', trackColor: '#14060c',
    },
    Arcade: {
      bgColor: '#05010f', bgColor2: '#1b0b45', titleColor: '#67e8f9', subColor: '#c4b5fd',
      timeColor: '#f0abfc', remColor: '#a5f3fc', titleFont: 'Orbitron', subFont: 'Orbitron',
      timeFont: 'Orbitron', remFont: 'Orbitron', timeWeight: '900', timeSize: 20,
      barGlow: 40, accent: '#a855f7', trackColor: '#0a0420',
    },
  };

  // ---------- Settings persistence ----------

  let S = load(SETTINGS_KEY, {});
  S = { ...DEFAULTS, ...S };

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  }
  function store(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
  }
  const saveSettings = () => store(SETTINGS_KEY, S);

  // ---------- Color helpers ----------

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function rgba(hex, a) {
    return `rgba(${hexToRgb(hex).join(',')},${a})`;
  }

  // Color for a given fraction of time remaining (1 = full, 0 = done).
  function shiftColor(frac) {
    const p = frac * 100;
    const y = +S.yellowAt, o = +S.orangeAt, r = +S.redAt;
    const [c1, c2, c3, c4] = [S.shift1, S.shift2, S.shift3, S.shift4];
    if (!S.shiftSmooth) return p > y ? c1 : p > o ? c2 : p > r ? c3 : c4;
    const pts = [[100, c1], [(100 + y) / 2, c1], [y, c2], [o, c3], [r, c4]];
    if (p <= r) return c4;
    for (let i = 0; i < pts.length - 1; i++) {
      const [p0, col0] = pts[i], [p1, col1] = pts[i + 1];
      if (p <= p0 && p >= p1) return mix(col0, col1, p0 === p1 ? 1 : (p0 - p) / (p0 - p1));
    }
    return c1;
  }

  // ---------- Apply look ----------

  function styleText(node, p) {
    node.style.fontFamily = FONTS[S[p + 'Font']] || FONTS.Inter;
    node.style.fontSize = S[p + 'Size'] + 'vmin';
    node.style.fontWeight = S[p + 'Weight'];
    node.style.color = S[p + 'Color'];
    node.style.textAlign = S[p + 'Align'];
    node.style.letterSpacing = S[p + 'Spacing'] + 'em';
  }

  function apply() {
    styleText(titleEl, 'title');
    styleText(subEl, 'sub');
    styleText(timeEl, 'time');
    styleText(remEl, 'rem');
    titleEl.textContent = S.titleText;
    subEl.textContent = S.subText;
    titleEl.hidden = !S.titleShow || !S.titleText.trim();
    subEl.hidden = !S.subShow || !S.subText.trim();
    timeEl.hidden = !S.timeShow;
    remEl.hidden = !S.remShow;

    body.classList.toggle('glow', !!S.textGlow);
    body.style.background = S.bgGradient
      ? `radial-gradient(120% 95% at 50% 15%, ${S.bgColor2} 0%, ${S.bgColor} 72%)`
      : S.bgColor;
    document.documentElement.style.setProperty('--accent', S.accent);
    document.documentElement.style.setProperty('--flash', S.flashColor);

    stage.style.justifyContent = { top: 'flex-start', center: 'center', bottom: 'flex-end' }[S.contentV];
    stage.style.paddingLeft = stage.style.paddingRight = S.padX + 'vw';
    content.style.gap = S.gap + 'vh';

    const pos = S.barPos;
    if (['above', 'between', 'below'].includes(pos)) {
      content.append(bar);
      bar.style.order = { above: 0, between: 3, below: 6 }[pos];
    } else {
      stage.append(bar);
    }
    bar.className = ['bar', 'pos-' + pos, S.barDir, S.barStyle,
      S.barShine ? 'shine' : '', +S.barInset === 0 ? 'flush' : ''].join(' ');
    bar.style.setProperty('--bar-h', S.barHeight + 'vh');
    bar.style.setProperty('--bar-r', S.barRadius + 'px');
    bar.style.setProperty('--bar-inset', S.barInset + 'vw');
    bar.style.setProperty('--glow', S.barGlow + 'px');
    bar.style.setProperty('--track', rgba(S.trackColor, S.trackOpacity));
    bar.style.opacity = pos === 'background' ? S.bgBarOpacity : 1;

    // Keep text clear of a bar pinned to the top or bottom edge.
    const edge = `calc(${S.barHeight}vh + ${S.barInset}vw + 4vh)`;
    stage.style.paddingTop = pos === 'top' ? edge : '4vh';
    stage.style.paddingBottom = pos === 'bottom' ? edge : '4vh';

    last = {};
    render();
  }

  // ---------- Timer state ----------

  let st = load(STATE_KEY, null) || { status: 'idle', total: 25 * 60000, remaining: 25 * 60000, endAt: 0 };
  if (st.status === 'running' && st.endAt <= Date.now()) {
    st = { ...st, status: 'done', remaining: 0 };
  }
  const saveState = () => store(STATE_KEY, st);

  const remainingMs = () => (st.status === 'running' ? Math.max(0, st.endAt - Date.now()) : st.remaining);

  function readInputs() {
    const n = (el) => Math.max(0, parseInt(el.value, 10) || 0);
    return (n(inH) * 3600 + n(inM) * 60 + n(inS)) * 1000;
  }
  function setInputs(ms) {
    const t = Math.round(ms / 1000);
    inH.value = Math.floor(t / 3600);
    inM.value = Math.floor((t % 3600) / 60);
    inS.value = t % 60;
  }

  function setDuration(ms) {
    stopAlarm();
    st = { status: 'idle', total: ms, remaining: ms, endAt: 0 };
    setInputs(ms);
    saveState();
    sync();
  }

  function start() {
    unlockAudio();
    if (st.status === 'done' || st.status === 'idle') {
      const ms = readInputs();
      if (!ms) return;
      stopAlarm();
      st.total = st.remaining = ms;
    }
    st.endAt = Date.now() + st.remaining;
    st.status = 'running';
    saveState();
    sync();
  }

  function pause() {
    st.remaining = remainingMs();
    st.status = 'paused';
    saveState();
    sync();
  }

  function toggle() {
    st.status === 'running' ? pause() : start();
  }

  function reset() {
    setDuration(readInputs() || st.total);
  }

  function adjust(delta) {
    if (st.status === 'idle') {
      const ms = Math.max(0, st.total + delta);
      if (ms) setDuration(ms);
      return;
    }
    if (st.status === 'done') {
      // Snooze: +1m after time's up starts a fresh one-minute run.
      if (delta <= 0) return;
      stopAlarm();
      st = { status: 'paused', total: delta, remaining: delta, endAt: 0 };
      start();
      return;
    }
    const rem = Math.max(0, remainingMs() + delta);
    st.total = Math.max(st.total + delta, rem, 1000);
    st.remaining = rem;
    if (st.status === 'running') st.endAt = Date.now() + rem;
    saveState();
    if (rem === 0) finish();
    sync();
  }

  function finish() {
    st.status = 'done';
    st.remaining = 0;
    saveState();
    startAlarm();
    sync();
  }

  function tick() {
    if (st.status === 'running' && remainingMs() <= 0) finish();
    if (document.hidden) render();
  }

  function sync() {
    btnStart.textContent = { idle: 'Start', running: 'Pause', paused: 'Resume', done: 'Restart' }[st.status];
    body.dataset.status = st.status;
    holdWake(st.status === 'running');
    scheduleHide();
    render();
  }

  // ---------- Rendering ----------

  const pad = (n) => String(n).padStart(2, '0');
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  function formatClock(ms) {
    const t = Math.ceil(ms / 1000);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return h > 0 || st.total >= 3600000 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  function formatWords(ms) {
    const t = Math.ceil(ms / 1000);
    if (t >= 3600) {
      let h = Math.floor(t / 3600), m = Math.ceil((t % 3600) / 60);
      if (m === 60) { h++; m = 0; }
      return m ? `${plural(h, 'hour')} ${plural(m, 'minute')}` : plural(h, 'hour');
    }
    if (t >= 60) return plural(Math.ceil(t / 60), 'minute');
    return plural(t, 'second');
  }

  function formatRemaining(ms, frac) {
    if (st.status === 'done') return "Time's up!";
    const suffix = S.remSuffix ? ' ' + S.remSuffix : '';
    const pct = `${Math.ceil(frac * 100)}%`;
    if (S.remFormat === 'percent') return pct + suffix;
    if (S.remFormat === 'both') return `${formatWords(ms)}${suffix} · ${pct}`;
    return formatWords(ms) + suffix;
  }

  let last = {};
  function render() {
    const ms = remainingMs();
    const frac = st.total > 0 ? Math.min(1, ms / st.total) : 0;

    const clock = formatClock(ms);
    if (clock !== last.clock) {
      timeEl.textContent = clock;
      document.title = st.status === 'idle' ? 'ADHD Timer'
        : `${st.status === 'done' ? "Time's up" : clock} · ${S.titleText || 'ADHD Timer'}`;
      last.clock = clock;
    }

    const words = formatRemaining(ms, frac);
    if (words !== last.words) { remEl.textContent = words; last.words = words; }

    const shown = S.barMode === 'drain' ? frac : 1 - frac;
    const width = (shown * 100).toFixed(3) + '%';
    if (width !== last.width) { fill.style.width = width; last.width = width; }

    const color = S.shiftOn ? shiftColor(frac) : S.barColor;
    if (color !== last.color) {
      bar.style.setProperty('--bar-color', color);
      last.color = color;
    }
    const timeColor = S.timeShift ? color : S.timeColor;
    if (timeColor !== last.timeColor) { timeEl.style.color = timeColor; last.timeColor = timeColor; }
  }

  function frame() {
    render();
    requestAnimationFrame(frame);
  }

  // ---------- Sound ----------

  let ctx = null;
  function unlockAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, at, dur, type = 'sine', gain = 1) {
    const v = Math.max(0.0002, S.volume * gain * 0.45);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(v, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(ctx.destination);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  const SOUNDS = {
    chime: { gap: 2200, play: (t) => [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.16, 1.3, 'sine', 0.8)) },
    bell: { gap: 2800, play: (t) => [[523.25, 1], [1046.5, 0.5], [1440, 0.3], [2830, 0.12]].forEach(([f, g]) => tone(f, t, 2.6, 'sine', g)) },
    marimba: { gap: 1800, play: (t) => [784, 659.25, 523.25].forEach((f, i) => tone(f, t + i * 0.2, 0.6, 'triangle', 1)) },
    beep: { gap: 1300, play: (t) => [0, 0.25, 0.5].forEach((d) => tone(880, t + d, 0.16, 'square', 0.3)) },
    alarm: { gap: 1500, play: (t) => { for (let i = 0; i < 8; i++) tone(i % 2 ? 660 : 880, t + i * 0.14, 0.13, 'sawtooth', 0.28); } },
  };

  function playSound(name) {
    unlockAudio();
    if (!ctx || S.volume <= 0) return;
    (SOUNDS[name] || SOUNDS.chime).play(ctx.currentTime + 0.02);
  }

  // ---------- Alarm ----------

  let ringTimer = null, rings = 0;

  function startAlarm() {
    if (S.flashOn) body.classList.add('alarm');
    if (S.soundOn) { rings = 0; ring(); }
    showUI();
  }
  function ring() {
    playSound(S.sound);
    rings++;
    const limit = +S.soundRepeat;
    // "Until dismissed" still gives up after 5 minutes so a forgotten tab goes quiet eventually.
    const gap = (SOUNDS[S.sound] || SOUNDS.chime).gap;
    if ((limit === 0 && rings * gap < 300000) || rings < limit) ringTimer = setTimeout(ring, gap);
  }
  function stopAlarm() {
    clearTimeout(ringTimer);
    ringTimer = null;
    body.classList.remove('alarm');
  }
  const alarming = () => body.classList.contains('alarm') || ringTimer !== null;

  // ---------- Wake lock ----------

  let wake = null;
  async function holdWake(on) {
    try {
      if (on && S.wakeLock && 'wakeLock' in navigator && !wake && document.visibilityState === 'visible') {
        wake = await navigator.wakeLock.request('screen');
        wake.addEventListener('release', () => { wake = null; });
      } else if ((!on || !S.wakeLock) && wake) {
        await wake.release();
        wake = null;
      }
    } catch { /* not supported or denied */ }
  }

  // ---------- Auto-hide controls ----------

  let hideTimer = null, overControls = false;
  function showUI() {
    body.classList.remove('hide-ui');
    scheduleHide();
  }
  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (S.autoHide && st.status === 'running' && !overControls && !panel.classList.contains('open')
        && !document.activeElement?.closest('#controls')) {
        body.classList.add('hide-ui');
      }
    }, 2500);
  }

  // ---------- Settings panel ----------

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const refreshers = [];

  function field([key, label, type, opt]) {
    const row = el('div', 'row');
    const ctl = el('div', 'ctl');
    row.append(el('span', 'lbl', label), ctl);
    let refresh;
    const set = (v) => { S[key] = v; saveSettings(); apply(); refresh(); };

    if (type === 'toggle') {
      const input = el('input', 'switch');
      input.type = 'checkbox';
      input.onchange = () => set(input.checked);
      refresh = () => { input.checked = !!S[key]; };
      ctl.append(input);
    } else if (type === 'text' || type === 'color') {
      const input = el('input');
      input.type = type;
      input.oninput = () => set(input.value);
      refresh = () => { if (input.value !== S[key]) input.value = S[key]; };
      ctl.append(input);
    } else if (type === 'range') {
      const input = el('input');
      const out = el('output');
      input.type = 'range';
      input.min = opt.min; input.max = opt.max; input.step = opt.step;
      input.oninput = () => set(+input.value);
      refresh = () => {
        input.value = S[key];
        out.textContent = opt.fmt ? opt.fmt(+S[key]) : `${+S[key]}${opt.unit || ''}`;
      };
      ctl.append(input, out);
    } else if (type === 'select') {
      const input = el('select');
      for (const [v, l] of opt) {
        const o = el('option', null, l);
        o.value = v;
        if (FONTS[v]) o.style.fontFamily = FONTS[v];
        input.append(o);
      }
      input.onchange = () => set(input.value);
      refresh = () => { input.value = S[key]; };
      ctl.append(input);
    } else if (type === 'seg') {
      const seg = el('div', 'seg');
      const btns = opt.map(([v, l]) => {
        const b = el('button', null, l);
        b.type = 'button';
        b.onclick = () => set(v);
        seg.append(b);
        return [v, b];
      });
      refresh = () => btns.forEach(([v, b]) => b.classList.toggle('on', S[key] === v));
      ctl.append(seg);
    }
    refreshers.push(refresh);
    refresh();
    return row;
  }

  const pct = (v) => Math.round(v * 100) + '%';
  const textGroup = (p, extra = []) => [
    [p + 'Show', 'Show', 'toggle'],
    ...extra,
    [p + 'Font', 'Font', 'select', FONT_OPTS],
    [p + 'Size', 'Size', 'range', { min: 0.5, max: 45, step: 0.5 }],
    [p + 'Weight', 'Weight', 'select', WEIGHTS],
    [p + 'Color', 'Color', 'color'],
    [p + 'Align', 'Justify', 'seg', ALIGN],
    [p + 'Spacing', 'Letter spacing', 'range', { min: -0.1, max: 0.6, step: 0.01, unit: 'em' }],
  ];

  const SECTIONS = [
    { title: 'Themes', open: true, custom: themeButtons },
    { title: 'Title', open: true, fields: textGroup('title', [['titleText', 'Text', 'text']]) },
    { title: 'Subheader', fields: textGroup('sub', [['subText', 'Text', 'text']]) },
    { title: 'Countdown', fields: textGroup('time', [['timeShift', 'Use bar color', 'toggle']]) },
    {
      title: 'Time-left text',
      fields: textGroup('rem', [
        ['remFormat', 'Format', 'seg', [['words', '23 min'], ['percent', '62%'], ['both', 'Both']]],
        ['remSuffix', 'Suffix', 'text'],
      ]),
    },
    {
      title: 'Layout',
      fields: [
        ['contentV', 'Text position', 'seg', [['top', 'Top'], ['center', 'Middle'], ['bottom', 'Bottom']]],
        ['gap', 'Line spacing', 'range', { min: 0, max: 8, step: 0.25, unit: 'vh' }],
        ['padX', 'Side margin', 'range', { min: 0, max: 25, step: 0.5, unit: 'vw' }],
        ['textGlow', 'Text glow', 'toggle'],
      ],
    },
    {
      title: 'Progress bar',
      open: true,
      fields: [
        ['barPos', 'Placement', 'select', [['top', 'Top edge of screen'], ['above', 'Above all text'],
          ['between', 'Between subheader & timer'], ['below', 'Below timer'], ['bottom', 'Bottom edge of screen'],
          ['background', 'Full-screen background']]],
        ['barMode', 'Behavior', 'seg', [['drain', 'Drain'], ['fill', 'Fill up']]],
        ['barDir', 'Direction', 'seg', [['ltr', 'Left → Right'], ['rtl', 'Right → Left']]],
        ['barStyle', 'Style', 'seg', [['glossy', 'Glossy'], ['flat', 'Flat']]],
        ['barShine', 'Shine sweep', 'toggle'],
        ['barHeight', 'Thickness', 'range', { min: 0.5, max: 40, step: 0.5, unit: 'vh' }],
        ['barRadius', 'Roundness', 'range', { min: 0, max: 100, step: 1, unit: 'px' }],
        ['barInset', 'Edge margin', 'range', { min: 0, max: 20, step: 0.5, unit: 'vw' }],
        ['barGlow', 'Glow', 'range', { min: 0, max: 80, step: 1, unit: 'px' }],
        ['bgBarOpacity', 'Bg opacity', 'range', { min: 0.05, max: 1, step: 0.05, fmt: pct }],
        ['barColor', 'Bar color', 'color'],
        ['trackColor', 'Track color', 'color'],
        ['trackOpacity', 'Track opacity', 'range', { min: 0, max: 1, step: 0.05, fmt: pct }],
      ],
    },
    {
      title: 'Color shift (green → red)',
      fields: [
        ['shiftOn', 'Enabled', 'toggle'],
        ['shiftSmooth', 'Smooth blend', 'toggle'],
        ['shift1', 'Plenty of time', 'color'],
        ['shift2', 'Warning', 'color'],
        ['shift3', 'Getting close', 'color'],
        ['shift4', 'Almost done', 'color'],
        ['yellowAt', 'Warning at', 'range', { min: 5, max: 95, step: 1, fmt: (v) => v + '% left' }],
        ['orangeAt', 'Close at', 'range', { min: 2, max: 90, step: 1, fmt: (v) => v + '% left' }],
        ['redAt', 'Almost at', 'range', { min: 1, max: 80, step: 1, fmt: (v) => v + '% left' }],
      ],
    },
    {
      title: 'Background & accent',
      fields: [
        ['bgColor', 'Background', 'color'],
        ['bgGradient', 'Gradient', 'toggle'],
        ['bgColor2', 'Gradient glow', 'color'],
        ['accent', 'Button accent', 'color'],
      ],
    },
    {
      title: "When time's up",
      custom: (wrap) => {
        const row = el('div', 'row');
        const b = el('button', 'btn', 'Test alarm');
        b.onclick = () => { unlockAudio(); startAlarm(); };
        row.append(el('span', 'lbl', 'Preview'), b);
        wrap.append(row);
      },
      fields: [
        ['soundOn', 'Sound', 'toggle'],
        ['sound', 'Sound type', 'select', [['chime', 'Chime'], ['bell', 'Bell'], ['marimba', 'Marimba'], ['beep', 'Beep'], ['alarm', 'Alarm']]],
        ['volume', 'Volume', 'range', { min: 0, max: 1, step: 0.05, fmt: pct }],
        ['soundRepeat', 'Repeat', 'select', [['0', 'Until dismissed'], ['1', 'Once'], ['3', '3 times'], ['5', '5 times']]],
        ['flashOn', 'Flash screen', 'toggle'],
        ['flashColor', 'Flash color', 'color'],
      ],
    },
    {
      title: 'Behavior',
      fields: [
        ['autoHide', 'Auto-hide controls', 'toggle'],
        ['wakeLock', 'Keep screen awake', 'toggle'],
      ],
    },
  ];

  function themeButtons(wrap) {
    const box = el('div', 'themes');
    for (const name of Object.keys(THEMES)) {
      const b = el('button', 'btn', name);
      b.onclick = () => {
        const kept = Object.fromEntries(KEEP_ON_THEME.map((k) => [k, S[k]]));
        S = { ...DEFAULTS, ...THEMES[name], ...kept };
        saveSettings();
        refreshAll();
      };
      box.append(b);
    }
    wrap.append(box);
  }

  function refreshAll() {
    refreshers.forEach((r) => r());
    apply();
  }

  function buildSettings() {
    const root = $('#settingsBody');
    for (const sec of SECTIONS) {
      const d = el('details', 'sec');
      d.open = !!sec.open;
      d.append(el('summary', null, sec.title));
      (sec.fields || []).forEach((f) => d.append(field(f)));
      if (sec.custom) sec.custom(d);
      root.append(d);
    }
  }

  const toggleSettings = (open = !panel.classList.contains('open')) => {
    panel.classList.toggle('open', open);
    showUI();
  };

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  // ---------- Events ----------

  btnStart.onclick = toggle;
  $('#btnReset').onclick = reset;
  $('#btnPlus').onclick = () => adjust(60000);
  $('#btnMinus').onclick = () => adjust(-60000);
  $('#btnFull').onclick = toggleFullscreen;
  $('#btnSettings').onclick = () => toggleSettings();
  $('#btnClose').onclick = () => toggleSettings(false);
  $('#btnDefaults').onclick = () => {
    if (!confirm('Reset all look & sound settings to defaults?')) return;
    S = { ...DEFAULTS };
    saveSettings();
    refreshAll();
  };

  document.querySelectorAll('.presets [data-min]').forEach((b) => {
    b.onclick = () => {
      const ms = +b.dataset.min * 60000;
      // Don't throw away a running timer; the new length applies on Reset.
      if (st.status === 'running' || st.status === 'paused') setInputs(ms);
      else setDuration(ms);
    };
  });

  [inH, inM, inS].forEach((input) => {
    input.addEventListener('input', () => {
      if (st.status === 'idle' || st.status === 'done') {
        const ms = readInputs();
        stopAlarm();
        st = { status: 'idle', total: ms, remaining: ms, endAt: 0 };
        saveState();
        sync();
      }
    });
    input.addEventListener('focus', () => input.select());
  });

  // Drop focus after clicking any button so Space doesn't re-trigger it.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) b.blur();
  });

  stage.addEventListener('click', () => { if (alarming()) stopAlarm(); });
  $('#flash').addEventListener('click', stopAlarm);

  document.addEventListener('keydown', (e) => {
    if (alarming() && !e.metaKey && !e.ctrlKey) {
      stopAlarm();
      e.preventDefault();
      return;
    }
    const t = e.target;
    if (t.matches('input, textarea, select')) {
      if (e.key === 'Enter' && t.closest('.dur')) { t.blur(); start(); }
      if (e.key === 'Escape') t.blur();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case ' ': e.preventDefault(); toggle(); break;
      case 'r': case 'R': reset(); break;
      case 's': case 'S': toggleSettings(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'h': case 'H': body.classList.toggle('hide-ui'); break;
      case '+': case '=': case 'ArrowUp': adjust(60000); break;
      case '-': case '_': case 'ArrowDown': adjust(-60000); break;
      case 'Escape': toggleSettings(false); break;
      default: return;
    }
    showUI();
  });

  document.addEventListener('mousemove', showUI);
  const controls = $('#controls');
  controls.addEventListener('mouseenter', () => { overControls = true; });
  controls.addEventListener('mouseleave', () => { overControls = false; scheduleHide(); });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') holdWake(st.status === 'running');
  });

  // ---------- Init ----------

  buildSettings();
  setInputs(st.total);
  apply();
  sync();
  setInterval(tick, 200);
  requestAnimationFrame(frame);
})();
