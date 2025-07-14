/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('report_other_expense', function (table) {
    table.increments('expense_id').primary(); // PK
    table.integer('form_id'); // FK
    table.string('name');
    table.float('amount');
    table.string('certificate_file_path');

    // Foreign key constraint (ถ้ามีตาราง form)
    table
      .foreign('form_id')
      .references('form_id')
      .inTable('report_traveller_form');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('report_other_expense');
};
