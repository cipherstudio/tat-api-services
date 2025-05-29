/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('amphurs', function(table) {
        // Add foreign key to provinces table
        table.integer('province_id').unsigned();
        table.foreign('province_id').references('id').inTable('provinces');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('amphurs', function(table) {
        table.dropForeign(['province_id']);
        table.dropColumn('province_id');
    });
}; 