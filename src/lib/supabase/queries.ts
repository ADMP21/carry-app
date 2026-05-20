// src/lib/supabase/queries.ts
// All Supabase queries — called from server actions or client components
import { supabase } from './client'
import type { Group, Issue, ReviewResult } from '@/types'

// ─── helpers: map DB row → app type ───────────────────────────

function mapGroup(row: {
  id: string; name: string; short: string
  description: string | null; color_tag: string
}): Group {
  return {
    id:          row.id,
    name:        row.name,
    short:       row.short,
    description: row.description ?? '',
    color:       row.color_tag,
  }
}

function mapIssue(row: {
  id: string; group_id: string; title: string; description: string
  photo_url: string | null; current_status: string; created_month: string
  carry_over_count: number; last_review_month: string | null
  resolved_month: string | null; reporter: string
}): Issue {
  return {
    id:               row.id,
    groupId:          row.group_id,
    title:            row.title,
    description:      row.description,
    photoUrl:         row.photo_url ?? undefined,
    photoSeed:        row.title.split(' ').slice(0, 2).join(' ').toUpperCase(),
    status:           row.current_status as 'pending' | 'resolved',
    createdMonth:     row.created_month,
    carryOverCount:   row.carry_over_count,
    lastReviewMonth:  row.last_review_month,
    resolvedMonth:    row.resolved_month ?? undefined,
    reporter:         row.reporter,
  }
}

// ─── GROUPS ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any

export async function fetchGroups(): Promise<Group[]> {
  const { data, error } = await sb
    .from('groups')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error((error as { message: string }).message)
  return ((data ?? []) as Parameters<typeof mapGroup>[0][]).map(mapGroup)
}

// ─── ISSUES ───────────────────────────────────────────────────

export async function fetchIssues(): Promise<Issue[]> {
  const { data, error } = await sb
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error((error as { message: string }).message)
  return ((data ?? []) as Parameters<typeof mapIssue>[0][]).map(mapIssue)
}

export async function fetchIssuesByGroup(groupId: string): Promise<Issue[]> {
  const { data, error } = await sb
    .from('issues')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (error) throw new Error((error as { message: string }).message)
  return ((data ?? []) as Parameters<typeof mapIssue>[0][]).map(mapIssue)
}

export async function fetchPendingIssues(): Promise<Issue[]> {
  const { data, error } = await sb
    .from('issues')
    .select('*')
    .eq('current_status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error((error as { message: string }).message)
  return ((data ?? []) as Parameters<typeof mapIssue>[0][]).map(mapIssue)
}

export async function createIssue(params: {
  groupId:      string
  title:        string
  description:  string
  photoUrl?:    string
  createdMonth: string
  reporter?:    string
}): Promise<Issue> {
  const { data, error } = await sb
    .from('issues')
    .insert({
      group_id:      params.groupId,
      title:         params.title,
      description:   params.description,
      photo_url:     params.photoUrl ?? null,
      created_month: params.createdMonth,
      reporter:      params.reporter ?? 'คุณ (ฉัน)',
    })
    .select()
    .single()

  if (error) throw new Error((error as { message: string }).message)
  return mapIssue(data as Parameters<typeof mapIssue>[0])
}

// ─── REVIEW ───────────────────────────────────────────────────

export async function commitReview(params: {
  results:   ReviewResult[]
  monthYear: string
}): Promise<void> {
  const { results, monthYear } = params

  // 1. Upsert monthly_review record
  const resolvedCount = results.filter(r => r.action === 'resolved').length
  const carryCount    = results.filter(r => r.action === 'carry').length

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sbAny = supabase as any

  const { data: reviewRow, error: reviewErr } = await sbAny
    .from('monthly_reviews')
    .upsert({
      month_year:       monthYear,
      resolved_count:   resolvedCount,
      unresolved_count: carryCount,
      carry_over_count: carryCount,
      total_issues:     results.length,
    }, { onConflict: 'month_year' })
    .select()
    .single()

  if (reviewErr) throw new Error((reviewErr as { message: string }).message)

  // 2. Update each issue + insert review_action rows in parallel
  await Promise.all(
    results.map(async (r) => {
      if (r.action === 'carry') {
        // Fetch current count then increment (avoids needing a Postgres RPC)
        const { data: cur } = await sbAny
          .from('issues')
          .select('carry_over_count')
          .eq('id', r.id)
          .single()
        const currentCount: number = (cur as { carry_over_count: number } | null)?.carry_over_count ?? 0

        await sbAny
          .from('issues')
          .update({ carry_over_count: currentCount + 1, last_review_month: monthYear })
          .eq('id', r.id)
      } else {
        await sbAny
          .from('issues')
          .update({ current_status: 'resolved', resolved_month: monthYear, last_review_month: monthYear })
          .eq('id', r.id)
      }

      // Insert review_action log
      await sbAny.from('review_actions').insert({
        issue_id:    r.id,
        review_id:   reviewRow?.id ?? null,
        action_type: r.action === 'resolved' ? 'resolved' : 'carry_over',
      })
    })
  )
}

// ─── IMAGE UPLOAD ──────────────────────────────────────────────

export async function uploadIssuePhoto(file: File): Promise<string> {
  const ext      = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path     = `issues/${fileName}`

  const { error: uploadErr } = await supabase.storage
    .from('issue-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadErr) throw new Error(uploadErr.message)

  const { data } = supabase.storage.from('issue-photos').getPublicUrl(path)
  return data.publicUrl
}

