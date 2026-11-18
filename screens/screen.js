// 화면 예제 공통 스크립트 (키트 본체가 아닙니다 — 본체는 js/rr.js)
//   ?shot       검증용 캡처 모드. 따라다니는 커서, 돌아가기 링크, 자동 연출을 끄고
//               등장 연출(.is-live)도 떼어 다 나타난 상태로 보여 줍니다. (?shot&live 면 등장 연출은 둡니다)
//   ?open=id    그 id 의 모달을 연 채로 시작합니다.  예) title.html?open=settings
//   ?wipe       회전문 닦기로 넘어온 화면. 흰 화면에서 시작해 문짝이 돌며 열립니다.
//
//   화면 사이를 회전문 닦기로 넘기려면 링크나 버튼에 data-wipe-to="다음.html" 을 답니다.
//   (가린 뒤에 ?wipe 를 붙여 넘어가고, 넘어간 화면이 위의 규칙으로 엽니다.)
(function () {
  var q = new URLSearchParams(location.search);
  var shot = q.has('shot');
  document.documentElement.classList.toggle('is-shot', shot);
  if (!shot) RR.cursor.enable();
  if (shot && !q.has('live')) {
    Array.prototype.forEach.call(document.querySelectorAll('.is-live'), function (n) { n.classList.remove('is-live'); });
  }
  var open = q.get('open');
  if (open) RR.open('#' + open);

  var DEMO = window.DEMO = { shot: shot, query: q, arrived: q.has('wipe') && !shot };

  // 회전문 닦기로 넘어가기
  DEMO.wipeTo = function (url) {
    RR.wipe.cover(null, function () {
      location.href = url + (url.indexOf('?') < 0 ? '?' : '&') + 'wipe';
    });
  };
  document.addEventListener('click', function (e) {
    var n = e.target.closest('[data-wipe-to]');
    if (!n || n.disabled) return;
    e.preventDefault();
    DEMO.wipeTo(n.getAttribute('data-wipe-to'));
  });

  // 회전문 닦기로 넘어왔으면: 흰 화면으로 가려 두었다가, 글꼴까지 준비되면 엽니다.
  // 화면마다 맞춰 할 일이 있으면 demo:arrive(가려진 채 준비 끝) / demo:reveal(열리기 시작) 을 듣습니다.
  if (DEMO.arrived) {
    RR.wipe.hold();
    var openUp = function () {
      document.dispatchEvent(new CustomEvent('demo:arrive'));
      setTimeout(function () {
        RR.wipe.reveal();
        document.dispatchEvent(new CustomEvent('demo:reveal'));
      }, 117);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(openUp); else setTimeout(openUp, 0);
    // 주소에서 ?wipe 를 지워, 새로 고침하면 연출 없이 뜨게 합니다
    q.delete('wipe');
    var rest = q.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  }
})();
