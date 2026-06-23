// S-07 건배 수신 — 개정(기능정의서 v0.3 §5, F-CH-03).
//   기존: 비동기 링크 진입 → '짠' 연출 → 함께하기(S-04). 폴백으로 유지.
//   추가: 실시간 방 경로(S-10) 안내 — 두 경로 공존.
//   // UNVERIFIED: 앱인토스 WebView 링크 진입 파라미터/딥링크 처리 방식 미확인.
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

export default function CheersReceive() {
  const navigate = useNavigate()
  return (
    <div className="screen">
      <AppHeader title="건배 도착" showBack={false} />
      <div className="screen-body center">
        <div className="stage-placeholder">짠!</div>
        <p className="hint">친구가 건배를 보냈어요</p>
        {/* 비동기 링크 경로(폴백) */}
        <button className="btn primary" onClick={() => navigate('/pour')}>함께하기</button>
        {/* 실시간 방 경로 안내(F-CH-03) */}
        <button className="btn ghost" onClick={() => navigate('/cheers')}>건배방으로 함께하기</button>
      </div>
    </div>
  )
}
