INSERT INTO users (first_name, last_name, email, password, motto, img_id, dark_mode, username, theme)
SELECT 'user','user','user@example.com','password123','', 'default2', false, 'user','light'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@example.com');
