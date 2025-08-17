const attire_allowance_rates = [
    // ===== การเดินทางปฏิบัติงานชั่วคราวในต่างประเทศ =====
    // หมายเหตุ: ประเทศใน TEMP_EXEMPTED จะไม่มีอัตราเลย (ไม่มีสิทธิ์เบิก)
    // อัตราด้านล่างใช้สำหรับประเทศอื่นๆ ที่ไม่อยู่ใน TEMP_EXEMPTED (default)
    {
      "assignment_type": "TEMPORARY",
      "position_name": "พนักงานระดับ 6 ขึ้นไป",
      "level_code_start": '6',
      "level_code_end": '11',
      "destination_group_code": null, // default สำหรับประเทศที่ไม่อยู่ใน TEMP_EXEMPTED
      "rate_thb": 9000.00,
      "spouse_rate_thb": 0,
      "child_rate_thb": 0
    },
    {
      "assignment_type": "TEMPORARY",
      "position_name": "พนักงานระดับ 5 ลงมา หรือลูกจ้าง",
      "level_code_start": '1',
      "level_code_end": '5',
      "destination_group_code": null, // default สำหรับประเทศที่ไม่อยู่ใน TEMP_EXEMPTED
      "rate_thb": 7500.00,
      "spouse_rate_thb": 0,
      "child_rate_thb": 0
    },

    // ===== การเดินทางปฏิบัติงานประจำในต่างประเทศ =====
    
    // ประเทศประเภท ก (default สำหรับประเทศที่ไม่อยู่ใน PERM_B)
    {
      "assignment_type": "PERMANENT",
      "position_name": "พนักงานระดับ 10 ขึ้นไป",
      "level_code_start": '10',
      "level_code_end": '11',
      "destination_group_code": null, // default สำหรับประเทศที่ไม่อยู่ใน PERM_B
      "rate_thb": 60000.00,
      "spouse_rate_thb": 40000.00,
      "child_rate_thb": 18000.00
    },
    {
      "assignment_type": "PERMANENT",
      "position_name": "พนักงานระดับ 6-9",
      "level_code_start": '6',
      "level_code_end": '9',
      "destination_group_code": null, // default สำหรับประเทศที่ไม่อยู่ใน PERM_B
      "rate_thb": 45000.00,
      "spouse_rate_thb": 30000.00,
      "child_rate_thb": 15000.00
    },
    {
      "assignment_type": "PERMANENT",
      "position_name": "พนักงานระดับ 5 ลงมา",
      "level_code_start": '1',
      "level_code_end": '5',
      "destination_group_code": null, // default สำหรับประเทศที่ไม่อยู่ใน PERM_B
      "rate_thb": 40000.00,
      "spouse_rate_thb": 25000.00,
      "child_rate_thb": 14000.00
    },

    // ประเทศประเภท ข (exception case - ระบุเฉพาะประเทศใน PERM_B)
    {
      "assignment_type": "PERMANENT",
      "position_name": "พนักงานระดับ 10 ขึ้นไป",
      "level_code_start": '10',
      "level_code_end": '11',
      "destination_group_code": "PERM_B",
      "rate_thb": 40000.00,
      "spouse_rate_thb": 30000.00,
      "child_rate_thb": 15000.00
    },
    {
      "assignment_type": "PERMANENT",
      "position_name": "พนักงานระดับ 6-9",
      "level_code_start": '6',
      "level_code_end": '9',
      "destination_group_code": "PERM_B",
      "rate_thb": 32000.00,
      "spouse_rate_thb": 20000.00,
      "child_rate_thb": 10000.00
    },
    {
      "assignment_type": "PERMANENT",
      "position_name": "พนักงานระดับ 5 ลงมา",
      "level_code_start": '1',
      "level_code_end": '5',
      "destination_group_code": "PERM_B",
      "rate_thb": 30000.00,
      "spouse_rate_thb": 18000.00,
      "child_rate_thb": 9000.00
    }
];

module.exports = attire_allowance_rates;