/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Check if table has privilege_id column (migration alter has run)
  const hasPrivilegeId = await knex.schema.hasColumn(
    'entertainment_allowance_levels',
    'privilege_id',
  );

  if (!hasPrivilegeId) {
    return;
  }

  // Get all entertainment allowances
  const allowances = await knex('entertainment_allowances')
    .select('id', 'title', 'min_days', 'max_days')
    .orderBy('id', 'asc');

  const now = new Date();

  for (const allowance of allowances) {
    // Delete existing levels first (to ensure clean seed)
    await knex('entertainment_allowance_levels')
      .where('allowance_id', allowance.id)
      .del();

    // Determine which privilege group to use based on allowance_id
    // allowance_id 1, 2: privilege_id 1, 2, 3, 4, 5 (group 1)
    // allowance_id 3, 4: privilege_id 6, 7, 8, 9, 10, 11 (group 2)
    const isGroup1 = allowance.id <= 2;

    if (isGroup1) {
      // Group 1: privilege_id <= 5
      const privileges = await knex('privilege')
        .select('id', 'name')
        .where('is_outsider_equivalent', true)
        .where('id', '<=', 5)
        .orderBy('id', 'asc');

      for (const privilege of privileges) {
        await knex('entertainment_allowance_levels').insert({
          allowance_id: allowance.id,
          privilege_id: privilege.id,
          privilege_name: privilege.name,
          created_at: now,
          updated_at: now,
        });
      }
    } else {
      // Group 2: privilege_id > 5
      const privileges = await knex('privilege')
        .select('id', 'name')
        .where('is_outsider_equivalent', true)
        .where('id', '>', 5)
        .orderBy('id', 'asc');

      for (const privilege of privileges) {
        await knex('entertainment_allowance_levels').insert({
          allowance_id: allowance.id,
          privilege_id: privilege.id,
          privilege_name: privilege.name,
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
  // Remove all seeded levels for entertainment allowances
  const titles = [
    'ประธานกรรมการ กรรมการ ผู้อํานวยการ รองผู้อํานวยการ และพนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 9 ขึ้นไป',
    'พนักงานซึ่งดํารงตําแหน่งตั้งแต่ระดับ 8 ลงมา',
  ];
  
  const allowances = await knex('entertainment_allowances')
    .whereIn('title', titles)
    .select('id');
  
  const ids = allowances.map((a) => a.id);
  
  if (ids.length > 0) {
    await knex('entertainment_allowance_levels')
      .whereIn('allowance_id', ids)
      .del();
  }
};
