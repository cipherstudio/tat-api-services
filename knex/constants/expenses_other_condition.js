const expensesOtherConditions = [
  // รองผู้ว่าการ และ C10
  {
    expenses_other_id: 4,
    position_code: '02', // รองผู้ว่าการ
    position_name: 'รองผู้ว่าการ',
    level_code: '10',
    scope: null,
    max_amount: 20000,
  },
  {
    expenses_other_id: 4,
    position_code: null, // C10
    position_name: null,
    level_code: '10',
    scope: null,
    max_amount: 20000,
  },

  // ผู้อำนวยการฝ่าย / สำนัก / ภูมิภาค / C9
  {
    expenses_other_id: 4,
    position_code: '05', // ผู้อำนวยการฝ่าย
    position_name: 'ผู้อำนวยการฝ่าย',
    level_code: '09',
    scope: null,
    max_amount: 10000,
  },
  {
    expenses_other_id: 4,
    position_code: '51', // ผู้อำนวยการสำนัก
    position_name: 'ผู้อำนวยการสำนัก',
    level_code: '09',
    scope: null,
    max_amount: 10000,
  },
  {
    expenses_other_id: 4,
    position_code: '45', // ผู้อำนวยการภูมิภาค
    position_name: 'ผู้อำนวยการภูมิภาค',
    level_code: '09',
    scope: null,
    max_amount: 10000,
  },
  {
    expenses_other_id: 4,
    position_code: null, // C9
    level_code: '09',
    scope: null,
    max_amount: 10000,
  },

  // ผู้อำนวยการสำนักงาน ททท. ต่างประเทศ
  {
    expenses_other_id: 4,
    position_code: '14',
    position_name: 'ผู้อำนวยการสำนักงาน ททท. ต่างประเทศ',
    level_code: '08',
    scope: 'international',
    max_amount: 8000,
  },
  {
    expenses_other_id: 4,
    position_code: '14',
    position_name: 'ผู้อำนวยการสำนักงาน ททท. ต่างประเทศ',
    level_code: '08',
    scope: 'domestic', // เดินทางมาปฏิบัติงานในไทย
    max_amount: 4000,
  },

  // รองผู้อำนวยการสำนักงาน ททท. ต่างประเทศ
  {
    expenses_other_id: 4,
    position_code: '65',
    position_name: 'รองผู้อำนวยการสำนักงาน ททท. ต่างประเทศ',
    level_code: '07',
    scope: 'international',
    max_amount: 4000,
  },
  {
    expenses_other_id: 4,
    position_code: '65',
    position_name: 'รองผู้อำนวยการสำนักงาน ททท. ต่างประเทศ',
    level_code: '07',
    scope: 'domestic', // เดินทางมาปฏิบัติงานในไทย
    max_amount: 2000,
  },

  // ผอ.กอง/กลุ่ม/รองผอ.ฝ่าย/ภูมิภาค
  {
    expenses_other_id: 4,
    position_code: '07', // ผอ.กอง
    position_name: 'ผอ.กอง',
    level_code: '08',
    scope: null,
    max_amount: 4000,
  },
  {
    expenses_other_id: 4,
    position_code: '53', // ผอ.กลุ่ม
    position_name: 'ผอ.กลุ่ม',
    level_code: '08',
    scope: null,
    max_amount: 4000,
  },
  {
    expenses_other_id: 4,
    position_code: '60', // รองผอ.ฝ่าย
    position_name: 'รองผอ.ฝ่าย',
    level_code: '08',
    scope: null,
    max_amount: 4000,
  },
  {
    expenses_other_id: 4,
    position_code: '62', // รองผอ.ภูมิภาค
    position_name: 'รองผอ.ภูมิภาค',
    level_code: '08',
    scope: null,
    max_amount: 4000,
  },

  // รองผู้อำนวยการสำนัก
  {
    expenses_other_id: 4,
    position_code: '65', // รองผอ.สำนัก
    position_name: 'รองผอ.สำนัก',
    level_code: '07',
    scope: null,
    max_amount: 2000,
  },
];

module.exports = expensesOtherConditions;
