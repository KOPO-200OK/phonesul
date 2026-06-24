// S-10 건배방(신규) — F-RT-01~07(실시간 건배방).
//   방 코드 표시·공유 / 인원 목록(roster) / "짠" 버튼 / 연결 상태 / 나가기·방 종료.
// 짠 연출은 새로 만들지 않고 기존 잔 연출을 재사용한다(기능정의서 v0.3 §5: 에셋 추가 최소화).
// 정책(중요): 누가 먼저/많이 짰는지 집계·순위·표시 없음 — 동시 축하만(비게임, context §6 / 문서 §4).
// 문구: context §5.1 금지→대체 표 준수(음주 권장 톤 금지).
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import Glass from '../components/Glass.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { createRoom, createRoomClient, closeRoom, roomClosedMessage } from '../lib/realtimeRoom.js'
import { playSound, haptic } from '../lib/feedback.js'
import { DRINK_MAP } from '../data/presets.js'

// 짠 연출 노출 시간(ms). // ASSUMPTION: 임의값 — 시각 확인 후 조정.
const CHEERS_FLASH_MS = 900
// 짠 연타 쿨다운(ms). // ASSUMPTION: 임의값 — 서버 쿨다운과 정합 맞출 것(문서 §4 F-RT-05).
const CHEERS_COOLDOWN_MS = 800

const STATUS_LABEL = {
  connecting: '연결 중…',
  reconnecting: '다시 연결 중…',
  open: '연결됨',
  closed: '연결 종료',
  error: '연결 끊김',
}

