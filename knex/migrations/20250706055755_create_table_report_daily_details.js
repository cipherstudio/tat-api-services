/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    'report_daily_travel_detail',
    function (table) {
      table.increments('detail_id').primary(); // int PK
      table.integer('form_id').notNullable(); // int FK
      table.string('departure_place');
      table.date('departure_date');
      table.string('departure_time');
      table.string('return_place');
      table.date('return_date');
      table.string('return_time');
      table.string('travel_details');
      table
        .foreign('form_id')
        .references('form_id')
        .inTable('report_traveller_form');
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('report_daily_travel_detail');
};
