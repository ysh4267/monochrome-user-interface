# 흑백 모노크롬 유저 인터페이스

게임 **Round and Round Inc.** (Murbong / GoldWorks)의 화면을 영상에서 프레임 단위로 재어 CSS로 옮긴 UI 모음입니다.
크기와 간격은 원본 1920×1080 화면의 픽셀 값이고, 모션의 길이와 가감속은 60fps 영상에서 계측했습니다.

- 모양과 움직임은 **전부 CSS**입니다. `js/rr.js`는 클래스를 붙였다 떼고, 일회성 연출용 마크업을 꽂는 일만 합니다(없어도 hover·툴팁·숨쉬기 등은 동작합니다).
- 이미지는 쓰지 않습니다. 아이콘·배경·커서는 모두 직접 그린 **벡터(SVG)** 입니다.
- 소리는 없습니다.

## 바로 보기

- 웹: **https://ysh4267.github.io/monochrome-user-interface/**
- 내려받았다면 `index.html`을 브라우저로 여세요. 컴포넌트 전체와 화면 예제 링크가 있습니다.

| 파일 | 내용 | 원본 시각 |
| --- | --- | --- |
| `screens/title.html` | 타이틀, 메뉴 hover, 설정 다이얼로그(`?open=settings`). “새로 시작”을 누르면 회전문 닦기로 게임에 들어갑니다 | 0:38 / 1:13 |
| `screens/early.html` | 미니 독, 툴팁, 구매 효과, 살 수 있게 되는 순간, 조작 안내 고리와 둥실거리는 힌트 | 1:43 / 3:01 |
| `screens/submenu.html` | 단계 게이지, 하위 메뉴 열고 닫기(버튼 갈아 끼우기), 잠긴 툴팁. 숫자 키로도 누를 수 있습니다 | 5:26 / 5:41 |
| `screens/hud.html` | 게임 HUD. 확성기(1)로 하위 메뉴 열기, 환생 → 계약 카드 → 다시 개업(길게 누르기) → 회전문 닦기. `?scene=late`(후반: 알림, 정산 카드, 말풍선, 켜고 끄는 꼬리표), `?open=franchise`, `?open=reopen` | 19:52 / 42:00 / 54:22 |
| `screens/prestige.html` | 환생 업그레이드 목록, 항목 구매, “다시 개업”으로 회전문 닦기 | 13:22 |
| `screens/ending.html` | 통계(줄이 하나씩 나타나며 숫자가 굴러 오름) → “영업 종료.” → 크레딧 (`?step=2`, `?step=3`) | 58:33 |

> **모션이 안 보인다면** — Windows의 “애니메이션 효과”를 꺼 둔 PC에서는 브라우저가 “모션 줄이기”를 요청합니다.
> 이 키트는 원본 게임처럼 **기본으로 항상 재생**합니다. 줄이고 싶을 때만 `<html data-rr-motion="system">`(OS 설정 따름)이나 `data-rr-motion="off"`를 다세요.

화면 예제는 주소 끝에 `?shot`을 붙이면 등장 연출과 자동 시연을 끈 정지 상태로 뜹니다(원본 프레임과 겹쳐 비교할 때 씁니다).

## 내 페이지에 쓰기

```html
<link rel="stylesheet" href="css/rr.css">

<div class="rr">                      <!-- 키트의 루트: 글꼴·색·커서가 여기서 잡힙니다 -->
  <button class="rr-btn is-affordable">
    <span class="rr-btn__body">
      <span class="rr-btn__disc"><i class="rr-icon rr-icon--gear"></i></span>
      <span class="rr-btn__key">1</span>
    </span>
  </button>
</div>

<script src="js/rr.js"></script>       <!-- 선택 -->
```

원본과 같은 1920×1080 무대가 필요하면 `<main class="rr rr-stage rr-stage--fit">`를 쓰세요. 창 크기에 맞춰 통째로 축소됩니다.

## 폴더

```
css/
  rr.css            한 번에 불러오는 파일 (@import 목록)
  tokens.css        디자인 토큰: 색·선·모서리·그림자·크기·모션
  base.css          .rr 루트, 무대, 커서, 모션 줄이기
  motion.css        키프레임 전부
  icons.css         아이콘 (자동 생성 — 직접 고치지 않습니다)
  fonts.css         글꼴 불러오기
  components/       컴포넌트 한 개에 파일 한 개
icons/              아이콘 원본 SVG (24×24)
assets/             배경 그림 (벡터)
js/rr.js            도우미 스크립트
screens/            컴포넌트를 조립한 화면 예제
tools/build-icons.ps1
docs/reference-notes.md   원본에서 잰 수치 기록
```

