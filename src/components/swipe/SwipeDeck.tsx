'use client'
// src/components/swipe/SwipeDeck.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import type { Issue, Group, ReviewResult } from '@/types'
import { monthLabel } from '@/lib/utils'
import PhotoTile from '@/components/ui/PhotoTile'

interface SwipeDeckProps {
  issues: Issue[]
  groupsById: Record<string, Group>
  currentMonth: string
  onComplete: (results: ReviewResult[]) => void
  onClose: () => void
}

export default function SwipeDeck({ issues, groupsById, currentMonth, onComplete, onClose }: SwipeDeckProps) {
  const [queue, setQueue] = useState(() => issues.map(i => i.id))
  const [reviewed, setReviewed] = useState<ReviewResult[]>([])
  const total = issues.length
  const issuesById = Object.fromEntries(issues.map(i => [i.id, i]))

  const topId = queue[0]
  const top = topId ? issuesById[topId] : null

  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)
  const startRef = useRef({ x: 0, y: 0 })

  const commit = useCallback((action: 'resolved' | 'carry') => {
    setExitDir(action === 'resolved' ? 'left' : 'right')
    setTimeout(() => {
      setReviewed(r => [...r, { id: topId, action }])
      setQueue(q => q.slice(1))
      setExitDir(null)
      setDrag({ x: 0, y: 0, active: false })
    }, 320)
  }, [topId])

  const undo = useCallback(() => {
    if (reviewed.length === 0) return
    const last = reviewed[reviewed.length - 1]
    setReviewed(r => r.slice(0, -1))
    setQueue(q => [last.id, ...q])
  }, [reviewed])

  // Mouse drag
  useEffect(() => {
    if (!drag.active) return
    const onMove = (e: MouseEvent) => {
      setDrag(d => ({ ...d, x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y }))
    }
    const onUp = () => {
      setDrag(d => {
        const threshold = 130
        if (d.x < -threshold) { commit('resolved'); return d }
        if (d.x > threshold)  { commit('carry');    return d }
        return { x: 0, y: 0, active: false }
      })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [drag.active, commit])

  // Touch drag
  useEffect(() => {
    if (!drag.active) return
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0]
      setDrag(d => ({ ...d, x: t.clientX - startRef.current.x, y: t.clientY - startRef.current.y }))
    }
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - startRef.current.x
      const threshold = 110
      if (dx < -threshold) { commit('resolved') }
      else if (dx > threshold) { commit('carry') }
      else { setDrag({ x: 0, y: 0, active: false }) }
    }
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
  }, [drag.active, commit])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!top) return
      if (e.key === 'ArrowLeft')  { e.preventDefault(); commit('resolved') }
      if (e.key === 'ArrowRight') { e.preventDefault(); commit('carry') }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); undo() }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [commit, undo, top, onClose])

  const startDrag = (e: React.MouseEvent) => {
    if (exitDir) return
    startRef.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, y: 0, active: true })
  }

  const startTouchDrag = (e: React.TouchEvent) => {
    if (exitDir) return
    const t = e.touches[0]
    startRef.current = { x: t.clientX, y: t.clientY }
    setDrag({ x: 0, y: 0, active: true })
  }

  // Done screen
  if (!top) {
    const resolvedCount = reviewed.filter(r => r.action === 'resolved').length
    const carryCount    = reviewed.filter(r => r.action === 'carry').length
    return (
      <div className="swipe-stage">
        <div className="swipe-top">
          <div className="swipe-progress mono">
            <span>REVIEW · {monthLabel(currentMonth)}</span>
            <span className="faint">·</span>
            <span className="faint">complete</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
        </div>
        <div className="swipe-board">
          <div className="swipe-done">
            <div className="mono faint" style={{letterSpacing:'.14em', textTransform:'uppercase', fontSize:11}}>Review complete</div>
            <h2 style={{marginTop:8}}>เคลียร์ครบแล้ว ✓</h2>
            <p>คุณรีวิวปัญหา {total} รายการของเดือน {monthLabel(currentMonth)} เสร็จเรียบร้อย</p>
            <div className="stats">
              <div className="kpi" style={{padding:'16px'}}>
                <div className="kpi-accent" style={{background:'var(--acc-resolved)'}}/>
                <div className="kpi-label">Resolved</div>
                <div className="kpi-value" style={{fontSize:36}}>{resolvedCount}</div>
              </div>
              <div className="kpi" style={{padding:'16px'}}>
                <div className="kpi-accent" style={{background:'var(--acc-carry)'}}/>
                <div className="kpi-label">Carry over</div>
                <div className="kpi-value" style={{fontSize:36}}>{carryCount}</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => onComplete(reviewed)}>
              บันทึกผลและกลับสู่ Dashboard →
            </button>
          </div>
        </div>
        <div className="swipe-bottom"/>
      </div>
    )
  }

  const stack = queue.slice(0, 4)
  const reviewedCount = reviewed.length
  const rotate = drag.x * 0.06
  const stampLeftOp  = Math.min(1, Math.max(0, -drag.x / 100))
  const stampRightOp = Math.min(1, Math.max(0,  drag.x / 100))
  const topStyle = exitDir
    ? {}
    : { transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)` }

  const segs: string[] = []
  reviewed.forEach(r => segs.push(r.action === 'resolved' ? 'resolved' : 'carry'))
  segs.push('current')
  while (segs.length < total) segs.push('')

  return (
    <div className="swipe-stage">
      <div className="swipe-top">
        <div className="swipe-progress mono">
          <span>REVIEW · {monthLabel(currentMonth)}</span>
          <span className="faint">·</span>
          <span>{reviewedCount + 1} / {total}</span>
          <div className="progress-pill" style={{marginLeft:14}}>
            {segs.map((s, i) => (
              <div key={i} className={`seg ${s === 'current' ? 'current' : s ? 'done ' + s : ''}`}/>
            ))}
          </div>
        </div>
        <div className="row tight">
          <button className="btn btn-ghost btn-sm" onClick={undo} disabled={reviewed.length === 0}>↶ Undo</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
        </div>
      </div>

      <div className="swipe-board">
        <div className="swipe-stack">
          {[...stack].reverse().map((id, ridx) => {
            const idx = stack.length - 1 - ridx
            const issue = issuesById[id]
            const g = groupsById[issue.groupId]
            const isTop = idx === 0
            const classes = ['swipe-card']
            if (!isTop) classes.push(`behind-${idx}`)
            if (isTop && exitDir === 'left')  classes.push('gone-left')
            if (isTop && exitDir === 'right') classes.push('gone-right')
            if (isTop && drag.active) classes.push('dragging')
            return (
              <div
                key={id}
                className={classes.join(' ')}
                style={isTop ? topStyle : undefined}
                onMouseDown={isTop ? startDrag : undefined}
                onTouchStart={isTop ? startTouchDrag : undefined}
              >
                {isTop && (
                  <>
                    <div className="stamp left"  style={{opacity: stampLeftOp}}>DONE</div>
                    <div className="stamp right" style={{opacity: stampRightOp}}>CARRY</div>
                  </>
                )}
                <div className="meta-overlay">
                  <span className="tag" style={{'--tone': g.color} as React.CSSProperties}>{g.short}</span>
                  {issue.carryOverCount > 0 && (
                    <span className="tag carry"><span className="dot"/>CARRIED ×{issue.carryOverCount}</span>
                  )}
                </div>
                <div className="photo">
                  <PhotoTile seed={issue.photoSeed} tone={g.color} idStr={`#${issue.id.toUpperCase()}`} label={`CREATED ${issue.createdMonth}`} imageUrl={issue.photoUrl}/>
                </div>
                <div className="body">
                  <h2>{issue.title}</h2>
                  <p>{issue.description}</p>
                  <div className="footer">
                    <span>{g.name}</span>
                    <span>· {issue.reporter}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="swipe-bottom">
        <div className="swipe-actions">
          <button className="swipe-btn" onClick={undo} title="Undo" disabled={reviewed.length === 0}><span className="icon">↶</span></button>
          <button className="swipe-btn done lg" onClick={() => commit('resolved')} title="Done (swipe left)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </button>
          <button className="swipe-btn carry lg" onClick={() => commit('carry')} title="Carry over (swipe right)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
          <button className="swipe-btn" onClick={onClose} title="Close"><span className="icon">✕</span></button>
        </div>
        <div className="swipe-hints mono">
          <span className="kbd">←</span> Done &nbsp;·&nbsp;
          <span className="kbd">→</span> Carry &nbsp;·&nbsp;
          <span className="kbd">⌘</span><span className="kbd">Z</span> Undo &nbsp;·&nbsp;
          <span className="kbd">Esc</span> Close
        </div>
      </div>
    </div>
  )
}
