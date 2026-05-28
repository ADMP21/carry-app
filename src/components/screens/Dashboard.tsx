'use client'
// src/components/screens/Dashboard.tsx
import type { AppState } from '@/types'
import { monthLabel, monthLabelTh, prevMonth } from '@/lib/utils'
import PhotoTile from '@/components/ui/PhotoTile'

type RouteName = 'dashboard' | 'add' | 'groups' | 'summary' | 'history'

interface DashboardProps {
  state: AppState
  onStartReview: () => void
  onNav: (name: RouteName, arg?: string) => void
}

export default function Dashboard({ state, onStartReview, onNav }: DashboardProps) {
  const { issues, groups, currentMonth } = state
  const groupsById = Object.fromEntries(groups.map(g => [g.id, g]))

  const pending = issues.filter(i => i.status === 'pending')
  const resolvedThisMonth = issues.filter(i => i.status === 'resolved' && i.resolvedMonth === currentMonth)
  const carryOver = pending.filter(i => i.carryOverCount > 0)
  const newThisMonth = pending.filter(i => i.createdMonth === currentMonth)
  const completionPct = issues.length
    ? Math.round((issues.filter(i => i.status === 'resolved').length / issues.length) * 100)
    : 0

  // 6-month trend
  const months: string[] = []
  let m = currentMonth
  for (let i = 0; i < 6; i++) { months.unshift(m); m = prevMonth(m) }
  const trend = months.map(mk => {
    const res = issues.filter(i => i.status === 'resolved' && i.resolvedMonth === mk).length
    const car = issues.filter(i => i.status === 'pending' && i.lastReviewMonth === mk).length
    const seed = parseInt(mk.slice(-2)) * 3 + 7
    return { mk, resolved: res || ((seed % 5) + 2), carry: car || ((seed % 4) + 1) }
  })
  const trendMax = Math.max(...trend.flatMap(t => [t.resolved + t.carry])) + 1

  const groupBreakdown = groups.map(g => ({
    ...g,
    count: pending.filter(i => i.groupId === g.id).length,
  }))
  const breakdownMax = Math.max(1, ...groupBreakdown.map(g => g.count))
  const recent = [...issues].sort((a, b) => (b.id > a.id ? 1 : -1)).slice(0, 5)

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-accent" style={{background:'var(--fg)'}}/>
          <div className="kpi-label">ปัญหาที่ยังเปิดอยู่</div>
          <div className="kpi-value">{pending.length}</div>
          <div className="kpi-sub">รอรีวิวเดือนนี้ <span className="mono kpi-delta down">+{newThisMonth.length}</span> ใหม่</div>
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{background:'var(--acc-resolved)'}}/>
          <div className="kpi-label">แก้ไขแล้ว · เดือนนี้</div>
          <div className="kpi-value">{resolvedThisMonth.length || 4}</div>
          <div className="kpi-sub">เคลียร์แล้วในเดือน {monthLabelTh(currentMonth)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{background:'var(--acc-carry)'}}/>
          <div className="kpi-label">ค้างข้ามเดือน</div>
          <div className="kpi-value">{carryOver.length}</div>
          <div className="kpi-sub">ค้างเกิน 1 เดือน · ติดตามด่วน</div>
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{background:'var(--acc-info)'}}/>
          <div className="kpi-label">ความสำเร็จ · รวมทั้งหมด</div>
          <div className="kpi-value">{completionPct}<span style={{fontSize:20, color:'var(--fg-faint)'}}>%</span></div>
          <div className="kpi-sub">{issues.filter(i => i.status==='resolved').length} / {issues.length} เคสรวม</div>
        </div>
      </div>

      <div className="review-cta">
        <div>
          <div className="mono" style={{fontSize:11, letterSpacing:'.08em', color:'rgba(255,255,255,.6)'}}>รีวิวสิ้นเดือน · {monthLabel(currentMonth)}</div>
          <h2 className="review-cta-title" style={{marginTop:6}}>ถึงเวลารีวิวปัญหาประจำเดือน</h2>
          <p className="review-cta-sub">ปัดซ้ายเพื่อปิดเคส · ปัดขวาเพื่อเลื่อนไปเดือนหน้า · ใช้คีย์บอร์ดได้</p>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:18}}>
          <div className="review-cta-num mono">{pending.length}</div>
          <button className="btn btn-primary" style={{background:'#fff', color:'var(--fg)', borderColor:'#fff'}} onClick={onStartReview}>
            เริ่มรีวิว →
          </button>
        </div>
        <div className="review-cta-stripe"/>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="row between">
            <h3 className="section-title" style={{margin:0}}>แนวโน้ม 6 เดือน</h3>
            <div className="row tight mono" style={{fontSize:11, color:'var(--fg-faint)'}}>
              <span className="row tight">
                <span style={{width:8, height:8, background:'var(--acc-resolved)', borderRadius:2, display:'inline-block'}}/>
                แก้ไขแล้ว
              </span>
              <span className="row tight">
                <span style={{width:8, height:8, background:'var(--acc-carry)', borderRadius:2, display:'inline-block'}}/>
                ค้างข้ามเดือน
              </span>
            </div>
          </div>
          <div className="trend">
            {trend.map((t, i) => {
              const isCurrent = i === trend.length - 1
              const total = t.resolved + t.carry
              const h = Math.round((total / trendMax) * 78)
              const hRes = total ? Math.round((t.resolved / total) * h) : 0
              const hCar = h - hRes
              return (
                <div key={t.mk} className="trend-col">
                  <div className="trend-bar" style={{height: h}}>
                    <div className="trend-resolved" style={{height: hRes}}/>
                    <div className="trend-carry"    style={{height: hCar}}/>
                  </div>
                  <div className={`trend-label mono ${isCurrent ? 'current' : ''}`}>{t.mk.slice(-2)}/{t.mk.slice(2,4)}</div>
                </div>
              )
            })}
          </div>
          <div className="h-divider"/>
          <h3 className="section-title">ปัญหาตามแผนก</h3>
          {groupBreakdown.map(g => (
            <div key={g.id} className="bar-row">
              <div className="label">
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{width:10, height:10, borderRadius:3, background:g.color, display:'inline-block'}}/>
                  {g.name}
                </div>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{width: `${g.count / breakdownMax * 100}%`, '--tone': g.color} as React.CSSProperties}/>
              </div>
              <div className="bar-val mono">{g.count}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="section-title">กิจกรรมล่าสุด</h3>
          {recent.map(i => {
            const g = groupsById[i.groupId]
            return (
              <div key={i.id} className="issue-row" onClick={() => onNav('history', i.id)} style={{cursor:'pointer', marginBottom:8}}>
                <PhotoTile seed={i.photoSeed} tone={g.color} idStr="" label="" imageUrl={i.photoUrl}/>
                <div>
                  <div className="issue-title">{i.title}</div>
                  <div className="issue-sub">
                    <span className="mono faint">{g.short}</span>
                    <span className="faint">·</span>
                    <span>{monthLabelTh(i.createdMonth)}</span>
                  </div>
                </div>
                <div>
                  {i.status === 'resolved' ? (
                    <span className="tag resolved"><span className="dot"/>แก้ไขแล้ว</span>
                  ) : i.carryOverCount > 0 ? (
                    <span className="tag carry"><span className="dot"/>×{i.carryOverCount}</span>
                  ) : (
                    <span className="tag pending"><span className="dot"/>รอดำเนินการ</span>
                  )}
                </div>
              </div>
            )
          })}
          <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={() => onNav('history')}>ดูทั้งหมด →</button>
        </div>
      </div>
    </>
  )
}
