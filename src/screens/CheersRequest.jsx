// S-06 건배 요청 — 기능정의서 v0.3 §5(실시간 건배방 F-RT 전용).
//   "건배방 만들기"(F-RT-01) · "코드로 참여"(F-RT-03)로 실시간 방(S-10) 진입.
//   v0.3에서 비동기 공유 링크 '짠'(구 F-CH) 제거 — 링크 경로 없음(context §1·§2.1).
//   건배방은 술자리 모드 전용 — 혼술 모드 진입 시 가드(진입 버튼은 PourInteraction에서 이미 숨김).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'

export default function CheersRequest() {
  const navigate = useNavigate()
  const mode = useAppStore((s) => s.mode)
  const [code, setCode] = useState('')

  const createRoom = () => navigate('/room', { state: { action: 'create' } })
  const joinRoom = () => {
    const c = code.trim()
    if (!c) return
    navigate('/room', { state: { action: 'join', code: c } })
  }

  // 혼술 모드(또는 모드 미선택)면 건배방 차단 — 안내 + 모드 변경 동선.
  if (mode !== 'party') {
    return (
      <div className="screen">
        <AppHeader title="건배하기" />
        <div className="screen-body center">
          <p className="hint center">건배방은 술자리 모드에서 이용할 수 있어요</p>
          <button className="btn primary" onClick={() => navigate('/mode')}>모드 바꾸기</button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <AppHeader title="건배하기" />
      <div className="screen-body center">
        {/* 실시간 건배방(여럿이 동시에) */}
        <div className="card-block">
          <div className="card-label">여럿이 실시간으로</div>
          <p className="hint">방을 만들고 코드를 나누면, 함께 동시에 ‘짠’</p>
          <button className="btn amber" onClick={createRoom}>건배방 만들기</button>
          <div className="join-row">
            <input
              className="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              placeholder="코드 입력"
              inputMode="text"
              aria-label="건배방 코드"
            />
            <button className="btn ghost" onClick={joinRoom} disabled={!code.trim()}>코드로 참여</button>
          </div>
        </div>
      </div>
    </div>
  )
}
