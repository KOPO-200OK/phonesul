// S-01 스플래시 / 로딩 — F-SY-07(초기 로딩 10초 이내, 에셋 사전 로드).
//   화면 구성: 로고 + 앱명 + 슬로건 + 로딩 바(phonesul-react-with-assets_3 룩).
//   로딩 바가 차오르면 모드 선택(S-02)으로 자동 진입(레퍼런스 디자인 동작).
//   // ASSUMPTION: 로딩 연출 시간(3초)은 임의값 — 실제 에셋 프리로드 타이밍 연결 시 조정(F-SY-07 ≤10초 내).
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetUrl } from '../data/presets.js'

const LOAD_MS = 3000
const TICK_MS = 50

export default function Splash() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let elapsed = 0
    const timer = setInterval(() => {
      elapsed += TICK_MS
      setProgress(Math.min(100, (elapsed / LOAD_MS) * 100))
      if (elapsed >= LOAD_MS) {
        clearInterval(timer)
        navigate('/mode')
      }
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="screen center">
      <img className="logo-img" src={assetUrl('logo/phonesul.png')} alt="폰술" draggable={false} />
      <div className="logo">폰술</div>
      <p className="slogan">마시지 않고, 분위기만</p>

      {/* 로딩 바(차오르면 자동 진입) */}
      <div style={{ position: 'absolute', bottom: 120, left: 47, right: 47 }}>
        <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width 50ms linear' }} />
        </div>
        <p className="hint center">준비 중… (첫 화면 10초 이내)</p>
      </div>
    </div>
  )
}
