-- Migration script to add amount columns per vote type
-- Run this on your existing Supabase database

-- Add new columns for tracking amounts per vote type
ALTER TABLE votes 
ADD COLUMN too_low_amount INTEGER DEFAULT 0,
ADD COLUMN just_right_amount INTEGER DEFAULT 0,
ADD COLUMN too_high_amount INTEGER DEFAULT 0;

-- Update existing records to populate the new columns
-- This will set the amounts based on the existing total_amount and vote counts
UPDATE votes 
SET 
    too_low_amount = CASE 
        WHEN too_low > 0 THEN total_amount * too_low / count 
        ELSE 0 
    END,
    just_right_amount = CASE 
        WHEN just_right > 0 THEN total_amount * just_right / count 
        ELSE 0 
    END,
    too_high_amount = CASE 
        WHEN too_high > 0 THEN total_amount * too_high / count 
        ELSE 0 
    END
WHERE count > 0;

-- Add comments to document the new columns
COMMENT ON COLUMN votes.too_low_amount IS 'Sum of all amounts voted as too low';
COMMENT ON COLUMN votes.just_right_amount IS 'Sum of all amounts voted as just right';
COMMENT ON COLUMN votes.too_high_amount IS 'Sum of all amounts voted as too high';