## 확장하는 법

**값 바꾸기** — 컴포넌트는 값을 직접 쓰지 않고 `css/tokens.css`의 변수만 봅니다. 변수를 고치면 전체가 바뀌고, 특정 영역에서만 다르게 하려면 그 요소에 같은 이름으로 다시 선언합니다.

```css
.my-fast-area { --rr-dur-hover: 120ms; --rr-hover-scale: 1.1; }
```

**아이콘 추가** — `icons/`에 24×24 viewBox의 SVG를 넣고 스크립트를 돌리면 파일 이름이 곧 클래스 이름이 됩니다.

```
powershell -ExecutionPolicy Bypass -File tools\build-icons.ps1
icons/rocket.svg  →  <i class="rr-icon rr-icon--rocket"></i>
```

**컴포넌트 추가** — `css/components/`에 파일을 만들고 `css/rr.css` 맨 아래에 `@import` 한 줄을 더합니다. 지킬 약속은 셋입니다.

1. 이름은 `rr-` 로 시작하고 `블록__요소--변형`, 상태는 `.is-상태`.
2. 색·선·시간은 토큰으로. 새 키프레임은 `motion.css`에.
3. 파일 머리말에 마크업 예시를 주석으로 남깁니다(기존 파일들이 본보기).

**독에 버튼 추가** — `.rr-dock__item`을 하나 더 넣으면 끝입니다. 독의 너비, 버튼 간격, 툴팁 위치는 저절로 맞춰집니다. 칸은 버튼만큼(80px)이 기본이고 값 표시(`.rr-price`)가 그보다 넓으면 그만큼 넓어지므로, 긴 값이 살 수 있게 되어 굵어지는 순간처럼 내용이 바뀔 때 독 상자(와 함께 묶인 게이지)의 너비도 원본처럼 따라 늘었다 줄어듭니다.

**하위 메뉴(버튼 묶음) 추가** — 독의 칸마다 `data-rr-group="이름"`을 달고, 처음에 안 보일 묶음에는 `hidden`을 답니다. 여는 버튼에 `data-rr-swap="이름"`을 달면 원본처럼 버튼이 갈아 끼워집니다. 같은 `.rr-dockwrap` 안의 `.rr-track`(단계 게이지)에도 `data-rr-group`을 달면 함께 나타나고 사라집니다.

**게이지의 표지 추가** — `.rr-track__pin`을 하나 더 넣고 `--rr-at`(꽂히는 단계)만 주면 됩니다. 겹치는 표지는 `RR.track.layout(track)`이 비켜 세웁니다.

**독 안에 두되 독과 따로 움직이게 하기** — 사는 순간 독 상자는 부풀고(`--rr-dock-scale`), 독과 게이지는 한 덩어리로 떱니다(`--rr-shake-x`, `--rr-shake-y`). 이 값들은 등록된 변수(`@property`)라서 안쪽 요소가 읽을 수 있습니다. 툴팁·레벨 표·폭발이 독 안에 들어 있으면서도 원본처럼 독을 따라 커지거나 같이 떨지 않는 것은 이 값을 되돌려 놓기 때문입니다. 새 요소도 같은 식으로 쓰면 됩니다.

```css
.my-badge {                       /* 독 안에 있지만, 독이 떨거나 부풀어도 제자리·제 크기 */
  translate: calc(var(--rr-shake-x) * var(--rr-shake-flip-x, 1) * -1)
             calc(var(--rr-shake-y) * var(--rr-shake-flip-y, 1) * -1);
  scale: calc(1 / var(--rr-dock-scale));
}
```

**화면 추가** — `screens/`의 아무 파일이나 복사해 시작하세요. 화면마다 다른 것은 요소의 자리(여백 몇 줄)뿐입니다.

## 상태 클래스와 속성

