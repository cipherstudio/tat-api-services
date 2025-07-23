/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('entertainment_form_status', function (table) {
      table.increments('id').primary();
      table.string('name', 50).notNullable().unique();
      table.string('description', 255);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .then(function () {
      return knex.schema.createTable(
        'report_entertainment_form',
        function (table) {
          // Primary key
          table.bigIncrements('id').primary();

          // ข้อมูลผู้สร้างรายงาน
          table.string('employee_id', 50).notNullable().comment('รหัสพนักงาน');
          table
            .string('employee_name', 255)
            .notNullable()
            .comment('ชื่อพนักงาน');
          table
            .string('employee_position', 255)
            .notNullable()
            .comment('ตำแหน่งพนักงาน');

          // ข้อมูลองค์กร
          table
            .string('department', 255)
            .notNullable()
            .comment('ฝ่าย/สำนัก/ภูมิภาค');
          table.string('section', 255).comment('กอง/กลุ่ม/สำนักงาน');
          table.string('job', 255).notNullable().comment('งาน/โครงการ');

          // สถานะและข้อมูลระบบ
          table
            .integer('status_id')
            .unsigned()
            .references('id')
            .inTable('entertainment_form_status')
            .defaultTo(1);
          table
            .decimal('total_amount', 15, 2)
            .defaultTo(0.0)
            .comment('ยอดรวมทั้งหมด');

          // ข้อมูลการอนุมัติ
          table.string('approved_by', 50).comment('รหัสผู้อนุมัติ');
          table.timestamp('approved_at').nullable().comment('วันที่อนุมัติ');
          table.text('approved_comment').comment('ความคิดเห็นการอนุมัติ');

          // ข้อมูลการสร้างและอัปเดต
          table.string('created_by', 50).notNullable();
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.string('updated_by', 50);
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        },
      );
    })
    .then(function () {
      // Insert default status values
      return knex('entertainment_form_status').insert([
        { id: 1, name: 'draft', description: 'ร่าง' },
        { id: 2, name: 'pending', description: 'รอการอนุมัติ' },
        { id: 3, name: 'approved', description: 'อนุมัติแล้ว' },
        { id: 4, name: 'rejected', description: 'ไม่อนุมัติ' },
        { id: 5, name: 'cancelled', description: 'ยกเลิก' },
      ]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('report_entertainment_form').then(function () {
    return knex.schema.dropTable('entertainment_form_status');
  });
};
