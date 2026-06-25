// S-01 스플래시 / 로딩 — F-SY-07(초기 로딩 10초 이내, 에셋 사전 로드).
//   화면 구성: 로고 + 앱명 + 슬로건 + 로딩 바(phonesul-react-with-assets_3 룩).
//   로딩 바가 차오르면 모드 선택(S-02)으로 자동 진입(레퍼런스 디자인 동작).
//   // ASSUMPTION: 로딩 연출 시간(3초)은 임의값 — 실제 에셋 프리로드 타이밍 연결 시 조정(F-SY-07 ≤10초 내).
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetUrl } from '../data/presets.js'
import { getLaunchRoomCode } from '../lib/platform.js'
import { useAppStore } from '../store/useAppStore.js'

const LOAD_MS = 3000
const TICK_MS = 50

export default function Splash() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const navigatedRef = useRef(false) // 자동입장 vs 로딩완료 중복 네비 방지

  useEffect(() => {
    const go = (to, opts) => {
      if (navigatedRef.current) return
      navigatedRef.current = true
      navigate(to, opts)
    }

    // 공유 딥링크로 방 코드가 실려 들어오면 건배방 자동 입장(F-RT-02).
    //   건배방은 술자리 맥락이므로 모드도 party 로 설정(CheersRoom 진입 가드 충족).
    getLaunchRoomCode().then((code) => {
      if (code) {
        useAppStore.getState().setMode('party')
        go('/room', { replace: true, state: { action: 'join', code } })
      }
    })

    // 자동입장이 아니면 로딩 바 후 모드 선택으로.
    let elapsed = 0
    const timer = setInterval(() => {
      elapsed += TICK_MS
      setProgress(Math.min(100, (elapsed / LOAD_MS) * 100))
      if (elapsed >= LOAD_MS) {
        clearInterval(timer)
        go('/mode')
      }
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="screen center">
      <img className="logo-img" src={assetUrl('logo/phonesul.png')} alt="폰술" draggable={false} />
      <div className="logo"></div>
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
