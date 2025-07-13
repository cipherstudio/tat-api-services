/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('report_accommodation', function (table) {
    table.increments('accommodation_id').primary(); // PK
    table.integer('form_id'); // FK
    table.string('type');
    table.float('price_per_day');
    table.integer('days');
    table.float('total');

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
  return knex.schema.dropTableIfExists('report_accommodation');
};
