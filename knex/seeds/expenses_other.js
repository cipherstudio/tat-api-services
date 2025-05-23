const expensesOther = require('../constants/expenses_other');

exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('expenses_other').del();
    await knex('expenses_other').insert(expensesOther);
};