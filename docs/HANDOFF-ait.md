# 핸드오프 — 앱인토스(Granite) 변환 · 빌드 · 샌드박스

> 폰술 웹앱(Vite+React)을 앱인토스 **Granite** 미니앱으로 변환한 작업의 인수인계 노트.
> appName = **`phonesul`** (콘솔 등록·승인 완료, **변경 불가**). 스킴 `intoss://phonesul`.
> 작성 시점 2026-06-24. SDK 사용법은 공식 문서·MCP(ax)에 위임(레포 규칙).

## 0. 현재 상태 (무엇이 되고, 무엇이 안 됨)

- ✅ **변환 완료**: 순수 Vite 앱 → Granite. `ait build` 로 `phonesul.ait` 생성됨(오프라인·로그인 불필요).
- ✅ **iOS 실기기 샌드박스 실증**: 화면 구동 + **실시간 건배방(코드 생성·짠·재연결)** 동작 확인. wss 백엔드 연동까지 실기기에서 검증됨(이번 변환의 최대 리스크였던 부분).
- ✅ **공유(F-RT-02)**: `share`/`getTossShareLink` 실제 SDK 연동(`src/lib/share.js`). 샌드박스에서 공유 시트 동작 확인.
- ⏸ **앱 소스는 무수정**으로 변환됨(이미 `HashRouter` 사용 = WebView 안전). 프론트가 곧 갱신 예정 → SDK 통합(§6의 1~7)은 **갱신된 프론트에서 인수자가 진행**.
- ❗ **출시(deploy) 미수행**. 콘솔 업로드/검토요청 전 §5·§7 확인 필요.

## 1. 변환 레이어 (이번에 바뀐 파일)

| 파일 | 내용 |
|---|---|
| `granite.config.ts` | **신규**. appName=phonesul, 한글명 "폰술", web.commands(dev/build), `host`(아래 §3 주의) |
| `vite.config.ts` | **신규**(기존 `vite.config.js` 삭제). react 플러그인 + `optimizeDeps.include`(아래 §7) |
| `package.json` | 스크립트 교체(`dev: granite dev` / `build: ait build` / `deploy: ait deploy`) + web-framework·TDS 의존성 추가. test(vitest) 유지 |
| `.gitignore` | `*.ait`, `.granite/` 추가 |
| `src/lib/share.js` | **신규**. 코드 공유 SDK 연동(+웹 폴백) |
| `src/screens/CheersRoom.jsx` | 죽어있던 공유 핸들러 → `shareRoomCode()` 사용 |
| `.env.local` | (gitignore) `VITE_RT_SERVER_URL` = 백엔드 주소. 로컬 머신/네트워크별로 다름 |

## 2. 로컬 개발 · 빌드

```bash
npm install
npm run dev      # = granite dev : vite(웹, :5173) + granite/metro(:8081) 동시 기동
npm run build    # = ait build   : dist/ + phonesul.ait 생성
npm test         # vitest (변환과 무관, 그대로 동작)
```

- `.ait` 빌드는 **로그인 불필요**. `dist/web/` 가 실제 WebView 앱, `dist/bundle.*` 는 RN 호스트 셸.

## 3. iOS 실기기 샌드박스 연결 (★ 함정 정리)

순서:
1. `granite.config.ts` 의 `web.host` 를 **맥 LAN IP로** 변경 (`ipconfig getifaddr en0`).
   - 커밋 기본값은 `localhost` (머신 IP 커밋 금지). **테스트할 때만 로컬에서 IP로 바꿔 쓴다.**
2. `npm run dev` 기동 후, **metro 번들 예열** 권장: `curl "http://<맥IP>:8081/index.bundle?platform=ios&dev=true"` (콜드 스타트 깜빡임 방지).
3. 샌드박스(테스트앱): 개발자 로그인 → 토스 인증 → **서버 주소에 맥 IP만 입력**(포트 X) → 스킴 `intoss://phonesul` 실행 → 로컬 네트워크 권한 허용.

겪은 문제와 해결:
- **"로컬 서버를 찾을 수 없음"**: ① `web.host` 가 `localhost` 면 폰이 자기 자신을 찾음 → **맥 IP로** 설정. ② 샌드박스 서버주소엔 **IP만**(8081/5173 직접 입력 아님).
- **기관/캠퍼스 WiFi(폴리텍 등)에서 계속 끊김/안 붙음**: WiFi의 **기기 격리(AP isolation)** 때문. 여러 WiFi 바꿔도 같은 정책이면 안 됨. → **아이폰 개인용 핫스팟에 맥을 연결**(폰↔맥 직결)하면 확실히 됨. (이때 맥 IP는 보통 `172.20.10.x`.)
- IP가 바뀌면(네트워크 변경/핫스팟) **`granite.config` host + `.env.local` 둘 다 갱신 + dev 재시작**.
- **dev 서버 재시작은 폰 metro 세션을 끊음** → 잦은 재시작 자제. 재시작 후 §3-2 예열로 빠르게 복구.

