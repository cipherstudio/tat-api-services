/**
 * ค่าเบี้ยเลี้ยงฝึกอบรม / ประชุม ของ "รายงานการเดินทาง" แยกออกจาก per_diem_rates
 *
 * เดิมทั้งเบี้ยเลี้ยงเดินทาง (ขออนุมัติเดินทาง Form4) และเบี้ยเลี้ยงฝึกอบรม/ประชุม
 * อ่านอัตราจากตาราง per_diem_rates ตัวเดียวกัน ทำให้ปรับอัตราของฝึกอบรม/ประชุม
 * แยกจากเบี้ยเลี้ยงเดินทางไม่ได้ ตารางนี้จึงถอดออกมาเป็นของตัวเอง
 *
 * โครงสร้างคอลัมน์เหมือน per_diem_rates ทุกอย่าง เพิ่มแค่ rate_type ('TRAINING' | 'MEETING')
 * เพื่อให้อัตราของฝึกอบรมกับประชุมต่างกันได้ในอนาคต (สูตรคำนวณยังเป็นตัวเดิม
 * — หักมื้อละ 1/3 ของเบี้ยเลี้ยง — ไม่ได้อยู่ในฐานข้อมูล)
 *
 * ข้อมูลตั้งต้นคัดลอกจาก per_diem_rates ทั้งสองประเภท ผู้ใช้จึงเห็นตัวเลขเท่าเดิม
 * ตั้งแต่วันแรกที่เปิดใช้
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable(
    'training_meeting_per_diem_rates',
    function (table) {
      table.increments('id').primary();
      table.enu('rate_type', ['TRAINING', 'MEETING']).notNullable();
      table.string('position_group').notNullable();
      table.string('position_name').nullable();
      table.string('level_code_start').nullable();
      table.string('level_code_end').nullable();
      table.enu('area_type', ['IN', 'OUT', 'ABROAD']).notNullable();
      table.decimal('per_diem_standard', 10, 2).notNullable();
      table.boolean('is_editable_per_diem').notNullable().defaultTo(false);
      table.decimal('max_per_diem', 10, 2).nullable();
      table.timestamps(true, true);
    },
  );

  const sourceRates = await knex('per_diem_rates').select(
    'position_group',
    'position_name',
    'level_code_start',
    'level_code_end',
    'area_type',
    'per_diem_standard',
    'is_editable_per_diem',
    'max_per_diem',
  );

  if (sourceRates.length === 0) {
    return;
  }

  const seeded = ['TRAINING', 'MEETING'].flatMap((rateType) =>
    sourceRates.map((rate) => ({ ...rate, rate_type: rateType })),
  );

  // แทรกทีละชุดกัน bind variable ของ Oracle เกินลิมิตเมื่อ per_diem_rates มีแถวเยอะ
  const CHUNK_SIZE = 100;
  for (let i = 0; i < seeded.length; i += CHUNK_SIZE) {
    await knex('training_meeting_per_diem_rates').insert(
      seeded.slice(i, i + CHUNK_SIZE),
    );
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('training_meeting_per_diem_rates');
};
