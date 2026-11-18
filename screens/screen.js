// 화면 예제 공통 스크립트 (키트 본체가 아닙니다 — 본체는 js/rr.js)
//   ?shot       검증용 캡처 모드. 따라다니는 커서, 돌아가기 링크, 자동 연출을 끕니다.
//   ?open=id    그 id 의 모달을 연 채로 시작합니다.  예) title.html?open=settings
(function () {
  var q = new URLSearchParams(location.search);
  var shot = q.has('shot');
  document.documentElement.classList.toggle('is-shot', shot);
  if (!shot) RR.cursor.enable();
  var open = q.get('open');
  if (open) RR.open('#' + open);
  window.DEMO = { shot: shot, query: q };
})();
