# PPOLO 경기 랭킹 알고리즘 명세

> 대상 기능: 런닝 경기방의 **실시간 랭킹** 및 **최종 랭킹**
>
> 이 문서는 구현자가 바로 개발할 수 있도록 상태, 시간, 점수, 동점 처리, 종료 규칙을 명확히 정의한다.

---

## 1. 목표

PPOLO 경기 랭킹의 목적은 다음과 같다.

- 경기 중인 참가자의 현재 위치를 실시간으로 보여준다.
- 참가자는 서로 다른 시각에 기록을 시작할 수 있지만, 같은 경기방 안에서 공정하게 경기해야 한다.
- 마감 시간 시점에 최종 순위를 확정한다.
- 일시정지, 일시정지 허용 시간, 미기록, DNF, 부정행위 상태를 구분한다.
- 실시간 랭킹과 최종 랭킹을 분리해 저장한다.

---

## 2. 범위

이 명세는 **런닝 경기**에 한정한다.

초기 지원 범위:
- 목표 거리 기준 경기: 5km / 10km / 20km / 42km 등
- 모바일 앱 기록
- 스마트 워치 기록
- 동일 경기방 내 참가자 간 실시간 순위
- 마감 시간 기준 최종 순위

비범위:
- 헬스/요가 등 다른 종목의 랭킹 방식
- 팀전/릴레이전
- 지역 순위, 전역 리더보드

---

## 3. 용어 정의

### 3.1 경기방
동일한 목표 거리, 마감 시간, 규칙을 공유하는 경기 단위.

### 3.2 participant session
참가자가 한 경기방에서 남기는 하나의 기록 세션.

### 3.3 server time
모든 판정은 서버 시간 기준으로 수행한다.
클라이언트 시간은 UI 참고용이며 순위 판정에 사용하지 않는다.

### 3.4 active time
실제로 운동이 진행된 시간.
- `measuring` 구간만 합산한다.
- `paused` 구간은 제외한다.

### 3.5 pause time
운동을 중지한 시간.
- 기본적으로 운동시간에서 제외한다.
- 다만 누적 일시정지 시간이 허용치를 넘으면 순위 비교에 영향을 준다.

### 3.6 effective time
랭킹 계산에 사용되는 유효 시간.

기본식:
```text
effective_time = active_time + pause_penalty_seconds
```

### 3.7 progress
목표 거리 대비 현재 거리의 진행 정도.

기본식:
```text
progress_ratio = current_distance_m / target_distance_m
```

---

## 4. 상태 모델

참가자 상태는 랭킹 계산과 UI 표시를 위해 필요하다.

### 4.1 상태 목록
- `not_joined` : 방에 없음
- `joined_waiting` : 입장했지만 기록 시작 전 / 측정 대기
- `measuring` : 기록 진행 중 / 측정 중
- `paused` : 일시정지 중
- `measured` : 목표 달성 후 종료
- `dns` : 미참가, 마감 시각까지 측정을 시작하지 않음
- `dnf` : 포기/중도 종료
- `disqualified` : 부정행위 또는 무효
- `sync_pending` : 오프라인 기록 동기화 대기

### 4.2 상태 전이

```text
not_joined -> joined_waiting -> measuring -> measured
not_joined -> dns
joined_waiting -> dns
measuring -> paused
paused -> measuring
measuring -> measured
measuring -> dnf
paused -> dnf
measuring -> disqualified
paused -> disqualified
sync_pending -> measuring / measured / dnf / disqualified
```

### 4.3 상태 전이 규칙
- `measured` 는 목표 거리 도달 시 확정된다.
- `dns` 는 마감 시간까지 유효 기록이 없을 때 적용된다.
- `dnf` 는 사용자가 명시적으로 포기하거나, 정책상 중도 종료로 판정될 때 적용된다.
- `disqualified` 는 비정상 기록, 부정행위, 중복 참여 등으로 적용된다.
- `sync_pending` 은 오프라인 상태에서 수집된 기록이 서버에 아직 확정 반영되지 않은 상태다.

---

## 5. 입력 데이터

랭킹 계산에 사용되는 데이터는 아래와 같다.

### 5.1 공통 입력
- `room_id`
- `participant_id`
- `target_distance_m`
- `deadline_at`
- `start_at`
- `last_event_at`
- `status`
- `server_received_at`

### 5.2 기록 입력
- `distance_m`
- `elapsed_active_seconds`
- `pause_seconds`
- `heartbeat_samples` (선택)
- `pace` (선택, 파생 가능)
- `gps_track` (선택)

