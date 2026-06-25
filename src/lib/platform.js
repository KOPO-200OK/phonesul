// 앱인토스 플랫폼 SDK 래퍼 — 환경 확인 · 화면 제어 · 종료.
//   share.js·feedback.js와 동일 패턴: 프레임워크를 동적 import 하고, 비-토스 환경
//   (데스크톱/브라우저/테스트)에선 호출이 throw 하므로 try/catch 로 폴백한다.
//   정적 import 하지 않아 모듈 그래프에 안 끌려오고, 실기기 토스 WebView에서만 로드된다.
// // UNVERIFIED: 실기기 토스 WebView에서 각 SDK 실제 동작 — 샌드박스 확인.

// 운영 환경: 'toss'(실앱) | 'sandbox'(샌드박스) | 'web'(비-토스 폴백). 1회 조회 후 캐시.
let _env = null

export async function getEnv() {
  if (_env) return _env
  try {
    const { getOperationalEnvironment } = await import('@apps-in-toss/web-framework')
    _env = getOperationalEnvironment() // 'toss' | 'sandbox'
  } catch {
    _env = 'web' // 비-토스(데스크톱/브라우저)
  }
  return _env
}

export async function isTossEnv() {
  return (await getEnv()) !== 'web'
}

// 화면 항상 켜짐(따르기 연출·건배방 중 sleep 방지) — setScreenAwakeMode({ enabled }).
//   앱 전체에 영향이라 켠 곳을 떠날 때 반드시 false 로 복구한다(SDK 주석). 비-토스는 no-op.
export async function setScreenAwake(enabled) {
  try {
    const { setScreenAwakeMode } = await import('@apps-in-toss/web-framework')
    await setScreenAwakeMode({ enabled })
    return true
  } catch {
    return false // 비-토스 → no-op
  }
}

// 미니앱 종료(F-SY-05) — closeView(). 성공 시 화면이 닫힌다.
//   비-토스(데스크톱/브라우저)는 종료 API가 없으므로 false 를 반환 → 호출측이 폴백 처리.
export async function closeMiniApp() {
  try {
    const { closeView } = await import('@apps-in-toss/web-framework')
    await closeView()
    return true
  } catch {
    return false
  }
}

// 진입 딥링크(getSchemeUri) — 공유 링크로 들어온 경우 그 URI 문자열을 반환. 없으면 null.
//   '처음 진입한 스킴'만 반환되며(페이지 이동 반영 안 됨), 비-토스는 null.
export async function getLaunchScheme() {
  try {
    const { getSchemeUri } = await import('@apps-in-toss/web-framework')
    return getSchemeUri() // 예: 'intoss://phonesul?code=ABC123'
  } catch {
    return null
  }
}

// 진입 딥링크에서 건배방 코드 추출(F-RT-02 공유 자동입장). 쿼리 ?code= 파싱. 없으면 null.
export async function getLaunchRoomCode() {
  const uri = await getLaunchScheme()
  if (!uri || uri.indexOf('?') === -1) return null
  try {
    const code = new URLSearchParams(uri.slice(uri.indexOf('?') + 1)).get('code')
    return code ? code.trim() || null : null
  } catch {
    return null
  }
}

// 네트워크 상태(getNetworkStatus) — 'OFFLINE'|'WIFI'|'2G'|...|'UNKNOWN'. 비-토스는 'UNKNOWN'.
//   wss 끊김 시 "네트워크 문제 vs 서버 문제" 구분 안내에 사용(F-RT-07).
export async function getNetwork() {
  try {
    const { getNetworkStatus } = await import('@apps-in-toss/web-framework')
    return await getNetworkStatus()
  } catch {
    return 'UNKNOWN'
  }
}
