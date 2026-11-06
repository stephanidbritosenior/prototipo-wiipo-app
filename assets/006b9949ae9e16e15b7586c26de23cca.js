/* Wiipo – experiência de toque no protótipo (mouse se comporta como dedo)
 * - Arrastar com o mouse rola a tela (vertical) e os carrosséis (horizontal), com inércia.
 * - Carrosséis horizontais NÃO respondem à roda/trackpad horizontal: só arrastando.
 * - Cursor: mão aberta (grab) em áreas roláveis, mãozinha (pointer) em itens clicáveis,
 *   mão fechada (grabbing) enquanto arrasta.
 * - Toque real (celular) continua usando a rolagem nativa do navegador.
 */
(function () {
  if (window.__wiipoToque) return;
  window.__wiipoToque = true;

  var DRAG_START = 6;      // px antes de considerar que é um arraste (e não um toque)
  var FRICTION = 0.94;     // desaceleração da inércia por quadro (~16ms)
  var MIN_V = 0.02;        // px/ms: abaixo disso a inércia para

  function injectCSS() {
    if (document.getElementById('wiipo-toque-css')) return;
    var st = document.createElement('style');
    st.id = 'wiipo-toque-css';
    st.textContent = [
      '.wt-scroller{cursor:grab;-webkit-user-select:none;user-select:none;overscroll-behavior:contain}',
      '.wt-scroller img,.wt-scroller svg{-webkit-user-drag:none;user-select:none}',
      'a,button,[role="button"],label,summary,.kb-key{cursor:pointer}',
      'input,textarea{cursor:text;-webkit-user-select:text;user-select:text}',
      'html.wt-dragging,html.wt-dragging *{cursor:grabbing!important;-webkit-user-select:none!important;user-select:none!important}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  function canScroll(el, axis) {
    if (!el || el.nodeType !== 1) return false;
    var cs = window.getComputedStyle(el);
    if (axis === 'x') {
      return (cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1;
    }
    return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1;
  }

  function findScrollers(target) {
    var hx = null, vy = null, el = target;
    while (el && el !== document.body && el !== document.documentElement) {
      if (!hx && canScroll(el, 'x')) hx = el;
      if (!vy && canScroll(el, 'y')) vy = el;
      if (hx && vy) break;
      el = el.parentElement;
    }
    return { hx: hx, vy: vy };
  }

  function isTextField(el) {
    return !!(el && el.closest && el.closest('input, textarea, select, [contenteditable="true"]'));
  }

  // Marca áreas roláveis para o cursor de "mão aberta"
  document.addEventListener('mouseover', function (e) {
    var s = findScrollers(e.target);
    if (s.hx && !s.hx.classList.contains('wt-scroller')) s.hx.classList.add('wt-scroller');
    if (s.vy && !s.vy.classList.contains('wt-scroller')) s.vy.classList.add('wt-scroller');
  }, true);

  var drag = null;        // arraste em andamento
  var inertia = null;     // animação de inércia em andamento
  var suppressClick = false;

  function stopInertia() {
    if (inertia) { cancelAnimationFrame(inertia.raf); inertia = null; }
  }

  function setScroll(el, axis, v) {
    if (axis === 'x') el.scrollLeft = v; else el.scrollTop = v;
  }
  function getScroll(el, axis) {
    return axis === 'x' ? el.scrollLeft : el.scrollTop;
  }

  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    stopInertia();
    if (isTextField(e.target)) return;
    var s = findScrollers(e.target);
    if (!s.hx && !s.vy) return;
    drag = {
      x0: e.clientX, y0: e.clientY, hx: s.hx, vy: s.vy,
      axis: null, el: null, start: 0, moved: false,
      samples: [{ t: performance.now(), x: e.clientX, y: e.clientY }]
    };
  }, true);

  window.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerType !== 'mouse') return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.axis) {
      if (Math.abs(dx) < DRAG_START && Math.abs(dy) < DRAG_START) return;
      if (Math.abs(dx) > Math.abs(dy) && drag.hx) drag.axis = 'x';
      else if (drag.vy) drag.axis = 'y';
      else if (drag.hx) drag.axis = 'x';
      else { drag = null; return; }
      drag.el = drag.axis === 'x' ? drag.hx : drag.vy;
      drag.start = getScroll(drag.el, drag.axis);
      drag.moved = true;
      document.documentElement.classList.add('wt-dragging');
      var sel = window.getSelection && window.getSelection();
      if (sel && sel.removeAllRanges) sel.removeAllRanges();
    }
    var d = drag.axis === 'x' ? dx : dy;
    setScroll(drag.el, drag.axis, drag.start - d);
    var now = performance.now();
    drag.samples.push({ t: now, x: e.clientX, y: e.clientY });
    while (drag.samples.length > 2 && now - drag.samples[0].t > 100) drag.samples.shift();
    e.preventDefault();
  }, { passive: false });

  function endDrag() {
    if (!drag) return;
    var d = drag;
    drag = null;
    document.documentElement.classList.remove('wt-dragging');
    if (!d.moved) return;
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 0);
    // Inércia (flick)
    var a = d.samples[0], b = d.samples[d.samples.length - 1];
    var dt = Math.max(1, b.t - a.t);
    var v = d.axis === 'x' ? (b.x - a.x) / dt : (b.y - a.y) / dt; // px/ms (direção do dedo)
    if (performance.now() - b.t > 80 || Math.abs(v) < MIN_V * 4) return;
    var el = d.el, axis = d.axis, last = performance.now();
    inertia = { raf: 0 };
    var step = function (now) {
      var frame = Math.min(48, now - last); last = now;
      v *= Math.pow(FRICTION, frame / 16);
      var before = getScroll(el, axis);
      setScroll(el, axis, before - v * frame);
      if (Math.abs(v) < MIN_V || getScroll(el, axis) === before) { inertia = null; return; }
      inertia.raf = requestAnimationFrame(step);
    };
    inertia.raf = requestAnimationFrame(step);
  }
  window.addEventListener('pointerup', endDrag, true);
  window.addEventListener('pointercancel', endDrag, true);
  window.addEventListener('blur', endDrag);

  // Depois de um arraste, o soltar do mouse não deve "clicar" no card
  document.addEventListener('click', function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
  }, true);

  // Sem arrastar imagens/links "fantasma"
  document.addEventListener('dragstart', function (e) {
    if (findScrollers(e.target).hx || findScrollers(e.target).vy) e.preventDefault();
  }, true);

  // Carrosséis horizontais: bloquear roda/trackpad horizontal (só arrastando)
  document.addEventListener('wheel', function (e) {
    stopInertia();
    var horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || (e.shiftKey && e.deltaY !== 0);
    if (!horizontal) return;
    var s = findScrollers(e.target);
    if (s.hx) e.preventDefault();
  }, { passive: false, capture: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectCSS);
  else injectCSS();
})();
