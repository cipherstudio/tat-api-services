/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('approval_continuous', function(table) {
        table.increments('id').primary();
        table.string('employee_code').notNullable();
        table.integer('approval_id').notNullable();
        table.integer('approval_continuous_status_id').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('created_by').notNullable();
        table.integer('updated_by').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('approval_continuous');
};
