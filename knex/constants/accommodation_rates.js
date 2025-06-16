const accommodationRates = [
  // ======================================================
  // =============== DOMESTIC TRAVEL RULES ================
  // ======================================================
  {
    "travel_type": "DOMESTIC",
    "position_name": "ประธานกรรมการ, กรรมการ",
    "level_code_start": null,
    "level_code_end": null,
    "position_group_name": "ประธานกรรมการ, กรรมการ",
    "rate_mode": "UNLIMITED",
    "country_type": null,
    "flat_rate_amount": null,
    "single_room_amount": null,
    "double_room_percentage": null
  },
  {
    "travel_type": "DOMESTIC",
    "position_name": "ผู้ว่าการ, รองผู้ว่าการ",
    "level_code_start": "09",
    "level_code_end": "11",
    "position_group_name": "ผู้ว่าการ, รองผู้ว่าการ และพนักงานระดับ 9 ขึ้นไป",
    "rate_mode": "UNLIMITED",
    "country_type": null,
    "flat_rate_amount": null,
    "single_room_amount": null,
    "double_room_percentage": null
  },
  {
    "travel_type": "DOMESTIC",
    "position_name": null,
    "level_code_start": "03",
    "level_code_end": "08",
    "position_group_name": "พนักงานระดับ 8 ลงมา, ลูกจ้าง, ลูกจ้างต่างประเทศ",
    "rate_mode": "CHOICE",
    "country_type": null,
    "flat_rate_amount": 1000.00,
    "single_room_amount": 1450.00,
    "double_room_percentage": 70
  },
  // ======================================================
  // ============== INTERNATIONAL TRAVEL RULES ============
  // ======================================================
  {
    "travel_type": "INTERNATIONAL",
    "position_name": "ประธานกรรมการ, กรรมการ, ผู้ว่าการ",
    "level_code_start": null,
    "level_code_end": null,
    "position_group_name": "ประธานกรรมการ, กรรมการ, ผู้ว่าการ",
    "rate_mode": "UNLIMITED",
    "country_type": null,
    "flat_rate_amount": null,
    "single_room_amount": null,
    "double_room_percentage": null
  },
  {
    "travel_type": "INTERNATIONAL",
    "position_name": "รองผู้ว่าการ",
    "level_code_start": "09",
    "level_code_end": "11",
    "position_group_name": "รองผู้ว่าการ และพนักงานระดับ 9 ขึ้นไป",
    "rate_mode": "ACTUAL_ONLY",
    "country_type": "A",
    "flat_rate_amount": null,
    "single_room_amount": 10000.00,
    "double_room_percentage": 70
  },
  {
    "travel_type": "INTERNATIONAL",
    "position_name": "รองผู้ว่าการ",
    "level_code_start": "09",
    "level_code_end": "11",
    "position_group_name": "รองผู้ว่าการ และพนักงานระดับ 9 ขึ้นไป",
    "rate_mode": "ACTUAL_ONLY",
    "country_type": "B",
    "flat_rate_amount": null,
    "single_room_amount": 7000.00,
    "double_room_percentage": 70
  },
  {
    "travel_type": "INTERNATIONAL",
    "position_name": "รองผู้ว่าการ",
    "level_code_start": "09",
    "level_code_end": "11",
    "position_group_name": "รองผู้ว่าการ และพนักงานระดับ 9 ขึ้นไป",
    "rate_mode": "ACTUAL_ONLY",
    "country_type": null,
    "flat_rate_amount": null,
    "single_room_amount": 4500.00,
    "double_room_percentage": 70
  },
  {
    "travel_type": "INTERNATIONAL",
    "position_name": null,
    "level_code_start": "03",
    "level_code_end": "08",
    "position_group_name": "พนักงานระดับ 8 ลงมา หรือลูกจ้าง",
    "rate_mode": "ACTUAL_ONLY",
    "country_type": "A",
    "flat_rate_amount": null,
    "single_room_amount": 7500.00,
    "double_room_percentage": 70
  },
  {
    "travel_type": "INTERNATIONAL",
    "position_name": null,
    "level_code_start": "03",
    "level_code_end": "08",
    "position_group_name": "พนักงานระดับ 8 ลงมา หรือลูกจ้าง",
    "rate_mode": "ACTUAL_ONLY",
    "country_type": "B",
    "flat_rate_amount": null,
    "single_room_amount": 5000.00,
    "double_room_percentage": 70
  },
  {
    "travel_type": "INTERNATIONAL",
    "position_name": null,
    "level_code_start": "03",
    "level_code_end": "08",
    "position_group_name": "พนักงานระดับ 8 ลงมา หรือลูกจ้าง",
    "rate_mode": "ACTUAL_ONLY",
    "country_type": null,
    "flat_rate_amount": null,
    "single_room_amount": 3100.00,
    "double_room_percentage": 70
  },
];

module.exports = accommodationRates;