### 5.3 신뢰도 입력
- `sensor_quality`
- `gps_quality`
- `offline_sync_flag`
- `abnormality_flag`

---

## 6. 시간 규칙

### 6.1 기록 허용 시간
- 경기 기록은 **마감 시간 이전** 에만 시작/갱신/동기화할 수 있다.
- 마감 시간 이후 서버에 도착한 기록은 반영하지 않는다.
- 마감 시간 이후에는 새로운 시작도 불가하다.

### 6.2 참가자별 시작 시각
- 같은 경기방의 참가자는 서로 다른 시각에 기록을 시작할 수 있다.
- 시작 시각이 달라도 같은 방 안에서 같은 경기으로 취급한다.
- 순위는 시작 시각이 아니라 **현재 진행 상태와 유효 성과** 를 기준으로 계산한다.

### 6.3 일시정지 규칙
- `paused` 구간은 `active_time` 에 포함하지 않는다.
- 누적 `pause_seconds` 는 경기 전체 기준의 누적 총합으로 계산한다.
- 누적 `pause_seconds` 가 방장 설정 허용치보다 크면 초과분만 순위 비교에 반영한다.
- 일시정지가 길어질수록 실시간 랭킹에서 불리해진다.

### 6.4 일시정지 유효성 검증
- 이 조항은 **MVP 초안** 이며, 실제 판정 수치와 세부 조건은 MVP 운영 중 데이터와 사용성을 보면서 채운다.
- 현재는 `paused` 상태에서 이동량이 기준치 이상 발생하면 해당 구간을 **유효한 일시정지로 인정하지 않는 방향** 만 정의한다.
- 이동량 기준은 MVP에서 GPS 거리 변화, 센서 이동량, 가속도 변화 등을 참고해 구체화할 수 있다.
- 유효하지 않은 일시정지는 자동으로 `paused -> measuring` 으로 해제한다.
- 이때 사용자에게는 **"일시정지가 해제되었습니다"**, **"이동이 감지되어 일시정지가 무효 처리되었습니다"** 와 같은 경고를 표시한다.
- 무효 처리된 구간은 `pause_seconds` 에 포함하지 않는다.
- 반복적인 무효 일시정지는 검수/제재 후보로 남길 수 있다.

---

## 7. 패널티 규칙

### 7.1 기본 개념
일시정지 시간은 원칙적으로 운동시간에서 제외한다. 하지만 방장이 설정한 누적 무료 일시정지 시간을 초과하면, 초과분만 패널티를 적용한다.

### 7.2 패널티 입력값
- `allowed_pause_seconds` : 경기방 생성 시 방장이 설정하는 누적 무료 일시정지 시간 (0~300초)
- `pause_seconds` : 실제 누적 일시정지 시간

### 7.3 패널티 계산
```text
pause_penalty_seconds = max(0, pause_seconds - allowed_pause_seconds)
```

### 7.4 effective time 계산
```text
effective_time = active_time + pause_penalty_seconds
```

### 7.5 패널티 처리 결과
- `pause_seconds <= allowed_pause_seconds` : 패널티 없음
- `pause_seconds > allowed_pause_seconds` : 초과분만 1:1로 패널티 적용
- 추가 가중 패널티(예: 2배)는 적용하지 않는다
- 패널티는 실시간 랭킹과 최종 랭킹 모두에 반영 가능해야 한다

---

## 8. 실시간 랭킹 알고리즘

실시간 랭킹은 현재 시점의 진행 상태를 기준으로 순서를 계산한다. 기준값은 `ETA` 이며, `ETA` 는 누적 평균 ETA와 최근 구간 ETA를 가중 평균해 산출한다.

### 8.1 실시간 랭킹 목적
- 현재 누가 더 앞서 있는지 즉시 보여준다.
- 늦게 시작한 참가자도 역전 가능해야 한다.
- 진행 중, 완료, 미시작 상태를 하나의 화면에서 함께 표현할 수 있어야 한다.

### 8.2 실시간 랭킹 계산 원칙
- 실시간 랭킹의 1차 기준은 `ETA` 이다.
- `ETA` 는 `avg_weight` 와 `recent_weight` 의 가중 평균으로 계산한다.
- `avg_weight + recent_weight = 100` 이어야 한다.
- MVP 초기값은 `avg_weight = 100`, `recent_weight = 0` 으로 한다.
- 운영 중에는 `80:20`, `60:40` 등으로 최근 구간 반영 비율을 조정할 수 있다.
- 최근 구간 계산에 사용할 시간 범위와 최소 거리 기준은 별도 설정값으로 관리한다.
- `측정 대기` 상태에서는 `ETA` 를 표시하지 않거나 `-` 로 표시한다.
- `DNS`, `DNF`, `disqualified` 상태는 `ETA` 대신 종료 결과로 표시한다.

