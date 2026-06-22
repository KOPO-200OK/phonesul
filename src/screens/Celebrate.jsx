// S-05 샴페인 축하 — F-CR-05(샴페인 한정. 흔들면 코르크 펑 + 거품 분출).
// 골격: 화면 구획·복귀 동선만. 셰이크 감지(DeviceMotionEvent)·임계값·쿨다운·햅틱은 후속 단계.
//   // UNVERIFIED: 토스 WebView devicemotion 흔들기 감지 안정성/iOS 권한 — 현승 검증(context §4.1).
//   센서 실패 시 대체 트리거 폴백 필요(context §4.1).
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

export default function Celebrate() {
  const navigate = useNavigate()
  return (
    <div className="screen">
      <AppHeader title="샴페인" />
      <div className="screen-body center">
        <div className="stage-placeholder">흔들어서 터뜨리기 (골격)</div>
        <p className="hint">폰을 흔들면 코르크가 ‘펑’ · 축하해요</p>
        {/* 연출 후 S-04 일반 흐름 복귀 */}
        <button className="btn primary" onClick={() => navigate('/pour')}>돌아가기</button>
      </div>
    </div>
  )
}
