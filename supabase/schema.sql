-- ============================================================
-- Carry — Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type issue_status as enum ('pending', 'resolved');
create type review_action_type as enum ('resolved', 'carry_over');

-- ============================================================
-- TABLE: groups
-- ============================================================
create table if not exists groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  short       text not null,            -- e.g. "APPLIANCE"
  description text,
  color_tag   text not null default '#888888',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TABLE: issues
-- ============================================================
create table if not exists issues (
  id                uuid primary key default uuid_generate_v4(),
  group_id          uuid not null references groups(id) on delete restrict,
  title             text not null,
  description       text not null,
  photo_url         text,               -- Supabase Storage URL
  current_status    issue_status not null default 'pending',
  created_month     text not null,      -- format: "YYYY-MM"
  carry_over_count  integer not null default 0,
  last_review_month text,               -- format: "YYYY-MM"
  resolved_month    text,               -- format: "YYYY-MM"
  reporter          text not null default 'Unknown',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger issues_updated_at
  before update on issues
  for each row execute function update_updated_at();

-- ============================================================
-- TABLE: monthly_reviews
-- ============================================================
create table if not exists monthly_reviews (
  id               uuid primary key default uuid_generate_v4(),
  month_year       text not null unique,   -- "YYYY-MM"
  total_issues     integer not null default 0,
  resolved_count   integer not null default 0,
  unresolved_count integer not null default 0,
  carry_over_count integer not null default 0,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- TABLE: review_actions
-- ============================================================
create table if not exists review_actions (
  id          uuid primary key default uuid_generate_v4(),
  issue_id    uuid not null references issues(id) on delete cascade,
  review_id   uuid references monthly_reviews(id) on delete set null,
  action_type review_action_type not null,
  action_by   text not null default 'anonymous',
  action_at   timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_issues_group_id          on issues(group_id);
create index if not exists idx_issues_status            on issues(current_status);
create index if not exists idx_issues_created_month     on issues(created_month);
create index if not exists idx_issues_last_review_month on issues(last_review_month);
create index if not exists idx_review_actions_issue_id  on review_actions(issue_id);
create index if not exists idx_review_actions_review_id on review_actions(review_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS on all tables
alter table groups         enable row level security;
alter table issues         enable row level security;
alter table monthly_reviews enable row level security;
alter table review_actions  enable row level security;

-- For now: allow all authenticated users to read/write
-- (Step 3 will add Admin vs Member roles)

create policy "Allow all authenticated users to read groups"
  on groups for select using (auth.role() = 'authenticated');

create policy "Allow all authenticated users to read issues"
  on issues for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert issues"
  on issues for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to update issues"
  on issues for update using (auth.role() = 'authenticated');

create policy "Allow all authenticated users to read reviews"
  on monthly_reviews for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert reviews"
  on monthly_reviews for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to update reviews"
  on monthly_reviews for update using (auth.role() = 'authenticated');

create policy "Allow all authenticated users to read review_actions"
  on review_actions for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert review_actions"
  on review_actions for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA — Groups
-- ============================================================
insert into groups (id, name, short, description, color_tag) values
  ('11111111-0001-0001-0001-000000000001', 'เครื่องใช้สำนักงาน', 'APPLIANCE', 'อุปกรณ์สำนักงานทั่วไป เช่น ปรินเตอร์ เครื่องชงกาแฟ', '#c97a3d'),
  ('11111111-0002-0002-0002-000000000002', 'เฟอร์นิเจอร์',       'FURNITURE', 'โต๊ะ เก้าอี้ ตู้ และของตกแต่งภายใน',                  '#7a6a8f'),
  ('11111111-0003-0003-0003-000000000003', 'ระบบไฟฟ้า',          'ELECTRIC',  'หลอดไฟ ปลั๊ก เบรกเกอร์ และระบบไฟฟ้าทั่วไป',         '#d4a93d'),
  ('11111111-0004-0004-0004-000000000004', 'ระบบประปา',          'PLUMBING',  'ก๊อก ท่อ ห้องน้ำ และระบบน้ำ',                        '#3d8bc9'),
  ('11111111-0005-0005-0005-000000000005', 'IT & เครือข่าย',      'IT',        'WiFi เครือข่าย คอมพิวเตอร์ และอุปกรณ์ไอที',           '#3d9c7a')
on conflict (id) do nothing;

-- ============================================================
-- SEED DATA — Issues (demo)
-- ============================================================
insert into issues (id, group_id, title, description, current_status, created_month, carry_over_count, last_review_month, resolved_month, reporter) values
  -- Carry-overs
  ('22222222-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000001', 'ปรินเตอร์ชั้น 3 หมึกหมดอีกแล้ว',  'เครื่อง HP ชั้น 3 ฝั่งบัญชี ขึ้นเตือนหมึกแดง พิมพ์เอกสารไม่ออก', 'pending',  '2026-02', 3, '2026-04', null, 'พลอย ฝ่ายบัญชี'),
  ('22222222-0002-0002-0002-000000000002', '11111111-0004-0004-0004-000000000004', 'ก๊อกน้ำห้องครัวรั่วซึม',           'หยดน้ำตลอด แม้ปิดสนิท ใต้ซิงค์มีน้ำขัง',                           'pending',  '2026-03', 2, '2026-04', null, 'ตาล แม่บ้าน'),
  ('22222222-0003-0003-0003-000000000003', '11111111-0003-0003-0003-000000000003', 'หลอดไฟห้องประชุม A กระพริบ',       'หลอด LED 2 จุดกระพริบ สังเกตเห็นชัดในระหว่างประชุม',               'pending',  '2026-03', 2, '2026-04', null, 'เอ ฝ่าย Ops'),
  ('22222222-0004-0004-0004-000000000004', '11111111-0002-0002-0002-000000000002', 'เก้าอี้ล็อบบี้ขาคลอน',             'เก้าอี้ตัวที่ 3 ขาหลังหลวม นั่งแล้วโยก ใช้งานต่อไม่ปลอดภัย',      'pending',  '2026-04', 1, '2026-04', null, 'นิว Front Desk'),
  ('22222222-0005-0005-0005-000000000005', '11111111-0005-0005-0005-000000000005', 'WiFi ชั้น 5 หลุดบ่อย',             'ตั้งแต่ 14:00 เป็นต้นไป SSID office-5F หลุดทุก 20 นาที',           'pending',  '2026-04', 1, '2026-04', null, 'ภัทร ฝ่ายดีไซน์'),
  -- New this month
  ('22222222-0006-0006-0006-000000000006', '11111111-0001-0001-0001-000000000001', 'เครื่องชงกาแฟไม่ทำงาน',            'กดปุ่มแล้วไฟติดแต่ไม่มีน้ำไหล ลองล้างถังแล้วก็ยังเหมือนเดิม',    'pending',  '2026-05', 0, null,      null, 'หมิว ฝ่ายขาย'),
  ('22222222-0007-0007-0007-000000000007', '11111111-0003-0003-0003-000000000003', 'ปลั๊กผนังโต๊ะ 14 หลวม',            'เสียบ adapter แล้วหลุด ต้องเอาเทปแปะ เสี่ยงไฟลัดวงจร',            'pending',  '2026-05', 0, null,      null, 'ก้อง วิศวกร'),
  ('22222222-0008-0008-0008-000000000008', '11111111-0004-0004-0004-000000000004', 'โถปัสสาวะชายชั้น 2 ตัน',           'กดชักโครกแล้วน้ำไม่ลง ใช้งานไม่ได้เลย',                            'pending',  '2026-05', 0, null,      null, 'ฝ่ายอาคาร'),
  ('22222222-0009-0009-0009-000000000009', '11111111-0002-0002-0002-000000000002', 'ลิ้นชักโต๊ะรับแขกค้าง',            'ดึงออกไม่ได้ ปิดก็ไม่สนิท ของข้างในติดข้างใน',                     'pending',  '2026-05', 0, null,      null, 'พลอย Front Desk'),
  ('22222222-0010-0010-0010-000000000010', '11111111-0005-0005-0005-000000000005', 'จอประชุมห้อง B ไม่รับสัญญาณ HDMI', 'เสียบสายแล้วขึ้น No Signal ต่อกับเครื่องอื่นก็ไม่ติด',            'pending',  '2026-05', 0, null,      null, 'ฟ้า ฝ่าย IT'),
  -- Resolved
  ('22222222-0090-0090-0090-000000000090', '11111111-0003-0003-0003-000000000003', 'เบรกเกอร์ห้อง server ทริปบ่อย',   'ฝ่ายอาคารเปลี่ยนเบรกเกอร์ใหม่แล้ว',                               'resolved', '2026-03', 1, '2026-04', '2026-04', 'ก้อง วิศวกร'),
  ('22222222-0091-0091-0091-000000000091', '11111111-0005-0005-0005-000000000005', 'VPN ของฝ่ายขายเชื่อมต่อไม่ได้',   'อัปเดตคอนฟิกผ่านระบบ MDM เรียบร้อย',                               'resolved', '2026-04', 0, '2026-04', '2026-04', 'ฟ้า ฝ่าย IT'),
  ('22222222-0092-0092-0092-000000000092', '11111111-0002-0002-0002-000000000002', 'โต๊ะประชุมขาเสีย',                 'ช่างเข้ามาเปลี่ยนน็อตและเสริมเหล็กยึด',                            'resolved', '2026-03', 0, '2026-03', '2026-03', 'เอ ฝ่าย Ops'),
  ('22222222-0093-0093-0093-000000000093', '11111111-0004-0004-0004-000000000004', 'อ่างล้างหน้าตัน',                  'ใช้น้ำยาขจัดสิ่งอุดตัน',                                           'resolved', '2026-02', 0, '2026-02', '2026-02', 'ตาล แม่บ้าน'),
  ('22222222-0094-0094-0094-000000000094', '11111111-0001-0001-0001-000000000001', 'เครื่องถ่ายเอกสารกระดาษติด',       'ช่างมาบริการ และทำความสะอาดลูกกลิ้ง',                              'resolved', '2026-04', 0, '2026-04', '2026-04', 'พลอย ฝ่ายบัญชี')
on conflict (id) do nothing;
