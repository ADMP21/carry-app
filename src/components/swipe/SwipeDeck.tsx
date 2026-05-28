'use client'
// src/components/swipe/SwipeDeck.tsx
// ── smooth drag: direct DOM + requestAnimationFrame, no React setState during drag ──
import { useState, useRef, useEffect, useCallback } from 'react'
import type { Issue, Group, ReviewResult } from '@/types'
import { monthLabel } from '@/lib/utils'
import PhotoTile from '@/components/ui/PhotoTile'
import WaxSeal from '@/components/ui/WaxSeal'

interface SwipeDeckProps {
  issues: Issue[]
  groupsById: Record<string, Group>
  currentMonth: string
  onComplete: (results: ReviewResult[]) => void
  onClose: () => void
}

export default function SwipeDeck({ issues, groupsById, currentMonth, onComplete, onClose }: SwipeDeckProps) {
  const [queue,    setQueue]    = useState(() => issues.map(i => i.id))
  const [reviewed, setReviewed] = useState<ReviewResult[]>([])
  const total      = issues.length
  const issuesById = Object.fromEntries(issues.map(i => [i.id, i]))
  const topId      = queue[0]
  const top        = topId ? issuesById[topId] : null

  // ── DOM refs — no React state during drag ──────────────────────────────
  const cardRef   = useRef<HTMLDivElement>(null)   // top card element
  const sealLRef  = useRef<HTMLDivElement>(null)   // wrapper div for left stamp
  const sealRRef  = useRef<HTMLDivElement>(null)   // wrapper div for right stamp

  // mutable refs — zero allocations per frame
  const drag       = useRef({ active: false, startX: 0, startY: 0 })
  const raf        = useRef<number | null>(null)
  const lastPos    = useRef({ x: 0, y: 0 })
  const committing = useRef(false)   // true during 320ms exit animation

  // ── Direct DOM: apply position / rotation / stamp opacity ─────────────
  const applyDrag = useCallback((x: number, y: number) => {
    const c = cardRef.current
    if (!c) return
    c.style.transform = `translate(${x}px,${y}px) rotate(${(x * 0.055).toFixed(2)}deg)`
    const lo = Math.min(1, Math.max(0, -x / 90))
    const ro = Math.min(1, Math.max(0,  x / 90))
    if (sealLRef.current) sealLRef.current.style.opacity = lo.toFixed(3)
    if (sealRRef.current) sealRRef.current.style.opacity = ro.toFixed(3)
  }, [])

  // ── Spring-back when released below threshold ──────────────────────────
  const snapBack = useCallback(() => {
    const c = cardRef.current
    if (!c) return
    c.style.transition = 'transform 0.40s cubic-bezier(0.34,1.56,0.64,1)'
    c.style.transform  = ''
    if (sealLRef.current) sealLRef.current.style.opacity = '0'
    if (sealRRef.current) sealRRef.current.style.opacity = '0'
    const id = setTimeout(() => { if (cardRef.current) cardRef.current.style.transition = '' }, 420)
    return () => clearTimeout(id)
  }, [])

  // ── Exit animation (JS-driven so it starts from current drag position) ─
  const commit = useCallback((action: 'resolved' | 'carry') => {
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null }
    drag.current.active = false
    committing.current  = true

    const c   = cardRef.current
    const dir = action === 'resolved' ? -1 : 1
    if (c) {
      // fly off from wherever the card is right now
      c.style.transition = 'transform 0.30s cubic-bezier(0.4,0,1,1), opacity 0.28s ease-in'
      c.style.transform  = `translate(${dir * 160}%,30px) rotate(${dir * 22}deg)`
      c.style.opacity    = '0'
    }
    if (sealLRef.current) sealLRef.current.style.opacity = '0'
    if (sealRRef.current) sealRRef.current.style.opacity = '0'

    setTimeout(() => {
      committing.current = false
      // reset so next card starts clean
      if (c) { c.style.transition = ''; c.style.transform = ''; c.style.opacity = '' }
      setReviewed(r => [...r, { id: topId, action }])
      setQueue(q => q.slice(1))
    }, 320)
  }, [topId])

  const undo = useCallback(() => {
    if (reviewed.length === 0) return
    const last = reviewed[reviewed.length - 1]
    setReviewed(r => r.slice(0, -1))
    setQueue(q => [last.id, ...q])
  }, [reviewed])

  // ── Mouse drag ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return
      lastPos.current = {
        x: e.clientX - drag.current.startX,
        y: e.clientY - drag.current.startY,
      }
      if (!raf.current) {
        raf.current = requestAnimationFrame(() => {
          raf.current = null
          applyDrag(lastPos.current.x, lastPos.current.y)
        })
      }
    }
    const onUp = (e: MouseEvent) => {
      if (!drag.current.active) return
      drag.current.active = false
      if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null }
      const x = e.clientX - drag.current.startX
      if      (x < -120) commit('resolved')
      else if (x >  120) commit('carry')
      else               snapBack()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [commit, snapBack, applyDrag])

  // ── Touch drag ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!drag.current.active) return
      const t = e.touches[0]
      lastPos.current = {
        x: t.clientX - drag.current.startX,
        y: t.clientY - drag.current.startY,
      }
      if (!raf.current) {
        raf.current = requestAnimationFrame(() => {
          raf.current = null
          applyDrag(lastPos.current.x, lastPos.current.y)
        })
      }
    }
    const onEnd = (e: TouchEvent) => {
      if (!drag.current.active) return
      drag.current.active = false
      if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null }
      const t = e.changedTouches[0]
      const x = t.clientX - drag.current.startX
      if      (x < -100) commit('resolved')
      else if (x >  100) commit('carry')
      else               snapBack()
    }
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend',  onEnd)
    return () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onEnd)
    }
  }, [commit, snapBack, applyDrag])

  // ── Keyboard ───────────────────────────────────────────────────────────
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

  // ── Start drag handlers ────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent) => {
    if (committing.current) return
    if (cardRef.current) cardRef.current.style.transition = 'none'
    drag.current = { active: true, startX: e.clientX, startY: e.clientY }
  }
  const startTouchDrag = (e: React.TouchEvent) => {
    if (committing.current) return
    if (cardRef.current) cardRef.current.style.transition = 'none'
    const t = e.touches[0]
    drag.current = { active: true, startX: t.clientX, startY: t.clientY }
  }

  // ── Done screen ────────────────────────────────────────────────────────
  if (!top) {
    const resolvedCount = reviewed.filter(r => r.action === 'resolved').length
    const carryCount    = reviewed.filter(r => r.action === 'carry').length
    return (
      <div className="swipe-stage">
        <div className="swipe-top">
          <div className="swipe-progress mono">
            <span>รีวิว · {monthLabel(currentMonth)}</span>
            <span className="faint">·</span>
            <span className="faint">เสร็จแล้ว</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ ปิด</button>
        </div>
        <div className="swipe-board">
          <div className="swipe-done">
            <div className="mono faint" style={{letterSpacing:'.08em', fontSize:11}}>รีวิวเสร็จสมบูรณ์</div>
            <h2 style={{marginTop:8}}>เคลียร์ครบแล้ว ✓</h2>
            <p>คุณรีวิวปัญหา {total} รายการของเดือน {monthLabel(currentMonth)} เสร็จเรียบร้อย</p>
            <div className="stats">
              <div className="kpi" style={{padding:'16px'}}>
                <div className="kpi-accent" style={{background:'var(--acc-resolved)'}}/>
                <div className="kpi-label">แก้ไขแล้ว</div>
                <div className="kpi-value" style={{fontSize:36}}>{resolvedCount}</div>
              </div>
              <div className="kpi" style={{padding:'16px'}}>
                <div className="kpi-accent" style={{background:'var(--acc-carry)'}}/>
                <div className="kpi-label">ยังไม่ได้แก้ไข</div>
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

  // ── Render deck ────────────────────────────────────────────────────────
  const stack        = queue.slice(0, 4)
  const reviewedCount = reviewed.length

  const segs: string[] = []
  reviewed.forEach(r => segs.push(r.action === 'resolved' ? 'resolved' : 'carry'))
  segs.push('current')
  while (segs.length < total) segs.push('')

  return (
    <div className="swipe-stage">
      <div className="swipe-top">
        <div className="swipe-progress mono">
          <span>รีวิว · {monthLabel(currentMonth)}</span>
          <span className="faint">·</span>
          <span>{reviewedCount + 1} / {total}</span>
          <div className="progress-pill" style={{marginLeft:14}}>
            {segs.map((s, i) => (
              <div key={i} className={`seg ${s === 'current' ? 'current' : s ? 'done ' + s : ''}`}/>
            ))}
          </div>
        </div>
        <div className="row tight">
          <button className="btn btn-ghost btn-sm" onClick={undo} disabled={reviewed.length === 0}>↶ ย้อนกลับ</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ ปิด</button>
        </div>
      </div>

      <div className="swipe-board">
        <div className="swipe-stack">
          {[...stack].reverse().map((id, ridx) => {
            const idx   = stack.length - 1 - ridx
            const issue = issuesById[id]
            const g     = groupsById[issue.groupId]
            const isTop = idx === 0
            const classes = ['swipe-card']
            if (!isTop) classes.push(`behind-${idx}`)
            return (
              <div
                key={id}
                ref={isTop ? cardRef : undefined}
                className={classes.join(' ')}
                onMouseDown={isTop ? startDrag      : undefined}
                onTouchStart={isTop ? startTouchDrag : undefined}
                style={isTop ? {
                  touchAction: 'none',   // ป้องกัน browser scroll interrupt
                  cursor:      'grab',
                  // will-change: transform อยู่ใน CSS แล้ว
                } : {
                  // behind cards: CSS มี will-change:transform แล้ว
                  // pointer-events ปิดเพื่อลด hit-test cost
                  pointerEvents: 'none',
                }}
              >
                {/* Stamps — ทั้งสองมี will-change:opacity = GPU layer แยกตัว
                    เปลี่ยน opacity ไม่ repaint card texture เลย            */}
                {isTop && (
                  <>
                    <div ref={sealLRef} style={{
                      opacity: 0, pointerEvents: 'none',
                      willChange: 'opacity',   // GPU layer แยก — ไม่ repaint card texture
                    }}>
                      <WaxSeal variant="resolved" opacity={1}/>
                    </div>
                    <div ref={sealRRef} style={{
                      opacity: 0, pointerEvents: 'none',
                      willChange: 'opacity',
                    }}>
                      <WaxSeal variant="carry" opacity={1}/>
                    </div>
                  </>
                )}

                <div className="meta-overlay">
                  <span className="tag" style={{'--tone': g.color} as React.CSSProperties}>{g.short}</span>
                  {issue.carryOverCount > 0 && (
                    <span className="tag carry"><span className="dot"/>ค้างมา ×{issue.carryOverCount}</span>
                  )}
                </div>
                <div className="photo">
                  <PhotoTile
                    seed={issue.photoSeed} tone={g.color}
                    idStr={`#${issue.id.toUpperCase()}`}
                    label={`บันทึก ${issue.createdMonth}`}
                    imageUrl={issue.photoUrl}
                  />
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
          <button className="swipe-btn" onClick={undo} title="ย้อนกลับ" disabled={reviewed.length === 0}>
            <span className="icon">↶</span>
          </button>
          <button className="swipe-btn done lg" onClick={() => commit('resolved')} title="แก้ไขแล้ว (ปัดซ้าย)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </button>
          <button className="swipe-btn carry lg" onClick={() => commit('carry')} title="ยังไม่แก้ไข (ปัดขวา)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
          <button className="swipe-btn" onClick={onClose} title="ปิด"><span className="icon">✕</span></button>
        </div>
        <div className="swipe-hints mono">
          <span className="kbd">←</span> แก้ไขแล้ว &nbsp;·&nbsp;
          <span className="kbd">→</span> ยังไม่ได้แก้ไข &nbsp;·&nbsp;
          <span className="kbd">⌘</span><span className="kbd">Z</span> ย้อนกลับ &nbsp;·&nbsp;
          <span className="kbd">Esc</span> ปิด
        </div>
      </div>
    </div>
  )
}
