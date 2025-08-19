/**
 * GCRC Dashboard Page
 * Real-time climate risk monitoring dashboard
 */

import { API } from '../utils/api.js';
import { 
    formatNumber, 
    formatTimeAgo, 
    getRiskLevel, 
    getRiskColor, 
    getRiskLabel,
    showNotification,
    animateNumber 
} from '../utils/helpers.js';

class Dashboard {
    constructor() {
        this.map = null;
        this.riskData = null;
        this.statsChart = null;
        this.alertsData = [];
        this.updateInterval = null;
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Listen for dashboard refresh events
        window.addEventListener('dashboard:refresh', () => {
            this.refreshData();
        });
        
        // Listen for stats updates
        window.addEventListener('stats:updated', (e) => {
            this.updateLiveStats(e.detail);
        });
    }

    async init() {
        console.log('🏠 대시보드 초기화 시작...');
        
        try {
            // Render dashboard layout
            this.renderLayout();
            
            // Load initial data
            await this.loadData();
            
            // Initialize map
            await this.initMap();
            
            // Initialize charts
            this.initCharts();
            
            // Start periodic updates
            this.startPeriodicUpdates();
            
            console.log('✅ 대시보드 초기화 완료');
            
        } catch (error) {
            console.error('❌ 대시보드 초기화 실패:', error);
            showNotification('대시보드 로드에 실패했습니다.', 'error');
        }
    }

    renderLayout() {
        const dashboardPage = document.getElementById('dashboard-page');
        
        dashboardPage.innerHTML = `
            <div class="dashboard-container">
                <!-- Dashboard Header -->
                <div class="dashboard-header">
                    <div class="header-content">
                        <h1 class="dashboard-title">
                            🌍 글로벌 기후 위험 실시간 모니터링
                        </h1>
                        <div class="last-update">
                            마지막 업데이트: <span id="last-update-time">로딩 중...</span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="refresh-btn">
                            <i class="fas fa-sync-alt"></i> 새로고침
                        </button>
                        <button class="btn btn-outline" id="export-btn">
                            <i class="fas fa-download"></i> 내보내기
                        </button>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="stats-grid grid grid-4">
                    <div class="stat-card card">
                        <div class="stat-icon">🌡️</div>
                        <div class="stat-content">
                            <h3 class="stat-value" id="global-temp">--</h3>
                            <p class="stat-label">평균 기온 상승</p>
                            <div class="stat-change positive">+0.2°C</div>
                        </div>
                    </div>
                    
                    <div class="stat-card card">
                        <div class="stat-icon">🌊</div>
                        <div class="stat-content">
                            <h3 class="stat-value" id="sea-level">--</h3>
                            <p class="stat-label">해수면 상승</p>
                            <div class="stat-change positive">+3.2mm</div>
                        </div>
                    </div>
                    
                    <div class="stat-card card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-content">
                            <h3 class="stat-value" id="extreme-events">--</h3>
                            <p class="stat-label">극한 기후 발생</p>
                            <div class="stat-change negative">+15%</div>
                        </div>
                    </div>
                    
                    <div class="stat-card card">
                        <div class="stat-icon">🤖</div>
                        <div class="stat-content">
                            <h3 class="stat-value" id="ai-analysis-score">87%</h3>
                            <p class="stat-label">AI 분석 정확도</p>
                            <div class="stat-change positive">+2.3%</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="main-grid grid grid-3">
                    <!-- Risk Map -->
                    <div class="map-container card" style="grid-column: span 2;">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-globe-americas card-icon"></i>
                                글로벌 기후 위험 지도
                            </h2>
                            <div class="map-controls">
                                <select id="risk-filter" class="form-control">
                                    <option value="all">모든 위험</option>
                                    <option value="해수면 상승">해수면 상승</option>
                                    <option value="극심한 가뭄">극심한 가뭄</option>
                                    <option value="홍수">홍수</option>
                                    <option value="산불">산불</option>
                                    <option value="빙하 융해">빙하 융해</option>
                                </select>
                            </div>
                        </div>
                        <div id="risk-map" class="map-view"></div>
                        <div class="map-legend">
                            <div class="legend-item">
                                <span class="legend-color critical"></span>
                                <span>심각 (80+)</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color high"></span>
                                <span>높음 (60-79)</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color medium"></span>
                                <span>보통 (40-59)</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color low"></span>
                                <span>낮음 (20-39)</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color minimal"></span>
                                <span>최소 (0-19)</span>
                            </div>
                        </div>
                    </div>

                    <!-- Top 5 Risk Regions -->
                    <div class="risk-ranking card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-exclamation-triangle card-icon"></i>
                                위험 지역 TOP 5
                            </h2>
                            <button class="btn btn-outline btn-sm" id="view-all-risks">
                                전체 보기
                            </button>
                        </div>
                        <div id="risk-list" class="risk-list"></div>
                    </div>
                </div>

                <!-- Secondary Grid -->
                <div class="secondary-grid grid grid-2">
                    <!-- Real-time Alerts -->
                    <div class="alerts-container card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-bell card-icon"></i>
                                실시간 경보
                            </h2>
                            <div class="alert-status">
                                <span class="status-dot"></span>
                                <span>실시간 모니터링</span>
                            </div>
                        </div>
                        <div id="alerts-feed" class="alerts-feed"></div>
                    </div>

                    <!-- Quick Stats Chart -->
                    <div class="chart-container card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-chart-line card-icon"></i>
                                위험도 추세
                            </h2>
                            <select id="trend-period" class="form-control">
                                <option value="7d">지난 7일</option>
                                <option value="30d">지난 30일</option>
                                <option value="90d">지난 90일</option>
                            </select>
                        </div>
                        <canvas id="trend-chart" width="400" height="200"></canvas>
                    </div>
                </div>

                <!-- Partner Status -->
                <div class="partners-preview card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-handshake card-icon"></i>
                            파트너 기관 현황
                        </h2>
                        <a href="#" data-page="partners" class="btn btn-outline btn-sm">
                            파트너십 관리
                        </a>
                    </div>
                    <div id="partners-status" class="partners-status grid grid-6"></div>
                </div>
            </div>
        `;

        // Add event listeners for dashboard interactions
        this.setupInteractions();
    }