### 8.3 실시간 랭킹 노출 상태
- `measuring`
- `paused`
- `measured`

`joined_waiting` 는 랭킹 화면에서 숨기고, 별도 대기실 상태로만 표시한다. `dns`, `dnf`, `disqualified` 는 실시간 랭킹이 아니라 종료 결과 영역에서 보여준다.

### 8.4 정렬 보조 기준
`ETA` 를 계산할 수 없거나 값이 같을 때는 아래 순서로 정렬한다.

#### 1순위: 목표 도달 예상 시각
```text
projected_finish_at = current_time + remaining_distance_m / current_speed_mps
```
- 값이 더 이른 사람이 우선한다.
- `measured` 상태는 실제 `finish_at` 를 `projected_finish_at` 으로 사용한다.
- 현재 속도가 더 빠를수록 상위가 된다.

#### 2순위: 진행률
```text
progress_ratio = current_distance_m / target_distance_m
```
- 값이 큰 사람이 우선한다.
- `ETA` 가 계산 불가한 경우 보조 기준으로 사용한다.

#### 3순위: 평균 페이스
```text
pace_seconds_per_km = effective_time / (current_distance_m / 1000)
```
- 값이 작은 사람이 우선한다.
- 같은 거리라면 더 빠른 사람이 상위다.

#### 4순위: 현재 유효 거리
```text
current_distance_m
```
- 진행률이 동일한 경우, 절대 거리도 비교한다.

#### 5순위: 유효 시간
```text
effective_time = active_time + pause_penalty_seconds
```
- 값이 작은 사람이 우선한다.

#### 6순위: 총 일시정지 시간
```text
pause_seconds
```
- 값이 작은 사람이 우선한다.
- 무료 일시정지 허용 범위 안이라도, **일시정지를 전혀 하지 않은 참가자** 가 더 높은 순위를 갖는다.

#### 7순위: 시작 시각
```text
start_at ASC
```
- 더 먼저 시작한 사람이 우선한다.

#### 8순위: 마지막 유효 이벤트 시각
```text
last_event_at ASC
```
- 동일 조건일 경우 안정적인 순서 고정을 위해 사용한다.

---

## 9. 최종 랭킹 알고리즘

최종 랭킹은 마감 시각 기준으로 확정한다.

### 9.1 최종 랭킹 목적
- 경기 종료 결과를 공식적으로 확정한다.
- 이력 저장 및 합의 투표의 기준이 된다.

### 9.2 확정 시점
```text
finalized_at = deadline_at
```

### 9.3 최종 랭킹 처리 규칙
- 마감 시각 이전에 **완주한 참가자만** 최종 랭킹 대상이다.
- 최종 랭킹은 각 참가자의 **측정 시작 시점부터 측정 종료 시점까지의 소요 시간**을 기준으로 계산한다.
- 마감 시각 이후 도착한 데이터는 무시한다.
- `dns`, `dnf`, `disqualified` 는 최종 순위 번호를 부여하지 않고 별도 결과 상태로 분리한다.
- 실시간 랭킹과 최종 랭킹의 계산식은 서로 다를 수 있다.

### 9.4 최종 순위 정렬 기준
1. 완주 소요 시간(짧을수록 우선)
2. `pause_seconds` (짧을수록 우선)
3. `start_at`
4. `last_event_at`

### 9.5 최종 랭킹 세부 규칙
- 같은 소요 시간이라면, 일시정지 시간이 더 짧은 참가자가 우선한다.
- 일시정지 시간까지 같다면 공동 순위를 허용한다.
- `dns` 는 미참가 결과로 따로 표시한다.
- `dnf` 는 중도 포기 결과로 따로 표시한다.
- `disqualified` 는 부정행위/무효 결과로 따로 표시한다.

---

## 10. 동점 처리

### 10.1 동점 정의
아래 모든 값이 같으면 동점으로 본다.
- 완주 상태
- 완주 소요 시간
- `pause_seconds`
- `start_at`
- `last_event_at`

### 10.2 동점 처리 방식
- 기본은 **공동 순위** 허용
- UI에서는 동일 순위를 표시할 수 있어야 한다
- 공동 순위가 부담되면 내부적으로만 동일 점수로 유지하고 표시는 순차 번호로 둘 수 있다

