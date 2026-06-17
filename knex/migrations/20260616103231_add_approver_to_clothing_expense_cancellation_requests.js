/**
 * #259.2 — เก็บชื่อแอดมินผู้กดอนุมัติคำขอยกเลิก
 * เดิม table เก็บแค่ creator_* (ผู้สร้างคำขอ) ไม่มีตัวตนผู้อนุมัติ
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasApprovedByCode = await knex.schema.hasColumn(
    'clothing_expense_cancellation_requests',
    'approved_by_code',
  );
  if (hasApprovedByCode) return;

  await knex.schema.alterTable(
    'clothing_expense_cancellation_requests',
    (table) => {
      table.string('approved_by_code').nullable();
      table.string('approved_by_name').nullable();
      table.timestamp('approved_at').nullable();
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasApprovedByCode = await knex.schema.hasColumn(
    'clothing_expense_cancellation_requests',
    'approved_by_code',
  );
  if (!hasApprovedByCode) return;

  await knex.schema.alterTable(
    'clothing_expense_cancellation_requests',
    (table) => {
      table.dropColumn('approved_by_code');
      table.dropColumn('approved_by_name');
      table.dropColumn('approved_at');
    },
  );
};
