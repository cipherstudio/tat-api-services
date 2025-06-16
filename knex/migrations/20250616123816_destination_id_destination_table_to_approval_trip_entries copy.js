/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval_trip_entries', function(table) {
    table.integer('destination_id').nullable();
    table.string('destination_table').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval_trip_entries', function(table) {
    table.dropColumn('destination_id');
    table.dropColumn('destination_table');
  });
};
