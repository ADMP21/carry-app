'use client'
// src/components/ui/WaxSeal.tsx — ตราประทับยาง VISA style (v4)

// ── Config ────────────────────────────────────────────────────────────────
const V = {
  resolved: {
    color:  '#0f6b28',           // เขียวเข้ม
    glow:   'rgba(0,80,20,0.18)',
    arcTop: '★  แก้ไขเรียบร้อย  ★',
    arcBot: '★  แก้ไขเรียบร้อย  ★',
    lines:  ['แก้ไข', 'แล้ว'],
    rot:    -16,
    seed:   5,
  },
  carry: {
    color:  '#c01010',           // แดงเข้ม
    glow:   'rgba(120,0,0,0.18)',
    arcTop: '★  ยังไม่แก้ไข  ★',
    arcBot: '★  ยังไม่แก้ไข  ★',
    lines:  ['ยังไม่', 'แก้ไข'],
    rot:    16,
    seed:   17,
  },
} as const
type Variant = keyof typeof V

// ── Component ─────────────────────────────────────────────────────────────
export default function WaxSeal({ variant, opacity }: { variant: Variant; opacity: number }) {
  const v  = V[variant]
  const id = variant

  // ขนาดและตำแหน่ง — viewBox 200×200, center 100,100
  const cx = 100, cy = 100
  const rOuter = 90          // วงนอก
  const rInner = 78          // วงใน  (แบนด์กว้าง 12px)
  const rBand  = (rOuter + rInner) / 2  // กึ่งกลางแบนด์ = 84

  // textPath: ข้อความบน — CCW (sweep=0), tops ชี้ออกนอก, baseline ≈ rInner
  const topArcD = `M ${cx - rInner},${cy} A ${rInner},${rInner} 0 0 0 ${cx + rInner},${cy}`
  // textPath: ข้อความล่าง — CW (sweep=1), tops ชี้เข้าศูนย์, baseline ≈ rOuter
  const botArcD = `M ${cx - rOuter},${cy} A ${rOuter},${rOuter} 0 0 1 ${cx + rOuter},${cy}`

  const fontBold = "system-ui,'Segoe UI',Tahoma,'Arial',sans-serif"

  return (
    <svg
      width="260" height="260" viewBox="0 0 200 200"
      style={{
        position:     'absolute',
        top:          '42%',
        left:         '50%',
        transform:    `translate(-50%,-50%) rotate(${v.rot}deg)`,
        opacity,
        pointerEvents:'none',
        zIndex:       10,
        transition:   'opacity .18s',
        overflow:     'visible',
        // drop-shadow รอบตราทั้งหมด
        filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.40)) drop-shadow(0 1px 3px rgba(0,0,0,0.25))`,
      }}
    >
      <defs>
        {/* Arc paths */}
        <path id={`ta-${id}`} d={topArcD}/>
        <path id={`ba-${id}`} d={botArcD}/>

        {/* Clip สำหรับเส้นแบนเนอร์ */}
        <clipPath id={`cp-${id}`}>
          <circle cx={cx} cy={cy} r={rOuter + 1}/>
        </clipPath>

        {/* ── Filter A: grunge สำหรับวงกลมและเส้น (ไม่ใช้กับตัวหนังสือ) ──
            feDisplacementMap = ขอบขรุขระ (scale เล็กน้อย)
            feTurbulence erosion = รอยหมึกสึกเล็กน้อย                        */}
        <filter id={`gr-${id}`} x="-8%" y="-8%" width="116%" height="116%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise"
            baseFrequency="0.025 0.028" numOctaves="4"
            seed={v.seed} result="dn"/>
          <feDisplacementMap
            in="SourceGraphic" in2="dn"
            scale="2.5" xChannelSelector="R" yChannelSelector="G"
            result="warped"/>
          <feTurbulence type="fractalNoise"
            baseFrequency="0.07" numOctaves="4"
            seed={v.seed + 9} result="en"/>
          <feColorMatrix in="en" type="matrix" result="emask"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 6 -3.5"/>
          <feComposite operator="in" in="warped" in2="emask"/>
        </filter>

        {/* ── Filter B: white-halo (GPU only — ไม่ใช้ feMorphology CPU) ── */}
        <filter id={`hl-${id}`} x="-20%" y="-40%" width="140%" height="180%"
          colorInterpolationFilters="sRGB">
          {/* feGaussianBlur บน alpha channel → GPU-accelerated ใน Chrome/Firefox */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="hblur"/>
          <feFlood floodColor="white" floodOpacity="0.9" result="wh"/>
          <feComposite in="wh" in2="hblur" operator="in" result="halo"/>
          <feMerge>
            <feMergeNode in="halo"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* ══════════════════════════════════════════════
          Layer 1: วงกลมและเส้นแบนเนอร์ — ใช้ grunge
      ══════════════════════════════════════════════ */}
      <g stroke={v.color} fill="none" filter={`url(#gr-${id})`}>
        {/* วงนอก */}
        <circle cx={cx} cy={cy} r={rOuter} strokeWidth="6"/>
        {/* วงใน */}
        <circle cx={cx} cy={cy} r={rInner} strokeWidth="2.2"/>
        {/* เส้นแบนเนอร์บน */}
        <line
          x1={cx - rOuter - 8} y1={cy - 24}
          x2={cx + rOuter + 8} y2={cy - 24}
          strokeWidth="2.8" clipPath={`url(#cp-${id})`}/>
        {/* เส้นแบนเนอร์ล่าง */}
        <line
          x1={cx - rOuter - 8} y1={cy + 24}
          x2={cx + rOuter + 8} y2={cy + 24}
          strokeWidth="2.8" clipPath={`url(#cp-${id})`}/>
      </g>

      {/* ══════════════════════════════════════════════
          Layer 2: ข้อความโค้งขอบ — white-halo, ไม่มี grunge
      ══════════════════════════════════════════════ */}
      <g fill={v.color} filter={`url(#hl-${id})`}>
        {/* ข้อความบน */}
        <text
          fontSize="12" fontWeight="800" fontFamily={fontBold}
          letterSpacing="1.8">
          <textPath href={`#ta-${id}`} startOffset="50%" textAnchor="middle" dy="2">
            {v.arcTop}
          </textPath>
        </text>
        {/* ข้อความล่าง */}
        <text
          fontSize="12" fontWeight="800" fontFamily={fontBold}
          letterSpacing="1.8">
          <textPath href={`#ba-${id}`} startOffset="50%" textAnchor="middle" dy="-2">
            {v.arcBot}
          </textPath>
        </text>
      </g>

      {/* ══════════════════════════════════════════════
          Layer 3: ตัวอักษรใหญ่กลางตรา — white-halo, ไม่มี grunge
      ══════════════════════════════════════════════ */}
      <g filter={`url(#hl-${id})`}>
        {v.lines.map((line, i) => {
          const y = cy + i * 30 - ((v.lines.length - 1) * 30) / 2
          return (
            <text key={i}
              x={cx} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={v.color}
              fontSize="36"
              fontWeight="900"
              fontFamily={fontBold}
              letterSpacing="3"
            >
              {line}
            </text>
          )
        })}
      </g>
    </svg>
  )
}
