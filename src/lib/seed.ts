// src/lib/seed.ts
import type { Group, Issue } from '@/types'

export const GROUPS: Group[] = [
  { id: 'g_rm', name: 'แผนก RM', short: 'RM', color: '#c97a3d', description: 'Raw Materials — วัตถุดิบและส่วนผสมการผลิต' },
  { id: 'g_pr', name: 'แผนก PR', short: 'PR', color: '#3d8bc9', description: 'Production — แผนกผลิต' },
  { id: 'g_pa', name: 'แผนก PA', short: 'PA', color: '#7a6a8f', description: 'Packing — แผนกบรรจุภัณฑ์' },
  { id: 'g_qc', name: 'แผนก QC', short: 'QC', color: '#3d9c7a', description: 'Quality Control — ควบคุมคุณภาพ' },
  { id: 'g_mc', name: 'แผนก MC', short: 'MC', color: '#d4a93d', description: 'Maintenance — ซ่อมบำรุงเครื่องจักรและอาคาร' },
  { id: 'g_hr', name: 'แผนก HR', short: 'HR', color: '#c94a6f', description: 'Human Resources — ทรัพยากรบุคคล' },
  { id: 'g_st', name: 'แผนก ST', short: 'ST', color: '#4a9cc9', description: 'Store — คลังสินค้า' },
  { id: 'g_cd', name: 'แผนก CD', short: 'CD', color: '#5a9a3d', description: 'Cold Storage — ห้องเย็นและจัดจำหน่าย' },
  { id: 'g_oe', name: 'แผนก OE', short: 'OE', color: '#8b5e3c', description: 'Office & Engineering — สำนักงานและวิศวกรรม' },
]

