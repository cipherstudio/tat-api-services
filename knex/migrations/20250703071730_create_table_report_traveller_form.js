/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // Create report_traveller table first
  return knex.schema
    .createTable('report_traveller', function (table) {
      table.increments('traveler_id').primary();
      table.string('report_id').notNullable();
      table.string('name');
      table.string('position');
      table.string('level');
      table.string('type');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.foreign('report_id').references('id').inTable('report_approve');
    })
    .then(function () {
      // Then create report_traveller_form table
      return knex.schema.createTable('report_traveller_form', function (table) {
        table.string('form_id').primary();
        table.integer('traveler_id').notNullable();
        table.string('report_id').notNullable();
        table.string('job');
        table.string('department');
        table.date('date');
        table.string('travel_order');
        table.date('travel_order_date');
        table.string('companions');
        table.string('destination');
        table.string('location');
        table.string('departure_place');
        table.date('departure_date');
        table.string('departure_time');
        table.string('return_place');
        table.date('return_date');
        table.string('return_time');
        table.string('total_time');
        table.string('travel_details');
        table.float('gran_total');
        table.float('request_approve_amount');
        table.float('remain_amount');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table
          .foreign('traveler_id')
          .references('traveler_id')
          .inTable('report_traveller');
        table.foreign('report_id').references('id').inTable('report_approve');
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('report_traveller_form')
    .then(function () {
      return knex.schema.dropTableIfExists('report_traveller');
    });
};