export default function CheersRoom() {
  const navigate = useNavigate()
  const location = useLocation()
  // 진입 방식: S-06에서 { action:'create' } 또는 { action:'join', code } 전달.
  const action = location.state?.action ?? 'create'
  const joinCode = location.state?.code ?? ''

  const drinkKey = useAppStore((s) => s.drink) ?? 'soju'
  const drink = DRINK_MAP[drinkKey] ?? DRINK_MAP.soju
  const [c0, c1] = drink.colors

  const [code, setCode] = useState(action === 'join' ? joinCode : '')
  const [isHost, setIsHost] = useState(action === 'create')
  const [members, setMembers] = useState([])
  const [status, setStatus] = useState('connecting')
  const [errorMsg, setErrorMsg] = useState('')
  const [closedMsg, setClosedMsg] = useState('') // room_closed 안내(설정 시 방 종료됨)
  const [flash, setFlash] = useState(false)

  const clientRef = useRef(null)
  const flashTimerRef = useRef(0)
  const cooldownRef = useRef(0)
  const hostTokenRef = useRef(null) // 방장만 보관(1회성, 서버 재발급 없음). 종료 REST 호출에 사용.

  // 짠 수신(자기 포함 전원 동시) → 잔 연출 + 설정 종속 사운드·진동(F-SY 승계).
  const onCheers = useCallback(() => {
    setFlash(true)
    playSound('clink') // F-SY-01: 사운드 Off/무음이면 feedback.js가 자동 억제
    haptic('medium') // F-SY-02: 진동 Off면 호출 안 함(시각 피드백은 유지)
    clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => setFlash(false), CHEERS_FLASH_MS)
  }, [])

  // 방 종료/만료 수신 → 안내 + 상태 종료(소켓은 client가 정리, 재연결 안 함).
  const onRoomClosed = useCallback((reason) => {
    setClosedMsg(roomClosedMessage(reason)) // // REVIEW(문구): 사용자 노출(톤: 음주 권장 없음)
    setStatus('closed')
  }, [])

  // 연결 수립 — 마운트 시 1회(create면 방 먼저 생성 후 connect).
  useEffect(() => {
    let cancelled = false
    const client = createRoomClient({
      onStatus: (s) => !cancelled && setStatus(s),
      onRoster: (list) => !cancelled && setMembers(Array.isArray(list) ? list : []),
      onCheers: () => !cancelled && onCheers(),
      onRoomClosed: (reason) => !cancelled && onRoomClosed(reason),
      onError: (m) => !cancelled && setErrorMsg(m),
    })
    clientRef.current = client

    async function boot() {
      try {
        let useCode = joinCode
        if (action === 'create') {
          const room = await createRoom() // F-RT-01
          if (cancelled) return
          useCode = room.code
          hostTokenRef.current = room.hostToken // 방장만 보관(이후 종료 REST·재연결에 사용)
          setCode(room.code)
          setIsHost(true)
        }
        if (!useCode) {
          setErrorMsg('방 코드가 없어요')
          setStatus('error')
          return
        }
        // 방장이면 host_token 부착해 연결(서버 방장 식별), 참여자는 null.
        client.connect(useCode, hostTokenRef.current)
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e?.message ?? '방에 연결하지 못했어요')
          setStatus('error')
        }
      }
    }
    boot()

    return () => {
      cancelled = true
      clearTimeout(flashTimerRef.current)
      client.close() // F-RT-06 정리(언마운트=나가기)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendCheers = () => {
    const now = performance.now()
    if (now - cooldownRef.current < CHEERS_COOLDOWN_MS) return // 연타 방지
    cooldownRef.current = now
    clientRef.current?.sendCheers() // F-RT-05 — 자기 화면도 서버 broadcast 수신으로 연출
  }

  // 코드 공유(F-RT-02). // UNVERIFIED: 앱인토스 share/getTossShareLink 실제 동작 — SDK 확인 필요.
  //   여기선 웹 표준 폴백(navigator.share → 클립보드 → 코드 노출)만. 실제 SDK 연결은 후속.
  const shareCode = async () => {
    const text = `폰술 건배방 코드: ${code}`
    try {
      if (navigator.share) {
        await navigator.share({ text })
        return
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
        setErrorMsg('코드를 복사했어요')
        return
      }
    } catch {
      /* 사용자 취소 등 무시 */
    }
  }

  const leave = async () => {
    // 이미 종료된 방이면 소켓만 정리하고 나감.
    if (!closedMsg && isHost) {
      // 방장 "방 종료" → REST close로 방 자체를 종료(서버가 전원에게 room_closed broadcast).
      //   leave 메시지는 본인만 퇴장이라 방이 안 닫힘 → 반드시 close 엔드포인트 사용.
      try {
        if (hostTokenRef.current) await closeRoom(code, hostTokenRef.current)
      } catch {
        // 실패해도 진행 — 서버 유휴 만료에 위임. // REVIEW: 종료 실패 시 사용자 안내 강화 여지.
      }
    } else if (!closedMsg) {
      clientRef.current?.sendLeave() // 참여자 나가기(본인만 퇴장). 방은 유지.
    }
    clientRef.current?.close()
    navigate('/cheers')
  }

  const connected = status === 'open'
  const memberCount = members.length

  return (
    <div className="screen">
      <AppHeader title="건배방" />
      <div className="screen-body center">
        {/* 상단: 방 코드 + 공유 + 연결 상태 */}
        <div className="room-top">
          <div className="room-code">
            <span className="room-code-cap">방 코드</span>
            <span className="room-code-val">{code || '…'}</span>
          </div>
          <button className="btn ghost" onClick={shareCode} disabled={!code}>
            코드 공유
          </button>
        </div>
        <div className={`room-status room-status-${status}`} aria-live="polite">
          ● {STATUS_LABEL[status] ?? status}
          {isHost ? ' · 방장' : ''}
        </div>

        {/* 중앙: 인원 목록(roster) — 익명 표기, 순위·점수 없음 */}
        <div className="roster">
          <div className="roster-head">함께하는 사람 {memberCount}명</div>
          <ul className="roster-list">
            {members.map((m, i) => (
              // 서버 roster.members는 불투명 ID 문자열(실측 확인) — 사용자에겐 번호로 익명 표기.
              //   문서 §5 "익명 표기(닉/번호)" 준수. ID·실명 노출 안 함.
              <li key={typeof m === 'string' ? m : (m?.id ?? i)} className="roster-item">
                참여자 {i + 1}
              </li>
            ))}
            {memberCount === 0 && <li className="roster-item muted">아직 혼자예요 · 코드를 공유해 보세요</li>}
          </ul>
        </div>

        {/* 중앙: 내 잔 + 짠 연출(기존 잔 연출 재사용) */}
        <div className={`cheers-stage ${flash ? 'is-cheers' : ''}`}>
          <div className="glass-cheers">
            <Glass drink={drink} level={62} height={140} liquidColor={`linear-gradient(180deg, ${c0}, ${c1})`} />
            {flash && <div className="speech">짠!</div>}
          </div>
        </div>

        {/* 방 종료/만료 안내(수신 시). 짠 버튼은 연결 종료로 자동 비활성. */}
        {closedMsg && <p className="hint" aria-live="polite" style={{ color: 'var(--mut)' }}>{closedMsg}</p>}
        {errorMsg && <p className="hint">{errorMsg}</p>}

        {/* 하단: 짠 버튼(누구나) */}
        <button className="btn primary" onClick={sendCheers} disabled={!connected}>
          짠
        </button>
        <p className="hint">함께 잔을 부딪혀요 · 실제 음주 없이 분위기만</p>

        {/* 종료: 나가기 / (방장)방 종료 — 종료 확인은 헤더 X(F-SY-05) 공통 */}
        <div className="nav-row">
          <button className="btn ghost" onClick={leave}>
            {closedMsg ? '나가기' : isHost ? '방 종료하고 나가기' : '방에서 나가기'}
          </button>
        </div>
      </div>
    </div>
  )
}
