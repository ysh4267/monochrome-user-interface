/*!
 * 흑백 모노크롬 유저 인터페이스 — 도우미 스크립트 (선택 사항)
 * ---------------------------------------------------------------------------
 * 모양과 모션은 전부 CSS에 있습니다. 이 파일이 하는 일은 딱 세 가지입니다.
 *   1) 클래스를 붙였다 떼기        (다이얼로그 열기, 탭 전환, 선택 표시 …)
 *   2) 일회성 연출용 마크업 꽂기    (구매 효과의 별·점, 레벨 표, 획득 라벨 …)
 *   3) 마우스를 따라다니는 커서     (RR.cursor.enable — 켜야만 동작)
 *
 * HTML 속성만으로 쓰는 법 (JS를 한 줄도 안 써도 됩니다):
 *   data-rr-open="#id"        누르면 그 모달을 엽니다
 *   data-rr-close             누르면 자기가 속한 모달을 닫습니다
 *   data-rr-tab="#panel"      탭 버튼. 같은 .rr-tabs 안의 탭과 짝이 되는 패널을 전환
 *   data-rr-step="-1|1"       .rr-stepper 안의 좌우 버튼 (값 목록은 data-rr-options='["끔","켬"]')
 *   data-rr-buy               누르면 구매 효과 재생 (data-rr-level="3" 이면 "Lv.3" 표도 뜸)
 *   data-rr-pick              계약 카드. 누르면 도장이 찍히고 나머지 카드가 사라짐
 *
 * 직접 부르는 법:  RR.purchase(button, { level: 3 })  등. 아래 주석 참고.
 * 이벤트:  rr:open, rr:close, rr:change, rr:confirm, rr:pick, rr:buy  (모두 버블링)
 */