| 이름 | 붙이는 곳 | 뜻 |
| --- | --- | --- |
| `.is-affordable` | `.rr-btn` `.rr-price` `.rr-cost` | 살 수 있음(검은 채움, 숨쉬기) |
| `:disabled` / `.is-disabled` | `.rr-btn` `.rr-up` | 잠김 |
| `.is-owned` `.is-maxed` | `.rr-up` | 산 적 있음 / 끝까지 올림 |
| `.is-open` | `.rr-modal` `.rr-tip` `.rr-track__pin` | 열림 (표지: 열렸지만 아직 안 산 길 — 흰 바탕) |
| `.is-owned` `.is-current` | `.rr-track__pin` | 가진 길(검은 채움) / 막대 끝에 선 맨 앞 표지(한 치수 큼) |
| `.is-on` | `.rr-keytag--toggle` | 켜짐(검은 면이 왼쪽에서 쓸고 들어옴) |
| `.is-selected` | `.rr-menu__item` | 고른 메뉴 |
| `.is-active` | `.rr-tab` `.rr-tabpanel` | 켜진 탭 |
| `.is-live` | 토스트·말풍선·획득 라벨·정산 카드·옆 패널·통계 등 | 등장 연출 한 번 재생 |
| `.is-punch` | `.rr-pill` `.rr-keytag` | 글이나 상태가 바뀔 때 한 번 톡 튐 |
| `.is-bought` | `.rr-btn` | 산 순간: 버튼의 색과 크기가 출렁임(기울지 않음) |
| `.is-punch` | `.rr-dock` | 산 순간: 독 상자가 통째로 부풀었다 움츠러듦(`--rr-dock-scale`) |
| `.is-punch` | `.rr-dock__item` | 산 순간: 그 칸의 툴팁이 제 펀치를 침(독과 따로) |
| `.is-shake` | `.rr-dockwrap` 또는 `.rr-dock` | 산 순간: 독 + 게이지가 한 덩어리로 떪. `data-rr-shake="a\|b\|c"`로 궤적(`d\|e`는 단계가 올랐을 때의 큰 떨림), `--rr-shake-flip-x` `-y`로 방향 |
| `.is-changed` | `.rr-price` | 산 순간: 그 칸의 값이 사라졌다가 아래에서 솟아 4px 지나쳤다 앉음(새 값은 붙이기 전에 써 둡니다) |
| `.is-boom` | `.rr-dock` | 큰 버튼이 내려앉을 때: 독이 통째로 눌렸다 늘어남 |
| `.is-leaving` | `.rr-notice` `.rr-side` `.rr-msgbox` | 퇴장 연출 |
| `.is-entering` `.is-leaving` | `.rr-track` `.rr-dock__item` | 게이지·독 버튼의 등장/퇴장 (`RR.dock.swap`이 붙였다 뗍니다) |
| `.is-picked` `.is-passed` | `.rr-card` | 고른 카드 / 고르지 않은 카드 |

| 속성 | 하는 일 |
| --- | --- |
| `data-rr-open="#id"` | 누르면 그 모달을 엽니다 |
| `data-rr-close` | 누르면 자기가 속한 모달을 닫습니다 |
| `data-rr-esc` | (모달에) Esc 로 닫히게 합니다 |
| `data-rr-tab="#panel"` | 탭 버튼 |
| `data-rr-step="-1\|1"` | 좌우 선택기 버튼. 값 목록은 `.rr-stepper`의 `data-rr-options='[…]'` |
| `data-rr-buy` | 누르면 구매 효과. `data-rr-level="3"` 이면 레벨 표도 뜹니다 |
| `data-rr-pick` | 계약 카드. 누르면 도장이 찍힙니다 |
| `data-rr-group="이름"` | 독의 칸·꼬리표, 게이지를 묶음으로 나눕니다(안 보이는 묶음에는 `hidden`) |
| `data-rr-swap="이름"` | 누르면 독의 버튼을 그 묶음으로 갈아 끼웁니다 |
| `data-rr-on` / `data-rr-off` | 켜고 끄는 꼬리표(`.rr-keytag--toggle`)의 두 문구. 누를 때마다 바뀝니다 |
| `hidden` | 키트 안에서는 어떤 컴포넌트든 숨깁니다. 다시 보일 때 등장 애니메이션(꼬리표·알림 점 등)이 처음부터 재생됩니다 |
| `data-rr-motion="system\|off"` | (`<html>`에) 모션 줄이기 |

## 스크립트 (선택)

