/**
 * Adds international_moving_allowances.office_id (+ index).
 *
 * The original version also added a foreign key with `.onUpdate('CASCADE')`, which
 * Oracle does not support, so the migration failed halfway: the column and index
 * were created, the foreign key was not, and the migration was never recorded.
 * That left it pending and blocked `migrate:latest` (UAT has been in this state
 * since 2026-05-07). This version creates only what is missing and adds no foreign
 * key, so on such a database it changes nothing and just gets recorded, and on a
 * fresh database it produces the same schema UAT has.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const TABLE = 'international_moving_allowances';
const INDEX = 'international_moving_allowances_office_id_index';

async function hasIndex(knex) {
  const rows = await knex.raw('SELECT 1 FROM user_indexes WHERE index_name = ?', [INDEX]);
  return rows.length > 0;
}

exports.up = async function (knex) {
  if (!(await knex.schema.hasColumn(TABLE, 'office_id'))) {
    await knex.schema.alterTable(TABLE, (table) => {
      table.integer('office_id').unsigned().nullable();
    });
  }
  if (!(await hasIndex(knex))) {
    await knex.schema.alterTable(TABLE, (table) => {
      table.index('office_id', INDEX);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  if (await hasIndex(knex)) {
    await knex.schema.alterTable(TABLE, (table) => {
      table.dropIndex('office_id', INDEX);
    });
  }
  if (await knex.schema.hasColumn(TABLE, 'office_id')) {
    await knex.schema.alterTable(TABLE, (table) => {
      table.dropColumn('office_id');
    });
  }
};
