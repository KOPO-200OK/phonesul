// 건배방 코드 공유(F-RT-02) — 앱인토스 SDK 우선, 데스크톱/브라우저는 웹 표준 폴백.
//
// 토스 WebView: getTossShareLink('intoss://phonesul') 로 토스 딥링크를 만들고
//   share({ message }) 로 네이티브 공유 시트를 띄운다. 받는 사람이 링크를 누르면
//   토스앱이 폰술로 진입(토스앱 없으면 스토어로). 특정 친구 자동전송 아님 — 공유 시트.
// 데스크톱/dev: SDK 브리지 없음 → navigator.share → 클립보드 → 코드 노출 순 폴백.
//
// 프레임워크는 동적 import — 데스크톱/테스트(vitest)에서 모듈 그래프에 안 끌려오고,
//   실기기 토스 WebView에서만 로드·호출된다(브라우저면 호출 시 throw → 폴백).
// // REVIEW(노출 동작): 공유 메시지·딥링크 경로는 사용자 노출 — 문구·링크 검수.
// // UNVERIFIED: 토스 WebView 실기기에서 share/getTossShareLink 실제 동작·권한 — 샌드박스 확인.

// 코드를 딥링크 쿼리에 실어(intoss://phonesul?code=...) 받는 사람이 진입 시 자동 입장한다
//   (런치 스킴 파싱은 platform.getLaunchRoomCode → Splash 에서 처리). 텍스트에도 코드 동봉(폴백·수동 입력용).
const APP_SCHEME = 'intoss://phonesul'

/**
 * 방 코드를 공유한다.
 * @param {string} code 방 코드
 * @returns {Promise<{ ok: boolean, mode: 'toss'|'web-share'|'clipboard'|'none', message?: string }>}
 *   message 가 있으면 호출측에서 사용자 안내(복사/실패)에 쓴다. 공유 시트 성공 시 message 없음.
 */
export async function shareRoomCode(code) {
  const text = `폰술 건배방 코드: ${code}`

  // 1) 앱인토스 SDK (실기기 토스 WebView)
  try {
    const { share, getTossShareLink } = await import('@apps-in-toss/web-framework')
    const link = await getTossShareLink(`${APP_SCHEME}?code=${encodeURIComponent(code)}`)
    await share({ message: `${text}\n${link}` })
    return { ok: true, mode: 'toss' }
  } catch {
    // SDK 미지원 환경(데스크톱/브라우저)·브리지 없음 → 폴백
  }

  // 2) 웹 표준 공유 시트 (모바일 사파리 등)
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ text })
      return { ok: true, mode: 'web-share' }
    }
  } catch {
    // 사용자 취소 등 → 다음 폴백
  }

  // 3) 클립보드 복사
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code)
      return { ok: true, mode: 'clipboard', message: '코드를 복사했어요' }
    }
  } catch {
    // 무시
  }

  // 4) 최후: 코드라도 화면에 노출하도록 메시지 반환
  return { ok: false, mode: 'none', message: `방 코드: ${code}` }
}
