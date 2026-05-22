'use client'
// src/components/screens/AccidentStats.tsx
import { useState } from 'react'
import type { AppState, AccidentRecord } from '@/types'

interface AccidentStatsProps {
  state: AppState
}

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const MONTHS_EN = ['01','02','03','04','05','06','07','08','09','10','11','12']

// Only injuries with daysOff > 3 count for the main LTA statistic
const isLTA = (r: AccidentRecord) => r.daysOff > 3

export default function AccidentStats({ state }: AccidentStatsProps) {
  const { accidentRecords } = state

  // Current year(s) present in records, default to current CE year
  const now = new Date()
  const currentYear = now.getFullYear()
  const years = accidentRecords.length > 0
    ? [...new Set(accidentRecords.map(r => r.year))].sort((a, b) => b - a)
    : [currentYear]
  const [selectedYear, setSelectedYear] = useState(years[0])

  const yearRecords = accidentRecords.filter(r => r.year === selectedYear)

  // Build month → records map
  const byMonth = (month: string) =>
    yearRecords.filter(r => r.accidentDate.startsWith(`${selectedYear}-${month}`))

  // LTA = daysOff > 3
  const ltaByMonth    = MONTHS_EN.map(m => byMonth(m).filter(isLTA).length)
  const totalByMonth  = MONTHS_EN.map(m => byMonth(m).length)
  const daysOffByMonth = MONTHS_EN.map(m => byMonth(m).reduce((s, r) => s + r.daysOff, 0))

  const totalLTA    = ltaByMonth.reduce((a, b) => a + b, 0)
  const totalAll    = totalByMonth.reduce((a, b) => a + b, 0)
  const totalDaysOff = daysOffByMonth.reduce((a, b) => a + b, 0)

  // Cumulative no-LTA streak per month (reset to 0 when LTA > 0)
  const cumulDaysClean: number[] = []
  let streak = 0
  for (let i = 0; i < 12; i++) {
    if (ltaByMonth[i] > 0) {
      streak = 0
    } else {
      const daysInMonth = new Date(selectedYear, i + 1, 0).getDate()
      streak += daysInMonth
    }
    cumulDaysClean.push(streak)
  }

  // Cause breakdown for selected year
  const causeCount = yearRecords.reduce(
    (acc, r) => { acc[r.cause] = (acc[r.cause] || 0) + 1; return acc },
    {} as Record<string, number>,
  )

  // Injury level breakdown (LTA only for main stats)
  const ltaRecords = yearRecords.filter(isLTA)

  const BE = selectedYear + 543

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Year selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span className="mono faint" style={{ fontSize: 11, letterSpacing: '.08em' }}>ปีที่แสดง</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`btn btn-sm ${selectedYear === y ? 'btn-primary' : 'btn-ghost'}`}
            >
              {y + 543} (พ.ศ.)
            </button>
          ))}
        </div>
        {accidentRecords.length === 0 && (
          <span className="mono faint" style={{ fontSize: 11 }}>— ยังไม่มีข้อมูล ใช้ข้อมูลปีปัจจุบัน</span>
        )}
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <KpiCard label="อุบัติเหตุทั้งหมด" value={totalAll} unit="ครั้ง" color="var(--acc-carry)" />
        <KpiCard label="หยุดงาน > 3 วัน (LTA)" value={totalLTA} unit="ครั้ง" color="var(--acc-critical)" />
        <KpiCard label="วันหยุดงานรวม" value={totalDaysOff} unit="วัน" color="#8b5cf6" />
        <KpiCard label="วันสะสมไม่มี LTA" value={cumulDaysClean[now.getMonth()] ?? cumulDaysClean.at(-1) ?? 0} unit="วัน" color="var(--acc-resolved)" />
      </div>

      {/* Table 1: รายเดือน */}
      <div className="card" style={{ marginBottom: 24, overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>ตารางสถิติประสบอันตราย ปี {BE}</div>
          <div className="mono faint" style={{ fontSize: 11, marginTop: 2 }}>
            * นับเฉพาะกรณีหยุดงานเกิน 3 วัน (LTA) ในแถวหลัก · ยอดรวมนับทุกระดับความรุนแรง
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                <th style={thStyle('left')}>รายการ</th>
                {MONTHS_TH.map(m => <th key={m} style={thStyle('center')}>{m}</th>)}
                <th style={thStyle('center')}>รวม</th>
              </tr>
            </thead>
            <tbody>
              <StatRow label="อุบัติเหตุ LTA (> 3 วัน)" values={ltaByMonth} total={totalLTA} highlight="#fef2f2" bold />
              <StatRow label="อุบัติเหตุทุกประเภท"      values={totalByMonth} total={totalAll} />
              <StatRow label="วันหยุดงานรวม (วัน)"      values={daysOffByMonth} total={totalDaysOff} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: วันสะสมไม่มีอุบัติเหตุ */}
      <div className="card" style={{ marginBottom: 24, overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>วันสะสมที่ไม่มีอุบัติเหตุหยุดงานเกิน 3 วัน</div>
          <div className="mono faint" style={{ fontSize: 11, marginTop: 2 }}>
            นับสะสมตั้งแต่เดือน ม.ค. — รีเซ็ตเมื่อมี LTA
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                <th style={thStyle('left')}>รายการ</th>
                {MONTHS_TH.map(m => <th key={m} style={thStyle('center')}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle('left', false, true)}>วันสะสม (วัน)</td>
                {cumulDaysClean.map((v, i) => (
                  <td key={i} style={{
                    ...tdStyle('center', false, true),
                    color: v === 0 ? 'var(--acc-critical)' : 'var(--acc-resolved)',
                    fontWeight: 600,
                  }}>
                    {v}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={tdStyle('left')}>มีอุบัติเหตุ LTA</td>
                {ltaByMonth.map((v, i) => (
                  <td key={i} style={{
                    ...tdStyle('center'),
                    color: v > 0 ? 'var(--acc-critical)' : 'var(--acc-resolved)',
                    fontWeight: v > 0 ? 600 : 400,
                  }}>
                    {v > 0 ? `✗ ${v}` : '✓'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown: Cause + recent records */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* สาเหตุ breakdown */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>สาเหตุการเกิดอุบัติเหตุ</div>
          {totalAll === 0 ? (
            <div className="mono faint" style={{ fontSize: 12 }}>ยังไม่มีข้อมูล</div>
          ) : (
            Object.entries(causeCount).map(([cause, count]) => {
              const pct = Math.round((count / totalAll) * 100)
              return (
                <div key={cause} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{cause}</span>
                    <span className="mono faint">{count} ครั้ง · {pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: cause === 'Unsafe Act.' ? 'var(--acc-carry)' :
                                  cause === 'Unsafe Con.' ? 'var(--ig-blue)' : '#94a3b8',
                      width: `${pct}%`,
                    }} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* รายการล่าสุด */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
            รายการล่าสุด ปี {BE}
            <span className="mono faint" style={{ fontSize: 11, fontWeight: 400, marginLeft: 8 }}>
              ({yearRecords.length} รายการ)
            </span>
          </div>
          {yearRecords.length === 0 ? (
            <div className="mono faint" style={{ fontSize: 12 }}>ยังไม่มีข้อมูล</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {yearRecords.slice(0, 5).map(r => (
                <div key={r.id} style={{
                  padding: '8px 10px',
                  background: 'var(--surface)',
                  borderRadius: 6,
                  borderLeft: `3px solid ${isLTA(r) ? 'var(--acc-critical)' : 'var(--line)'}`,
                  fontSize: 12,
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.name}
                    <span className="mono faint" style={{ fontWeight: 400, marginLeft: 8 }}>{r.department}</span>
                  </div>
                  <div className="mono faint" style={{ fontSize: 11 }}>
                    {r.accidentDate} · {r.injuryLevel} · {r.daysOff} วัน
                  </div>
                </div>
              ))}
              {yearRecords.length > 5 && (
                <div className="mono faint" style={{ fontSize: 11, textAlign: 'center' }}>
                  และอีก {yearRecords.length - 5} รายการ
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

function KpiCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div className="mono faint" style={{ fontSize: 10, letterSpacing: '.08em', marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
        <span className="mono faint" style={{ fontSize: 11 }}>{unit}</span>
      </div>
    </div>
  )
}

function StatRow({ label, values, total, highlight, bold }: {
  label: string; values: number[]; total: number; highlight?: string; bold?: boolean
}) {
  return (
    <tr style={{ background: highlight || 'transparent' }}>
      <td style={tdStyle('left', bold)}>{label}</td>
      {values.map((v, i) => (
        <td key={i} style={tdStyle('center', bold)}>
          {v === 0 ? <span style={{ color: 'var(--line)' }}>—</span> : v}
        </td>
      ))}
      <td style={{ ...tdStyle('center', true), borderLeft: '1px solid var(--line)' }}>{total || '—'}</td>
    </tr>
  )
}

function thStyle(align: 'left' | 'center'): React.CSSProperties {
  return {
    padding: '8px 10px',
    textAlign: align,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '.05em',
    color: 'var(--muted)',
    borderBottom: '1px solid var(--line)',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  }
}

function tdStyle(align: 'left' | 'center', bold?: boolean, altBg?: boolean): React.CSSProperties {
  return {
    padding: '7px 10px',
    textAlign: align,
    fontFamily: bold ? 'var(--font-mono)' : 'inherit',
    fontSize: 12,
    fontWeight: bold ? 600 : 400,
    borderBottom: '1px solid var(--line)',
    background: altBg ? 'var(--surface)' : 'transparent',
    whiteSpace: 'nowrap',
  }
}

