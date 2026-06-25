// S-05 샴페인 축하 — F-CR-05(샴페인 한정. 흔들면 코르크 펑 + 거품 분출).
//   화면 구성: 병+코르크+팡 배지+이퀄라이저(phonesul-react-with-assets_3 룩).
//   // UNVERIFIED: 토스 WebView devicemotion 흔들기 감지/iOS 권한 — 현승 검증(context §4.1).
//   센서 실패 대비 탭 트리거 폴백 유지(context §4.1).
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { playSound, haptic } from '../lib/feedback.js'
import { assetUrl } from '../data/presets.js'

export default function Celebrate() {
  const navigate = useNavigate()
  const setDrink = useAppStore((s) => s.setDrink)
  const [popped, setPopped] = useState(false)
  const [corkFlying, setCorkFlying] = useState(false)
  const poppedRef = useRef(false)

  const pop = () => {
    if (poppedRef.current) return
    poppedRef.current = true
    setCorkFlying(true)
    playSound('pop')
    haptic('pop') // 샴페인 축포 — wiggle(흔들리듯)
    setTimeout(() => {
      setPopped(true)
      setTimeout(() => navigate('/pour'), 1500) // 연출 후 S-04 복귀
    }, 400)
  }

  useEffect(() => {
    setDrink('champagne')
    // // UNVERIFIED: devicemotion 셰이크 감지·임계값·iOS 권한은 토스 WebView 실기기 검증 필요(현승).
    //   // ASSUMPTION: 흔들기 임계값(delta>25)은 임의값 — 기기별 튜닝 필요.
    let lx = 0, ly = 0, lz = 0
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity || {}
      if (a.x == null) return
      const delta = Math.abs(a.x - lx) + Math.abs(a.y - ly) + Math.abs(a.z - lz)
      lx = a.x; ly = a.y; lz = a.z
      if (delta > 25) pop()
    }
    if (typeof DeviceMotionEvent !== 'undefined') window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="screen">
      <AppHeader title="샴페인" />

      {/* 헤더(상단 전폭)는 그대로 두고, 본문만 중앙 정렬 — 다른 화면과 동일 패턴 */}
      <div className="screen-body center" style={{ gap: 0 }}>
        <div style={{ position: 'relative', marginTop: 40 }}>
          {/* 코르크 (날아가는 연출) */}
          <img
            src={assetUrl('champagne/cork.png')}
            alt=""
            draggable={false}
            style={{
              position: 'absolute', top: corkFlying ? -80 : -10, left: '50%', transform: 'translateX(-50%)',
              width: 36, height: 48, objectFit: 'contain',
              opacity: corkFlying ? 0 : 1, transition: 'top 400ms ease-out, opacity 400ms', zIndex: 2,
            }}
          />
          {/* 샴페인 병(열림 전/후) */}
          <img
            src={popped ? assetUrl('champagne/bottle_open.png') : assetUrl('bottles/champagne.png')}
            alt="샴페인"
            draggable={false}
            style={{
              width: 100, height: 260, objectFit: 'contain',
              filter: 'drop-shadow(0 12px 30px rgba(0,0,0,.5))',
              animation: corkFlying ? 'shake .3s ease' : undefined,
            }}
          />
        </div>

        {popped && (
          <div className="badge amber" style={{ marginTop: 20, fontSize: 22, padding: '6px 24px', borderRadius: 20, animation: 'popIn .3s cubic-bezier(.34,1.56,.64,1)' }}>팡! 🎉</div>
        )}

        <div style={{ fontSize: 22, fontWeight: 800, marginTop: popped ? 16 : 28, marginBottom: 12 }}>
          {popped ? '터졌어요!' : '흔들어서 터뜨리기'}
        </div>
        <p className="hint" style={{ padding: '0 40px' }}>
          {popped ? '잠시 후 마시기로 이동해요' : '흔들면 코르크가 ‘팡’ · 축하해요'}
        </p>

        {/* 이퀄라이저(분위기 장식) */}
        <div className="eq" style={{ marginTop: 32 }}>
          {[10, 18, 24, 14, 8].map((h, i) => <i key={i} style={{ height: h }} />)}
        </div>
      </div>

      {!popped && (
        <button className="btn amber btn-bottom" onClick={pop}>탭해서 터뜨리기</button>
      )}
    </div>
  )
}
