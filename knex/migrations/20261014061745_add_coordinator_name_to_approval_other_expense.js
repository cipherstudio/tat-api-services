/**
 * #458 — ค่าเลี้ยงรับรองแบบ "พนักงานที่ได้รับมอบหมายให้ประสานงาน..." ต้องเก็บชื่อพนักงานผู้ประสานงานด้วย
 * เดิม (#419) ชื่อผู้ประสานงานอยู่แค่ใน state ฝั่งหน้าเว็บ เปิดร่างกลับมาแล้วหาย
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('approval_other_expense', function (table) {
    table.string('coordinator_name', 1000).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('approval_other_expense', function (table) {
    table.dropColumn('coordinator_name');
  });
};
