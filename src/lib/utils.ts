// src/lib/utils.ts

export function monthLabel(monthKey: string | null | undefined): string {
  if (!monthKey) return '—'
  const [y, m] = monthKey.split('-')
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${names[parseInt(m, 10) - 1]} ${y}`
}

export function monthLabelTh(monthKey: string | null | undefined): string {
  if (!monthKey) return '—'
  const [y, m] = monthKey.split('-')
  const names = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
  return `${names[parseInt(m, 10) - 1]} ${parseInt(y, 10) + 543}`
}

export function prevMonth(mk: string): string {
  let [y, m] = mk.split('-').map(Number)
  m -= 1
  if (m === 0) { m = 12; y -= 1 }
  return `${y}-${String(m).padStart(2, '0')}`
}

export function nextMonth(mk: string): string {
  let [y, m] = mk.split('-').map(Number)
  m += 1
  if (m > 12) { m = 1; y += 1 }
  return `${y}-${String(m).padStart(2, '0')}`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
