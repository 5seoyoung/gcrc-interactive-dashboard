/**
 * GCRC - Global Climate Risk Center
 * Main Application Entry Point
 * 2025 HUSS Agora Hackathon
 */

import { API } from './utils/api.js';
import { formatDate, formatNumber, showNotification } from './utils/helpers.js';
import { initDashboard } from './pages/dashboard.js';
import { initExplorer } from './pages/explorer.js';
import { initSubmit } from './pages/submit.js';
import { initAPI } from './pages/api.js';
import { initPartners } from './pages/partners.js';
import { initAIAnalysis } from './pages/ai-analysis.js';

class GCRCApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.realTimeInterval = null;
        this.alertInterval = null;
        this.isLoading = false;
        
        // Real-time data counters
        this.liveStats = {
            sensors: 1247,
            datapoints: 892453,
            partners: 23
        };
        
        this.init();
    }

    async init() {
        console.log('🌍 GCRC App 초기화 시작...');
        
        // Show loading screen
        this.showLoading();
        
        // Initialize API connection
        await this.initAPI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize pages
        await this.initPages();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        // Hide loading screen
        setTimeout(() => {
            this.hideLoading();
        }, 2000);
        
        console.log('✅ GCRC App 초기화 완료');
    }

    async initAPI() {
        try {
            // Test API connection
            const status = await API.getSystemStatus();
            console.log('📡 API 연결 성공:', status);
            
            // Update status indicator
            this.updateConnectionStatus(true);
            
        } catch (error) {
            console.error('❌ API 연결 실패:', error);
            this.updateConnectionStatus(false);
            
            // Use mock data in case of API failure
            console.log('🔄 Mock 데이터로 전환');
        }
    }

    setupEventListeners() {
        // Navigation menu
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Alert banner close button
        const alertClose = document.querySelector('.alert-close');
        if (alertClose) {
            alertClose.addEventListener('click', () => {
                this.hideAlert();
            });
        }

        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    async initPages() {
        try {
            // Initialize all page modules
            await Promise.all([
                initDashboard(),
                initExplorer(),
                initSubmit(),
                initAPI(),
                initPartners(),
                initAIAnalysis()
            ]);
            
            console.log('📄 모든 페이지 초기화 완료');
            
        } catch (error) {
            console.error('❌ 페이지 초기화 실패:', error);
            showNotification('일부 기능을 로드하는데 실패했습니다.', 'warning');
        }
    }

    navigateToPage(pageName) {
        if (this.isLoading) return;
        
        // Update navigation state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
        
        // Update page visibility
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            
            // Trigger page-specific initialization if needed
            this.triggerPageInit(pageName);
            
            console.log(`📱 페이지 전환: ${pageName}`);
        }
    }

    triggerPageInit(pageName) {
        // Trigger specific initialization for each page
        switch (pageName) {
            case 'dashboard':
                window.dispatchEvent(new CustomEvent('dashboard:refresh'));
                break;
            case 'explorer':
                window.dispatchEvent(new CustomEvent('explorer:init'));
                break;
            case 'submit':
                window.dispatchEvent(new CustomEvent('submit:reset'));
                break;
            case 'api':
                window.dispatchEvent(new CustomEvent('api:highlight'));
                break;
            case 'ai-analysis':
                window.dispatchEvent(new CustomEvent('ai-analysis:refresh'));
                break;
        }
    }

    startRealTimeUpdates() {
        // Real-time statistics update (every 30 seconds)
        this.realTimeInterval = setInterval(() => {
            this.updateLiveStats();
        }, 30000);

        // Alert feed update (every 20 seconds)
        this.alertInterval = setInterval(() => {
            this.checkForAlerts();
        }, 20000);

        console.log('⏰ 실시간 업데이트 시작');
    }

    updateLiveStats() {
        // Simulate real-time data updates
        this.liveStats.sensors += Math.floor(Math.random() * 5) - 2; // ±2 변화
        this.liveStats.datapoints += Math.floor(Math.random() * 100) + 50; // +50~150
        
        // Occasionally add new partners
        if (Math.random() < 0.1) {
            this.liveStats.partners += 1;
        }

        // Update footer statistics
        const sensorsEl = document.getElementById('live-sensors');
        const datapointsEl = document.getElementById('live-datapoints');
        const partnersEl = document.getElementById('live-partners');

        if (sensorsEl) sensorsEl.textContent = formatNumber(this.liveStats.sensors);
        if (datapointsEl) datapointsEl.textContent = formatNumber(this.liveStats.datapoints);
        if (partnersEl) partnersEl.textContent = formatNumber(this.liveStats.partners);

        // Trigger dashboard update if on dashboard page
        if (this.currentPage === 'dashboard') {
            window.dispatchEvent(new CustomEvent('stats:updated', {
                detail: this.liveStats
            }));
        }
    }

    async checkForAlerts() {
        try {
            // Check for new climate alerts
            const alerts = await API.getAlerts();
            
            if (alerts && alerts.length > 0) {
                const latestAlert = alerts[0];
                this.showAlert(latestAlert.message, latestAlert.severity);
            }
            
        } catch (error) {
            // Simulate random alerts for demo
            this.simulateAlert();
        }
    }

    simulateAlert() {
        const alerts = [
            { message: '🌊 태평양 해수면 온도 급상승 감지 - 엘니뇨 현상 경고', severity: 'warning' },
            { message: '🔥 호주 동부 극심한 가뭄 위험도 증가', severity: 'danger' },
            { message: '❄️ 북극 해빙 면적 계절 평균 대비 15% 감소', severity: 'warning' },
            { message: '🌪️ 허리케인 시즌 활동 평년 대비 20% 증가 예상', severity: 'danger' },
            { message: '✅ 새로운 파트너 기관 3곳 데이터 공유 시작', severity: 'success' }
        ];

        if (Math.random() < 0.3) { // 30% 확률로 알림 표시
            const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
            this.showAlert(randomAlert.message, randomAlert.severity);
        }
    }

    showAlert(message, severity = 'info') {
        const alertBanner = document.getElementById('alert-banner');
        const alertMessage = document.getElementById('alert-message');
        
        if (alertBanner && alertMessage) {
            alertMessage.textContent = message;
            alertBanner.className = `alert-banner alert-${severity}`;
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
                this.hideAlert();
            }, 8000);
        }
    }

    hideAlert() {
        const alertBanner = document.getElementById('alert-banner');
        if (alertBanner) {
            alertBanner.classList.add('hidden');
        }
    }

    updateConnectionStatus(isOnline) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusDot && statusText) {
            if (isOnline) {
                statusDot.className = 'status-dot online';
                statusText.textContent = '실시간 연결됨';
            } else {
                statusDot.className = 'status-dot offline';
                statusText.textContent = '오프라인 모드';
            }
        }
    }

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            this.isLoading = true;
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.isLoading = false;
            }, 500);
        }
    }

    handleResize() {
        // Handle responsive behavior
        window.dispatchEvent(new CustomEvent('app:resize'));
    }

    handleKeyboard(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.navigateToPage('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToPage('explorer');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateToPage('submit');
                    break;
                case '4':
                    e.preventDefault();
                    this.navigateToPage('api');
                    break;
                case '5':
                    e.preventDefault();
                    this.navigateToPage('partners');
                    break;
            }
        }
    }

    // Public methods for external access
    getCurrentPage() {
        return this.currentPage;
    }

    getLiveStats() {
        return { ...this.liveStats };
    }

    // Cleanup method
    destroy() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        if (this.alertInterval) {
            clearInterval(this.alertInterval);
        }
        
        console.log('🧹 GCRC App 정리 완료');
    }
}

// Global app instance
let gcrcApp;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    gcrcApp = new GCRCApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (gcrcApp) {
        gcrcApp.destroy();
    }
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('🚨 Global Error:', e.error);
    showNotification('예상치 못한 오류가 발생했습니다.', 'error');
});

// Export for external access
window.GCRC = {
    app: () => gcrcApp,
    version: '1.0.0',
    build: new Date().toISOString()
};

console.log('🌍 GCRC Application Script Loaded');