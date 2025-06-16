/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('international_moving_allowances', function(table) {
        table.increments('id').primary();
        table.string('office').notNullable();
        table.string('currency').notNullable();
        table.decimal('director_salary', 10, 2).notNullable();
        table.decimal('deputy_director_salary', 10, 2).notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('international_moving_allowances');
};
