/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('training_countries');
  if (exists) return;

  await knex.schema.createTable('training_countries', table => {
    table.increments('id').primary();
    table.string('code').notNullable().unique();
    table.string('name_en').notNullable();
    table.string('name_th').notNullable();
    table.string('type').nullable();
    table.decimal('percent_increase', 10, 2).notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.index('name_th');
    table.index('type');
  });

  const menuExists = await knex('menu_items_access')
    .where('key_name', 'location-training-country')
    .first();
  if (!menuExists) {
    await knex('menu_items_access').insert({
      key_name: 'location-training-country',
      title: 'รายการประเทศฝึกอบรม',
      parent_key: 'master-data',
      is_active: true,
      is_admin: true,
    });
  }

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex('menu_items_access')
    .where('key_name', 'location-training-country')
    .del()
    .then(() => knex.schema.dropTableIfExists('training_countries'));
};
