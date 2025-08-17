/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable(
    'entertainment_allowance_levels',
    function (table) {
      table.integer('privilege_id').nullable();
      table.string('privilege_name').nullable();

      //remove position_level
      table.dropColumn('position_level');
    },
  );

  //clear data from entertainment_allowance_levels
  await knex('entertainment_allowance_levels').truncate();

  //query from table privilege
  const privileges = await knex('privilege')
    .select('id', 'name')
    .where('is_outsider_equivalent', true);
  const privilegGrops_1 = privileges.filter((privilege) => privilege.id <= 5);
  const privilegGrops_2 = privileges.filter((privilege) => privilege.id > 5);

  //insert data to entertainment_allowance_levels
  for (const privilege of privilegGrops_1) {
    await knex('entertainment_allowance_levels').insert({
      allowance_id: 1,
      privilege_id: privilege.id,
      privilege_name: privilege.name,
    });
  }
  for (const privilege of privilegGrops_1) {
    await knex('entertainment_allowance_levels').insert({
      allowance_id: 2,
      privilege_id: privilege.id,
      privilege_name: privilege.name,
    });
  }

  for (const privilege of privilegGrops_2) {
    await knex('entertainment_allowance_levels').insert({
      allowance_id: 3,
      privilege_id: privilege.id,
      privilege_name: privilege.name,
    });
  }

  for (const privilege of privilegGrops_2) {
    await knex('entertainment_allowance_levels').insert({
      allowance_id: 4,
      privilege_id: privilege.id,
      privilege_name: privilege.name,
    });
  }
  return;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable(
    'entertainment_allowance_levels',
    function (table) {
      table.dropColumn('privilege_id');
      table.dropColumn('privilege_name');
      table.integer('position_level').nullable();
    },
  );
};
