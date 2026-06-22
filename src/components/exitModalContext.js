// 종료 확인 모달(S-10) 호출용 컨텍스트.
// 공통 헤더의 닫기(X)가 어느 화면에서도 종료 모달을 열 수 있게 한다(F-SY-06 → F-SY-05).
import { createContext, useContext } from 'react'

export const ExitModalContext = createContext({ openExit: () => {} })
export const useExitModal = () => useContext(ExitModalContext)
