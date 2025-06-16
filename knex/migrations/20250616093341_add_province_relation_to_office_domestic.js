/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('office_domestic', function(table) {
        table.integer('province_id').unsigned().nullable();
        table.foreign('province_id').references('id').inTable('provinces');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('office_domestic', function(table) {
        table.dropForeign('province_id');
        table.dropColumn('province_id');
    });
};