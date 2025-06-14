/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // รีเซ็ตและสร้าง per_diem_rates ใหม่
  await knex.schema.dropTableIfExists('per_diem_rates');
  await knex.schema.createTable('per_diem_rates', function (table) {
    table.increments('id').primary();
    table.string('position_group').notNullable();
    table.string('position_name').nullable();
    table.string('level_code_start').nullable();
    table.string('level_code_end').nullable();
    table.enu('area_type', ['IN', 'OUT', 'ABROAD']).notNullable();
    table.decimal('per_diem_standard', 10, 2).notNullable();
    table.boolean('is_editable_per_diem').notNullable().defaultTo(false);
    table.decimal('max_per_diem', 10, 2).nullable();
    table.timestamps(true, true);
  });
  // เพิ่ม column ให้ expenses_other_conditions
  await knex.schema.alterTable('expenses_other_conditions', (table) => {
    table.string('position_name').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // รีเซ็ต per_diem_rates กลับเป็นโครงสร้างเดิม
  await knex.schema.dropTableIfExists('per_diem_rates');
  await knex.schema.createTable('per_diem_rates', function (table) {
    table.increments('id').primary();
    table.string('position_title').nullable();
    table.string('level_code').nullable();
    table.enu('area_type', ['IN', 'OUT']).notNullable();
    table.decimal('per_diem_standard', 10, 2).notNullable();
    table.boolean('is_editable_per_diem').notNullable().defaultTo(false);
    table.decimal('max_per_diem', 10, 2).nullable();
    table.decimal('meal_deduction_per_meal', 10, 2).notNullable();
    table.boolean('is_editable_days').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
  // ลบ column ออกจาก expenses_other_conditions
  await knex.schema.alterTable('expenses_other_conditions', (table) => {
    table.dropColumn('position_name');
  });
};
