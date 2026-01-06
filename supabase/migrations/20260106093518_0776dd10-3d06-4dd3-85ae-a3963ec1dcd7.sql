-- Drop the trigger temporarily
DROP TRIGGER IF EXISTS enforce_profile_update_rules ON profiles;

-- Update admin user_type to alumni
UPDATE profiles SET user_type = 'alumni' WHERE email = 'gtuadmin01@gmail.com';

-- Recreate the trigger
CREATE TRIGGER enforce_profile_update_rules
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_update();