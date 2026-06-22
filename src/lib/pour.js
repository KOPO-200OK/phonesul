// 따르기/마시기 순수 계산 — 단위 테스트 대상(F-CR-02/03/04).
// 컴포넌트(PourInteraction)가 이 함수들을 사용한다(로직 단일 출처).
//
// // ASSUMPTION: 임계값·감소량은 문서에 없는 임의값(context §7.3). 검수·튜닝 단계 조정.
export const HOLLOW_THRESHOLD = 8 // 헛누름 임계값(%)
export const DRINK_PER_TAP = 25 // 탭당 잔 감소량(%)

// 누름 지속시간(ms)을 잔 차오름(0~100%)으로 매핑. 가득 차면 100 상한(넘침 없음).
export function computeFill(elapsedMs, fullMs) {
  if (!Number.isFinite(fullMs) || fullMs <= 0) return 100
  return Math.min(100, Math.max(0, (elapsedMs / fullMs) * 100))
}

// 헛누름 분기: 떼는 시점 수위가 임계값 미만이면 마시기로 가지 않는다(F-CR-04).
export function isHollow(level, threshold = HOLLOW_THRESHOLD) {
  return level < threshold
}

// 탭마다 일정량 감소, 0 미만으로 내려가지 않음(F-CR-03).
export function decrementDrink(level, perTap = DRINK_PER_TAP) {
  return Math.max(0, level - perTap)
}
