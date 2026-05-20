'use client'
// src/components/layout/Sidebar.tsx
import type { AppState } from '@/types'
import { monthLabel } from '@/lib/utils'

type RouteName = 'dashboard' | 'add' | 'groups' | 'summary' | 'history'

interface SidebarProps {
  state: AppState
  route: RouteName
  onNav: (name: RouteName) => void
  onStartReview: () => void
}

function NavItem({ icon, label, count, active, onClick }: {
  icon: string; label: string; count?: number; active: boolean; onClick: () => void
}) {
  return (
    <button className={`nav-item ${active ? 'is-active' : ''}`} onClick={onClick}>
      <span className="mono" style={{ width: 18, textAlign: 'center', opacity: .8 }}>{icon}</span>
      <span>{label}</span>
      {count != null && <span className="nav-count mono">{count}</span>}
    </button>
  )
}

export default function Sidebar({ state, route, onNav, onStartReview }: SidebarProps) {
  const openCount = state.issues.filter(i => i.status === 'pending').length

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">C</span>
        <div>
          <div className="brand-name">Carry</div>
          <div className="brand-sub">monthly issue review</div>
        </div>
      </div>

      <div>
        <div className="nav-group-label">workspace</div>
        <nav className="nav">
          <NavItem icon="◇" label="Dashboard"  active={route === 'dashboard'} onClick={() => onNav('dashboard')}/>
          <NavItem icon="+" label="Add issue"  active={route === 'add'}       onClick={() => onNav('add')}/>
          <NavItem icon="▤" label="Groups"     count={state.groups.length}    active={route === 'groups'}    onClick={() => onNav('groups')}/>
        </nav>
      </div>

      <div>
        <div className="nav-group-label">reports</div>
        <nav className="nav">
          <NavItem icon="∑" label="Monthly summary" active={route === 'summary'} onClick={() => onNav('summary')}/>
          <NavItem icon="⟳" label="Issue history" count={state.issues.length}   active={route === 'history'} onClick={() => onNav('history')}/>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="label">current cycle</div>
        <div className="month">{monthLabel(state.currentMonth)}</div>
        <div className="meta">{openCount} open · ready to review</div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
          onClick={onStartReview}
          disabled={openCount === 0}
        >
          Start review →
        </button>
      </div>
    </aside>
  )
}
