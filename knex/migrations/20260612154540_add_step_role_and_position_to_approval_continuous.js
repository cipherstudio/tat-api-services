/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('approval_continuous', (table) => {
    /** บทบาทของขั้นนี้: 'REVIEW' = ผู้เห็นชอบ, 'FINAL' = ผู้อนุมัติลำดับสุดท้าย */
    table.string('step_role', 16).nullable();
    /** ขั้นนี้ทำในฐานะตำแหน่งรักษาการ (จาก AB_DEPUTY) หรือไม่ */
    table.boolean('is_deputy_step').nullable();
    /** รหัสตำแหน่งที่ขั้นนี้เป็นตัวแทน (ตำแหน่งปกติ หรือ ตำแหน่งรักษาการ) */
    table.string('position_code', 100).nullable();
  });
  await knex.schema.alterTable('approval', (table) => {
    /** รหัสตำแหน่งของผู้อนุมัติลำดับสุดท้าย (ใช้แยกกรณีคนเดียวกันถือหลายตำแหน่ง) */
    table.string('final_staff_position_code', 100).nullable();
    /** ผู้อนุมัติลำดับสุดท้ายทำในฐานะตำแหน่งรักษาการหรือไม่ */
    table.boolean('final_staff_is_deputy').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('approval', (table) => {
    table.dropColumn('final_staff_position_code');
    table.dropColumn('final_staff_is_deputy');
  });
  await knex.schema.alterTable('approval_continuous', (table) => {
    table.dropColumn('step_role');
    table.dropColumn('is_deputy_step');
    table.dropColumn('position_code');
  });
};
