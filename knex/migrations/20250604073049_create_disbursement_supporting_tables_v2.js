/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. ประเภทเอกสาร
  await knex.schema.createTable(
    'disbursement_supporting_document_types',
    (table) => {
      table.increments('id').primary();
      table.text('name').notNullable();
      table.text('description');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    },
  );

  // 2. forms
  await knex.schema.createTable('disbursement_supporting_forms', (table) => {
    table.increments('id').primary();
    table
      .integer('document_type_id')
      .unsigned()
      .references('id')
      .inTable('disbursement_supporting_document_types')
      .onDelete('CASCADE');
    table.text('name').notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 3. questions
  await knex.schema.createTable(
    'disbursement_supporting_questions',
    (table) => {
      table.increments('id').primary();
      table
        .integer('form_id')
        .unsigned()
        .references('id')
        .inTable('disbursement_supporting_forms')
        .onDelete('CASCADE');
      table.text('question_text').notNullable();
      table.json('question_content');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    },
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('disbursement_supporting_questions');
  await knex.schema.dropTableIfExists('disbursement_supporting_forms');
  await knex.schema.dropTableIfExists('disbursement_supporting_document_types');
};
