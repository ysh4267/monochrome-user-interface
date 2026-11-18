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
| `screens/title.html` | 타이틀, 메뉴 hover, 설정 다이얼로그(`?open=settings`) | 0:38 |
| `screens/early.html` | 미니 독, 툴팁, 구매 효과 | 1:43 |
| `screens/submenu.html` | 진행 패널, 뒤로 버튼, 잠긴 툴팁 | 5:26 |
| `screens/hud.html` | 게임 HUD. `?scene=late`(후반), `?open=franchise`, `?open=reopen` | 19:52 / 54:22 |
| `screens/prestige.html` | 환생 업그레이드 목록 | 13:36 |
| `screens/ending.html` | 통계 → “영업 종료.” → 크레딧 (`?step=2`, `?step=3`) | 58:46 |

> **모션이 안 보인다면** — Windows의 “애니메이션 효과”를 꺼 둔 PC에서는 브라우저가 “모션 줄이기”를 요청합니다.
> 이 키트는 원본 게임처럼 **기본으로 항상 재생**합니다. 줄이고 싶을 때만 `<html data-rr-motion="system">`(OS 설정 따름)이나 `data-rr-motion="off"`를 다세요.

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

**독에 버튼 추가** — `.rr-dock__item`을 하나 더 넣으면 끝입니다. 독의 너비, 버튼 간격, 툴팁 위치는 저절로 맞춰집니다.

**화면 추가** — `screens/`의 아무 파일이나 복사해 시작하세요. 화면마다 다른 것은 요소의 자리(여백 몇 줄)뿐입니다.

## 상태 클래스와 속성

| 이름 | 붙이는 곳 | 뜻 |
| --- | --- | --- |
| `.is-affordable` | `.rr-btn` `.rr-price` `.rr-cost` | 살 수 있음(검은 채움, 숨쉬기) |
| `:disabled` / `.is-disabled` | `.rr-btn` `.rr-up` | 잠김 |
| `.is-owned` `.is-maxed` | `.rr-up` | 산 적 있음 / 끝까지 올림 |
| `.is-open` | `.rr-modal` `.rr-tip` `.rr-track__pin` | 열림 |
| `.is-current` | `.rr-track__pin` | 지금 고른 표지 |
| `.is-selected` | `.rr-menu__item` | 고른 메뉴 |
| `.is-active` | `.rr-tab` `.rr-tabpanel` | 켜진 탭 |
| `.is-live` | 토스트·말풍선·획득 라벨·패널 등 | 등장 연출 한 번 재생 |
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
| `data-rr-motion="system\|off"` | (`<html>`에) 모션 줄이기 |

## 스크립트 (선택)

```js
RR.open('#settings');  RR.close('#settings');
RR.purchase(button, { level: 3 });        // 구매 효과 전부
RR.burst(el, { stars: 9, dots: 8, squares: 0 });
RR.levelTag(el, 'Lv.3');   RR.jolt(dock);
RR.gain(layer, '+16,608', x, y);          // 획득 라벨 띄우기
RR.bump(comboEl);                          // 라벨 툭 키우기
RR.count(el, 1200000, { ms: 400 });        // 숫자 굴리기
RR.pick(card);
RR.cursor.enable();                        // 문짝이 도는 따라다니는 커서
```

이벤트(모두 버블링): `rr:open` `rr:close` `rr:change` `rr:confirm` `rr:pick` `rr:buy`

## 원본과 다른 점

- **로고** — 원본은 전용 그림입니다. 자폭·굵기가 가장 가까운 공개 글꼴(Poppins 900)을 4% 좁혀 대신했습니다. 글자 모양은 조금 다릅니다.
- **본문 글꼴** — 원본 크레딧에 적힌 Noto Sans CJK와 같은 계열인 Noto Sans KR(웹폰트)입니다. 인터넷이 없으면 맑은 고딕으로 대신 보입니다(`css/fonts.css` 참고).
- **아이콘** — 원본 이미지를 쓰지 않고 다시 그린 벡터입니다. 영상 프레임 여러 장을 겹쳐 평균 낸 그림에 도형(선·원·다각형)의 수치를 맞춰 넣는 방식으로 그렸고, 독·카드·목록에서 원본과 위치·크기가 1px 안쪽으로 맞습니다. 다만 1080p 영상의 해상도보다 작은 세부(선 끝의 둥글기 등)는 추정입니다.
- **배경** — 군중과 회전문은 분위기만 옮긴 정지 그림이며, 게임 플레이는 구현하지 않았습니다.
- **문구** — 영상에 나온 것은 그대로, 영상에 없는 툴팁 일부는 같은 말투로 채웠습니다.
- **키보드 포커스 표시** — 원본에는 없지만 접근성을 위해 넣었습니다.

이 저장소는 UI 연구·학습용 팬 작업물입니다. Round and Round Inc.의 이름과 디자인은 원저작자의 것입니다.
