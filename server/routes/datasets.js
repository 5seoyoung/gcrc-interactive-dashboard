const express = require('express');
const router = express.Router();

// Generate mock datasets
function generateMockDatasets() {
    const datasets = [];
    const countries = ['KOR', 'USA', 'JPN', 'CHN', 'DEU', 'FRA', 'GBR', 'AUS'];
    const variables = ['temperature', 'precipitation', 'humidity', 'pressure', 'windspeed'];
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        countries.forEach(country => {
            variables.forEach(variable => {
                datasets.push({
                    id: `${country}_${variable}_${date.toISOString().split('T')[0]}`,
                    country,
                    variable,
                    value: generateVariableValue(variable),
                    unit: getVariableUnit(variable),
                    timestamp: date.toISOString(),
                    quality: Math.random() > 0.1 ? 'good' : 'fair'
                });
            });
        });
    }
    
    return datasets;
}

function generateVariableValue(variable) {
    const baseValues = {
        temperature: 15,
        precipitation: 2.5,
        humidity: 65,
        pressure: 1013,
        windspeed: 8
    };
    
    const variations = {
        temperature: 15,
        precipitation: 10,
        humidity: 25,
        pressure: 30,
        windspeed: 12
    };
    
    return baseValues[variable] + (Math.random() - 0.5) * 2 * variations[variable];
}

function getVariableUnit(variable) {
    const units = {
        temperature: '°C',
        precipitation: 'mm',
        humidity: '%',
        pressure: 'hPa',
        windspeed: 'km/h'
    };
    return units[variable] || '';
}

// GET /api/datasets
router.get('/', (req, res) => {
    const { country, variable, startDate, endDate, page = 1, limit = 100 } = req.query;
    
    let datasets = generateMockDatasets();
    
    // Apply filters
    if (country) {
        datasets = datasets.filter(d => d.country === country);
    }
    
    if (variable) {
        datasets = datasets.filter(d => d.variable === variable);
    }
    
    if (startDate) {
        const start = new Date(startDate);
        datasets = datasets.filter(d => new Date(d.timestamp) >= start);
    }
    
    if (endDate) {
        const end = new Date(endDate);
        datasets = datasets.filter(d => new Date(d.timestamp) <= end);
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = datasets.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: {
            datasets: paginatedData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: datasets.length,
                pages: Math.ceil(datasets.length / parseInt(limit))
            }
        }
    });
});

module.exports = router;