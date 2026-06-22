// S-01 스플래시 / 로딩 — F-SY-07(초기 로딩 10초 이내, 에셋 사전 로드).
// 골격: 브랜드·절제 슬로건만. 실제 에셋 프리로드/타이밍은 후속 단계.
import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()
  return (
    <div className="screen center">
      <div className="logo">폰술</div>
      <p className="slogan">마시지 않고, 분위기만</p>
      {/* 골격: 자동 전환 대신 수동 진입 버튼(로딩 로직은 후속) */}
      <button className="btn primary" onClick={() => navigate('/mode')}>시작</button>
    </div>
  )
}
