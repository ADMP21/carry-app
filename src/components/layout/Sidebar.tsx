'use client'
// src/components/layout/Sidebar.tsx
import type { AppState } from '@/types'
import { monthLabel } from '@/lib/utils'

type RouteName = 'dashboard' | 'add' | 'add-accident' | 'groups' | 'summary' | 'history' | 'accident-stats'

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="คปอ CM" className="brand-logo" />
        <div className="brand-sub" style={{marginTop:2}}>ระบบติดตามปัญหา</div>
      </div>

      <div>
        <div className="nav-group-label">หน้าหลัก</div>
        <nav className="nav">
          <NavItem icon="◇" label="แผงควบคุม"       active={route === 'dashboard'} onClick={() => onNav('dashboard')}/>
          <NavItem icon="+" label="เพิ่มปัญหาใหม่"    active={route === 'add'}         onClick={() => onNav('add')}/>
          <NavItem icon="⚠" label="บันทึกอุบัติเหตุ" active={route === 'add-accident'} onClick={() => onNav('add-accident')}/>
          <NavItem icon="▤" label="แผนก"              count={state.groups.length}    active={route === 'groups'}    onClick={() => onNav('groups')}/>
        </nav>
      </div>

      <div>
        <div className="nav-group-label">รายงาน</div>
        <nav className="nav">
          <NavItem icon="∑" label="สรุปประจำเดือน"   active={route === 'summary'}        onClick={() => onNav('summary')}/>
          <NavItem icon="⟳" label="ประวัติปัญหา"     count={state.issues.length}          active={route === 'history'}        onClick={() => onNav('history')}/>
          <NavItem icon="⚠" label="สถิติอุบัติเหตุ"  count={state.accidentRecords?.length} active={route === 'accident-stats'} onClick={() => onNav('accident-stats')}/>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="label">รอบปัจจุบัน</div>
        <div className="month">{monthLabel(state.currentMonth)}</div>
        <div className="meta">{openCount} รายการ · รอรีวิว</div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
          onClick={onStartReview}
          disabled={openCount === 0}
        >
          เริ่มรีวิว →
        </button>
      </div>
    </aside>
  )
}
