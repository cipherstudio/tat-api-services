#!/bin/zsh

echo "Running Knex migration to seed superadmin user..."
npx knex migrate:latest

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
    echo "Superadmin credentials:"
    echo "- Email: admin@example.com"
    echo "- Password: Admin@123"
else
    echo "Migration failed. Check the error messages above."
fi 