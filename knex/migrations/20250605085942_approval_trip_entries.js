/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_trip_entries', function(table) {
    table.increments('id').primary();
    table.string('location').nullable();

    table.string('destination').nullable();
    table.boolean('nearby_provinces').defaultTo(false);
    table.text('details').nullable();
    //table.boolean('checked').nullable;
    table.enum('destination_type', ['domestic', 'international']).nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.integer('approval_id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_trip_entries');
};
