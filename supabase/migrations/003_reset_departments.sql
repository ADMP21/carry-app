-- ============================================================
-- Migration 003 — Reset to Factory Departments (RM/PR/PA/QC/MC/HR/ST/CD/OE)
-- Run this in Supabase Dashboard > SQL Editor
-- Wipes old demo data and inserts production-ready department seed
-- ============================================================

-- 1. Clear existing data (FK order: children first)
DELETE FROM review_actions;
DELETE FROM monthly_reviews;
DELETE FROM issues;
DELETE FROM groups;

-- 2. Insert new department groups
INSERT INTO groups (id, name, short, description, color_tag) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 'แผนก RM', 'RM', 'Raw Materials — วัตถุดิบและส่วนผสมการผลิต',         '#c97a3d'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 'แผนก PR', 'PR', 'Production — แผนกผลิต',                             '#3d8bc9'),
  ('aaaaaaaa-0003-0003-0003-000000000003', 'แผนก PA', 'PA', 'Packing — แผนกบรรจุภัณฑ์',                         '#7a6a8f'),
  ('aaaaaaaa-0004-0004-0004-000000000004', 'แผนก QC', 'QC', 'Quality Control — ควบคุมคุณภาพ',                   '#3d9c7a'),
  ('aaaaaaaa-0005-0005-0005-000000000005', 'แผนก MC', 'MC', 'Maintenance — ซ่อมบำรุงเครื่องจักรและอาคาร',       '#d4a93d'),
  ('aaaaaaaa-0006-0006-0006-000000000006', 'แผนก HR', 'HR', 'Human Resources — ทรัพยากรบุคคล',                  '#c94a6f'),
  ('aaaaaaaa-0007-0007-0007-000000000007', 'แผนก ST', 'ST', 'Store — คลังสินค้า',                               '#4a9cc9'),
  ('aaaaaaaa-0008-0008-0008-000000000008', 'แผนก CD', 'CD', 'Cold Storage — ห้องเย็นและจัดจำหน่าย',             '#5a9a3d'),
  ('aaaaaaaa-0009-0009-0009-000000000009', 'แผนก OE', 'OE', 'Office & Engineering — สำนักงานและวิศวกรรม',        '#8b5e3c');

