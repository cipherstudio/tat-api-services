/**
 * เพิ่มคอลumns soft delete บน approval_clothing_expense
 * - is_cancelled : boolean flag (ยกเลิกแล้ว)
 * - cancelled_at : timestamp ที่ถูกยกเลิก
 * - cancellation_request_id : FK กลับ clothing_expense_cancellation_requests
 */
exports.up = async function (knex) {
  const hasIsCancelled = await knex.schema.hasColumn(
    'approval_clothing_expense',
    'is_cancelled',
  );

  if (!hasIsCancelled) {
    await knex.schema.alterTable('approval_clothing_expense', (table) => {
      table.boolean('is_cancelled').notNullable().defaultTo(false);
      table.timestamp('cancelled_at').nullable();
      table.integer('cancellation_request_id').nullable();
    });
  }

  try {
    await knex.schema.alterTable('approval_clothing_expense', (table) => {
      table.index('is_cancelled', 'idx_ace_is_cancelled');
    });
  } catch (err) {
    if (!err.message?.includes('ORA-01408')) {
      throw err;
    }
  }
};

exports.down = async function (knex) {
  try {
    await knex.schema.alterTable('approval_clothing_expense', (table) => {
      table.dropIndex('is_cancelled', 'idx_ace_is_cancelled');
    });
  } catch {
    // index may not exist
  }

  const hasIsCancelled = await knex.schema.hasColumn(
    'approval_clothing_expense',
    'is_cancelled',
  );
  if (hasIsCancelled) {
    await knex.schema.alterTable('approval_clothing_expense', (table) => {
      table.dropColumn('is_cancelled');
      table.dropColumn('cancelled_at');
      table.dropColumn('cancellation_request_id');
    });
  }
};
