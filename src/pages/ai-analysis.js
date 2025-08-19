/**
 * GCRC AI Risk Analysis Engine
 * Real-time AI-powered disaster risk assessment and response optimization
 */

import { API } from '../utils/api.js';
import { 
    showNotification, 
    formatNumber, 
    formatTimeAgo,
    getRiskLevel,
    getRiskColor 
} from '../utils/helpers.js';

class AIAnalysisEngine {
    constructor() {
        this.analysisInterval = null;
        this.riskData = [];
        this.alertQueue = [];
        this.resourceData = [];
        this.priorityMatrix = [];
        
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('ai-analysis:refresh', () => {
            this.runAnalysis();
        });
    }

    async init() {
        console.log('🤖 AI 위험도 분석 엔진 초기화...');
        
        try {
            this.renderLayout();
            await this.loadInitialData();
            this.setupInteractions();
            this.startRealTimeAnalysis();
            
            console.log('✅ AI 분석 엔진 초기화 완료');
            
        } catch (error) {
            console.error('❌ AI 분석 엔진 초기화 실패:', error);
            showNotification('AI 분석 엔진 로드에 실패했습니다.', 'error');
        }
    }

    renderLayout() {
        const aiPage = document.getElementById('ai-analysis-page');
        
        aiPage.innerHTML = `
            <div class="ai-analysis-container">
                <!-- Header -->
                <div class="ai-analysis-header">
                    <h1 class="page-title">
                        🤖 AI 위험도 분석 엔진
                    </h1>
                    <p class="page-description">
                        5분 단위 전 세계 데이터 분석을 통한 실시간 재난 위험도 평가 및 대응 최적화
                    </p>
                    <div class="analysis-status">
                        <div class="status-indicator">
                            <span class="status-dot analyzing"></span>
                            <span class="status-text">AI 분석 중...</span>
                        </div>
                        <div class="next-analysis">
                            다음 분석: <span id="next-analysis-time">4분 23초</span>
                        </div>
                    </div>
                </div>

                <!-- Real-time Analysis Dashboard -->
                <div class="analysis-dashboard grid grid-4">
                    <div class="analysis-card card">
                        <div class="card-header">
                            <h3 class="card-title">🔍 실시간 분석</h3>
                            <div class="analysis-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="analysis-progress"></div>
                                </div>
                                <span class="progress-text">87%</span>
                            </div>
                        </div>
                        <div class="analysis-stats">
                            <div class="stat-item">
                                <span class="stat-value" id="data-sources">1,247</span>
                                <span class="stat-label">데이터 소스</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="analysis-speed">5.2초</span>
                                <span class="stat-label">분석 속도</span>
                            </div>
                        </div>
                    </div>

                    <div class="risk-index-card card">
                        <div class="card-header">
                            <h3 class="card-title">📊 글로벌 위험 지수</h3>
                        </div>
                        <div class="risk-index-display">
                            <div class="risk-gauge">
                                <canvas id="risk-gauge-chart" width="120" height="120"></canvas>
                                <div class="gauge-value">
                                    <span class="gauge-number" id="global-risk-score">73</span>
                                    <span class="gauge-unit">/100</span>
                                </div>
                            </div>
                            <div class="risk-trend">
                                <span class="trend-indicator up">↗️ +5.2</span>
                                <span class="trend-text">지난 1시간 대비</span>
                            </div>
                        </div>
                    </div>

                    <div class="alert-system-card card">
                        <div class="card-header">
                            <h3 class="card-title">🚨 다국어 경보 발송</h3>
                        </div>
                        <div class="alert-stats">
                            <div class="stat-item">
                                <span class="stat-value" id="active-alerts">12</span>
                                <span class="stat-label">활성 경보</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="languages-supported">47</span>
                                <span class="stat-label">지원 언어</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="alert-recipients">2.3M</span>
                                <span class="stat-label">수신 대상</span>
                            </div>
                        </div>
                    </div>

                    <div class="response-optimization-card card">
                        <div class="card-header">
                            <h3 class="card-title">🎯 대응 최적화</h3>
                        </div>
                        <div class="optimization-stats">
                            <div class="stat-item">
                                <span class="stat-value" id="resource-efficiency">94%</span>
                                <span class="stat-label">자원 효율성</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="response-time">12분</span>
                                <span class="stat-label">평균 대응시간</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Analysis Content -->
                <div class="main-analysis-grid grid grid-3">
                    <!-- Risk Heat Map -->
                    <div class="risk-heatmap-section card" style="grid-column: span 2;">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-fire card-icon"></i>
                                실시간 위험도 히트맵
                            </h2>
                            <div class="heatmap-controls">
                                <select id="risk-type-filter" class="form-control">
                                    <option value="all">모든 위험</option>
                                    <option value="flood">홍수</option>
                                    <option value="earthquake">지진</option>
                                    <option value="typhoon">태풍</option>
                                    <option value="wildfire">산불</option>
                                    <option value="drought">가뭄</option>
                                </select>
                                <button class="btn btn-primary btn-sm" id="update-heatmap">
                                    <i class="fas fa-sync"></i> 업데이트
                                </button>
                            </div>
                        </div>
                        <div id="ai-risk-map" class="ai-risk-map"></div>
                        <div class="heatmap-legend">
                            <div class="legend-title">위험도</div>
                            <div class="legend-items">
                                <div class="legend-item">
                                    <span class="legend-color extreme"></span>
                                    <span>극한 (90+)</span>
                                </div>
                                <div class="legend-item">
                                    <span class="legend-color high"></span>
                                    <span>높음 (70-89)</span>
                                </div>
                                <div class="legend-item">
                                    <span class="legend-color medium"></span>
                                    <span>보통 (40-69)</span>
                                </div>
                                <div class="legend-item">
                                    <span class="legend-color low"></span>
                                    <span>낮음 (0-39)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Priority Response Queue -->
                    <div class="priority-queue-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-list-ol card-icon"></i>
                                대응 우선순위
                            </h2>
                        </div>
                        <div id="priority-queue" class="priority-queue">
                            <!-- 우선순위 목록이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <!-- Secondary Analysis Grid -->
                <div class="secondary-analysis-grid grid grid-2">
                    <!-- Multi-language Alert System -->
                    <div class="alert-system-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-globe card-icon"></i>
                                다국어 경보 시스템
                            </h2>
                            <button class="btn btn-primary btn-sm" id="send-test-alert">
                                <i class="fas fa-paper-plane"></i> 테스트 발송
                            </button>
                        </div>
                        <div class="alert-system-content">
                            <div class="language-distribution">
                                <h4>실시간 경보 발송 현황</h4>
                                <div id="language-chart-container">
                                    <canvas id="language-distribution-chart" width="300" height="200"></canvas>
                                </div>
                            </div>
                            <div class="recent-alerts">
                                <h4>최근 발송 경보</h4>
                                <div id="recent-alerts-list" class="recent-alerts-list">
                                    <!-- 최근 경보 목록 -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Resource Allocation Simulation -->
                    <div class="resource-simulation-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-truck card-icon"></i>
                                자원 배분 시뮬레이션
                            </h2>
                            <div class="simulation-controls">
                                <button class="btn btn-outline btn-sm" id="run-simulation">
                                    <i class="fas fa-play"></i> 시뮬레이션 실행
                                </button>
                            </div>
                        </div>
                        <div class="simulation-content">
                            <div class="resource-optimization">
                                <h4>최적화된 자원 배치</h4>
                                <div class="optimization-results">
                                    <div class="optimization-item">
                                        <span class="optimization-label">구급차 배치</span>
                                        <span class="optimization-value">15대 → 최적 경로</span>
                                        <span class="optimization-efficiency">+23% 효율</span>
                                    </div>
                                    <div class="optimization-item">
                                        <span class="optimization-label">소방차 배치</span>
                                        <span class="optimization-value">8대 → 최적 경로</span>
                                        <span class="optimization-efficiency">+31% 효율</span>
                                    </div>
                                    <div class="optimization-item">
                                        <span class="optimization-label">의료진 배치</span>
                                        <span class="optimization-value">45명 → 3개 거점</span>
                                        <span class="optimization-efficiency">+18% 효율</span>
                                    </div>
                                </div>
                            </div>
                            <div class="weather-traffic-factors">
                                <h4>실시간 영향 요소</h4>
                                <div class="factors-list">
                                    <div class="factor-item">
                                        <span class="factor-icon">🌧️</span>
                                        <span class="factor-text">강우로 인한 도로 지연 +12분</span>
                                    </div>
                                    <div class="factor-item">
                                        <span class="factor-icon">🚦</span>
                                        <span class="factor-text">교통 체증으로 우회 경로 추천</span>
                                    </div>
                                    <div class="factor-item">
                                        <span class="factor-icon">🌪️</span>
                                        <span class="factor-text">강풍으로 헬기 운항 제한</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Analysis Metrics -->
                <div class="ai-metrics-section card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-brain card-icon"></i>
                            AI 분석 성능 지표
                        </h2>
                    </div>
                    <div class="metrics-grid grid grid-6">
                        <div class="metric-item">
                            <div class="metric-value" id="accuracy-rate">97.3%</div>
                            <div class="metric-label">예측 정확도</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value" id="processing-speed">2.1초</div>
                            <div class="metric-label">데이터 처리 속도</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value" id="false-positive">3.2%</div>
                            <div class="metric-label">오탐률</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value" id="coverage-area">187개국</div>
                            <div class="metric-label">분석 커버리지</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value" id="model-updates">24회</div>
                            <div class="metric-label">일일 모델 업데이트</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value" id="alert-delivery">99.8%</div>
                            <div class="metric-label">경보 전달률</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupInteractions() {
        // Risk type filter
        const riskTypeFilter = document.getElementById('risk-type-filter');
        riskTypeFilter.addEventListener('change', (e) => {
            this.updateRiskHeatmap(e.target.value);
        });

        // Update heatmap button
        const updateHeatmapBtn = document.getElementById('update-heatmap');
        updateHeatmapBtn.addEventListener('click', () => {
            this.runInstantAnalysis();
        });

        // Send test alert button
        const sendTestAlertBtn = document.getElementById('send-test-alert');
        sendTestAlertBtn.addEventListener('click', () => {
            this.sendTestAlert();
        });

        // Run simulation button
        const runSimulationBtn = document.getElementById('run-simulation');
        runSimulationBtn.addEventListener('click', () => {
            this.runResourceSimulation();
        });
    }

    async loadInitialData() {
        try {
            // Load risk analysis data
            const riskResponse = await API.getAIRiskAnalysis();
            this.riskData = riskResponse.data || this.generateMockRiskData();

            // Load alert queue
            const alertResponse = await API.getAlertQueue();
            this.alertQueue = alertResponse.data || this.generateMockAlerts();

            // Load resource data
            const resourceResponse = await API.getResourceData();
            this.resourceData = resourceResponse.data || this.generateMockResourceData();

            this.updateAllDisplays();

        } catch (error) {
            console.error('AI 분석 데이터 로드 실패:', error);
            // Use mock data
            this.riskData = this.generateMockRiskData();
            this.alertQueue = this.generateMockAlerts();
            this.resourceData = this.generateMockResourceData();
            this.updateAllDisplays();
        }
    }

    generateMockRiskData() {
        return [
            { region: '필리핀 북부', lat: 16.0, lng: 120.0, risk: 92, type: 'typhoon', population: 2500000, priority: 1 },
            { region: '캘리포니아 남부', lat: 34.0, lng: -118.0, risk: 85, type: 'wildfire', population: 15000000, priority: 2 },
            { region: '방글라데시 남동부', lat: 22.0, lng: 91.0, risk: 78, type: 'flood', population: 8000000, priority: 3 },
            { region: '일본 중부', lat: 35.0, lng: 138.0, risk: 72, type: 'earthquake', population: 25000000, priority: 4 },
            { region: '호주 동남부', lat: -37.0, lng: 145.0, risk: 68, type: 'drought', population: 5000000, priority: 5 }
        ];
    }

    generateMockAlerts() {
        return [
            {
                id: 1,
                region: '필리핀 북부',
                message: 'Category 4 typhoon approaching - Immediate evacuation required',
                languages: ['English', 'Filipino', 'Cebuano'],
                recipients: 2500000,
                sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                deliveryRate: 98.5
            },
            {
                id: 2,
                region: '캘리포니아 남부',
                message: 'Extreme fire weather conditions - Red Flag Warning',
                languages: ['English', 'Spanish'],
                recipients: 8500000,
                sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                deliveryRate: 99.2
            }
        ];
    }

    generateMockResourceData() {
        return {
            ambulances: { total: 45, deployed: 38, efficiency: 94 },
            firetrucks: { total: 28, deployed: 22, efficiency: 89 },
            helicopters: { total: 12, deployed: 8, efficiency: 76 },
            medical_teams: { total: 150, deployed: 127, efficiency: 92 }
        };
    }

    startRealTimeAnalysis() {
        // Start 5-minute analysis cycle
        this.analysisInterval = setInterval(() => {
            this.runAnalysis();
        }, 5 * 60 * 1000); // 5 minutes

        // Start countdown timer
        this.startCountdownTimer();
        
        // Initial analysis
        this.runAnalysis();
    }

    startCountdownTimer() {
        let timeLeft = 5 * 60; // 5 minutes in seconds
        
        const countdownInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            const nextAnalysisTime = document.getElementById('next-analysis-time');
            if (nextAnalysisTime) {
                nextAnalysisTime.textContent = `${minutes}분 ${seconds.toString().padStart(2, '0')}초`;
            }
            
            timeLeft--;
            
            if (timeLeft < 0) {
                timeLeft = 5 * 60; // Reset to 5 minutes
            }
        }, 1000);
    }

    async runAnalysis() {
        try {
            console.log('🤖 AI 위험도 분석 실행 중...');
            
            // Update status
            const statusDot = document.querySelector('.status-dot');
            const statusText = document.querySelector('.status-text');
            if (statusDot && statusText) {
                statusDot.className = 'status-dot analyzing';
                statusText.textContent = 'AI 분석 중...';
            }

            // Simulate analysis progress
            this.simulateAnalysisProgress();

            // Update risk data
            await this.updateRiskAnalysis();

            // Process priority queue
            this.updatePriorityQueue();

            // Update global risk score
            this.updateGlobalRiskScore();

            // Complete analysis
            setTimeout(() => {
                if (statusDot && statusText) {
                    statusDot.className = 'status-dot complete';
                    statusText.textContent = '분석 완료';
                }
                
                showNotification('AI 위험도 분석이 완료되었습니다.', 'success');
            }, 3000);

        } catch (error) {
            console.error('AI 분석 실행 실패:', error);
            showNotification('AI 분석 중 오류가 발생했습니다.', 'error');
        }
    }

    simulateAnalysisProgress() {
        const progressFill = document.getElementById('analysis-progress');
        if (!progressFill) return;

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) {
                progress = 100;
                clearInterval(progressInterval);
            }
            progressFill.style.width = `${progress}%`;
        }, 200);
    }

    async updateRiskAnalysis() {
        // Simulate new risk calculations
        this.riskData.forEach(region => {
            // Add some random variation to simulate real-time changes
            const variation = (Math.random() - 0.5) * 10;
            region.risk = Math.max(0, Math.min(100, region.risk + variation));
        });

        // Update heatmap
        this.updateRiskHeatmap('all');
    }

    updateRiskHeatmap(riskType) {
        // Initialize map if not exists
        if (!this.riskMap) {
            this.riskMap = L.map('ai-risk-map').setView([20, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.riskMap);
        }

        // Clear existing markers
        this.riskMap.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                this.riskMap.removeLayer(layer);
            }
        });

        // Filter data by risk type
        const filteredData = riskType === 'all' 
            ? this.riskData 
            : this.riskData.filter(region => region.type === riskType);

        // Add new markers
        filteredData.forEach(region => {
            const color = this.getIntensityColor(region.risk);
            const marker = L.circleMarker([region.lat, region.lng], {
                radius: Math.max(10, region.risk / 5),
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.riskMap);

            marker.bindPopup(`
                <div class="ai-popup">
                    <h3>${region.region}</h3>
                    <p><strong>위험 유형:</strong> ${this.getRiskTypeLabel(region.type)}</p>
                    <p><strong>AI 위험도:</strong> ${region.risk.toFixed(1)}/100</p>
                    <p><strong>인구:</strong> ${formatNumber(region.population)}명</p>
                    <p><strong>우선순위:</strong> ${region.priority}순위</p>
                </div>
            `);
        });
    }

    getIntensityColor(risk) {
        if (risk >= 90) return '#8B0000'; // Dark red (extreme)
        if (risk >= 70) return '#DC143C'; // Red (high)
        if (risk >= 40) return '#FF8C00'; // Orange (medium)
        return '#32CD32'; // Green (low)
    }

    getRiskTypeLabel(type) {
        const labels = {
            'typhoon': '태풍',
            'wildfire': '산불',
            'flood': '홍수',
            'earthquake': '지진',
            'drought': '가뭄'
        };
        return labels[type] || type;
    }

    updatePriorityQueue() {
        const queueContainer = document.getElementById('priority-queue');
        if (!queueContainer) return;

        // Sort by priority and risk level
        const sortedRegions = [...this.riskData]
            .sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return b.risk - a.risk;
            })
            .slice(0, 8);

        queueContainer.innerHTML = sortedRegions.map(region => `
            <div class="priority-item priority-${region.priority}">
                <div class="priority-badge">${region.priority}</div>
                <div class="priority-content">
                    <h4 class="priority-region">${region.region}</h4>
                    <div class="priority-details">
                        <span class="priority-type">${this.getRiskTypeLabel(region.type)}</span>
                        <span class="priority-risk">위험도 ${region.risk.toFixed(1)}</span>
                    </div>
                    <div class="priority-factors">
                        <span class="factor">인명피해가능성: 높음</span>
                        <span class="factor">인프라중요도: ${region.priority <= 2 ? '높음' : '보통'}</span>
                    </div>
                </div>
                <div class="priority-actions">
                    <button class="btn btn-primary btn-sm deploy-resources" data-region="${region.region}">
                        <i class="fas fa-truck"></i> 자원 배치
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        queueContainer.querySelectorAll('.deploy-resources').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const region = e.target.closest('button').dataset.region;
                this.deployResources(region);
            });
        });
    }

    updateGlobalRiskScore() {
        const globalRiskScore = document.getElementById('global-risk-score');
        if (!globalRiskScore) return;

        // Calculate weighted average based on population
        const totalPopulation = this.riskData.reduce((sum, region) => sum + region.population, 0);
        const weightedRisk = this.riskData.reduce((sum, region) => {
            return sum + (region.risk * region.population / totalPopulation);
        }, 0);

        // Animate to new value
        const currentValue = parseInt(globalRiskScore.textContent);
        const targetValue = Math.round(weightedRisk);
        
        this.animateValue(globalRiskScore, currentValue, targetValue, 2000);
    }

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * progress;
            element.textContent = Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    async sendTestAlert() {
        try {
            showNotification('다국어 테스트 경보를 발송하고 있습니다...', 'info');
            
            // Simulate alert sending
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const testAlert = {
                id: Date.now(),
                region: '테스트 지역',
                message: 'This is a test alert for system verification',
                languages: ['한국어', '영어', '일본어', '중국어'],
                recipients: 50000,
                sentAt: new Date().toISOString(),
                deliveryRate: 99.7
            };
            
            this.alertQueue.unshift(testAlert);
            this.updateRecentAlerts();
            
            showNotification('테스트 경보가 성공적으로 발송되었습니다! (47개 언어)', 'success');
            
        } catch (error) {
            console.error('테스트 경보 발송 실패:', error);
            showNotification('테스트 경보 발송에 실패했습니다.', 'error');
        }
    }

    updateRecentAlerts() {
        const alertsList = document.getElementById('recent-alerts-list');
        if (!alertsList) return;

        alertsList.innerHTML = this.alertQueue.slice(0, 5).map(alert => `
            <div class="recent-alert-item">
                <div class="alert-header">
                    <span class="alert-region">${alert.region}</span>
                    <span class="alert-time">${formatTimeAgo(alert.sentAt)}</span>
                </div>
                <div class="alert-content">
                    <p class="alert-message">${alert.message}</p>
                    <div class="alert-stats">
                        <span class="alert-languages">${alert.languages.length}개 언어</span>
                        <span class="alert-recipients">${formatNumber(alert.recipients)}명</span>
                        <span class="alert-delivery">${alert.deliveryRate}% 전달</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async runResourceSimulation() {
        try {
            const simulationBtn = document.getElementById('run-simulation');
            const originalText = simulationBtn.innerHTML;
            
            simulationBtn.disabled = true;
            simulationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 시뮬레이션 중...';
            
            showNotification('자원 배분 시뮬레이션을 실행하고 있습니다...', 'info');
            
            // Simulate complex optimization calculation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Update optimization results with new random values
            this.updateOptimizationResults();
            
            showNotification('자원 배분 최적화가 완료되었습니다! 평균 23% 효율 향상', 'success');
            
        } catch (error) {
            console.error('자원 시뮬레이션 실패:', error);
            showNotification('자원 시뮬레이션에 실패했습니다.', 'error');
            
        } finally {
            const simulationBtn = document.getElementById('run-simulation');
            simulationBtn.disabled = false;
            simulationBtn.innerHTML = '<i class="fas fa-play"></i> 시뮬레이션 실행';
        }
    }

    updateOptimizationResults() {
        const optimizationItems = document.querySelectorAll('.optimization-item');
        
        optimizationItems.forEach(item => {
            const efficiencyElement = item.querySelector('.optimization-efficiency');
            if (efficiencyElement) {
                const newEfficiency = Math.floor(Math.random() * 20) + 15; // 15-35% improvement
                efficiencyElement.textContent = `+${newEfficiency}% 효율`;
                efficiencyElement.style.animation = 'pulse 1s ease-in-out';
            }
        });

        // Update weather/traffic factors
        this.updateEnvironmentalFactors();
    }

    updateEnvironmentalFactors() {
        const factorsList = document.querySelector('.factors-list');
        if (!factorsList) return;

        const weatherConditions = [
            { icon: '🌧️', text: '강우로 인한 도로 지연 +12분' },
            { icon: '🌪️', text: '강풍으로 헬기 운항 제한' },
            { icon: '🌫️', text: '안개로 시야 확보 어려움' },
            { icon: '☀️', text: '맑음, 모든 경로 정상 운행' },
            { icon: '❄️', text: '결빙으로 산간 도로 통제' }
        ];

        const trafficConditions = [
            { icon: '🚦', text: '교통 체증으로 우회 경로 추천' },
            { icon: '🚧', text: '도로 공사로 2차선 통제' },
            { icon: '🚨', text: '사고로 인한 일시 차단' },
            { icon: '✅', text: '모든 도로 원활한 소통' }
        ];

        const selectedWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const selectedTraffic = trafficConditions[Math.floor(Math.random() * trafficConditions.length)];

        factorsList.innerHTML = `
            <div class="factor-item">
                <span class="factor-icon">${selectedWeather.icon}</span>
                <span class="factor-text">${selectedWeather.text}</span>
            </div>
            <div class="factor-item">
                <span class="factor-icon">${selectedTraffic.icon}</span>
                <span class="factor-text">${selectedTraffic.text}</span>
            </div>
            <div class="factor-item">
                <span class="factor-icon">📱</span>
                <span class="factor-text">실시간 GPS 데이터 반영됨</span>
            </div>
        `;
    }

    deployResources(regionName) {
        showNotification(`${regionName}에 긴급 자원을 배치하고 있습니다...`, 'info');
        
        // Simulate resource deployment
        setTimeout(() => {
            showNotification(`${regionName} 자원 배치 완료! 예상 도착 시간: 18분`, 'success');
        }, 2000);
    }

    runInstantAnalysis() {
        showNotification('긴급 분석을 실행하고 있습니다...', 'info');
        
        // Update analysis progress
        this.simulateAnalysisProgress();
        
        // Quick update of risk data
        setTimeout(() => {
            this.updateRiskAnalysis();
            showNotification('긴급 분석이 완료되었습니다.', 'success');
        }, 2000);
    }

    updateAllDisplays() {
        this.updateRiskHeatmap('all');
        this.updatePriorityQueue();
        this.updateGlobalRiskScore();
        this.updateRecentAlerts();
        this.createLanguageDistributionChart();
        this.updateAIMetrics();
    }

    createLanguageDistributionChart() {
        const ctx = document.getElementById('language-distribution-chart');
        if (!ctx) return;

        const languageData = {
            labels: ['영어', '중국어', '스페인어', '힌디어', '아랍어', '기타'],
            datasets: [{
                data: [28, 22, 18, 12, 8, 12],
                backgroundColor: [
                    '#3B82F6', '#EF4444', '#10B981', 
                    '#F59E0B', '#8B5CF6', '#6B7280'
                ]
            }]
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: languageData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            fontSize: 12
                        }
                    }
                }
            }
        });
    }

    updateAIMetrics() {
        // Simulate real-time AI performance metrics
        const metrics = {
            'accuracy-rate': (97 + Math.random() * 2).toFixed(1) + '%',
            'processing-speed': (2 + Math.random()).toFixed(1) + '초',
            'false-positive': (3 + Math.random()).toFixed(1) + '%',
            'coverage-area': '187개국',
            'model-updates': Math.floor(20 + Math.random() * 10) + '회',
            'alert-delivery': (99 + Math.random()).toFixed(1) + '%'
        };

        Object.entries(metrics).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                element.style.animation = 'pulse 0.5s ease-in-out';
            }
        });
    }

    destroy() {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
        
        if (this.riskMap) {
            this.riskMap.remove();
        }
        
        console.log('🧹 AI 분석 엔진 정리 완료');
    }
}

// Create AI analysis instance
let aiAnalysisInstance = null;

export async function initAIAnalysis() {
    if (!aiAnalysisInstance) {
        aiAnalysisInstance = new AIAnalysisEngine();
    }
    
    await aiAnalysisInstance.init();
    return aiAnalysisInstance;
}

// Export for external access
window.GCRC_AIAnalysis = aiAnalysisInstance;