/**
 * #490: manual master-data rows (approval_id IS NULL) need their own
 * document title / travel type / requestor. Linked rows keep reading these
 * from `approval`; queries use COALESCE(approval value, manual_* value).
 * Prefixed with manual_ so they never collide with the joined aliases
 * (document_title, requestor_name, ...) returned next to ace.*.
 * Idempotent: only adds / drops what is missing / present.
 */
const COLUMNS = {
  manual_document_title: (t) => t.text('manual_document_title').nullable(), // same type as approval.document_title (CLOB)
  manual_travel_type: (t) => t.string('manual_travel_type').nullable(), // same type as approval.travel_type
  manual_requestor_code: (t) =>
    t.string('manual_requestor_code', 20).nullable(),
  manual_requestor_name: (t) =>
    t.string('manual_requestor_name', 255).nullable(),
  manual_requestor_position: (t) =>
    t.string('manual_requestor_position', 255).nullable(),
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const missing = [];
  for (const name of Object.keys(COLUMNS)) {
    if (!(await knex.schema.hasColumn('approval_clothing_expense', name)))
      missing.push(name);
  }
  if (missing.length === 0) return;
  await knex.schema.alterTable('approval_clothing_expense', (table) => {
    missing.forEach((name) => COLUMNS[name](table));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const present = [];
  for (const name of Object.keys(COLUMNS)) {
    if (await knex.schema.hasColumn('approval_clothing_expense', name))
      present.push(name);
  }
  if (present.length === 0) return;
  await knex.schema.alterTable('approval_clothing_expense', (table) => {
    present.forEach((name) => table.dropColumn(name));
  });
};
