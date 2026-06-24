// S-09 종료 확인 모달(공통 오버레이) — F-SY-05. (v0.2: 화면 재정렬로 S-09)
// '종료' → 스플래시(S-01)로 복귀해 처음부터 재시작(WebView/브라우저엔 실제 종료 API 없음).
// // UNVERIFIED: 앱인토스 WebView 실제 앱 종료 호출 방식 미확인 — 실기기 연결 시 SDK 종료로 교체.
import { useNavigate } from 'react-router-dom'

export default function ExitModal({ open, onClose }) {
  const navigate = useNavigate()
  if (!open) return null

  const onExit = () => {
    // TODO(실기기): 앱인토스 종료 SDK 호출로 교체. 지금은 스플래시 복귀로 대체.
    onClose()
    navigate('/', { replace: true })
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="종료 확인">
      <div className="modal-dialog">
        <div className="modal-q">폰술을 종료할까요?</div>
        <div className="modal-sub">언제든 다시 따라줄게요</div>
        <div className="modal-btns">
          <button className="btn ghost" onClick={onClose}>취소</button>
          <button className="btn amber" onClick={onExit}>종료</button>
        </div>
      </div>
    </div>
  )
}
