// src/lib/seed.ts
import type { Group, Issue } from '@/types'

export const GROUPS: Group[] = [
  { id: 'g_appliance', name: 'เครื่องใช้สำนักงาน', short: 'APPLIANCE', color: '#c97a3d', description: 'อุปกรณ์สำนักงานทั่วไป เช่น ปรินเตอร์ เครื่องชงกาแฟ' },
  { id: 'g_furniture', name: 'เฟอร์นิเจอร์',       short: 'FURNITURE', color: '#7a6a8f', description: 'โต๊ะ เก้าอี้ ตู้ และของตกแต่งภายใน' },
  { id: 'g_electric',  name: 'ระบบไฟฟ้า',          short: 'ELECTRIC',  color: '#d4a93d', description: 'หลอดไฟ ปลั๊ก เบรกเกอร์ และระบบไฟฟ้าทั่วไป' },
  { id: 'g_plumbing',  name: 'ระบบประปา',          short: 'PLUMBING',  color: '#3d8bc9', description: 'ก๊อก ท่อ ห้องน้ำ และระบบน้ำ' },
  { id: 'g_it',        name: 'IT & เครือข่าย',      short: 'IT',        color: '#3d9c7a', description: 'WiFi เครือข่าย คอมพิวเตอร์ และอุปกรณ์ไอที' },
]

