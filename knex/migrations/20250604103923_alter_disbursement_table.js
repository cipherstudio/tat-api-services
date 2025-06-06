/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  //add colume remark type json
  return knex.schema.alterTable('disbursement_supporting_forms', (table) => {
    table.json('remark').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('disbursement_supporting_forms', (table) => {
    table.dropColumn('remark');
  });
};
