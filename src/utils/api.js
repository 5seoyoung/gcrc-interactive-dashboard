/**
 * GCRC API Utility
 * Handles all API communications and data fetching
 */

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
let MOCK_MODE = import.meta.env?.VITE_MOCK_MODE === 'true' || true; // Default to mock for demo

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.timeout = 10000; // 10 seconds
        this.retryAttempts = 3;
        this.mockData = null;
        
        this.initMockData();
    }

    async initMockData() {
        // Initialize mock data for demo purposes
        this.mockData = {
            riskMap: {
                regions: [
                    { id: 1, name: '태평양 연안', lat: 37.7749, lng: -122.4194, risk: 85, type: '해수면 상승' },
                    { id: 2, name: '사하라 남부', lat: 12.0, lng: 8.0, risk: 92, type: '극심한 가뭄' },
                    { id: 3, name: '방글라데시', lat: 23.685, lng: 90.3563, risk: 78, type: '홍수' },
                    { id: 4, name: '호주 동부', lat: -33.8688, lng: 151.2093, risk: 71, type: '산불' },
                    { id: 5, name: '북극권', lat: 71.0, lng: -8.0, risk: 89, type: '빙하 융해' }
                ],
                lastUpdated: new Date().toISOString()
            },
            alerts: [
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
            ],
            datasets: this.generateMockDatasets(),
            partners: [
                { id: 1, name: 'NASA Earth Science', status: 'active', type: 'research', country: 'USA', dataPoints: 45000 },
                { id: 2, name: 'European Space Agency', status: 'active', type: 'satellite', country: 'EU', dataPoints: 32000 },
                { id: 3, name: 'NOAA Climate Center', status: 'active', type: 'weather', country: 'USA', dataPoints: 28000 },
                { id: 4, name: 'IPCC Working Group', status: 'testing', type: 'research', country: 'International', dataPoints: 15000 },
                { id: 5, name: 'Korea Meteorological Administration', status: 'active', type: 'weather', country: 'KOR', dataPoints: 12000 },
                { id: 6, name: 'Climate Corp', status: 'negotiating', type: 'commercial', country: 'USA', dataPoints: 8000 }
            ],
            systemStatus: {
                status: 'operational',
                uptime: '99.8%',
                activeSensors: 1247,
                totalDataPoints: 892453,
                lastSync: new Date().toISOString()
            }
        };
    }

    generateMockDatasets() {
        const datasets = [];
        const countries = ['KOR', 'USA', 'JPN', 'CHN', 'DEU', 'FRA', 'GBR', 'AUS'];
        const variables = ['temperature', 'precipitation', 'humidity', 'pressure', 'windspeed'];
        
        // Generate last 30 days of data
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            countries.forEach(country => {
                variables.forEach(variable => {
                    datasets.push({
                        id: `${country}_${variable}_${date.toISOString().split('T')[0]}`,
                        country,
                        variable,
                        value: this.generateVariableValue(variable),
                        unit: this.getVariableUnit(variable),
                        timestamp: date.toISOString(),
                        quality: Math.random() > 0.1 ? 'good' : 'fair'
                    });
                });
            });
        }
        
        return datasets;
    }

    generateVariableValue(variable) {
        const baseValues = {
            temperature: 15, // Celsius
            precipitation: 2.5, // mm
            humidity: 65, // %
            pressure: 1013, // hPa
            windspeed: 8 // km/h
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

    getVariableUnit(variable) {
        const units = {
            temperature: '°C',
            precipitation: 'mm',
            humidity: '%',
            pressure: 'hPa',
            windspeed: 'km/h'
        };
        return units[variable] || '';
    }

    async request(endpoint, options = {}) {
        if (MOCK_MODE) {
            return this.mockRequest(endpoint, options);
        }

        const config = {
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), config.timeout);
                
                const response = await fetch(`${this.baseURL}${endpoint}`, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
                
            } catch (error) {
                lastError = error;
                console.warn(`API request attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.retryAttempts) {
                    await this.delay(1000 * attempt); // Exponential backoff
                }
            }
        }
        
        throw lastError;
    }

    async mockRequest(endpoint, options = {}) {
        // Simulate network delay
        await this.delay(200 + Math.random() * 500);
        
        // Parse endpoint and return appropriate mock data
        if (endpoint.includes('/risk-map')) {
            return { success: true, data: this.mockData.riskMap };
        }
        
        if (endpoint.includes('/alerts')) {
            return { success: true, data: this.mockData.alerts };
        }
        
        if (endpoint.includes('/datasets')) {
            return this.handleDatasetsRequest(endpoint);
        }
        
        if (endpoint.includes('/partners')) {
            return { success: true, data: this.mockData.partners };
        }
        
        if (endpoint.includes('/system/status')) {
            return { success: true, data: this.mockData.systemStatus };
        }
        
        if (endpoint.includes('/submit') && options.method === 'POST') {
            return this.handleSubmitRequest(options.body);
        }
        
        if (endpoint.includes('/ai/risk-analysis')) {
            return {
                success: true,
                data: this.generateAIRiskData()
            };
        }

        if (endpoint.includes('/ai/alert-queue')) {
            return {
                success: true,
                data: this.generateAlertQueue()
            };
        }

        if (endpoint.includes('/ai/resource-data')) {
            return {
                success: true,
                data: this.generateResourceData()
            };
        }
        
        throw new Error(`Mock endpoint not found: ${endpoint}`);
    }

    handleDatasetsRequest(endpoint) {
        const url = new URL(endpoint, 'http://localhost');
        const params = url.searchParams;
        
        let filteredData = [...this.mockData.datasets];
        
        // Apply filters
        if (params.get('country')) {
            filteredData = filteredData.filter(d => d.country === params.get('country'));
        }
        
        if (params.get('variable')) {
            filteredData = filteredData.filter(d => d.variable === params.get('variable'));
        }
        
        if (params.get('startDate')) {
            const startDate = new Date(params.get('startDate'));
            filteredData = filteredData.filter(d => new Date(d.timestamp) >= startDate);
        }
        
        if (params.get('endDate')) {
            const endDate = new Date(params.get('endDate'));
            filteredData = filteredData.filter(d => new Date(d.timestamp) <= endDate);
        }
        
        // Pagination
        const page = parseInt(params.get('page')) || 1;
        const limit = parseInt(params.get('limit')) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
            success: true,
            data: {
                datasets: filteredData.slice(startIndex, endIndex),
                pagination: {
                    page,
                    limit,
                    total: filteredData.length,
                    pages: Math.ceil(filteredData.length / limit)
                }
            }
        };
    }

    async handleSubmitRequest(body) {
        // Simulate data validation and blockchain submission
        await this.delay(1000 + Math.random() * 2000);
        
        const tokenReward = Math.floor(Math.random() * 50) + 10; // 10-60 GCRC tokens
        
        return {
            success: true,
            data: {
                submissionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                status: 'accepted',
                tokenReward,
                estimatedVerificationTime: '2-5 minutes',
                dataHash: `0x${Math.random().toString(16).substr(2, 64)}`
            }
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API methods
    async getRiskMap() {
        return this.request('/risk-map');
    }

    async getAIRiskAnalysis() {
        return this.request('/ai/risk-analysis');
    }

    async getAlertQueue() {
        return this.request('/ai/alert-queue');
    }

    async getResourceData() {
        return this.request('/ai/resource-data');
    }

    async getAlerts(limit = 10) {
        return this.request(`/alerts?limit=${limit}`);
    }

    async getDatasets(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/datasets?${params}`);
    }

    async getPartners() {
        return this.request('/partners');
    }

    async getSystemStatus() {
        return this.request('/system/status');
    }

    async submitData(data) {
        return this.request('/submit', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async verifyBlockchain(dataHash) {
        return this.request('/verify-chain', {
            method: 'POST',
            body: JSON.stringify({ dataHash })
        });
    }

    async uploadFile(file, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));
        
        return this.request('/upload', {
            method: 'POST',
            body: formData,
            headers: {} // Remove Content-Type to let browser set it for FormData
        });
    }

    // Utility methods
    isOnline() {
        return navigator.onLine;
    }

    getBaseURL() {
        return this.baseURL;
    }

    setMockMode(enabled) {
        MOCK_MODE = enabled;
    }
}

// Create singleton instance
export const API = new APIClient();

// Export for global access
window.GCRC_API = API;