'use client'
// src/components/screens/GroupsView.tsx
import { useState } from 'react'
import type { AppState } from '@/types'
import { monthLabel } from '@/lib/utils'
import PhotoTile from '@/components/ui/PhotoTile'

type RouteName = 'dashboard' | 'add' | 'groups' | 'summary' | 'history'

interface GroupsViewProps {
  state: AppState
  onNav: (name: RouteName, arg?: string) => void
}

export default function GroupsView({ state, onNav }: GroupsViewProps) {
  const { groups, issues } = state
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <>
      <div className="groups-grid">
        {groups.map(g => {
          const items = issues.filter(i => i.groupId === g.id)
          const open     = items.filter(i => i.status === 'pending').length
          const resolved = items.filter(i => i.status === 'resolved').length
          const carry    = items.filter(i => i.carryOverCount > 0 && i.status === 'pending').length
          return (
            <div
              key={g.id}
              className="group-card"
              onClick={() => setActiveId(activeId === g.id ? null : g.id)}
            >
              <div className="group-header" style={{background: g.color}}/>
              <div className="group-body">
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <span style={{width:10, height:10, borderRadius:3, background:g.color, display:'inline-block'}}/>
                  <span className="mono faint" style={{fontSize:10, letterSpacing:'.12em'}}>{g.short}</span>
                </div>
                <div className="group-name">{g.name}</div>
                <div className="group-desc">{g.description}</div>
                <div className="group-stats">
                  <div>
                    <div className="group-stat-num">{open}</div>
                    <div>Open</div>
                  </div>
                  <div>
                    <div className="group-stat-num" style={{color:'var(--acc-carry)'}}>{carry}</div>
                    <div>Carry</div>
                  </div>
                  <div>
                    <div className="group-stat-num" style={{color:'var(--acc-resolved)'}}>{resolved}</div>
                    <div>Done</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{marginTop:24}}>
        <div className="row between" style={{marginBottom:14}}>
          <h3 className="section-title" style={{margin:0}}>
            {activeId
              ? `Issues · ${groups.find(g => g.id === activeId)?.name}`
              : 'All issues — ทุกกลุ่ม'
            }
          </h3>
          <div className="chips">
            <button className={`chip ${!activeId ? 'is-active' : ''}`} onClick={() => setActiveId(null)}>ALL</button>
            {groups.map(g => (
              <button
                key={g.id}
                className={`chip ${activeId === g.id ? 'is-active' : ''}`}
                onClick={() => setActiveId(g.id)}
              >
                <span className="swatch" style={{background: g.color, width:8, height:8, borderRadius:'99px', display:'inline-block'}}/>
                {g.short}
              </button>
            ))}
          </div>
        </div>
        {(activeId ? issues.filter(i => i.groupId === activeId) : issues).map(i => {
          const g = groups.find(x => x.id === i.groupId)!
          return (
            <div key={i.id} className="issue-row" onClick={() => onNav('history', i.id)} style={{cursor:'pointer'}}>
              <PhotoTile seed={i.photoSeed} tone={g.color} imageUrl={i.photoUrl}/>
              <div>
                <div className="issue-title">{i.title}</div>
                <div className="issue-sub">
                  <span className="mono faint">{g.short}</span>
                  <span className="faint">·</span>
                  <span>created {monthLabel(i.createdMonth)}</span>
                  <span className="faint">·</span>
                  <span>{i.reporter}</span>
                </div>
              </div>
              <div className="row tight">
                {i.carryOverCount > 0 && i.status === 'pending' && (
                  <span className="tag carry"><span className="dot"/>×{i.carryOverCount}</span>
                )}
                {i.status === 'resolved'
                  ? <span className="tag resolved"><span className="dot"/>RESOLVED</span>
                  : <span className="tag pending"><span className="dot"/>PENDING</span>
                }
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
