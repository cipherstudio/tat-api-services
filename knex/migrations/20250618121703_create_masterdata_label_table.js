/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('masterdata_labels', (table) => {
    // Primary key
    table.increments('id').primary();

    // Table information
    table.string('table_name', 500).notNullable();
    table.string('table_description', 1000);

    // Document reference information
    table
      .string('document_reference', 1000)
      .notNullable()
      .comment('Reference document number or identifier');
    table
      .string('document_name', 1000)
      .notNullable()
      .comment('Name of the reference document');
    table.date('document_date').comment('Date of the reference document');
    table
      .string('document_url', 1000)
      .comment('URL to the reference document if available');

    // Update tracking
    table.string('updated_by', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('table_name');
    table.index('document_reference');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('masterdata_labels');
};
