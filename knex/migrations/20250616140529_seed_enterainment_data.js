/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const data = [
    {
      position_group: [9, 10, 11],
      title:
        'ประธานกรรมการ กรรมการ ผู้อํานวยการ รองผู้อํานวยการ และพนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 9 ขึ้นไป',
      entertainment_allowances: [
        { min_days: 0, max_days: 15, amount: 3000 },
        { min_days: 16, max_days: 30, amount: 4500 },
      ],
    },
    {
      position_group: [3, 4, 5, 6, 7, 8],
      title: 'พนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 8 ลงมา',
      entertainment_allowances: [
        { min_days: 0, max_days: 15, amount: 2000 },
        { min_days: 16, max_days: 30, amount: 3500 },
      ],
    },
  ];

  const now = new Date();

  for (const group of data) {
    for (const allowance of group.entertainment_allowances) {
      // Insert into entertainment_allowances
      const [allowanceId] = await knex('entertainment_allowances').insert(
        {
          title: group.title,
          min_days: allowance.min_days,
          max_days: allowance.max_days,
          amount: allowance.amount,
          created_at: now,
          updated_at: now,
        },
        ['id'],
      );
      // For SQLite, Postgres, MySQL: allowanceId is an object or number
      const id = typeof allowanceId === 'object' ? allowanceId.id : allowanceId;
      // Insert all position levels for this allowance
      for (const level of group.position_group) {
        await knex('entertainment_allowance_levels').insert({
          allowance_id: id,
          position_level: level,
          created_at: now,
          updated_at: now,
        });
      }
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Remove all seeded data (by title)
  const titles = [
    'ประธานกรรมการ กรรมการ ผู้อํานวยการ รองผู้อํานวยการ และพนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 9 ขึ้นไป',
    'พนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 8 ลงมา',
  ];
  const allowances = await knex('entertainment_allowances')
    .whereIn('title', titles)
    .select('id');
  const ids = allowances.map((a) => a.id);
  await knex('entertainment_allowance_levels')
    .whereIn('allowance_id', ids)
    .del();
  await knex('entertainment_allowances').whereIn('id', ids).del();
};
