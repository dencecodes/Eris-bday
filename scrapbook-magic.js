/* =====================================================================
   SCRAPBOOK MAGIC  —  scrapbook-magic.js
   ---------------------------------------------------------------------
   Extra life for Scrapbook.html: drifting petals and hearts, gold dust,
   fluttering butterflies, twinkling stars, a slow shine that sweeps
   across each photo, a gentle tilt when the photos are touched, and a
   burst of hearts wherever she taps.

   Add ONE line before </body> in Scrapbook.html:

       <script src="scrapbook-magic.js"></script>

   It adds its own styles and elements, so nothing else needs editing.
   Everything here is decoration only — it never blocks taps, and it
   turns itself down when the phone asks for reduced motion.
   ===================================================================== */
(function () {
  'use strict';

  if (window.__scrapbookMagic) return;
  window.__scrapbookMagic = true;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rand(a, b) { return Math.random() * (b - a) + a; }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  var PINK = '#EB6E9B', ROSE = '#E69CBA', BLUSH = '#F4B3C7', PURPLE = '#826E8B', GOLD = '#F0C674';

  /* ---------- styles ---------- */
  var CSS = [
    /* two drifting layers: one behind the photos, one in front */
    '.sbm-layer{position:fixed;inset:0;overflow:hidden;pointer-events:none}',
    '.sbm-layer--back{z-index:2}',
    '.sbm-layer--front{z-index:30}',

    /* petals and hearts falling */
    '.sbm-fall{position:absolute;top:-12%;will-change:transform;animation:sbm-fall linear infinite}',
    '.sbm-fall svg{width:100%;height:auto;display:block}',
    '@keyframes sbm-fall{0%{transform:translate(0,-12vh) rotate(0deg)}50%{transform:translate(4vw,55vh) rotate(180deg)}100%{transform:translate(-4vw,118vh) rotate(360deg)}}',

    /* soft glowing bokeh rising from the bottom */
    '.sbm-bokeh{position:absolute;bottom:-8%;border-radius:50%;filter:blur(1px);will-change:transform;animation:sbm-rise linear infinite}',
    '@keyframes sbm-rise{0%{transform:translate(0,0) scale(.7);opacity:0}15%{opacity:.8}80%{opacity:.45}100%{transform:translate(3vw,-112vh) scale(1.1);opacity:0}}',

    /* little twinkling stars scattered over the page */
    '.sbm-twinkle{position:absolute;line-height:1;animation:sbm-twinkle ease-in-out infinite}',
    '@keyframes sbm-twinkle{0%,100%{opacity:.25;transform:scale(.7) rotate(0)}50%{opacity:1;transform:scale(1.25) rotate(18deg)}}',

    /* butterflies on a looping flight path, wings fluttering */
    '.sbm-fly{position:absolute;will-change:transform;animation:sbm-flight ease-in-out infinite}',
    '.sbm-fly svg{width:100%;height:auto;display:block}',
    '.sbm-fly .w-l,.sbm-fly .w-r{transform-box:fill-box;transform-origin:center right;animation:sbm-flutter .5s ease-in-out infinite}',
    '.sbm-fly .w-r{transform-origin:center left}',
    '@keyframes sbm-flutter{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.42)}}',
    '@keyframes sbm-flight{0%{transform:translate(0,0) rotate(-6deg)}25%{transform:translate(18vw,-9vh) rotate(9deg)}50%{transform:translate(34vw,6vh) rotate(-7deg)}75%{transform:translate(16vw,13vh) rotate(8deg)}100%{transform:translate(0,0) rotate(-6deg)}}',

    /* a slow shine that sweeps across each photo */
    '.photo-float{position:relative;overflow:hidden}',
    '.sbm-shine{position:absolute;inset:0;z-index:3;pointer-events:none;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.55) 50%,transparent 62%);transform:translateX(-120%);animation:sbm-shine 9s ease-in-out infinite}',
    '@keyframes sbm-shine{0%,72%{transform:translateX(-120%)}88%,100%{transform:translateX(120%)}}',

    /* the photos react to a touch */
    '.photo{cursor:pointer}',
    '.photo-float{transition:transform .45s cubic-bezier(.34,1.56,.64,1),filter .45s ease}',
    '.photo.sbm-lift .photo-float{animation-play-state:paused;transform:scale(1.06) rotate(-1deg);filter:drop-shadow(0 10px 18px rgba(139,63,82,.35))}',

    /* the title gets a soft glow that breathes */
    '.title-line--2{animation:sbm-glow 3.6s ease-in-out 4.5s infinite}',
    '@keyframes sbm-glow{0%,100%{filter:drop-shadow(0 0 0 rgba(235,110,155,0))}50%{filter:drop-shadow(0 0 12px rgba(235,110,155,.55))}}',

    /* hearts that pop out wherever she taps */
    '.sbm-pop{position:fixed;z-index:9998;pointer-events:none;line-height:1;font-size:var(--s,20px);transform:translate(-50%,-50%);animation:sbm-pop 1.5s cubic-bezier(.2,.7,.3,1) forwards}',
    '@keyframes sbm-pop{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.1) rotate(var(--r))}}',

    /* on small screens the original decorations are hidden; these stay */
    '@media (max-width:600px){.sbm-layer{position:fixed}}',
    '@media (prefers-reduced-motion:reduce){.sbm-layer,.sbm-shine{display:none}}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var back = document.createElement('div');
  back.className = 'sbm-layer sbm-layer--back';
  back.setAttribute('aria-hidden', 'true');
  var front = document.createElement('div');
  front.className = 'sbm-layer sbm-layer--front';
  front.setAttribute('aria-hidden', 'true');
  document.body.appendChild(back);
  document.body.appendChild(front);

  var small = window.innerWidth < 600;

  /* ---------- falling petals and hearts ---------- */
  var PETAL = '<svg viewBox="0 0 40 60"><path d="M20,2 C34,14 34,42 20,58 C6,42 6,14 20,2 Z" fill="currentColor"/></svg>';
  var HEART = '<svg viewBox="0 0 100 90"><path d="M50,85 C10,60 0,35 15,18 C28,4 48,10 50,28 C52,10 72,4 85,18 C100,35 90,60 50,85 Z" fill="currentColor"/></svg>';

  function addFalling(n, layer) {
    for (var i = 0; i < n; i++) {
      var el = document.createElement('div');
      el.className = 'sbm-fall';
      el.style.left = rand(-2, 100).toFixed(1) + '%';
      el.style.width = rand(10, 24).toFixed(0) + 'px';
      el.style.color = pick([PINK, ROSE, BLUSH, '#fff', GOLD]);
      el.style.opacity = rand(.45, .85).toFixed(2);
      el.style.animationDuration = rand(12, 24).toFixed(1) + 's';
      el.style.animationDelay = '-' + rand(0, 24).toFixed(1) + 's';
      el.innerHTML = Math.random() < .35 ? HEART : PETAL;
      layer.appendChild(el);
    }
  }

  /* ---------- rising bokeh ---------- */
  function addBokeh(n, layer) {
    for (var i = 0; i < n; i++) {
      var el = document.createElement('div');
      var size = rand(6, 26).toFixed(0);
      el.className = 'sbm-bokeh';
      el.style.left = rand(0, 100).toFixed(1) + '%';
      el.style.width = el.style.height = size + 'px';
      el.style.background = 'radial-gradient(circle,rgba(255,255,255,.95),' + pick([BLUSH, ROSE, GOLD]) + ' 45%,transparent 72%)';
      el.style.animationDuration = rand(11, 20).toFixed(1) + 's';
      el.style.animationDelay = '-' + rand(0, 20).toFixed(1) + 's';
      layer.appendChild(el);
    }
  }

  /* ---------- twinkling stars ---------- */
  function addTwinkles(n, layer) {
    for (var i = 0; i < n; i++) {
      var el = document.createElement('span');
      el.className = 'sbm-twinkle';
      el.textContent = pick(['✦', '✧', '·', '✦']);
      el.style.left = rand(3, 95).toFixed(1) + '%';
      el.style.top = rand(5, 92).toFixed(1) + '%';
      el.style.fontSize = rand(10, 24).toFixed(0) + 'px';
      el.style.color = pick([PINK, GOLD, ROSE, '#fff']);
      el.style.animationDuration = rand(2, 4).toFixed(1) + 's';
      el.style.animationDelay = '-' + rand(0, 4).toFixed(1) + 's';
      layer.appendChild(el);
    }
  }

  /* ---------- butterflies ---------- */
  var FLY =
    '<svg viewBox="0 0 60 44">' +
      '<g class="w-l" fill="currentColor">' +
        '<path d="M30,22 C22,4 4,2 3,14 C2,24 14,28 30,22 Z"/>' +
        '<path d="M30,24 C20,30 8,34 12,41 C17,46 28,36 30,24 Z"/>' +
      '</g>' +
      '<g class="w-r" fill="currentColor">' +
        '<path d="M30,22 C38,4 56,2 57,14 C58,24 46,28 30,22 Z"/>' +
        '<path d="M30,24 C40,30 52,34 48,41 C43,46 32,36 30,24 Z"/>' +
      '</g>' +
      '<ellipse cx="30" cy="24" rx="1.5" ry="9" fill="currentColor"/>' +
      '<line x1="30" y1="15" x2="26" y2="8" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/>' +
      '<line x1="30" y1="15" x2="34" y2="8" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/>' +
    '</svg>';

  function addButterflies(layer) {
    var list = [
      { left: '6%',  top: '58%', w: 34, color: ROSE,   dur: 17 },
      { left: '52%', top: '14%', w: 27, color: PINK,   dur: 14 },
      { left: '22%', top: '78%', w: 22, color: PURPLE, dur: 20 }
    ];
    list.slice(0, small ? 2 : 3).forEach(function (b, i) {
      var el = document.createElement('div');
      el.className = 'sbm-fly';
      el.style.left = b.left;
      el.style.top = b.top;
      el.style.width = b.w + 'px';
      el.style.color = b.color;
      el.style.animationDuration = b.dur + 's';
      el.style.animationDelay = '-' + (i * 4.5) + 's';
      el.innerHTML = FLY;
      layer.appendChild(el);
    });
  }

  /* ---------- a shine that sweeps over the photos ---------- */
  function addShine() {
    var frames = document.querySelectorAll('.photo .photo-float');
    for (var i = 0; i < frames.length; i++) {
      var s = document.createElement('span');
      s.className = 'sbm-shine';
      s.style.animationDelay = (i * 1.6).toFixed(1) + 's';
      frames[i].appendChild(s);
    }
  }

  /* ---------- photos lift when touched ---------- */
  function wirePhotos() {
    var photos = document.querySelectorAll('.photo');
    for (var i = 0; i < photos.length; i++) {
      (function (p) {
        p.addEventListener('pointerenter', function () { p.classList.add('sbm-lift'); });
        p.addEventListener('pointerleave', function () { p.classList.remove('sbm-lift'); });
        p.addEventListener('click', function () {
          p.classList.add('sbm-lift');
          setTimeout(function () { p.classList.remove('sbm-lift'); }, 700);
        });
      })(photos[i]);
    }
  }

  /* ---------- hearts wherever she taps ---------- */
  function wireTapHearts() {
    var glyphs = ['♥', '♥', '♡', '✦'];
    var colors = [PINK, ROSE, BLUSH, GOLD, PURPLE];
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.back-button, .bgm-btn, .bgm-panel')) return;
      for (var i = 0; i < 7; i++) {
        var h = document.createElement('span');
        h.className = 'sbm-pop';
        h.textContent = pick(glyphs);
        h.style.left = e.clientX + 'px';
        h.style.top = e.clientY + 'px';
        h.style.color = pick(colors);
        h.style.setProperty('--s', rand(14, 28).toFixed(0) + 'px');
        h.style.setProperty('--dx', rand(-70, 70).toFixed(0) + 'px');
        h.style.setProperty('--dy', rand(-160, -60).toFixed(0) + 'px');
        h.style.setProperty('--r', rand(-40, 40).toFixed(0) + 'deg');
        h.addEventListener('animationend', function () { this.remove(); });
        document.body.appendChild(h);
      }
    });
  }

  function init() {
    if (!reduced) {
      addFalling(small ? 10 : 18, front);
      addBokeh(small ? 10 : 18, back);
      addTwinkles(small ? 8 : 16, back);
      addButterflies(front);
      addShine();
    }
    wirePhotos();
    wireTapHearts();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
