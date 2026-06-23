// 실시간 건배방 통신 캡슐화 — F-RT-01~07.
//   방 생성(POST /rooms) · wss 연결 · 메시지 분기(join/leave/cheers/roster/error) · 재연결.
// 컴포넌트(S-10)는 이 모듈의 콜백만 구독한다(통신 세부 비노출).
//
// 서버 인터페이스는 STEP 8 프롬프트 명세를 그대로 사용한다(추측 금지):
//   - POST {base}/rooms        → 방 코드 + 방장 토큰
//   - ws  {base}/ws/{코드}     → 코드로 입장
//   - 메시지 JSON, type 분기: 보냄 join/cheers, 받음 roster/cheers/error
//
// // REVIEW(서버 endpoint 설정): 주소는 .env(VITE_RT_SERVER_URL)로만 주입 — 하드코딩 금지(기능정의서 v0.3 §9).
// // UNVERIFIED: 토스 WebView에서 wss(교차 Origin) 연결 허용 여부는 실기기 검증 필요(기능정의서 v0.3 §9).

// 서버 base URL(http/https). 미설정 시 로컬 기본값.
const BASE = (import.meta.env.VITE_RT_SERVER_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

// http(s) base → ws(s) 스킴으로 변환(배포 https → wss 자동).
function wsBase() {
  return BASE.replace(/^http/, 'ws')
}

// 방 생성(F-RT-01). 응답으로 코드·방장 토큰 수신.
// // ASSUMPTION: 응답 필드명(code/hostToken 등)은 문서 미명세 → 흔한 키를 관용적으로 수용. 서버 확정 시 좁힐 것.
export async function createRoom() {
  const res = await fetch(`${BASE}/rooms`, { method: 'POST' })
  if (!res.ok) throw new Error(`방 생성 실패 (${res.status})`)
  const data = await res.json()
  const code = data.code ?? data.roomCode ?? data.room_code ?? data.id
  const hostToken = data.hostToken ?? data.host_token ?? data.token ?? null
  if (!code) throw new Error('방 코드를 받지 못했어요')
  return { code: String(code), hostToken }
}

// 재연결 백오프(ms). // ASSUMPTION: 값은 임의 — 실측 후 조정(기능정의서 v0.3 §9 체감 지연 연계).
const RECONNECT_DELAYS = [500, 1000, 2000, 4000]

// 건배방 클라이언트. 콜백: onStatus(상태), onRoster(목록), onCheers(짠), onError(메시지).
// 상태: 'connecting' | 'open' | 'reconnecting' | 'closed' | 'error'.
export function createRoomClient({ onStatus, onRoster, onCheers, onError } = {}) {
  let ws = null
  let code = null
  let closedByUser = false
  let retry = 0
  let reconnectTimer = 0

  const status = (s) => onStatus?.(s)

  function open(joinCode) {
    code = joinCode
    closedByUser = false
    status(retry > 0 ? 'reconnecting' : 'connecting')
    try {
      ws = new WebSocket(`${wsBase()}/ws/${encodeURIComponent(code)}`)
    } catch {
      status('error')
      onError?.('연결을 시작할 수 없어요')
      return
    }

    ws.onopen = () => {
      retry = 0
      status('open')
      send({ type: 'join' }) // F-RT-03 입장 송신
    }

    ws.onmessage = (ev) => {
      let msg
      try {
        msg = JSON.parse(ev.data)
      } catch {
        return // 비 JSON 무시
      }
      // type 분기(문서 §3). // ASSUMPTION: payload 세부 형태는 미명세 → 관용적으로 수용.
      switch (msg.type) {
        case 'roster': // F-RT-04 인원 동기화
          onRoster?.(msg.members ?? msg.roster ?? msg.users ?? [])
          break
        case 'cheers': // F-RT-05 실시간 짠(서버 broadcast)
          onCheers?.(msg)
          break
        case 'error':
          onError?.(msg.message ?? msg.error ?? '오류가 발생했어요')
          break
        default:
          break // leave 등은 서버가 roster로 반영 — 별도 처리 불필요
      }
    }

    ws.onclose = () => {
      if (closedByUser) {
        status('closed')
        return
      }
      // F-RT-07 재연결: 백오프로 같은 코드 재입장 시도.
      if (retry < RECONNECT_DELAYS.length) {
        const delay = RECONNECT_DELAYS[retry++]
        status('reconnecting')
        reconnectTimer = setTimeout(() => open(code), delay)
      } else {
        status('error')
        onError?.('연결이 끊겼어요. 코드로 다시 시도해 주세요')
      }
    }

    ws.onerror = () => {
      // onclose가 뒤따라 재연결을 처리하므로 여기선 상태만.
      if (!closedByUser) status('reconnecting')
    }
  }

  function send(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj))
      return true
    }
    return false
  }

  return {
    connect: (joinCode) => {
      retry = 0
      open(joinCode)
    },
    // F-RT-05: 짠 송신. 누가 먼저/많이 짰는지는 보내지도 집계하지도 않는다(비게임, context §6).
    sendCheers: () => send({ type: 'cheers' }),
    // 사용자 의도 종료/나가기(F-RT-06) — 재연결 안 함.
    close: () => {
      closedByUser = true
      clearTimeout(reconnectTimer)
      try {
        ws?.close()
      } catch {
        /* ignore */
      }
      ws = null
    },
  }
}
