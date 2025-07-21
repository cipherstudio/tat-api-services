const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const employeeCodes = [
    '66019',
    '65027',
    '62040',
    '52015',
    '39034',
    '35010',
    '33024',
    '36033',
    '98002',
  ];
  const emails = employeeCodes.map((_, i) => `c${i + 3}@example.com`);
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const now = new Date();

  const users = employeeCodes.map((code, i) => ({
    email: emails[i],
    password: hashedPassword,
    full_name: `Dummy User ${i + 1}`,
    role: 'user',
    employee_code: code,
    is_active: 1,
    created_at: now,
    updated_at: now,
  }));

  await knex('users').insert(users);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  const employeeCodes = [
    '66019',
    '65027',
    '62040',
    '52015',
    '39034',
    '35010',
    '33024',
    '36033',
    '98002',
  ];
  const emails = employeeCodes.map((_, i) => `c${i + 3}@example.com`);
  return knex('users').whereIn('email', emails).del();
};
