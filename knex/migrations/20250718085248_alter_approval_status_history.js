/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval_status_history', function(table) {
    // First add the column as nullable
    table.string('created_by');
  }).then(() => {
    // Update existing records with a default value
    return knex('approval_status_history').update({ created_by: 'SYSTEM' });
  }).then(() => {
    // Then make it NOT NULL
    return knex.schema.alterTable('approval_status_history', function(table) {
      table.string('created_by').notNullable().alter();
    });
  }).then(() => {
    // Finally drop the user_id column
    return knex.schema.alterTable('approval_status_history', function(table) {
      table.dropColumn('user_id');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval_status_history', function(table) {
    // First add the user_id column as nullable
    table.integer('user_id');
  }).then(() => {
    // Update existing records with a default value
    return knex('approval_status_history').update({ user_id: 0 });
  }).then(() => {
    // Then make it NOT NULL
    return knex.schema.alterTable('approval_status_history', function(table) {
      table.integer('user_id').notNullable().alter();
    });
  }).then(() => {
    // Finally drop the created_by column
    return knex.schema.alterTable('approval_status_history', function(table) {
      table.dropColumn('created_by');
    });
  });
};
