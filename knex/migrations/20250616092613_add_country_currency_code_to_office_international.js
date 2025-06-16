/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('office_international', function(table) {
        table.integer('country_id').unsigned().nullable();
        table.integer('currency_id').unsigned().nullable();
        table.foreign('country_id').references('id').inTable('countries');
        table.foreign('currency_id').references('id').inTable('currencies');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('office_international', function(table) {
        table.dropForeign('country_id');
        table.dropForeign('currency_id');
        table.dropColumn('country_id');
        table.dropColumn('currency_id');
    });
};
