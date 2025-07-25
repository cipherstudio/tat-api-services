/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasColumn('approval', 'user_id').then((exists) => {
    if (exists) {
      return knex.schema.alterTable('approval', function (table) {
        // drop column user_id
        table.dropColumn('user_id');
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.hasColumn('approval', 'user_id').then((exists) => {
    if (!exists) {
      return knex.schema.alterTable('approval', function (table) {
        table.integer('user_id').notNullable();
      });
    }
  });
};
