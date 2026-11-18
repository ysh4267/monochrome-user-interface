/*!
 * 흑백 모노크롬 유저 인터페이스 — 도우미 스크립트 (선택 사항)
 * ---------------------------------------------------------------------------
 * 모양과 모션은 전부 CSS에 있습니다. 이 파일이 하는 일은 딱 세 가지입니다.
 *   1) 클래스를 붙였다 떼기        (다이얼로그 열기, 탭 전환, 선택 표시, 버튼 갈아 끼우기의 순서 맞추기 …)
 *   2) 일회성 연출용 마크업 꽂기    (구매 효과의 별·점, 레벨 표, 획득 라벨, 화면 전환의 가림막 …)
 *   3) 마우스를 따라다니는 커서     (RR.cursor.enable — 켜야만 동작)
 *
 * HTML 속성만으로 쓰는 법 (JS를 한 줄도 안 써도 됩니다):
 *   data-rr-open="#id"        누르면 그 모달을 엽니다
 *   data-rr-close             누르면 자기가 속한 모달을 닫습니다
 *   data-rr-tab="#panel"      탭 버튼. 같은 .rr-tabs 안의 탭과 짝이 되는 패널을 전환
 *   data-rr-step="-1|1"       .rr-stepper 안의 좌우 버튼 (값 목록은 data-rr-options='["끔","켬"]')
 *   data-rr-buy               누르면 구매 효과 재생 (data-rr-level="3" 이면 "Lv.3" 표도 뜸)
 *   data-rr-pick              계약 카드. 누르면 도장이 찍히고 나머지 카드가 사라짐
 *   data-rr-swap="묶음"       누르면 자기가 속한 독의 버튼을 그 묶음(data-rr-group)으로 갈아 끼움
 *   data-rr-on / data-rr-off  켜고 끄는 꼬리표(.rr-keytag--toggle). 누를 때마다 상태와 글자가 바뀜
 *
 * 직접 부르는 법:  RR.purchase(button, { level: 3 })  등. 아래 주석 참고.
 * 이벤트:  rr:open, rr:close, rr:change, rr:confirm, rr:pick, rr:buy, rr:swap, rr:swapped  (모두 버블링)
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
  /* 같은 애니메이션을 처음부터 다시 틀기: 클래스를 뗐다가 리플로 뒤에 다시 붙입니다.
     연달아 불러도 앞선 타이머가 뒤의 재생을 끊지 않도록 타이머를 노드에 적어 둡니다. */
  function replay(node, cls, ms) {
    var slot = '_rr_' + cls;
    clearTimeout(node[slot]);
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    if (ms) node[slot] = setTimeout(function () { node.classList.remove(cls); }, ms);
  }
  function list(nodes) { return Array.prototype.slice.call(nodes); }
  /* <html data-rr-motion="off"> (또는 system + OS 설정)이면 연출 없이 바로 바꿉니다 */
  function calm() {
    var m = doc.documentElement.getAttribute('data-rr-motion');
    return m === 'off' || (m === 'system' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
     RR.shake(node)                                      node 를 한 번 떱니다(크기·기울기 없이 좌우·위아래로만, 매번 다르게).
     RR.ping(button)                                     버튼 둘레에 눈길 끄는 링을 한 번 퍼뜨립니다.
     RR.afford(button, true)                             살 수 있게 됨: 검게 바뀌며 톡 튀고 링이 퍼집니다.
     RR.purchase(button, { level: 3 })                   아래의 움직임을 한꺼번에 틉니다. 원본처럼 넷이 각자 움직입니다.
         버튼의 펀치 · 독 상자의 부풂 · 아래 묶음(독 + 게이지)의 떨림 · 툴팁의 펀치  +  폭발과 레벨 표
         { punch: false } 독의 부풂 없이,  { shake: false } 떨림 없이.                                    */

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
        '--size': Math.round(i < stars ? rand(13, 30) : rand(7, 14)) + 'px',
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

  /* 떨림은 살 때마다 다릅니다: 원본에서 잰 궤적 셋(a·b·c) 가운데 하나를 골라 좌우·위아래를 무작위로 뒤집습니다.
     RR.shake(node, { track: 'a', flipX: false, flipY: false }) 처럼 정해 줄 수도 있습니다. */
  RR.shake = function (target, opts) {
    var n = resolve(target);
    if (!n) return;
    opts = opts || {};
    n.setAttribute('data-rr-shake', opts.track || 'abc'.charAt(Math.floor(Math.random() * 3)));
    n.style.setProperty('--rr-shake-flip-x', (opts.flipX == null ? Math.random() < 0.5 : opts.flipX) ? -1 : 1);
    n.style.setProperty('--rr-shake-flip-y', (opts.flipY == null ? Math.random() < 0.5 : opts.flipY) ? -1 : 1);
    replay(n, 'is-shake', 300);
  };
  RR.jolt = RR.shake;                                      /* 예전 이름 */

  RR.ping = function (target) {
    var n = resolve(target);
    if (n) replay(n, 'is-ping', 440);
  };

  /* RR.afford(button, true | false)   "살 수 있음" 표시(.is-affordable)를 켜고 끕니다.
     꺼져 있다가 켜지는 순간에는 원본처럼 버튼이 톡 튀고 링이 한 번 퍼집니다.
     처음 상태를 잡을 때처럼 연출 없이 바꾸려면 RR.afford(button, true, { quiet: true }). */
  RR.afford = function (target, on, opts) {
    var btn = resolve(target);
    if (!btn) return;
    on = on !== false;
    var was = btn.classList.contains('is-affordable');
    btn.classList.toggle('is-affordable', on);
    if (on && !was && !(opts && opts.quiet) && btn.offsetParent !== null) {
      replay(btn, 'is-afford', 240);
      RR.ping(btn);
    }
  };

  RR.purchase = function (target, opts) {
    var btn = resolve(target);
    if (!btn) return;
    opts = opts || {};
    var item = btn.closest('.rr-dock__item');
    var dock = btn.closest('.rr-dock');
    replay(btn, 'is-bought', 690);                          /* 버튼: 색 + 제 크기의 펀치 */
    if (item) replay(item, 'is-punch', 600);                /* 그 칸의 툴팁: 제 펀치(독과 따로) */
    if (dock && opts.punch !== false) replay(dock, 'is-punch', 440);   /* 독 상자: 부풀었다 움츠러듦 */
    if (opts.shake !== false && opts.jolt !== false) RR.shake(btn.closest('.rr-dockwrap') || dock);   /* 독 + 게이지: 떨림 */
    RR.burst(btn, opts);
    if (opts.level != null) RR.levelTag(btn, opts.max ? 'MAX!' : 'Lv.' + opts.level, opts);
    emit(btn, 'rr:buy', opts);
  };

  /* ── HUD 연출 ─────────────────────────────────────────────────────────────
     RR.bump(el)                              콤보 라벨 등을 툭 키웠다 되돌립니다.
     RR.gain(layer, '+16,608', x, y)          layer 안 (x, y) 에 획득 라벨을 띄웁니다.
     RR.count(el, 1200000, { ms: 400 })       숫자를 굴려 올립니다(format 으로 표기 변경).
     RR.replay(el, 'is-live')                 .is-live 같은 등장 연출을 처음부터 다시 틉니다(알림 글을 바꿀 때). */

  RR.replay = function (target, cls, ms) {
    var n = resolve(target);
    if (n) replay(n, cls || 'is-live', ms);
  };

  /* RR.keytag(el, true | false, '글자')   켜고 끄는 단축키 꼬리표(.rr-keytag--toggle)를 바꿉니다.
     검은 면이 쓸고 들어오거나 빠지고(CSS), 꼬리표가 톡 튑니다. 글자를 주면 두 겹의 글자를 함께 바꿉니다. */
  RR.keytag = function (target, on, text) {
    var n = resolve(target);
    if (!n) return;
    if (text != null) {
      n.textContent = text;
      n.setAttribute('data-label', text);
    }
    n.classList.toggle('is-on', on !== false);
    replay(n, 'is-punch', 240);
    emit(n, 'rr:change', { on: on !== false });
  };

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
      var e = 1 - Math.pow(1 - p, 3);                      /* 처음에 빠르고 끝에서 느려짐(원본의 정산 카드·엔딩 통계 계측) */
      n.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  };

  /* ── 엔딩 통계 ────────────────────────────────────────────────────────────
     RR.tally(dl)   .rr-tally.is-live 의 줄이 차례로 나타날 때, 줄 머리의 숫자를 0 에서 굴려 올립니다(0.9초).
     숫자로 시작하는 줄만 굴립니다("82억명", "1,827바퀴"). 줄이 나타나는 시점은 CSS 와 같은 값
     (--rr-tally-wait, --rr-tally-step, 줄마다 --rr-i)을 읽어 맞춥니다.                              */

  RR.tally = function (target) {
    var tally = resolve(target);
    if (!tally) return;
    var wait = cssMs(tally, '--rr-tally-wait', 0);
    var step = cssMs(tally, '--rr-tally-step', 1150);
    list(tally.querySelectorAll('.rr-tally__row')).forEach(function (row, i) {
      var dt = row.querySelector('dt');
      var m = dt && /^([\d,]+(?:\.\d+)?)([\s\S]*)$/.exec(dt.textContent.trim());
      if (!m) return;
      var to = parseFloat(m[1].replace(/,/g, ''));
      var dec = (m[1].split('.')[1] || '').length;
      var rest = m[2];
      /* "82억" 처럼 큰 단위로 줄인 수는 굴러가는 동안 소수 한 자리를 보여 줍니다(15.9억 … 81.9억 → 82억) */
      var loose = dec === 0 && to < 100 && /^[억만조천]/.test(rest);
      var fmt = function (v) {
        var d = loose && Math.abs(v - to) > 0.05 ? 1 : dec;
        return v.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d }) + rest;
      };
      var n = parseInt(row.style.getPropertyValue('--rr-i'), 10);
      if (isNaN(n)) n = i;
      if (calm()) return;
      dt.textContent = fmt(0);
      setTimeout(function () { RR.count(dt, to, { from: 0, ms: 900, format: fmt }); }, wait + n * step);
    });
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

  /* ── 독의 버튼 갈아 끼우기 ────────────────────────────────────────────────
     RR.dock.swap(dock, 'routes')   그 독의 버튼을 data-rr-group="routes" 묶음으로 바꿉니다(하위 메뉴 열기·닫기).
     묶음에 딸린 것: 독 안의 .rr-dock__item / .rr-dock__tag, 같은 .rr-dockwrap 안의 .rr-track.
     처음에 안 보일 묶음에는 hidden 을 답니다. 움직임은 전부 CSS(.is-leaving / .is-entering …)이고
     여기서는 순서와 시간만 맞춥니다(dock.css · motion.css 의 수치와 짝).
     묶음이 바뀌는 순간 rr:swap, 다 끝나면 rr:swapped 가 납니다.                                    */

  RR.dock = (function () {
    var OUT_STEP = 20, OUT_MS = 117;                       /* 떠날 때: 버튼 간격, 하나가 흐려지는 시간 */
    var GAP = 50;                                          /* 비어 있는 틈 */
    var IN_STEP = 35, IN_LEAD = 20, IN_MS = 320;           /* 들어올 때: 버튼 간격, 첫 버튼까지의 여유, 날아오는 시간 */
    var CENTER_AT = 500, CENTER_MS = 600, BOOM_AT = 117;   /* 가운데 큰 버튼: 시작, 길이, 폭발 시점 */

    function isItem(n) { return n.classList.contains('rr-dock__item'); }
    function isCenter(n) { return n.classList.contains('rr-dock__item--center'); }
    /* 들어오는 순서는 단축키 번호를 따릅니다(9번 버튼은 그만큼 늦게 옵니다) */
    function order(item, index) {
      var key = item.querySelector('.rr-btn__key');
      var n = key ? parseInt(key.textContent, 10) : NaN;
      return isNaN(n) ? index : n - 1;
    }
    function strip(node) {
      node.classList.remove('is-leaving', 'is-entering', 'is-first');
      node.style.removeProperty('--rr-n');
      node.style.removeProperty('--rr-d');
      node.style.removeProperty('--rr-wait');
    }

    function swap(target, name) {
      var dock = resolve(target);
      if (!dock || dock._rrSwapping) return false;
      var wrap = dock.closest('.rr-dockwrap') || dock;
      var all = list(wrap.querySelectorAll('[data-rr-group]'));
      var into = all.filter(function (n) { return n.getAttribute('data-rr-group') === name; });
      var out = all.filter(function (n) { return !n.hidden && into.indexOf(n) < 0; });
      if (!into.length || !into.some(function (n) { return n.hidden; })) return false;

      function settle() {
        out.forEach(function (n) { strip(n); n.hidden = true; });
        into.forEach(function (n) { n.hidden = false; });
        if (dock.querySelector('.rr-dock__item--center')) dock.classList.toggle('rr-dock--hump', into.some(isCenter));
        emit(dock, 'rr:swap', { group: name });
      }
      if (calm()) {
        settle();
        emit(dock, 'rr:swapped', { group: name });
        return true;
      }
      dock._rrSwapping = true;

      /* 1) 떠나기: 오른쪽 버튼부터 흐려집니다. 가운데 큰 버튼은 남겨 둡니다. */
      var goers = out.filter(function (n) { return isItem(n) && !isCenter(n); });
      goers.forEach(function (n, i) {
        n.style.setProperty('--rr-n', goers.length - 1 - i);
        n.classList.add('is-leaving');
      });
      out.forEach(function (n) { if (!isItem(n)) n.classList.add('is-leaving'); });
      var outMs = Math.max(0, goers.length - 1) * OUT_STEP + OUT_MS;

      setTimeout(function () {
        /* 2) 갈아 끼우기: 독이 새 묶음의 너비로 바뀌고, 버튼들이 첫 칸에서 날아옵니다 */
        settle();
        var items = into.filter(isItem);
        var sides = items.filter(function (n) { return !isCenter(n); });
        var center = items.filter(isCenter)[0];
        var first = sides[0];
        var last = 0;
        if (center) center.classList.add('is-entering');       /* 큰 버튼의 자리가 닫힌 채로 거리를 잽니다 */
        var x0 = first ? first.offsetLeft : 0;
        sides.forEach(function (n, i) {
          var k = order(n, i);
          n.style.setProperty('--rr-n', k);
          n.style.setProperty('--rr-d', (n.offsetLeft - x0) + 'px');
          n.classList.add('is-entering');
          if (n === first) n.classList.add('is-first');
          last = Math.max(last, k * IN_STEP + IN_MS, k * IN_STEP + 410, IN_LEAD + 360);
        });
        into.forEach(function (n) {
          if (isItem(n)) return;
          if (center && n.classList.contains('rr-dock__tag')) n.style.setProperty('--rr-wait', (CENTER_AT + 233) + 'ms');
          n.classList.add('is-entering');
          last = Math.max(last, 760);
        });
        dock.classList.add('is-swapping');
        var clipMs = last;
        if (center) {
          /* 큰 버튼이 독 안에서 솟아올라 터지는 순간: 폭발 + 독이 통째로 눌렸다 늘어남 */
          dock.classList.add('is-rising');
          clipMs = Math.min(last, CENTER_AT + BOOM_AT);
          setTimeout(function () {
            var big = center.querySelector('.rr-btn');
            if (big) RR.burst(big, { stars: 14, squares: 12, dots: 10, reach: 1.5 });
            replay(dock, 'is-boom', 440);
          }, CENTER_AT + BOOM_AT);
          last = Math.max(last, CENTER_AT + CENTER_MS + 60);
        }
        setTimeout(function () { dock.classList.remove('is-swapping'); }, clipMs);

        /* 3) 뒷정리 */
        setTimeout(function () {
          into.forEach(strip);
          dock.classList.remove('is-swapping', 'is-rising');
          dock._rrSwapping = false;
          emit(dock, 'rr:swapped', { group: name });
        }, last + 40);
      }, outMs + GAP - IN_LEAD);
      return true;
    }

    return { swap: swap };
  })();

  /* ── 단계 게이지 ──────────────────────────────────────────────────────────
     RR.track.layout(track)   표지의 --rr-at 을 읽어, 원끼리 34px 보다 가까우면 왼쪽으로 비켜 세웁니다(--rr-shift).
     오른쪽(단계가 높은 쪽) 표지가 제자리를 지키고, 같은 단계면 .is-current > .is-owned > .is-open > 잠김 순입니다.
     값(--rr-level, --rr-at, 상태 클래스)을 바꾼 뒤에 한 번 부르면 됩니다. 옮겨 가는 움직임은 CSS 가 맡습니다.
     게이지가 화면에 보일 때 불러야 합니다(숨겨져 있으면 너비를 잴 수 없어 그냥 돌아옵니다).
     RR.track.layout(track, { instant: true })  움직임 없이 바로 놓습니다(게이지가 막 나타날 때).       */

  RR.track = {
    layout: function (target, opts) {
      var track = resolve(target);
      var rail = track && track.querySelector('.rr-track__rail');
      var width = rail ? rail.offsetWidth : 0;
      if (!width) return false;
      var gap = (opts && opts.gap) || 34;
      var max = parseFloat(getComputedStyle(track).getPropertyValue('--rr-max')) || 1;
      var pins = list(rail.querySelectorAll('.rr-track__pin')).map(function (node, i) {
        var c = node.classList;
        return {
          node: node,
          i: i,
          at: parseFloat(node.style.getPropertyValue('--rr-at')) || 0,
          rank: c.contains('is-current') ? 3 : c.contains('is-owned') ? 2 : c.contains('is-open') ? 1 : 0
        };
      });
      pins.sort(function (a, b) { return a.at - b.at || a.rank - b.rank || b.i - a.i; });
      var instant = opts && opts.instant;
      if (instant) pins.forEach(function (p) { p.node.style.transition = 'none'; });
      var limit = Infinity;
      for (var k = pins.length - 1; k >= 0; k--) {
        var x = pins[k].at / max * width;
        var cx = Math.min(x, limit);
        pins[k].node.style.setProperty('--rr-shift', (Math.round((cx - x) * 10) / 10) + 'px');
        pins[k].node.style.zIndex = k + 1;
        limit = cx - gap;
      }
      if (instant) {
        void rail.offsetWidth;
        pins.forEach(function (p) { p.node.style.transition = ''; });
      }
      return true;
    }
  };

  /* ── 화면 전환: 회전문 닦기 ───────────────────────────────────────────────
     RR.wipe(stage, change)          문짝이 돌며 화면을 흰 면으로 가리고(300ms), 빈 화면에서 change() 를 부른 뒤,
                                     같은 방향으로 한 번 더 돌며 새 화면을 엽니다(367ms).
     RR.wipe.cover(stage, done)      가리기만. 다 가려지면 done()  — 다른 페이지로 넘어갈 때
     RR.wipe.reveal(stage, done)     열기만.                       — 넘어온 페이지에서
     RR.wipe.hold(stage)             연출 없이 가려 둡니다(넘어온 페이지가 준비되는 동안).
     stage 는 전환이 덮을 상자(.rr-stage). 생략하면 문서의 첫 .rr-stage 입니다.
     겹쳐 놓을 <div class="rr-wipe"><i></i></div> 가 없으면 만들어 넣습니다. 모양과 움직임은 wipe.css.     */

  RR.wipe = (function () {
    var COVER = 300, BLANK = 117, REVEAL = 17 + 367, LINGER = 83;
    var states = ['is-covering', 'is-covered', 'is-revealing'];
    function layer(target) {
      var host = resolve(target) || doc.querySelector('.rr-stage') || doc.body;
      var w = null;
      list(host.children).forEach(function (c) { if (c.classList.contains('rr-wipe')) w = c; });
      if (!w) {
        w = make('div', 'rr-wipe');
        w.setAttribute('aria-hidden', 'true');
        w.appendChild(make('i'));
        host.appendChild(w);
      }
      return w;
    }
    function set(w, cls) {
      clearTimeout(w._rrWipe);
      states.forEach(function (s) { w.classList.remove(s); });
      if (cls) {
        void w.offsetWidth;
        w.classList.add(cls);
      }
    }
    function cover(target, done) {
      var w = layer(target);
      if (calm()) { set(w, 'is-covered'); if (done) done(); return; }
      set(w, 'is-covering');
      w._rrWipe = setTimeout(function () { set(w, 'is-covered'); if (done) done(); }, COVER + 17);
    }
    function reveal(target, done) {
      var w = layer(target);
      if (calm()) { set(w, null); if (done) done(); return; }
      set(w, 'is-revealing');
      w._rrWipe = setTimeout(function () { set(w, null); if (done) done(); }, REVEAL + LINGER);
    }
    function run(target, change, done) {
      cover(target, function () {
        if (change) change();
        layer(target)._rrWipe = setTimeout(function () { reveal(target, done); }, calm() ? 0 : BLANK);
      });
    }
    run.cover = cover;
    run.reveal = reveal;
    run.hold = function (target) { set(layer(target), 'is-covered'); };
    return run;
  })();

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
      var allTabs = list(tabs.querySelectorAll('[data-rr-tab]'));
      var wasTab = allTabs.filter(function (tab) { return tab.classList.contains('is-active'); })[0];
      allTabs.forEach(function (tab) {
        var on = tab === n;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        var panel = doc.querySelector(tab.getAttribute('data-rr-tab'));
        if (!panel) return;
        panel.classList.toggle('is-active', on);
        /* 새 내용은 옮겨 간 쪽에서 밀려 들어옵니다(dialog.css 의 .is-switched) */
        if (on && wasTab && wasTab !== n) {
          panel.style.setProperty('--rr-tab-dir', allTabs.indexOf(n) > allTabs.indexOf(wasTab) ? 1 : -1);
          replay(panel, 'is-switched', 320);
        }
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
        var shown = stepper.querySelector('.rr-stepper__value');
        shown.textContent = options[idx];
        /* 새 값은 누른 화살표 쪽에서 밀려 들어옵니다(dialog.css 의 .is-switched) */
        shown.style.setProperty('--rr-step-dir', parseInt(n.getAttribute('data-rr-step'), 10) < 0 ? -1 : 1);
        replay(shown, 'is-switched', 220);
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

    if ((n = t.closest('.rr-keytag--toggle[data-rr-on]'))) {
      var turnOn = !n.classList.contains('is-on');
      RR.keytag(n, turnOn, n.getAttribute(turnOn ? 'data-rr-on' : 'data-rr-off'));
    }

    if ((n = t.closest('[data-rr-swap]')) && !n.disabled) {
      e.preventDefault();
      RR.dock.swap(n.closest('.rr-dock'), n.getAttribute('data-rr-swap'));
    }
  });

  window.RR = RR;
})();
