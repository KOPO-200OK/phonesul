// S-08 설정 — 검수 필수 항목 집결(F-SY).
//   F-SY-01(사운드 On/Off) · F-SY-02(진동 On/Off, 꺼도 시각·청각 피드백 유지 — 접근성).
//   설정값은 mock storage로 영속화되어 재진입 후 유지된다(useAppStore + storage.js).
//   F-SY-03(무음 모드 존중) · F-SY-04(백그라운드 사운드 제어)는 시스템 자동 동작이라 안내 행으로 둔다.
//   // REVIEW(복귀 BGM 동작): 백그라운드→복귀 BGM 재생은 과거 반려 사례 — 토스 WebView 실기기 확인 필수.
//   // UNVERIFIED: 무음 모드 감지·실제 오디오 정지/재개는 실기기/토스 WebView 검증 필요.
//   화면 구성은 phonesul-react-with-assets_3 룩(행 + 골드 토글). 로직은 보존.
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { MODE_MAP } from '../data/presets.js'

// 골드 토글 — 접근성 위해 role="switch" + aria-checked.
function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className="switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span className="knob" />
    </button>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { settings, setSound, setHaptic, mode } = useAppStore()

  return (
    <div className="screen">
      <AppHeader title="설정" />
      <div className="screen-body" style={{ gap: 0 }}>
        <div className="row">
          <span>사운드</span>
          <Switch checked={settings.sound} onChange={setSound} label="사운드" />
        </div>
        <div className="row">
          <span>진동(햅틱)</span>
          <Switch checked={settings.haptic} onChange={setHaptic} label="진동" />
        </div>
        <div className="row">
          <span>무음 모드 존중</span>
          <span className="val">자동</span>
        </div>
        <div className="row">
          <span>백그라운드 사운드 정지</span>
          <span className="val">자동</span>
        </div>
        {/* 모드 변경 — 모드 선택(S-02)으로 이동. 마지막 선택 모드 표시(없으면 미설정). */}
        <button
          type="button"
          className="row"
          onClick={() => navigate('/mode')}
          style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', color: 'inherit', font: 'inherit' }}
        >
          <span>모드 변경</span>
          <span className="val">{MODE_MAP[mode]?.label ?? '미설정'} ›</span>
        </button>
        <p className="hint center" style={{ position: 'absolute', bottom: 40, left: 24, right: 24, fontSize: 11 }}>
          진동을 꺼도 화면·소리로 동작을 알 수 있어요
        </p>
      </div>
    </div>
  )
}
