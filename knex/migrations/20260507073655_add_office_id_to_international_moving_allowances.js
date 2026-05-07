/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable(
    'international_moving_allowances',
    function(table) {
      table.integer('office_id').unsigned().nullable();
      table.index('office_id');
      table
        .foreign('office_id')
        .references('id')
        .inTable('office_international')
        .onUpdate('CASCADE')
        .onDelete('SET NULL');
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable(
    'international_moving_allowances',
    function(table) {
      table.dropForeign('office_id');
      table.dropIndex('office_id');
      table.dropColumn('office_id');
    },
  );
};
