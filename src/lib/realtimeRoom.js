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

// 방 생성(F-RT-01). 서버 계약: 201 { code, hostToken }.
//   hostToken은 방장 기기만 보관(서버 재발급 없는 1회성). 응답 키는 계약대로 code/hostToken.
export async function createRoom() {
  const res = await fetch(`${BASE}/rooms`, { method: 'POST' })
  if (!res.ok) throw new Error(`방 생성 실패 (${res.status})`)
  const data = await res.json()
  const code = data.code ?? data.roomCode ?? data.room_code ?? data.id
  const hostToken = data.hostToken ?? data.host_token ?? data.token ?? null
  if (!code) throw new Error('방 코드를 받지 못했어요')
  return { code: String(code), hostToken }
}

// 방 종료(방장 전용, F-RT-06) — POST {BASE}/rooms/{code}/close, X-Host-Token 헤더.
//   소켓 close()만으로는 방이 종료되지 않는다(서버 계약) → 방을 전원 종료하려면 반드시 이 호출.
//   200 { status:"closed", code } / 토큰 불일치·없는 방은 404.
export async function closeRoom(code, hostToken) {
  const res = await fetch(`${BASE}/rooms/${encodeURIComponent(code)}/close`, {
    method: 'POST',
    headers: { 'X-Host-Token': hostToken },
  })
  if (!res.ok) throw new Error(`방 종료 실패 (${res.status})`)
  return res.json()
}

// 서버 error code → 사용자 문구. 톤: 음주 권장 없음. // REVIEW(에러 문구): 사용자 노출.
const ERROR_MESSAGES = {
  invalid_code: '없는 방이거나 만료된 코드예요',
  room_full: '방 인원이 가득 찼어요',
  too_many_attempts: '시도가 많아요. 잠시 후 다시 해주세요',
  forbidden_origin: '연결이 허용되지 않았어요',
  bad_json: '잠시 문제가 있었어요',
  unknown_type: '잠시 문제가 있었어요',
}

// room_closed reason → 사용자 문구. // REVIEW(종료 문구): 사용자 노출.
// // ASSUMPTION: reason 키 이름(host_ended/expired)은 명세 예시 기반 추정 — 그 외는 기본 문구.
export const ROOM_CLOSED_MESSAGES = {
  host_ended: '방이 종료되었어요',
  expired: '방이 만료되었어요',
}
export const roomClosedMessage = (reason) => ROOM_CLOSED_MESSAGES[reason] ?? '방이 종료되었어요'

// 재연결 백오프(ms). // ASSUMPTION: 값은 임의 — 실측 후 조정(기능정의서 v0.3 §9 체감 지연 연계).
const RECONNECT_DELAYS = [500, 1000, 2000, 4000]

// 건배방 클라이언트. 콜백: onStatus(상태), onRoster(목록), onCheers(짠), onRoomClosed(reason), onError(문구).
// 상태: 'connecting' | 'open' | 'reconnecting' | 'closed' | 'error'.
export function createRoomClient({ onStatus, onRoster, onCheers, onRoomClosed, onError } = {}) {
  let ws = null
  let code = null
  let hostToken = null // 방장만 보유. 재연결 시에도 동일 토큰 재사용해 방장 식별 유지.
  let closedByUser = false // 사용자 의도 종료(나가기/방 종료) — 재연결 안 함.
  let roomClosed = false // 서버 room_closed 수신 — 재연결 안 함.
  let retry = 0
  let reconnectTimer = 0

  const status = (s) => onStatus?.(s)

  function open() {
    closedByUser = false
    status(retry > 0 ? 'reconnecting' : 'connecting')

    // 연결 = 방 참여(join). 방장은 ?host_token= 부착(서버가 방장 식별), 참여자는 토큰 없이.
    // // REVIEW(host_token URL 노출): 토큰이 URL 쿼리에 실린다 — 이 URL 전체를 로그·에러리포팅·애널리틱스에 남기지 말 것.
    let url = `${wsBase()}/ws/${encodeURIComponent(code)}`
    if (hostToken) url += `?host_token=${encodeURIComponent(hostToken)}`

    try {
      ws = new WebSocket(url)
    } catch {
      status('error')
      onError?.('연결을 시작할 수 없어요')
      return
    }

    // 연결 자체가 join. 별도 join 메시지 불필요(서버 계약: 보내도 no-op).
    ws.onopen = () => {
      retry = 0
      status('open')
    }

    ws.onmessage = (ev) => {
      let msg
      try {
        msg = JSON.parse(ev.data)
      } catch {
        return // 비 JSON 무시
      }
      switch (msg.type) {
        case 'roster': // F-RT-04 인원 동기화(재연결 시 재전송 → 상태 복구)
          onRoster?.(msg.members ?? msg.roster ?? msg.users ?? [])
          break
        case 'cheers': // F-RT-05 짠(서버 broadcast). 보낸 사람·횟수 없음(비게임, context §6).
          onCheers?.(msg)
          break
        case 'room_closed': // 방 종료/만료 — 재연결 금지하고 안내.
          roomClosed = true
          onRoomClosed?.(msg.reason ?? null)
          try {
            ws?.close()
          } catch {
            /* ignore */
          }
          break
        case 'error': // code 우선 매핑, 없으면 서버 message 폴백.
          onError?.(ERROR_MESSAGES[msg.code] ?? msg.message ?? msg.error ?? '오류가 발생했어요')
          break
        default:
          break // 그 외 타입은 무시(leave 등은 서버가 roster로 반영)
      }
    }

    ws.onclose = () => {
      // 사용자 의도 종료/방 종료(room_closed)면 재연결 안 함.
      if (closedByUser || roomClosed) {
        status('closed')
        return
      }
      // 우발적 끊김(백그라운드·네트워크) ≠ 방 종료. 같은 code(+host_token)로 재연결 → roster 재전송으로 복구.
      if (retry < RECONNECT_DELAYS.length) {
        const delay = RECONNECT_DELAYS[retry++]
        status('reconnecting')
        reconnectTimer = setTimeout(() => open(), delay)
      } else {
        status('error')
        onError?.('연결이 끊겼어요. 코드로 다시 시도해 주세요')
      }
    }

    ws.onerror = () => {
      // onclose가 뒤따라 재연결을 처리하므로 여기선 상태만.
      if (!closedByUser && !roomClosed) status('reconnecting')
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
    // 방장이면 token 전달 → ?host_token= 로 연결. 참여자는 token 생략/null.
    connect: (joinCode, token = null) => {
      code = joinCode
      hostToken = token
      retry = 0
      roomClosed = false
      open()
    },
    // F-RT-05: 짠 송신. 누가 먼저/많이 짰는지는 보내지도 집계하지도 않는다(비게임, context §6).
    sendCheers: () => send({ type: 'cheers' }),
    // 나가기(참여자·방장 공통, 보낸 사람만 퇴장). 방 자체 종료는 closeRoom()(REST)로.
    sendLeave: () => send({ type: 'leave' }),
    // 소켓 정리(언마운트/종료 후). 재연결 안 함.
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
