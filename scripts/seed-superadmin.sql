-- Seed a superadmin user
-- Note: You'll need to replace the hashed password with a proper bcrypt hash when running this directly
INSERT INTO users (
  email, 
  password, 
  full_name, 
  role, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'admin@example.com', 
  '$2b$10$X6XhqKk1ReFh4AzEdEaXU.qs8jKBvGYMbCvnJR8uo0o2RrZFVXKDS', -- Hashed value of 'Admin@123'
  'Super Admin', 
  'admin', 
  1, 
  NOW(), 
  NOW()
); 