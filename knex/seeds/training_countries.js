/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const countries = await knex('countries')
    .select('code', 'name_en', 'name_th', 'type', 'percent_increase');

  await knex('training_countries').del();

  if (countries.length > 0) {
    await knex('training_countries').insert(
      countries.map(country => ({
        code: country.code,
        name_en: country.name_en,
        name_th: country.name_th,
        type: country.type,
        percent_increase: country.percent_increase || 0,
      }))
    );
  }
};
