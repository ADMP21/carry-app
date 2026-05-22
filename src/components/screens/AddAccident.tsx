'use client'
// src/components/screens/AddAccident.tsx
import type { AppAction } from '@/types'
import AccidentForm from '@/components/screens/AccidentForm'

type RouteName = 'dashboard' | 'add' | 'add-accident' | 'groups' | 'summary' | 'history' | 'accident-stats'

interface AddAccidentProps {
  dispatch: (action: AppAction) => void
  onNav:    (name: RouteName) => void
}

export default function AddAccident({ dispatch, onNav }: AddAccidentProps) {
  return (
    <AccidentForm
      dispatch={dispatch}
      onSuccess={() => onNav('accident-stats')}
    />
  )
}
