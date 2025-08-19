const express = require('express');
const router = express.Router();

// Mock alerts data
const mockAlerts = [
    {
        id: 1,
        message: '🌊 태평양 해수면 온도 급상승 감지 - 엘니뇨 현상 경고',
        severity: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        region: '태평양 연안'
    },
    {
        id: 2,
        message: '🔥 호주 동부 극심한 가뭄 위험도 증가',
        severity: 'danger',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        region: '호주 동부'
    },
    {
        id: 3,
        message: '❄️ 북극 해빙 면적 계절 평균 대비 15% 감소',
        severity: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        region: '북극권'
    }
];

// GET /api/alerts
router.get('/', (req, res) => {
    const { limit = 10, severity } = req.query;
    
    let filteredAlerts = [...mockAlerts];
    
    if (severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    filteredAlerts = filteredAlerts.slice(0, parseInt(limit));
    
    res.json({
        success: true,
        data: filteredAlerts,
        metadata: {
            total: mockAlerts.length,
            filtered: filteredAlerts.length,
            timestamp: new Date().toISOString()
        }
    });
});

module.exports = router;