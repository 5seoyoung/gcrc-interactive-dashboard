/**
 * GCRC API Documentation Page
 * Interactive API documentation and testing
 */

import { API } from '../utils/api.js';
import { showNotification } from '../utils/helpers.js';

class APIDocumentation {
    constructor() {
        this.activeEndpoint = null;
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('api:highlight', () => {
            this.highlightCodeBlocks();
        });
    }

    async init() {
        console.log('🔗 API 문서 페이지 초기화...');
        
        try {
            this.renderLayout();
            this.setupInteractions();
            this.highlightCodeBlocks();
            
            console.log('✅ API 문서 페이지 초기화 완료');
            
        } catch (error) {
            console.error('❌ API 문서 페이지 초기화 실패:', error);
            showNotification('API 문서 페이지 로드에 실패했습니다.', 'error');
        }
    }

    renderLayout() {
        const apiPage = document.getElementById('api-page');
        
        apiPage.innerHTML = `
            <div class="api-docs-container">
                <!-- Header -->
                <div class="api-docs-header">
                    <h1 class="page-title">
                        🔗 GCRC API 문서
                    </h1>
                    <p class="page-description">
                        GCRC 플랫폼의 RESTful API를 사용하여 기후 데이터에 액세스하고 기여하세요
                    </p>
                    <div class="api-status">
                        <span class="status-badge online">
                            <i class="fas fa-circle"></i> API 서버 온라인
                        </span>
                        <span class="api-version">v1.0.0</span>
                    </div>
                </div>

                <!-- Quick Start -->
                <div class="quick-start-section card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-rocket card-icon"></i>
                            빠른 시작
                        </h2>
                    </div>
                    
                    <div class="quick-start-content">
                        <div class="quick-start-grid grid grid-3">
                            <div class="quick-start-item">
                                <div class="step-number">1</div>
                                <h3>API 키 발급</h3>
                                <p>무료 API 키를 발급받아 시작하세요</p>
                                <button class="btn btn-primary btn-sm" id="get-api-key">
                                    API 키 받기
                                </button>
                            </div>
                            
                            <div class="quick-start-item">
                                <div class="step-number">2</div>
                                <h3>첫 번째 요청</h3>
                                <p>간단한 GET 요청으로 데이터를 가져오세요</p>
                                <button class="btn btn-outline btn-sm" id="try-first-request">
                                    테스트 실행
                                </button>
                            </div>
                            
                            <div class="quick-start-item">
                                <div class="step-number">3</div>
                                <h3>데이터 기여</h3>
                                <p>POST 요청으로 데이터를 제출하세요</p>
                                <button class="btn btn-outline btn-sm" id="learn-submit">
                                    제출 방법
                                </button>
                            </div>
                        </div>
                        
                        <div class="base-url-info">
                            <strong>Base URL:</strong> 
                            <code class="base-url">https://api.gcrc.org/v1</code>
                            <button class="btn btn-outline btn-sm copy-btn" data-copy="https://api.gcrc.org/v1">
                                <i class="fas fa-copy"></i> 복사
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Authentication -->
                <div class="auth-section card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-key card-icon"></i>
                            인증
                        </h2>
                    </div>
                    
                    <div class="auth-content">
                        <p>GCRC API는 API 키 기반 인증을 사용합니다. 모든 요청에 <code>X-API-Key</code> 헤더를 포함해야 합니다.</p>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span class="code-title">Authentication Header</span>
                                <button class="copy-btn" data-copy="X-API-Key: your_api_key_here">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <pre><code>X-API-Key: your_api_key_here</code></pre>
                        </div>
                        
                        <div class="api-key-demo">
                            <label>API 키를 입력하여 테스트:</label>
                            <div class="api-key-input">
                                <input type="text" id="demo-api-key" class="form-control" 
                                       placeholder="여기에 API 키를 입력하세요" value="demo_key_12345">
                                <button class="btn btn-primary" id="validate-key">검증</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Endpoints -->
                <div class="endpoints-section">
                    <h2 class="section-title">API 엔드포인트</h2>
                    
                    <!-- Get Alerts -->
                    <div class="endpoint-card card">
                        <div class="endpoint-header">
                            <div class="endpoint-method get">GET</div>
                            <div class="endpoint-path">/api/alerts</div>
                            <div class="endpoint-description">기후 경보 목록 조회</div>
                        </div>
                        
                        <div class="endpoint-content">
                            <div class="endpoint-params">
                                <h4>Query Parameters</h4>
                                <table class="params-table">
                                    <thead>
                                        <tr>
                                            <th>Parameter</th>
                                            <th>Type</th>
                                            <th>Required</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><code>limit</code></td>
                                            <td>integer</td>
                                            <td>No</td>
                                            <td>반환할 경보 수 (기본값: 10)</td>
                                        </tr>
                                        <tr>
                                            <td><code>severity</code></td>
                                            <td>string</td>
                                            <td>No</td>
                                            <td>경보 심각도 (critical, warning, info)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="endpoint-example">
                                <div class="example-tabs">
                                    <button class="tab-btn active" data-tab="curl">cURL</button>
                                    <button class="tab-btn" data-tab="js">JavaScript</button>
                                    <button class="tab-btn" data-tab="python">Python</button>
                                </div>
                                
                                <div class="example-content">
                                    <div class="example-tab active" data-tab="curl">
                                        <div class="code-example">
                                            <div class="code-header">
                                                <span class="code-title">cURL Request</span>
                                                <button class="copy-btn" data-copy="curl -H 'X-API-Key: your_api_key' https://api.gcrc.org/v1/alerts?limit=5">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                            <pre><code>curl -H "X-API-Key: your_api_key" \\
  "https://api.gcrc.org/v1/alerts?limit=5"</code></pre>
                                        </div>
                                    </div>
                                    
                                    <div class="example-tab" data-tab="js">
                                        <div class="code-example">
                                            <div class="code-header">
                                                <span class="code-title">JavaScript (fetch)</span>
                                                <button class="copy-btn" data-copy="const response = await fetch('https://api.gcrc.org/v1/alerts?limit=5', { headers: { 'X-API-Key': 'your_api_key' } });
const data = await response.json();">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                            <pre><code>const response = await fetch('https://api.gcrc.org/v1/alerts?limit=5', {
  headers: {
    'X-API-Key': 'your_api_key'
  }
});
const data = await response.json();</code></pre>
                                        </div>
                                    </div>
                                    
                                    <div class="example-tab" data-tab="python">
                                        <div class="code-example">
                                            <div class="code-header">
                                                <span class="code-title">Python (requests)</span>
                                                <button class="copy-btn" data-copy="import requests
headers = {'X-API-Key': 'your_api_key'}
response = requests.get('https://api.gcrc.org/v1/alerts?limit=5', headers=headers)">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                            <pre><code>import requests

headers = {'X-API-Key': 'your_api_key'}
response = requests.get(
    'https://api.gcrc.org/v1/alerts?limit=5', 
    headers=headers
)
data = response.json()</code></pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="response-example">
                                <h4>Response Example</h4>
                                <div class="code-example">
                                    <div class="code-header">
                                        <span class="code-title">JSON Response</span>
                                        <button class="copy-btn" data-copy='{"success": true, "data": [{"id": 1, "message": "태평양 해수면 온도 급상승", "severity": "warning"}]}'>
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                    <pre><code>{
  "success": true,
  "data": [
    {
      "id": 1,
      "message": "🌊 태평양 해수면 온도 급상승 감지",
      "severity": "warning",
      "timestamp": "2025-01-20T12:30:00Z",
      "region": "태평양 연안"
    }
  ],
  "metadata": {
    "total": 15,
    "filtered": 5,
    "timestamp": "2025-01-20T12:35:00Z"
  }
}</code></pre>
                                </div>
                            </div>
                            
                            <button class="btn btn-primary try-endpoint" data-endpoint="alerts">
                                <i class="fas fa-play"></i> 테스트 실행
                            </button>
                        </div>
                    </div>

                    <!-- Get Datasets -->
                    <div class="endpoint-card card">
                        <div class="endpoint-header">
                            <div class="endpoint-method get">GET</div>
                            <div class="endpoint-path">/api/datasets</div>
                            <div class="endpoint-description">기후 데이터셋 조회 및 필터링</div>
                        </div>
                        
                        <div class="endpoint-content">
                            <div class="endpoint-params">
                                <h4>Query Parameters</h4>
                                <table class="params-table">
                                    <thead>
                                        <tr>
                                            <th>Parameter</th>
                                            <th>Type</th>
                                            <th>Required</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><code>country</code></td>
                                            <td>string</td>
                                            <td>No</td>
                                            <td>국가 코드 (KOR, USA, JPN 등)</td>
                                        </tr>
                                        <tr>
                                            <td><code>variable</code></td>
                                            <td>string</td>
                                            <td>No</td>
                                            <td>기후 변수 (temperature, precipitation 등)</td>
                                        </tr>
                                        <tr>
                                            <td><code>startDate</code></td>
                                            <td>string</td>
                                            <td>No</td>
                                            <td>시작 날짜 (YYYY-MM-DD)</td>
                                        </tr>
                                        <tr>
                                            <td><code>endDate</code></td>
                                            <td>string</td>
                                            <td>No</td>
                                            <td>종료 날짜 (YYYY-MM-DD)</td>
                                        </tr>
                                        <tr>
                                            <td><code>page</code></td>
                                            <td>integer</td>
                                            <td>No</td>
                                            <td>페이지 번호 (기본값: 1)</td>
                                        </tr>
                                        <tr>
                                            <td><code>limit</code></td>
                                            <td>integer</td>
                                            <td>No</td>
                                            <td>페이지당 항목 수 (기본값: 100)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="code-example">
                                <div class="code-header">
                                    <span class="code-title">Example Request</span>
                                    <button class="copy-btn" data-copy="curl -H 'X-API-Key: your_api_key' 'https://api.gcrc.org/v1/datasets?country=KOR&variable=temperature&startDate=2025-01-01'">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <pre><code>curl -H "X-API-Key: your_api_key" \\
  "https://api.gcrc.org/v1/datasets?country=KOR&variable=temperature&startDate=2025-01-01"</code></pre>
                            </div>
                            
                            <button class="btn btn-primary try-endpoint" data-endpoint="datasets">
                                <i class="fas fa-play"></i> 테스트 실행
                            </button>
                        </div>
                    </div>

                    <!-- Submit Data -->
                    <div class="endpoint-card card">
                        <div class="endpoint-header">
                            <div class="endpoint-method post">POST</div>
                            <div class="endpoint-path">/api/submit</div>
                            <div class="endpoint-description">기후 데이터 제출</div>
                        </div>
                        
                        <div class="endpoint-content">
                            <div class="endpoint-params">
                                <h4>Request Body</h4>
                                <div class="code-example">
                                    <div class="code-header">
                                        <span class="code-title">JSON Schema</span>
                                        <button class="copy-btn" data-copy='{"location": {"lat": 37.5665, "lng": 126.9780}, "measurements": [{"variable": "temperature", "value": 15.5, "unit": "°C", "timestamp": "2025-01-20T12:00:00Z"}]}'>
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                    <pre><code>{
  "location": {
    "lat": 37.5665,
    "lng": 126.9780
  },
  "measurements": [
    {
      "variable": "temperature",
      "value": 15.5,
      "unit": "°C",
      "timestamp": "2025-01-20T12:00:00Z"
    }
  ],
  "metadata": {
    "contributor": "Weather Station Alpha",
    "description": "Automated weather station data"
  }
}</code></pre>
                                </div>
                            </div>
                            
                            <div class="response-example">
                                <h4>Success Response</h4>
                                <div class="code-example">
                                    <div class="code-header">
                                        <span class="code-title">201 Created</span>
                                    </div>
                                    <pre><code>{
  "success": true,
  "data": {
    "submissionId": "sub_1705840800_abc123",
    "status": "accepted",
    "tokenReward": 25,
    "estimatedVerificationTime": "2-5 minutes",
    "dataHash": "0x1234567890abcdef...",
    "blockchain": {
      "network": "ethereum-sepolia",
      "estimatedGas": 35000
    }
  }
}</code></pre>
                                </div>
                            </div>
                            
                            <button class="btn btn-primary try-endpoint" data-endpoint="submit">
                                <i class="fas fa-play"></i> 테스트 실행
                            </button>
                        </div>
                    </div>

                    <!-- Get Partners -->
                    <div class="endpoint-card card">
                        <div class="endpoint-header">
                            <div class="endpoint-method get">GET</div>
                            <div class="endpoint-path">/api/partners</div>
                            <div class="endpoint-description">파트너 기관 목록 조회</div>
                        </div>
                        
                        <div class="endpoint-content">
                            <div class="code-example">
                                <div class="code-header">
                                    <span class="code-title">Simple Request</span>
                                    <button class="copy-btn" data-copy="curl -H 'X-API-Key: your_api_key' https://api.gcrc.org/v1/partners">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <pre><code>curl -H "X-API-Key: your_api_key" \\
  "https://api.gcrc.org/v1/partners"</code></pre>
                            </div>
                            
                            <button class="btn btn-primary try-endpoint" data-endpoint="partners">
                                <i class="fas fa-play"></i> 테스트 실행
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Rate Limits -->
                <div class="rate-limits-section card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-tachometer-alt card-icon"></i>
                            사용량 제한
                        </h2>
                    </div>
                    
                    <div class="rate-limits-content">
                        <div class="limits-grid grid grid-3">
                            <div class="limit-item">
                                <h4>무료 플랜</h4>
                                <div class="limit-value">1,000</div>
                                <div class="limit-unit">요청/시간</div>
                            </div>
                            
                            <div class="limit-item">
                                <h4>프로 플랜</h4>
                                <div class="limit-value">10,000</div>
                                <div class="limit-unit">요청/시간</div>
                            </div>
                            
                            <div class="limit-item">
                                <h4>엔터프라이즈</h4>
                                <div class="limit-value">무제한</div>
                                <div class="limit-unit">맞춤 설정</div>
                            </div>
                        </div>
                        
                        <div class="rate-limit-headers">
                            <h4>응답 헤더</h4>
                            <ul>
                                <li><code>X-RateLimit-Limit</code>: 시간당 최대 요청 수</li>
                                <li><code>X-RateLimit-Remaining</code>: 남은 요청 수</li>
                                <li><code>X-RateLimit-Reset</code>: 제한 초기화 시간</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Error Codes -->
                <div class="error-codes-section card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-exclamation-triangle card-icon"></i>
                            오류 코드
                        </h2>
                    </div>
                    
                    <div class="error-codes-content">
                        <table class="error-table">
                            <thead>
                                <tr>
                                    <th>코드</th>
                                    <th>상태</th>
                                    <th>설명</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>400</code></td>
                                    <td>Bad Request</td>
                                    <td>잘못된 요청 형식 또는 누락된 매개변수</td>
                                </tr>
                                <tr>
                                    <td><code>401</code></td>
                                    <td>Unauthorized</td>
                                    <td>유효하지 않은 API 키</td>
                                </tr>
                                <tr>
                                    <td><code>403</code></td>
                                    <td>Forbidden</td>
                                    <td>접근 권한 없음</td>
                                </tr>
                                <tr>
                                    <td><code>429</code></td>
                                    <td>Too Many Requests</td>
                                    <td>사용량 제한 초과</td>
                                </tr>
                                <tr>
                                    <td><code>500</code></td>
                                    <td>Internal Server Error</td>
                                    <td>서버 내부 오류</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- API Test Console -->
                <div class="test-console-section card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-terminal card-icon"></i>
                            API 테스트 콘솔
                        </h2>
                    </div>
                    
                    <div class="test-console-content">
                        <div class="console-controls">
                            <div class="form-group">
                                <label class="form-label">Endpoint</label>
                                <select id="console-endpoint" class="form-control">
                                    <option value="alerts">GET /api/alerts</option>
                                    <option value="datasets">GET /api/datasets</option>
                                    <option value="partners">GET /api/partners</option>
                                    <option value="system/status">GET /api/system/status</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Parameters (JSON)</label>
                                <textarea id="console-params" class="form-control" rows="3" 
                                          placeholder='{"limit": 5, "severity": "warning"}'></textarea>
                            </div>
                            
                            <button class="btn btn-primary" id="execute-console">
                                <i class="fas fa-play"></i> 실행
                            </button>
                        </div>
                        
                        <div class="console-output">
                            <div class="output-header">
                                <span>응답 결과</span>
                                <button class="btn btn-outline btn-sm" id="clear-console">
                                    <i class="fas fa-trash"></i> 지우기
                                </button>
                            </div>
                            <pre id="console-result" class="console-result">
여기에 API 응답이 표시됩니다...
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupInteractions() {
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const textToCopy = e.target.closest('button').dataset.copy;
                this.copyToClipboard(textToCopy);
            });
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                const container = e.target.closest('.endpoint-example');
                
                // Update active tab button
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update active tab content
                container.querySelectorAll('.example-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.tab === tabName);
                });
            });
        });

        // Try endpoint buttons
        document.querySelectorAll('.try-endpoint').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const endpoint = e.target.dataset.endpoint;
                this.tryEndpoint(endpoint);
            });
        });

        // Quick start actions
        document.getElementById('get-api-key').addEventListener('click', () => {
            this.generateApiKey();
        });

        document.getElementById('try-first-request').addEventListener('click', () => {
            this.tryEndpoint('alerts');
        });

        document.getElementById('learn-submit').addEventListener('click', () => {
            document.querySelector('[data-endpoint="submit"]').scrollIntoView({ behavior: 'smooth' });
        });

        // API key validation
        document.getElementById('validate-key').addEventListener('click', () => {
            this.validateApiKey();
        });

        // Test console
        document.getElementById('execute-console').addEventListener('click', () => {
            this.executeConsoleCommand();
        });

        document.getElementById('clear-console').addEventListener('click', () => {
            document.getElementById('console-result').textContent = '여기에 API 응답이 표시됩니다...';
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('클립보드에 복사되었습니다!', 'success');
        }).catch(() => {
            showNotification('복사에 실패했습니다.', 'error');
        });
    }

    async tryEndpoint(endpoint) {
        try {
            showNotification(`${endpoint} 엔드포인트를 테스트하고 있습니다...`, 'info');
            
            let response;
            switch (endpoint) {
                case 'alerts':
                    response = await API.getAlerts(3);
                    break;
                case 'datasets':
                    response = await API.getDatasets({ limit: 5 });
                    break;
                case 'partners':
                    response = await API.getPartners();
                    break;
                case 'submit':
                    response = await API.submitData({
                        location: { lat: 37.5665, lng: 126.9780 },
                        measurements: [{
                            variable: 'temperature',
                            value: 15.5,
                            unit: '°C',
                            timestamp: new Date().toISOString()
                        }]
                    });
                    break;
                default:
                    throw new Error('Unknown endpoint');
            }
            
            console.log(`${endpoint} 응답:`, response);
            showNotification(`${endpoint} 테스트 성공! 콘솔을 확인하세요.`, 'success');
            
        } catch (error) {
            console.error(`${endpoint} 테스트 실패:`, error);
            showNotification(`${endpoint} 테스트에 실패했습니다.`, 'error');
        }
    }

    generateApiKey() {
        const apiKey = `gcrc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        document.getElementById('demo-api-key').value = apiKey;
        
        showNotification('데모 API 키가 생성되었습니다!', 'success');
        
        // Show modal or update UI to display the new key
        console.log('Generated API Key:', apiKey);
    }

