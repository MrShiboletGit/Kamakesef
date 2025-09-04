warning: LF will be replaced by CRLF in server.js.
The file will have its original line endings in your working directory
[1mdiff --git a/server.js b/server.js[m
[1mindex a9c9830..54862af 100644[m
[1m--- a/server.js[m
[1m+++ b/server.js[m
[36m@@ -188,11 +188,61 @@[m [mapp.post('/api/calculate', async (req, res) => {[m
             });[m
         }[m
 [m
[31m-        // Calculate crowd adjustment with scaling[m
[32m+[m[32m        // Calculate crowd adjustment with special handling for "justRight" votes[m
         const total = scenarioVote.too_low + scenarioVote.just_right + scenarioVote.too_high;[m
[32m+[m[41m        [m
[32m+[m[32m        // If we have "justRight" votes, use them as the target price[m
[32m+[m[32m        if (scenarioVote.just_right > 0) {[m
[32m+[m[32m            // Calculate average amount from "justRight" votes[m
[32m+[m[32m            const justRightAverage = scenarioVote.total_amount / scenarioVote.count;[m
[32m+[m[41m            [m
[32m+[m[32m            // Calculate how much we need to adjust from base amount to reach the target[m
[32m+[m[32m            const targetAdjustment = (justRightAverage - baseAmount) / baseAmount;[m
[32m+[m[41m            [m
[32m+[m[32m            // Apply the adjustment, but limit it to reasonable bounds[m
[32m+[m[32m            const maxAdjustment = Math.min(0.5, Math.max(0.1, 0.05 + (scenarioVote.just_right / 10) * 0.2)); // 10-50% max[m
[32m+[m[32m            const limitedAdjustment = Math.max(-maxAdjustment, Math.min(maxAdjustment, targetAdjustment));[m
[32m+[m[41m            [m
[32m+[m[32m            const factor = 1 + limitedAdjustment;[m
[32m+[m[32m            const adjustedAmount = Math.max(0, Math.round(baseAmount * factor / 10) * 10);[m
[32m+[m[41m            [m
[32m+[m[32m            console.log('Crowd adjustment calculation (justRight target):', {[m
[32m+[m[32m                scenarioKey,[m
[32m+[m[32m                votes: { too_low: scenarioVote.too_low, just_right: scenarioVote.just_right, too_high: scenarioVote.too_high },[m
[32m+[m[32m                justRightAverage,[m
[32m+[m[32m                baseAmount,[m
[32m+[m[32m                targetAdjustment,[m
[32m+[m[32m                limitedAdjustment,[m
[32m+[m[32m                factor,[m
[32m+[m[32m                adjustedAmount[m
[32m+[m[32m            });[m
[32m+[m[41m            [m
[32m+[m[32m            res.json({[m
[32m+[m[32m                adjustedAmount,[m
[32m+[m[32m                crowdData: {[m
[32m+[m[32m                    totalVotes: total,[m
[32m+[m[32m                    votes: {[m
[32m+[m[32m                        tooLow: scenarioVote.too_low,[m
[32m+[m[32m                        justRight: scenarioVote.just_right,[m
[32m+[m[32m                        tooHigh: scenarioVote.too_high,[m
[32m+[m[32m                        totalAmount: scenarioVote.total_amount,[m
[32m+[m[32m                        count: scenarioVote.count[m
[32m+[m[32m                    },[m
[32m+[m[32m                    bias: limitedAdjustment,[m
[32m+[m[32m                    factor,[m
[32m+[m[32m                    maxAdjustment: Math.round(maxAdjustment * 100), // Show as percentage[m
[32m+[m[32m                    averageAmount: Math.round(scenarioVote.total_amount / scenarioVote.count),[m
[32m+[m[32m                    targetPrice: justRightAverage,[m
[32m+[m[32m                    adjustmentType: 'justRight_target'[m
[32m+[m[32m                }[m
[32m+[m[32m            });[m
[32m+[m[32m            return;[m
[32m+[m[32m        }[m
[32m+[m[41m        [m
[32m+[m[32m        // Fallback to traditional bias calculation if no "justRight" votes[m
         const bias = (scenarioVote.too_low - scenarioVote.too_high) / total;[m
         [m
[31m-        console.log('Crowd adjustment calculation:', {[m
[32m+[m[32m        console.log('Crowd adjustment calculation (traditional bias):', {[m
             scenarioKey,[m
             votes: { too_low: scenarioVote.too_low, just_right: scenarioVote.just_right, too_high: scenarioVote.too_high },[m
             total,[m
[36m@@ -219,7 +269,7 @@[m [mapp.post('/api/calculate', async (req, res) => {[m
         const factor = 1 + bias * maxAdjustment;[m
         const adjustedAmount = Math.max(0, Math.round(baseAmount * factor / 10) * 10);[m
         [m
[31m-        console.log('Final adjustment result:', {[m
[32m+[m[32m        console.log('Final adjustment result (traditional bias):', {[m
             maxAdjustment,[m
             factor,[m
             baseAmount,[m
[36m@@ -241,7 +291,8 @@[m [mapp.post('/api/calculate', async (req, res) => {[m
                 bias,[m
                 factor,[m
                 maxAdjustment: Math.round(maxAdjustment * 100), // Show as percentage[m
[31m-                averageAmount: Math.round(scenarioVote.total_amount / scenarioVote.count)[m
[32m+[m[32m                averageAmount: Math.round(scenarioVote.total_amount / scenarioVote.count),[m
[32m+[m[32m                adjustmentType: 'traditional_bias'[m
             }[m
         });[m
     } catch (error) {[m
