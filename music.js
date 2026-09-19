/* =====================================================================
   SHARED MUSIC PLAYER  —  music.js
   ---------------------------------------------------------------------
   Put this file next to index.html and add ONE line before </body> on
   every page (index.html, LoveLetter.html, Scrapbook.html,
   thumbelina-bouquet.html):

       <script src="music.js"></script>

   It builds its own button, its own "Songs That Remind Me of You" panel
   and its own styles, so the other pages need nothing else.

   • The first song when the site opens is the one marked START_TRACK.
   • After a song ends, a different random song plays.
   • Moving between pages does NOT stop the music: the song and its exact
     position are remembered and picked up again on the next page. It only
     stops when she closes the website.
   • If an mp3 cannot be loaded it is skipped; if none load, a built-in
     music-box "Happy Birthday" plays so the page is never silent.

   TO ADD A SONG: copy a line in PLAYLIST, change title / artist / src,
   and drop the mp3 in the Music folder. `note` is optional — a small
   private line shown under the song.
   ===================================================================== */
(function () {
  'use strict';
  if (window.self !== window.top) return;   // inside the iframe: the parent page owns the music
  if (window.__bgmPlayerLoaded) return;
  window.__bgmPlayerLoaded = true;

  var PLAYLIST = [
    { title: 'Those Eyes',          artist: 'New West',        src: 'Music/New West - Those Eyes.mp3',                                              note: '' },
    { title: 'Tahanan',             artist: 'Adie',            src: 'Music/Adie - Tahanan (Official Lyric Video).mp3',                              note: '' },
    { title: 'I Love You Too Much', artist: 'The Book of Life',src: 'Music/I Love You Too Much  The Book of Life (Original Motion Picture Soundtrack).mp3', note: '' },
    { title: 'This I Promise You',  artist: '*NSYNC',          src: 'Music/NSYNC - This I Promise You (Lyrics).mp3',                                note: '' },
    { title: 'Until I Found You',   artist: 'Stephen Sanchez', src: 'Music/Stephen Sanchez - Until I Found You (Official Video).mp3',               note: '' },
    { title: 'Panata',              artist: 'Tothapi',         src: 'Music/Tothapi - Panata (Official Performance Video).mp3',                      note: '' }
  ];

  // The song that plays first when she opens the website.
  var START_TRACK = 'Those Eyes';

  PLAYLIST.forEach(function (t) { t.url = encodeURI(t.src); });

  function startIndex() {
    for (var i = 0; i < PLAYLIST.length; i++) {
      if (PLAYLIST[i].title === START_TRACK) return i;
    }
    return 0;
  }

  /* ---------- styles ---------- */
  var CSS = [
    '.bgm-btn{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9000;width:48px;height:48px;padding:0;border-radius:50%;border:1px solid var(--gold,#c6a15b);background:rgba(253,248,242,.88);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--burgundy,#6b2c39);display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 20px -6px rgba(107,44,57,.35);transition:transform .3s cubic-bezier(.34,1.56,.64,1),background .3s ease}',
    '.bgm-btn:hover{transform:scale(1.08)}.bgm-btn:active{transform:scale(.94)}',
    '.bgm-btn:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(255,255,255,.9),0 0 0 6px rgba(191,111,130,.55)}',
    '.bgm-btn.is-open{background:#fffdfb}',
    '.bgm-btn::after{content:"";position:absolute;inset:-1px;border-radius:50%;border:1.5px solid #e23e77;opacity:0;pointer-events:none;animation:bgm-pulse 2.4s ease-out infinite}',
    '.bgm-btn.is-playing::after,.bgm-btn.is-muted::after,.bgm-btn.is-open::after{animation:none}',
    '@keyframes bgm-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.7);opacity:0}}',
    '.bgm-btn__icon{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}',
    '.bgm-btn__slash{opacity:0;transition:opacity .25s ease}.bgm-btn.is-muted .bgm-btn__slash{opacity:1}',
    '.bgm-btn__bars{display:none;align-items:flex-end;gap:3px;height:18px}',
    '.bgm-btn.is-playing .bgm-btn__bars{display:flex}.bgm-btn.is-playing .bgm-btn__icon{display:none}',
    '.bgm-btn__bars i{width:3px;height:100%;border-radius:2px;background:linear-gradient(to top,#e23e77,#c6a15b);transform-origin:50% 100%;animation:bgm-eq 1s ease-in-out infinite}',
    '.bgm-btn__bars i:nth-child(2){animation-duration:.85s;animation-delay:-.3s}.bgm-btn__bars i:nth-child(3){animation-duration:1.15s;animation-delay:-.6s}',
    '@keyframes bgm-eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}',
    '.bgm-hint{position:fixed;right:calc(16px + 48px + 10px);bottom:calc(25px + env(safe-area-inset-bottom,0px));z-index:9000;padding:5px 13px;border-radius:999px;background:rgba(253,248,242,.92);color:#8c4655;font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:.98rem;white-space:nowrap;box-shadow:0 6px 16px -6px rgba(107,44,57,.3);opacity:0;transform:translateX(8px);pointer-events:none;transition:opacity .5s ease,transform .5s ease}',
    '.bgm-hint.is-shown{opacity:1;transform:none}',
    '.bgm-panel{position:fixed;right:16px;bottom:calc(16px + 48px + 12px + env(safe-area-inset-bottom,0px));z-index:9001;width:min(350px,calc(100vw - 32px));max-height:min(74vh,500px);display:flex;flex-direction:column;background:rgba(253,248,242,.96);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid #e3cd9a;border-radius:24px;box-shadow:0 24px 50px -14px rgba(107,44,57,.45),0 0 0 4px rgba(255,255,255,.35);color:#4a2e33;font-family:"Cormorant Garamond",Georgia,serif;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(14px) scale(.94);transform-origin:100% 100%;transition:opacity .35s ease,transform .45s cubic-bezier(.34,1.56,.64,1),visibility 0s .45s}',
    '.bgm-panel.is-open{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:opacity .35s ease,transform .45s cubic-bezier(.34,1.56,.64,1),visibility 0s}',
    '.bgm-panel *{box-sizing:border-box}',
    '.bgm-head{position:relative;padding:20px 52px 4px 22px;text-align:left}',
    '.bgm-title{margin:0;font-family:"Parisienne",cursive;font-weight:400;font-size:clamp(1.55rem,6vw,1.95rem);line-height:1.2;color:#6b2c39}',
    '.bgm-title .heart{color:#e23e77;font-family:serif;font-size:.7em}',
    '.bgm-sub{margin:2px 0 0;font-style:italic;font-size:.95rem;color:#8c4655}',
    '.bgm-close{position:absolute;top:12px;right:12px;width:32px;height:32px;padding:0;border:0;border-radius:50%;background:transparent;color:#8c4655;font-size:1.5rem;line-height:1;cursor:pointer;transition:background .25s ease,transform .25s ease}',
    '.bgm-close:hover{background:rgba(232,180,188,.35);transform:rotate(90deg)}',
    '.bgm-now{display:flex;align-items:center;gap:12px;margin:12px 16px 6px;padding:10px 14px 10px 10px;border-radius:18px;background:linear-gradient(135deg,#fbeaea,#fbead9);text-align:left}',
    '.bgm-toggle{flex:none;width:44px;height:44px;padding:0;border:0;border-radius:50%;display:grid;place-items:center;background:#e23e77;color:#fff;cursor:pointer;box-shadow:0 6px 14px -4px rgba(226,62,119,.55);transition:transform .25s cubic-bezier(.34,1.56,.64,1)}',
    '.bgm-toggle:hover{transform:scale(1.08)}.bgm-toggle:active{transform:scale(.94)}',
    '.bgm-toggle svg{width:20px;height:20px;display:block}',
    '.bgm-toggle .ic-pause{display:none}.bgm-toggle.is-playing .ic-play{display:none}.bgm-toggle.is-playing .ic-pause{display:block}',
    '.bgm-meta{min-width:0;display:flex;flex-direction:column}',
    '.bgm-label{font-size:.66rem;letter-spacing:.24em;text-transform:uppercase;color:#8c4655}',
    '.bgm-now-title{font-weight:600;font-size:1.15rem;line-height:1.2;color:#6b2c39;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bgm-now-artist{font-style:italic;font-size:.95rem;color:#8c4655;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bgm-list{list-style:none;margin:0;padding:6px 10px 14px;overflow-y:auto;-webkit-overflow-scrolling:touch}',
    '.bgm-list li{list-style:none;margin:0}',
    '.bgm-track{width:100%;display:flex;align-items:center;gap:12px;padding:9px 12px;border:0;border-radius:14px;background:transparent;font:inherit;color:inherit;text-align:left;cursor:pointer;transition:background .25s ease,transform .25s ease}',
    '.bgm-track:hover{background:rgba(232,180,188,.28)}.bgm-track:active{transform:scale(.98)}',
    '.bgm-track.is-current{background:rgba(226,62,119,.09)}',
    '.bgm-num,.bgm-eq{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center}',
    '.bgm-num{border:1px solid rgba(198,161,91,.7);font-size:.82rem;color:#8c4655}',
    '.bgm-track.is-current .bgm-num{border-color:#e23e77;color:#e23e77}',
    '.bgm-eq{display:none;align-items:flex-end;gap:2.5px;padding:5px 0}',
    '.bgm-track.is-playing .bgm-num{display:none}.bgm-track.is-playing .bgm-eq{display:flex}',
    '.bgm-eq i{width:3px;height:100%;border-radius:2px;background:linear-gradient(to top,#e23e77,#c6a15b);transform-origin:50% 100%;animation:bgm-eq 1s ease-in-out infinite}',
    '.bgm-eq i:nth-child(2){animation-duration:.85s;animation-delay:-.3s}.bgm-eq i:nth-child(3){animation-duration:1.15s;animation-delay:-.6s}',
    '.bgm-text{min-width:0;display:flex;flex-direction:column}',
    '.bgm-t-title{font-weight:600;font-size:1.1rem;line-height:1.25;color:#4a2e33}',
    '.bgm-track.is-current .bgm-t-title{color:#e23e77}',
    '.bgm-t-artist{font-style:italic;font-size:.92rem;color:#8c4655}',
    '.bgm-t-note{font-size:.88rem;color:#c98a93;margin-top:2px}',
    '@media (prefers-reduced-motion: reduce){.bgm-btn::after,.bgm-eq i,.bgm-btn__bars i{animation:none}}'
  ].join('\n');

  /* ---------- tiny helpers ---------- */
  function rand(a, b) { return Math.random() * (b - a) + a; }

  var store = (function () {
    var mem = {};
    function pick() {
      try { window.sessionStorage.setItem('__t', '1'); window.sessionStorage.removeItem('__t'); return window.sessionStorage; } catch (e) {}
      try { window.localStorage.setItem('__t', '1'); window.localStorage.removeItem('__t'); return window.localStorage; } catch (e) {}
      return null;
    }
    var s = pick();
    return {
      get: function (k) { try { return s ? s.getItem(k) : mem[k]; } catch (e) { return mem[k]; } },
      set: function (k, v) { try { if (s) s.setItem(k, v); else mem[k] = v; } catch (e) { mem[k] = v; } }
    };
  })();

  var STATE_KEY = 'bgm-state';

  /* ---------- player ---------- */
  var bgm = {
    audio: null, btn: null, hint: null, panel: null, list: null,
    toggle: null, nowLabel: null, nowTitle: null, nowArtist: null,
    mode: 'file', active: null,
    index: 0, seekTo: 0, failed: {},
    started: false, playing: false, wanted: true, armed: false,
    panelOpen: false, resumeOnShow: false,
    ctx: null, master: null, bus: null, nextTime: 0, step: 0,
    suspendTimer: null, fadeTimer: null, saveTimer: 0
  };

  function blockedError() {
    var e = new Error('Sound is blocked until the first tap');
    e.name = 'NotAllowedError';
    return e;
  }

  function pickRandom(exclude) {
    var pool = [];
    for (var i = 0; i < PLAYLIST.length; i++) {
      if (i !== exclude && !bgm.failed[i]) pool.push(i);
    }
    if (!pool.length) return -1;
    return pool[Math.floor(rand(0, pool.length))];
  }

  /* ---------- state kept between pages ---------- */
  function saveState() {
    var t = 0;
    if (bgm.audio && isFinite(bgm.audio.currentTime)) t = bgm.audio.currentTime;
    var data = {
      title: PLAYLIST[bgm.index] ? PLAYLIST[bgm.index].title : '',
      time: t,
      at: Date.now(),
      wanted: bgm.wanted,
      playing: bgm.playing,
      mode: bgm.mode,
      started: bgm.started
    };
    try { store.set(STATE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
  function loadState() {
    var raw = store.get(STATE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function indexOfTitle(title) {
    for (var i = 0; i < PLAYLIST.length; i++) { if (PLAYLIST[i].title === title) return i; }
    return -1;
  }

  /* ---------- music box fallback (Web Audio) ---------- */
  var BEAT = 0.62;
  var TUNE = [
    [392.00, .75], [392.00, .25],
    [440.00, 1], [392.00, 1], [523.25, 1],
    [493.88, 2], [392.00, .75], [392.00, .25],
    [440.00, 1], [392.00, 1], [587.33, 1],
    [523.25, 2], [392.00, .75], [392.00, .25],
    [783.99, 1], [659.25, 1], [523.25, 1],
    [493.88, 1], [440.00, 1], [698.46, .75], [698.46, .25],
    [659.25, 1], [523.25, 1], [587.33, 1],
    [523.25, 2], [0, 4]
  ];
  function ensureSynth() {
    if (bgm.ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('Web Audio is not supported');
    var ctx = new AC();
    var master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    var bus = ctx.createGain();
    var echo = ctx.createDelay(1); echo.delayTime.value = 0.38;
    var fb = ctx.createGain(); fb.gain.value = 0.32;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    bus.connect(master);
    bus.connect(echo); echo.connect(fb); fb.connect(echo);
    echo.connect(wet); wet.connect(master);
    bgm.ctx = ctx; bgm.master = master; bgm.bus = bus;
    bgm.nextTime = ctx.currentTime + 0.1;
    setInterval(scheduleSynth, 300);
  }
  function synthNote(freq, when, dur) {
    var ctx = bgm.ctx;
    [[1, .34, 1.9], [2, .15, 1.2], [4.02, .07, .45]].forEach(function (p) {
      var osc = ctx.createOscillator(), g = ctx.createGain();
      var end = when + Math.max(dur, .4) + p[2];
      osc.type = 'sine';
      osc.frequency.value = freq * p[0];
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(p[1], when + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(g); g.connect(bgm.bus);
      osc.start(when); osc.stop(end + 0.05);
    });
  }
  function scheduleSynth() {
    var ctx = bgm.ctx;
    if (!ctx) return;
    while (bgm.nextTime < ctx.currentTime + 1.2) {
      var n = TUNE[bgm.step], dur = n[1] * BEAT;
      if (n[0]) synthNote(n[0], bgm.nextTime, dur);
      bgm.nextTime += dur;
      bgm.step = (bgm.step + 1) % TUNE.length;
    }
  }
  function fadeMaster(target, secs) {
    var g = bgm.master.gain, t = bgm.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(target, t + secs);
  }
  function startSynth() {
    ensureSynth();
    var ctx = bgm.ctx;
    clearTimeout(bgm.suspendTimer);
    return Promise.race([ctx.resume(), new Promise(function (r) { setTimeout(r, 700); })]).then(function () {
      if (ctx.state !== 'running') throw blockedError();
      fadeMaster(0.6, 1.2);
    });
  }
  function stopSynth() {
    if (!bgm.ctx) return;
    fadeMaster(0, 0.5);
    clearTimeout(bgm.suspendTimer);
    bgm.suspendTimer = setTimeout(function () {
      if (!bgm.playing && bgm.ctx) bgm.ctx.suspend();
    }, 600);
  }

  /* ---------- the mp3 songs ---------- */
  function fadeAudio(target, ms, done) {
    clearInterval(bgm.fadeTimer);
    var from = bgm.audio.volume, t0 = Date.now();
    bgm.fadeTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / ms);
      bgm.audio.volume = from + (target - from) * k;
      if (k === 1) { clearInterval(bgm.fadeTimer); if (done) done(); }
    }, 40);
  }
  function startFile() {
    var resuming = bgm.seekTo > 0;   // carrying a song over from the previous page
    clearInterval(bgm.fadeTimer);
    bgm.audio.volume = resuming ? 0.6 : 0;
    return Promise.resolve(bgm.audio.play()).then(function () {
      if (bgm.seekTo > 0) {
        try { bgm.audio.currentTime = bgm.seekTo; } catch (e) { /* not ready yet */ }
        bgm.seekTo = 0;
      }
      // a fresh song eases in; a carried-over one is already at full volume
      if (!resuming) fadeAudio(0.6, 1200);
    });
  }
  function stopFile() { fadeAudio(0, 500, function () { bgm.audio.pause(); }); }

  function setTrack(i, time) {
    bgm.index = i;
    bgm.seekTo = time || 0;
    if (bgm.audio) {
      bgm.audio.src = PLAYLIST[i].url;
      if (bgm.seekTo > 0) {
        bgm.audio.addEventListener('loadedmetadata', function once() {
          bgm.audio.removeEventListener('loadedmetadata', once);
          try { bgm.audio.currentTime = bgm.seekTo; } catch (e) { /* ignore */ }
        });
      }
    }
    saveState();
    setUi();
  }
  function playFileWithFallback() {
    return startFile().then(function () { bgm.active = 'file'; }).catch(function (err) {
      if (err && err.name === 'NotAllowedError') throw err;
      bgm.failed[bgm.index] = true;
      var next = pickRandom(bgm.index);
      if (next < 0) {
        bgm.mode = 'synth';
        return startSynth().then(function () { bgm.active = 'synth'; });
      }
      setTrack(next, 0);
      return playFileWithFallback();
    });
  }
  function playNext() {
    var n = pickRandom(bgm.index);
    if (n < 0 && !bgm.failed[bgm.index]) n = bgm.index;
    if (n >= 0) setTrack(n, 0);
    bgm.playing = false;
    play().catch(onError);
  }

  function play() {
    if (bgm.playing) return Promise.resolve();
    var attempt = bgm.mode === 'file' && bgm.audio
      ? playFileWithFallback()
      : startSynth().then(function () { bgm.active = 'synth'; });
    return attempt.then(function () {
      bgm.playing = true;
      bgm.started = true;
      saveState();
      setUi();
    });
  }
  function pause() {
    if (!bgm.playing) return;
    bgm.playing = false;
    if (bgm.active === 'file') stopFile(); else stopSynth();
    saveState();
    setUi();
  }
  function userToggle() {
    if (bgm.playing) { bgm.wanted = false; pause(); }
    else { bgm.wanted = true; play().catch(onError); }
    saveState();
    setUi();
  }
  function chooseTrack(i) {
    if (bgm.mode === 'file' && i === bgm.index) { userToggle(); return; }
    bgm.wanted = true;
    if (bgm.mode === 'file') {
      bgm.failed[i] = false;
      setTrack(i, 0);
      bgm.playing = false;
      play().catch(onError);
    } else if (!bgm.playing) {
      play().catch(onError);
    }
    setUi();
  }

  function armGesture() {
    if (bgm.armed) return;
    bgm.armed = true;
    var events = ['pointerdown', 'touchend', 'click', 'keydown'];
    function onGesture(e) {
      if (e.target && e.target.closest && e.target.closest('.bgm-btn, .bgm-panel')) return;
      events.forEach(function (ev) { window.removeEventListener(ev, onGesture, true); });
      bgm.armed = false;
      if (bgm.wanted && !bgm.playing) play().catch(onError);
    }
    events.forEach(function (ev) { window.addEventListener(ev, onGesture, true); });
  }
  function onError(err) {
    if (err && err.name === 'NotAllowedError') { armGesture(); return; }
    if (bgm.btn) bgm.btn.hidden = true;
    closePanel();
  }

  /* ---------- panel ---------- */
  function openPanel() {
    bgm.panelOpen = true;
    bgm.panel.classList.add('is-open');
    bgm.panel.setAttribute('aria-hidden', 'false');
    bgm.btn.classList.add('is-open');
    bgm.btn.setAttribute('aria-expanded', 'true');
    if (bgm.hint) bgm.hint.classList.remove('is-shown');
  }
  function closePanel() {
    if (!bgm.panel) return;
    bgm.panelOpen = false;
    bgm.panel.classList.remove('is-open');
    bgm.panel.setAttribute('aria-hidden', 'true');
    bgm.btn.classList.remove('is-open');
    bgm.btn.setAttribute('aria-expanded', 'false');
  }

  function setUi() {
    if (!bgm.btn) return;
    bgm.btn.classList.toggle('is-playing', bgm.playing);
    bgm.btn.classList.toggle('is-muted', !bgm.playing && !bgm.wanted);
    if (bgm.playing && bgm.hint) bgm.hint.classList.remove('is-shown');

    if (bgm.toggle) {
      bgm.toggle.classList.toggle('is-playing', bgm.playing);
      bgm.toggle.setAttribute('aria-label', bgm.playing ? 'Pause music' : 'Play music');
    }

    var synth = bgm.mode === 'synth';
    var t = PLAYLIST[bgm.index];
    if (bgm.nowLabel) bgm.nowLabel.textContent = bgm.playing ? 'Now playing' : (bgm.started ? 'Paused' : 'Up next');
    if (bgm.nowTitle) bgm.nowTitle.textContent = synth ? 'Happy Birthday' : (t ? t.title : '');
    if (bgm.nowArtist) bgm.nowArtist.textContent = synth ? 'Music box' : (t ? t.artist : '');

    if (bgm.list) {
      var rows = bgm.list.querySelectorAll('.bgm-track');
      for (var k = 0; k < rows.length; k++) {
        var current = !synth && k === bgm.index;
        rows[k].classList.toggle('is-current', current);
        rows[k].classList.toggle('is-playing', current && bgm.playing);
        if (current) rows[k].setAttribute('aria-current', 'true');
        else rows[k].removeAttribute('aria-current');
      }
    }
  }

  /* ---------- build the button + panel ---------- */
  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var audio = document.createElement('audio');
    audio.id = 'bgmAudio';
    audio.preload = 'auto';
    document.body.appendChild(audio);
    bgm.audio = audio;

    var hint = document.createElement('span');
    hint.className = 'bgm-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = 'Tap for music ♪';
    document.body.appendChild(hint);
    bgm.hint = hint;

    var panel = document.createElement('div');
    panel.className = 'bgm-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Songs that remind me of you');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="bgm-head">' +
        '<h2 class="bgm-title">Songs That Remind Me of You <span class="heart">♥</span></h2>' +
        '<p class="bgm-sub">Tap a song to play it</p>' +
        '<button class="bgm-close" type="button" aria-label="Close song list">&times;</button>' +
      '</div>' +
      '<div class="bgm-now">' +
        '<button class="bgm-toggle" type="button" aria-label="Play music">' +
          '<svg class="ic-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>' +
          '<svg class="ic-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>' +
        '</button>' +
        '<span class="bgm-meta">' +
          '<span class="bgm-label"></span>' +
          '<span class="bgm-now-title"></span>' +
          '<span class="bgm-now-artist"></span>' +
        '</span>' +
      '</div>' +
      '<ol class="bgm-list"></ol>';
    document.body.appendChild(panel);
    bgm.panel = panel;
    bgm.list = panel.querySelector('.bgm-list');
    bgm.toggle = panel.querySelector('.bgm-toggle');
    bgm.nowLabel = panel.querySelector('.bgm-label');
    bgm.nowTitle = panel.querySelector('.bgm-now-title');
    bgm.nowArtist = panel.querySelector('.bgm-now-artist');

    PLAYLIST.forEach(function (t, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bgm-track';
      b.setAttribute('data-index', i);
      b.innerHTML =
        '<span class="bgm-num">' + (i + 1) + '</span>' +
        '<span class="bgm-eq" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="bgm-text">' +
          '<span class="bgm-t-title"></span>' +
          '<span class="bgm-t-artist"></span>' +
          (t.note ? '<span class="bgm-t-note"></span>' : '') +
        '</span>';
      b.querySelector('.bgm-t-title').textContent = t.title;
      b.querySelector('.bgm-t-artist').textContent = t.artist;
      if (t.note) b.querySelector('.bgm-t-note').textContent = t.note;
      li.appendChild(b);
      bgm.list.appendChild(li);
    });

    var btn = document.createElement('button');
    btn.className = 'bgm-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Songs that remind me of you');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<svg class="bgm-btn__icon" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>' +
        '<line class="bgm-btn__slash" x1="3" y1="3" x2="21" y2="21"/>' +
      '</svg>' +
      '<span class="bgm-btn__bars" aria-hidden="true"><i></i><i></i><i></i></span>';
    document.body.appendChild(btn);
    bgm.btn = btn;
  }

  function wire() {
    bgm.btn.addEventListener('click', function () {
      if (bgm.panelOpen) { closePanel(); return; }
      openPanel();
      if (bgm.wanted && !bgm.playing) play().catch(onError);
    });
    bgm.toggle.addEventListener('click', userToggle);
    bgm.panel.querySelector('.bgm-close').addEventListener('click', closePanel);
    bgm.list.addEventListener('click', function (e) {
      var row = e.target.closest ? e.target.closest('.bgm-track') : null;
      if (!row) return;
      chooseTrack(parseInt(row.getAttribute('data-index'), 10));
    });

    document.addEventListener('pointerdown', function (e) {
      if (!bgm.panelOpen) return;
      if (e.target.closest && e.target.closest('.bgm-panel, .bgm-btn')) return;
      closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bgm.panelOpen) { closePanel(); bgm.btn.focus(); }
    });

    bgm.audio.addEventListener('ended', function () { playNext(); });
    bgm.audio.addEventListener('error', function () {
      if (bgm.mode !== 'file') return;
      bgm.failed[bgm.index] = true;
      if (bgm.playing && bgm.active === 'file') playNext();
    });
    // remember the exact spot in the song, a few times a second is plenty
    bgm.audio.addEventListener('timeupdate', function () {
      var now = Date.now();
      if (now - bgm.saveTimer < 250) return;
      bgm.saveTimer = now;
      saveState();
    });

    // leaving for another page of the gift: save so the song carries on there
    window.addEventListener('pagehide', saveState);
    window.addEventListener('beforeunload', saveState);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { saveState(); return; }   // leaving the tab: keep playing
      // back on the tab: if the browser paused the song while she was away, pick it up again
      if (bgm.wanted && bgm.playing && bgm.audio && bgm.audio.paused && bgm.active === 'file') {
        bgm.playing = false;
        play().catch(onError);
      }
    });

    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      bgm.playing = false;
      setUi();
      if (bgm.wanted) play().catch(onError);
    });
  }

  function start() {
    if (!bgm.wanted) return;
    // browsers only allow sound after a tap, so line that up right away too
    armGesture();
    play().catch(onError);
    setTimeout(function () {
      if (!bgm.playing && bgm.wanted && !bgm.panelOpen && bgm.hint) {
        bgm.hint.classList.add('is-shown');
        setTimeout(function () { bgm.hint.classList.remove('is-shown'); }, 7000);
      }
    }, 900);
  }

  function init() {
    if (!PLAYLIST.length) return;
    build();

    var saved = loadState();
    var i = startIndex(), time = 0;
    if (saved) {
      // coming from another page of the gift: carry on with the same song
      var si = indexOfTitle(saved.title);
      if (si >= 0) {
        i = si;
        time = saved.time || 0;
        // the new page took a moment to load: skip past that gap so the song lines up
        if (saved.playing && saved.at) {
          var gap = (Date.now() - saved.at) / 1000;
          if (gap > 0 && gap < 6) time += gap;
        }
      }
      if (saved.wanted === false) bgm.wanted = false;
      if (saved.mode === 'synth') bgm.mode = 'synth';
      bgm.started = !!saved.started;
    }
    setTrack(i, time);

    wire();
    setUi();

    // try to sound straight away; if the browser refuses, the first tap starts it
    start();
    if (document.readyState !== 'complete') {
      window.addEventListener('load', function () {
        if (!bgm.playing && bgm.wanted) play().catch(onError);
      });
    }
  }

  window.Bgm = { play: play, pause: pause, open: openPanel, close: closePanel,
                 isPlaying: function () { return bgm.playing; } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();