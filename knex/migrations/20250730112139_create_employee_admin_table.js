/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('employee_admin', function (table) {
    table.increments('id').primary();

    // ข้อมูลจาก OP_MASTER_T
    table.string('pmt_code').notNullable(); // PMT_CODE จาก OP_MASTER_T
    table.string('employee_code').notNullable(); // รหัสพนักงาน
    table.string('employee_name').notNullable(); // ชื่อพนักงาน
    table.string('position').nullable(); // ตำแหน่ง
    table.string('department').nullable(); // แผนก
    table.string('division').nullable(); // กอง
    table.string('section').nullable(); // ฝ่าย

    // ข้อมูลสถานะ
    table.boolean('is_active').defaultTo(true); // สถานะการใช้งาน
    table.boolean('is_suspended').defaultTo(false); // สถานะการระงับ
    table.timestamp('suspended_until').nullable(); // วันที่ระงับจนถึง

    // ข้อมูลการสร้างและอัพเดท
    table.string('created_by').nullable(); // สร้างโดย
    table.string('updated_by').nullable(); // อัพเดทโดย
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable(); // Soft delete

    // Indexes
    table.index(['pmt_code']);
    table.index(['employee_code']);
    table.index(['is_active']);
    table.index(['created_at']);

    // Unique constraints
    table.unique(['pmt_code']);
    table.unique(['employee_code']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('employee_admin');
};