    validateApiKey() {
        const apiKey = document.getElementById('demo-api-key').value;
        
        if (!apiKey) {
            showNotification('API 키를 입력해주세요.', 'warning');
            return;
        }
        
        if (apiKey.startsWith('gcrc_') || apiKey === 'demo_key_12345') {
            showNotification('유효한 API 키입니다!', 'success');
        } else {
            showNotification('유효하지 않은 API 키입니다.', 'error');
        }
    }

    async executeConsoleCommand() {
        try {
            const endpoint = document.getElementById('console-endpoint').value;
            const paramsText = document.getElementById('console-params').value;
            const resultEl = document.getElementById('console-result');
            
            let params = {};
            if (paramsText.trim()) {
                try {
                    params = JSON.parse(paramsText);
                } catch (e) {
                    resultEl.textContent = 'Error: Invalid JSON parameters';
                    return;
                }
            }
            
            resultEl.textContent = 'Executing...';
            
            let response;
            switch (endpoint) {
                case 'alerts':
                    response = await API.getAlerts(params.limit || 5);
                    break;
                case 'datasets':
                    response = await API.getDatasets(params);
                    break;
                case 'partners':
                    response = await API.getPartners();
                    break;
                case 'system/status':
                    response = await API.getSystemStatus();
                    break;
                default:
                    throw new Error('Unknown endpoint');
            }
            
            resultEl.textContent = JSON.stringify(response, null, 2);
            showNotification('API 호출이 성공했습니다!', 'success');
            
        } catch (error) {
            const resultEl = document.getElementById('console-result');
            resultEl.textContent = `Error: ${error.message}`;
            showNotification('API 호출에 실패했습니다.', 'error');
        }
    }

    highlightCodeBlocks() {
        // Simple code highlighting (without external library)
        document.querySelectorAll('pre code').forEach(block => {
            let html = block.innerHTML;
            
            // Highlight keywords
            html = html.replace(/(".*?")/g, '<span style="color: #22c55e;">$1</span>');
            html = html.replace(/(curl|fetch|import|const|let|var)/g, '<span style="color: #3b82f6;">$1</span>');
            html = html.replace(/(\{|\}|\[|\])/g, '<span style="color: #f59e0b;">$1</span>');
            
            block.innerHTML = html;
        });
    }

    destroy() {
        console.log('🧹 API 문서 페이지 정리 완료');
    }
}

// Create API documentation instance
let apiInstance = null;

export async function initAPI() {
    if (!apiInstance) {
        apiInstance = new APIDocumentation();
    }
    
    await apiInstance.init();
    return apiInstance;
}

// Export for external access
window.GCRC_API_Docs = apiInstance;