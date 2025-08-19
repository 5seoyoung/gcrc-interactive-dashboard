/**
 * GCRC Partners Page
 * Partnership management and collaboration platform
 */

import { API } from '../utils/api.js';
import { 
    showNotification, 
    formatNumber, 
    validateEmail, 
    validateRequired 
} from '../utils/helpers.js';

class Partners {
    constructor() {
        this.partnersData = [];
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('partners:refresh', () => {
            this.loadPartners();
        });
    }

    async init() {
        console.log('🤝 파트너십 페이지 초기화...');
        
        try {
            this.renderLayout();
            await this.loadPartners();
            this.setupInteractions();
            
            console.log('✅ 파트너십 페이지 초기화 완료');
            
        } catch (error) {
            console.error('❌ 파트너십 페이지 초기화 실패:', error);
            showNotification('파트너십 페이지 로드에 실패했습니다.', 'error');
        }
    }

    renderLayout() {
        const partnersPage = document.getElementById('partners-page');
        
        partnersPage.innerHTML = `
            <div class="partners-container">
                <div class="partners-header">
                    <h1 class="page-title">🤝 글로벌 파트너십 네트워크</h1>
                    <p class="page-description">전 세계 연구기관, 정부, 기업과 협력하여 기후 변화 대응에 앞장서고 있습니다</p>
                </div>

                <div class="partnership-stats grid grid-4">
                    <div class="stat-card card">
                        <div class="stat-icon">🏛️</div>
                        <div class="stat-content">
                            <h3 class="stat-value" id="research-partners">--</h3>
                            <p class="stat-label">연구 기관</p>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="stat-icon">🛰️</div>
                        <div class="stat-content">
                            <h3 class="stat-value" id="satellite-partners">--</h3>
                            <p class="stat-label">위성 데이터 제공</p>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="stat-icon">🏢</div>
                        <div class="stat-content">
                            <h3 class="stat-value" id="commercial-partners">--</h3>
                            <p class="stat-label">상업적 파트너</p>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <h3 class="stat-value" id="total-datapoints">--</h3>
                            <p class="stat-label">총 데이터 포인트</p>
                        </div>
                    </div>
                </div>

                <div class="partners-filter card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-filter card-icon"></i>
                            파트너 필터
                        </h2>
                        <button class="btn btn-primary" id="apply-for-partnership">
                            <i class="fas fa-plus"></i> 파트너십 신청
                        </button>
                    </div>
                    <div class="filter-controls grid grid-4">
                        <div class="form-group">
                            <label class="form-label">상태</label>
                            <select id="status-filter" class="form-control">
                                <option value="">모든 상태</option>
                                <option value="active">활성</option>
                                <option value="testing">테스트 중</option>
                                <option value="negotiating">협상 중</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">유형</label>
                            <select id="type-filter" class="form-control">
                                <option value="">모든 유형</option>
                                <option value="research">연구</option>
                                <option value="satellite">위성</option>
                                <option value="weather">기상</option>
                                <option value="commercial">상업</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">국가</label>
                            <select id="country-filter" class="form-control">
                                <option value="">모든 국가</option>
                                <option value="USA">미국</option>
                                <option value="EU">유럽연합</option>
                                <option value="KOR">대한민국</option>
                                <option value="International">국제기구</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">검색</label>
                            <input type="text" id="search-filter" class="form-control" placeholder="파트너명 검색">
                        </div>
                    </div>
                </div>

                <div class="partners-grid">
                    <div id="partners-list" class="partners-list grid grid-3">
                        <!-- 파트너 카드들이 여기에 로드됩니다 -->
                    </div>
                </div>

                <div class="partnership-benefits card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-star card-icon"></i>
                            파트너십 혜택
                        </h2>
                    </div>
                    <div class="benefits-grid grid grid-3">
                        <div class="benefit-item">
                            <div class="benefit-icon">📊</div>
                            <h3>데이터 액세스</h3>
                            <p>글로벌 기후 데이터에 우선 접근 권한을 제공받습니다</p>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">🔬</div>
                            <h3>공동 연구</h3>
                            <p>세계 최고 수준의 연구진과 협력 연구 기회를 제공합니다</p>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">🏆</div>
                            <h3>브랜드 인지도</h3>
                            <p>글로벌 기후 이니셔티브의 공식 파트너로 인정받습니다</p>
                        </div>
                    </div>
                </div>

                <!-- Application Modal -->
                <div id="application-modal" class="modal hidden">
                    <div class="modal-content large">
                        <div class="modal-header">
                            <h3>파트너십 신청</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="partnership-form">
                                <div class="form-grid grid grid-2">
                                    <div class="form-group">
                                        <label class="form-label">기관명 *</label>
                                        <input type="text" id="org-name" class="form-control" placeholder="조직 또는 기관 이름" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">담당자 이메일 *</label>
                                        <input type="email" id="contact-email" class="form-control" placeholder="contact@example.com" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">파트너십 목적 *</label>
                                    <textarea id="partnership-purpose" class="form-control" rows="3" placeholder="파트너십을 통해 달성하고자 하는 목표를 설명해주세요" required></textarea>
                                </div>
                                <div class="form-group">
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="agree-terms" required>
                                        <label for="agree-terms">파트너십 약관에 동의합니다 *</label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-outline" id="cancel-application">취소</button>
                            <button class="btn btn-primary" id="submit-application">
                                <i class="fas fa-paper-plane"></i> 신청서 제출
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupInteractions() {
        // Filter controls
        const statusFilter = document.getElementById('status-filter');
        const typeFilter = document.getElementById('type-filter');
        const countryFilter = document.getElementById('country-filter');
        const searchFilter = document.getElementById('search-filter');

        [statusFilter, typeFilter, countryFilter].forEach(filter => {
            filter.addEventListener('change', () => {
                this.filterPartners();
            });
        });

        searchFilter.addEventListener('input', () => {
            this.filterPartners();
        });

        // Application modal
        const applyBtn = document.getElementById('apply-for-partnership');
        const cancelBtn = document.getElementById('cancel-application');
        const submitBtn = document.getElementById('submit-application');

        applyBtn.addEventListener('click', () => {
            this.showApplicationModal();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideApplicationModal();
        });

        submitBtn.addEventListener('click', () => {
            this.submitApplication();
        });

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.classList.add('hidden');
            });
        });
    }

    async loadPartners() {
        try {
            const response = await API.getPartners();
            this.partnersData = response.data || [];
            
            this.updatePartnerStats();
            this.renderPartners();
            
        } catch (error) {
            console.error('파트너 데이터 로드 실패:', error);
            showNotification('파트너 데이터를 불러오는데 실패했습니다.', 'error');
        }
    }

    updatePartnerStats() {
        const research = this.partnersData.filter(p => p.type === 'research').length;
        const satellite = this.partnersData.filter(p => p.type === 'satellite').length;
        const commercial = this.partnersData.filter(p => p.type === 'commercial').length;
        const totalDataPoints = this.partnersData.reduce((sum, p) => sum + (p.dataPoints || 0), 0);

        document.getElementById('research-partners').textContent = research;
        document.getElementById('satellite-partners').textContent = satellite;
        document.getElementById('commercial-partners').textContent = commercial;
        document.getElementById('total-datapoints').textContent = formatNumber(totalDataPoints);
    }

    renderPartners() {
        const partnersList = document.getElementById('partners-list');
        
        if (this.partnersData.length === 0) {
            partnersList.innerHTML = '<div class="no-partners"><p>파트너 데이터를 로드하고 있습니다...</p></div>';
            return;
        }

        partnersList.innerHTML = this.partnersData.map(partner => `
            <div class="partner-card card" data-status="${partner.status}" data-type="${partner.type}" data-country="${partner.country}">
                <div class="partner-header">
                    <div class="partner-info">
                        <h3 class="partner-name">${partner.name}</h3>
                        <div class="partner-meta">
                            <span class="partner-country">${this.getCountryFlag(partner.country)} ${partner.country}</span>
                            <span class="partner-status status-${partner.status}">
                                ${this.getStatusLabel(partner.status)}
                            </span>
                        </div>
                    </div>
                    <div class="partner-type-icon">
                        ${this.getTypeIcon(partner.type)}
                    </div>
                </div>
                <div class="partner-content">
                    <div class="partner-type">
                        <strong>${this.getTypeLabel(partner.type)}</strong>
                    </div>
                    <div class="partner-stats">
                        <div class="stat-item">
                            <span class="stat-label">데이터 포인트</span>
                            <span class="stat-value">${formatNumber(partner.dataPoints || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterPartners() {
        const statusFilter = document.getElementById('status-filter').value;
        const typeFilter = document.getElementById('type-filter').value;
        const countryFilter = document.getElementById('country-filter').value;
        const searchFilter = document.getElementById('search-filter').value.toLowerCase();

        const partnerCards = document.querySelectorAll('.partner-card');
        
        partnerCards.forEach(card => {
            const status = card.dataset.status;
            const type = card.dataset.type;
            const country = card.dataset.country;
            const name = card.querySelector('.partner-name').textContent.toLowerCase();
            
            let visible = true;
            
            if (statusFilter && status !== statusFilter) visible = false;
            if (typeFilter && type !== typeFilter) visible = false;
            if (countryFilter && country !== countryFilter) visible = false;
            if (searchFilter && !name.includes(searchFilter)) visible = false;
            
            card.style.display = visible ? 'block' : 'none';
        });
    }

    getCountryFlag(country) {
        const flags = {
            'USA': '🇺🇸',
            'EU': '🇪🇺',
            'KOR': '🇰🇷',
            'International': '🌍'
        };
        return flags[country] || '🏳️';
    }

    getStatusLabel(status) {
        const labels = {
            'active': '활성',
            'testing': '테스트 중',
            'negotiating': '협상 중'
        };
        return labels[status] || status;
    }

    getTypeIcon(type) {
        const icons = {
            'research': '🔬',
            'satellite': '🛰️',
            'weather': '🌦️',
            'commercial': '🏢'
        };
        return icons[type] || '🏛️';
    }

    getTypeLabel(type) {
        const labels = {
            'research': '연구 기관',
            'satellite': '위성 데이터',
            'weather': '기상 서비스',
            'commercial': '상업적 파트너'
        };
        return labels[type] || type;
    }

    showApplicationModal() {
        const modal = document.getElementById('application-modal');
        modal.classList.remove('hidden');
    }

    hideApplicationModal() {
        const modal = document.getElementById('application-modal');
        modal.classList.add('hidden');
        document.getElementById('partnership-form').reset();
    }

    async submitApplication() {
        try {
            const orgName = document.getElementById('org-name').value;
            const contactEmail = document.getElementById('contact-email').value;
            const purpose = document.getElementById('partnership-purpose').value;
            const agreeTerms = document.getElementById('agree-terms').checked;

            if (!validateRequired(orgName)) {
                showNotification('기관명을 입력해주세요.', 'warning');
                return;
            }

            if (!validateEmail(contactEmail)) {
                showNotification('올바른 이메일 주소를 입력해주세요.', 'warning');
                return;
            }

            if (!validateRequired(purpose)) {
                showNotification('파트너십 목적을 입력해주세요.', 'warning');
                return;
            }

            if (!agreeTerms) {
                showNotification('파트너십 약관에 동의해주세요.', 'warning');
                return;
            }

            const submitBtn = document.getElementById('submit-application');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 제출 중...';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            showNotification('파트너십 신청이 성공적으로 제출되었습니다!', 'success');
            this.hideApplicationModal();
            
        } catch (error) {
            console.error('파트너십 신청 실패:', error);
            showNotification('파트너십 신청에 실패했습니다.', 'error');
            
        } finally {
            const submitBtn = document.getElementById('submit-application');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 신청서 제출';
        }
    }

    destroy() {
        console.log('🧹 파트너십 페이지 정리 완료');
    }
}

// Create partners instance
let partnersInstance = null;

export async function initPartners() {
    if (!partnersInstance) {
        partnersInstance = new Partners();
    }
    
    await partnersInstance.init();
    return partnersInstance;
}

// Export for external access
window.GCRC_Partners = partnersInstance;