const screens = {
  home: {
    pill: "HOME",
    title: "홈 화면 정보 밀도",
    subtitle:
      "홈에서 무엇을 먼저 보여줄지, 어떤 카드 밀도가 적절한지 판단할 때 쓰는 기본 시안입니다.",
    cta: "홈 화면 시나리오",
    stats: [
      ["최우선 노출", "오늘의 공지 / 경쟁 / 기록"],
      ["두 번째 노출", "최근 활동 / 추천 동작"],
      ["세 번째 노출", "진입 버튼 / 바로가기"],
    ],
    cards: [
      {
        title: "핵심 영역",
        body: "첫 화면에서는 공지, 오늘의 상태, 바로 행동할 수 있는 버튼이 먼저 보여야 합니다.",
      },
      {
        title: "정보 밀도",
        body: "카드 수를 줄이더라도 사용자가 즉시 이해할 수 있는 요약 텍스트가 필요합니다.",
      },
      {
        title: "행동 유도",
        body: "‘경쟁 참여’, ‘기록 시작’, ‘워치 연결’처럼 다음 행동을 분명히 제시합니다.",
      },
    ],
    timeline: [
      ["상단", "브랜딩과 현재 상태를 짧게 요약"],
      ["중앙", "기능 카드와 빠른 진입 버튼"],
      ["하단", "최근 기록 및 공지"],
    ],
  },
  room: {
    pill: "ROOM",
    title: "경쟁방 진입 시나리오",
    subtitle:
      "공개방 목록, 선택 확인, 입장 대기, 시작 전 상태를 한 번에 검토하는 시안입니다.",
    cta: "경쟁방 시나리오",
    stats: [
      ["목록 정보", "인원 / 거리 / 마감"],
      ["진입 흐름", "선택 → 확인 → 입장"],
      ["상태 구분", "경쟁 준비 / 경쟁 중"],
    ],
    cards: [
      {
        title: "공개방 리스트",
        body: "현재 인원, 최대 인원, 목표 거리, 마감 시각이 한 줄에 들어가야 합니다.",
      },
      {
        title: "입장 확인",
        body: "사용자가 탭한 뒤 입장 여부를 한 번 더 확인하는 흐름이 안전합니다.",
      },
      {
        title: "대기실",
        body: "입장 완료 후에는 참가자 상태와 방 상태를 분리해서 보여줍니다.",
      },
    ],
    timeline: [
      ["1", "목록에서 방 선택"],
      ["2", "확인 팝업으로 진입 의도 재확인"],
      ["3", "대기실에서 시작 준비"],
    ],
  },
  live: {
    pill: "LIVE",
    title: "실시간 랭킹 화면",
    subtitle:
      "ETA 중심 정렬, 진행 중 상태, 현재 거리와 차이를 함께 보여주는 실시간 랭킹 시안입니다.",
    cta: "실시간 랭킹",
    stats: [
      ["정렬 기준", "ETA 우선"],
      ["보조 기준", "진행률 / 페이스"],
      ["표시 제외", "측정 대기 / DNS"],
    ],
    cards: [
      {
        title: "상단 요약",
        body: "현재 내 위치, 1등과의 차이, 바로 앞 사람과의 차이를 동시에 보여줍니다.",
      },
      {
        title: "실시간 행",
        body: "이름, ETA, 현재 페이스, 상태를 한 줄로 정리하면 비교가 쉬워집니다.",
      },
      {
        title: "운영 메모",
        body: "표시하지 않을 상태는 랭킹 카드가 아니라 별도 결과 영역으로 넘깁니다.",
      },
    ],
    timeline: [
      ["정렬", "ETA 기준 정렬 후 보조 기준 적용"],
      ["표시", "진행 중 / 완료만 실시간 랭킹에 포함"],
      ["예외", "DNS / DNF / disqualified는 순위 외 결과"],
    ],
  },
  final: {
    pill: "FINAL",
    title: "최종 랭킹 화면",
    subtitle:
      "숫자 순위 리스트를 먼저 보여주고, 순위 외 결과는 접힘 섹션으로 구분하는 시안입니다.",
    cta: "최종 랭킹",
    stats: [
      ["메인 리스트", "1위, 2위, 3위…"],
      ["보조 영역", "순위 외 결과"],
      ["결과 상태", "DNS / DNF / disqualified"],
    ],
    cards: [
      {
        title: "순위 리스트",
        body: "완주한 참가자만 숫자 순위로 정렬하고, 가장 먼저 확인되는 영역에 둡니다.",
      },
      {
        title: "순위 외 결과",
        body: "마감/미시작/실격은 별도 카드 그룹으로 빼서 주 순위와 시각적으로 분리합니다.",
      },
      {
        title: "보관용 정보",
        body: "최종 시간, 판정 상태, 코멘트를 같이 남기면 나중에 확인하기 좋습니다.",
      },
    ],
    timeline: [
      ["상단", "최종 확정 문구와 대상 정보"],
      ["중앙", "숫자 순위 메인 리스트"],
      ["하단", "순위 외 결과 접힘 섹션"],
    ],
  },
  watch: {
    pill: "WATCH",
    title: "워치 리모컨 / 모니터링",
    subtitle:
      "워치를 입력 장치가 아니라 최소 조작 리모컨으로 쓰는 시나리오를 보여주는 시안입니다.",
    cta: "워치 시나리오",
    stats: [
      ["역할", "작은 리모컨"],
      ["핵심 정보", "거리 / 페이스 / 차이 / ETA"],
      ["입력 제한", "시작·일시정지·재개·종료"],
    ],
    cards: [
      {
        title: "리모컨 역할",
        body: "워치에는 복잡한 화면보다 빠른 상태 확인과 최소한의 제어만 두는 편이 좋습니다.",
      },
      {
        title: "보여줄 정보",
        body: "현재 거리, 현재 페이스, 1등과의 차이, 바로 앞 사람과의 차이, ETA를 보여줍니다.",
      },
      {
        title: "조작 버튼",
        body: "시작 / 일시정지 / 재개 / 종료 버튼의 노출 조건을 간단히 확인합니다.",
      },
    ],
    timeline: [
      ["기본", "현재 상태 확인"],
      ["조작", "시작·일시정지·재개·종료"],
      ["보조", "진행 상황 모니터링"],
    ],
  },
};

