/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval_continuous', function(table) {
    table.string('signer_date').nullable();
    table.string('document_ending').nullable();
    table.text('document_ending_wording').nullable();
    table.string('signer_name').nullable();
    table.boolean('use_file_signature').defaultTo(false);
    table.integer('signature_attachment_id').nullable();
    table.boolean('use_system_signature').defaultTo(false);

    table.text('comments').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval_continuous', function(table) {
    table.dropColumn('signer_date');
    table.dropColumn('document_ending');
    table.dropColumn('document_ending_wording');
    table.dropColumn('signer_name');
    table.dropColumn('use_file_signature');
    table.dropColumn('signature_attachment_id');
    table.dropColumn('use_system_signature');

    table.dropColumn('comments');
  });
};
