-- ============================================================
-- Carry — Helper Functions
-- Run AFTER schema.sql
-- ============================================================

-- Atomic increment of carry_over_count on issues
-- Called from queries.ts when action = 'carry'
create or replace function increment_carry_over(issue_id uuid)
returns void
language sql
security definer
as $$
  update issues
  set carry_over_count = carry_over_count + 1
  where id = issue_id;
$$;
