/**
 * Add indexes on FK columns that reference the files table.
 * Without these indexes, DELETE FROM files causes Oracle to acquire
 * a full table (TM) lock on the child tables to verify FK constraints,
 * blocking all concurrent DML on approval / approval_attachments.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const indexes = [
    { table: 'approval_attachments', column: 'file_id', name: 'idx_approval_attachments_file_id' },
    { table: 'approval', column: 'checklist_document_attachment_id', name: 'idx_approval_checklist_doc_att' },
    { table: 'approval', column: 'attachment_id', name: 'idx_approval_attachment_id' },
    { table: 'approval', column: 'signature_attachment_id', name: 'idx_approval_sig_att_id' },
  ];

  for (const idx of indexes) {
    try {
      await knex.schema.alterTable(idx.table, function (table) {
        table.index(idx.column, idx.name);
      });
      console.log(`Created index ${idx.name} on ${idx.table}(${idx.column})`);
    } catch (err) {
      if (err.message && err.message.includes('ORA-01408')) {
        console.log(`Index on ${idx.table}(${idx.column}) already exists, skipping`);
      } else {
        throw err;
      }
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const indexes = [
    { table: 'approval_attachments', column: 'file_id', name: 'idx_approval_attachments_file_id' },
    { table: 'approval', column: 'checklist_document_attachment_id', name: 'idx_approval_checklist_doc_att' },
    { table: 'approval', column: 'attachment_id', name: 'idx_approval_attachment_id' },
    { table: 'approval', column: 'signature_attachment_id', name: 'idx_approval_sig_att_id' },
  ];

  for (const idx of indexes) {
    try {
      await knex.schema.alterTable(idx.table, function (table) {
        table.dropIndex(idx.column, idx.name);
      });
    } catch (err) {
      console.log(`Could not drop index ${idx.name}: ${err.message}`);
    }
  }
};
