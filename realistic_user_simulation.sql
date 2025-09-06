-- Realistic User Simulation: Build up to 1000 votes gradually
-- This simulates how real users would interact with the site over time

-- Clear existing data
DELETE FROM calculations;
DELETE FROM votes;

-- Phase 1: Early users (first 50 votes) - More conservative, testing the waters
-- These users tend to vote more "too high" as they're unsure about amounts

-- Wedding scenarios (most popular)
INSERT INTO votes (scenario_key, too_low, just_right, too_high, total_amount, count, too_low_amount, just_right_amount, too_high_amount, too_low_samples, just_right_samples, too_high_samples) VALUES
-- Wedding + Inner + Hall + Center (most common scenario)
('wedding-inner-hall-center', 2, 3, 5, 6000, 10, 1400, 3000, 2800, ARRAY[700, 800], ARRAY[1000, 1100, 1200], ARRAY[1300, 1400, 1500, 1600, 1700]),

-- Wedding + Friend + Hall + Center (second most common)
('wedding-friend-hall-center', 1, 2, 4, 4200, 7, 600, 1800, 2400, ARRAY[500], ARRAY[600, 700], ARRAY[800, 900, 1000, 1100]),

-- Wedding + Close + Hall + Center
('wedding-close-hall-center', 1, 2, 3, 3600, 6, 600, 1500, 1800, ARRAY[500], ARRAY[600, 700], ARRAY[800, 900, 1000]),

-- Bar/Bat scenarios (less common initially)
('bar-bat-inner-hall-center', 0, 1, 2, 1200, 3, 0, 400, 800, ARRAY[]::INTEGER[], ARRAY[400], ARRAY[500, 600]),

('bar-bat-friend-hall-center', 0, 1, 1, 700, 2, 0, 350, 350, ARRAY[]::INTEGER[], ARRAY[350], ARRAY[400]),

-- Brit scenarios (least common)
('brit-inner-hall-center', 0, 1, 1, 600, 2, 0, 300, 300, ARRAY[]::INTEGER[], ARRAY[300], ARRAY[400]);

-- Phase 2: Growing user base (votes 51-200) - More balanced voting
-- Users start to understand the system better, more "just right" votes

-- Add more votes to existing scenarios with better balance
UPDATE votes SET 
    too_low = too_low + 3,
    just_right = just_right + 8,
    too_high = too_high + 2,
    total_amount = total_amount + 12000,
    count = count + 13,
    too_low_amount = too_low_amount + 2400,
    just_right_amount = just_right_amount + 8000,
    too_high_amount = too_high_amount + 1600,
    too_low_samples = too_low_samples || ARRAY[650, 750, 800],
    just_right_samples = just_right_samples || ARRAY[850, 900, 950, 1000, 1050, 1100, 1150, 1200],
    too_high_samples = too_high_samples || ARRAY[1300, 1400]
WHERE scenario_key = 'wedding-inner-hall-center';

UPDATE votes SET 
    too_low = too_low + 2,
    just_right = just_right + 6,
    too_high = too_high + 1,
    total_amount = total_amount + 6300,
    count = count + 9,
    too_low_amount = too_low_amount + 1200,
    just_right_amount = just_right_amount + 4200,
    too_high_amount = too_high_amount + 900,
    too_low_samples = too_low_samples || ARRAY[550, 600],
    just_right_samples = just_right_samples || ARRAY[650, 700, 750, 800, 850, 900],
    too_high_samples = too_high_samples || ARRAY[950]
WHERE scenario_key = 'wedding-friend-hall-center';

-- Add new scenarios that become popular
INSERT INTO votes (scenario_key, too_low, just_right, too_high, total_amount, count, too_low_amount, just_right_amount, too_high_amount, too_low_samples, just_right_samples, too_high_samples) VALUES
-- More wedding variations
('wedding-inner-garden-center', 1, 4, 2, 3600, 7, 600, 2400, 1200, ARRAY[500], ARRAY[600, 700, 800, 900], ARRAY[1000, 1100]),

('wedding-inner-restaurant-center', 1, 3, 2, 3000, 6, 600, 1800, 1200, ARRAY[500], ARRAY[600, 700, 800], ARRAY[900, 1000]),

('wedding-inner-home-center', 2, 2, 1, 2400, 5, 1200, 1200, 600, ARRAY[500, 600], ARRAY[700, 800], ARRAY[900]),

-- More bar/bat scenarios
('bar-bat-close-hall-center', 1, 3, 1, 1400, 5, 300, 900, 400, ARRAY[250], ARRAY[300, 350, 400], ARRAY[500]),

