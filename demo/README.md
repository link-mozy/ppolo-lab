# PPOLO Demo

정적 프로토타입을 `demo.ppolo.org`에서 확인하기 위한 전용 폴더입니다.

## 기본 규칙
- 앱 내부 포트 기본값: `28080`
- 외부 공개: Cloudflare Tunnel
- 소스 위치: `demo/`
- 화면 구현: HTML + CSS + JS

## 실행
```bash
cd /home/hermes/ppolo-lab/demo
docker compose up -d --build
```

## 접속 확인
- 로컬: `http://localhost:28080`
- 외부: `https://demo.ppolo.org`

## Tunnel 메모
`tunnel: ppolo-hermes`
- credentials: `/home/hermes/.cloudflared/626f0fbb-2f16-4709-b6a5-edc393e69bcd.json`
- ingress: `demo.ppolo.org -> http://app:28080`
