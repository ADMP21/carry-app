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

export interface AppState {
  issues: Issue[]
  groups: Group[]
  currentMonth: string
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
