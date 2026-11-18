/**
 * #477/#478: คำขอเพิ่มเติม/เปลี่ยนแปลง/ยกเลิก = approval ที่ duplicate จากใบอนุมัติเดิม
 * is_change_request: flag ว่าเป็นคำขอแบบนี้
 * change_request_seq: ลำดับครั้งที่ของคำขอภายใต้ใบอนุมัติต้นทาง (ใช้เป็น print revision)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasFlag = await knex.schema.hasColumn('approval', 'is_change_request');
  const hasSeq = await knex.schema.hasColumn('approval', 'change_request_seq');
  if (hasFlag && hasSeq) return;
  await knex.schema.alterTable('approval', function (table) {
    if (!hasFlag) table.boolean('is_change_request').defaultTo(false);
    if (!hasSeq) table.integer('change_request_seq').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasFlag = await knex.schema.hasColumn('approval', 'is_change_request');
  const hasSeq = await knex.schema.hasColumn('approval', 'change_request_seq');
  if (!hasFlag && !hasSeq) return;
  await knex.schema.alterTable('approval', function (table) {
    if (hasFlag) table.dropColumn('is_change_request');
    if (hasSeq) table.dropColumn('change_request_seq');
  });
};
