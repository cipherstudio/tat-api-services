/**
 * #356 — เทสไม่ผ่าน: หน้า master-data รายการค่าที่พักฝึกอบรม ขาด ชื่อตำแหน่ง/ตั้งแต่ระดับ/ถึงระดับ/
 * ประเภทการเบิก/กลุ่มประเทศฝึกอบรม/อัตราเหมาจ่าย เทียบกับ "รายการค่าที่พัก" ปกติ
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('training_accommodation_rates', function (table) {
    table.string('position_name');
    table.string('level_code_start');
    table.string('level_code_end');
    table.string('position_group_name');
    table.enum('rate_mode', ['CHOICE', 'ACTUAL_ONLY', 'UNLIMITED']).defaultTo('CHOICE');
    table.enum('country_type', ['A', 'B']);
    table.decimal('flat_rate_amount', 10, 2);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('training_accommodation_rates', function (table) {
    table.dropColumn('position_name');
    table.dropColumn('level_code_start');
    table.dropColumn('level_code_end');
    table.dropColumn('position_group_name');
    table.dropColumn('rate_mode');
    table.dropColumn('country_type');
    table.dropColumn('flat_rate_amount');
  });
};
