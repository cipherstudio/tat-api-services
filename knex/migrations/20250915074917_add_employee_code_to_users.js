/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasEmployeeCode = await knex.schema.hasColumn('users', 'employee_code');
  
  if (!hasEmployeeCode) {
    return knex.schema.alterTable('users', function(table) {
      table.string('employee_code').nullable();
    });
  } else {
    console.log('employee_code column already exists in users table');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasEmployeeCode = await knex.schema.hasColumn('users', 'employee_code');
  
  if (hasEmployeeCode) {
    return knex.schema.alterTable('users', function(table) {
      table.dropColumn('employee_code');
    });
  } else {
    console.log('employee_code column does not exist in users table');
  }
};