const tabs = document.getElementById("screen-tabs");
const view = document.getElementById("screen-view");
const pill = document.getElementById("screen-pill");

function renderScreen(key) {
  const screen = screens[key];

  pill.textContent = screen.pill;

  view.innerHTML = `
    <div class="screen-head">
      <div>
        <p class="section-label">${screen.pill} SCREEN</p>
        <h2 class="screen-title">${screen.title}</h2>
        <p class="screen-subtitle">${screen.subtitle}</p>
      </div>
      <div class="screen-cta">${screen.cta}</div>
    </div>

    <div class="screen-grid">
      ${screen.stats
        .map(
          ([label, value]) => `
            <article class="card">
              <h4>${label}</h4>
              <p>${value}</p>
            </article>
          `,
        )
        .join("")}
    </div>

    <div class="screen-grid">
      ${screen.cards
        .map(
          (card) => `
            <article class="card">
              <h4>${card.title}</h4>
              <p>${card.body}</p>
            </article>
          `,
        )
        .join("")}
    </div>

    <div class="timeline">
      ${screen.timeline
        .map(
          ([step, text]) => `
            <div class="timeline-row">
              <strong>${step}</strong>
              <span>${text}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;

  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === key);
  });
}

function renderTabs() {
  tabs.innerHTML = Object.entries(screens)
    .map(
      ([key, screen]) => `
        <button class="tab" type="button" data-screen="${key}">${screen.pill} · ${screen.title}</button>
      `,
    )
    .join("");

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest(".tab");
    if (!button) return;
    renderScreen(button.dataset.screen);
  });
}

renderTabs();
renderScreen("home");
