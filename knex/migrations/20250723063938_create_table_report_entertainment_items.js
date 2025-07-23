/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    'report_entertainment_items',
    function (table) {
      // Primary key
      table.bigIncrements('id').primary();

      // Foreign key to report_entertainment_form
      table.bigInteger('report_id').unsigned().notNullable();
      table
        .foreign('report_id')
        .references('id')
        .inTable('report_entertainment_form')
        .onDelete('CASCADE');

      // รายละเอียดการเลี้ยงรับรอง
      table.text('description').comment('รายละเอียดการเลี้ยงรับรอง');
      table.string('people_count', 50).comment('จำนวนคน');
      table.string('venue', 255).notNullable().comment('สถานที่เลี้ยงรับรอง');
      table.date('event_date').notNullable().comment('วันที่จัดงาน');
      table.text('purpose').comment('วัตถุประสงค์/เนื่องในโอกาส');

      // ข้อมูลใบเสร็จ
      table.string('receipt_number', 100).comment('เลขที่ใบเสร็จ');
      table.string('receipt_book', 50).comment('เล่มที่ใบเสร็จ');
      table
        .decimal('amount', 15, 2)
        .notNullable()
        .defaultTo(0.0)
        .comment('จำนวนเงิน');
      table.string('amount_text', 500).comment('จำนวนเงินตัวอักษร');

      // ลำดับการแสดงผล
      table.integer('display_order').defaultTo(0);
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('report_entertainment_items');
};
