/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('accommodation_rates', function(table) {
        table.dropColumn('position_title');
        table.dropColumn('level_code');
        table.dropColumn('flat_rate_enabled');
        table.dropColumn('flat_rate_amount');
        table.dropColumn('single_room_enabled');
        table.dropColumn('single_room_amount');
        table.dropColumn('double_room_enabled');
        table.dropColumn('double_room_amount');
        table.dropColumn('is_editable_amount');
        table.dropColumn('is_editable_days');
    }).then(() => {
        return knex.schema.alterTable('accommodation_rates', function(table) {
            table.enum('travel_type', ['DOMESTIC', 'INTERNATIONAL']).notNullable();
            table.string('position_name').nullable(); 
            table.string('level_code_start').nullable();
            table.string('level_code_end').nullable();
            table.string('position_group_name').notNullable();
            table.enum('rate_mode', ['CHOICE', 'ACTUAL_ONLY', 'UNLIMITED']).notNullable();
            table.decimal('flat_rate_amount', 10, 2).nullable();
            table.decimal('single_room_amount', 10, 2).nullable();
            table.integer('double_room_percentage').nullable();
            table.index('travel_type');
            table.index('rate_mode');
        });
    }).then(() => {
        // Run the existing seed after migration
        return require('../seeds/12_accomodation_rates').seed(knex);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('accommodation_rates', function(table) {
        table.dropColumn('travel_type');
        table.dropColumn('position_name');
        table.dropColumn('level_code_start');
        table.dropColumn('level_code_end');
        table.dropColumn('position_group_name');
        table.dropColumn('rate_mode');
        table.dropColumn('flat_rate_amount');
        table.dropColumn('single_room_amount');
        table.dropColumn('double_room_percentage');
        table.dropIndex('travel_type');
        table.dropIndex('rate_mode');
    }).then(() => {
        return knex.schema.alterTable('accommodation_rates', function(table) {
            table.string('position_title', 100).notNullable();
            table.string('level_code', 10).nullable();
            table.boolean('flat_rate_enabled').defaultTo(false);
            table.decimal('flat_rate_amount', 8, 2).nullable();
            table.boolean('single_room_enabled').defaultTo(true);
            table.decimal('single_room_amount', 8, 2).nullable();
            table.boolean('double_room_enabled').defaultTo(false);
            table.decimal('double_room_amount', 8, 2).nullable();
            table.boolean('is_editable_amount').defaultTo(true);
            table.boolean('is_editable_days').defaultTo(true);
        });
    });
};