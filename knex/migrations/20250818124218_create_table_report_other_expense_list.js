/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('report_other_expense_list', (table) => {
      table.increments('list_id').primary();
      table.integer('report_id').notNullable();
      table.string('expense_id', 36).notNullable(); // UUID
      table.string('name', 255).notNullable();
      table.decimal('request_amount', 10, 2).notNullable();
      table.decimal('actual_amount', 10, 2).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Foreign key constraint
      table.foreign('report_id').references('id').inTable('report_approve');
    })
    .createTable('report_other_expense_list_receipts', (table) => {
      table.increments('receipt_id').primary();
      table.integer('list_id').notNullable();
      table.string('receipt_detail_id', 36).notNullable(); // UUID
      table.string('detail', 255).notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Foreign key constraint
      table.foreign('list_id').references('list_id').inTable('report_other_expense_list');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('report_other_expense_list_receipts')
    .dropTable('report_other_expense_list');
};
