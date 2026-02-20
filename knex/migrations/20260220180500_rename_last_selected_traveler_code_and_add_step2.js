/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasLastSelected = await knex.schema.hasColumn(
    'report_approve',
    'last_selected_traveler_code',
  );
  const hasStep1 = await knex.schema.hasColumn(
    'report_approve',
    'selected_traveler_code_step1',
  );
  const hasStep2 = await knex.schema.hasColumn(
    'report_approve',
    'selected_traveler_code_step2',
  );

  if (hasLastSelected && !hasStep1) {
    await knex.schema.alterTable('report_approve', (table) => {
      table.renameColumn('last_selected_traveler_code', 'selected_traveler_code_step1');
    });
  }

  if (!hasStep2) {
    await knex.schema.alterTable('report_approve', (table) => {
      table.string('selected_traveler_code_step2', 100).nullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasStep2 = await knex.schema.hasColumn(
    'report_approve',
    'selected_traveler_code_step2',
  );
  const hasStep1 = await knex.schema.hasColumn(
    'report_approve',
    'selected_traveler_code_step1',
  );

  if (hasStep2) {
    await knex.schema.alterTable('report_approve', (table) => {
      table.dropColumn('selected_traveler_code_step2');
    });
  }

  if (hasStep1) {
    await knex.schema.alterTable('report_approve', (table) => {
      table.renameColumn('selected_traveler_code_step1', 'last_selected_traveler_code');
    });
  }
};
