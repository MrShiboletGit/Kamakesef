const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://zizimviouprvzgvqiweq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppemltdmlvdXBydnpndnFpd2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTc0MzMsImV4cCI6MjA3MjQ5MzQzM30.dsR0WJ5hNZGlAf-y7P794qHBYUA4aqM7I8IvY5fmpro';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Generate a unique key for each calculation scenario (core factors only)
function generateScenarioKey(scenario) {
    return `${scenario.eventType}-${scenario.closeness}-${scenario.venue}-${scenario.location}`;
}

// API Routes

// Get all votes
app.get('/api/votes', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('votes')
            .select('*');
        
        if (error) throw error;
        
        // Convert array to object format for compatibility
        const votesObject = {};
        data.forEach(vote => {
            votesObject[vote.scenario_key] = {
                tooLow: vote.too_low,
                justRight: vote.just_right,
                tooHigh: vote.too_high,
                totalAmount: vote.total_amount,
                count: vote.count
            };
        });
        
        res.json(votesObject);
    } catch (error) {
        console.error('Error fetching votes:', error);
        res.status(500).json({ error: 'Failed to fetch votes' });
    }
});

// Submit a vote
app.post('/api/vote', async (req, res) => {
    const { scenario, fullScenario, voteType, amount } = req.body;
    
    if (!scenario || !voteType || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const scenarioKey = generateScenarioKey(scenario);
        
        // Check if scenario exists
        const { data: existingVote, error: fetchError } = await supabase
            .from('votes')
            .select('*')
            .eq('scenario_key', scenarioKey)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }
        
        let updatedVote;
        
        if (existingVote) {
            // Update existing vote
            const updateData = {
                [voteType === 'tooLow' ? 'too_low' : voteType === 'justRight' ? 'just_right' : 'too_high']: existingVote[voteType === 'tooLow' ? 'too_low' : voteType === 'justRight' ? 'just_right' : 'too_high'] + 1,
                total_amount: existingVote.total_amount + amount,
                count: existingVote.count + 1,
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from('votes')
                .update(updateData)
                .eq('scenario_key', scenarioKey)
                .select()
                .single();
            
            if (error) throw error;
            updatedVote = data;
        } else {
            // Create new vote record
            const newVote = {
                scenario_key: scenarioKey,
                too_low: voteType === 'tooLow' ? 1 : 0,
                just_right: voteType === 'justRight' ? 1 : 0,
                too_high: voteType === 'tooHigh' ? 1 : 0,
                total_amount: amount,
                count: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from('votes')
                .insert([newVote])
                .select()
                .single();
            
            if (error) throw error;
            updatedVote = data;
        }
        
        // Store the calculation for analytics
        await supabase
            .from('calculations')
            .insert([{
                timestamp: new Date().toISOString(),
                scenario: fullScenario || scenario, // Use fullScenario for display if available
                amount: amount,
                vote_type: voteType,
                scenario_key: scenarioKey
            }]);
        
        console.log('Vote submitted successfully:', {
            scenarioKey,
            voteType,
            amount,
            updatedVote: {
                too_low: updatedVote.too_low,
                just_right: updatedVote.just_right,
                too_high: updatedVote.too_high,
                count: updatedVote.count
            }
        });

        res.json({ 
            success: true, 
            votes: {
                tooLow: updatedVote.too_low,
                justRight: updatedVote.just_right,
                tooHigh: updatedVote.too_high,
                totalAmount: updatedVote.total_amount,
                count: updatedVote.count
            }
        });
    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).json({ error: 'Failed to save vote' });
    }
});

// Get crowd-adjusted amount for a scenario
app.post('/api/calculate', async (req, res) => {
    const { scenario, baseAmount } = req.body;
    
    if (!scenario || baseAmount === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const scenarioKey = generateScenarioKey(scenario);
        
        const { data: scenarioVote, error } = await supabase
            .from('votes')
            .select('*')
            .eq('scenario_key', scenarioKey)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (!scenarioVote || scenarioVote.count === 0) {
            return res.json({ 
                adjustedAmount: baseAmount, 
                crowdData: null,
                message: 'No crowd data available yet'
            });
        }

        // Calculate crowd adjustment with scaling
        const total = scenarioVote.too_low + scenarioVote.just_right + scenarioVote.too_high;
        const bias = (scenarioVote.too_low - scenarioVote.too_high) / total;
        
        console.log('Crowd adjustment calculation:', {
            scenarioKey,
            votes: { too_low: scenarioVote.too_low, just_right: scenarioVote.just_right, too_high: scenarioVote.too_high },
            total,
            bias,
            baseAmount
        });
        
        // Scaling system: gradually increase max adjustment as votes increase
        // 1-3 votes: max ±15%
        // 4-8 votes: max ±25% 
        // 9-20 votes: max ±40%
        // 21+ votes: max ±60%
        let maxAdjustment;
        if (total <= 3) {
            maxAdjustment = 0.15; // 15%
        } else if (total <= 8) {
            maxAdjustment = 0.25; // 25%
        } else if (total <= 20) {
            maxAdjustment = 0.40; // 40%
        } else {
            maxAdjustment = 0.60; // 60%
        }
        
        const factor = 1 + bias * maxAdjustment;
        const adjustedAmount = Math.max(0, Math.round(baseAmount * factor / 10) * 10);

        res.json({
            adjustedAmount,
            crowdData: {
                totalVotes: total,
                votes: {
                    tooLow: scenarioVote.too_low,
                    justRight: scenarioVote.just_right,
                    tooHigh: scenarioVote.too_high,
                    totalAmount: scenarioVote.total_amount,
                    count: scenarioVote.count
                },
                bias,
                factor,
                maxAdjustment: Math.round(maxAdjustment * 100), // Show as percentage
                averageAmount: Math.round(scenarioVote.total_amount / scenarioVote.count)
            }
        });
    } catch (error) {
        console.error('Error calculating crowd adjustment:', error);
        res.status(500).json({ error: 'Failed to calculate crowd adjustment' });
    }
});

