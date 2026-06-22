// S-08 설정 — 검수 필수 항목 집결(F-SY). (v0.2: 기록 화면 제거로 설정이 S-08)
//   F-SY-01(사운드 On/Off) · F-SY-02(진동 On/Off, 꺼도 시각·청각 피드백 유지 — 접근성).
//   설정값은 mock storage로 영속화되어 재진입 후 유지된다(useAppStore + storage.js).
//   F-SY-03(무음 모드 존중) · F-SY-04(백그라운드 사운드 제어)는 사용자 설정이 아닌
//   시스템 자동 동작이라 토글이 아닌 안내 행으로 둔다(로직은 src/lib/audioPolicy.js).
//   // REVIEW(복귀 BGM 동작): 백그라운드→복귀 BGM 재생은 과거 반려 사례 — 토스 WebView 실기기 확인 필수.
//   // UNVERIFIED: 무음 모드 감지·실제 오디오 정지/재개는 실기기/토스 WebView 검증 필요.
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'

export default function Settings() {
  const { settings, setSound, setHaptic } = useAppStore()

  return (
    <div className="screen">
      <AppHeader title="설정" />
      <div className="screen-body">
        <label className="row">
          <span>사운드</span>
          <input type="checkbox" checked={settings.sound} onChange={(e) => setSound(e.target.checked)} />
        </label>
        <label className="row">
          <span>진동(햅틱)</span>
          <input type="checkbox" checked={settings.haptic} onChange={(e) => setHaptic(e.target.checked)} />
        </label>
        <div className="row muted"><span>무음 모드 존중</span><span className="hint">자동</span></div>
        <div className="row muted"><span>백그라운드 사운드 정지</span><span className="hint">자동</span></div>
        <p className="hint">진동을 꺼도 화면·소리로 동작을 알 수 있어요</p>
      </div>
    </div>
  )
}