-- 3. Insert issues (carry-overs + new this month + resolved history)
INSERT INTO issues (
  id, group_id, title, description,
  current_status, created_month, carry_over_count,
  last_review_month, resolved_month, reporter
) VALUES
  -- ── Carry-overs (ปัญหาค้างจากเดือนก่อน) ──────────────────────
  ('bbbbbbbb-0001-0001-0001-000000000001',
   'aaaaaaaa-0005-0005-0005-000000000005',  -- MC
   'เครื่องแพ็คสินค้าสายที่ 2 ชำรุด',
   'ซีลถุงไม่สนิท สินค้าเสียหาย รอช่างจากบริษัทเข้ามาซ่อม',
   'pending', '2026-02', 3, '2026-04', NULL, 'ฝ่าย MC'),

  ('bbbbbbbb-0002-0002-0002-000000000002',
   'aaaaaaaa-0004-0004-0004-000000000004',  -- QC
   'เครื่องชั่งน้ำหนักไม่แม่นยำ',
   'ค่าคลาดเคลื่อน ±5g ส่งผลต่อ Net Weight สินค้า ต้องสอบเทียบ',
   'pending', '2026-03', 2, '2026-04', NULL, 'ฝ่าย QC'),

  ('bbbbbbbb-0003-0003-0003-000000000003',
   'aaaaaaaa-0008-0008-0008-000000000008',  -- CD
   'ห้องเย็น Zone B อุณหภูมิสูงกว่ากำหนด',
   'วัดได้ -15°C แต่ spec กำหนด -18°C แจ้งช่างแล้วยังไม่แก้ไข',
   'pending', '2026-03', 2, '2026-04', NULL, 'ฝ่าย CD'),

  ('bbbbbbbb-0004-0004-0004-000000000004',
   'aaaaaaaa-0002-0002-0002-000000000002',  -- PR
   'สายพานลำเลียงสายที่ 1 ตึงเกินไป',
   'สายพานส่งเสียงดัง เสี่ยงขาด ต้องปรับแรงตึงและหล่อลื่น',
   'pending', '2026-04', 1, '2026-04', NULL, 'ฝ่าย PR'),

  ('bbbbbbbb-0005-0005-0005-000000000005',
   'aaaaaaaa-0007-0007-0007-000000000007',  -- ST
   'ชั้นวางสินค้าโซน C หัก',
   'ชั้นที่ 3 รับน้ำหนักไม่ได้ สินค้าตกหล่น อันตราย',
   'pending', '2026-04', 1, '2026-04', NULL, 'ฝ่าย ST'),

  -- ── ปัญหาใหม่เดือนนี้ (2026-05) ──────────────────────────────
  ('bbbbbbbb-0006-0006-0006-000000000006',
   'aaaaaaaa-0001-0001-0001-000000000001',  -- RM
   'วัตถุดิบล็อต A003 สีผิดปกติ',
   'สีคล้ำกว่าปกติ ยังไม่ผ่าน QC รอการตรวจสอบจากซัพพลายเออร์',
   'pending', '2026-05', 0, NULL, NULL, 'ฝ่าย RM'),

  ('bbbbbbbb-0007-0007-0007-000000000007',
   'aaaaaaaa-0003-0003-0003-000000000003',  -- PA
   'กล่องบรรจุขนาด L ขาดสต็อก',
   'เหลือ 200 ใบ ต่ำกว่า min stock สั่งซื้อแล้วแต่ยังไม่ส่งมา',
   'pending', '2026-05', 0, NULL, NULL, 'ฝ่าย PA'),

  ('bbbbbbbb-0008-0008-0008-000000000008',
   'aaaaaaaa-0005-0005-0005-000000000005',  -- MC
   'คอมเพรสเซอร์ห้องเย็นเสียงดังผิดปกติ',
   'ส่งเสียงกระทบทุก 10 นาที อาจเกิดจากน้ำแข็งสะสมในระบบ',
   'pending', '2026-05', 0, NULL, NULL, 'ฝ่าย MC'),

  ('bbbbbbbb-0009-0009-0009-000000000009',
   'aaaaaaaa-0006-0006-0006-000000000006',  -- HR
   'บัตรพนักงาน 3 ใบ เข้าประตูไม่ได้',
   'บัตร ID ของพนักงานสาย PR 3 คน สแกนไม่ผ่าน ต้องรีเซ็ตระบบ',
   'pending', '2026-05', 0, NULL, NULL, 'ฝ่าย HR'),

  ('bbbbbbbb-0010-0010-0010-000000000010',
   'aaaaaaaa-0009-0009-0009-000000000009',  -- OE
   'ปริ้นเตอร์ฝ่ายบัญชีหมึกหมด',
   'ใช้พิมพ์ใบส่งของไม่ได้ตั้งแต่เช้า กำลังรอหมึกสั่งมา',
   'pending', '2026-05', 0, NULL, NULL, 'ฝ่าย OE'),

  -- ── ปิดเคสแล้ว — ประวัติ (resolved) ──────────────────────────
  ('bbbbbbbb-0090-0090-0090-000000000090',
   'aaaaaaaa-0004-0004-0004-000000000004',  -- QC
   'เทอร์โมมิเตอร์ห้องเย็นแสดงผลผิด',
   'เปลี่ยนเซ็นเซอร์ใหม่และสอบเทียบเรียบร้อยแล้ว',
   'resolved', '2026-03', 1, '2026-04', '2026-04', 'ฝ่าย QC'),

  ('bbbbbbbb-0091-0091-0091-000000000091',
   'aaaaaaaa-0002-0002-0002-000000000002',  -- PR
   'ปั๊มน้ำในกระบวนการผลิตรั่ว',
   'ช่างเปลี่ยน seal และทดสอบแรงดันผ่านแล้ว',
   'resolved', '2026-04', 0, '2026-04', '2026-04', 'ฝ่าย PR'),

  ('bbbbbbbb-0092-0092-0092-000000000092',
   'aaaaaaaa-0007-0007-0007-000000000007',  -- ST
   'ระบบ barcode scanner ค้าง',
   'ติดตั้ง firmware ใหม่ ทดสอบสแกนผ่านครบทุกจุด',
   'resolved', '2026-03', 0, '2026-03', '2026-03', 'ฝ่าย ST'),

  ('bbbbbbbb-0093-0093-0093-000000000093',
   'aaaaaaaa-0008-0008-0008-000000000008',  -- CD
   'รถขนส่งสินค้าคันที่ 2 แอร์เสีย',
   'ซ่อมแอร์เรียบร้อย ตรวจสอบระบบความเย็นผ่านมาตรฐาน',
   'resolved', '2026-02', 0, '2026-02', '2026-02', 'ฝ่าย CD'),

  ('bbbbbbbb-0094-0094-0094-000000000094',
   'aaaaaaaa-0003-0003-0003-000000000003',  -- PA
   'เครื่องพิมพ์วันหมดอายุหัวพิมพ์อุดตัน',
   'ล้างหัวพิมพ์ด้วยน้ำยาและทดสอบพิมพ์วันที่ผ่านแล้ว',
   'resolved', '2026-04', 0, '2026-04', '2026-04', 'ฝ่าย PA');

-- 4. Add anon RLS policies (run once — safe to re-run, DO NOTHING on conflict)
DO $$
BEGIN
  -- groups: anon read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='anon_read_groups'
  ) THEN
    EXECUTE 'CREATE POLICY anon_read_groups ON groups FOR SELECT TO anon USING (true)';
  END IF;

  -- issues: anon read / insert / update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='issues' AND policyname='anon_read_issues'
  ) THEN
    EXECUTE 'CREATE POLICY anon_read_issues ON issues FOR SELECT TO anon USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='issues' AND policyname='anon_insert_issues'
  ) THEN
    EXECUTE 'CREATE POLICY anon_insert_issues ON issues FOR INSERT TO anon WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='issues' AND policyname='anon_update_issues'
  ) THEN
    EXECUTE 'CREATE POLICY anon_update_issues ON issues FOR UPDATE TO anon USING (true)';
  END IF;

  -- monthly_reviews: anon all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='monthly_reviews' AND policyname='anon_all_reviews'
  ) THEN
    EXECUTE 'CREATE POLICY anon_all_reviews ON monthly_reviews FOR ALL TO anon USING (true) WITH CHECK (true)';
  END IF;

  -- review_actions: anon all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='review_actions' AND policyname='anon_all_review_actions'
  ) THEN
    EXECUTE 'CREATE POLICY anon_all_review_actions ON review_actions FOR ALL TO anon USING (true) WITH CHECK (true)';
  END IF;
END $$;
