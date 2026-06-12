# PPOLO SwiftUI 화면 구조 초안

이 문서는 현재 와이어프레임 기준으로, iOS SwiftUI에서 화면을 어떻게 나눌지 확인하기 위한 초안이다.

## 1) 앱 최상위 구조

```text
PpoloApp
└─ AppRootView
   ├─ Launch / Entry
   ├─ MainTabView
   │  ├─ HomeView
   │  ├─ RecordEntryView
   │  ├─ MatchEntryView
   │  └─ MyView
   └─ Modal / FullScreen flows
      ├─ RunningRecordFlow
      ├─ GymRecordFlow
      ├─ WorkoutRecordDetailFlow
      ├─ MatchRoomFlow
      ├─ MatchInProgressFlow
      ├─ ResultFlow
      └─ WatchCompanionView
```

## 2) 화면 흐름

### A. 진입 / 홈
- `LaunchView`
  - 앱 시작 시 로고 / 상태 확인 / 초기 로딩
- `HomeView`
  - 오늘 상태
  - 빠른 시작
  - 최근 기록
  - 매치방 진입

### B. 기록 흐름
- `RecordEntryView`
  - 먼저 `러닝 저장` / `헬스 저장`을 선택하는 분기 화면
- `RunningRecordView`
  - 지도 / 경로
  - 시간, 거리, 페이스, BPM
  - 일시정지 / 종료
- `GymRecordView`
  - 날짜 입력이 먼저
  - 운동 항목을 하나씩 추가
  - 부위 / 운동명 / 세트 / 중량 / 횟수
  - 저장
- `WorkoutRecordDetailView`
  - 저장 후 진입하는 상세 확인 화면
  - 러닝 / 헬스 기록을 다시 열람
  - 수정 / 공유

### C. 매치 흐름
- `MatchRoomView`
  - 초대하기
  - 방장 전용 시작하기
  - 참가자 목록
- `MatchInProgressView`
  - 지도 / 코스
  - 남은 시간
  - 현재 거리
  - 랭킹 오버레이
- `ResultView`
  - 최종 결과
  - 확인
  - 결과동의(방 설정이 켜진 경우만 노출)
- `ResultIncompleteView`
  - 마감 시점에 완료 기록이 없을 때 사용
  - 미완료 상태 라벨
  - 랭킹 대신 미완료 결과 표현

### D. 워치 흐름
- `WatchCompanionView`
  - 핵심 상태만 표시
  - PAUSE / STOP 같은 최소 조작
  - 실시간 거리 / 시간 / 순위

## 3) SwiftUI 네비게이션 구조 제안

```swift
struct AppRootView: View {
    @StateObject var appState: AppState

    var body: some View {
        Group {
            if appState.isLaunching {
                LaunchView()
            } else {
                MainTabView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            HomeView()
            RecordEntryView()
            MatchEntryView()
            MyView()
        }
    }
}
```

## 4) 상태 모델 초안

### RecordState
```text
idle
choosingType
running
runningPaused
gymEditing
gymSaved
detail
```

### MatchState
```text
idle
waitingRoom
matching
completed
incomplete
```

### ResultState
```text
final
agreementEnabled
incomplete
```

## 5) 화면별 핵심 규칙

- `RecordEntryView`
  - 첫 행동은 기록 종류 선택이어야 한다.
- `GymRecordView`
  - 날짜 입력이 첫 단계다.
  - 운동 항목은 한 줄씩 추가한다.
- `MatchRoomView`
  - 시작 버튼은 방장 전용이다.
  - 초대하기는 항상 별도 액션으로 유지한다.
- `ResultView`
  - 버튼은 `확인`, `결과동의`만 기준으로 둔다.
  - 결과동의는 방 설정에 따라 숨길 수 있다.
- `ResultIncompleteView`
  - 완료 기록이 없을 때만 사용한다.
  - 일반 결과 화면과 분리한다.

## 6) 구현 시 우선순위

1. `HomeView`
2. `RecordEntryView`
3. `RunningRecordView`
4. `GymRecordView`
5. `MatchRoomView`
6. `MatchInProgressView`
7. `ResultView`
8. `ResultIncompleteView`
9. `WorkoutRecordDetailView`
10. `WatchCompanionView`

## 7) 확인 포인트

- 기록 흐름에서 상세 확인 화면이 따로 있는가
- 결과 화면에 완료 / 미완료 상태가 분리되어 있는가
- 방장 전용 버튼 규칙이 유지되는가
- 헬스는 날짜 → 운동 항목 추가 순서가 지켜지는가
- 워치는 최소 UI 원칙을 유지하는가
