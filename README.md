# ppolo-lab

프로젝트 초기화 완료용 저장소입니다.

## 현재 상태
- GitHub 레포 클론 완료
- 개발용 기본 구조만 준비된 상태
- 애플리케이션 스택은 아직 미정
- 서비스 설계 문서는 `docs/ppolo-system-design.md` 에 작성함

## 디렉터리 구조
- `src/` — 실제 서비스 소스
- `tests/` — 테스트 코드
- `docs/` — 설계/정책/메모
- `scripts/` — 개발 보조 스크립트

## 주요 문서
- `docs/ppolo-system-design.md` — PPOLO 서비스 개요, 아키텍처, 기능, 데이터, 로그 정책
- `docs/ppolo-competition-ranking-spec.md` — 경쟁 실시간/최종 랭킹 알고리즘 명세
- `docs/ppolo-competition-state-machine.md` — 경쟁방/참가자 상태 전이와 마감 규칙
- `docs/ppolo-requirements-clarified.md` — 사용자 응답 기반 요구사항 확정본과 남은 모호점
- `docs/ppolo-watch-screen-scenarios.md` — 기록/경쟁 시 워치 화면 시나리오 초안

## 다음 단계
스택이 정해지면 아래를 바로 추가합니다.
- 실행 환경
- 빌드/테스트 명령
- 린트/포맷 설정
- CI 워크플로우
- Docker 개발 환경
