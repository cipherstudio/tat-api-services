/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable(
    'approval_staff_member_spouse_companion',
    function (table) {
      table.increments('id').primary();
      table.integer('approval_id').unsigned().notNullable();
      table
        .integer('staff_member_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('approval_staff_members')
        .onDelete('CASCADE');
      /** 0/1 — คู่สมรสเป็น พนง./ลจ. ททท. หรือไม่ */
      table.boolean('is_tat_employee').nullable();
      table.string('tat_employee_code', 64).nullable();
      table.string('travel_pattern', 64).nullable();
      table.string('leave_order_no', 255).nullable();
      table.string('leave_order_subject', 500).nullable();
      /** ISO date string */
      table.string('leave_order_effective_date', 32).nullable();
      /** FK → files.id (อัปโหลดจาก frontend) */
      table
        .integer('leave_order_file_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('files')
        .onDelete('SET NULL');
      table.string('leave_order_file_name', 600).nullable();
      table.string('follow_travel_date', 32).nullable();
      table.string('reason', 4000).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['staff_member_id']);
      table.index(['approval_id']);
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists(
    'approval_staff_member_spouse_companion',
  );
};