export const ISSUES: Issue[] = [
  // Carry-overs
  { id: 'i01', groupId: 'g_appliance', title: 'ปรินเตอร์ชั้น 3 หมึกหมดอีกแล้ว', description: 'เครื่อง HP ชั้น 3 ฝั่งบัญชี ขึ้นเตือนหมึกแดง พิมพ์เอกสารไม่ออก', photoSeed: 'PRINTER · FLOOR 3', status: 'pending', createdMonth: '2026-02', carryOverCount: 3, lastReviewMonth: '2026-04', reporter: 'พลอย ฝ่ายบัญชี' },
  { id: 'i02', groupId: 'g_plumbing',  title: 'ก๊อกน้ำห้องครัวรั่วซึม', description: 'หยดน้ำตลอด แม้ปิดสนิท ใต้ซิงค์มีน้ำขัง', photoSeed: 'FAUCET · PANTRY', status: 'pending', createdMonth: '2026-03', carryOverCount: 2, lastReviewMonth: '2026-04', reporter: 'ตาล แม่บ้าน' },
  { id: 'i03', groupId: 'g_electric',  title: 'หลอดไฟห้องประชุม A กระพริบ', description: 'หลอด LED 2 จุดกระพริบ สังเกตเห็นชัดในระหว่างประชุม', photoSeed: 'LIGHT · MEETING A', status: 'pending', createdMonth: '2026-03', carryOverCount: 2, lastReviewMonth: '2026-04', reporter: 'เอ ฝ่าย Ops' },
  { id: 'i04', groupId: 'g_furniture', title: 'เก้าอี้ล็อบบี้ขาคลอน', description: 'เก้าอี้ตัวที่ 3 ขาหลังหลวม นั่งแล้วโยก ใช้งานต่อไม่ปลอดภัย', photoSeed: 'CHAIR · LOBBY', status: 'pending', createdMonth: '2026-04', carryOverCount: 1, lastReviewMonth: '2026-04', reporter: 'นิว Front Desk' },
  { id: 'i05', groupId: 'g_it',        title: 'WiFi ชั้น 5 หลุดบ่อย', description: 'ตั้งแต่ 14:00 เป็นต้นไป SSID office-5F หลุดทุก 20 นาที', photoSeed: 'WIFI · FLOOR 5', status: 'pending', createdMonth: '2026-04', carryOverCount: 1, lastReviewMonth: '2026-04', reporter: 'ภัทร ฝ่ายดีไซน์' },
  // New this month
  { id: 'i06', groupId: 'g_appliance', title: 'เครื่องชงกาแฟไม่ทำงาน', description: 'กดปุ่มแล้วไฟติดแต่ไม่มีน้ำไหล ลองล้างถังแล้วก็ยังเหมือนเดิม', photoSeed: 'COFFEE MACHINE', status: 'pending', createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'หมิว ฝ่ายขาย' },
  { id: 'i07', groupId: 'g_electric',  title: 'ปลั๊กผนังโต๊ะ 14 หลวม', description: 'เสียบ adapter แล้วหลุด ต้องเอาเทปแปะ เสี่ยงไฟลัดวงจร', photoSeed: 'OUTLET · DESK 14', status: 'pending', createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'ก้อง วิศวกร' },
  { id: 'i08', groupId: 'g_plumbing',  title: 'โถปัสสาวะชายชั้น 2 ตัน', description: 'กดชักโครกแล้วน้ำไม่ลง ใช้งานไม่ได้เลย', photoSeed: 'WC · MEN · FLR 2', status: 'pending', createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'ฝ่ายอาคาร' },
  { id: 'i09', groupId: 'g_furniture', title: 'ลิ้นชักโต๊ะรับแขกค้าง', description: 'ดึงออกไม่ได้ ปิดก็ไม่สนิท ของข้างในติดข้างใน', photoSeed: 'DRAWER · RECEPTION', status: 'pending', createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'พลอย Front Desk' },
  { id: 'i10', groupId: 'g_it',        title: 'จอประชุมห้อง B ไม่รับสัญญาณ HDMI', description: 'เสียบสายแล้วขึ้น No Signal ต่อกับเครื่องอื่นก็ไม่ติด', photoSeed: 'MONITOR · ROOM B', status: 'pending', createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'ฟ้า ฝ่าย IT' },
  { id: 'i11', groupId: 'g_appliance', title: 'ไมโครเวฟห้อง pantry มีกลิ่นไหม้', description: 'ทุกครั้งที่อุ่นอาหารจะมีกลิ่นไหม้ปนออกมา ภายในยังสะอาด', photoSeed: 'MICROWAVE', status: 'pending', createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'เจน ฝ่ายบุคคล' },
  { id: 'i12', groupId: 'g_furniture', title: 'พรมหน้าห้องประชุม C เปื้อนกาแฟ', description: 'เปื้อนเป็นวงใหญ่ ลองเช็ดแล้วยังไม่ออก ขนาดประมาณ 30 ซม.', photoSeed: 'CARPET · STAIN', status: 'pending', createdMonth: '2026-05', carryOverCount: 0, lastReviewMonth: null, reporter: 'อาร์ม ฝ่ายดีไซน์' },
  // Resolved history
  { id: 'i90', groupId: 'g_electric',  title: 'เบรกเกอร์ห้อง server ทริปบ่อย', description: 'ฝ่ายอาคารเปลี่ยนเบรกเกอร์ใหม่แล้ว', photoSeed: 'BREAKER', status: 'resolved', createdMonth: '2026-03', carryOverCount: 1, lastReviewMonth: '2026-04', resolvedMonth: '2026-04', reporter: 'ก้อง วิศวกร' },
  { id: 'i91', groupId: 'g_it',        title: 'VPN ของฝ่ายขายเชื่อมต่อไม่ได้', description: 'อัปเดตคอนฟิกผ่านระบบ MDM เรียบร้อย', photoSeed: 'VPN', status: 'resolved', createdMonth: '2026-04', carryOverCount: 0, lastReviewMonth: '2026-04', resolvedMonth: '2026-04', reporter: 'ฟ้า ฝ่าย IT' },
  { id: 'i92', groupId: 'g_furniture', title: 'โต๊ะประชุมขาเสีย', description: 'ช่างเข้ามาเปลี่ยนน็อตและเสริมเหล็กยึด', photoSeed: 'TABLE · MEET', status: 'resolved', createdMonth: '2026-03', carryOverCount: 0, lastReviewMonth: '2026-03', resolvedMonth: '2026-03', reporter: 'เอ ฝ่าย Ops' },
  { id: 'i93', groupId: 'g_plumbing',  title: 'อ่างล้างหน้าตัน', description: 'ใช้น้ำยาขจัดสิ่งอุดตัน', photoSeed: 'SINK', status: 'resolved', createdMonth: '2026-02', carryOverCount: 0, lastReviewMonth: '2026-02', resolvedMonth: '2026-02', reporter: 'ตาล แม่บ้าน' },
  { id: 'i94', groupId: 'g_appliance', title: 'เครื่องถ่ายเอกสารกระดาษติด', description: 'ช่างมาบริการ และทำความสะอาดลูกกลิ้ง', photoSeed: 'COPIER', status: 'resolved', createdMonth: '2026-04', carryOverCount: 0, lastReviewMonth: '2026-04', resolvedMonth: '2026-04', reporter: 'พลอย ฝ่ายบัญชี' },
]

export const CURRENT_MONTH = '2026-05'
