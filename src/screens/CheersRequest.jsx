// S-06 건배 요청 — 개정(기능정의서 v0.3 §5).
//   기존: 비동기 공유 링크 '짠'(F-CH-01/02) — 폴백으로 유지.
//   추가: "건배방 만들기"(F-RT-01) · "코드로 참여"(F-RT-03) 실시간 경로 진입.
//   // UNVERIFIED: getTossShareLink / share 실제 동작 — 앱인토스 SDK(MCP/공식문서) 확인 필요.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

export default function CheersRequest() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  const createRoom = () => navigate('/room', { state: { action: 'create' } })
  const joinRoom = () => {
    const c = code.trim()
    if (!c) return
    navigate('/room', { state: { action: 'join', code: c } })
  }

  return (
    <div className="screen">
      <AppHeader title="건배하기" />
      <div className="screen-body center">
        {/* 실시간 건배방(여럿이 동시에) */}
        <div className="card-block">
          <div className="card-label">여럿이 실시간으로</div>
          <p className="hint">방을 만들고 코드를 나누면, 함께 동시에 ‘짠’</p>
          <button className="btn primary" onClick={createRoom}>건배방 만들기</button>
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

        {/* 비동기 링크 '짠'(멀리 있는 친구) — 폴백 유지(F-CH-03) */}
        <div className="card-block">
          <div className="card-label">멀리 있는 친구와</div>
          <p className="hint">링크를 보내면, 친구가 열 때 양쪽에서 ‘짠’</p>
          {/* TODO(후속): getTossShareLink → share 실제 연결 */}
          <button className="btn ghost" disabled>건배 링크 만들기 (준비 중)</button>
        </div>
      </div>
    </div>
  )
}
