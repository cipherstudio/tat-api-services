/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    'report_settings',
    function (table) {
      // Primary key
      table.bigIncrements('id').primary();

      // Report settings fields
      table.string('report_name', 255).notNullable().comment('ชื่อรายงาน');
      table.string('code', 100).notNullable().comment('ตัวแปร');
      table.text('value').comment('ค่าการตั้งค่า');

      // Audit fields
      table.timestamp('created_at').defaultTo(knex.fn.now()).comment('สร้างเมื่อ');
      table.timestamp('updated_at').defaultTo(knex.fn.now()).comment('แก้ไขเมื่อ');

      // Indexes
      table.index(['code']);
      table.index(['report_name']);
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('report_settings');
};
