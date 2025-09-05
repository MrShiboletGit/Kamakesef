-- Migration script to add sample arrays for storing individual vote amounts
-- Run this on your existing Supabase database

-- Add new columns for storing raw vote samples
ALTER TABLE votes 
ADD COLUMN too_low_samples INTEGER[] DEFAULT '{}',
ADD COLUMN just_right_samples INTEGER[] DEFAULT '{}',
ADD COLUMN too_high_samples INTEGER[] DEFAULT '{}';

-- Add comments to document the new columns
COMMENT ON COLUMN votes.too_low_samples IS 'Array of individual amounts voted as too low';
COMMENT ON COLUMN votes.just_right_samples IS 'Array of individual amounts voted as just right';
COMMENT ON COLUMN votes.too_high_samples IS 'Array of individual amounts voted as too high';
