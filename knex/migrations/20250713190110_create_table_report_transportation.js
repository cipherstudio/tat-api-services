/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('report_transportation', function (table) {
    table.increments('transport_id').primary(); // PK
    table.integer('form_id'); // FK
    table.string('type');
    table.string('from_place');
    table.string('to_place');
    table.date('date');
    table.float('amount');
    table.string('receipt_file_path');

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
  return knex.schema.dropTableIfExists('report_transportation');
};
