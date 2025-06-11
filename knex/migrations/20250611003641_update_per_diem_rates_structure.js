/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.dropTableIfExists('per_diem_rates')
    .then(() => {
      return knex.schema.createTable('per_diem_rates', function(table) {
        table.increments('id').primary();
        table.string('position_group').notNullable();
        table.string('position_name').nullable();
        table.string('level_code_start').nullable();
        table.string('level_code_end').nullable();
        table.enu('area_type', ['IN', 'OUT', 'ABROAD']).notNullable();
        table.decimal('per_diem_standard', 10, 2).notNullable();
        table.boolean('is_editable_per_diem').notNullable().defaultTo(false);
        table.decimal('max_per_diem', 10, 2).nullable();
        table.timestamps(true, true);
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('per_diem_rates')
    .then(() => {
      return knex.schema.createTable('per_diem_rates', function(table) {
        table.increments('id').primary();
        table.string('position_title').nullable(); 
        table.string('level_code').nullable(); 
        table.enu('area_type', ['IN', 'OUT']).notNullable(); 
        table.decimal('per_diem_standard', 10, 2).notNullable(); 
        table.boolean('is_editable_per_diem').notNullable().defaultTo(false); 
        table.decimal('max_per_diem', 10, 2).nullable(); 
        table.decimal('meal_deduction_per_meal', 10, 2).notNullable(); 
        table.boolean('is_editable_days').notNullable().defaultTo(true); 
        table.timestamps(true, true);
      });
    });
};

exports.up = function (knex) {
  return knex.schema.alterTable('expenses_other_conditions', (table) => {
    table.string('position_name').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('expenses_other_conditions', (table) => {
    table.dropColumn('position_name');
  });
};
