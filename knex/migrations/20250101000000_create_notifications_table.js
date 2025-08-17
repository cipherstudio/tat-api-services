/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.increments('id').primary();
    table.string('employee_code').notNullable(); // employee_code ที่เชื่อมต่อกับ OP_MASTER_T
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.string('type').notNullable(); // 'approval_created', 'approval_updated', 'approval_approved', 'approval_rejected', 'report_created', 'report_updated'
    table.string('entity_type').notNullable(); // 'approval', 'report'
    table.integer('entity_id').notNullable(); // ID ของ approval หรือ report
    table.json('metadata').nullable(); // ข้อมูลเพิ่มเติม เช่น approval title, employee name
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['employee_code', 'is_read']);
    table.index(['entity_type', 'entity_id']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};
