-- Simple query showing vote counts and calculated amounts
SELECT 
    scenario_key,
    too_low,
    just_right,
    too_high,
    (too_low + just_right + too_high) as total_votes,
    ROUND(total_amount::numeric / (too_low + just_right + too_high), 0) as avg_amount
FROM votes 
WHERE (too_low + just_right + too_high) > 0
ORDER BY (too_low + just_right + too_high) DESC;
