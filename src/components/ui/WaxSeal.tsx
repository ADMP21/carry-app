'use client'
// src/components/ui/WaxSeal.tsx

const VARIANTS = {
  resolved: {
    stops: [
      ['0%',   '#b8f5ce'],
      ['12%',  '#5ed48a'],
      ['38%',  '#22a050'],
      ['68%',  '#116235'],
      ['100%', '#061e10'],
    ] as [string, string][],
    shadow:  'rgba(3, 40, 16, 0.76)',
    lines:   ['แก้ไข', 'แล้ว'],
    ink:     '#040f07',
    rot:     -14,
  },
  carry: {
    stops: [
      ['0%',   '#ffe0a0'],
      ['12%',  '#f09020'],
      ['38%',  '#b84a00'],
      ['68%',  '#7a2800'],
      ['100%', '#360e00'],
    ] as [string, string][],
    shadow:  'rgba(55, 16, 0, 0.76)',
    lines:   ['ยังไม่', 'ได้แก้ไข'],
    ink:     '#150400',
    rot:     14,
  },
} as const

type Variant = keyof typeof VARIANTS

interface WaxSealProps {
  variant: Variant
  opacity: number
}

export default function WaxSeal({ variant, opacity }: WaxSealProps) {
  const v   = VARIANTS[variant]
  const uid = variant // unique suffix for all SVG IDs

  return (
    <svg
      width="164" height="164"
      viewBox="0 0 164 164"
      style={{
        position: 'absolute',
        top: '40%', left: '50%',
        transform: `translate(-50%, -50%) rotate(${v.rot}deg)`,
        opacity,
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'opacity .14s',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* ── Wax body gradient: bright highlight → deep shadow ── */}
        <radialGradient id={`wg-${uid}`} cx="30%" cy="22%" r="74%" gradientUnits="objectBoundingBox">
          {(v.stops as [string, string][]).map(([offset, color], i) => (
            <stop key={i} offset={offset} stopColor={color} />
          ))}
        </radialGradient>

        {/* ── Specular highlight (เงาแสงบนผิวครั่ง) ── */}
        <radialGradient id={`hl-${uid}`} cx="26%" cy="17%" r="44%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.68" />
          <stop offset="35%"  stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="80%"  stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
        </radialGradient>

        {/* ── Rim: ขอบนูนของครั่งที่ถูกดันออก ── */}
        <radialGradient id={`rim-${uid}`} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
          <stop offset="80%"  stopColor="transparent"            />
          <stop offset="86%"  stopColor="#ffffff" stopOpacity="0.24" />
          <stop offset="90%"  stopColor="transparent"            />
          <stop offset="94%"  stopColor="#000000" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.50" />
        </radialGradient>

        {/* ── Wax swirl / grain texture ── */}
        <filter id={`tx-${uid}`} x="0" y="0" width="100%" height="100%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise"
            baseFrequency="0.026 0.062" numOctaves="4"
            seed={variant === 'resolved' ? 11 : 17} result="noise" />
          <feColorMatrix in="noise" type="matrix" result="dark"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.26 0" />
          <feComposite in="dark" in2="SourceGraphic" operator="in" result="masked" />
          <feBlend in="SourceGraphic" in2="masked" mode="multiply" />
        </filter>

        {/* ── Drop shadow ── */}
        <filter id={`ds-${uid}`} x="-32%" y="-32%" width="164%" height="164%">
          <feDropShadow dx="0" dy="11" stdDeviation="11"
            floodColor={v.shadow} floodOpacity="1" />
          <feDropShadow dx="0" dy="2"  stdDeviation="3"
            floodColor="rgba(0,0,0,0.28)" floodOpacity="1" />
        </filter>

        {/* ── Deboss text filter ── */}
        <filter id={`em-${uid}`} x="-15%" y="-50%" width="130%" height="200%">
          <feDropShadow dx="0"  dy="1.2" stdDeviation="0.7"
            floodColor="rgba(255,255,255,0.30)" floodOpacity="1" />
          <feDropShadow dx="0"  dy="-1"  stdDeviation="0.9"
            floodColor="rgba(0,0,0,0.60)" floodOpacity="1" />
        </filter>
      </defs>

      {/* ── Seal body ── */}
      <g filter={`url(#ds-${uid})`}>
        {/* 1. เนื้อครั่งหลัก */}
        <circle cx="82" cy="82" r="74" fill={`url(#wg-${uid})`} />
        {/* 2. swirl grain overlay */}
        <circle cx="82" cy="82" r="74"
          fill={`url(#wg-${uid})`}
          filter={`url(#tx-${uid})`}
          opacity="0.48" />
        {/* 3. specular highlight */}
        <circle cx="82" cy="82" r="74" fill={`url(#hl-${uid})`} />
        {/* 4. ขอบนูน rim */}
        <circle cx="82" cy="82" r="74" fill={`url(#rim-${uid})`} />
      </g>

      {/* ── Inner decorative ring ── */}
      <circle cx="82" cy="82" r="62"
        fill="none"
        stroke={v.ink} strokeOpacity="0.18" strokeWidth="1.5" />

      {/* ── Debossed text ── */}
      {v.lines.map((line, i) => {
        const y = 80 + i * 22 - ((v.lines.length - 1) * 22) / 2
        return (
          <text key={i}
            x="82" y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={v.ink}
            fillOpacity="0.80"
            fontSize="16"
            fontWeight="900"
            fontFamily="'Courier New', Courier, monospace"
            letterSpacing="2.5"
            filter={`url(#em-${uid})`}
          >
            {line}
          </text>
        )
      })}
    </svg>
  )
}