// Get public vote feed (latest 25 votes)
app.get('/api/public-votes', async (req, res) => {
    try {
        const { data: calculations, error } = await supabase
            .from('calculations')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(25);
        
        if (error) throw error;
        
        const recentVotes = calculations.map(calc => ({
            id: calc.timestamp,
            timestamp: calc.timestamp,
            scenario: calc.scenario,
            amount: calc.amount,
            voteType: calc.vote_type,
            scenarioKey: calc.scenario_key
        }));

        // Get total count
        const { count: totalVotes } = await supabase
            .from('calculations')
            .select('*', { count: 'exact', head: true });

        res.json({
            votes: recentVotes,
            totalVotes: totalVotes || 0,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching public votes:', error);
        res.status(500).json({ error: 'Failed to fetch public votes' });
    }
});

// Get public statistics
app.get('/api/public-stats', async (req, res) => {
    try {
        const { count: totalVotes } = await supabase
            .from('calculations')
            .select('*', { count: 'exact', head: true });
        
        // Get unique users (rough estimate by date)
        const { data: calculations } = await supabase
            .from('calculations')
            .select('timestamp');
        
        const uniqueUsers = new Set(
            calculations?.map(calc => calc.timestamp.split('T')[0]) || []
        ).size;
        
        res.json({
            totalVotes: totalVotes || 0,
            totalUsers: uniqueUsers,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ error: 'Failed to fetch public stats' });
    }
});

// Get analytics data
app.get('/api/analytics', async (req, res) => {
    try {
        const { data: votes, error: votesError } = await supabase
            .from('votes')
            .select('*');
        
        if (votesError) throw votesError;
        
        // Calculate bias trends with scaling
        const scenarioAnalysis = votes.map(vote => {
            const total = vote.too_low + vote.just_right + vote.too_high;
            const bias = total > 0 ? (vote.too_low - vote.too_high) / total : 0;
            
            // Apply same scaling system
            let maxAdjustment;
            if (total <= 5) {
                maxAdjustment = 0.05; // 5%
            } else if (total <= 15) {
                maxAdjustment = 0.15; // 15%
            } else if (total <= 30) {
                maxAdjustment = 0.30; // 30%
            } else {
                maxAdjustment = 0.50; // 50%
            }
            
            const factor = 1 + bias * maxAdjustment;
            
            return {
                scenario: vote.scenario_key,
                votes: {
                    tooLow: vote.too_low,
                    justRight: vote.just_right,
                    tooHigh: vote.too_high,
                    totalAmount: vote.total_amount,
                    count: vote.count
                },
                bias,
                factor,
                averageAmount: vote.count > 0 ? Math.round(vote.total_amount / vote.count) : 0
            };
        });

        const { count: totalCalculations } = await supabase
            .from('calculations')
            .select('*', { count: 'exact', head: true });

        const { data: recentCalculations } = await supabase
            .from('calculations')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);

        const analytics = {
            totalVotes: votes.reduce((sum, vote) => sum + vote.count, 0),
            totalCalculations: totalCalculations || 0,
            scenarios: votes.length,
            lastUpdated: new Date().toISOString(),
            recentCalculations: recentCalculations || [],
            scenarioAnalysis,
            overallBias: calculateOverallBias(votes)
        };

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Helper function to calculate overall bias
function calculateOverallBias(votes) {
    let totalTooLow = 0, totalJustRight = 0, totalTooHigh = 0;
    
    votes.forEach(vote => {
        totalTooLow += vote.too_low;
        totalJustRight += vote.just_right;
        totalTooHigh += vote.too_high;
    });
    
    const total = totalTooLow + totalJustRight + totalTooHigh;
    if (total === 0) return { bias: 0, factor: 1, message: 'No data yet' };
    
    const bias = (totalTooLow - totalTooHigh) / total;
    
    // Use conservative scaling for overall bias (max 20%)
    const maxAdjustment = Math.min(0.20, 0.05 + (total / 100) * 0.15);
    const factor = 1 + bias * maxAdjustment;
    
    return {
        bias: Math.round(bias * 100) / 100,
        factor: Math.round(factor * 1000) / 1000,
        totalVotes: total,
        breakdown: {
            tooLow: totalTooLow,
            justRight: totalJustRight,
            tooHigh: totalTooHigh
        },
        message: bias > 0.1 ? 'Amounts trending higher' : 
                bias < -0.1 ? 'Amounts trending lower' : 
                'Amounts balanced'
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Supabase URL: ${supabaseUrl}`);
});
