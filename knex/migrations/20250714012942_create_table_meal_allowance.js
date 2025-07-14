/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('meal_allowance', function (table) {
      table.increments('meal_allowance_id').primary(); // PK
      table.string('type'); // ['meeting', 'training']
      table.float('rate_per_day');
      table.float('rate_per_2_days');
      table.enum('location', ['in', 'out', 'abroad']); // ['in', 'out', 'abroad']
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .then(function () {
      return knex.schema.createTable('meal_allowance_level', function (table) {
        table
          .integer('meal_allowance_id')
          .unsigned()
          .references('meal_allowance.meal_allowance_id')
          .onDelete('CASCADE');
        table.string('level'); // e.g., '03', 'กรรมการ'
        table.primary(['meal_allowance_id', 'level']);
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('meal_allowance_level')
    .then(function () {
      return knex.schema.dropTableIfExists('meal_allowance');
    });
};
