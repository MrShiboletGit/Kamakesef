-- Simple version: Populate database with realistic vote data
-- Based on the price logic provided

-- Clear existing data
DELETE FROM calculations;
DELETE FROM votes;

-- Insert sample data for key scenarios
-- Each scenario gets a mix of votes that represent realistic user behavior

-- Wedding + Inner + Hall + Center (base: 800-1300)
INSERT INTO votes (scenario_key, too_low, just_right, too_high, total_amount, count, too_low_amount, just_right_amount, too_high_amount, too_low_samples, just_right_samples, too_high_samples) VALUES
('wedding-inner-hall-center', 2, 6, 2, 6000, 10, 1400, 4200, 1400, ARRAY[700, 750], ARRAY[800, 900, 1000, 1100, 1200, 1300], ARRAY[1400, 1500]),

-- Wedding + Close + Hall + Center (base: 600-800)  
('wedding-close-hall-center', 2, 5, 2, 4200, 9, 1200, 3500, 1200, ARRAY[550, 580], ARRAY[600, 650, 700, 750, 800], ARRAY[900, 1000]),

-- Wedding + Friend + Hall + Center (base: 600-800)
('wedding-friend-hall-center', 3, 4, 3, 4200, 10, 1800, 2800, 1800, ARRAY[500, 550, 600], ARRAY[600, 650, 700, 750], ARRAY[900, 1000, 1100]),

-- Wedding + DistantFamily + Hall + Center (base: 400-600)
('wedding-distantFamily-hall-center', 2, 4, 2, 2400, 8, 800, 1800, 800, ARRAY[350, 380], ARRAY[400, 450, 500, 550], ARRAY[650, 700]),

-- Wedding + Distant + Hall + Center (base: 250-400)
('wedding-distant-hall-center', 2, 3, 2, 1950, 7, 600, 1050, 600, ARRAY[200, 220], ARRAY[250, 300, 350], ARRAY[450, 500]),

-- Bar/Bat + Inner + Hall + Center (base: 350-500)
('bar-bat-inner-hall-center', 1, 5, 2, 2100, 8, 300, 1750, 800, ARRAY[250], ARRAY[350, 400, 450, 500, 550], ARRAY[600, 700]),

-- Bar/Bat + Close + Hall + Center (base: 350-500)
('bar-bat-close-hall-center', 1, 4, 1, 1400, 6, 300, 1100, 400, ARRAY[250], ARRAY[350, 400, 450, 500], ARRAY[600]),

-- Bar/Bat + Friend + Hall + Center (base: 300-450)
('bar-bat-friend-hall-center', 2, 3, 2, 1350, 7, 600, 1050, 600, ARRAY[250, 280], ARRAY[300, 350, 400], ARRAY[500, 600]),

-- Bar/Bat + Distant + Hall + Center (base: 150-250)
('bar-bat-distant-hall-center', 1, 3, 1, 750, 5, 200, 600, 300, ARRAY[100], ARRAY[150, 200, 250], ARRAY[300]),

-- Brit + Inner + Hall + Center (base: 350-500)
('brit-inner-hall-center', 1, 4, 1, 1400, 6, 300, 1100, 400, ARRAY[250], ARRAY[350, 400, 450, 500], ARRAY[600]),

-- Brit + Close + Hall + Center (base: 350-500)
('brit-close-hall-center', 1, 3, 1, 1050, 5, 300, 900, 300, ARRAY[250], ARRAY[350, 400, 450], ARRAY[500]),

-- Brit + Friend + Hall + Center (base: 300-400)
('brit-friend-hall-center', 1, 2, 1, 700, 4, 250, 600, 300, ARRAY[200], ARRAY[300, 350], ARRAY[400]),

-- Brit + Distant + Hall + Center (base: 150-300)
('brit-distant-hall-center', 1, 2, 1, 600, 4, 200, 500, 300, ARRAY[100], ARRAY[150, 250], ARRAY[350]);

-- Add some sample calculations
INSERT INTO calculations (timestamp, scenario, amount, vote_type, scenario_key) VALUES
(NOW() - INTERVAL '1 day', '{"eventType":"wedding","closeness":"inner","venue":"hall","location":"center"}', 1000, 'justRight', 'wedding-inner-hall-center'),
(NOW() - INTERVAL '2 days', '{"eventType":"wedding","closeness":"inner","venue":"hall","location":"center"}', 750, 'tooLow', 'wedding-inner-hall-center'),
(NOW() - INTERVAL '3 days', '{"eventType":"wedding","closeness":"inner","venue":"hall","location":"center"}', 1400, 'tooHigh', 'wedding-inner-hall-center'),
(NOW() - INTERVAL '1 day', '{"eventType":"bar-bat","closeness":"inner","venue":"hall","location":"center"}', 450, 'justRight', 'bar-bat-inner-hall-center'),
(NOW() - INTERVAL '2 days', '{"eventType":"bar-bat","closeness":"inner","venue":"hall","location":"center"}', 300, 'tooLow', 'bar-bat-inner-hall-center'),
(NOW() - INTERVAL '1 day', '{"eventType":"brit","closeness":"inner","venue":"hall","location":"center"}', 400, 'justRight', 'brit-inner-hall-center');

