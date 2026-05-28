'use client'
// src/components/ui/WaxSeal.tsx — ตราประทับยางสไตล์ VISA

// ── Config ────────────────────────────────────────────────────────────────
const V = {
  resolved: {
    color:   '#1b7a3a',                    // เขียวเข้ม
    arcTop:  '★  แก้ไขเรียบร้อย  ★',
    arcBot:  '★  แก้ไขเรียบร้อย  ★',
    lines:   ['แก้ไข', 'แล้ว'],
    rot:     -15,
    seed:    7,
  },
  carry: {
    color:   '#c41414',                    // แดงเข้ม
    arcTop:  '★  ยังไม่แก้ไข  ★',
    arcBot:  '★  ยังไม่แก้ไข  ★',
    lines:   ['ยังไม่', 'แก้ไข'],
    rot:     15,
    seed:    19,
  },
} as const
type Variant = keyof typeof V

// ── Component ─────────────────────────────────────────────────────────────
export default function WaxSeal({ variant, opacity }: { variant: Variant; opacity: number }) {
  const v  = V[variant]
  const id = variant

  // ขนาดและตำแหน่ง (viewBox 180×180, center 90,90)
  const cx = 90, cy = 90
  const rOuter = 81   // วงนอก
  const rInner = 71   // วงใน
  const rTopTxt = rInner        // baseline ข้อความบน (tops ชี้ออกนอก)
  const rBotTxt = rOuter - 1   // baseline ข้อความล่าง (tops ชี้เข้าใน)

  // SVG arc paths สำหรับ textPath
  // บน: counter-clockwise (sweep=0) → ข้อความวิ่งซ้าย→ขวาบนส่วนบน, tops ชี้ออกนอก
  const topArcD = `M ${cx - rTopTxt},${cy} A ${rTopTxt},${rTopTxt} 0 0 0 ${cx + rTopTxt},${cy}`
  // ล่าง: clockwise (sweep=1) → ข้อความวิ่งซ้าย→ขวาส่วนล่าง, tops ชี้เข้าหาศูนย์กลาง
  const botArcD = `M ${cx - rBotTxt},${cy} A ${rBotTxt},${rBotTxt} 0 0 1 ${cx + rBotTxt},${cy}`

  const fontMain = "'Prompt','Sarabun','Arial Black','Arial',sans-serif"
  const fontArc  = "'Sarabun','Prompt','Arial',sans-serif"

  return (
    <svg
      width="230" height="230" viewBox="0 0 180 180"
      style={{
        position: 'absolute', top: '42%', left: '50%',
        transform: `translate(-50%,-50%) rotate(${v.rot}deg)`,
        opacity,
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'opacity .18s',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Arc paths */}
        <path id={`ta-${id}`} d={topArcD}/>
        <path id={`ba-${id}`} d={botArcD}/>

        {/* Clip ให้เส้นแบนเนอร์ไม่ล้นวงนอก */}
        <clipPath id={`cp-${id}`}>
          <circle cx={cx} cy={cy} r={rOuter + 1}/>
        </clipPath>

        {/* ── filter: stamp grunge ────────────────────────────────────
            1) displacementMap → ขอบขรุขระเหมือนยางกด
            2) feTurbulence threshold → รอยสึก / หมึกขาด                */}
        <filter id={`stamp-${id}`}
          x="-12%" y="-12%" width="124%" height="124%"
          colorInterpolationFilters="sRGB">

          {/* noise สำหรับ displacement (ขอบไม่ตรง) */}
          <feTurbulence type="fractalNoise"
            baseFrequency="0.022" numOctaves="3"
            seed={v.seed} result="disp"/>
          <feDisplacementMap
            in="SourceGraphic" in2="disp"
            scale="2.2" xChannelSelector="R" yChannelSelector="G"
            result="distorted"/>

          {/* noise สำหรับ erosion (รอยสึกหมึก) */}
          <feTurbulence type="fractalNoise"
            baseFrequency="0.055" numOctaves="5"
            seed={v.seed + 8} result="erode"/>
          <feColorMatrix in="erode" type="matrix" result="emask"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3.8 -1.2"/>

          {/* ใช้ erosion mask ตัดทอน distorted source */}
          <feComposite operator="in" in="distorted" in2="emask"/>
        </filter>
      </defs>

      {/* ── ทุกอย่างใช้สีเดียว + filter grunge ── */}
      <g fill={v.color} stroke={v.color} filter={`url(#stamp-${id})`}>

        {/* วงนอก (หนา) */}
        <circle cx={cx} cy={cy} r={rOuter}
          fill="none" strokeWidth="5.5"/>

        {/* วงใน (บาง) */}
        <circle cx={cx} cy={cy} r={rInner}
          fill="none" strokeWidth="2"/>

        {/* ── ข้อความโค้งขอบบน ── */}
        <text fontSize="10.5" fontWeight="800" fontFamily={fontArc}
          letterSpacing="1.2" stroke="none">
          <textPath href={`#ta-${id}`} startOffset="50%" textAnchor="middle">
            {v.arcTop}
          </textPath>
        </text>

        {/* ── ข้อความโค้งขอบล่าง ── */}
        <text fontSize="10.5" fontWeight="800" fontFamily={fontArc}
          letterSpacing="1.2" stroke="none">
          <textPath href={`#ba-${id}`} startOffset="50%" textAnchor="middle"
            dy="2">
            {v.arcBot}
          </textPath>
        </text>

        {/* ── เส้นแบนเนอร์คู่ (แนวนอน ± 22px จากจุดศูนย์) ── */}
        <line
          x1={cx - rOuter - 8} y1={cy - 22}
          x2={cx + rOuter + 8} y2={cy - 22}
          strokeWidth="2.2" clipPath={`url(#cp-${id})`}/>
        <line
          x1={cx - rOuter - 8} y1={cy + 22}
          x2={cx + rOuter + 8} y2={cy + 22}
          strokeWidth="2.2" clipPath={`url(#cp-${id})`}/>

        {/* ── ตัวอักษรใหญ่ตรงกลาง (bold ตัดขอบคมเหมือน VISA stamp) ── */}
        {v.lines.map((line, i) => {
          const y = cy + i * 28 - ((v.lines.length - 1) * 28) / 2
          return (
            <text key={i}
              x={cx} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              stroke="none"
              fontSize="33"
              fontWeight="900"
              fontFamily={fontMain}
              letterSpacing="2"
            >
              {line}
            </text>
          )
        })}
      </g>
    </svg>
  )
}
