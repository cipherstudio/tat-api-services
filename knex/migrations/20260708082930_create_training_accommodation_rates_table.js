/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('training_accommodation_rates', function (table) {
    table.increments('id').primary();
    table.enum('travel_type', ['DOMESTIC', 'INTERNATIONAL']).notNullable();
    table.enum('training_type', ['type-a', 'type-b', 'outsider']).notNullable();
    table.decimal('single_room_amount', 10, 2).notNullable();
    table.decimal('double_room_amount', 10, 2).notNullable();
    table.timestamps(true, true);

    table.index('travel_type');
    table.index('training_type');
  });

  // Seed reference rows.
  // NOTE: INTERNATIONAL type-b / outsider values are PLACEHOLDERS — the source
  // QA screenshot's exact numbers for those two rows were not legible.
  // Edit them via the admin UI (master-data > รายการค่าที่พักฝึกอบรม) once confirmed.
  await knex('training_accommodation_rates').insert([
    { travel_type: 'DOMESTIC', training_type: 'type-a', single_room_amount: 2700, double_room_amount: 1500 },
    { travel_type: 'DOMESTIC', training_type: 'type-b', single_room_amount: 1600, double_room_amount: 1000 },
    { travel_type: 'DOMESTIC', training_type: 'outsider', single_room_amount: 1600, double_room_amount: 1000 },
    { travel_type: 'INTERNATIONAL', training_type: 'type-a', single_room_amount: 8000, double_room_amount: 5500 },
    { travel_type: 'INTERNATIONAL', training_type: 'type-b', single_room_amount: 5000, double_room_amount: 3500 },
    { travel_type: 'INTERNATIONAL', training_type: 'outsider', single_room_amount: 5000, double_room_amount: 3500 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('training_accommodation_rates');
};
