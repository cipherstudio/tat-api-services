/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('meeting_expense_reports', function (table) {
    // Add new PDF header fields
    table.string('pdf_header_number', 50).nullable().comment('เลขที่หัวเอกสาร PDF');
    table.string('pdf_header_year', 20).nullable().comment('ปีที่หัวเอกสาร PDF');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('meeting_expense_reports', function (table) {
    // Remove the added fields
    table.dropColumn('pdf_header_number');
    table.dropColumn('pdf_header_year');
  });
};
