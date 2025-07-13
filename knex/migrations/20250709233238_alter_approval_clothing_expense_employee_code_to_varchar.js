/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('approval_clothing_expense', (table) => {
    table.string('employee_code_temp', 255).nullable();
  });

  await knex('approval_clothing_expense')
    .whereNotNull('employee_code')
    .update({
      employee_code_temp: knex.raw('CAST("employee_code" AS VARCHAR2(255))')
    });

  await knex.schema.alterTable('approval_clothing_expense', (table) => {
    table.dropColumn('employee_code');
  });

  await knex.schema.alterTable('approval_clothing_expense', (table) => {
    table.renameColumn('employee_code_temp', 'employee_code');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('approval_clothing_expense', (table) => {
    table.integer('employee_code_temp').nullable();
  });

  await knex('approval_clothing_expense')
    .whereRaw("REGEXP_LIKE(\"employee_code\", '^[0-9]+$')")
    .update({
      employee_code_temp: knex.raw('TO_NUMBER("employee_code")')
    });

  await knex.schema.alterTable('approval_clothing_expense', (table) => {
    table.dropColumn('employee_code');
  });

  await knex.schema.alterTable('approval_clothing_expense', (table) => {
    table.renameColumn('employee_code_temp', 'employee_code');
  });
};
