// src/lib/supabase/database.types.ts
// Auto-generated types matching supabase/schema.sql
// Re-run `npx supabase gen types typescript` to refresh after schema changes

export type IssueStatus = 'pending' | 'resolved'
export type ReviewActionType = 'resolved' | 'carry_over'

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id:          string
          name:        string
          short:       string
          description: string | null
          color_tag:   string
          created_at:  string
        }
        Insert: {
          id?:         string
          name:        string
          short:       string
          description?: string | null
          color_tag?:  string
          created_at?: string
        }
        Update: {
          id?:         string
          name?:       string
          short?:      string
          description?: string | null
          color_tag?:  string
          created_at?: string
        }
      }
      issues: {
        Row: {
          id:                string
          group_id:          string
          title:             string
          description:       string
          photo_url:         string | null
          current_status:    IssueStatus
          created_month:     string
          carry_over_count:  number
          last_review_month: string | null
          resolved_month:    string | null
          reporter:          string
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id?:               string
          group_id:          string
          title:             string
          description:       string
          photo_url?:        string | null
          current_status?:   IssueStatus
          created_month:     string
          carry_over_count?: number
          last_review_month?: string | null
          resolved_month?:   string | null
          reporter?:         string
          created_at?:       string
          updated_at?:       string
        }
        Update: {
          id?:               string
          group_id?:         string
          title?:            string
          description?:      string
          photo_url?:        string | null
          current_status?:   IssueStatus
          created_month?:    string
          carry_over_count?: number
          last_review_month?: string | null
          resolved_month?:   string | null
          reporter?:         string
          updated_at?:       string
        }
      }
      monthly_reviews: {
        Row: {
          id:               string
          month_year:       string
          total_issues:     number
          resolved_count:   number
          unresolved_count: number
          carry_over_count: number
          created_at:       string
        }
        Insert: {
          id?:               string
          month_year:        string
          total_issues?:     number
          resolved_count?:   number
          unresolved_count?: number
          carry_over_count?: number
          created_at?:       string
        }
        Update: {
          id?:               string
          month_year?:       string
          total_issues?:     number
          resolved_count?:   number
          unresolved_count?: number
          carry_over_count?: number
        }
      }
      review_actions: {
        Row: {
          id:          string
          issue_id:    string
          review_id:   string | null
          action_type: ReviewActionType
          action_by:   string
          action_at:   string
        }
        Insert: {
          id?:         string
          issue_id:    string
          review_id?:  string | null
          action_type: ReviewActionType
          action_by?:  string
          action_at?:  string
        }
        Update: {
          id?:         string
          issue_id?:   string
          review_id?:  string | null
          action_type?: ReviewActionType
          action_by?:  string
          action_at?:  string
        }
      }
    }
    Views:   Record<string, never>
    Functions: Record<string, never>
    Enums: {
      issue_status:        IssueStatus
      review_action_type:  ReviewActionType
    }
  }
}
