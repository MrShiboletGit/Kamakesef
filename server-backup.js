const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        votes: {},
        calculations: [],
        lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Helper function to read data
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { votes: {}, calculations: [], lastUpdated: new Date().toISOString() };
    }
}

// Helper function to write data
function writeData(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
}

// Generate a unique key for each calculation scenario
function generateScenarioKey(scenario) {
    return `${scenario.eventType}-${scenario.closeness}-${scenario.partySize}-${scenario.incomeTier}-${scenario.venue}-${scenario.location}`;
}

// API Routes

// Get all votes
app.get('/api/votes', (req, res) => {
    const data = readData();
    res.json(data.votes);
});

// Submit a vote
app.post('/api/vote', (req, res) => {
    const { scenario, voteType, amount } = req.body;
    
    if (!scenario || !voteType || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = readData();
    const scenarioKey = generateScenarioKey(scenario);
    
    // Initialize scenario if it doesn't exist
    if (!data.votes[scenarioKey]) {
        data.votes[scenarioKey] = {
            tooLow: 0,
            justRight: 0,
            tooHigh: 0,
            totalAmount: 0,
            count: 0
        };
    }

    // Add the vote
    data.votes[scenarioKey][voteType]++;
    data.votes[scenarioKey].totalAmount += amount;
    data.votes[scenarioKey].count++;

    // Store the calculation for analytics
    data.calculations.push({
        timestamp: new Date().toISOString(),
        scenario,
        amount,
        voteType
    });

    if (writeData(data)) {
        res.json({ success: true, votes: data.votes[scenarioKey] });
    } else {
        res.status(500).json({ error: 'Failed to save vote' });
    }
});

// Get crowd-adjusted amount for a scenario
app.post('/api/calculate', (req, res) => {
    const { scenario, baseAmount } = req.body;
    
    if (!scenario || baseAmount === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = readData();
    const scenarioKey = generateScenarioKey(scenario);
    const scenarioVotes = data.votes[scenarioKey];

    if (!scenarioVotes || scenarioVotes.count === 0) {
        return res.json({ 
            adjustedAmount: baseAmount, 
            crowdData: null,
            message: 'No crowd data available yet'
        });
    }

    // Calculate crowd adjustment
    const total = scenarioVotes.tooLow + scenarioVotes.justRight + scenarioVotes.tooHigh;
    const bias = (scenarioVotes.tooLow - scenarioVotes.tooHigh) / total;
    const factor = 1 + bias * 0.12; // Max ±12% adjustment
    const adjustedAmount = Math.max(0, Math.round(baseAmount * factor / 10) * 10);

    res.json({
        adjustedAmount,
        crowdData: {
            votes: scenarioVotes,
            bias,
            factor,
            averageAmount: Math.round(scenarioVotes.totalAmount / scenarioVotes.count)
        }
    });
});

// Get public vote feed (latest 25 votes)
app.get('/api/public-votes', (req, res) => {
    const data = readData();
    
    // Get latest 25 calculations (votes)
    const recentVotes = data.calculations
        .slice(-25)
        .reverse() // Most recent first
        .map(calc => ({
            id: calc.timestamp,
            timestamp: calc.timestamp,
            scenario: calc.scenario,
            amount: calc.amount,
            voteType: calc.voteType,
            scenarioKey: generateScenarioKey(calc.scenario)
        }));

    res.json({
        votes: recentVotes,
        totalVotes: data.calculations.length,
        lastUpdated: data.lastUpdated
    });
});

// Get public statistics
app.get('/api/public-stats', (req, res) => {
    const data = readData();
    
    const totalVotes = data.calculations.length;
    const uniqueUsers = new Set(data.calculations.map(calc => calc.timestamp.split('T')[0])).size; // Rough estimate by date
    
    res.json({
        totalVotes,
        totalUsers: uniqueUsers,
        lastUpdated: data.lastUpdated
    });
});

// Get analytics data
app.get('/api/analytics', (req, res) => {
    const data = readData();
    
    // Calculate bias trends
    const scenarioAnalysis = Object.entries(data.votes).map(([key, votes]) => {
        const total = votes.tooLow + votes.justRight + votes.tooHigh;
        const bias = total > 0 ? (votes.tooLow - votes.tooHigh) / total : 0;
        const factor = 1 + bias * 0.12;
        
        return {
            scenario: key,
            votes,
            bias,
            factor,
            averageAmount: votes.count > 0 ? Math.round(votes.totalAmount / votes.count) : 0
        };
    });

    const analytics = {
        totalVotes: Object.values(data.votes).reduce((sum, votes) => sum + votes.count, 0),
        totalCalculations: data.calculations.length,
        scenarios: Object.keys(data.votes).length,
        lastUpdated: data.lastUpdated,
        recentCalculations: data.calculations.slice(-10),
        scenarioAnalysis,
        overallBias: calculateOverallBias(data.votes)
    };

    res.json(analytics);
});

// Helper function to calculate overall bias
function calculateOverallBias(votes) {
    let totalTooLow = 0, totalJustRight = 0, totalTooHigh = 0;
    
    Object.values(votes).forEach(vote => {
        totalTooLow += vote.tooLow;
        totalJustRight += vote.justRight;
        totalTooHigh += vote.tooHigh;
    });
    
    const total = totalTooLow + totalJustRight + totalTooHigh;
    if (total === 0) return { bias: 0, factor: 1, message: 'No data yet' };
    
    const bias = (totalTooLow - totalTooHigh) / total;
    const factor = 1 + bias * 0.12;
    
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
    console.log(`Data file: ${DATA_FILE}`);
});
