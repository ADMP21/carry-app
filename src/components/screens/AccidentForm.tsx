'use client'
// src/components/screens/AccidentForm.tsx
import { useState } from 'react'
import type { AppAction, InjuryLevel, AccidentCause } from '@/types'

const DEPARTMENTS = ['RM', 'PR', 'PA', 'QC', 'MC', 'HR', 'ST', 'CD', 'OE']

const INJURY_LEVELS: InjuryLevel[] = [
  'ตาย',
  'ทุพพลภาพ',
  'สูญเสียอวัยวะบางส่วน',
  'หยุดงานเกิน 3 วัน',
  'หยุดงานไม่เกิน 3 วัน',
  'ไม่หยุดงาน',
]

const CAUSE_AGENTS = [
  'พื้นลื่น/ขรุขระ',
  'เครื่องจักร/อุปกรณ์',
  'วัตถุมีคม',
  'วัสดุ/สิ่งของ',
  'ยานพาหนะ',
  'ของร้อน/ไฟ',
  'สารเคมี',
  'ไฟฟ้า',
  'การยกของหนัก',
  'การเคลื่อนไหวซ้ำซาก',
  'ตกจากที่สูง',
  'วัตถุหล่น/พุ่งมาโดน',
  'สัตว์/แมลง',
  'สภาพแวดล้อม (ร้อน/เย็น)',
  'ฝุ่น/ควัน/ก๊าซ',
  'เครื่องมือมือถือ',
  'อื่นๆ',
]

const INJURY_NATURES = [
  'ล้ม/พลัดตก',
  'ถูกของมีคมบาด/แทง',
  'ถูกของหนีบ/บีบ',
  'ถูกกระแทก/ชน',
  'ถูกของร้อน/ไฟลวก',
  'สัมผัสสารเคมี',
  'สัมผัสไฟฟ้า',
  'ยกของหนัก/บิดตัว',
  'เคล็ด/ขัดยอก',
  'กระดูกหัก',
  'ถลอก/รอยขีดข่วน',
  'ฟกช้ำ/บวม',
  'ตาได้รับบาดเจ็บ',
  'หายใจสูดดมสาร',
  'เสียงดังเกินกำหนด',
  'ความเครียดจากความร้อน/เย็น',
  'ถูกกัด/ต่อย',
  'ถูกยานพาหนะชน',
  'ตกจากที่สูง',
  'ถูกวัตถุหล่นทับ',
  'การเคลื่อนไหวผิดท่า',
  'แผลไหม้',
  'อื่นๆ',
]

const BODY_PARTS = [
  'ศีรษะ/สมอง',
  'ตา',
  'หู',
  'จมูก/ปาก/ฟัน',
  'คอ/ลำคอ',
  'ไหล่/แขน',
  'ข้อศอก',
  'มือ/นิ้วมือ',
  'หน้าอก/ซี่โครง',
  'หลัง/กระดูกสันหลัง',
  'ท้อง/ลำไส้',
  'สะโพก/ต้นขา',
  'เข่า',
  'ข้อเท้า/เท้า',
  'ทั่วร่างกาย/หลายส่วน',
]

interface AccidentFormProps {
  dispatch: (action: AppAction) => void
  onSuccess?: () => void
}

const EMPTY = {
  name: '',
  department: DEPARTMENTS[0],
  accidentDate: '',
  daysOff: '',
  injuryLevel: 'หยุดงานเกิน 3 วัน' as InjuryLevel,
  causeAgent: '',
  injuryNature: '',
  bodyPart: '',
  cause: 'Unsafe Act.' as AccidentCause,
  expenses: '',
  useCompFund: false,
  details: '',
}