---

## 11. 예외 상태 처리

### 11.1 `dns`
- 마감 시간까지 측정을 시작하지 않은 참가자
- 랭킹에서는 최하위 또는 별도 섹션으로 노출

### 11.2 `dnf`
- 포기 또는 중도 종료
- 기록은 남기되 최종 순위에는 포함하지 않음

### 11.3 `disqualified`
- GPS 조작, 거리 급증, 이중 기록, 비정상 패턴 등
- 최종 순위에서 제외하거나 별도 섹션으로 분리

### 11.4 `sync_pending`
- 오프라인 기록이 서버에 완전히 확정되지 않은 상태
- 실시간 랭킹에는 임시 반영 가능하나, 최종 랭킹은 확정 데이터만 사용

---

## 12. 랭킹 스냅샷

실시간 랭킹은 일정 주기로 스냅샷을 저장할 수 있다.

### 12.1 저장 목적
- 나중에 결과 재현
- 장애 시 복구
- 분쟁/검수

### 12.2 권장 저장 항목
- `room_id`
- `snapshot_at`
- `participant_id`
- `status`
- `distance_m`
- `active_time`
- `pause_seconds`
- `pause_penalty_seconds`
- `effective_time`
- `progress_ratio`
- `rank`

---

## 13. 추천 계산식 요약

### 13.1 실시간 순위 계산 요약
```text
rank_key = (
  state_group,
  progress_ratio DESC,
  distance_m DESC,
  pace_seconds_per_km ASC,
  effective_time ASC,
  pause_seconds ASC,
  start_at ASC,
  last_event_at ASC
)
```

### 13.2 최종 순위 계산 요약
```text
final_rank_key = (
  finished_first,
  goal_reached_at ASC,
  progress_ratio DESC,
  effective_time ASC,
  pause_seconds ASC,
  pace_seconds_per_km ASC,
  distance_m DESC,
  start_at ASC,
  last_event_at ASC
)
```

---

## 14. 시나리오별 해석

### 시나리오 1: 모든 사람이 실시간으로 경기 중
- 모두 `measuring` 또는 `paused`
- 실시간 순위는 진행률과 페이스 중심
- 최종 결과는 마감 시점 스냅샷으로 확정

### 시나리오 2: 몇몇만 경기 중이고 아직 시작하지 않은 사람이 있음
- `measuring` / `paused` / `joined_waiting` 혼합
- 미시작자는 하위 영역에서 표시

### 시나리오 3: 몇몇은 이미 기록을 남겼고 후발자가 경기 중
- 먼저 기록한 사람은 완료 또는 진행 중 상태일 수 있음
- 후발자는 자신의 현재 진행률로 실시간 순위에 참여 가능

### 시나리오 4: 일부는 기록 완료, 일부는 경기 중, 일부는 미시작
- `measured` 는 고정
- `measuring` 은 실시간 반영
- `joined_waiting` 은 대기 상태

### 시나리오 5: 일부는 끝냈고 일부는 아직 시작하지 않음
- 완료자는 상위 고정
- 미시작자는 최하위 또는 별도 표기

---

## 15. 구현 메모

### 15.1 서버 기준 우선
- 모든 시간 계산은 서버 시간으로 판정한다.
- 클라이언트는 오직 표시용으로만 사용한다.

### 15.2 기록 확정 시점
- 운동 데이터는 이벤트 스트림으로 저장하고, 일정 간격 또는 상태 변경 시점에 랭킹을 재계산한다.

### 15.3 안정성
- 실시간 랭킹은 순위가 흔들릴 수 있으므로, UX에서는 "잠정 순위" 와 "확정 순위" 를 분리해 보여줄 수 있다.

### 15.4 부정행위 대응
- 비정상적인 거리 증가, 비정상 페이스, GPS 튐, 중복 기기 기록은 자동 감지 후보로 둔다.
- 자동 판정이 어려우면 검수 대기 상태를 둘 수 있다.

---

## 16. 결론

PPOLO 경기 랭킹은 단순 거리 비교가 아니라,
**상태 + 진행률 + 유효 시간 + 페이스 + 마감 시각** 을 함께 고려하는 알고리즘이어야 한다.

핵심은 다음이다.
- 서로 다른 시각에 시작해도 같은 경기으로 공정하게 비교할 것
- 일시정지는 제외하되, 과도한 정지는 패널티를 줄 것
- 마감 시각 이후 데이터는 반영하지 않을 것
- 실시간 랭킹과 최종 랭킹을 분리해 저장할 것

