'use client'
// src/components/AppShell.tsx
import { useReducer, useMemo, useState, useEffect, useCallback } from 'react'
import { reducer } from '@/lib/reducer'
import { GROUPS, ISSUES, CURRENT_MONTH } from '@/lib/seed'
import { ACCIDENT_RECORDS } from '@/lib/seedAccidents'
import { monthLabel } from '@/lib/utils'
import Sidebar from '@/components/layout/Sidebar'
import SwipeDeck from '@/components/swipe/SwipeDeck'
import Dashboard from '@/components/screens/Dashboard'
import AddIssue from '@/components/screens/AddIssue'
import GroupsView from '@/components/screens/GroupsView'
import Summary from '@/components/screens/Summary'
import History from '@/components/screens/History'
import AccidentStats from '@/components/screens/AccidentStats'
import AddAccident from '@/components/screens/AddAccident'
import type { ReviewResult } from '@/types'

type RouteName = 'dashboard' | 'add' | 'add-accident' | 'groups' | 'summary' | 'history' | 'accident-stats'
interface Route { name: RouteName; arg?: string }

const ROUTE_TITLES: Record<RouteName, { th: string; sub: (month: string, count?: number) => string }> = {
  dashboard:        { th: 'ภาพรวมประจำเดือน',   sub: (m) => `แผงควบคุม · ${monthLabel(m).toUpperCase()}` },
  add:              { th: 'เพิ่มปัญหาใหม่',       sub: (m) => `เพิ่มปัญหา · ${monthLabel(m).toUpperCase()}` },
  'add-accident':   { th: 'บันทึกอุบัติเหตุ',     sub: (m) => `บันทึก · ${monthLabel(m).toUpperCase()}` },
  groups:           { th: 'ปัญหาตามแผนก',          sub: (_, c) => `แผนก · ${c} แผนก` },
  summary:          { th: 'สรุปประจำเดือน',        sub: (m) => `สรุป · ${monthLabel(m).toUpperCase()}` },
  history:          { th: 'ประวัติปัญหา',           sub: () => 'ประวัติ · ไทม์ไลน์' },
  'accident-stats': { th: 'สถิติประสบอันตราย',     sub: () => 'สถิติ · อุบัติเหตุ' },
}

const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AppShell() {
  const [state, dispatch] = useReducer(reducer, {
    issues: ISSUES.map(i => ({ ...i })),
    groups: GROUPS.map(g => ({ ...g })),
    currentMonth: CURRENT_MONTH,
    accidentRecords: ACCIDENT_RECORDS.map(r => ({ ...r })),
  })

  const [route, setRoute] = useState<Route>({ name: 'dashboard' })
  const [reviewing, setReviewing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load from Supabase when env vars are set
  useEffect(() => {
    if (!hasSupabase) return
    setLoading(true)
    let cancelled = false

    import('@/lib/supabase/queries').then(async ({ fetchGroups, fetchIssues }) => {
      try {
        const [groups, issues] = await Promise.all([fetchGroups(), fetchIssues()])
        if (!cancelled) {
          dispatch({ type: 'hydrate', groups, issues } as never)
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Supabase load failed, using seed data:', err)
          setDbError('ไม่สามารถเชื่อมต่อ Supabase — ใช้ข้อมูลตัวอย่างแทน')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [])

  const nav = (name: RouteName, arg?: string) => setRoute({ name, arg })

  const reviewQueue = useMemo(() => state.issues.filter(i => i.status === 'pending'), [state.issues])
  const groupsById  = useMemo(() => Object.fromEntries(state.groups.map(g => [g.id, g])), [state.groups])
  const openCount   = reviewQueue.length

  const title    = ROUTE_TITLES[route.name]
  const subLabel = route.name === 'groups'
    ? title.sub(state.currentMonth, state.groups.length)
    : title.sub(state.currentMonth)

  const onReviewComplete = useCallback(async (results: ReviewResult[]) => {
    dispatch({ type: 'review_commit', results })
    setReviewing(false)
    if (hasSupabase) {
      setIsSaving(true)
      try {
        const { commitReview } = await import('@/lib/supabase/queries')
        await commitReview({ results, monthYear: state.currentMonth })
      } catch (err) {
        console.error('Save failed:', err)
        setDbError('บันทึกลง Supabase ไม่สำเร็จ — ข้อมูลอยู่ในหน่วยความจำเท่านั้น')
      } finally {
        setIsSaving(false)
      }
    }
  }, [state.currentMonth])

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, background:'var(--bg)' }}>
        <div style={{ width:36, height:36, background:'var(--fg)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--bg)', fontFamily:'var(--font-mono)', fontWeight:600, fontSize:18 }}>C</div>
        <div className="mono faint" style={{ fontSize:11, letterSpacing:'.14em', textTransform:'uppercase' }}>Loading…</div>
      </div>
    )
  }

  return (
    <>
      {dbError && (
        <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, background:'var(--acc-carry)', color:'#fff', padding:'8px 20px', fontSize:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>⚠ {dbError}</span>
          <button onClick={() => setDbError(null)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:14 }}>✕</button>
        </div>
      )}
      {isSaving && (
        <div style={{ position:'fixed', bottom:20, right:20, zIndex:200, background:'var(--fg)', color:'var(--bg)', padding:'8px 16px', borderRadius:8, fontSize:12, fontFamily:'var(--font-mono)' }}>
          Saving…
        </div>
      )}
      <div className="app">
        <Sidebar state={state} route={route.name} onNav={nav} onStartReview={() => setReviewing(true)} />
        <main className="main">
          <header className="topbar">
            <div>
              <div className="topbar-sub mono">{subLabel}</div>
              <h1>{title.th}</h1>
            </div>
            <div className="topbar-actions">
              {route.name !== 'add' && <button className="btn btn-sm" onClick={() => nav('add')}>+ เพิ่มปัญหา</button>}
              {route.name !== 'dashboard' && <button className="btn btn-sm btn-ghost" onClick={() => nav('dashboard')}>← แผงควบคุม</button>}
              <button className="btn btn-primary btn-sm" onClick={() => setReviewing(true)} disabled={openCount === 0}>
                รีวิว {openCount > 0 && <span className="mono" style={{ opacity:.7, marginLeft:4 }}>{openCount}</span>}
              </button>
            </div>
          </header>
          <div className="content">
            {route.name === 'dashboard'       && <Dashboard     state={state} onStartReview={() => setReviewing(true)} onNav={nav} />}
            {route.name === 'add'             && <AddIssue      state={state} dispatch={dispatch} onNav={nav} hasSupabase={hasSupabase} />}
            {route.name === 'add-accident'    && <AddAccident   dispatch={dispatch} onNav={nav} />}
            {route.name === 'groups'          && <GroupsView    state={state} onNav={nav} />}
            {route.name === 'summary'         && <Summary       state={state} onNav={nav} />}
            {route.name === 'history'         && <History       state={state} focusId={route.arg} onNav={nav} />}
            {route.name === 'accident-stats'  && <AccidentStats state={state} />}
          </div>
        </main>
      </div>
      {reviewing && reviewQueue.length > 0 && (
        <SwipeDeck issues={reviewQueue} groupsById={groupsById} currentMonth={state.currentMonth} onComplete={onReviewComplete} onClose={() => setReviewing(false)} />
      )}
    </>
  )
}
