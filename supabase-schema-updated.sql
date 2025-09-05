-- Updated votes table with separate amount tracking per vote type
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    scenario_key TEXT UNIQUE NOT NULL,
    too_low INTEGER DEFAULT 0,
    just_right INTEGER DEFAULT 0,
    too_high INTEGER DEFAULT 0,
    total_amount INTEGER DEFAULT 0,
    count INTEGER DEFAULT 0,
    -- Separate amount tracking per vote type
    too_low_amount INTEGER DEFAULT 0,
    just_right_amount INTEGER DEFAULT 0,
    too_high_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calculations table for analytics
CREATE TABLE calculations (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scenario JSONB NOT NULL,
    amount INTEGER NOT NULL,
    vote_type TEXT NOT NULL,
    scenario_key TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_votes_scenario_key ON votes(scenario_key);
CREATE INDEX idx_calculations_timestamp ON calculations(timestamp DESC);
CREATE INDEX idx_calculations_scenario_key ON calculations(scenario_key);

-- Enable Row Level Security (RLS)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read/write access
CREATE POLICY "Allow public read access on votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on votes" ON votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on votes" ON votes
    FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on calculations" ON calculations
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on calculations" ON calculations
    FOR INSERT WITH CHECK (true);
