/**
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const types = ['meeting', 'training'];
  const locations = ['in', 'out', 'abroad'];
  const levels = [
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    'ประธานกรรมการ',
    'กรรมการ',
    'ผู้ว่าการ ททท.',
    'ลูกจ้าง ททท.',
  ];

  // Clear existing data (optional)
  await knex('meal_allowance_level').del();
  await knex('meal_allowance').del();

  // Insert into meal_allowance and meal_allowance_level
  for (const type of types) {
    for (const location of locations) {
      const rate_per_day = 80;
      // Insert into meal_allowance and get the id
      const [id] = await knex('meal_allowance')
        .insert({
          type,
          location,
          rate_per_day,
          rate_per_2_days: rate_per_day * 2,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        })
        .returning('meal_allowance_id');

      const mealAllowanceId =
        typeof id === 'object' ? id.meal_allowance_id : id;

      // Insert related levels
      const levelRows = levels.map((level) => ({
        meal_allowance_id: mealAllowanceId,
        level,
      }));

      await knex('meal_allowance_level').insert(levelRows);
    }
  }
};

/**
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex('meal_allowance_level').del();
  await knex('meal_allowance').del();
};
