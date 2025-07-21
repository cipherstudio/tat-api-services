/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('expenses_other_conditions', (table) => {
    table.increments('id').primary();
    table
      .integer('expenses_other_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('expenses_other')
      .onDelete('CASCADE');
    table.string('position_code').nullable();
    table.string('level_code').nullable();
    table.enu('scope', ['domestic', 'international']).nullable();
    table.decimal('max_amount', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('expenses_other_conditions');
};