(function () {
  'use strict';

  var RR = {};
  var doc = document;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function resolve(target) { return typeof target === 'string' ? doc.querySelector(target) : target; }
  function emit(node, name, detail) {
    node.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }
  function make(tag, cls, vars) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (vars) Object.keys(vars).forEach(function (k) { e.style.setProperty(k, vars[k]); });
    return e;
  }
  /* 같은 애니메이션을 처음부터 다시 틀기: 클래스를 뗐다가 리플로 뒤에 다시 붙입니다 */
  function replay(node, cls, ms) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    if (ms) setTimeout(function () { node.classList.remove(cls); }, ms);
  }
  function cssMs(node, name, fallback) {
    var v = getComputedStyle(node).getPropertyValue(name).trim();
    if (!v) return fallback;
    return v.slice(-2) === 'ms' ? parseFloat(v) : parseFloat(v) * 1000;
  }

  /* ── 모달 ─────────────────────────────────────────────────────────────── */

  RR.open = function (target) {
    var m = resolve(target);
    if (!m) return;
    m.classList.add('is-open');
    emit(m, 'rr:open');
  };
  RR.close = function (target) {
    var m = resolve(target);
    if (!m) return;
    m.classList.remove('is-open');
    Array.prototype.forEach.call(m.querySelectorAll('.is-picked, .is-passed, .is-confirmed'), function (n) {
      n.classList.remove('is-picked', 'is-passed', 'is-confirmed');
    });
    emit(m, 'rr:close');
  };

  /* ── 구매 효과 ────────────────────────────────────────────────────────────
     RR.burst(host, { stars: 8, dots: 8, squares: 0 })  host 한가운데에서 터뜨립니다.
     RR.levelTag(host, 'Lv.3')                           host 위에 레벨 표를 띄웁니다.
     RR.jolt(node)                                       node 를 한 번 덜컹.
     RR.purchase(button, { level: 3 })                   위 셋 + 버튼 되튐을 한꺼번에.   */

  RR.burst = function (target, opts) {
    var host = resolve(target);
    if (!host) return null;
    opts = opts || {};
    var stars = opts.stars == null ? 9 : opts.stars;
    var dots = opts.dots == null ? 8 : opts.dots;
    var squares = opts.squares || 0;
    var reach = opts.reach || 1;
    var b = make('span', 'rr-burst');
    b.setAttribute('aria-hidden', 'true');
    b.appendChild(make('i', 'rr-burst__spikes', { transform: 'rotate(' + Math.round(rand(0, 360)) + 'deg)' }));
    b.appendChild(make('i', 'rr-burst__ring'));
    b.appendChild(make('i', 'rr-burst__ring rr-burst__ring--2'));
    var i, a, d;
    for (i = 0; i < stars + squares; i++) {
      /* 별은 주로 위쪽과 옆으로 날아갑니다 */
      a = rand(-200, 20) * Math.PI / 180;
      d = rand(60, 170) * reach;
      b.appendChild(make('i', i < stars ? 'rr-burst__p rr-burst__p--star rr-icon--star' : 'rr-burst__p rr-burst__p--sq' + (Math.random() < 0.5 ? ' is-hollow' : ''), {
        '--dx': Math.round(Math.cos(a) * d) + 'px',
        '--dy': Math.round(Math.sin(a) * d) + 'px',
        '--size': Math.round(rand(13, 30)) + 'px',
        '--rot': Math.round(rand(-260, 260)) + 'deg',
        'animation-delay': Math.round(rand(0, 40)) + 'ms'
      }));
    }
    for (i = 0; i < dots; i++) {
      a = rand(-170, -10) * Math.PI / 180;
      d = rand(40, 110) * reach;
      b.appendChild(make('i', 'rr-burst__p rr-burst__p--dot', {
        '--dx': Math.round(Math.cos(a) * d) + 'px',
        '--dy': Math.round(Math.sin(a) * d * 0.8) + 'px',
        '--fall': Math.round(rand(60, 130)) + 'px',
        '--size': Math.round(rand(5, 10)) + 'px',
        'animation-delay': Math.round(rand(0, 60)) + 'ms'
      }));
    }
    host.classList.add('is-bursting');
    host.appendChild(b);
    setTimeout(function () {
      b.remove();
      if (!host.querySelector('.rr-burst')) host.classList.remove('is-bursting');
    }, 1350);
    return b;
  };

  RR.levelTag = function (target, text, opts) {
    var host = resolve(target);
    if (!host) return null;
    var old = host.querySelector('.rr-lvtag');
    if (old) old.remove();
    var t = make('span', 'rr-lvtag' + (opts && opts.max ? ' rr-lvtag--max' : ''));
    t.textContent = text;
    host.appendChild(t);
    setTimeout(function () { t.remove(); }, 1750);
    return t;
  };

  RR.jolt = function (target) {
    var n = resolve(target);
    if (n) replay(n, 'is-jolt', 400);
  };

  RR.purchase = function (target, opts) {
    var btn = resolve(target);
    if (!btn) return;
    opts = opts || {};
    replay(btn, 'is-bought', 420);
    RR.burst(btn, opts);
    if (opts.level != null) RR.levelTag(btn, opts.max ? 'MAX!' : 'Lv.' + opts.level, opts);
    if (opts.jolt !== false) RR.jolt(btn.closest('.rr-dockwrap') || btn.closest('.rr-dock'));
    emit(btn, 'rr:buy', opts);
  };

  /* ── HUD 연출 ─────────────────────────────────────────────────────────────
     RR.bump(el)                              콤보 라벨 등을 툭 키웠다 되돌립니다.
     RR.gain(layer, '+16,608', x, y)          layer 안 (x, y) 에 획득 라벨을 띄웁니다.
     RR.count(el, 1200000, { ms: 400 })       숫자를 굴려 올립니다(format 으로 표기 변경). */

  RR.bump = function (target) {
    var n = resolve(target);
    if (n) replay(n, 'is-bump', 160);
  };

  RR.gain = function (layerTarget, text, x, y, opts) {
    var layer = resolve(layerTarget);
    if (!layer) return null;
    var g = make('span', 'rr-gain is-live' + (opts && opts.large ? ' rr-gain--lg' : ''));
    g.style.position = 'absolute';
    g.style.left = x + 'px';
    g.style.top = y + 'px';
    g.appendChild(make('i', 'rr-icon rr-icon--ring'));
    g.appendChild(doc.createTextNode(text));
    layer.appendChild(g);
    setTimeout(function () { g.remove(); }, 920);
    return g;
  };

  RR.count = function (target, to, opts) {
    var n = resolve(target);
    if (!n) return;
    opts = opts || {};
    var from = opts.from == null ? parseFloat(String(n.textContent).replace(/[^0-9.\-]/g, '')) || 0 : opts.from;
    var ms = opts.ms || 400;
    var fmt = opts.format || function (v) { return Math.round(v).toLocaleString('ko-KR'); };
    var t0 = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - t0) / ms);
      var e = 1 - Math.pow(1 - p, 3);
      n.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  };

  /* ── 계약 카드 고르기 ─────────────────────────────────────────────────── */

  RR.pick = function (target) {
    var card = resolve(target);
    if (!card || card.classList.contains('is-picked')) return;
    var group = card.parentElement;
    Array.prototype.forEach.call(group.children, function (c) {
      if (c !== card) c.classList.add('is-passed');
    });
    card.classList.add('is-picked');
    /* 도장이 찍히고 0.5초쯤 머문 뒤에 알립니다(원본의 호흡) */
    setTimeout(function () { emit(card, 'rr:pick'); }, 780);
  };

  /* ── 마우스를 따라다니는 커서 ─────────────────────────────────────────────
     CSS 커서는 그림이 고정이라 문짝이 돌지 않습니다. 켜면 원본처럼 십자가 천천히 돕니다.
     RR.cursor.enable()  /  RR.cursor.disable()                                         */

  RR.cursor = (function () {
    var node = null;
    var clickable = 'button, a, [role="button"], .rr-clickable, [data-rr-pick]';
    function move(e) {
      node.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
      var hit = e.target && e.target.closest ? e.target.closest(clickable) : null;
      node.classList.toggle('is-pointer', !!hit && !hit.disabled && !hit.classList.contains('is-disabled'));
      node.classList.remove('is-away');
    }
    function away() { if (node) node.classList.add('is-away'); }
    return {
      enable: function () {
        if (node || !window.matchMedia('(pointer: fine)').matches) return;
        node = make('div', 'rr-cursor is-away');
        node.setAttribute('aria-hidden', 'true');
        node.appendChild(make('i'));
        doc.body.appendChild(node);
        doc.documentElement.classList.add('rr-cursor-on');
        doc.addEventListener('pointermove', move, { passive: true });
        doc.documentElement.addEventListener('pointerleave', away);
      },
      disable: function () {
        if (!node) return;
        doc.removeEventListener('pointermove', move);
        doc.documentElement.removeEventListener('pointerleave', away);
        doc.documentElement.classList.remove('rr-cursor-on');
        node.remove();
        node = null;
      }
    };
  })();

  /* ── 길게 눌러 확인 ───────────────────────────────────────────────────────
     .rr-rbtn--hold 를 --rr-dur-hold(기본 1초) 동안 누르고 있으면 rr:confirm 이 납니다.
     채워지는 모습은 CSS(:active / .is-holding)가 그립니다.                              */

  var holdTimer = null;
  var holdBtn = null;
  function holdStart(btn) {
    if (btn.disabled || btn.classList.contains('is-confirmed')) return;
    holdCancel();
    holdBtn = btn;
    btn.classList.add('is-holding');
    holdTimer = setTimeout(function () {
      btn.classList.remove('is-holding');
      btn.classList.add('is-confirmed');
      holdBtn = null;
      emit(btn, 'rr:confirm');
    }, cssMs(btn, '--rr-dur-hold', 1000));
  }
  function holdCancel() {
    clearTimeout(holdTimer);
    if (holdBtn) holdBtn.classList.remove('is-holding');
    holdBtn = null;
  }

  /* ── 속성으로 배선하기 ────────────────────────────────────────────────── */

  doc.addEventListener('pointerdown', function (e) {
    var hold = e.target.closest('.rr-rbtn--hold');
    if (hold) holdStart(hold);
  });
  ['pointerup', 'pointercancel', 'dragstart'].forEach(function (name) {
    doc.addEventListener(name, holdCancel);
  });
  doc.addEventListener('pointerout', function (e) {
    if (holdBtn && e.target.closest('.rr-rbtn--hold') === holdBtn && !holdBtn.contains(e.relatedTarget)) holdCancel();
  });
  doc.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && e.target.classList && e.target.classList.contains('rr-rbtn--hold')) holdStart(e.target);
    if (e.key === 'Escape') {
      var open = doc.querySelectorAll('.rr-modal.is-open[data-rr-esc]');
      if (open.length) RR.close(open[open.length - 1]);
    }
  });
  doc.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter') holdCancel();
  });

  doc.addEventListener('click', function (e) {
    var t = e.target;
    var n;

    if ((n = t.closest('[data-rr-open]'))) RR.open(n.getAttribute('data-rr-open'));

    if ((n = t.closest('[data-rr-close]'))) {
      var sel = n.getAttribute('data-rr-close');
      RR.close(sel ? sel : n.closest('.rr-modal'));
    }

    if ((n = t.closest('[data-rr-tab]'))) {
      var tabs = n.closest('.rr-tabs');
      Array.prototype.forEach.call(tabs.querySelectorAll('[data-rr-tab]'), function (tab) {
        var on = tab === n;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        var panel = doc.querySelector(tab.getAttribute('data-rr-tab'));
        if (panel) panel.classList.toggle('is-active', on);
      });
      emit(n, 'rr:change', { tab: n.getAttribute('data-rr-tab') });
    }

    if ((n = t.closest('[data-rr-step]'))) {
      var stepper = n.closest('.rr-stepper');
      var options = [];
      try { options = JSON.parse(stepper.getAttribute('data-rr-options') || '[]'); } catch (err) { options = []; }
      if (options.length) {
        var idx = parseInt(stepper.getAttribute('data-rr-index') || '0', 10);
        idx = (idx + parseInt(n.getAttribute('data-rr-step'), 10) + options.length) % options.length;
        stepper.setAttribute('data-rr-index', idx);
        stepper.querySelector('.rr-stepper__value').textContent = options[idx];
        emit(stepper, 'rr:change', { index: idx, value: options[idx] });
      }
    }

    if ((n = t.closest('.rr-menu__item'))) {
      Array.prototype.forEach.call(n.closest('.rr-menu').querySelectorAll('.rr-menu__item'), function (item) {
        item.classList.toggle('is-selected', item === n);
      });
    }

    if ((n = t.closest('[data-rr-buy]')) && !n.disabled) {
      var lv = n.getAttribute('data-rr-level');
      var next = lv == null ? null : parseInt(lv, 10) + 1;
      if (next != null) n.setAttribute('data-rr-level', next);
      RR.purchase(n, { level: next });
    }

    if ((n = t.closest('[data-rr-pick]'))) RR.pick(n);
  });

  window.RR = RR;
})();
