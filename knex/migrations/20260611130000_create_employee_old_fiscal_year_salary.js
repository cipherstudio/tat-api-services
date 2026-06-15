/**
 * #305 — เก็บ snapshot เงินเดือน + ค่าจ้างทำงานวันหยุด/ภาษี ของ "ปีงบประมาณเก่า"
 *
 * หลังวันที่ 1 ต.ค. Oracle view (OP_MASTER_T / OP_LEVEL_SAL_R) จะคืนเงินเดือน "ปีงบใหม่"
 * ทำให้ข้อมูลปีงบเก่าหายไป แต่รายงานการเดินทางยังต้องใช้ปีงบเก่าสำหรับทริปที่เดินทางก่อน 1 ต.ค.
 * จึงเก็บ snapshot ปีงบเก่าไว้ในฐานข้อมูลของเราเอง (cron เก็บก่อน 1 ต.ค. ทุกปี)
 *
 * กฎ: พนักงาน 1 คน = 1 record ปีงบเก่าเท่านั้น (employee_code UNIQUE) — snapshot ปีถัดไปจะ update ทับ
 *
 * migration นี้ additive อย่างเดียว: สร้าง 2 ตารางใหม่ + seed ข้อมูล mock จาก incident #305
 * down ลบเฉพาะ 2 ตารางที่สร้างในไฟล์นี้เท่านั้น
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// ตารางค่าจ้างทำงานวันหยุด/ภาษี รายชั่วโมง (1-8) ตามเงินเดือนปีงบเก่า — [hour, work_pay, tax_rate]
// อ้างอิงเรตจาก holiday_work_rates ปัจจุบัน (ค่า hour 8 บางคน override ตามที่ระบุใน #305)
const RATE_BY_SALARY = {
  15000: [[1, 62, 1], [2, 125, 1], [3, 187, 2], [4, 250, 2], [5, 312, 3], [6, 375, 3], [7, 437, 4], [8, 500, 4]],
  15890: [[1, 66, 1], [2, 132, 1], [3, 198, 2], [4, 264, 2], [5, 331, 3], [6, 397, 4], [7, 463, 4], [8, 529, 5]],
  17830: [[1, 74, 1], [2, 148, 2], [3, 222, 3], [4, 297, 4], [5, 371, 5], [6, 445, 6], [7, 520, 7], [8, 594, 7]],
  22580: [[1, 94, 2], [2, 188, 4], [3, 282, 6], [4, 376, 8], [5, 470, 10], [6, 564, 12], [7, 658, 13], [8, 752, 15]],
  34040: [[1, 141, 4], [2, 283, 9], [3, 425, 13], [4, 567, 17], [5, 709, 22], [6, 851, 26], [7, 992, 30], [8, 1134, 35]],
  73370: [[1, 305, 24], [2, 611, 47], [3, 917, 71], [4, 1222, 95], [5, 1528, 118], [6, 1834, 142], [7, 2139, 165], [8, 2445, 189]],
  75170: [[1, 313, 25], [2, 626, 50], [3, 939, 74], [4, 1252, 99], [5, 1566, 124], [6, 1879, 149], [7, 2192, 173], [8, 2505, 198]],
  80560: [[1, 335, 29], [2, 671, 57], [3, 1006, 86], [4, 1342, 114], [5, 1678, 143], [6, 2013, 171], [7, 2349, 200], [8, 2684, 228]],
  82400: [[1, 343, 30], [2, 686, 60], [3, 1029, 90], [4, 1373, 120], [5, 1716, 150], [6, 2059, 180], [7, 2402, 210], [8, 2746, 240]],
  86110: [[1, 358, 34], [2, 717, 67], [3, 1076, 101], [4, 1435, 135], [5, 1793, 169], [6, 2152, 202], [7, 2511, 236], [8, 2870, 270]],
  99970: [[1, 416, 46], [2, 833, 92], [3, 1249, 138], [4, 1666, 184], [5, 2082, 230], [6, 2499, 276], [7, 2915, 322], [8, 3332, 368]],
};

// ข้อมูล mock พนักงานปีงบเก่า จาก #305 (h8 = override ค่า hour 8 [work_pay, tax_rate] ถ้าต่างจากเรตปัจจุบัน)
const FISCAL_YEAR_OLD = 2568;
const EMPLOYEES = [
  { code: '66019', name: 'นางสาว พิชญา แสงธูป', level: '4', position: 'พนักงานประชาสัมพันธ์', salary: 15890 },
  { code: '65027', name: 'นางสาว ธิดาชล สร้อยสม', level: '4', position: 'เลขานุการ', salary: 17830 },
  { code: '62040', name: 'นาย บุณยสิทธิ์ อรุณพิทักษ์กุล', level: '5', position: 'พนักงานการเงิน', salary: 22580 },
  { code: '53023', name: 'นาย นิมิตดี ศรีพงษ์', level: '7', position: 'ด้านนโยบาย', salary: 34040 },
  { code: '39034', name: 'นางสาว รัชนี ลดาวิพัฒน์', level: '7', position: null, salary: 75170 },
  { code: '35010', name: 'นางสาว อโนมา วงษ์ใหญ่', level: '8', position: null, salary: 82400, h8: [2746, 245] },
  { code: '38039', name: 'นาย นรินทร์ ทิจะยัง', level: '9', position: 'ผู้อำนวยการฝ่าย', salary: 73370 },
  { code: '65028', name: 'นางสาว อรกานต์ วัฒนกิตติคุณ', level: null, position: null, salary: 17830, h8: [577, 7] },
  { code: '34051', name: 'นาง พรทิตย์ เล็กสมฤทธิ์', level: null, position: null, salary: 99970 },
  { code: '36038', name: 'นาง พิไล บุญทองสังข์', level: '8', position: null, salary: 86110 },
  { code: '37070', name: 'นาย อัครวิชย์ เทพาสิต', level: '10', position: null, salary: 80560, h8: [2685, 233] },
  { code: '67804', name: 'นางสาว รฐา จรเจนวุฒิ', level: null, position: 'ลูกจ้าง', salary: 15000 },
];

exports.up = async function (knex) {
  await knex.schema.createTable('employee_old_fiscal_year_salary', function (table) {
    table.increments('id').primary();
    table.string('employee_code', 64).notNullable().unique();
    table.string('employee_name', 255).nullable();
    table.string('level_code', 32).nullable();
    table.string('position_name', 500).nullable();
    table.decimal('salary', 10, 2).notNullable();
    table.integer('fiscal_year').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('employee_old_fiscal_year_holiday_hours', function (table) {
    table.increments('id').primary();
    table
      .integer('salary_id')
      .notNullable()
      .references('id')
      .inTable('employee_old_fiscal_year_salary')
      .onDelete('CASCADE');
    table.integer('hour').notNullable().checkBetween([1, 8]);
    table.decimal('work_pay', 10, 2).notNullable();
    table.decimal('tax_rate', 10, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // seed ข้อมูล mock #305
  for (const emp of EMPLOYEES) {
    const baseHours = RATE_BY_SALARY[emp.salary];
    if (!baseHours) continue;

    await knex('employee_old_fiscal_year_salary').insert({
      employee_code: emp.code,
      employee_name: emp.name,
      level_code: emp.level,
      position_name: emp.position,
      salary: emp.salary,
      fiscal_year: FISCAL_YEAR_OLD,
    });

    const inserted = await knex('employee_old_fiscal_year_salary')
      .where('employee_code', emp.code)
      .first();
    const salaryId = inserted.id;

    const hourRows = baseHours.map(([hour, workPay, taxRate]) => {
      if (emp.h8 && hour === 8) {
        return { salary_id: salaryId, hour, work_pay: emp.h8[0], tax_rate: emp.h8[1] };
      }
      return { salary_id: salaryId, hour, work_pay: workPay, tax_rate: taxRate };
    });

    await knex('employee_old_fiscal_year_holiday_hours').insert(hourRows);
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('employee_old_fiscal_year_holiday_hours');
  await knex.schema.dropTableIfExists('employee_old_fiscal_year_salary');
};
