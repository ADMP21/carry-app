// src/types/index.ts

export type IssueStatus = 'pending' | 'resolved'

export interface Group {
  id: string
  name: string
  short: string
  color: string
  description: string
}

export interface Issue {
  id: string
  groupId: string
  title: string
  description: string
  photoSeed: string
  photoUrl?: string        // real upload URL (Supabase Storage later)
  status: IssueStatus
  createdMonth: string     // "YYYY-MM"
  carryOverCount: number
  lastReviewMonth: string | null
  resolvedMonth?: string
  reporter: string
}

export interface ReviewResult {
  id: string
  action: 'resolved' | 'carry'
}

// ─── Accident Records ──────────────────────────────────────────
export type InjuryLevel =
  | 'ตาย'
  | 'ทุพพลภาพ'
  | 'สูญเสียอวัยวะบางส่วน'
  | 'หยุดงานเกิน 3 วัน'
  | 'หยุดงานไม่เกิน 3 วัน'
  | 'ไม่หยุดงาน'

export type AccidentCause = 'Unsafe Act.' | 'Unsafe Con.' | 'อื่นๆ'

export interface AccidentRecord {
  id:           string
  name:         string        // ชื่อ-สกุล
  department:   string        // แผนก
  accidentDate: string        // ISO date "YYYY-MM-DD"
  daysOff:      number        // จำนวนวันหยุดงาน
  injuryLevel:  InjuryLevel   // การประสบอันตราย
  causeAgent:   string        // สิ่งที่ทำให้ประสบอันตราย
  injuryNature: string        // ลักษณะการประสบอันตราย
  bodyPart:     string        // ส่วนของร่างกาย
  cause:        AccidentCause // สาเหตุ
  expenses:     number | null // ค่าใช้จ่าย
  useCompFund:  boolean       // ใช้กองทุนเงินทดแทน
  year:         number        // ปี (Gregorian)
  details:      string        // รายละเอียด
}

export interface AppState {
  issues: Issue[]
  groups: Group[]
  currentMonth: string
  accidentRecords: AccidentRecord[]
}

export type AppAction =
  | {
      type: 'add'
      groupId: string
      title: string
      desc: string
      photoSeed: string
    }
  | { type: 'review_commit'; results: ReviewResult[] }
  | { type: 'reset_seed' }
  | { type: 'add_accident'; record: Omit<AccidentRecord, 'id'> }
