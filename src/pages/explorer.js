/**
 * GCRC Data Explorer Page
 * Advanced data filtering and visualization
 */

import { API } from '../utils/api.js';
import { 
    formatDate, 
    formatNumber, 
    showNotification,
    downloadCSV,
    downloadJSON,
    getClimateVariableInfo,
    getCountryInfo
} from '../utils/helpers.js';

class DataExplorer {
    constructor() {
        this.currentData = [];
        this.filteredData = [];
        this.chart = null;
        this.filters = {
            country: '',
            variable: '',
            startDate: '',
            endDate: '',
            quality: ''
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('explorer:init', () => {
            this.loadData();
        });
    }

    async init() {
        console.log('📊 데이터 탐색 페이지 초기화...');
        
        try {
            this.renderLayout();
            await this.loadData();
            this.setupInteractions();
            
            console.log('✅ 데이터 탐색 페이지 초기화 완료');
            
        } catch (error) {
            console.error('❌ 데이터 탐색 페이지 초기화 실패:', error);
            showNotification('데이터 탐색 페이지 로드에 실패했습니다.', 'error');
        }
    }

    renderLayout() {
        const explorerPage = document.getElementById('explorer-page');
        
        explorerPage.innerHTML = `
            <div class="explorer-container">
                <!-- Header -->
                <div class="explorer-header">
                    <h1 class="page-title">
                        📊 기후 데이터 탐색 및 분석
                    </h1>
                    <p class="page-description">
                        전 세계 기후 데이터를 필터링하고 시각화하여 트렌드를 분석하세요
                    </p>
                </div>

                <!-- Filters Section -->
                <div class="filters-section card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-filter card-icon"></i>
                            데이터 필터
                        </h2>
                        <button class="btn btn-outline btn-sm" id="reset-filters">
                            <i class="fas fa-redo"></i> 초기화
                        </button>
                    </div>
                    
                    <div class="filters-grid grid grid-4">
                        <div class="form-group">
                            <label class="form-label">국가</label>
                            <select id="country-filter" class="form-control">
                                <option value="">모든 국가</option>
                                <option value="KOR">🇰🇷 대한민국</option>
                                <option value="USA">🇺🇸 미국</option>
                                <option value="JPN">🇯🇵 일본</option>
                                <option value="CHN">🇨🇳 중국</option>
                                <option value="DEU">🇩🇪 독일</option>
                                <option value="FRA">🇫🇷 프랑스</option>
                                <option value="GBR">🇬🇧 영국</option>
                                <option value="AUS">🇦🇺 호주</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">변수</label>
                            <select id="variable-filter" class="form-control">
                                <option value="">모든 변수</option>
                                <option value="temperature">🌡️ 온도</option>
                                <option value="precipitation">🌧️ 강수량</option>
                                <option value="humidity">💧 습도</option>
                                <option value="pressure">📊 기압</option>
                                <option value="windspeed">💨 풍속</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">시작 날짜</label>
                            <input type="date" id="start-date-filter" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">종료 날짜</label>
                            <input type="date" id="end-date-filter" class="form-control">
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button class="btn btn-primary" id="apply-filters">
                            <i class="fas fa-search"></i> 필터 적용
                        </button>
                        <div class="filter-results">
                            <span id="results-count">0</span>개 데이터 포인트
                        </div>
                    </div>
                </div>

                <!-- Visualization Section -->
                <div class="visualization-grid grid grid-2">
                    <!-- Chart -->
                    <div class="chart-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-chart-line card-icon"></i>
                                시계열 분석
                            </h2>
                            <select id="chart-type" class="form-control">
                                <option value="line">선 그래프</option>
                                <option value="bar">막대 그래프</option>
                                <option value="scatter">산점도</option>
                            </select>
                        </div>
                        <div class="chart-container">
                            <canvas id="data-chart" width="400" height="300"></canvas>
                        </div>
                    </div>

                    <!-- Statistics -->
                    <div class="statistics-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-calculator card-icon"></i>
                                통계 요약
                            </h2>
                        </div>
                        <div id="statistics-content" class="statistics-content">
                            <!-- 통계 데이터가 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <!-- Data Table Section -->
                <div class="data-table-section card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-table card-icon"></i>
                            데이터 테이블
                        </h2>
                        <div class="table-actions">
                            <button class="btn btn-outline btn-sm" id="download-csv">
                                <i class="fas fa-file-csv"></i> CSV 다운로드
                            </button>
                            <button class="btn btn-outline btn-sm" id="download-json">
                                <i class="fas fa-file-code"></i> JSON 다운로드
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table id="data-table" class="data-table">
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>국가</th>
                                    <th>변수</th>
                                    <th>값</th>
                                    <th>단위</th>
                                    <th>품질</th>
                                </tr>
                            </thead>
                            <tbody id="table-body">
                                <!-- 데이터가 여기에 표시됩니다 -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="table-pagination">
                        <button class="btn btn-outline btn-sm" id="prev-page" disabled>
                            <i class="fas fa-chevron-left"></i> 이전
                        </button>
                        <span id="page-info">1 / 1</span>
                        <button class="btn btn-outline btn-sm" id="next-page" disabled>
                            다음 <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupInteractions() {
        // Filter controls
        const countryFilter = document.getElementById('country-filter');
        const variableFilter = document.getElementById('variable-filter');
        const startDateFilter = document.getElementById('start-date-filter');
        const endDateFilter = document.getElementById('end-date-filter');
        const applyFiltersBtn = document.getElementById('apply-filters');
        const resetFiltersBtn = document.getElementById('reset-filters');

        // Set default date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        startDateFilter.value = startDate.toISOString().split('T')[0];
        endDateFilter.value = endDate.toISOString().split('T')[0];

        applyFiltersBtn.addEventListener('click', () => {
            this.applyFilters();
        });

        resetFiltersBtn.addEventListener('click', () => {
            this.resetFilters();
        });

        // Chart type selector
        const chartType = document.getElementById('chart-type');
        chartType.addEventListener('change', (e) => {
            this.updateChart(e.target.value);
        });

        // Download buttons
        const downloadCsvBtn = document.getElementById('download-csv');
        const downloadJsonBtn = document.getElementById('download-json');

        downloadCsvBtn.addEventListener('click', () => {
            this.downloadData('csv');
        });

        downloadJsonBtn.addEventListener('click', () => {
            this.downloadData('json');
        });
    }

    async loadData() {
        try {
            showNotification('데이터를 로드하고 있습니다...', 'info');
            
            const response = await API.getDatasets();
            this.currentData = response.data.datasets || [];
            
            this.applyFilters();
            showNotification('데이터가 성공적으로 로드되었습니다.', 'success');
            
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            showNotification('데이터 로드에 실패했습니다.', 'error');
        }
    }

    applyFilters() {
        const countryFilter = document.getElementById('country-filter').value;
        const variableFilter = document.getElementById('variable-filter').value;
        const startDateFilter = document.getElementById('start-date-filter').value;
        const endDateFilter = document.getElementById('end-date-filter').value;

        this.filters = {
            country: countryFilter,
            variable: variableFilter,
            startDate: startDateFilter,
            endDate: endDateFilter
        };

        this.filteredData = this.currentData.filter(item => {
            let matches = true;

            if (this.filters.country && item.country !== this.filters.country) {
                matches = false;
            }

            if (this.filters.variable && item.variable !== this.filters.variable) {
                matches = false;
            }

            if (this.filters.startDate) {
                const itemDate = new Date(item.timestamp);
                const startDate = new Date(this.filters.startDate);
                if (itemDate < startDate) matches = false;
            }

            if (this.filters.endDate) {
                const itemDate = new Date(item.timestamp);
                const endDate = new Date(this.filters.endDate);
                if (itemDate > endDate) matches = false;
            }

            return matches;
        });

        this.updateResultsCount();
        this.updateChart();
        this.updateTable();
        this.updateStatistics();
    }

    resetFilters() {
        document.getElementById('country-filter').value = '';
        document.getElementById('variable-filter').value = '';
        document.getElementById('start-date-filter').value = '';
        document.getElementById('end-date-filter').value = '';
        
        this.applyFilters();
        showNotification('필터가 초기화되었습니다.', 'info');
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = formatNumber(this.filteredData.length);
        }
    }

    updateChart(chartType = 'line') {
        const ctx = document.getElementById('data-chart');
        if (!ctx || this.filteredData.length === 0) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Prepare chart data
        const chartData = this.prepareChartData();

        this.chart = new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '날짜'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '값'
                        }
                    }
                }
            }
        });
    }

    prepareChartData() {
        // Group data by variable
        const groupedData = {};
        this.filteredData.forEach(item => {
            if (!groupedData[item.variable]) {
                groupedData[item.variable] = [];
            }
            groupedData[item.variable].push({
                x: formatDate(item.timestamp),
                y: item.value
            });
        });

        // Create datasets
        const datasets = Object.entries(groupedData).map(([variable, data], index) => {
            const variableInfo = getClimateVariableInfo(variable);
            const colors = [
                'rgb(37, 99, 235)',
                'rgb(34, 197, 94)',
                'rgb(245, 158, 11)',
                'rgb(239, 68, 68)',
                'rgb(139, 92, 246)'
            ];

            return {
                label: `${variableInfo.label} (${variableInfo.unit})`,
                data: data,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                tension: 0.4
            };
        });

        return { datasets };
    }

    updateTable() {
        const tableBody = document.getElementById('table-body');
        if (!tableBody) return;

        const itemsPerPage = 20;
        const currentPage = 1;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        tableBody.innerHTML = pageData.map(item => {
            const countryInfo = getCountryInfo(item.country);
            const variableInfo = getClimateVariableInfo(item.variable);
            
            return `
                <tr>
                    <td>${formatDate(item.timestamp)}</td>
                    <td>${countryInfo.flag} ${countryInfo.name}</td>
                    <td>${variableInfo.icon} ${variableInfo.label}</td>
                    <td>${formatNumber(item.value, 2)}</td>
                    <td>${item.unit}</td>
                    <td>
                        <span class="quality-badge quality-${item.quality}">
                            ${item.quality}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateStatistics() {
        const statisticsContent = document.getElementById('statistics-content');
        if (!statisticsContent || this.filteredData.length === 0) {
            statisticsContent.innerHTML = '<p class="no-data">필터된 데이터가 없습니다.</p>';
            return;
        }

        // Calculate statistics
        const values = this.filteredData.map(item => item.value);
        const stats = {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
            std: this.calculateStandardDeviation(values)
        };

        statisticsContent.innerHTML = `
            <div class="stats-grid grid grid-2">
                <div class="stat-item">
                    <div class="stat-label">데이터 포인트</div>
                    <div class="stat-value">${formatNumber(stats.count)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">평균값</div>
                    <div class="stat-value">${formatNumber(stats.avg, 2)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">최솟값</div>
                    <div class="stat-value">${formatNumber(stats.min, 2)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">최댓값</div>
                    <div class="stat-value">${formatNumber(stats.max, 2)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">표준편차</div>
                    <div class="stat-value">${formatNumber(stats.std, 2)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">변동 범위</div>
                    <div class="stat-value">${formatNumber(stats.max - stats.min, 2)}</div>
                </div>
            </div>
        `;
    }

    calculateStandardDeviation(values) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }

    downloadData(format) {
        if (this.filteredData.length === 0) {
            showNotification('다운로드할 데이터가 없습니다.', 'warning');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `gcrc-climate-data-${timestamp}`;

        if (format === 'csv') {
            downloadCSV(this.filteredData, `${filename}.csv`);
        } else if (format === 'json') {
            downloadJSON({
                data: this.filteredData,
                filters: this.filters,
                exportTime: new Date().toISOString(),
                totalRecords: this.filteredData.length
            }, `${filename}.json`);
        }

        showNotification(`${format.toUpperCase()} 파일이 다운로드되었습니다.`, 'success');
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        console.log('🧹 데이터 탐색 페이지 정리 완료');
    }
}

// Create explorer instance
let explorerInstance = null;

export async function initExplorer() {
    if (!explorerInstance) {
        explorerInstance = new DataExplorer();
    }
    
    await explorerInstance.init();
    return explorerInstance;
}

// Export for external access
window.GCRC_Explorer = explorerInstance;