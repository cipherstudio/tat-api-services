const per_diem_rates = [
  // ======================================================
  // =============== DOMESTIC TRAVEL RULES ================
  // ======================================================
  {
    "position_group": "คณะกรรมการ",
    "position_name": "ประธานกรรมการ, กรรมการ, ผู้ว่าการ, รองผู้ว่าการ",
    "level_code_start": null,
    "level_code_end": null,
    "area_type": "OUT", // นอกเขตพื้นที่
    "per_diem_standard": 410,
    "is_editable_per_diem": true,
    "max_per_diem": null
  },
  {
    "position_group": "พนักงานระดับ 9 ขึ้นไป",
    "position_name": null,
    "level_code_start": "09",
    "level_code_end": "11",
    "area_type": "OUT",
    "per_diem_standard": 410,
    "is_editable_per_diem": true,
    "max_per_diem": null
  },
  {
    "position_group": "พนักงานระดับ 8 ลงมา และลูกจ้าง",
    "position_name": null,
    "level_code_start": "01",
    "level_code_end": "08",
    "area_type": "OUT",
    "per_diem_standard": 350,
    "is_editable_per_diem": false,
    "max_per_diem": 350
  },
  {
    "position_group": "คณะกรรมการ",
    "position_name": "ประธานกรรมการ, กรรมการ, ผู้ว่าการ, รองผู้ว่าการ",
    "level_code_start": null,
    "level_code_end": null,
    "area_type": "IN", // ในเขตพื้นที่
    "per_diem_standard": 246, // 60% of 410
    "is_editable_per_diem": true,
    "max_per_diem": null
  },
  {
    "position_group": "พนักงานระดับ 9 ขึ้นไป",
    "position_name": null,
    "level_code_start": "09",
    "level_code_end": "11",
    "area_type": "IN",
    "per_diem_standard": 246,
    "is_editable_per_diem": true,
    "max_per_diem": null
  },
  {
    "position_group": "พนักงานระดับ 8 ลงมา และลูกจ้าง",
    "position_name": null,
    "level_code_start": "01",
    "level_code_end": "08",
    "area_type": "IN",
    "per_diem_standard": 210, // 60% of 350
    "is_editable_per_diem": false,
    "max_per_diem": 210
  },
  // ======================================================
  // ============== INTERNATIONAL TRAVEL RULES ============
  // ======================================================
  {
    "position_group": "คณะกรรมการ",
    "position_name": "ประธานกรรมการ, กรรมการ, ผู้ว่าการ, รองผู้ว่าการ",
    "level_code_start": null,
    "level_code_end": null,
    "area_type": "ABROAD",
    "per_diem_standard": 3100,
    "is_editable_per_diem": true,
    "max_per_diem": 4500
  },
  {
    "position_group": "พนักงานระดับ 9 ขึ้นไป",
    "position_name": null,
    "level_code_start": "09",
    "level_code_end": "11",
    "area_type": "ABROAD",
    "per_diem_standard": 3100,
    "is_editable_per_diem": true,
    "max_per_diem": 4500
  },
  {
    "position_group": "พนักงานระดับ 8 ลงมา และลูกจ้าง",
    "position_name": null,
    "level_code_start": "01",
    "level_code_end": "08",
    "area_type": "ABROAD",
    "per_diem_standard": 2100,
    "is_editable_per_diem": true,
    "max_per_diem": 4500
  }
];

module.exports = per_diem_rates;