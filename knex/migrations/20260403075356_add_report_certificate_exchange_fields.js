/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('report_certificate', (table) => {
    table.boolean('has_exchange_rate').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('report_certificate_expenses', (table) => {
    table.decimal('local_amount', 15, 2).nullable();
    table.string('currency_label', 32).nullable();
    table.string('currency_code_en', 32).nullable();
    table.decimal('exchange_rate', 20, 12).nullable();
  });

  await knex.schema.createTable(
    'report_certificate_exchange_rates',
    function (table) {
      table.bigIncrements('id').primary();
      table.bigInteger('report_certificate_id').unsigned().notNullable();
      table.string('country', 255).nullable();
      table.string('currency_label', 32).nullable();
      table.string('currency_code_en', 32).nullable();
      table.decimal('exchange_rate', 20, 12).nullable();
      table.integer('display_order').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['report_certificate_id']);
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('report_certificate_exchange_rates');

  await knex.schema.alterTable('report_certificate_expenses', (table) => {
    table.dropColumn('local_amount');
    table.dropColumn('currency_label');
    table.dropColumn('currency_code_en');
    table.dropColumn('exchange_rate');
  });

  await knex.schema.alterTable('report_certificate', (table) => {
    table.dropColumn('has_exchange_rate');
  });
};