export default function AccidentForm({ dispatch, onSuccess }: AccidentFormProps) {
  const [f, setF] = useState(EMPTY)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof typeof EMPTY>(key: K, val: (typeof EMPTY)[K]) =>
    setF(prev => ({ ...prev, [key]: val }))

  const canSave =
    f.name.trim() &&
    f.accidentDate &&
    f.causeAgent.trim() &&
    f.injuryNature.trim() &&
    f.bodyPart.trim()

  const handleSave = () => {
    if (!canSave) return
    const year = new Date(f.accidentDate).getFullYear()
    dispatch({
      type: 'add_accident',
      record: {
        name:         f.name.trim(),
        department:   f.department,
        accidentDate: f.accidentDate,
        daysOff:      Number(f.daysOff) || 0,
        injuryLevel:  f.injuryLevel,
        causeAgent:   f.causeAgent.trim(),
        injuryNature: f.injuryNature.trim(),
        bodyPart:     f.bodyPart.trim(),
        cause:        f.cause,
        expenses:     f.expenses !== '' ? Number(f.expenses) : null,
        useCompFund:  f.useCompFund,
        year,
        details:      f.details.trim(),
      },
    })
    setSaved(true)
    setF(EMPTY)
    setTimeout(() => { setSaved(false); onSuccess?.() }, 1200)
  }

  return (
    <div style={{ maxWidth: 720 }}>
      {saved && (
        <div style={{
          background: 'var(--acc-resolved)', color: '#fff',
          padding: '10px 16px', borderRadius: 8, marginBottom: 16,
          fontSize: 13, fontFamily: 'var(--font-mono)',
        }}>
          ✓ บันทึกข้อมูลอุบัติเหตุเรียบร้อยแล้ว
        </div>
      )}

      {/* Row 1: ชื่อ + แผนก */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12, marginBottom: 12 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>ชื่อ-สกุล ผู้ประสบอันตราย</label>
          <input
            type="text"
            placeholder="เช่น สมชาย ใจดี"
            value={f.name}
            onChange={e => set('name', e.target.value)}
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>แผนก</label>
          <select value={f.department} onChange={e => set('department', e.target.value)}>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: วันที่ + จำนวนวันหยุด */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12, marginBottom: 12 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>วันที่เกิดอุบัติเหตุ</label>
          <input
            type="date"
            value={f.accidentDate}
            onChange={e => set('accidentDate', e.target.value)}
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>จำนวนวันหยุดงาน</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={f.daysOff}
            onChange={e => set('daysOff', e.target.value)}
          />
        </div>
      </div>

      {/* การประสบอันตราย */}
      <div className="field">
        <label>การประสบอันตราย (ระดับความรุนแรง)</label>
        <select value={f.injuryLevel} onChange={e => set('injuryLevel', e.target.value as InjuryLevel)}>
          {INJURY_LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* สิ่งที่ทำให้ประสบอันตราย */}
      <div className="field">
        <label>สิ่งที่ทำให้ประสบอันตราย (Agent)</label>
        <input
          type="text"
          list="cause-agent-list"
          placeholder="เลือกหรือพิมพ์..."
          value={f.causeAgent}
          onChange={e => set('causeAgent', e.target.value)}
        />
        <datalist id="cause-agent-list">
          {CAUSE_AGENTS.map(a => <option key={a} value={a} />)}
        </datalist>
      </div>

      {/* ลักษณะการประสบอันตราย */}
      <div className="field">
        <label>ลักษณะการประสบอันตราย</label>
        <input
          type="text"
          list="injury-nature-list"
          placeholder="เลือกหรือพิมพ์..."
          value={f.injuryNature}
          onChange={e => set('injuryNature', e.target.value)}
        />
        <datalist id="injury-nature-list">
          {INJURY_NATURES.map(n => <option key={n} value={n} />)}
        </datalist>
      </div>

      {/* ส่วนของร่างกาย */}
      <div className="field">
        <label>ส่วนของร่างกายที่ได้รับบาดเจ็บ</label>
        <input
          type="text"
          list="body-part-list"
          placeholder="เลือกหรือพิมพ์..."
          value={f.bodyPart}
          onChange={e => set('bodyPart', e.target.value)}
        />
        <datalist id="body-part-list">
          {BODY_PARTS.map(p => <option key={p} value={p} />)}
        </datalist>
      </div>

      {/* สาเหตุ */}
      <div className="field">
        <label>สาเหตุ</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['Unsafe Act.', 'Unsafe Con.', 'อื่นๆ'] as AccidentCause[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('cause', c)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1.5px solid',
                borderColor: f.cause === c ? 'var(--ig-blue)' : 'var(--line)',
                background: f.cause === c ? '#e8f4fe' : 'transparent',
                color: f.cause === c ? 'var(--ig-blue)' : 'var(--fg)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Row: ค่าใช้จ่าย + กองทุน */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>ค่าใช้จ่าย (บาท)</label>
          <input
            type="number"
            min="0"
            placeholder="0.00"
            value={f.expenses}
            onChange={e => set('expenses', e.target.value)}
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>ใช้กองทุนเงินทดแทน</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 38, paddingLeft: 2 }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, cursor: 'pointer', fontWeight: 400,
            }}>
              <input
                type="checkbox"
                checked={f.useCompFund}
                onChange={e => set('useCompFund', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--ig-blue)' }}
              />
              ใช้กองทุนฯ
            </label>
          </div>
        </div>
      </div>

      {/* รายละเอียด */}
      <div className="field">
        <label>รายละเอียด / หมายเหตุ</label>
        <textarea
          rows={3}
          placeholder="อธิบายเพิ่มเติม..."
          value={f.details}
          onChange={e => set('details', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          className="btn btn-primary"
          disabled={!canSave}
          onClick={handleSave}
          style={{ opacity: canSave ? 1 : .4 }}
        >
          บันทึกอุบัติเหตุ →
        </button>
      </div>
    </div>
  )
}
