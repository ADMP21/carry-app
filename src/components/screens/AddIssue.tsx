'use client'
// src/components/screens/AddIssue.tsx
import { useState, useRef } from 'react'
import type { AppState, AppAction } from '@/types'
import { monthLabel } from '@/lib/utils'

type RouteName = 'dashboard' | 'add' | 'add-accident' | 'groups' | 'summary' | 'history' | 'accident-stats'

interface AddIssueProps {
  state:         AppState
  dispatch:      (action: AppAction) => void
  onNav:         (name: RouteName) => void
  hasSupabase?:  boolean
}

export default function AddIssue({ state, dispatch, onNav, hasSupabase }: AddIssueProps) {
  const { groups } = state
  const [title,     setTitle]     = useState('')
  const [desc,      setDesc]      = useState('')
  const [groupId,   setGroupId]   = useState(groups[0]?.id || '')
  const [file,      setFile]      = useState<File | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const canSave = title.trim() && desc.trim() && groupId && (file || preview)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 8 * 1024 * 1024) { setError('ไฟล์ใหญ่เกิน 8 MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  const save = async () => {
    if (!canSave) return
    setUploading(true)
    setError(null)
    try {
      let photoUrl: string | undefined
      if (file && hasSupabase) {
        const { uploadIssuePhoto } = await import('@/lib/supabase/queries')
        photoUrl = await uploadIssuePhoto(file)
      }
      if (hasSupabase && photoUrl) {
        const { createIssue } = await import('@/lib/supabase/queries')
        const newIssue = await createIssue({
          groupId, title, description: desc,
          photoUrl, createdMonth: state.currentMonth,
        })
        dispatch({ type: 'hydrate', groups: state.groups, issues: [newIssue, ...state.issues] } as never)
      } else {
        dispatch({
          type: 'add', title, desc, groupId,
          photoSeed: file?.name.toUpperCase() ?? 'OFFICE PHOTO',
          photoUrl,
        } as never)
      }
      onNav('dashboard')
    } catch (err) {
      setError('บันทึกไม่สำเร็จ: ' + (err instanceof Error ? err.message : 'unknown error'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="add-grid">
      {/* Left: photo upload */}
      <div>
        <div
          className={`dropzone ${preview ? 'has-image' : ''}`}
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          ) : (
            <>
              <div className="dropzone-icon">↑</div>
              <div className="dropzone-text">ลากรูปมาวาง หรือคลิกเพื่ออัปโหลด</div>
              <div className="dropzone-sub mono">JPG / PNG · UP TO 8 MB</div>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display:'none' }}
          onChange={onFileChange}
        />
        {file && (
          <div className="mono faint" style={{ fontSize:11, marginTop:8 }}>
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </div>
        )}
        <div className="mono faint" style={{ fontSize:11, marginTop:10, letterSpacing:'.06em' }}>
          * อย่างน้อย 1 ภาพ ตาม SPEC §10
        </div>
        {error && (
          <div style={{ marginTop:8, fontSize:12, color:'var(--acc-critical)', fontFamily:'var(--font-mono)' }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Right: form fields */}
      <div>
        <div className="field">
          <label>หัวข้อปัญหา</label>
          <input type="text" placeholder="เช่น ปรินเตอร์ชั้น 3 หมึกหมด" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>รายละเอียด</label>
          <textarea placeholder="อธิบายอาการ ตำแหน่ง และผลกระทบ" value={desc} onChange={e => setDesc(e.target.value)} />
          <div className="hint">{desc.length} / 280 ตัวอักษร</div>
        </div>
        <div className="field">
          <label>กลุ่ม / หมวดหมู่</label>
          <div className="group-picker">
            {groups.map(g => (
              <button key={g.id} className={`group-option ${g.id === groupId ? 'is-selected' : ''}`} onClick={() => setGroupId(g.id)}>
                <span className="swatch" style={{ background: g.color }} />
                <span className="name">{g.name}</span>
                <span className="mono faint" style={{ marginLeft:'auto', fontSize:10 }}>{g.short}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="row between" style={{ marginTop:20 }}>
          <span className="mono faint" style={{ fontSize:11 }}>
            * บันทึกเป็นเดือน {monthLabel(state.currentMonth).toUpperCase()}
            {!hasSupabase && ' · LOCAL ONLY'}
          </span>
          <div className="row tight">
            <button className="btn btn-ghost" onClick={() => onNav('dashboard')}>ยกเลิก</button>
            <button
              className="btn btn-primary"
              disabled={!canSave || uploading}
              onClick={save}
              style={{ opacity: canSave && !uploading ? 1 : .4 }}
            >
              {uploading ? 'กำลังบันทึก…' : 'บันทึก →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
