/**
 * Add checklist_document_attachment_id to approval table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('approval', function (table) {
    table.integer('checklist_document_attachment_id').unsigned().nullable().references('id').inTable('files').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('approval', function (table) {
    table.dropColumn('checklist_document_attachment_id');
  });
};
