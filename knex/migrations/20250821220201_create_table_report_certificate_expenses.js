/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    'report_certificate_expenses',
    function (table) {
      // Primary key
      table.bigIncrements('id').primary();

      // Reference to report_certificate
      table.bigInteger('report_certificate_id').unsigned().notNullable().comment('รหัสใบรับรอง');

      // Expense details
      table.text('detail').notNullable().comment('รายละเอียดค่าใช้จ่าย');
      table.date('expense_date').notNullable().comment('วันที่ค่าใช้จ่าย');
      table
        .decimal('amount', 15, 2)
        .notNullable()
        .defaultTo(0.0)
        .comment('จำนวนเงิน');

      // Display order
      table.integer('display_order').defaultTo(0).comment('ลำดับการแสดงผล');

      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now()).comment('สร้างเมื่อ');
      table.timestamp('updated_at').defaultTo(knex.fn.now()).comment('แก้ไขเมื่อ');

      // Indexes
      table.index(['report_certificate_id']);
      table.index(['expense_date']);
      table.index(['display_order']);
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('report_certificate_expenses');
};
