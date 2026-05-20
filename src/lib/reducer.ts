// src/lib/reducer.ts
import type { AppState, AppAction } from '@/types'
import type { Group, Issue } from '@/types'
import { ISSUES } from './seed'

// Extend action types locally to support hydrate
type ExtendedAction = AppAction | { type: 'hydrate'; groups: Group[]; issues: Issue[] }

export function reducer(state: AppState, action: ExtendedAction): AppState {
  switch (action.type) {
    case 'hydrate': {
      return {
        ...state,
        groups: action.groups,
        issues: action.issues,
      }
    }
    case 'add': {
      const id = 'i' + String(Date.now()).slice(-6)
      return {
        ...state,
        issues: [
          {
            id,
            groupId:         action.groupId,
            title:           action.title,
            description:     action.desc,
            photoSeed:       action.photoSeed,
            photoUrl:        (action as { photoUrl?: string }).photoUrl,
            status:          'pending',
            createdMonth:    state.currentMonth,
            carryOverCount:  0,
            lastReviewMonth: null,
            reporter:        'คุณ (ฉัน)',
          },
          ...state.issues,
        ],
      }
    }
    case 'review_commit': {
      const updated = state.issues.map(issue => {
        const result = action.results.find(r => r.id === issue.id)
        if (!result) return issue
        if (result.action === 'resolved') {
          return { ...issue, status: 'resolved' as const, lastReviewMonth: state.currentMonth, resolvedMonth: state.currentMonth }
        }
        return { ...issue, carryOverCount: issue.carryOverCount + 1, lastReviewMonth: state.currentMonth }
      })
      return { ...state, issues: updated }
    }
    case 'reset_seed':
      return { ...state, issues: ISSUES.map(i => ({ ...i })) }
    default:
      return state
  }
}