export const ISSUES: Issue[] = [
  // Carry-overs (ปัญหาค้างจากเดือนก่อน)
  { id: 'i01', groupId: 'g_mc', title: 'เครื่องแพ็คสินค้าสายที่ 2 ชำรุด',       description: 'ซีลถุงไม่สนิท สินค้าเสียหาย รอช่างจากบริษัทเข้ามาซ่อม',        photoSeed: 'PACKING LINE 2', status: 'pending',  createdMonth: '2026-02', carryOverCount: 3, lastReviewMonth: '2026-04', reporter: 'ฝ่าย MC' },
  { id: 'i02', groupId: 'g_qc', title: 'เครื่องชั่งน้ำหนักไม่แม่นยำ',            description: 'ค่าคลาดเคลื่อน ±5g ส่งผลต่อ Net Weight สินค้า ต้องสอบเทียบ',   photoSeed: 'SCALE · QC',    status: 'pending',  createdMonth: '2026-03', carryOverCount: 2, lastReviewMonth: '2026-04', reporter: 'ฝ่าย QC' },
  { id: 'i03', groupId: 'g_cd', title: 'ห้องเย็น Zone B อุณหภูมิสูงกว่ากำหนด', description: 'วัดได้ -15°C แต่ spec กำหนด -18°C แจ้งช่างแล้วยังไม่แก้ไข',    photoSeed: 'COLD ROOM B',   status: 'pending',  createdMonth: '2026-03', carryOverCount: 2, lastReviewMonth: '2026-04', reporter: 'ฝ่าย CD' },
  { id: 'i04', groupId: 'g_pr', title: 'สายพานลำเลียงสายที่ 1 ตึงเกินไป',       description: 'สายพานส่งเสียงดัง เสี่ยงขาด ต้องปรับแรงตึงและหล่อลื่น',        photoSeed: 'CONVEYOR · L1', status: 'pending',  createdMonth: '2026-04', carryOverCount: 1, lastReviewMonth: '2026-04', reporter: 'ฝ่าย PR' },
  { id: 'i05', groupId: 'g_st', title: 'ชั้นวางสินค้าโซน C หัก',                description: 'ชั้นที่ 3 รับน้ำหนักไม่ได้ สินค้าตกหล่น อันตราย',                photoSeed: 'SHELF · ZONE C',status: 'pending',  createdMonth: '2026-04', carryOverCount: 1, lastReviewMonth: '2026-04', reporter: 'ฝ่าย ST' },
  // ปัญหาใหม่เดือนนี้
  { id: 'i06', groupId: 'g_rm', title: 'วัตถุดิบล็อต A003 สีผิดปกติ',           description: 'สีคล้ำกว่าปกติ ยังไม่ผ่าน QC รอการตรวจสอบจากซัพพลายเออร์',    photoSeed: 'RM · LOT A003', status: 'pending',  createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'ฝ่าย RM' },
  { id: 'i07', groupId: 'g_pa', title: 'กล่องบรรจุขนาด L ขาดสต็อก',             description: 'เหลือ 200 ใบ ต่ำกว่า min stock สั่งซื้อแล้วแต่ยังไม่ส่งมา',  photoSeed: 'BOX · SIZE L',  status: 'pending',  createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'ฝ่าย PA' },
  { id: 'i08', groupId: 'g_mc', title: 'คอมเพรสเซอร์ห้องเย็นเสียงดังผิดปกติ',   description: 'ส่งเสียงกระทบทุก 10 นาที อาจเกิดจากน้ำแข็งสะสมในระบบ',       photoSeed: 'COMPRESSOR',    status: 'pending',  createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'ฝ่าย MC' },
  { id: 'i09', groupId: 'g_hr', title: 'บัตรพนักงาน 3 ใบ เข้าประตูไม่ได้',      description: 'บัตร ID ของพนักงานสาย PR 3 คน สแกนไม่ผ่าน ต้องรีเซ็ตระบบ',   photoSeed: 'ACCESS CARD',   status: 'pending',  createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'ฝ่าย HR' },
  { id: 'i10', groupId: 'g_oe', title: 'ปริ้นเตอร์ฝ่ายบัญชีหมึกหมด',            description: 'ใช้พิมพ์ใบส่งของไม่ได้ตั้งแต่เช้า กำลังรอหมึกสั่งมา',         photoSeed: 'PRINTER · ACC', status: 'pending',  createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'ฝ่าย OE' },
  // ปิดเคสแล้ว (ประวัติ)
  { id: 'i90', groupId: 'g_qc', title: 'เทอร์โมมิเตอร์ห้องเย็นแสดงผลผิด',      description: 'เปลี่ยนเซ็นเซอร์ใหม่และสอบเทียบเรียบร้อยแล้ว',                 photoSeed: 'THERMOMETER',   status: 'resolved', createdMonth: '2026-03', carryOverCount: 1, lastReviewMonth: '2026-04', resolvedMonth: '2026-04', reporter: 'ฝ่าย QC' },
  { id: 'i91', groupId: 'g_pr', title: 'ปั๊มน้ำในกระบวนการผลิตรั่ว',             description: 'ช่างเปลี่ยน seal และทดสอบแรงดันผ่านแล้ว',                       photoSeed: 'PUMP · PROD',   status: 'resolved', createdMonth: '2026-04', carryOverCount: 0, lastReviewMonth: '2026-04', resolvedMonth: '2026-04', reporter: 'ฝ่าย PR' },
  { id: 'i92', groupId: 'g_st', title: 'ระบบ barcode scanner ค้าง',               description: 'ติดตั้ง firmware ใหม่ ทดสอบสแกนผ่านครบทุกจุด',                 photoSeed: 'BARCODE',       status: 'resolved', createdMonth: '2026-03', carryOverCount: 0, lastReviewMonth: '2026-03', resolvedMonth: '2026-03', reporter: 'ฝ่าย ST' },
  { id: 'i93', groupId: 'g_cd', title: 'รถขนส่งสินค้าคันที่ 2 แอร์เสีย',         description: 'ซ่อมแอร์เรียบร้อย ตรวจสอบระบบความเย็นผ่านมาตรฐาน',            photoSeed: 'TRUCK · COLD',  status: 'resolved', createdMonth: '2026-02', carryOverCount: 0, lastReviewMonth: '2026-02', resolvedMonth: '2026-02', reporter: 'ฝ่าย CD' },
  { id: 'i94', groupId: 'g_pa', title: 'เครื่องพิมพ์วันหมดอายุหัวพิมพ์อุดตัน',  description: 'ล้างหัวพิมพ์ด้วยน้ำยาและทดสอบพิมพ์วันที่ผ่านแล้ว',            photoSeed: 'INKJET · DATE', status: 'resolved', createdMonth: '2026-04', carryOverCount: 0, lastReviewMonth: '2026-04', resolvedMonth: '2026-04', reporter: 'ฝ่าย PA' },
]

export const CURRENT_MONTH = '2026-05'
