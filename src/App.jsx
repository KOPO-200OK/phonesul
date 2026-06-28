// App 루트 — 라우팅 골격 + 공통 종료 모달(S-09) 마운트 지점.
//
// 라우팅 전략: HashRouter — 정적 CSR/WebView에서 새로고침 404를 피하는 안전 기본값.
//   // UNVERIFIED: 앱인토스 WebView 라우팅 규칙 확인 후 BrowserRouter 전환 여부 재검토.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { installAudioPolicy } from './lib/audioPolicy.js'
import { setScreenAwake, getEnv } from './lib/platform.js'

import Splash from './screens/Splash.jsx'
import ModeSelect from './screens/ModeSelect.jsx'
import DrinkSelect from './screens/DrinkSelect.jsx'
import PourInteraction from './screens/PourInteraction.jsx'
import Celebrate from './screens/Celebrate.jsx'
import CheersRequest from './screens/CheersRequest.jsx'
import CheersRoom from './screens/CheersRoom.jsx'
import Settings from './screens/Settings.jsx'
import ExitModal from './components/ExitModal.jsx'
import { ExitModalContext } from './components/exitModalContext.js'

export default function App() {
  // 종료 확인 모달(S-09 / F-SY-05)은 모든 화면에서 닫기(X)로 호출되는 공통 오버레이.
  // 골격에선 노출 상태만 관리하고 실제 종료 동작(앱인토스 종료)은 후속 단계에서 연결.
  const [exitOpen, setExitOpen] = useState(false)

  // F-SY-04: 백그라운드/복귀 사운드 정책(visibilitychange) 설치. 시스템 자동 동작.
  useEffect(() => installAudioPolicy(), [])

  // 화면 항상 켜짐: 따르기 연출·건배방 대기 중 화면 sleep 방지. 언마운트 시 복구(SDK 주석).
  //   비-토스(데스크톱/브라우저)는 no-op. 실기기 토스 WebView에서만 적용.
  useEffect(() => {
    setScreenAwake(true)
    return () => { setScreenAwake(false) }
  }, [])

  // 운영 환경 확인(toss/sandbox/web) — 디버그 로그 + 향후 env 분기용(ALLOWED_ORIGINS 등).
  useEffect(() => {
    getEnv().then((env) => { if (import.meta.env.DEV) console.debug('[env]', env) })
  }, [])

  return (
    <ExitModalContext.Provider value={{ openExit: () => setExitOpen(true) }}>
      {/* 폰 목업 프레임(phonesul-react-with-assets_3 룩). 모든 화면·모달이 폰 내부에 들어감. */}
      <div className="phone-wrap">
       <div className="phone">
        <HashRouter>
          <Routes>
          {/* S-01 스플래시 / 로딩 */}
          <Route path="/" element={<Splash />} />
          {/* S-02 모드 선택(첫 화면) */}
          <Route path="/mode" element={<ModeSelect />} />
          {/* S-03 술 선택 */}
          <Route path="/drinks" element={<DrinkSelect />} />
          {/* S-04 음주 인터랙션 — 단일 라우트, 내부 3상태 순환 */}
          <Route path="/pour" element={<PourInteraction />} />
          {/* S-05 샴페인 축하 (S-04 샴페인 분기) */}
          <Route path="/celebrate" element={<Celebrate />} />
          {/* S-06 건배 요청 */}
          <Route path="/cheers" element={<CheersRequest />} />
          {/* S-10 실시간 건배방 (F-RT) — create/join은 navigate state로 전달 */}
          <Route path="/room" element={<CheersRoom />} />
          {/* S-08 설정 */}
          <Route path="/settings" element={<Settings />} />
          {/* 알 수 없는 경로는 스플래시로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* S-09 종료 확인 모달(폰 내부 오버레이) — Router 내부라 종료 시 라우팅 가능 */}
          <ExitModal open={exitOpen} onClose={() => setExitOpen(false)} />
        </HashRouter>
       </div>
      </div>
    </ExitModalContext.Provider>
  )
}
