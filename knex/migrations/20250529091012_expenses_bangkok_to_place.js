/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('expenses_bangkok_to_place', (table) => {
        table.increments('id').primary();
        table.integer('amphur_id').references('id').inTable('amphurs');
        table.integer('place_id').references('id').inTable('places');
        table.decimal('rate', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('expenses_bangkok_to_place');
};
