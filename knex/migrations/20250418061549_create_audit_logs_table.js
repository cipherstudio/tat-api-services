/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('audit_logs');
  
  if (!tableExists) {
    return knex.schema.createTable('audit_logs', function (table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().nullable();
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
      table.string('action').notNullable();
      table.text('details').nullable();
      table.string('ip_address').nullable();
      table.string('user_agent').nullable();
      table.string('status').defaultTo('success');
      table.string('category').defaultTo('general');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  } else {
    console.log('Table audit_logs already exists, skipping creation');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('audit_logs');
  
  if (tableExists) {
    return knex.schema.dropTable('audit_logs');
  } else {
    console.log('Table audit_logs does not exist, skipping drop');
  }
};
