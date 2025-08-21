/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    'report_certificate',
    function (table) {
      // Primary key
      table.bigIncrements('id').primary();

      // Employee information
      table.string('employee_type', 100).comment('ประเภทพนักงาน');
      table.string('employee_code', 50).nullable().comment('รหัสพนักงาน');
      table.string('employee_name', 255).notNullable().comment('ชื่อพนักงาน');
      table.string('employee_position', 255).comment('ตำแหน่งพนักงาน');
      table.string('job', 255).comment('งาน');
      table.string('section', 255).comment('ส่วนงาน');
      table.string('department', 255).comment('แผนก');
      table.text('address').comment('ที่อยู่');

      // Time information
      table.string('time_out', 10).comment('เวลาออก');
      table.string('time_in', 10).comment('เวลาเข้า');

      // Amount
      table
        .decimal('total_amount', 15, 2)
        .notNullable()
        .defaultTo(0.0)
        .comment('จำนวนเงินรวม');

      // Audit fields
      table.string('created_by', 100).comment('สร้างโดย');
      table.timestamp('created_at').defaultTo(knex.fn.now()).comment('สร้างเมื่อ');
      table.string('updated_by', 100).comment('แก้ไขโดย');
      table.timestamp('updated_at').defaultTo(knex.fn.now()).comment('แก้ไขเมื่อ');
      table.timestamp('deleted_at').nullable().comment('ลบเมื่อ');

      // Indexes
      table.index(['employee_code']);
      table.index(['employee_type']);
      table.index(['department']);
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('report_certificate');
};
