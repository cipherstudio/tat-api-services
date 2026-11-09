// Master data snapshot from UAT (TRASUAT), 2026-11-05.
// Table "attire_destination_groups", 3 rows.
module.exports = [
  {
    "id": 636,
    "group_code": "TEMP_EXEMPTED",
    "group_name": "ประเทศที่ไม่มีสิทธิ์เบิก (ชั่วคราว)",
    "assignment_type": "TEMPORARY",
    "description": "ประเทศที่ไม่มีสิทธิ์เบิกค่าเครื่องแต่งกายสำหรับการปฏิบัติงานชั่วคราว ยกเว้นกรณีจำเป็นหรือได้รับอนุมัติจากผู้ว่าการ",
  },
  {
    "id": 637,
    "group_code": "PERM_A",
    "group_name": "ประเภท ก.",
    "assignment_type": "PERMANENT",
    "description": "ประเทศประเภท ก สำหรับการปฏิบัติงานประจำ - อัตราเต็ม (ประเทศอื่นๆ ที่ไม่ได้จัดอยู่ในประเภทพิเศษ)",
  },
  {
    "id": 638,
    "group_code": "PERM_B",
    "group_name": "ประเภท ข.",
    "assignment_type": "PERMANENT",
    "description": "ประเทศที่กำหนดไว้เป็นประเภท ข สำหรับการปฏิบัติงานประจำ - มีอัตราต่ำกว่าประเทศประเภท ก",
  },
];
