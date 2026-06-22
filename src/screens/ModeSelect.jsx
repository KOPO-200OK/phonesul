// S-02 모드 선택(첫 화면) — F-MD-01·02·03.
// 혼술/술자리 프리셋(연출 속도·톤). 선택 시 마지막 모드 저장(mock storage) 후 술 선택으로.
// 분위기 연출에 한정 — 폭음·원샷 강요 톤 금지(context §5.1).
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { MODES } from '../data/presets.js'

export default function ModeSelect() {
  const navigate = useNavigate()
  const setMode = useAppStore((s) => s.setMode)
  const current = useAppStore((s) => s.mode)

  const pick = (key) => {
    setMode(key)
    navigate('/drinks')
  }

  return (
    <div className="screen">
      <AppHeader title="오늘은 어떻게?" showBack={false} />
      <div className="screen-body center">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`card ${current === m.key ? 'card-on' : ''}`}
            onClick={() => pick(m.key)}
          >
            <div className="card-label">{m.label}</div>
            <div className="card-cap">{m.cap}</div>
          </button>
        ))}
        <p className="hint">언제든 설정에서 바꿀 수 있어요</p>
      </div>
    </div>
  )
}
