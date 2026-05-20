'use client'
// src/components/screens/History.tsx
import { useState } from 'react'
import type { AppState } from '@/types'
import { monthLabel } from '@/lib/utils'
import PhotoTile from '@/components/ui/PhotoTile'

type RouteName = 'dashboard' | 'add' | 'groups' | 'summary' | 'history'

interface HistoryProps {
  state: AppState
  focusId?: string | null
  onNav: (name: RouteName, arg?: string) => void
}

export default function History({ state, focusId, onNav }: HistoryProps) {
  const { issues, groups, currentMonth } = state
  const groupsById = Object.fromEntries(groups.map(g => [g.id, g]))
  const [selectedId, setSelectedId] = useState(focusId || issues[0]?.id || '')

  const issue = issues.find(i => i.id === selectedId) || issues[0]
  if (!issue) return <div style={{padding:24, color:'var(--fg-faint)'}}>ยังไม่มีเคส</div>

  const g = groupsById[issue.groupId]

  // Reconstruct timeline
  type TimelineEvent = { month: string; type: string; label: string; detail: string }
  const events: TimelineEvent[] = []
  events.push({ month: issue.createdMonth, type: 'created', label: 'สร้างเคส', detail: `รายงานโดย ${issue.reporter}` })
  let cm = issue.createdMonth
  for (let i = 0; i < issue.carryOverCount; i++) {
    let [y, m] = cm.split('-').map(Number)
    m += 1; if (m > 12) { m = 1; y += 1 }
    cm = `${y}-${String(m).padStart(2, '0')}`
    events.push({ month: cm, type: 'carry', label: 'Carry over', detail: 'ยกไปเดือนถัดไป' })
  }
  if (issue.status === 'resolved') {
    events.push({ month: issue.resolvedMonth!, type: 'resolved', label: 'Resolved', detail: 'ปิดเคสเรียบร้อย' })
  } else {
    events.push({ month: currentMonth, type: 'carry', label: 'Pending review', detail: 'รอรีวิวรอบปัจจุบัน' })
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:18}}>
      {/* Issue list panel */}
      <div className="card" style={{padding:0, overflow:'hidden', maxHeight:'calc(100vh - 200px)', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'14px 18px', borderBottom:'1px solid var(--line)'}}>
          <h3 className="section-title" style={{margin:0}}>All issues</h3>
          <div className="mono faint" style={{fontSize:11, marginTop:4}}>{issues.length} TOTAL</div>
        </div>
        <div style={{overflowY:'auto', padding:8, flex:1}}>
          {issues.map(i => {
            const ig = groupsById[i.groupId]
            return (
              <div
                key={i.id}
                onClick={() => setSelectedId(i.id)}
                style={{
                  padding:'10px 12px', borderRadius:8, cursor:'pointer',
                  background: i.id === selectedId ? 'var(--bg-soft)' : 'transparent',
                  display:'grid', gridTemplateColumns:'36px 1fr auto', gap:10, alignItems:'center'
                }}
              >
                <div className="photo-tile" style={{'--tone': ig.color, width:36, height:36, borderRadius:6} as React.CSSProperties}>
                  <div className="pt-icon mono" style={{fontSize:7, padding:'2px 4px', borderRadius:2}}>{ig.short.slice(0,3)}</div>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:500, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>{i.title}</div>
                  <div className="mono faint" style={{fontSize:10}}>{i.id.toUpperCase()} · {monthLabel(i.createdMonth)}</div>
                </div>
                <div>
                  {i.status === 'resolved'
                    ? <span style={{width:8, height:8, borderRadius:99, background:'var(--acc-resolved)', display:'inline-block'}}/>
                    : i.carryOverCount > 0
                      ? <span className="mono" style={{fontSize:10, color:'var(--acc-carry)'}}>×{i.carryOverCount}</span>
                      : <span style={{width:8, height:8, borderRadius:99, background:'var(--line-strong)', display:'inline-block'}}/>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="card">
        <div className="row between" style={{marginBottom:18}}>
          <div>
            <div className="row tight">
              <span className="tag" style={{'--tone': g.color} as React.CSSProperties}>{g.short}</span>
              {issue.carryOverCount > 0 && <span className="tag carry">CARRIED ×{issue.carryOverCount}</span>}
              {issue.status === 'resolved'
                ? <span className="tag resolved"><span className="dot"/>RESOLVED</span>
                : <span className="tag pending"><span className="dot"/>PENDING</span>
              }
            </div>
            <h2 style={{margin:'10px 0 4px', fontFamily:'var(--font-display)', fontSize:26, fontWeight:600, letterSpacing:'-.01em'}}>
              {issue.title}
            </h2>
            <div className="mono faint" style={{fontSize:11, letterSpacing:'.08em'}}>
              {issue.id.toUpperCase()} · CREATED {monthLabel(issue.createdMonth).toUpperCase()}
            </div>
          </div>
          <button className="btn btn-sm" onClick={() => onNav('groups')}>ดูในกลุ่ม →</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:24}}>
          <div>
            <div style={{aspectRatio:'4/3', borderRadius:14, overflow:'hidden'}}>
              <PhotoTile seed={issue.photoSeed} tone={g.color} idStr={`#${issue.id.toUpperCase()}`} label={`CREATED ${issue.createdMonth}`} imageUrl={issue.photoUrl}/>
            </div>
            <div className="card" style={{marginTop:14, padding:16, background:'var(--bg-soft)', border:'none'}}>
              <div className="mono faint" style={{fontSize:11, letterSpacing:'.12em', textTransform:'uppercase'}}>Description</div>
              <p style={{margin:'6px 0 0', fontSize:14, color:'var(--fg)', lineHeight:1.55}}>{issue.description}</p>
              <div className="h-divider"/>
              <div className="row" style={{gap:24, fontSize:13, color:'var(--fg-soft)'}}>
                <div>
                  <div className="mono faint" style={{fontSize:10, letterSpacing:'.1em', textTransform:'uppercase'}}>Reporter</div>
                  {issue.reporter}
                </div>
                <div>
                  <div className="mono faint" style={{fontSize:10, letterSpacing:'.1em', textTransform:'uppercase'}}>Carry count</div>
                  {issue.carryOverCount}
                </div>
                <div>
                  <div className="mono faint" style={{fontSize:10, letterSpacing:'.1em', textTransform:'uppercase'}}>Last review</div>
                  {monthLabel(issue.lastReviewMonth)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="section-title">Resolution timeline</h3>
            <div className="timeline">
              {events.map((ev, idx) => (
                <div key={idx} className={`timeline-item ${ev.type}`}>
                  <div className="timeline-month">{monthLabel(ev.month)}</div>
                  <div>
                    <div className="timeline-title">{ev.label}</div>
                    <div className="timeline-sub">{ev.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
