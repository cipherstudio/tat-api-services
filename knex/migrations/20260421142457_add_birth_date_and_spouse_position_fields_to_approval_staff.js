/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('approval_staff_members', (table) => {
    /** วันเกิดผู้เดินทาง (เช่น บุตร) รูปแบบ yyyy-mm-dd */
    table.string('birth_date', 32).nullable();
  });
  await knex.schema.alterTable(
    'approval_staff_member_spouse_companion',
    (table) => {
      table.string('spouse_position_text', 500).nullable();
      table.string('spouse_level_text', 500).nullable();
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable(
    'approval_staff_member_spouse_companion',
    (table) => {
      table.dropColumn('spouse_position_text');
      table.dropColumn('spouse_level_text');
    },
  );
  await knex.schema.alterTable('approval_staff_members', (table) => {
    table.dropColumn('birth_date');
  });
};
