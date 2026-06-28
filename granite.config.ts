import { defineConfig } from "@apps-in-toss/web-framework/config";

// 앱인토스(Granite) 변환 설정.
// appName: 콘솔 등록·승인 완료된 식별자(변경 불가, ②§5.1). intoss://phonesul 스킴 기준.
// 빌드(`ait build`)는 이 파일의 web.commands 를 사용한다.
export default defineConfig({
  appName: "phonesul",
  brand: {
    displayName: "폰술", // 화면 노출 한글명. // REVIEW(노출 문구): 콘솔 노출명과 일치 확인.
    primaryColor: "#BA68C8", // // REVIEW(노출 색상): 브랜드 확정 색으로 교체.
    icon: "https://static.toss.im/appsintoss/49543/bbc49e5f-4398-4b00-995f-d3afbcb5e812.png", // // REVIEW: 콘솔 등록 로고 URL과 동일해야 함.
  },
  web: {
    // iOS 실기기 샌드박스 테스트 시에는 이 값을 "맥 LAN IP"로 바꿔야 폰이 dev 서버에 닿는다
    //   (localhost면 폰이 자기 자신을 찾음). `ipconfig getifaddr en0` 로 확인.
    //   기관/캠퍼스 WiFi는 기기 격리로 안 될 수 있음 → 아이폰 핫스팟 권장. 자세히는 docs/HANDOFF-ait.md.
    //   커밋 기본값은 localhost(머신 종속 IP 커밋 금지). 테스트 중엔 로컬에서만 IP로 바꿔 쓴다.
    host: "localhost",
    port: 5173,
    commands: {
      // iOS 실기기 샌드박스: dev 서버를 LAN 에 노출해야 폰에서 접속 가능 → --host.
      dev: "vite dev --host",
      build: "vite build",
    },
  },
  permissions: [], // // UNVERIFIED: 햅틱/모션 등 SDK 권한 필요 시 추가(현재 mock 폴백이라 불요).
  outdir: "dist",
});
