const express = require('express');
const router = express.Router();

// GET /api/system/status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'operational',
            uptime: '99.8%',
            activeSensors: 1247 + Math.floor(Math.random() * 10),
            totalDataPoints: 892453 + Math.floor(Math.random() * 1000),
            lastSync: new Date().toISOString(),
            services: {
                database: 'operational',
                blockchain: 'operational',
                api: 'operational',
                monitoring: 'operational'
            },
            performance: {
                avgResponseTime: Math.floor(Math.random() * 100) + 50 + 'ms',
                throughput: Math.floor(Math.random() * 1000) + 500 + ' req/min',
                errorRate: '0.1%'
            }
        }
    });
});

// GET /api/system/risk-map
router.get('/risk-map', (req, res) => {
    const riskRegions = [
        { id: 1, name: '태평양 연안', lat: 37.7749, lng: -122.4194, risk: 85, type: '해수면 상승' },
        { id: 2, name: '사하라 남부', lat: 12.0, lng: 8.0, risk: 92, type: '극심한 가뭄' },
        { id: 3, name: '방글라데시', lat: 23.685, lng: 90.3563, risk: 78, type: '홍수' },
        { id: 4, name: '호주 동부', lat: -33.8688, lng: 151.2093, risk: 71, type: '산불' },
        { id: 5, name: '북극권', lat: 71.0, lng: -8.0, risk: 89, type: '빙하 융해' }
    ];
    
    res.json({
        success: true,
        data: {
            regions: riskRegions,
            lastUpdated: new Date().toISOString(),
            metadata: {
                totalRegions: riskRegions.length,
                avgRisk: riskRegions.reduce((sum, r) => sum + r.risk, 0) / riskRegions.length,
                criticalCount: riskRegions.filter(r => r.risk >= 80).length
            }
        }
    });
});

// POST /api/system/verify-chain
router.post('/verify-chain', (req, res) => {
    const { dataHash } = req.body;
    
    if (!dataHash) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Data hash is required for verification'
            }
        });
    }
    
    // Simulate blockchain verification
    setTimeout(() => {
        res.json({
            success: true,
            data: {
                transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
                verified: true,
                gasUsed: Math.floor(Math.random() * 50000) + 21000,
                confirmations: Math.floor(Math.random() * 10) + 1,
                network: 'ethereum-sepolia',
                timestamp: new Date().toISOString()
            }
        });
    }, 1000 + Math.random() * 2000);
});

module.exports = router;