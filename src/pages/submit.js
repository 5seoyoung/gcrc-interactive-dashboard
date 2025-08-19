/**
 * GCRC Data Submit Page
 * Citizen science data contribution platform
 */

import { API } from '../utils/api.js';
import { 
    showNotification,
    validateCoordinates,
    validateRequired,
    validateNumber,
    showLoading,
    hideLoading
} from '../utils/helpers.js';

class DataSubmit {
    constructor() {
        this.uploadedFiles = [];
        this.measurements = [];
        this.location = { lat: null, lng: null };
        
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('submit:reset', () => {
            this.resetForm();
        });
    }

    async init() {
        console.log('📤 데이터 제출 페이지 초기화...');
        
        try {
            this.renderLayout();
            this.setupInteractions();
            this.setupDragAndDrop();
            
            console.log('✅ 데이터 제출 페이지 초기화 완료');
            
        } catch (error) {
            console.error('❌ 데이터 제출 페이지 초기화 실패:', error);
            showNotification('데이터 제출 페이지 로드에 실패했습니다.', 'error');
        }
    }

    renderLayout() {
        const submitPage = document.getElementById('submit-page');
        
        submitPage.innerHTML = `
            <div class="submit-container">
                <!-- Header -->
                <div class="submit-header">
                    <h1 class="page-title">
                        📤 기후 데이터 기여하기
                    </h1>
                    <p class="page-description">
                        여러분의 측정 데이터로 기후 변화 연구에 기여하고 GCRC 토큰을 받으세요
                    </p>
                </div>

                <!-- Submission Form -->
                <div class="submission-form">
                    <!-- Location Section -->
                    <div class="location-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-map-marker-alt card-icon"></i>
                                위치 정보
                            </h2>
                            <button class="btn btn-outline btn-sm" id="get-location">
                                <i class="fas fa-crosshairs"></i> 현재 위치
                            </button>
                        </div>
                        
                        <div class="location-grid grid grid-2">
                            <div class="form-group">
                                <label class="form-label">위도 (Latitude)</label>
                                <input type="number" id="latitude" class="form-control" 
                                       placeholder="예: 37.5665" step="0.0001" min="-90" max="90">
                                <small class="form-help">-90 ~ 90 범위</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">경도 (Longitude)</label>
                                <input type="number" id="longitude" class="form-control" 
                                       placeholder="예: 126.9780" step="0.0001" min="-180" max="180">
                                <small class="form-help">-180 ~ 180 범위</small>
                            </div>
                        </div>
                        
                        <div class="location-preview">
                            <div id="location-display" class="location-display">
                                <i class="fas fa-info-circle"></i>
                                위치를 입력하거나 현재 위치를 가져오세요
                            </div>
                        </div>
                    </div>

                    <!-- Manual Data Entry -->
                    <div class="manual-entry-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-keyboard card-icon"></i>
                                측정값 직접 입력
                            </h2>
                            <button class="btn btn-primary btn-sm" id="add-measurement">
                                <i class="fas fa-plus"></i> 측정값 추가
                            </button>
                        </div>
                        
                        <div class="measurement-form">
                            <div class="measurement-grid grid grid-4">
                                <div class="form-group">
                                    <label class="form-label">변수</label>
                                    <select id="measurement-variable" class="form-control">
                                        <option value="">선택하세요</option>
                                        <option value="temperature">🌡️ 온도</option>
                                        <option value="precipitation">🌧️ 강수량</option>
                                        <option value="humidity">💧 습도</option>
                                        <option value="pressure">📊 기압</option>
                                        <option value="windspeed">💨 풍속</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">값</label>
                                    <input type="number" id="measurement-value" class="form-control" 
                                           placeholder="측정값" step="0.01">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">단위</label>
                                    <input type="text" id="measurement-unit" class="form-control" 
                                           placeholder="자동 설정됨" readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">측정 시간</label>
                                    <input type="datetime-local" id="measurement-time" class="form-control">
                                </div>
                            </div>
                        </div>
                        
                        <div id="measurements-list" class="measurements-list">
                            <!-- 추가된 측정값들이 여기에 표시됩니다 -->
                        </div>
                    </div>

                    <!-- File Upload Section -->
                    <div class="file-upload-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-file-upload card-icon"></i>
                                파일 업로드
                            </h2>
                            <div class="file-info">
                                <small>지원 형식: CSV, JSON, TXT (최대 10MB)</small>
                            </div>
                        </div>
                        
                        <div id="dropzone" class="dropzone">
                            <div class="dropzone-content">
                                <i class="fas fa-cloud-upload-alt dropzone-icon"></i>
                                <h3>파일을 여기에 드래그하거나 클릭하여 업로드</h3>
                                <p>여러 파일을 한번에 업로드할 수 있습니다</p>
                                <input type="file" id="file-input" multiple 
                                       accept=".csv,.json,.txt" style="display: none;">
                                <button class="btn btn-outline" id="browse-files">
                                    파일 선택
                                </button>
                            </div>
                        </div>
                        
                        <div id="uploaded-files" class="uploaded-files">
                            <!-- 업로드된 파일들이 여기에 표시됩니다 -->
                        </div>
                    </div>

                    <!-- Metadata Section -->
                    <div class="metadata-section card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-info card-icon"></i>
                                추가 정보
                            </h2>
                        </div>
                        
                        <div class="metadata-grid grid grid-2">
                            <div class="form-group">
                                <label class="form-label">기여자 이름 (선택)</label>
                                <input type="text" id="contributor-name" class="form-control" 
                                       placeholder="이름 또는 닉네임">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">기관 (선택)</label>
                                <input type="text" id="contributor-org" class="form-control" 
                                       placeholder="소속 기관">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">설명 (선택)</label>
                            <textarea id="submission-description" class="form-control" 
                                      placeholder="측정 방법, 장비, 또는 특이사항을 설명해주세요" 
                                      rows="3"></textarea>
                        </div>
                    </div>

                    <!-- Submission Actions -->
                    <div class="submission-actions card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <i class="fas fa-rocket card-icon"></i>
                                데이터 제출
                            </h2>
                        </div>
                        
                        <div class="submission-preview">
                            <div class="preview-stats">
                                <div class="stat-item">
                                    <span class="stat-label">측정값:</span>
                                    <span id="measurements-count">0</span>개
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">파일:</span>
                                    <span id="files-count">0</span>개
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">예상 리워드:</span>
                                    <span id="estimated-reward">0</span> GCRC
                                </div>
                            </div>
                        </div>
                        
                        <div class="submission-buttons">
                            <button class="btn btn-outline" id="preview-submission">
                                <i class="fas fa-eye"></i> 미리보기
                            </button>
                            <button class="btn btn-primary" id="submit-data" disabled>
                                <i class="fas fa-paper-plane"></i> 데이터 제출
                            </button>
                        </div>
                        
                        <div class="submission-info">
                            <p>
                                <i class="fas fa-shield-alt"></i>
                                제출된 데이터는 블록체인에 안전하게 저장되며, 검증 후 토큰이 지급됩니다.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Submission Result Modal -->
                <div id="submission-modal" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>제출 결과</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div id="modal-body" class="modal-body">
                            <!-- 제출 결과가 여기에 표시됩니다 -->
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" id="modal-ok">확인</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupInteractions() {
        // Location controls
        const getLocationBtn = document.getElementById('get-location');
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');

        getLocationBtn.addEventListener('click', () => {
            this.getCurrentLocation();
        });

        [latInput, lngInput].forEach(input => {
            input.addEventListener('input', () => {
                this.updateLocationDisplay();
            });
        });

        // Measurement controls
        const addMeasurementBtn = document.getElementById('add-measurement');
        const measurementVariable = document.getElementById('measurement-variable');
        const measurementTime = document.getElementById('measurement-time');

        // Set current time as default
        measurementTime.value = new Date().toISOString().slice(0, 16);

        measurementVariable.addEventListener('change', (e) => {
            this.updateMeasurementUnit(e.target.value);
        });

        addMeasurementBtn.addEventListener('click', () => {
            this.addMeasurement();
        });

        // File upload controls
        const browseFilesBtn = document.getElementById('browse-files');
        const fileInput = document.getElementById('file-input');

        browseFilesBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Submission controls
        const previewBtn = document.getElementById('preview-submission');
        const submitBtn = document.getElementById('submit-data');

        previewBtn.addEventListener('click', () => {
            this.previewSubmission();
        });

        submitBtn.addEventListener('click', () => {
            this.submitData();
        });

        // Modal controls
        const modalClose = document.querySelector('.modal-close');
        const modalOk = document.getElementById('modal-ok');

        [modalClose, modalOk].forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal();
            });
        });
    }

    setupDragAndDrop() {
        const dropzone = document.getElementById('dropzone');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileSelection(files);
        });
    }

    getCurrentLocation() {
        if (!navigator.geolocation) {
            showNotification('이 브라우저는 위치 서비스를 지원하지 않습니다.', 'error');
            return;
        }

        const loadingOverlay = showLoading(document.querySelector('.location-section'), '위치 정보 가져오는 중...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                document.getElementById('latitude').value = lat.toFixed(6);
                document.getElementById('longitude').value = lng.toFixed(6);

                this.updateLocationDisplay();
                hideLoading(document.querySelector('.location-section'));
                showNotification('현재 위치가 설정되었습니다.', 'success');
            },
            (error) => {
                hideLoading(document.querySelector('.location-section'));
                let message = '위치 정보를 가져올 수 없습니다.';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = '위치 접근 권한이 거부되었습니다.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = '위치 정보를 사용할 수 없습니다.';
                        break;
                    case error.TIMEOUT:
                        message = '위치 정보 요청이 시간 초과되었습니다.';
                        break;
                }
                
                showNotification(message, 'error');
            }
        );
    }

    updateLocationDisplay() {
        const lat = parseFloat(document.getElementById('latitude').value);
        const lng = parseFloat(document.getElementById('longitude').value);
        const display = document.getElementById('location-display');

        if (validateCoordinates(lat, lng)) {
            this.location = { lat, lng };
            display.innerHTML = `
                <i class="fas fa-check-circle text-success"></i>
                위치: ${lat.toFixed(6)}, ${lng.toFixed(6)}
                <small>(위도, 경도)</small>
            `;
            display.className = 'location-display valid';
        } else {
            this.location = { lat: null, lng: null };
            display.innerHTML = `
                <i class="fas fa-exclamation-circle text-warning"></i>
                올바른 위도(-90~90)와 경도(-180~180)를 입력하세요
            `;
            display.className = 'location-display invalid';
        }

        this.updateSubmitButton();
    }

    updateMeasurementUnit(variable) {
        const unitInput = document.getElementById('measurement-unit');
        const units = {
            temperature: '°C',
            precipitation: 'mm',
            humidity: '%',
            pressure: 'hPa',
            windspeed: 'km/h'
        };

        unitInput.value = units[variable] || '';
    }

    addMeasurement() {
        const variable = document.getElementById('measurement-variable').value;
        const value = parseFloat(document.getElementById('measurement-value').value);
        const unit = document.getElementById('measurement-unit').value;
        const time = document.getElementById('measurement-time').value;

        // Validation
        if (!validateRequired(variable)) {
            showNotification('변수를 선택해주세요.', 'warning');
            return;
        }

        if (!validateNumber(value)) {
            showNotification('올바른 측정값을 입력해주세요.', 'warning');
            return;
        }

        if (!validateRequired(time)) {
            showNotification('측정 시간을 입력해주세요.', 'warning');
            return;
        }

        // Add measurement
        const measurement = {
            id: Date.now(),
            variable,
            value,
            unit,
            timestamp: new Date(time).toISOString()
        };

        this.measurements.push(measurement);
        this.updateMeasurementsList();
        this.clearMeasurementForm();
        this.updateSubmitButton();

        showNotification('측정값이 추가되었습니다.', 'success');
    }

    updateMeasurementsList() {
        const listContainer = document.getElementById('measurements-list');
        const count = document.getElementById('measurements-count');

        count.textContent = this.measurements.length;

        if (this.measurements.length === 0) {
            listContainer.innerHTML = '';
            return;
        }

        listContainer.innerHTML = `
            <h4>추가된 측정값 (${this.measurements.length}개)</h4>
            <div class="measurements-grid">
                ${this.measurements.map(m => `
                    <div class="measurement-item" data-id="${m.id}">
                        <div class="measurement-info">
                            <strong>${this.getVariableLabel(m.variable)}</strong>
                            <span class="measurement-value">${m.value} ${m.unit}</span>
                            <small class="measurement-time">${new Date(m.timestamp).toLocaleString('ko-KR')}</small>
                        </div>
                        <button class="btn btn-outline btn-sm remove-measurement" data-id="${m.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // Add remove event listeners
        listContainer.querySelectorAll('.remove-measurement').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.removeMeasurement(id);
            });
        });
    }

    getVariableLabel(variable) {
        const labels = {
            temperature: '🌡️ 온도',
            precipitation: '🌧️ 강수량',
            humidity: '💧 습도',
            pressure: '📊 기압',
            windspeed: '💨 풍속'
        };
        return labels[variable] || variable;
    }

    removeMeasurement(id) {
        this.measurements = this.measurements.filter(m => m.id !== id);
        this.updateMeasurementsList();
        this.updateSubmitButton();
        showNotification('측정값이 제거되었습니다.', 'info');
    }

    clearMeasurementForm() {
        document.getElementById('measurement-variable').value = '';
        document.getElementById('measurement-value').value = '';
        document.getElementById('measurement-unit').value = '';
        document.getElementById('measurement-time').value = new Date().toISOString().slice(0, 16);
    }

    handleFileSelection(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.uploadedFiles.push({
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            }
        });

        this.updateFilesList();
        this.updateSubmitButton();
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['.csv', '.json', '.txt'];

        if (file.size > maxSize) {
            showNotification(`파일 크기가 너무 큽니다: ${file.name} (최대 10MB)`, 'error');
            return false;
        }

        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(extension)) {
            showNotification(`지원하지 않는 파일 형식입니다: ${file.name}`, 'error');
            return false;
        }

        return true;
    }

    updateFilesList() {
        const filesContainer = document.getElementById('uploaded-files');
        const count = document.getElementById('files-count');

        count.textContent = this.uploadedFiles.length;

        if (this.uploadedFiles.length === 0) {
            filesContainer.innerHTML = '';
            return;
        }

        filesContainer.innerHTML = `
            <h4>업로드된 파일 (${this.uploadedFiles.length}개)</h4>
            <div class="files-grid">
                ${this.uploadedFiles.map(f => `
                    <div class="file-item" data-id="${f.id}">
                        <div class="file-info">
                            <i class="fas fa-file-alt file-icon"></i>
                            <div class="file-details">
                                <strong class="file-name">${f.name}</strong>
                                <small class="file-size">${this.formatFileSize(f.size)}</small>
                            </div>
                        </div>
                        <button class="btn btn-outline btn-sm remove-file" data-id="${f.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // Add remove event listeners
        filesContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseFloat(e.target.closest('button').dataset.id);
                this.removeFile(id);
            });
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(id) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== id);
        this.updateFilesList();
        this.updateSubmitButton();
        showNotification('파일이 제거되었습니다.', 'info');
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-data');
        const rewardSpan = document.getElementById('estimated-reward');
        
        const hasLocation = this.location.lat && this.location.lng;
        const hasData = this.measurements.length > 0 || this.uploadedFiles.length > 0;
        
        const canSubmit = hasLocation && hasData;
        submitBtn.disabled = !canSubmit;

        // Calculate estimated reward
        const reward = (this.measurements.length * 5) + (this.uploadedFiles.length * 10);
        rewardSpan.textContent = reward;
    }

    previewSubmission() {
        const preview = {
            location: this.location,
            measurements: this.measurements,
            files: this.uploadedFiles.map(f => ({ name: f.name, size: f.size })),
            metadata: {
                contributor: document.getElementById('contributor-name').value || 'Anonymous',
                organization: document.getElementById('contributor-org').value || '',
                description: document.getElementById('submission-description').value || ''
            }
        };

        console.log('제출 미리보기:', preview);
        showNotification('콘솔에서 제출 데이터를 확인하세요.', 'info');
    }

    async submitData() {
        try {
            const submitBtn = document.getElementById('submit-data');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 제출 중...';

            // Prepare submission data
            const submissionData = {
                location: this.location,
                measurements: this.measurements,
                files: this.uploadedFiles.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type
                })),
                metadata: {
                    contributor: document.getElementById('contributor-name').value || 'Anonymous',
                    organization: document.getElementById('contributor-org').value || '',
                    description: document.getElementById('submission-description').value || '',
                    submittedAt: new Date().toISOString()
                }
            };

            // Submit to API
            const response = await API.submitData(submissionData);
            
            this.showSubmissionResult(response.data);
            this.resetForm();
            
        } catch (error) {
            console.error('제출 실패:', error);
            showNotification('데이터 제출에 실패했습니다. 다시 시도해주세요.', 'error');
            
        } finally {
            const submitBtn = document.getElementById('submit-data');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 데이터 제출';
        }
    }

    showSubmissionResult(result) {
        const modal = document.getElementById('submission-modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <div class="submission-result">
                <div class="result-icon">
                    <i class="fas fa-check-circle text-success"></i>
                </div>
                <h3>제출 성공!</h3>
                <p>데이터가 성공적으로 제출되었습니다.</p>
                
                <div class="result-details">
                    <div class="detail-item">
                        <strong>제출 ID:</strong> ${result.submissionId}
                    </div>
                    <div class="detail-item">
                        <strong>획득 토큰:</strong> ${result.tokenReward} GCRC
                    </div>
                    <div class="detail-item">
                        <strong>검증 예상 시간:</strong> ${result.estimatedVerificationTime}
                    </div>
                    <div class="detail-item">
                        <strong>데이터 해시:</strong> 
                        <code>${result.dataHash}</code>
                    </div>
                </div>
                
                <div class="blockchain-info">
                    <p>
                        <i class="fas fa-link"></i>
                        데이터가 블록체인에 안전하게 저장되었습니다.
                    </p>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        showNotification(`${result.tokenReward} GCRC 토큰을 획득했습니다!`, 'success');
    }

    hideModal() {
        const modal = document.getElementById('submission-modal');
        modal.classList.add('hidden');
    }

    resetForm() {
        // Reset location
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        this.location = { lat: null, lng: null };
        this.updateLocationDisplay();

        // Reset measurements
        this.measurements = [];
        this.updateMeasurementsList();
        this.clearMeasurementForm();

        // Reset files
        this.uploadedFiles = [];
        this.updateFilesList();
        document.getElementById('file-input').value = '';

        // Reset metadata
        document.getElementById('contributor-name').value = '';
        document.getElementById('contributor-org').value = '';
        document.getElementById('submission-description').value = '';

        this.updateSubmitButton();
        showNotification('폼이 초기화되었습니다.', 'info');
    }

    destroy() {
        console.log('🧹 데이터 제출 페이지 정리 완료');
    }
}

// Create submit instance
let submitInstance = null;

export async function initSubmit() {
    if (!submitInstance) {
        submitInstance = new DataSubmit();
    }
    
    await submitInstance.init();
    return submitInstance;
}

// Export for external access
window.GCRC_Submit = submitInstance;