```js
RR.open('#settings');  RR.close('#settings');
RR.purchase(button, { level: 3 });        // 구매 효과 전부: 버튼의 펀치 · 독 상자의 부풂 · 독+게이지의 떨림 · 툴팁의 펀치 · 값 표시의 바뀜(각자) + 폭발 + 레벨 표 + 집중선
                                           //   끄기: { punch: false } { shake: false } { focus: false } { price: false }
                                           //   { stageUp: true } 이 구매로 게이지의 단계가 올랐을 때: 0.1초 뒤 아래 묶음이 한 번 더 크게 떪
RR.burst(el, { streaks: 28, stars: 11, dots: 9, squares: 0 });   // 폭발만: 튀어나가는 가닥 · 충격파 원 둘 · 포물선으로 떨어지는 별 · 흩어지는 점
RR.levelTag(el, 'Lv.3');
RR.shake(dockwrap);                        // 떨림만(크기·기울기 없이). 부를 때마다 궤적과 방향이 달라짐. RR.jolt 는 예전 이름
RR.shake(dockwrap, { strong: true });      // 단계가 올랐을 때의 큰 떨림: 위로 12px 쯤 튀었다 0.3초 동안 잦아듦
RR.focus(button);                          // 집중선: 버튼에서 화면 끝까지 뻗는 가는 방사선(무대 .rr-stage 안에서만)
RR.afford(button, true);                   // 살 수 있게 됨: 검게 바뀌며 톡 튀고 링이 퍼짐
RR.ping(button);                           // 링만
RR.dock.swap(dock, 'routes');              // 독의 버튼을 그 묶음으로 갈아 끼우기 (게이지도 함께)
RR.track.layout(track);                    // 게이지의 겹치는 표지를 34px 간격으로 비켜 세우기
RR.gain(layer, '+16,608', x, y);          // 획득 라벨 띄우기
RR.bump(comboEl);                          // 라벨 툭 키우기
RR.count(el, 1200000, { ms: 400 });        // 숫자 굴리기
RR.replay(toast, 'is-live');               // 등장 연출을 처음부터 다시
RR.keytag(tag, true, '자동 구매: 켬 (C)');  // 켜고 끄는 꼬리표
RR.tally(dl);                              // 엔딩 통계: 줄이 나타날 때 숫자 굴리기
RR.pick(card);
RR.wipe(stage, function () { /* 화면 바꾸기 */ });   // 회전문 닦기. RR.wipe.cover / .reveal 로 나눠 쓸 수도
RR.cursor.enable();                        // 문짝이 도는 따라다니는 커서
```

이벤트(모두 버블링): `rr:open` `rr:close` `rr:change` `rr:confirm` `rr:pick` `rr:buy` `rr:swap` `rr:swapped`

## 원본과 다른 점

- **로고** — 원본은 전용 그림입니다. 자폭·굵기가 가장 가까운 공개 글꼴(Poppins 900)을 4% 좁혀 대신했습니다. 글자 모양은 조금 다릅니다.
- **본문 글꼴** — 원본 크레딧에 적힌 Noto Sans CJK와 같은 계열인 Noto Sans KR(웹폰트)입니다. 인터넷이 없으면 맑은 고딕으로 대신 보입니다(`css/fonts.css` 참고).
- **아이콘** — 원본 이미지를 쓰지 않고 다시 그린 벡터입니다. 영상 프레임 여러 장을 겹쳐 평균 낸 그림에 도형(선·원·다각형)의 수치를 맞춰 넣는 방식으로 그렸고, 독·카드·목록에서 원본과 위치·크기가 1px 안쪽으로 맞습니다. 다만 1080p 영상의 해상도보다 작은 세부(선 끝의 둥글기 등)는 추정입니다.
- **배경** — 군중과 회전문은 분위기만 옮긴 정지 그림이며, 게임 플레이는 구현하지 않았습니다.
- **폭발의 가닥** — 원본의 가닥은 지나는 자리의 색을 뒤집습니다(흰 바탕에서는 검게, 검은 버튼 위에서는 희게). 키트에서는 늘 검은 선이라 검은 버튼 위를 지나는 동안에는 보이지 않습니다. 유난히 굵은 가닥이 두 줄로 갈라져 보이는 것도 옮기지 않았습니다. 방향·빠르기·수명은 원본처럼 살 때마다 무작위입니다.
- **영상에서 볼 수 없던 움직임** — 구매로 게이지의 단계가 오를 때 막대와 표지가 움직이는 모습은 원본 영상에서 늘 툴팁에 가려 있습니다. 게이지가 열릴 때 계측한 것과 같은 감속으로 움직이게 했습니다(추정).
- **문구** — 영상에 나온 것은 그대로, 영상에 없는 툴팁 일부는 같은 말투로 채웠습니다.
- **키보드 포커스 표시** — 원본에는 없지만 접근성을 위해 넣었습니다.

이 저장소는 UI 연구·학습용 팬 작업물입니다. Round and Round Inc.의 이름과 디자인은 원저작자의 것입니다.
