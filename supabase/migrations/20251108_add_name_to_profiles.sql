/*
  # Add name field to profiles table
  
  Adds first_name and last_name fields to store user information
*/

-- Add name fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Add index for name searches
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(first_name, last_name);

COMMENT ON COLUMN profiles.first_name IS 'User first name';
COMMENT ON COLUMN profiles.last_name IS 'User last name';