## 4. 백엔드(실시간 건배방) 연동

- 별도 레포 `toss-backend/phonesul_backend` (FastAPI + wss). `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- 프론트는 `.env.local` 의 `VITE_RT_SERVER_URL` 로 접속(REST는 http, ws는 자동 변환). **Vite env는 기동 시 주입 → 값 바꾸면 dev 재시작 필요.**
- 샌드박스는 http 허용(라이브는 https 필수). 핫스팟/같은 망에 백엔드가 떠 있어야 건배방 동작.

## 5. `.ait` 빌드 → 콘솔 업로드 → 출시

1. `npm run build` → `phonesul.ait`.
2. 콘솔(apps-in-toss.toss.im)에서 앱 번들 업로드 (**압축해제 100MB 이하**). 토스앱에서 최종 테스트.
3. 검토 요청(영업일 최대 3일, 테스트 1회 이상 필수) → 승인 후 출시.

## 6. 토스 SDK 통합 체크리스트 (갱신된 프론트에서 진행)

> SDK 래퍼는 `src/lib/*` 인터페이스로 격리되어 있어 UI가 바뀌어도 교체가 쉬움(storage.js/feedback.js/share.js 패턴).

**검수 권장 (현재 mock/미연동)**
1. **Storage** — 설정(사운드·진동·모드) 영속. 현재 `src/lib/storage.js` = localStorage mock → 실제 Storage SDK.
2. **generateHapticFeedback** — 진동. 현재 `src/lib/feedback.js` `haptic()` = navigator.vibrate 폴백(WebView no-op) → 실제 햅틱.
3. **closeView** — 종료 확인 모달·닫기(X) (F-SY-05/06). 미니앱 실제 종료 호출.
4. **무음 모드 존중·백그라운드 사운드**(F-SY-03/04) — 실기기 검증·정합.
   - 참고: 따르기 사운드(`startPourSound`)는 **실제 웹 Audio 재생됨**(mock 아님). `playSound`(개별 효과음)만 현재 로그-only mock.

**기능 연동**
5. **getAnonymousKey** — 건배방 익명 식별·코드 남용 방지.
6. **모션 권한** — 기울여 따르기/샴페인 흔들기(DeviceMotion/Orientation, iOS requestPermission). 실기기 검증.
7. **자동입장 딥링크** — `getTossShareLink('intoss://phonesul/cheers?code=...')` + 런치 스킴 파싱(`getSchemeUri`). 공유는 됨, 자동입장만 남음.

**불필요(결정됨)**: `appLogin`(토스 로그인) — 익명·코드 기반으로 **미사용 확정**.

API 시그니처는 `node_modules/@apps-in-toss/web-bridge/dist/*.d.ts` 참고. 예: `getTossShareLink(path, ogImageUrl?) => Promise<string>`, `share({ message }) => Promise<void>`.

## 7. 알려진 이슈 · 주의

- **`.ait` ≈ 87MB**: RN 소스맵 + 따르기 PNG 프레임 시퀀스 + 오디오 때문. 출시 100MB 제한 근접 → **업로드 전 소스맵 제외·에셋 최적화** 검토.
- **`optimizeDeps.include: ["@apps-in-toss/web-framework"]`** (vite.config.ts): SDK를 동적 import 하므로 미리 번들 안 하면 첫 호출 때 Vite 재최적화+강제 리로드 → 샌드박스 WebView 연결이 끊김. 그래서 사전 포함함. **share 외 SDK를 더 동적 import 하면 여기 추가** 검토.
- **`base` 경로**: WebView 루트 서빙 기준 절대경로(`/assets/...`). 기존 `vite.config.js` 의 `base:'./'`(상대)는 제거함.
- 사용자 노출 문구·딥링크·brand(displayName/primaryColor/icon)는 `// REVIEW` 대상 — 콘솔 등록값과 일치 확인.

## 8. 브랜치

- 작업 브랜치: `ai/granite-ait-convert` (dev 기준). 커밋 접두사 `ai:`(검수 전). 머지 전 사람 검수 필요(레포 규칙).
