// 영속 저장 mock — context §3(로컬 영구), F-SY-01·02 설정 지속, F-HL-01 누적 지속.
//
// // UNVERIFIED: 실제 앱인토스 Storage SDK로 대체 필요(토스 WebView). 키/직렬화/용량 규약 미확인.
//   데스크톱 로컬 테스트를 위해 localStorage 폴백으로 mock한다. 인터페이스(loadState/saveState)는 유지.
const KEY = 'ponsul.state.v1'

function safeStore() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

export function loadState() {
  const s = safeStore()
  if (!s) return null
  try {
    const raw = s.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// 부분 병합 저장. 실제 SDK 전환 시 이 두 함수만 교체하면 된다.
export function saveState(partial) {
  const s = safeStore()
  if (!s) return
  try {
    const cur = loadState() ?? {}
    s.setItem(KEY, JSON.stringify({ ...cur, ...partial }))
  } catch {
    /* 저장 실패는 무시(세션 한정 동작) */
  }
}
