const express = require('express');
const router = express.Router();

// Mock partners data
const mockPartners = [
    { id: 1, name: 'NASA Earth Science', status: 'active', type: 'research', country: 'USA', dataPoints: 45000 },
    { id: 2, name: 'European Space Agency', status: 'active', type: 'satellite', country: 'EU', dataPoints: 32000 },
    { id: 3, name: 'NOAA Climate Center', status: 'active', type: 'weather', country: 'USA', dataPoints: 28000 },
    { id: 4, name: 'IPCC Working Group', status: 'testing', type: 'research', country: 'International', dataPoints: 15000 },
    { id: 5, name: 'Korea Meteorological Administration', status: 'active', type: 'weather', country: 'KOR', dataPoints: 12000 },
    { id: 6, name: 'Climate Corp', status: 'negotiating', type: 'commercial', country: 'USA', dataPoints: 8000 }
];

// GET /api/partners
router.get('/', (req, res) => {
    const { status, type, country } = req.query;
    
    let filteredPartners = [...mockPartners];
    
    if (status) {
        filteredPartners = filteredPartners.filter(p => p.status === status);
    }
    
    if (type) {
        filteredPartners = filteredPartners.filter(p => p.type === type);
    }
    
    if (country) {
        filteredPartners = filteredPartners.filter(p => p.country === country);
    }
    
    res.json({
        success: true,
        data: filteredPartners,
        metadata: {
            total: mockPartners.length,
            filtered: filteredPartners.length,
            statusBreakdown: {
                active: mockPartners.filter(p => p.status === 'active').length,
                testing: mockPartners.filter(p => p.status === 'testing').length,
                negotiating: mockPartners.filter(p => p.status === 'negotiating').length
            }
        }
    });
});

// POST /api/partners (Partnership application)
router.post('/', (req, res) => {
    const { organizationName, contactEmail, partnershipType, description } = req.body;
    
    if (!organizationName || !contactEmail) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Organization name and contact email are required'
            }
        });
    }
    
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
        success: true,
        data: {
            applicationId,
            status: 'submitted',
            estimatedReviewTime: '5-10 business days',
            nextSteps: [
                'Initial review by GCRC team',
                'Technical integration assessment',
                'Partnership agreement preparation',
                'Pilot program initiation'
            ]
        }
    });
});

module.exports = router;