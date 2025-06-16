/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('domestic_moving_allowances', function(table) {
        table.increments('id').primary();
        table.integer('distance_start_km').notNullable();
        table.integer('distance_end_km').notNullable();
        table.decimal('rate_baht', 10, 2).notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('domestic_moving_allowances');
};
