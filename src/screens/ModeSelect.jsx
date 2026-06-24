// S-02 모드 선택(첫 화면) — F-MD-01·02·03. 혼술/술자리 프리셋.
//   화면 구성: 아이콘 카드(phonesul-react-with-assets_3 룩). 선택 시 모드 저장 후 술 선택으로.
//   문구는 context §5.1 준수 — 프로토타입의 '빠른 원샷' 톤은 제외하고 프리셋 cap 유지(폭음·원샷 강요 금지).
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { MODES } from '../data/presets.js'

// 모드 아이콘(연출용). 키는 presets.js MODES 기준(solo/party).
const MODE_ICON = { solo: '🌙', party: '🎵' }

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
      <div className="screen-body">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`card mode-card ${current === m.key ? 'card-on' : ''}`}
            onClick={() => pick(m.key)}
          >
            <span className="mode-ico">{MODE_ICON[m.key] ?? '🥂'}</span>
            <span>
              <span className="card-label" style={{ display: 'block' }}>{m.label}</span>
              <span className="card-cap">{m.cap}</span>
            </span>
          </button>
        ))}
        <p className="hint center" style={{ marginTop: 16 }}>언제든 설정에서 바꿀 수 있어요</p>
      </div>
    </div>
  )
}