('bar-bat-friend-hall-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

-- More brit scenarios
('brit-close-hall-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('brit-friend-hall-center', 0, 2, 1, 700, 3, 0, 500, 300, ARRAY[]::INTEGER[], ARRAY[300, 350], ARRAY[400]);

-- Phase 3: Mature user base (votes 201-500) - Even more balanced
-- Users are comfortable with the system, more accurate voting

-- Add more balanced votes to popular scenarios
UPDATE votes SET 
    too_low = too_low + 4,
    just_right = just_right + 12,
    too_high = too_high + 4,
    total_amount = total_amount + 20000,
    count = count + 20,
    too_low_amount = too_low_amount + 4000,
    just_right_amount = just_right_amount + 12000,
    too_high_amount = too_high_amount + 4000,
    too_low_samples = too_low_samples || ARRAY[650, 700, 750, 800],
    just_right_samples = just_right_samples || ARRAY[850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400],
    too_high_samples = too_high_samples || ARRAY[1450, 1500, 1550, 1600]
WHERE scenario_key = 'wedding-inner-hall-center';

-- Add more scenarios with realistic distribution
INSERT INTO votes (scenario_key, too_low, just_right, too_high, total_amount, count, too_low_amount, just_right_amount, too_high_amount, too_low_samples, just_right_samples, too_high_samples) VALUES
-- Wedding distant family scenarios
('wedding-distantFamily-hall-center', 2, 5, 2, 3000, 9, 1200, 2000, 1000, ARRAY[400, 500], ARRAY[600, 700, 800, 900, 1000], ARRAY[1100, 1200]),

('wedding-distantFamily-garden-center', 1, 3, 1, 1800, 5, 500, 1200, 400, ARRAY[400], ARRAY[500, 600, 700], ARRAY[800]),

-- Wedding distant scenarios
('wedding-distant-hall-center', 2, 3, 2, 1950, 7, 800, 1200, 700, ARRAY[300, 400], ARRAY[500, 600, 700], ARRAY[800, 900]),

-- More bar/bat variations
('bar-bat-distantFamily-hall-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[200], ARRAY[250, 300], ARRAY[400]),

('bar-bat-distant-hall-center', 1, 2, 1, 900, 4, 300, 500, 300, ARRAY[150], ARRAY[200, 250], ARRAY[300]),

-- More brit variations
('brit-distantFamily-hall-center', 1, 2, 1, 900, 4, 300, 500, 300, ARRAY[200], ARRAY[250, 300], ARRAY[400]),

('brit-distant-hall-center', 1, 1, 1, 600, 3, 200, 300, 200, ARRAY[100], ARRAY[150], ARRAY[250]);

-- Phase 4: High engagement (votes 501-800) - Very balanced voting
-- Users are experts, very accurate voting patterns

-- Add highly balanced votes to all scenarios
UPDATE votes SET 
    too_low = too_low + 6,
    just_right = just_right + 18,
    too_high = too_high + 6,
    total_amount = total_amount + 30000,
    count = count + 30,
    too_low_amount = too_low_amount + 6000,
    just_right_amount = just_right_amount + 18000,
    too_high_amount = too_high_amount + 6000,
    too_low_samples = too_low_samples || ARRAY[650, 700, 750, 800, 850, 900],
    just_right_samples = just_right_samples || ARRAY[950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800],
    too_high_samples = too_high_samples || ARRAY[1850, 1900, 1950, 2000, 2050, 2100]
WHERE scenario_key = 'wedding-inner-hall-center';

-- Add many more scenarios with realistic patterns
INSERT INTO votes (scenario_key, too_low, just_right, too_high, total_amount, count, too_low_amount, just_right_amount, too_high_amount, too_low_samples, just_right_samples, too_high_samples) VALUES
-- North/South/Jerusalem variations
('wedding-inner-hall-north', 2, 4, 2, 3600, 8, 1200, 2400, 1200, ARRAY[600, 700], ARRAY[800, 900, 1000, 1100], ARRAY[1200, 1300]),

('wedding-inner-hall-south', 1, 3, 1, 2400, 5, 600, 1800, 600, ARRAY[500], ARRAY[600, 700, 800], ARRAY[900]),

('wedding-inner-hall-jerusalem', 1, 4, 1, 3000, 6, 600, 2400, 600, ARRAY[500], ARRAY[600, 700, 800, 900], ARRAY[1000]),

-- More venue variations
('wedding-friend-garden-center', 1, 3, 1, 2100, 5, 500, 1500, 400, ARRAY[400], ARRAY[500, 600, 700], ARRAY[800]),

('wedding-friend-restaurant-center', 1, 2, 1, 1500, 4, 400, 1000, 300, ARRAY[350], ARRAY[500, 600], ARRAY[700]),

('wedding-friend-home-center', 2, 2, 1, 1800, 5, 800, 1000, 400, ARRAY[300, 400], ARRAY[500, 600], ARRAY[700]),

-- Bar/bat venue variations
('bar-bat-inner-garden-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('bar-bat-inner-restaurant-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('bar-bat-inner-home-center', 1, 1, 1, 600, 3, 200, 300, 200, ARRAY[150], ARRAY[200], ARRAY[250]),

-- Brit venue variations
('brit-inner-garden-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('brit-inner-restaurant-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('brit-inner-home-center', 1, 1, 1, 600, 3, 200, 300, 200, ARRAY[150], ARRAY[200], ARRAY[250]);

-- Phase 5: Final push (votes 801-1000) - Perfect balance
-- Expert users with very accurate voting

-- Add final balanced votes to reach 1000 total
UPDATE votes SET 
    too_low = too_low + 8,
    just_right = just_right + 24,
    too_high = too_high + 8,
    total_amount = total_amount + 40000,
    count = count + 40,
    too_low_amount = too_low_amount + 8000,
    just_right_amount = just_right_amount + 24000,
    too_high_amount = too_high_amount + 8000,
    too_low_samples = too_low_samples || ARRAY[650, 700, 750, 800, 850, 900, 950, 1000],
    just_right_samples = just_right_samples || ARRAY[1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050, 2100, 2150, 2200],
    too_high_samples = too_high_samples || ARRAY[2250, 2300, 2350, 2400, 2450, 2500, 2550, 2600]
WHERE scenario_key = 'wedding-inner-hall-center';

-- Add final scenarios to reach exactly 1000 votes
INSERT INTO votes (scenario_key, too_low, just_right, too_high, total_amount, count, too_low_amount, just_right_amount, too_high_amount, too_low_samples, just_right_samples, too_high_samples) VALUES
-- Final wedding scenarios
('wedding-close-garden-center', 1, 3, 1, 1800, 5, 500, 1200, 400, ARRAY[400], ARRAY[500, 600, 700], ARRAY[800]),

('wedding-close-restaurant-center', 1, 2, 1, 1200, 4, 400, 800, 300, ARRAY[350], ARRAY[500, 600], ARRAY[700]),

('wedding-close-home-center', 1, 2, 1, 1200, 4, 400, 800, 300, ARRAY[350], ARRAY[500, 600], ARRAY[700]),

-- Final bar/bat scenarios
('bar-bat-close-garden-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('bar-bat-close-restaurant-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('bar-bat-close-home-center', 1, 1, 1, 600, 3, 200, 300, 200, ARRAY[150], ARRAY[200], ARRAY[250]),

-- Final brit scenarios
('brit-close-garden-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('brit-close-restaurant-center', 1, 2, 1, 1050, 4, 300, 600, 350, ARRAY[250], ARRAY[300, 350], ARRAY[400]),

('brit-close-home-center', 1, 1, 1, 600, 3, 200, 300, 200, ARRAY[150], ARRAY[200], ARRAY[250]);

-- Add corresponding calculation records for analytics
INSERT INTO calculations (timestamp, scenario, amount, vote_type, scenario_key)
SELECT 
    NOW() - (random() * INTERVAL '30 days') as timestamp,
    json_build_object(
        'eventType', split_part(scenario_key, '-', 1),
        'closeness', split_part(scenario_key, '-', 2),
        'venue', split_part(scenario_key, '-', 3),
        'location', split_part(scenario_key, '-', 4)
    ) as scenario,
    unnest(too_low_samples) as amount,
    'tooLow' as vote_type,
    scenario_key
FROM votes
WHERE array_length(too_low_samples, 1) > 0

UNION ALL

SELECT 
    NOW() - (random() * INTERVAL '30 days') as timestamp,
    json_build_object(
        'eventType', split_part(scenario_key, '-', 1),
        'closeness', split_part(scenario_key, '-', 2),
        'venue', split_part(scenario_key, '-', 3),
        'location', split_part(scenario_key, '-', 4)
    ) as scenario,
    unnest(just_right_samples) as amount,
    'justRight' as vote_type,
    scenario_key
FROM votes
WHERE array_length(just_right_samples, 1) > 0

UNION ALL

SELECT 
    NOW() - (random() * INTERVAL '30 days') as timestamp,
    json_build_object(
        'eventType', split_part(scenario_key, '-', 1),
        'closeness', split_part(scenario_key, '-', 2),
        'venue', split_part(scenario_key, '-', 3),
        'location', split_part(scenario_key, '-', 4)
    ) as scenario,
    unnest(too_high_samples) as amount,
    'tooHigh' as vote_type,
    scenario_key
FROM votes
WHERE array_length(too_high_samples, 1) > 0;

