/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_attachments', function(table) {
    table.increments('id').primary();
    table.string('entity_type', 100).notNullable();  // 'approval', 'approval_clothing_expense', 'approval_budgets', etc.
    table.integer('entity_id').notNullable();         // ID ของ record ในตารางนั้นๆ
    table.integer('file_id').unsigned().notNullable().references('id').inTable('files').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['entity_type', 'entity_id'], 'idx_entity');
    table.index(['file_id'], 'idx_file');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_attachments');
};
