/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('entertainment_allowances', function (table) {
      table.increments('id').primary();
      table.string('title', 600).notNullable();
      table.integer('min_days').notNullable();
      table.integer('max_days').notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .then(function () {
      return knex.schema.createTable(
        'entertainment_allowance_levels',
        function (table) {
          table.increments('id').primary();
          table.integer('allowance_id').unsigned().notNullable();
          table.integer('position_level').notNullable();
          table
            .foreign('allowance_id', 'fk_allowance_level')
            .references('id')
            .inTable('entertainment_allowances')
            .onDelete('CASCADE');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        },
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('entertainment_allowance_levels')
    .then(function () {
      return knex.schema.dropTableIfExists('entertainment_allowances');
    });
};
