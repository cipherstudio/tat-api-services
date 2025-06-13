/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('currencies', function (table) {
    table.increments('id').primary();
    table.string('currency_th', 100); // ชื่อสกุลเงินภาษาไทย
    table.string('currency_code_th', 50); // ชื่อย่อสกุลเงินภาษาไทย
    table.string('currency_en', 100); // ชื่อสกุลเงินภาษาอังกฤษ
    table.string('currency_code_en', 10); // ชื่อย่อสกุลเงินภาษาอังกฤษ
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('currencies');
};
