/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .hasColumn('audit_logs', 'user_id')
    .then(function (userIdExists) {
      console.log('audit_logs user_id exists:', userIdExists);
      if (userIdExists) {
        return knex.schema.alterTable('audit_logs', function (table) {
          table.dropColumn('user_id');
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('audit_logs', 'employee_code');
    })
    .then(function (employeeCodeExists) {
      console.log('audit_logs employee_code exists:', employeeCodeExists);
      if (!employeeCodeExists) {
        return knex.schema.alterTable('audit_logs', function (table) {
          table.string('employee_code', 50);
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('audit_logs', 'employee_name');
    })
    .then(function (employeeNameExists) {
      console.log('audit_logs employee_name exists:', employeeNameExists);
      if (!employeeNameExists) {
        return knex.schema.alterTable('audit_logs', function (table) {
          table.string('employee_name', 255);
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('sessions', 'user_id');
    })
    .then(function (userIdExists) {
      console.log('sessions user_id exists:', userIdExists);
      if (userIdExists) {
        return knex.schema.alterTable('sessions', function (table) {
          table.dropColumn('user_id');
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('sessions', 'employee_code');
    })
    .then(function (employeeCodeExists) {
      console.log('sessions employee_code exists:', employeeCodeExists);
      if (!employeeCodeExists) {
        return knex.schema.alterTable('sessions', function (table) {
          table.string('employee_code', 50);
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('sessions', 'employee_name');
    })
    .then(function (employeeNameExists) {
      console.log('sessions employee_name exists:', employeeNameExists);
      if (!employeeNameExists) {
        return knex.schema.alterTable('sessions', function (table) {
          table.string('employee_name', 255);
        });
      }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .hasColumn('audit_logs', 'employee_code')
    .then(function (employeeCodeExists) {
      console.log(
        'audit_logs employee_code exists (down):',
        employeeCodeExists,
      );
      if (employeeCodeExists) {
        return knex.schema.alterTable('audit_logs', function (table) {
          table.dropColumn('employee_code');
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('audit_logs', 'employee_name');
    })
    .then(function (employeeNameExists) {
      console.log(
        'audit_logs employee_name exists (down):',
        employeeNameExists,
      );
      if (employeeNameExists) {
        return knex.schema.alterTable('audit_logs', function (table) {
          table.dropColumn('employee_name');
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('audit_logs', 'user_id');
    })
    .then(function (userIdExists) {
      console.log('audit_logs user_id exists (down):', userIdExists);
      if (!userIdExists) {
        return knex.schema.alterTable('audit_logs', function (table) {
          table.integer('user_id').unsigned();
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('sessions', 'employee_code');
    })
    .then(function (employeeCodeExists) {
      console.log('sessions employee_code exists (down):', employeeCodeExists);
      if (employeeCodeExists) {
        return knex.schema.alterTable('sessions', function (table) {
          table.dropColumn('employee_code');
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('sessions', 'employee_name');
    })
    .then(function (employeeNameExists) {
      console.log('sessions employee_name exists (down):', employeeNameExists);
      if (employeeNameExists) {
        return knex.schema.alterTable('sessions', function (table) {
          table.dropColumn('employee_name');
        });
      }
    })
    .then(function () {
      return knex.schema.hasColumn('sessions', 'user_id');
    })
    .then(function (userIdExists) {
      console.log('sessions user_id exists (down):', userIdExists);
      if (!userIdExists) {
        return knex.schema.alterTable('sessions', function (table) {
          table.integer('user_id').unsigned();
        });
      }
    });
};
