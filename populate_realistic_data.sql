-- Populate database with realistic vote data based on price logic
-- This creates sample votes that represent reasonable gift amounts for different scenarios

-- First, let's clear existing data to start fresh
DELETE FROM calculations;
DELETE FROM votes;

-- Insert realistic vote data for חתונה (Wedding) scenarios
-- משפחה קרובה (inner): 800-1300 base range
INSERT INTO votes (scenario_key, too_low, just_right, too_high, total_amount, count, too_low_amount, just_right_amount, too_high_amount, too_low_samples, just_right_samples, too_high_samples) VALUES
-- Wedding + Inner + Hall + Center: 800-1300 (no adjustments)
('wedding-inner-hall-center', 3, 8, 2, 10400, 13, 2400, 8800, 2600, ARRAY[700, 750, 780], ARRAY[800, 850, 900, 950, 1000, 1100, 1200, 1300], ARRAY[1400, 1500]),

-- Wedding + Inner + Garden + Center: 800-1300 - 20 = 780-1280
('wedding-inner-garden-center', 2, 6, 1, 6300, 9, 1500, 5400, 900, ARRAY[700, 750], ARRAY[780, 850, 900, 1000, 1100, 1200], ARRAY[1300]),

-- Wedding + Inner + Restaurant + Center: 800-1300 - 40 = 760-1260
('wedding-inner-restaurant-center', 2, 7, 2, 7700, 11, 1500, 6300, 1800, ARRAY[700, 750], ARRAY[760, 850, 900, 1000, 1100, 1200, 1250], ARRAY[1300, 1400]),

-- Wedding + Inner + Home + Center: 800-1300 - 80 = 720-1220
('wedding-inner-home-center', 3, 5, 1, 5400, 9, 2100, 4500, 900, ARRAY[650, 700, 750], ARRAY[720, 800, 900, 1000, 1100], ARRAY[1250]),

-- Wedding + Close + Hall + Center: 600-800 base range
('wedding-close-hall-center', 2, 8, 3, 5600, 13, 1200, 5600, 1800, ARRAY[550, 580], ARRAY[600, 650, 700, 750, 800, 850, 900, 950], ARRAY[1000, 1100, 1200]),

-- Wedding + Friend + Hall + Center: 600-800 base range
('wedding-friend-hall-center', 3, 7, 4, 6300, 14, 1800, 4900, 2000, ARRAY[550, 600, 650], ARRAY[600, 650, 700, 750, 800, 850, 900], ARRAY[950, 1000, 1100, 1200]),

-- Wedding + DistantFamily + Hall + Center: 400-600 base range
('wedding-distantFamily-hall-center', 2, 6, 2, 3000, 10, 800, 2400, 1000, ARRAY[350, 380], ARRAY[400, 450, 500, 550, 600, 650], ARRAY[700, 800]),

-- Wedding + Distant + Hall + Center: 250-400 base range
('wedding-distant-hall-center', 3, 5, 2, 2250, 10, 900, 1750, 800, ARRAY[200, 220, 240], ARRAY[250, 300, 350, 400, 450], ARRAY[500, 600]),

-- Bar/Bat Mitzvah scenarios
-- Bar/Bat + Inner + Hall + Center: 350-500 base range
('bar-bat-inner-hall-center', 2, 6, 2, 2700, 10, 700, 2100, 1000, ARRAY[300, 320], ARRAY[350, 400, 450, 500, 550, 600], ARRAY[650, 700]),

-- Bar/Bat + Close + Hall + Center: 350-500 base range
('bar-bat-close-hall-center', 1, 5, 2, 2100, 8, 400, 1750, 800, ARRAY[300], ARRAY[350, 400, 450, 500, 550], ARRAY[600, 700]),

-- Bar/Bat + Friend + Hall + Center: 300-450 base range
('bar-bat-friend-hall-center', 2, 4, 2, 1800, 8, 600, 1400, 800, ARRAY[250, 280], ARRAY[300, 350, 400, 450], ARRAY[500, 600]),

-- Bar/Bat + DistantFamily + Hall + Center: 250-400 base range
('bar-bat-distantFamily-hall-center', 1, 4, 1, 1400, 6, 300, 1100, 400, ARRAY[200], ARRAY[250, 300, 350, 400], ARRAY[450]),

