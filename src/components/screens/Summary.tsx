'use client'
// src/components/screens/Summary.tsx
import { useState } from 'react'
import type { AppState } from '@/types'
import { monthLabel, monthLabelTh, prevMonth } from '@/lib/utils'
import PhotoTile from '@/components/ui/PhotoTile'

type RouteName = 'dashboard' | 'add' | 'groups' | 'summary' | 'history'

interface SummaryProps {
  state: AppState
  onNav: (name: RouteName, arg?: string) => void
}

function Donut({ resolved, carry, size = 160 }: { resolved: number; carry: number; size?: number }) {
  const total = resolved + carry || 1
  const r1 = (resolved / total) * 360
  const r2 = r1 + (carry / total) * 360
  const bg = `conic-gradient(var(--acc-resolved) 0 ${r1}deg, var(--acc-carry) ${r1}deg ${r2}deg, var(--bg-soft) ${r2}deg 360deg)`
  return (
    <div style={{width:size, height:size, background:bg, borderRadius:'50%', position:'relative', flexShrink:0}}>
      <div style={{position:'absolute', inset:18, background:'var(--bg-elev)', borderRadius:'50%', border:'1px solid var(--line)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <div style={{fontSize:20, fontWeight:700, fontFamily:'var(--font-display)'}}>{Math.round(resolved / total * 100)}%</div>
        <div style={{fontSize:10, color:'var(--fg-faint)', fontFamily:'var(--font-mono)'}}>resolved</div>
      </div>
    </div>
  )
}

export default function Summary({ state, onNav }: SummaryProps) {
  const { issues, groups, currentMonth } = state
  const [pickedMonth, setPickedMonth] = useState(currentMonth)

  const monthOptions: string[] = []
  let m = currentMonth
  for (let i = 0; i < 6; i++) { monthOptions.push(m); m = prevMonth(m) }

  const groupsById = Object.fromEntries(groups.map(g => [g.id, g]))
  const resolved   = issues.filter(i => i.status === 'resolved' && i.resolvedMonth === pickedMonth)
  const carried    = issues.filter(i => i.status === 'pending'  && i.lastReviewMonth === pickedMonth)
  const newly      = issues.filter(i => i.createdMonth === pickedMonth)
  const totalReviewed = resolved.length + carried.length

  return (
    <>
      <div className="row between" style={{marginBottom:18}}>
        <div className="chips">
          {[...monthOptions].reverse().map(mk => (
            <button
              key={mk}
              className={`chip ${mk === pickedMonth ? 'is-active' : ''}`}
              onClick={() => setPickedMonth(mk)}
            >{monthLabel(mk)}</button>
          ))}
        </div>
        <button className="btn btn-sm">Export PDF ↓</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-accent" style={{background:'var(--fg)'}}/>
          <div className="kpi-label">Reviewed</div>
          <div className="kpi-value">{totalReviewed}</div>
          <div className="kpi-sub">รวมเคสที่ถูกรีวิวเดือนนี้</div>
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{background:'var(--acc-resolved)'}}/>
          <div className="kpi-label">Resolved</div>
          <div className="kpi-value" style={{color:'var(--acc-resolved)'}}>{resolved.length}</div>
          <div className="kpi-sub">ปิดเคสสำเร็จ</div>
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{background:'var(--acc-carry)'}}/>
          <div className="kpi-label">Carry over</div>
          <div className="kpi-value" style={{color:'var(--acc-carry)'}}>{carried.length}</div>
          <div className="kpi-sub">ยกไปเดือนถัดไป</div>
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{background:'var(--acc-info)'}}/>
          <div className="kpi-label">Newly added</div>
          <div className="kpi-value">{newly.length}</div>
          <div className="kpi-sub">รายงานใหม่เดือนนี้</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginTop:18}}>
        <div className="card">
          <h3 className="section-title">Completion rate</h3>
          <div style={{display:'flex', alignItems:'center', gap:28, padding:'10px 6px'}}>
            <Donut resolved={resolved.length} carry={carried.length}/>
            <div style={{flex:1}}>
              <div style={{marginBottom:14}}>
                <div className="mono faint" style={{fontSize:11, letterSpacing:'.12em'}}>OVERVIEW</div>
                <div style={{fontSize:14, lineHeight:1.5, marginTop:6}}>
                  เดือน <strong>{monthLabelTh(pickedMonth)}</strong> รีวิวไปทั้งหมด {totalReviewed} เคส,
                  ปิดสำเร็จ <strong style={{color:'var(--acc-resolved)'}}>{resolved.length}</strong> เคส
                  {carried.length > 0 && <> ยกไปเดือนถัดไป <strong style={{color:'var(--acc-carry)'}}>{carried.length}</strong> เคส</>}
                </div>
              </div>
              <div className="bar-row">
                <div className="label">Resolved</div>
                <div className="bar-track"><div className="bar-fill" style={{width:`${totalReviewed ? resolved.length / totalReviewed * 100 : 0}%`, '--tone':'var(--acc-resolved)'} as React.CSSProperties}/></div>
                <div className="bar-val mono">{resolved.length}</div>
              </div>
              <div className="bar-row">
                <div className="label">Carry over</div>
                <div className="bar-track"><div className="bar-fill" style={{width:`${totalReviewed ? carried.length / totalReviewed * 100 : 0}%`, '--tone':'var(--acc-carry)'} as React.CSSProperties}/></div>
                <div className="bar-val mono">{carried.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Group breakdown</h3>
          {groups.map(g => {
            const r = resolved.filter(i => i.groupId === g.id).length
            const c = carried.filter(i => i.groupId === g.id).length
            const t = r + c
            const resolvedPct = t ? Math.round((r / t) * 100) : 0
            const unresolvedPct = t ? 100 - resolvedPct : 0
            return (
              <div key={g.id} className="bar-row" style={{gridTemplateColumns:'140px 1fr 130px'}}>
                <div className="label" style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{width:10, height:10, borderRadius:3, background:g.color, display:'inline-block', flexShrink:0}}/>
                  <span style={{fontSize:13}}>{g.name}</span>
                </div>
                <div className="bar-track" style={{display:'flex'}}>
                  <div style={{height:'100%', width: t ? `${(r/Math.max(1,t))*100}%` : 0, background:'var(--acc-resolved)'}}/>
                  <div style={{height:'100%', width: t ? `${(c/Math.max(1,t))*100}%` : 0, background:'var(--acc-carry)'}}/>
                </div>
                <div className="bar-val mono" style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, lineHeight:1.2}}>
                  <span style={{fontSize:12}}>{r} / {t}</span>
                  {t > 0 && (
                    <span style={{fontSize:10, letterSpacing:'.06em'}}>
                      <span style={{color:'var(--acc-resolved)'}}>{resolvedPct}%</span>
                      <span style={{color:'var(--fg-faint)'}}> · </span>
                      <span style={{color:'var(--acc-carry)'}}>{unresolvedPct}%</span>
                    </span>
                  )}
                  {t === 0 && <span style={{fontSize:10, color:'var(--fg-faint)'}}>—</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card" style={{marginTop:18}}>
        <h3 className="section-title">Resolved this month · {monthLabel(pickedMonth)}</h3>
        {resolved.length === 0 && <div style={{fontSize:13, color:'var(--fg-faint)'}}>— ยังไม่มีเคสปิดในเดือนนี้</div>}
        {resolved.map(i => {
          const g = groupsById[i.groupId]
          return (
            <div key={i.id} className="issue-row" onClick={() => onNav('history', i.id)} style={{cursor:'pointer'}}>
              <PhotoTile seed={i.photoSeed} tone={g.color} imageUrl={i.photoUrl}/>
              <div>
                <div className="issue-title">{i.title}</div>
                <div className="issue-sub"><span className="mono faint">{g.short}</span> · ปิดเคส {monthLabelTh(i.resolvedMonth)}</div>
              </div>
              <span className="tag resolved"><span className="dot"/>RESOLVED</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
