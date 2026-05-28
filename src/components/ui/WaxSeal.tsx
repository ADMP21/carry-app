'use client'
// src/components/ui/WaxSeal.tsx

// ── สร้าง path รูปทรงครั่งอินทรีย์ (ไม่ใช่วงกลมสมบูรณ์) ──────────────
function blobPath(cx: number, cy: number, r: number, seed: number): string {
  const N   = 64
  const pts: string[] = []
  for (let i = 0; i < N; i++) {
    const a    = (i * 2 * Math.PI) / N
    const bump = Math.sin(i * 2.9 + seed) * 3.4 + Math.cos(i * 4.3 + seed * 1.6) * 2.2
    const ri   = r + bump
    pts.push(`${(cx + ri * Math.cos(a)).toFixed(2)},${(cy + ri * Math.sin(a)).toFixed(2)}`)
  }
  return `M ${pts.join(' L ')} Z`
}

// ── ค่าสีและ config ──────────────────────────────────────────────────────
const V = {
  resolved: {
    // เขียวมรกตเมทัลลิก
    g: ['#c8f5de', '#58d084', '#20a04e', '#0e6030', '#041a0e'] as string[],
    sh:  'rgba(2,28,12,0.55)',
    tc:  '#030d06',
    lines: ['แก้ไข', 'แล้ว'],
    seed: 7,
    rot:  -14,
  },
  carry: {
    // อำพัน-แดงเมทัลลิก
    g: ['#ffe8b0', '#f0a020', '#c05800', '#7c2c00', '#340e00'] as string[],
    sh:  'rgba(42,12,0,0.55)',
    tc:  '#120400',
    lines: ['ยังไม่', 'ได้แก้ไข'],
    seed: 13,
    rot:  14,
  },
} as const
type Variant = keyof typeof V

// ── Component ─────────────────────────────────────────────────────────────
export default function WaxSeal({ variant, opacity }: { variant: Variant; opacity: number }) {
  const v    = V[variant]
  const id   = variant
  const seal = blobPath(82, 82, 73, v.seed)
  const ring = blobPath(82, 82, 60, v.seed + 3)

  return (
    <svg
      width="164" height="164" viewBox="0 0 164 164"
      style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: `translate(-50%,-50%) rotate(${v.rot}deg)`,
        opacity,
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'opacity .15s',
        overflow: 'visible',
        // drop-shadow ตามรูปทรงจริงของครั่ง
        filter: `drop-shadow(0px 10px 14px ${v.sh}) drop-shadow(0px 2px 5px rgba(0,0,0,0.22))`,
      }}
    >
      <defs>
        {/* เนื้อครั่ง: gradient จากสว่างมากมุมซ้ายบน → เข้มมาก */}
        <radialGradient id={`g-${id}`} cx="30%" cy="22%" r="74%">
          <stop offset="0%"   stopColor={v.g[0]}/>
          <stop offset="14%"  stopColor={v.g[1]}/>
          <stop offset="42%"  stopColor={v.g[2]}/>
          <stop offset="74%"  stopColor={v.g[3]}/>
          <stop offset="100%" stopColor={v.g[4]}/>
        </radialGradient>

        {/* specular highlight: จุดสว่างวาวบนผิวครั่ง */}
        <radialGradient id={`h-${id}`} cx="26%" cy="17%" r="40%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.72"/>
          <stop offset="32%"  stopColor="#ffffff" stopOpacity="0.20"/>
          <stop offset="65%"  stopColor="#ffffff" stopOpacity="0.04"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </radialGradient>

        {/* secondary shimmer ขวาล่าง */}
        <radialGradient id={`s2-${id}`} cx="72%" cy="76%" r="30%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </radialGradient>

        {/* rim: ขอบนูนของครั่งที่ถูกดันออกรอบๆ */}
        <radialGradient id={`r-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="78%"  stopColor="transparent"/>
          <stop offset="84%"  stopColor="#ffffff" stopOpacity="0.26"/>
          <stop offset="88%"  stopColor="transparent"/>
          <stop offset="93%"  stopColor="#000000" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.44"/>
        </radialGradient>

        {/* wax swirl / grain texture */}
        <filter id={`tx-${id}`} x="0" y="0" width="100%" height="100%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise"
            baseFrequency="0.028 0.065" numOctaves="4"
            seed={v.seed + 6} result="noise"/>
          <feColorMatrix in="noise" type="matrix" result="dark"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/>
          <feComposite in="dark" in2="SourceGraphic" operator="in" result="m"/>
          <feBlend in="SourceGraphic" in2="m" mode="multiply"/>
        </filter>

        {/* deboss text */}
        <filter id={`em-${id}`} x="-25%" y="-80%" width="150%" height="260%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.7" result="b1"/>
          <feOffset dx="0" dy="1.3" in="b1" result="o1"/>
          <feFlood floodColor="rgba(255,255,255,0.28)" result="c1"/>
          <feComposite in="c1" in2="o1" operator="in" result="lightEdge"/>

          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="b2"/>
          <feOffset dx="0" dy="-1.0" in="b2" result="o2"/>
          <feFlood floodColor="rgba(0,0,0,0.60)" result="c2"/>
          <feComposite in="c2" in2="o2" operator="in" result="darkEdge"/>

          <feMerge>
            <feMergeNode in="lightEdge"/>
            <feMergeNode in="darkEdge"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* ── เนื้อครั่งหลัก (semi-transparent ~80%) ── */}
      <path d={seal}
        fill={`url(#g-${id})`}
        fillOpacity="0.80"
        filter={`url(#tx-${id})`}/>

      {/* ── Specular highlights ── */}
      <path d={seal} fill={`url(#h-${id})`}  fillOpacity="1"/>
      <path d={seal} fill={`url(#s2-${id})`} fillOpacity="1"/>

      {/* ── Rim (ขอบนูน) ── */}
      <path d={seal} fill={`url(#r-${id})`}  fillOpacity="1"/>

      {/* ── วงแหวนประดับด้านใน ── */}
      <path d={ring} fill="none"
        stroke={v.tc} strokeOpacity="0.16" strokeWidth="1.4"/>

      {/* ── เส้นวงกลมซ้อนจำลองรอยกด stamp ── */}
      {[55, 47].map(pr => (
        <circle key={pr} cx="82" cy="82" r={pr}
          fill="none" stroke={v.tc} strokeOpacity="0.05" strokeWidth="0.8"/>
      ))}

      {/* ── ตัวอักษร debossed ── */}
      {v.lines.map((line, i) => {
        const y = 80 + i * 22 - ((v.lines.length - 1) * 22) / 2
        return (
          <text key={i}
            x="82" y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={v.tc}
            fillOpacity="0.78"
            fontSize="15"
            fontWeight="900"
            fontFamily="'Courier New', Courier, monospace"
            letterSpacing="2.5"
            filter={`url(#em-${id})`}
          >
            {line}
          </text>
        )
      })}
    </svg>
  )
}
