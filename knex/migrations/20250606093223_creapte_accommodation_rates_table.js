/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('accommodation_rates', function (table) {
    table.increments('id').primary();
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
    table.text('note').nullable();
    table.timestamps(true, true);

    // Index สำหรับการค้นหา
    table.index('position_title');
    table.index('level_code');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('accommodation_rates');
};
