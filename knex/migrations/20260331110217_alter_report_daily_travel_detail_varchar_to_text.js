exports.up = async function (knex) {
  const columns = ['departure_place', 'departure_time', 'return_place', 'return_time', 'travel_details'];
  const tableName = 'report_daily_travel_detail';
  const schema = 'TAT_DEV';

  await knex.schema.withSchema(schema).alterTable(tableName, function (table) {
    columns.forEach((col) => table.text(`${col}_new`).nullable());
  });

  for (const col of columns) {
    await knex.raw(`UPDATE "${schema}"."${tableName}" SET "${col}_new" = "${col}"`);
  }

  await knex.schema.withSchema(schema).alterTable(tableName, function (table) {
    columns.forEach((col) => table.dropColumn(col));
  });

  for (const col of columns) {
    await knex.raw(`ALTER TABLE "${schema}"."${tableName}" RENAME COLUMN "${col}_new" TO "${col}"`);
  }
};

exports.down = async function (knex) {
  const columns = ['departure_place', 'departure_time', 'return_place', 'return_time', 'travel_details'];
  const tableName = 'report_daily_travel_detail';
  const schema = 'TAT_DEV';

  await knex.schema.withSchema(schema).alterTable(tableName, function (table) {
    columns.forEach((col) => table.string(`${col}_old`, 255).nullable());
  });

  for (const col of columns) {
    await knex.raw(`UPDATE "${schema}"."${tableName}" SET "${col}_old" = SUBSTR("${col}", 1, 255)`);
  }

  await knex.schema.withSchema(schema).alterTable(tableName, function (table) {
    columns.forEach((col) => table.dropColumn(col));
  });

  for (const col of columns) {
    await knex.raw(`ALTER TABLE "${schema}"."${tableName}" RENAME COLUMN "${col}_old" TO "${col}"`);
  }
};