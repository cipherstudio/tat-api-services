/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval_accommodation_expense', function(table) {
    // Allowance rights columns - ค่าสิทธิ์ที่ user แก้ไขได้
    table.decimal('allowance_out_rights', 10, 2).nullable().comment('ค่าสิทธิ์ที่ user แก้ไขสำหรับเบี้ยเลี้ยงนอกพื้นที่ตั้งสำนักงาน (ต่างจังหวัด)');
    table.decimal('allowance_in_rights', 10, 2).nullable().comment('ค่าสิทธิ์ที่ user แก้ไขสำหรับเบี้ยเลี้ยงในเขตพื้นที่ตั้งสำนักงาน');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval_accommodation_expense', function(table) {
    // Drop allowance rights columns
    table.dropColumn('allowance_out_rights');
    table.dropColumn('allowance_in_rights');
  });
};

