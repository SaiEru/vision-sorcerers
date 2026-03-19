
-- Insert profile for existing admin user if not exists
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('0e774f1b-83ea-45ce-acc7-879c726dde01', 'erukullasai0@gmail.com', 'Admin', 'admin')
ON CONFLICT (id) DO NOTHING;
