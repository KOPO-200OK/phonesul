// 잔 + 액체 채움 공용 컴포넌트 — 따르기(S-04)·마시기·건배방(S-10)에서 재사용.
//   잔 SVG를 자연 비율(glassAspect)로 렌더해 레터박싱을 없애고,
//   액체는 잔별 보울 영역(presets.js bowl) 안에서만 아래→위로 차오르게 한다.
//   → 다리 달린 잔(와인·샴페인)에서 액체가 다리에 차던 어긋남 해결.
//
// props:
//   drink       : DRINK 객체(glass·glassAspect·bowl 사용)
//   level       : 0~100 채움 비율(%)
//   height      : 잔 높이(px). 너비는 height×glassAspect로 자동.
//   liquidColor : 액체 색(문자열/그라데이션)
//   className   : 위치 지정용 외부 클래스(절대배치 등)

import { useId } from 'react'

// 보울/비율 누락 시 안전 기본값(거의 정사각 텀블러).
const DEFAULT_BOWL = { top: 10, bottom: 90, left: 12, right: 88 }

export default function Glass({ drink, level = 0, height = 160, liquidColor, className = '' }) {
  const aspect = drink?.glassAspect ?? 0.85
  const b = drink?.bowl ?? DEFAULT_BOWL
  const width = Math.round(height * aspect)
  const lvl = Math.max(0, Math.min(100, level))

  // Figma에서 가져온 액체 모양 SVG path가 있으면 해당 모양 안에서만 차오르게 한다.
  //   liquidShape가 없는 술잔은 기존 방식(.glass-fill-liquid + bowl.clip)을 그대로 사용한다.
  const shape = drink?.liquidShape
  const rawId = useId()
  const shapeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '')

  const viewBox = shape?.viewBox ?? '0 0 100 100'
  const viewBoxNums = viewBox.trim().split(/\s+/).map(Number)
  const vbW = viewBoxNums[2] || 100
  const vbH = viewBoxNums[3] || 100

  // SVG rect를 아래에서 위로 키워서 액체가 차오르는 것처럼 보이게 한다.
  const liquidY = vbH * (1 - lvl / 100)
  const liquidH = vbH * (lvl / 100)

  return (
    <div className={`glass-box ${className}`} style={{ width, height }}>
      {/* 보울 영역(잔 내부)으로 클리핑된 액체 — 이 영역 안에서만 차오름.
          bowl.clip(폴리곤)이 있으면 테이퍼 잔(와인·막걸리·샴페인) 외곽을 따라 모양을 잡는다.
          liquidShape(SVG path)가 있으면 Figma 액체 모양을 clipPath로 사용한다. */}
      <div
        className="glass-fill"
        style={{
          top: `${b.top}%`,
          left: `${b.left}%`,
          width: `${b.right - b.left}%`,
          height: `${b.bottom - b.top}%`,
          clipPath: shape ? undefined : b.clip,
        }}
      >
        {shape ? (
          <svg
            className="glass-fill-svg"
            viewBox={viewBox}
            preserveAspectRatio="none"
          >
            <defs>
              <clipPath id={`liquid-shape-${shapeId}`} clipPathUnits="userSpaceOnUse">
                <path d={shape.path} />
              </clipPath>
            </defs>

            <rect
              x="0"
              y={liquidY}
              width={vbW}
              height={liquidH}
              fill={liquidColor}
              clipPath={`url(#liquid-shape-${shapeId})`}
            />
          </svg>
        ) : (
          <div className="glass-fill-liquid" style={{ height: `${lvl}%`, background: liquidColor }} />
        )}
      </div>
      {drink?.glass && <img className="glass-box-img" src={drink.glass} alt="" draggable={false} />}
    </div>
  )
}