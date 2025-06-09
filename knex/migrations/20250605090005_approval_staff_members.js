/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_staff_members', function(table) {
    table.increments('id').primary();
    table.string('employee_code').nullable();
    table.string('type').nullable();
    table.string('name').nullable();
    table.string('role').nullable();

    table.string('position').nullable();
    table.string('right_equivalent').nullable();
    table.string('organization_position').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.integer('approval_id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_staff_members');
};
