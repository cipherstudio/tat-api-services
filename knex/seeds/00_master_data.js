/**
 * Sync every master-data table to the snapshot in knex/constants/master-data/
 * (taken from UAT). When master data changes, update those files to match.
 *
 * Rows keep their snapshot ids, so foreign keys between master tables line up
 * on a fresh database. The id triggers only fill "id" when it is null and skip
 * taken values, so later inserts from the app do not collide.
 *
 * Safe to re-run: rows are updated by id, missing ones inserted, and rows not in
 * the snapshot deleted (children first). A delete that is still referenced by
 * transaction data fails on its foreign key instead of removing that data.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const MASTER_DATA = require('../constants/master-data');

// Oracle allows at most 1000 items in one IN list.
const CHUNK = 1000;

// Text columns under a unique constraint other than id. When an existing row's id
// now belongs to another value (ids differ from the snapshot, e.g. data seeded by a
// migration), updating rows one by one would hit the constraint, so these columns
// are parked on a temporary value first and get their real value in the update.
const UNIQUE_TEXT_COLUMNS = {
  training_countries: ['code'],
  attire_destination_groups: ['group_code'],
  entertainment_form_status: ['name'],
  meeting_types: ['name'],
  menu_items_access: ['key_name'],
};

// Nothing references these tables, and their unique keys have no free text column
// to park (foreign keys, a CHECK-constrained enum), so their rows are replaced.
const REPLACE_TABLES = new Set(['attire_destination_group_countries', 'meeting_type_rates']);

function chunks(list) {
  const out = [];
  for (let i = 0; i < list.length; i += CHUNK) out.push(list.slice(i, i + CHUNK));
  return out;
}

exports.seed = async function (knex) {
  for (const { table, rows } of [...MASTER_DATA].reverse()) {
    const query = knex(table);
    if (!REPLACE_TABLES.has(table)) {
      chunks(rows.map((row) => row.id)).forEach((ids) => query.whereNotIn('id', ids));
    }
    const removed = await query.del();
    if (removed) console.log(`${table}: removed ${removed} rows`);
  }

  for (const [table, columns] of Object.entries(UNIQUE_TEXT_COLUMNS)) {
    const parked = Object.fromEntries(
      columns.map((column) => [column, knex.raw(`'~' || "id"`)]),
    );
    await knex(table).update(parked);
  }

  for (const { table, rows } of MASTER_DATA) {
    const existing = new Set((await knex(table).select('id')).map((row) => row.id));
    const inserts = [];
    for (const row of rows) {
      if (existing.has(row.id)) {
        await knex(table).where('id', row.id).update(row);
      } else {
        inserts.push(row);
      }
    }
    if (inserts.length) await knex.batchInsert(table, inserts, 100);
    console.log(`${table}: ${rows.length} rows (${inserts.length} inserted)`);
  }
};