-- Bar/Bat + Distant + Hall + Center: 150-250 base range
('bar-bat-distant-hall-center', 2, 3, 1, 900, 6, 400, 600, 300, ARRAY[100, 120], ARRAY[150, 200, 250], ARRAY[300]),

-- Brit scenarios
-- Brit + Inner + Hall + Center: 350-500 base range
('brit-inner-hall-center', 1, 5, 2, 2100, 8, 300, 1750, 800, ARRAY[250], ARRAY[350, 400, 450, 500, 550], ARRAY[600, 700]),

-- Brit + Close + Hall + Center: 350-500 base range
('brit-close-hall-center', 1, 4, 1, 1400, 6, 300, 1100, 400, ARRAY[250], ARRAY[350, 400, 450, 500], ARRAY[600]),

-- Brit + Friend + Hall + Center: 300-400 base range
('brit-friend-hall-center', 1, 3, 1, 1050, 5, 250, 900, 300, ARRAY[200], ARRAY[300, 350, 400], ARRAY[450]),

-- Brit + Distant + Hall + Center: 150-300 base range
('brit-distant-hall-center', 1, 2, 1, 600, 4, 200, 500, 300, ARRAY[100], ARRAY[150, 250], ARRAY[350]),

-- Add some North/South/Jerusalem variations
-- Wedding + Inner + Hall + North: 800-1300 - 20 = 780-1280
('wedding-inner-hall-north', 2, 5, 1, 4800, 8, 1500, 3900, 900, ARRAY[700, 750], ARRAY[780, 850, 900, 1000, 1100], ARRAY[1200]),

-- Wedding + Inner + Hall + South: 800-1300 - 20 = 780-1280
('wedding-inner-hall-south', 1, 4, 1, 3600, 6, 700, 3200, 900, ARRAY[650], ARRAY[780, 900, 1000, 1100], ARRAY[1200]),

-- Wedding + Inner + Hall + Jerusalem: 800-1300 + 15 = 815-1315
('wedding-inner-hall-jerusalem', 1, 5, 1, 4500, 7, 700, 4000, 800, ARRAY[650], ARRAY[815, 900, 1000, 1100, 1200], ARRAY[1300]),

-- Add some venue variations
-- Wedding + Inner + Garden + Center: 800-1300 - 20 = 780-1280
('wedding-inner-garden-center', 1, 4, 1, 3600, 6, 700, 3200, 900, ARRAY[650], ARRAY[780, 900, 1000, 1100], ARRAY[1200]),

-- Wedding + Inner + Restaurant + Center: 800-1300 - 40 = 760-1260
('wedding-inner-restaurant-center', 2, 5, 1, 4200, 8, 1400, 3500, 800, ARRAY[650, 700], ARRAY[760, 850, 900, 1000, 1100], ARRAY[1200]),

-- Wedding + Inner + Home + Center: 800-1300 - 80 = 720-1220
('wedding-inner-home-center', 2, 4, 1, 3600, 7, 1400, 2800, 800, ARRAY[650, 700], ARRAY[720, 800, 900, 1000], ARRAY[1100]);

-- Insert corresponding calculation records for analytics
INSERT INTO calculations (timestamp, scenario, amount, vote_type, scenario_key) VALUES
-- Sample calculations for the votes above (just a few examples)
(NOW() - INTERVAL '1 day', '{"eventType":"wedding","closeness":"inner","venue":"hall","location":"center"}', 1000, 'justRight', 'wedding-inner-hall-center'),
(NOW() - INTERVAL '2 days', '{"eventType":"wedding","closeness":"inner","venue":"hall","location":"center"}', 750, 'tooLow', 'wedding-inner-hall-center'),
(NOW() - INTERVAL '3 days', '{"eventType":"wedding","closeness":"inner","venue":"hall","location":"center"}', 1400, 'tooHigh', 'wedding-inner-hall-center'),
(NOW() - INTERVAL '1 day', '{"eventType":"bar-bat","closeness":"inner","venue":"hall","location":"center"}', 450, 'justRight', 'bar-bat-inner-hall-center'),
(NOW() - INTERVAL '2 days', '{"eventType":"bar-bat","closeness":"inner","venue":"hall","location":"center"}', 300, 'tooLow', 'bar-bat-inner-hall-center'),
(NOW() - INTERVAL '1 day', '{"eventType":"brit","closeness":"inner","venue":"hall","location":"center"}', 400, 'justRight', 'brit-inner-hall-center');

