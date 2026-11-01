(() => {
  'use strict';

  const DATA = window.GRIZZLIFT_DATA;
  const RUN_KEY = 'grizzlift.run.v1';
  const SETTINGS_KEY = 'grizzlift.settings.v1';
  const HINT_KEY = 'grizzlift.installHint.v1';
  const CATCH_UP_MS = 1500; // au-delà, une fin de chrono ratée est rattrapée en silence

  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  const hapticSwitch = document.getElementById('haptic');

  /* ---------- Stockage ---------- */

  const store = {
    get(key) {
      try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
    },
    del(key) {
      try { localStorage.removeItem(key); } catch (_) {}
    }
  };

  const settings = Object.assign({ beepMode: 'ambient', appearance: 'auto', name: 'Ludan' }, store.get(SETTINGS_KEY));
  delete settings.theme; // ancien choix manuel : remplacé par "appearance" (Auto par défaut)

  /* ---------- Thème jour / nuit ---------- */

  const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
  const effectiveTheme = () => (settings.appearance === 'auto' ? (lightQuery.matches ? 'light' : 'dark') : settings.appearance);

  function applyTheme() {
    const t = effectiveTheme();
    document.documentElement.dataset.theme = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t === 'light' ? '#F7F5F0' : '#141210';
  }

  function setTheme(theme) {
    settings.appearance = theme;
    store.set(SETTINGS_KEY, settings);
    applyTheme();
  }

  /* ---------- Son (Web Audio, mixé à la musique) ---------- */

  const audio = {
    ctx: null,
    applySession() {
      // iOS 17+ : "ambient" se mélange à Spotify/Apple Music, "transient" la baisse brièvement.
      try { if (navigator.audioSession) navigator.audioSession.type = settings.beepMode; } catch (_) {}
    },
    unlock() {
      this.applySession();
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    },
    ready() {
      return !!this.ctx && this.ctx.state === 'running';
    },
    // Note douce type marimba : sinus + léger harmonique, attaque courte, extinction naturelle
    tone(freq, dur, at = 0, gain = 0.32) {
      if (!this.ready()) return;
      const c = this.ctx;
      const t = c.currentTime + at;
      const amp = c.createGain();
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + 0.012);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      amp.connect(c.destination);
      [[1, 1], [3, 0.12]].forEach(([mult, level]) => {
        const osc = c.createOscillator();
        const lvl = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * mult, t);
        lvl.gain.value = level;
        osc.connect(lvl).connect(amp);
        osc.start(t);
        osc.stop(t + dur + 0.05);
      });
    },
    low() { this.tone(659, 0.28); },
    high() { this.tone(784, 0.9); this.tone(988, 0.9, 0.12); this.tone(1319, 1.2, 0.24); },
    go() { this.tone(988, 0.35); this.tone(1319, 0.6, 0.12); }
  };

  function haptic() {
    if (navigator.vibrate) { navigator.vibrate([180, 80, 180]); return; }
    // iOS n'a pas l'API Vibration : un <input switch> déclenche un retour haptique (Safari 18+).
    try { hapticSwitch.click(); } catch (_) {}
  }

  /* ---------- Écran allumé (Wake Lock) ---------- */

  const wake = {
    lock: null,
    want: false,
    async on() {
      this.want = true;
      if (this.lock || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
      try {
        this.lock = await navigator.wakeLock.request('screen');
        this.lock.addEventListener('release', () => { this.lock = null; });
      } catch (_) {}
    },
    off() {
      this.want = false;
      if (this.lock) this.lock.release().catch(() => {});
      this.lock = null;
    }
  };

  /* ---------- Icônes ---------- */

  const ICONS = {
    press: '<path d="M8 26v12M14 20v24M50 20v24M56 26v12M14 32h36"/>',
    pull: '<path d="M6 10h52M22 10v10M42 10v10"/><circle cx="32" cy="26" r="6"/><path d="M22 20l7 11M42 20l-7 11M32 32v14M25 58l7-12 7 12"/>',
    core: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="3"/>',
    stretch: '<circle cx="32" cy="11" r="5"/><path d="M32 17v21M32 23L15 13M32 23l17-10M32 38L19 56M32 38l13 18"/>',
    cardio: '<path d="M4 34h12l6-14 8 28 8-22 5 8h17"/>',
    legs: '<path d="M24 6v20l-6 30M40 6v20l6 30M14 56h10M40 56h10"/>'
  };
  const icon = (name) => `<svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[name] || ICONS.core}</svg>`;

  const LOGO = '<img src="icons/icon-512.png" alt="">';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Construction d'une séance ---------- */

  const sessionById = (id) => DATA.sessions.find((s) => s.id === id);

  function exercisesOf(session, selection) {
    if (!selection) return session.exercises;
    const ids = new Set(selection);
    return session.exercises.filter((ex) => ids.has(ex.id));
  }

  // Une séance = une liste plate d'étapes : work | rest | hold | transition
  function buildSteps(session, exs, rounds = session.rounds) {
    const steps = [];
    if (session.mode === 'sets' || session.mode === 'pick') {
      exs.forEach((ex, i) => {
        for (let set = 1; set <= ex.sets; set++) {
          steps.push({ kind: 'work', ex: i, set });
          steps.push({ kind: 'rest', ex: i, set, dur: ex.rest });
        }
      });
      steps.pop(); // pas de repos après la dernière série
    } else if (session.mode === 'circuit') {
      for (let round = 1; round <= rounds; round++) {
        // timed : station au chrono (lancé par l'utilisateur, passe seule à la suite à 0)
        exs.forEach((ex, i) => steps.push({ kind: 'work', ex: i, round, timed: ex.duration || null }));
        if (round < rounds) steps.push({ kind: 'rest', ex: exs.length - 1, round, dur: session.roundRest });
      }
    } else if (session.mode === 'auto') {
      exs.forEach((ex, i) => {
        steps.push({ kind: 'transition', ex: i, dur: i === 0 ? session.prepare : ex.transition });
        steps.push({ kind: 'hold', ex: i, dur: ex.duration });
      });
    }
    return steps;
  }

  /* ---------- État ---------- */

  let run = null;   // persisté : { sessionId, selection, rounds, sets, step, endsAt, pausedLeft, startedAt }
  let plan = null;  // dérivé : { session, exs, rounds, steps }
  let view = 'home';
  let lastBeep = null;
  let summary = null;
  let pickSel = new Set();
  const missingImages = new Set();

  const persist = () => { if (run) store.set(RUN_KEY, run); };
  const current = () => plan.steps[run.step];

  function loadPlan() {
    const session = sessionById(run.sessionId);
    if (!session) return false;
    // run.sets : nombre de séries imposé à tous les exos (séance abdos complète = 1 passage)
    const exs = exercisesOf(session, run.selection).map((ex) => (run.sets ? { ...ex, sets: run.sets } : ex));
    const rounds = run.rounds || session.rounds;
    const steps = buildSteps(session, exs, rounds);
    if (!steps.length || run.step >= steps.length) return false;
    plan = { session, exs, rounds, steps };
    return true;
  }

  function startRun(sessionId, selection, rounds, sets) {
    run = { sessionId, selection: selection || null, rounds: rounds || null, sets: sets || null, step: 0, endsAt: null, pausedLeft: null, startedAt: Date.now() };
    if (!loadPlan()) { run = null; return; }
    view = 'run';
    wake.on();
    setStep(0);
    render();
  }

  // base : horodatage de référence, pour enchaîner les chronos sans dérive
  function setStep(idx, base = Date.now()) {
    if (idx >= plan.steps.length) { finish(base); return; }
    run.step = Math.max(0, idx);
    const st = current();
    run.endsAt = st.dur ? base + st.dur * 1000 : null;
    run.pausedLeft = null;
    lastBeep = null;
    persist();
  }

  function go(idx) {
    setStep(idx);
    render();
  }

  function finish(at = Date.now()) {
    const counted = plan.steps.filter((s) => s.kind === 'work' || s.kind === 'hold').length;
    const unit = { auto: 'exercices', circuit: 'stations' }[plan.session.mode] || 'séries';
    summary = {
      title: plan.session.title,
      minutes: Math.max(1, Math.round((at - run.startedAt) / 60000)),
      count: counted,
      unit
    };
    run = null;
    plan = null;
    store.del(RUN_KEY);
    wake.off();
    view = 'done';
  }

  function quitRun() {
    run = null;
    plan = null;
    store.del(RUN_KEY);
    wake.off();
    view = 'home';
  }

  function timerEnd(silent) {
    const st = current();
    if (!silent) {
      if (st.kind === 'transition') audio.go();
      else { audio.high(); haptic(); }
    }
    setStep(run.step + 1, run.endsAt);
  }

  function togglePause() {
    if (run.pausedLeft != null) {
      run.endsAt = Date.now() + run.pausedLeft;
      run.pausedLeft = null;
    } else if (run.endsAt != null) {
      run.pausedLeft = Math.max(0, run.endsAt - Date.now());
      run.endsAt = null;
    }
    persist();
    render();
  }

  function restore() {
    run = store.get(RUN_KEY);
    if (!run) return;
    if (!loadPlan()) { run = null; store.del(RUN_KEY); return; }
    view = 'run';
    wake.on();
    // Rattrape le temps écoulé pendant que l'app était fermée ou réinitialisée par iOS
    while (run && run.endsAt != null && Date.now() >= run.endsAt) timerEnd(true);
  }

  /* ---------- Chrono ---------- */

  function tick() {
    if (view !== 'run' || !run) return;
    const pill = document.getElementById('sound-pill');
    if (pill) pill.hidden = audio.ready();
    if (run.endsAt == null) return;
    const before = run.step;
    while (run && run.endsAt != null && Date.now() - run.endsAt >= CATCH_UP_MS) timerEnd(true);
    if (run && run.endsAt != null && Date.now() >= run.endsAt) timerEnd(false);
    if (!run || run.step !== before) { render(); return; }
    if (run.endsAt == null) return;

    const st = current();
    const left = run.endsAt - Date.now();
    const sec = Math.ceil(left / 1000);
    if (st.kind !== 'transition' && sec >= 1 && sec <= 5 && sec !== lastBeep) {
      lastBeep = sec;
      audio.low();
    }
    updateTimer(left, (st.dur || st.timed) * 1000);
  }

  const RING_C = 2 * Math.PI * 90;

  function updateTimer(left, total) {
    const num = document.getElementById('timer');
    const ring = document.getElementById('ring');
    if (!num || !ring) return;
    const sec = Math.max(0, Math.ceil(left / 1000));
    num.textContent = sec;
    const frac = total ? Math.min(1, Math.max(0, left / total)) : 0;
    ring.querySelector('.ring-fg').style.strokeDashoffset = (RING_C * (1 - frac)).toFixed(1);
    ring.classList.toggle('final', sec <= 5);
  }

  /* ---------- Rendu ---------- */

  function render() {
    if (view === 'home') renderHome();
    else if (view === 'pick') renderPick();
    else if (view === 'run') renderRun();
    else if (view === 'done') renderDone();
    app.dataset.view = view;
  }

  const isStandalone = () => window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function greeting() {
    const h = new Date().getHours();
    const name = (settings.name || '').trim();
    return `${h >= 5 && h < 18 ? 'Bonjour' : 'Bonsoir'}${name ? ', ' + esc(name) : ''}\u00a0! 👋`;
  }

  function today() {
    const day = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  function renderHome() {
    const showHint = isIOS() && !isStandalone() && !store.get(HINT_KEY);
    const cards = DATA.sessions.map((s, i) => `
      <button class="card${s.locked ? ' locked' : ''}" data-session="${s.id}" style="--i:${i}" data-action="start" data-id="${s.id}" ${s.locked ? 'disabled' : ''}>
        <span class="card-icon" aria-hidden="true">${s.emoji || icon(s.icon)}</span>
        <span class="card-body">
          <span class="card-title">
            <b>${esc(s.title)}</b>
            ${s.locked ? `<span class="tag">${esc(s.lockedLabel || 'Verrouillée')}</span>`
              : s.tag ? `<span class="tag">${esc(s.tag)}</span>` : `<small>${esc(s.estimatedTime)}</small>`}
          </span>
          <span class="card-sub">${esc(s.subtitle || '')}</span>
        </span>
        <span class="card-go" aria-hidden="true">${s.locked ? '🔒' : chevron}</span>
      </button>`).join('');

    app.innerHTML = `
      <header class="home-head">
        <span class="logo">${LOGO}</span>
        <span class="brand">
          <span class="brand-name">Grizzlift</span>
          <span class="tag">${esc(today())}</span>
        </span>
        <button class="icon-btn" data-action="settings" aria-label="Réglages">${gearIcon}</button>
      </header>
      <main class="home">
        <section class="hero">
          <h1>${greeting()}</h1>
          <p>Lance ta séance du jour. Pas de bla-bla, du rythme&nbsp;!</p>
        </section>
        ${showHint ? `
          <div class="hint">
            <span>Installe Grizzlift en plein écran : <b>Partager</b> › <b>Sur l’écran d’accueil</b>.</span>
            <button class="hint-x" data-action="dismiss-hint" aria-label="Masquer">✕</button>
          </div>` : ''}
        <div class="cards">${cards}</div>
        <p class="home-foot">⚡ Zéro saisie de poids — concentre-toi sur le rythme</p>
      </main>`;
  }

  const chevron = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';
  const gearIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';


  function renderPick() {
    const s = sessionById('abs');
    const rows = s.exercises.map((ex, i) => `
      <li>
        <button class="pick-row" data-action="pick-toggle" data-id="${ex.id}" aria-pressed="${pickSel.has(ex.id)}">
          <span class="check" aria-hidden="true"></span>
          <span class="dot cat-${ex.cat}" aria-hidden="true"></span>
          <span class="pick-txt">
            <b>${i + 1}. ${esc(ex.name)}</b>
            <small>${ex.sets} × ${esc(ex.reps)} · ${ex.rest} s${ex.advanced ? ' · <em>avancé</em>' : ''}</small>
          </span>
          <span class="pick-info" role="button" aria-label="Infos" data-action="info-ex" data-id="${ex.id}">i</span>
        </button>
      </li>`).join('');

    app.innerHTML = `
      <header class="bar">
        <button class="icon-btn" data-action="home" aria-label="Retour">←</button>
        <div class="bar-title">${esc(s.title)}<small>Coche tes exos, tire au sort ou fais la séance complète</small></div>
        <span class="icon-btn-space"></span>
      </header>
      <main class="screen pick">
        <ul class="pick-list">${rows}</ul>
        <p class="pick-note">${esc(s.note)}</p>
      </main>
      <footer class="actions">
        <button class="btn btn-xl btn-primary" id="pick-start" data-action="pick-start"></button>
        <div class="row">
          <button class="btn btn-secondary" data-action="random-open" data-id="abs">🎲 Au hasard</button>
          <button class="btn btn-secondary" data-action="pick-full">Complète · ${absFullMinutes()} min</button>
        </div>
      </footer>`;
    updatePickButton();
  }

  /* Tirage au sort : un exo par famille de mouvement (jamais deux qui se ressemblent),
     sans les exos avancés, puis remis dans l'ordre du programme.
     Les postures droite / gauche ("pair") sont tirées ensemble et comptent pour un exo. */
  const RANDOM = {
    abs: { choices: [2, 3, 4, 5, 6], def: 3, key: 'randomAbs', title: 'Abdos au hasard' },
    mobility: { choices: [3, 4, 5, 6, 7, 8], def: 5, key: 'randomMob', title: 'Mobilité au hasard' }
  };

  // Regroupe les exercices en "exos" tirables : une paire droite / gauche = un seul exo
  function drawUnits(session) {
    const units = [];
    session.exercises.filter((ex) => !ex.advanced).forEach((ex) => {
      const unit = ex.pair && units.find((u) => u.pair === ex.pair);
      if (unit) unit.exs.push(ex);
      else units.push({ pair: ex.pair, pattern: ex.pattern, exs: [ex] });
    });
    return units;
  }

  function draw(session, n) {
    const pool = drawUnits(session);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const used = new Set();
    const picked = new Set();
    for (const unit of pool) {
      if (used.size >= n) break;
      if (used.has(unit.pattern)) continue;
      used.add(unit.pattern);
      unit.exs.forEach((ex) => picked.add(ex.id));
    }
    return session.exercises.filter((ex) => picked.has(ex.id)).map((ex) => ex.id);
  }

  // Durée estimée. Abdos : ~40 s par série + les repos (sauf le dernier). Mobilité : maintien + transition.
  function drawMinutes(session, exs) {
    let sec;
    if (session.mode === 'auto') sec = exs.reduce((t, ex) => t + ex.duration + ex.transition, session.prepare - (exs.length ? exs[0].transition : 0));
    else sec = exs.reduce((t, ex) => t + ex.sets * (40 + ex.rest), 0) - (exs.length ? exs[exs.length - 1].rest : 0);
    return Math.max(1, Math.round(sec / 60));
  }

  let randomDraw = null; // { sessionId, n, ids }

  function newDraw(sessionId, n) {
    randomDraw = { sessionId, n, ids: draw(sessionById(sessionId), n) };
    openRandom();
  }

  function openRandom() {
    const { sessionId, n, ids } = randomDraw;
    const s = sessionById(sessionId);
    const cfg = RANDOM[sessionId];
    const exs = s.exercises.filter((ex) => ids.includes(ex.id));
    const units = drawUnits({ exercises: exs });
    const choices = cfg.choices.map((k) =>
      `<button data-action="random-n" data-n="${k}" aria-pressed="${k === n}">${k}</button>`).join('');
    const list = units.map(({ exs: [ex], pair }) => {
      const name = pair ? ex.name.replace(/\s*\((droit|gauche)\)/, '') : ex.name;
      const detail = s.mode === 'auto' ? (pair ? 'Droite + gauche' : `${ex.duration} s`) : `${ex.sets} × ${esc(ex.reps)}`;
      return `
      <li class="draw-row">
        ${thumb(ex)}
        <span class="pick-txt"><b>${esc(name)}</b><small>${detail} · ${esc(ex.target)}</small></span>
      </li>`;
    }).join('');
    const sum = s.mode === 'auto'
      ? `${units.length} exos · ${exs.length} postures · ≈ ${drawMinutes(s, exs)} min`
      : `${exs.length} exos · ${exs.reduce((t, ex) => t + ex.sets, 0)} séries · ≈ ${drawMinutes(s, exs)} min`;
    showModal(`
      <h2>🎲 ${cfg.title}</h2>
      <p class="target">Des exos tous différents : un seul par type de mouvement.</p>
      <p class="label">Nombre d’exos</p>
      <div class="seg seg-rounds">${choices}</div>
      <ul class="draw-list">${list}</ul>
      <p class="rounds-sum">${sum}</p>
      <button class="btn btn-xl btn-primary" data-action="random-start">Démarrer</button>
      <button class="btn btn-secondary" data-action="random-reroll">🎲 Relancer le tirage</button>
      <button class="btn btn-ghost" data-action="close-modal">Annuler</button>`);
  }

  // Séance abdos complète : chaque exo non avancé, une seule série
  const absFull = () => sessionById('abs').exercises.filter((ex) => !ex.advanced);
  const absFullMinutes = () => {
    const s = sessionById('abs');
    return drawMinutes(s, absFull().map((ex) => ({ ...ex, sets: s.fullSets })));
  };

  // Mobilité : séance complète ou tirage au sort
  function openMobility(s) {
    showModal(`
      <h2>${esc(s.emoji || '')} ${esc(s.title)}</h2>
      <p class="target">Enchaînement automatique : ${s.exercises[0].duration} s par posture, ${s.exercises[0].transition} s pour changer.</p>
      <button class="btn btn-xl btn-primary" data-action="mob-full">Séance complète · ${esc(s.estimatedTime)}</button>
      <button class="btn btn-secondary" data-action="random-open" data-id="${s.id}">🎲 Au hasard</button>
      <button class="btn btn-ghost" data-action="close-modal">Annuler</button>`);
  }

  function updatePickButton() {
    const btn = document.getElementById('pick-start');
    if (!btn) return;
    const n = pickSel.size;
    btn.disabled = n === 0;
    btn.textContent = n ? `Démarrer · ${n} exo${n > 1 ? 's' : ''}` : 'Coche des exos';
  }

  const imageSrc = (ex) => 'assets/exercises/' + (ex.image || ex.id + '.webp');

  function visual(ex) {
    const src = imageSrc(ex);
    const imgs = missingImages.has(src) ? '' : `<img class="v-fg" src="${src}" data-src="${src}" alt="">`;
    return `<div class="visual"><div class="ph">${icon(ex.icon)}</div>${imgs}</div>`;
  }

  function thumb(ex) {
    const src = imageSrc(ex);
    const img = missingImages.has(src) ? '' : `<img src="${src}" data-src="${src}" alt="">`;
    return `<span class="thumb">${icon(ex.icon)}${img}</span>`;
  }

  function dots(total, currentIdx) {
    return `<span class="dots" aria-hidden="true">${Array.from({ length: total }, (_, k) =>
      `<i class="${k < currentIdx ? 'done' : k === currentIdx ? 'cur' : ''}"></i>`).join('')}</span>`;
  }

  function ring(left, total, variant) {
    const sec = Math.max(0, Math.ceil(left / 1000));
    const frac = total ? Math.min(1, Math.max(0, left / total)) : 0;
    return `
      <div class="ring ring-${variant}${sec <= 5 ? ' final' : ''}${run.pausedLeft != null ? ' is-paused' : ''}" id="ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle class="ring-bg" cx="100" cy="100" r="90"/>
          <circle class="ring-fg" cx="100" cy="100" r="90" stroke-dasharray="${RING_C.toFixed(1)}" style="stroke-dashoffset:${(RING_C * (1 - frac)).toFixed(1)}"/>
        </svg>
        <div class="ring-num"><span id="timer">${sec}</span><small>s</small></div>
      </div>`;
  }

  function prevWorkIndex() {
    for (let i = run.step - 1; i >= 0; i--) if (plan.steps[i].kind === 'work') return i;
    return -1;
  }

  function progress() {
    const counted = (s) => s.kind === 'work' || s.kind === 'hold';
    const total = plan.steps.filter(counted).length;
    const done = plan.steps.slice(0, run.step).filter(counted).length;
    return Math.round((done / total) * 100);
  }

  function renderRun() {
    const st = current();
    const s = plan.session;
    // Pendant un repos ou une transition, ℹ︎ décrit l'exercice qui arrive
    const infoStep = st.kind === 'rest' ? plan.steps[run.step + 1] : st;
    const infoIdx = infoStep ? infoStep.ex : st.ex;

    const head = `
      <header class="bar">
        <button class="icon-btn" data-action="quit" aria-label="Quitter la séance">✕</button>
        <div class="bar-title">${esc(s.title)}<small>${positionLabel(st)}</small></div>
        <button class="icon-btn info-btn" data-action="info" data-ex="${infoIdx}" aria-label="Infos exercice">i</button>
      </header>
      <div class="progress"><i style="width:${progress()}%"></i></div>
      <div class="sound-pill" id="sound-pill" ${audio.ready() ? 'hidden' : ''}>Touche l’écran pour activer les bips</div>`;

    let body = '';
    if (st.kind === 'work') body = s.mode === 'circuit' ? workCircuit(st) : workSets(st);
    else if (st.kind === 'rest') body = restScreen(st);
    else body = autoScreen(st);

    app.innerHTML = head + body;
  }

  function positionLabel(st) {
    const s = plan.session;
    if (s.mode === 'auto') return `Posture ${st.ex + 1} / ${plan.exs.length}`;
    if (s.mode === 'circuit') return `Tour ${st.round} / ${plan.rounds}`;
    return `Exercice ${st.ex + 1} / ${plan.exs.length}`;
  }

  function backButton(label) {
    const prev = prevWorkIndex();
    if (prev < 0) return `<button class="btn btn-ghost" disabled>⬅ ${label.other}</button>`;
    const same = plan.steps[prev].ex === current().ex;
    return `<button class="btn btn-ghost" data-action="back">⬅ ${same ? label.same : label.other}</button>`;
  }

  function workSets(st) {
    const ex = plan.exs[st.ex];
    const last = run.step === plan.steps.length - 1;
    return `
      <main class="screen work">
        <div class="ex-head"><h1>${esc(ex.name)}</h1><p class="target">${esc(ex.target)}</p></div>
        ${visual(ex)}
        <div class="set-line">
          <div class="stat">
            <span class="k">Série</span>
            <span class="big">${st.set}<i>/${ex.sets}</i></span>
            ${dots(ex.sets, st.set - 1)}
          </div>
          <div class="stat stat-right">
            <span class="k">Objectif</span>
            <span class="big accent">${esc(ex.reps)}</span>
          </div>
        </div>
      </main>
      <footer class="actions">
        <button class="btn btn-xl btn-primary" data-action="next">${last ? 'Dernière série ✓' : 'Série terminée'}</button>
        ${backButton({ same: 'Série précédente', other: 'Exercice précédent' })}
      </footer>`;
  }

  function workCircuit(st) {
    const ex = plan.exs[st.ex];
    const last = run.step === plan.steps.length - 1;
    return `
      ${st.timed ? timedStation(st, ex, last) : `
      <main class="screen work">
        <div class="ex-head"><h1>${esc(ex.name)}</h1><p class="target">${esc(ex.target)}</p></div>
        ${visual(ex)}
        ${ex.warn ? `<p class="warn">${esc(ex.warn)}</p>` : ''}
        <div class="set-line">
          <div class="stat">
            <span class="k">Station</span>
            <span class="big">${st.ex + 1}<i>/${plan.exs.length}</i></span>
            ${dots(plan.exs.length, st.ex)}
          </div>
          <div class="stat stat-right">
            <span class="k">Objectif</span>
            <span class="big accent">${esc(ex.reps)}</span>
          </div>
        </div>
      </main>
      <footer class="actions">
        <button class="btn btn-xl btn-primary" data-action="next">${last ? 'Dernière station ✓' : 'Station terminée'}</button>
        <div class="row">
          ${backButton({ same: 'Précédente', other: 'Précédente' })}
          ${ex.skippable ? '<button class="btn btn-ghost" data-action="next">Sauter (genou) ➜</button>' : ''}
        </div>
      </footer>`}`;
  }

  // Station chronométrée (planche) : on se met en place, on lance, elle s'enchaîne seule à 0
  function timedStation(st, ex, last) {
    const started = run.endsAt != null;
    const total = st.timed * 1000;
    return `
      <main class="screen auto">
        <div class="ex-head">
          <p class="eyebrow">${started ? 'Tiens bon' : `Station ${st.ex + 1} / ${plan.exs.length}`}</p>
          <h1>${esc(ex.name)}</h1><p class="target">${esc(ex.target)}</p>
        </div>
        ${visual(ex)}
        ${ring(started ? run.endsAt - Date.now() : total, total, 'hold')}
        <p class="next-mini">${started ? (last ? 'Dernière station' : 'La suite s’enchaîne toute seule à 0') : 'Mets-toi en position, puis lance le chrono'}</p>
      </main>
      <footer class="actions">
        ${started
          ? `<button class="btn btn-xl btn-secondary" data-action="next">${last ? 'Terminer ✓' : 'Station terminée'}</button>`
          : `<button class="btn btn-xl btn-primary" data-action="timer-start">▶ Lancer · ${st.timed} s</button>`}
        ${backButton({ same: 'Précédente', other: 'Précédente' })}
      </footer>`;
  }

  function upcoming(st) {
    const nx = plan.steps[run.step + 1];
    if (!nx) return { label: 'Ensuite', main: 'Fin de séance', sub: '', ex: null };
    const ex = plan.exs[nx.ex];
    if (plan.session.mode === 'circuit') return { label: `À suivre · Tour ${nx.round} / ${plan.rounds}`, main: ex.name, sub: ex.reps, ex };
    if (nx.ex === st.ex) return { label: 'À suivre', main: `Série ${nx.set} / ${ex.sets}`, sub: ex.name, ex };
    return { label: 'Exercice suivant', main: ex.name, sub: `${ex.sets} × ${ex.reps}`, ex };
  }

  function restScreen(st) {
    const left = run.endsAt - Date.now();
    const nx = upcoming(st);
    const backLabel = plan.session.mode === 'circuit' ? 'Annuler / revenir à la station' : 'Annuler / revenir à la série';
    return `
      <main class="screen rest">
        <p class="eyebrow">Récupération</p>
        ${ring(left, st.dur * 1000, 'rest')}
        <div class="next-card">
          ${nx.ex ? thumb(nx.ex) : ''}
          <div class="next-txt">
            <span>${esc(nx.label)}</span>
            <b>${esc(nx.main)}</b>
            ${nx.sub ? `<small>${esc(nx.sub)}</small>` : ''}
          </div>
        </div>
      </main>
      <footer class="actions">
        <button class="btn btn-xl btn-primary" data-action="next">Passer</button>
        <button class="btn btn-ghost" data-action="cancel-rest">↩ ${backLabel}</button>
      </footer>`;
  }

  function autoScreen(st) {
    const ex = plan.exs[st.ex];
    const paused = run.pausedLeft != null;
    const left = paused ? run.pausedLeft : run.endsAt - Date.now();
    const isHold = st.kind === 'hold';
    const nextEx = isHold ? plan.exs[st.ex + 1] : null;
    let eyebrow = isHold ? 'Maintiens' : (st.ex === 0 ? 'Prépare-toi' : 'Change de posture');
    if (paused) eyebrow = 'En pause';
    return `
      <main class="screen auto ${isHold ? 'is-hold' : 'is-transition'}">
        <div class="ex-head">
          <p class="eyebrow">${eyebrow}</p>
          <h1>${esc(ex.name)}</h1><p class="target">${esc(ex.target)}</p>
        </div>
        ${visual(ex)}
        ${ring(left, st.dur * 1000, isHold ? 'hold' : 'rest')}
        <p class="next-mini">${isHold ? `À suivre : ${nextEx ? esc(nextEx.name) : 'fin de séance'}` : '&nbsp;'}</p>
      </main>
      <footer class="actions">
        <div class="row">
          <button class="btn btn-side" data-action="auto-prev" aria-label="Posture précédente" ${st.ex === 0 && !isHold ? 'disabled' : ''}>⬅</button>
          <button class="btn btn-pause" data-action="pause">${paused ? '▶ Reprendre' : '❚❚ Pause'}</button>
          <button class="btn btn-side" data-action="next" aria-label="${isHold ? 'Passer la posture' : 'Commencer maintenant'}">➜</button>
        </div>
      </footer>`;
  }

  function renderDone() {
    const s = summary || { title: '', minutes: 0, count: 0, unit: '' };
    app.innerHTML = `
      <main class="screen done">
        <p class="done-bubble">Grrr… bravo&nbsp;! 🐻</p>
        <span class="done-logo">${LOGO}</span>
        <h1>Séance terminée&nbsp;!<br><span>Excellent travail&nbsp;!</span></h1>
        <p class="target">${esc(s.title)}</p>
        <div class="stats">
          <div><b>${s.minutes}</b><small>min</small></div>
          <div><b>${s.count}</b><small>${esc(s.unit)}</small></div>
        </div>
      </main>
      <footer class="actions">
        <button class="btn btn-xl btn-primary" data-action="home">Retour à l’accueil</button>
      </footer>`;
  }

  /* ---------- Fenêtres modales ---------- */

  function showModal(html) {
    modal.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    modal.hidden = false;
  }
  function closeModal() {
    modal.hidden = true;
    modal.innerHTML = '';
  }

  function openInfo(ex) {
    showModal(`
      <h2>${esc(ex.name)}</h2>
      <p class="target">${esc(ex.target)}</p>
      <ul class="info-list">
        <li class="action"><b>Action</b>${esc(ex.info.action)}</li>
        <li class="focus"><b>Focus</b>${esc(ex.info.focus)}</li>
        <li class="avoid"><b>Piège</b>${esc(ex.info.avoid)}</li>
      </ul>
      <button class="btn btn-xl btn-secondary" data-action="close-modal">OK</button>`);
  }

  // Durée estimée : temps d'un tour déduit de l'estimation du programme (repos entre tours compris)
  function circuitMinutes(s, rounds) {
    const total = parseInt(String(s.estimatedTime).replace(/\D/g, ''), 10) || 0;
    const rest = s.roundRest / 60;
    const perRound = (total - (s.rounds - 1) * rest) / s.rounds;
    return Math.round(rounds * perRound + (rounds - 1) * rest);
  }

  function openRounds(s, chosen) {
    const choices = [1, 2, 3, 4, 5, 6].map((n) =>
      `<button data-action="rounds-pick" data-n="${n}" aria-pressed="${n === chosen}">${n}</button>`).join('');
    const rest = `${Math.floor(s.roundRest / 60)} min${s.roundRest % 60 ? ' ' + (s.roundRest % 60) : ''}`;
    showModal(`
      <h2>${esc(s.title)}</h2>
      <p class="target">${s.exercises.length} stations par tour · ${rest} de repos entre les tours</p>
      <p class="label">Nombre de tours</p>
      <div class="seg seg-rounds">${choices}</div>
      <p class="rounds-sum">${chosen} tour${chosen > 1 ? 's' : ''} · ${chosen * s.exercises.length} stations · ≈ ${circuitMinutes(s, chosen)} min</p>
      <button class="btn btn-xl btn-primary" data-action="rounds-start" data-n="${chosen}">Démarrer</button>
      <button class="btn btn-ghost" data-action="close-modal">Annuler</button>`);
  }

  function openQuit() {
    showModal(`
      <h2>Quitter la séance ?</h2>
      <p class="target">La progression de cette séance sera perdue.</p>
      <button class="btn btn-xl btn-primary" data-action="close-modal">Continuer</button>
      <button class="btn btn-danger" data-action="quit-confirm">Quitter</button>`);
  }

  function openSettings() {
    const opt = (mode, title, desc) => `
      <button class="opt" data-action="set-beep" data-mode="${mode}" aria-pressed="${settings.beepMode === mode}">
        <b>${title}</b><small>${desc}</small>
      </button>`;
    const seg = (theme, label) => `<button data-action="set-theme" data-theme-opt="${theme}" aria-pressed="${settings.appearance === theme}">${label}</button>`;
    showModal(`
      <h2>Réglages</h2>
      <p class="label">Ton prénom</p>
      <input class="field" id="name-input" type="text" maxlength="24" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="Pour l’accueil : « Bonsoir, … ! »" value="${esc(settings.name || '')}">
      <p class="label">Apparence</p>
      <div class="seg">${seg('auto', '📱 Auto')}${seg('dark', '🌙 Nuit')}${seg('light', '☀️ Jour')}</div>
      <p class="label">Bips du chrono</p>
      ${opt('ambient', 'Mixés à la musique', 'Spotify / Apple Music continuent au même volume. Muets si l’iPhone est en mode silencieux.')}
      ${opt('transient', 'Prioritaires', 'La musique baisse brièvement pendant le bip. Plus audible en salle.')}
      <button class="btn btn-secondary" data-action="test-sound">🔊 Tester le son</button>
      <button class="btn btn-xl btn-primary" data-action="close-modal">OK</button>
      <p class="credits">Photos : free-exercise-db (domaine public) · SkiErg : Kiet Le, CC BY 2.0 · L-sit : BandiSW, CC BY-SA 4.0 (Wikimedia Commons) · Animations : FitnessProgramer.com (usage personnel).</p>`);
  }

  /* ---------- Actions ---------- */

  const actions = {
    start(el) {
      const s = sessionById(el.dataset.id);
      if (!s || s.locked) return;
      if (s.mode === 'pick') { pickSel = new Set(); view = 'pick'; render(); return; }
      if (s.mode === 'circuit') { openRounds(s, settings.rounds || s.rounds); return; }
      if (s.mode === 'auto' && RANDOM[s.id]) { openMobility(s); return; }
      startRun(s.id);
    },
    'rounds-pick'(el) { openRounds(sessionById('fullbody'), Number(el.dataset.n)); },
    'rounds-start'(el) {
      const n = Number(el.dataset.n);
      settings.rounds = n; // le dernier choix est proposé la fois suivante
      store.set(SETTINGS_KEY, settings);
      closeModal();
      startRun('fullbody', null, n);
    },
    home() { view = 'home'; render(); },
    'pick-toggle'(el) {
      const id = el.dataset.id;
      if (pickSel.has(id)) pickSel.delete(id); else pickSel.add(id);
      el.setAttribute('aria-pressed', pickSel.has(id));
      updatePickButton();
    },
    'pick-start'() { if (pickSel.size) startRun('abs', [...pickSel]); },
    'pick-full'() { startRun('abs', absFull().map((ex) => ex.id), null, sessionById('abs').fullSets); },
    'mob-full'() { closeModal(); startRun('mobility'); },
    'random-open'(el) {
      const id = el.dataset.id;
      newDraw(id, settings[RANDOM[id].key] || RANDOM[id].def);
    },
    'random-n'(el) {
      const n = Number(el.dataset.n);
      settings[RANDOM[randomDraw.sessionId].key] = n; // le dernier nombre choisi est proposé la fois suivante
      store.set(SETTINGS_KEY, settings);
      newDraw(randomDraw.sessionId, n);
    },
    'random-reroll'() { newDraw(randomDraw.sessionId, randomDraw.n); },
    'random-start'() { closeModal(); startRun(randomDraw.sessionId, randomDraw.ids); },
    'info-ex'(el) { openInfo(sessionById('abs').exercises.find((e) => e.id === el.dataset.id)); },
    info(el) { openInfo(plan.exs[Number(el.dataset.ex)]); },
    next() { go(run.step + 1); },
    back() { const prev = prevWorkIndex(); if (prev >= 0) go(prev); },
    'cancel-rest'() { go(run.step - 1); },
    // Mobilité : revient au début (transition) de la posture précédente, ou relance la première
    'auto-prev'() {
      const st = current();
      const target = st.kind === 'hold' && st.ex === 0 ? 0 : Math.max(0, st.ex - 1);
      go(plan.steps.findIndex((s) => s.kind === 'transition' && s.ex === target));
    },
    pause() { togglePause(); },
    'timer-start'() {
      const st = current();
      if (!st.timed || run.endsAt != null) return;
      audio.go();
      run.endsAt = Date.now() + st.timed * 1000;
      lastBeep = null;
      persist();
      render();
    },
    quit() { openQuit(); },
    'quit-confirm'() { closeModal(); quitRun(); render(); },
    settings() { openSettings(); },
    'set-theme'(el) { setTheme(el.dataset.themeOpt); openSettings(); },
    'set-beep'(el) {
      settings.beepMode = el.dataset.mode;
      store.set(SETTINGS_KEY, settings);
      audio.applySession();
      openSettings();
    },
    'test-sound'() {
      audio.unlock();
      [0, 1, 2].forEach((i) => setTimeout(() => audio.low(), i * 1000));
      setTimeout(() => { audio.high(); haptic(); }, 3000);
    },
    'close-modal'() { closeModal(); },
    'dismiss-hint'() { store.set(HINT_KEY, true); render(); }
  };

  function onAction(e) {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    e.stopPropagation();
    const fn = actions[el.dataset.action];
    if (fn) fn(el);
  }

  app.addEventListener('click', onAction);
  // Prénom : enregistré à la frappe, l'accueil se met à jour derrière la fenêtre
  modal.addEventListener('input', (e) => {
    if (e.target.id !== 'name-input') return;
    settings.name = e.target.value;
    store.set(SETTINGS_KEY, settings);
    if (view === 'home') render();
  });
  modal.addEventListener('keydown', (e) => {
    if (e.target.id === 'name-input' && e.key === 'Enter') e.target.blur();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) { closeModal(); return; }
    onAction(e);
  });

  // Images d'exercice : affichées si le fichier existe, sinon le visuel de remplacement reste
  [app, modal].forEach((root) => {
    root.addEventListener('load', (e) => {
      if (e.target.tagName === 'IMG') e.target.parentNode.classList.add('has-img');
    }, true);
    root.addEventListener('error', (e) => {
      if (e.target.tagName !== 'IMG') return;
      missingImages.add(e.target.dataset.src);
      e.target.remove();
    }, true);
  });

  // Chaque contact réactive le son (iOS suspend l'AudioContext) et l'écran allumé
  document.addEventListener('pointerdown', () => {
    audio.unlock();
    if (wake.want) wake.on();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (wake.want) wake.on();
      tick();
    } else {
      persist();
    }
  });
  window.addEventListener('pagehide', persist);

  /* ---------- Démarrage ---------- */

  applyTheme();
  // Suit le passage jour / nuit de l'iPhone en direct, même app ouverte
  lightQuery.addEventListener('change', () => { if (settings.appearance === 'auto') applyTheme(); });

  restore();
  render();
  setInterval(tick, 200);

  if ('serviceWorker' in navigator) {
    // Nouvelle version installée : rechargement immédiat sur l'accueil, jamais en pleine séance
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && view !== 'run') location.reload();
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