    setupInteractions() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboardData();
            });
        }

        // Risk filter
        const riskFilter = document.getElementById('risk-filter');
        if (riskFilter) {
            riskFilter.addEventListener('change', (e) => {
                this.filterRiskMap(e.target.value);
            });
        }

        // Trend period selector
        const trendPeriod = document.getElementById('trend-period');
        if (trendPeriod) {
            trendPeriod.addEventListener('change', (e) => {
                this.updateTrendChart(e.target.value);
            });
        }

        // View all risks button
        const viewAllRisks = document.getElementById('view-all-risks');
        if (viewAllRisks) {
            viewAllRisks.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('navigate', {
                    detail: { page: 'explorer' }
                }));
            });
        }
    }

    async loadData() {
        try {
            // Load risk map data
            const riskResponse = await API.getRiskMap();
            this.riskData = riskResponse.data;

            // Load alerts
            const alertsResponse = await API.getAlerts(10);
            this.alertsData = alertsResponse.data;

            // Update UI components
            this.updateRiskRanking();
            this.updateAlertsDisplay();
            this.updateLastUpdateTime();

            // Update statistics with animation
            this.updateStatistics();

        } catch (error) {
            console.error('데이터 로드 실패:', error);
            throw error;
        }
    }

    async initMap() {
        if (!this.riskData) return;

        // Initialize Leaflet map
        this.map = L.map('risk-map').setView([20, 0], 2);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add risk regions as markers
        this.riskData.regions.forEach(region => {
            const riskLevel = getRiskLevel(region.risk);
            const color = getRiskColor(riskLevel);

            const marker = L.circleMarker([region.lat, region.lng], {
                radius: Math.max(8, region.risk / 10),
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map);

            // Add popup
            marker.bindPopup(`
                <div class="map-popup">
                    <h3>${region.name}</h3>
                    <p><strong>위험 유형:</strong> ${region.type}</p>
                    <p><strong>위험도:</strong> ${region.risk}/100 (${getRiskLabel(riskLevel)})</p>
                    <p><strong>좌표:</strong> ${region.lat.toFixed(4)}, ${region.lng.toFixed(4)}</p>
                </div>
            `);
        });
    }

    initCharts() {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;

        // Generate sample trend data
        const trendData = this.generateTrendData();

        this.statsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: '평균 위험도',
                    data: trendData.values,
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    generateTrendData(period = '7d') {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const labels = [];
        const values = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            if (days <= 7) {
                labels.push(date.toLocaleDateString('ko-KR', { weekday: 'short' }));
            } else if (days <= 30) {
                labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
            } else {
                labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
            }
            
            // Generate realistic trend data (generally increasing risk)
            const baseRisk = 45 + (Math.random() - 0.5) * 20;
            const trendFactor = (days - i) * 0.5; // Slight upward trend
            values.push(Math.max(0, Math.min(100, baseRisk + trendFactor)));
        }

        return { labels, values };
    }

    updateRiskRanking() {
        if (!this.riskData) return;

        const riskList = document.getElementById('risk-list');
        if (!riskList) return;

        // Sort regions by risk level (descending)
        const sortedRegions = [...this.riskData.regions]
            .sort((a, b) => b.risk - a.risk)
            .slice(0, 5);

        riskList.innerHTML = sortedRegions.map((region, index) => {
            const riskLevel = getRiskLevel(region.risk);
            const riskColor = getRiskColor(riskLevel);
            
            return `
                <div class="risk-item">
                    <div class="risk-rank">${index + 1}</div>
                    <div class="risk-info">
                        <h4 class="risk-region">${region.name}</h4>
                        <p class="risk-type">${region.type}</p>
                    </div>
                    <div class="risk-score">
                        <div class="risk-value" style="color: ${riskColor}">
                            ${region.risk}
                        </div>
                        <div class="risk-bar">
                            <div class="risk-fill" style="width: ${region.risk}%; background: ${riskColor}"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateAlertsDisplay() {
        if (!this.alertsData) return;

        const alertsFeed = document.getElementById('alerts-feed');
        if (!alertsFeed) return;

        if (this.alertsData.length === 0) {
            alertsFeed.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle"></i>
                    <p>현재 활성 경보가 없습니다</p>
                </div>
            `;
            return;
        }

        alertsFeed.innerHTML = this.alertsData.map(alert => {
            const severityIcon = {
                'critical': '🚨',
                'warning': '⚠️',
                'info': '💡',
                'success': '✅'
            };

            return `
                <div class="alert-item alert-${alert.severity}">
                    <div class="alert-icon">
                        ${severityIcon[alert.severity] || '📢'}
                    </div>
                    <div class="alert-content">
                        <p class="alert-message">${alert.message}</p>
                        <div class="alert-meta">
                            <span class="alert-region">${alert.region}</span>
                            <span class="alert-time">${formatTimeAgo(alert.timestamp)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStatistics() {
        // Animate statistical counters
        const globalTempEl = document.getElementById('global-temp');
        const seaLevelEl = document.getElementById('sea-level');
        const extremeEventsEl = document.getElementById('extreme-events');
        const dataPointsEl = document.getElementById('data-points');

        if (globalTempEl) {
            globalTempEl.textContent = '+1.2°C';
        }
        if (seaLevelEl) {
            seaLevelEl.textContent = '+21.3cm';
        }
        if (extremeEventsEl) {
            animateNumber(extremeEventsEl, 0, 287);
        }
        if (dataPointsEl) {
            animateNumber(dataPointsEl, 0, 892453);
        }
    }

    updateLastUpdateTime() {
        const lastUpdateEl = document.getElementById('last-update-time');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = new Date().toLocaleTimeString('ko-KR');
        }
    }

    filterRiskMap(filterType) {
        if (!this.map || !this.riskData) return;

        // Clear existing markers
        this.map.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                this.map.removeLayer(layer);
            }
        });

        // Filter and add markers based on type
        const filteredRegions = filterType === 'all' 
            ? this.riskData.regions 
            : this.riskData.regions.filter(region => region.type === filterType);

        filteredRegions.forEach(region => {
            const riskLevel = getRiskLevel(region.risk);
            const color = getRiskColor(riskLevel);

            const marker = L.circleMarker([region.lat, region.lng], {
                radius: Math.max(8, region.risk / 10),
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map);

            marker.bindPopup(`
                <div class="map-popup">
                    <h3>${region.name}</h3>
                    <p><strong>위험 유형:</strong> ${region.type}</p>
                    <p><strong>위험도:</strong> ${region.risk}/100 (${getRiskLabel(riskLevel)})</p>
                    <p><strong>좌표:</strong> ${region.lat.toFixed(4)}, ${region.lng.toFixed(4)}</p>
                </div>
            `);
        });

        showNotification(`${filterType === 'all' ? '모든' : filterType} 위험 지역이 표시되었습니다.`, 'info');
    }

    updateTrendChart(period) {
        if (!this.statsChart) return;

        const trendData = this.generateTrendData(period);
        
        this.statsChart.data.labels = trendData.labels;
        this.statsChart.data.datasets[0].data = trendData.values;
        this.statsChart.update();

        showNotification(`${period === '7d' ? '7일' : period === '30d' ? '30일' : '90일'} 추세로 업데이트되었습니다.`, 'info');
    }

    async refreshData() {
        try {
            showNotification('데이터를 새로고침하고 있습니다...', 'info');
            
            await this.loadData();
            
            // Update map if filter is applied
            const riskFilter = document.getElementById('risk-filter');
            if (riskFilter && riskFilter.value !== 'all') {
                this.filterRiskMap(riskFilter.value);
            }
            
            showNotification('데이터가 성공적으로 업데이트되었습니다.', 'success');
            
        } catch (error) {
            console.error('데이터 새로고침 실패:', error);
            showNotification('데이터 새로고침에 실패했습니다.', 'error');
        }
    }

    exportDashboardData() {
        if (!this.riskData) {
            showNotification('내보낼 데이터가 없습니다.', 'warning');
            return;
        }

        const exportData = {
            exportTime: new Date().toISOString(),
            riskRegions: this.riskData.regions,
            alerts: this.alertsData,
            statistics: {
                globalTemperature: '+1.2°C',
                seaLevel: '+21.3cm',
                extremeEvents: 287,
                dataPoints: 892453
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gcrc-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('대시보드 데이터가 내보내기되었습니다.', 'success');
    }

    updateLiveStats(stats) {
        // Update footer statistics from main app
        this.updateStatistics();
        
        // Update any dashboard-specific live elements
        const statusDot = document.querySelector('.alerts-container .status-dot');
        if (statusDot) {
            statusDot.style.animation = 'pulse 1s ease-in-out';
            setTimeout(() => {
                statusDot.style.animation = 'pulse 2s infinite';
            }, 1000);
        }
    }

    startPeriodicUpdates() {
        // Update dashboard every 60 seconds
        this.updateInterval = setInterval(() => {
            this.refreshData();
        }, 60000);
    }

    stopPeriodicUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    destroy() {
        this.stopPeriodicUpdates();
        
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        
        if (this.statsChart) {
            this.statsChart.destroy();
            this.statsChart = null;
        }
        
        console.log('🧹 대시보드 정리 완료');
    }
}

// Create dashboard instance
let dashboardInstance = null;

export async function initDashboard() {
    if (!dashboardInstance) {
        dashboardInstance = new Dashboard();
    }
    
    await dashboardInstance.init();
    return dashboardInstance;
}

// Handle page navigation
window.addEventListener('beforeunload', () => {
    if (dashboardInstance) {
        dashboardInstance.destroy();
    }
});

// Export for external access
window.GCRC_Dashboard = dashboardInstance;