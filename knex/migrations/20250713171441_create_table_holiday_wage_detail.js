/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    'report_holiday_wage_detail',
    function (table) {
      table.increments('holiday_id').primary(); // PK
      table.integer('form_id').notNullable(); // FK
      table.date('date');
      table.integer('hours');
      table.integer('year');
      table.float('wage');
      table.float('tax');
      table.float('total');

      // กำหนด foreign key constraint (ถ้ามีตาราง form)
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
  return knex.schema.dropTableIfExists('report_holiday_wage_detail');
};
