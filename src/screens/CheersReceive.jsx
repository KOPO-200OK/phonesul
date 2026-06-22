// S-07 건배 수신 — F-CH-03(링크 진입 시 '짠' 연출, 비동기 링크 매개) → F-CR-02(함께하기 S-04).
// 골격: 화면·동선만. 링크 세션 인식/연출/햅틱은 후속 단계.
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
        <button className="btn primary" onClick={() => navigate('/pour')}>함께하기</button>
      </div>
    </div>
  )
}
