const express = require('express');
const router = express.Router();

// Simulate data submission delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// POST /api/submit
router.post('/', async (req, res) => {
    try {
        // Simulate processing time
        await delay(1000 + Math.random() * 2000);
        
        const { location, measurements, metadata } = req.body;
        
        // Basic validation
        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Location coordinates are required',
                    code: 'MISSING_LOCATION'
                }
            });
        }
        
        if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'At least one measurement is required',
                    code: 'MISSING_MEASUREMENTS'
                }
            });
        }
        
        // Generate response
        const tokenReward = Math.floor(Math.random() * 50) + 10;
        const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        res.json({
            success: true,
            data: {
                submissionId,
                status: 'accepted',
                tokenReward,
                estimatedVerificationTime: '2-5 minutes',
                dataHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                location: {
                    lat: location.lat,
                    lng: location.lng,
                    region: 'Auto-detected region'
                },
                measurements: measurements.map(m => ({
                    ...m,
                    quality: 'pending_review',
                    verified: false
                })),
                blockchain: {
                    network: 'ethereum-sepolia',
                    estimatedGas: Math.floor(Math.random() * 50000) + 21000
                }
            }
        });
        
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            }
        });
    }
});

module.exports = router;