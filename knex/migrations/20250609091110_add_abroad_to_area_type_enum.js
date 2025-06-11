/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('per_diem_rates', function(table) {
    table.enu('area_type', ['IN', 'OUT', 'ABROAD']).alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('per_diem_rates', function(table) {
    table.enu('area_type', ['IN', 'OUT']).alter();
  });
};
