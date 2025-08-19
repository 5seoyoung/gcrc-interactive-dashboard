/**
 * GCRC Helper Utilities
 * Common utility functions for formatting, validation, and UI interactions
 */

// Date and Time Formatting
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };
    
    return new Date(date).toLocaleDateString('ko-KR', defaultOptions);
}

export function formatDateTime(date) {
    return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds}초 전`;
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}분 전`;
    } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    } else {
        return `${Math.floor(diffInSeconds / 86400)}일 전`;
    }
}

// Number Formatting
export function formatNumber(number, decimals = 0) {
    if (typeof number !== 'number') return '0';
    
    return number.toLocaleString('ko-KR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

export function formatPercentage(value, decimals = 1) {
    return `${formatNumber(value, decimals)}%`;
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatCurrency(amount, currency = 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Risk Level Utilities
export function getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'minimal';
}

export function getRiskColor(level) {
    const colors = {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#f59e0b',
        low: '#22c55e',
        minimal: '#10b981'
    };
    return colors[level] || '#64748b';
}

export function getRiskLabel(level) {
    const labels = {
        critical: '심각',
        high: '높음',
        medium: '보통',
        low: '낮음',
        minimal: '최소'
    };
    return labels[level] || '알 수 없음';
}

// Data Validation
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

export function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

export function validateFileSize(file, maxSizeMB = 10) {
    return file.size <= maxSizeMB * 1024 * 1024;
}

export function validateFileType(file, allowedTypes = []) {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.some(type => file.type.startsWith(type) || file.name.endsWith(type));
}

// Coordinate Utilities
export function validateCoordinates(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function formatCoordinates(lat, lng, decimals = 4) {
    return `${formatNumber(lat, decimals)}, ${formatNumber(lng, decimals)}`;
}

export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// UI Utilities
export function showNotification(message, type = 'info', duration = 5000) {
    const notification = createNotificationElement(message, type);
    document.body.appendChild(notification);
    
    // Show notification with animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto-remove notification
    setTimeout(() => {
        hideNotification(notification);
    }, duration);
    
    return notification;
}

function createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = getNotificationIcon(type);
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add close button event
    notification.querySelector('.notification-close').addEventListener('click', () => {
        hideNotification(notification);
    });
    
    return notification;
}

function getNotificationIcon(type) {
    const icons = {
        info: '💡',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        climate: '🌍'
    };
    return icons[type] || icons.info;
}

function hideNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

export function showLoading(element, message = '로딩 중...') {
    if (!element) return;
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <span class="loading-text">${message}</span>
        </div>
    `;
    
    element.style.position = 'relative';
    element.appendChild(loadingOverlay);
    
    return loadingOverlay;
}

export function hideLoading(element) {
    if (!element) return;
    
    const loadingOverlay = element.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

export function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// DOM Utilities
export function createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
}

export function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

export function toggleClass(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

export function addClass(element, className) {
    if (element) {
        element.classList.add(className);
    }
}

export function removeClass(element, className) {
    if (element) {
        element.classList.remove(className);
    }
}

// Data Processing Utilities
export function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
}

export function sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (direction === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
}

export function filterBy(array, filters) {
    return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === null || value === undefined || value === '') return true;
            return item[key] === value;
        });
    });
}

export function calculateAverage(array, key) {
    if (!array.length) return 0;
    const sum = array.reduce((total, item) => total + (item[key] || 0), 0);
    return sum / array.length;
}

export function calculateSum(array, key) {
    return array.reduce((total, item) => total + (item[key] || 0), 0);
}

export function getUniqueValues(array, key) {
    return [...new Set(array.map(item => item[key]))];
}

// Chart Data Utilities
export function prepareChartData(data, xKey, yKey, groupKey = null) {
    if (groupKey) {
        const grouped = groupBy(data, groupKey);
        return Object.entries(grouped).map(([group, items]) => ({
            label: group,
            data: items.map(item => ({ x: item[xKey], y: item[yKey] }))
        }));
    }
    
    return data.map(item => ({ x: item[xKey], y: item[yKey] }));
}

export function generateColors(count, alpha = 1) {
    const colors = [
        `rgba(37, 99, 235, ${alpha})`,   // Blue
        `rgba(34, 197, 94, ${alpha})`,   // Green
        `rgba(245, 158, 11, ${alpha})`,  // Yellow
        `rgba(239, 68, 68, ${alpha})`,   // Red
        `rgba(139, 92, 246, ${alpha})`,  // Purple
        `rgba(6, 182, 212, ${alpha})`,   // Cyan
        `rgba(236, 72, 153, ${alpha})`,  // Pink
        `rgba(16, 185, 129, ${alpha})`,  // Emerald
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// Local Storage Utilities
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

export function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}

export function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
        return false;
    }
}

// URL and Query String Utilities
export function updateURLParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    });
    window.history.replaceState({}, '', url);
}

export function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// File Utilities
export function downloadFile(data, filename, type = 'application/json') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function downloadCSV(data, filename) {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => 
            JSON.stringify(row[header] || '')
        ).join(','))
    ].join('\n');
    
    downloadFile(csvContent, filename, 'text/csv');
}

export function downloadJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
}

export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Climate Data Specific Utilities
export function getClimateVariableInfo(variable) {
    const info = {
        temperature: { label: '온도', unit: '°C', icon: '🌡️' },
        precipitation: { label: '강수량', unit: 'mm', icon: '🌧️' },
        humidity: { label: '습도', unit: '%', icon: '💧' },
        pressure: { label: '기압', unit: 'hPa', icon: '📊' },
        windspeed: { label: '풍속', unit: 'km/h', icon: '💨' }
    };
    return info[variable] || { label: variable, unit: '', icon: '📈' };
}

export function getCountryInfo(countryCode) {
    const countries = {
        KOR: { name: '대한민국', flag: '🇰🇷' },
        USA: { name: '미국', flag: '🇺🇸' },
        JPN: { name: '일본', flag: '🇯🇵' },
        CHN: { name: '중국', flag: '🇨🇳' },
        DEU: { name: '독일', flag: '🇩🇪' },
        FRA: { name: '프랑스', flag: '🇫🇷' },
        GBR: { name: '영국', flag: '🇬🇧' },
        AUS: { name: '호주', flag: '🇦🇺' }
    };
    return countries[countryCode] || { name: countryCode, flag: '🌍' };
}

// Animation Utilities
export function animateNumber(element, start, end, duration = 1000) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * easeOutQuart(progress);
        element.textContent = formatNumber(Math.floor(current));
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

export function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;
        
        element.style.opacity = Math.min(progress, 1);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

export function fadeOut(element, duration = 300) {
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;
        
        element.style.opacity = Math.max(1 - progress, 0);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Error Handling Utilities
export function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    let message = '예상치 못한 오류가 발생했습니다.';
    
    if (error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
            message = '네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('timeout')) {
            message = '요청 시간이 초과되었습니다.';
        } else if (error.message.includes('403')) {
            message = '접근 권한이 없습니다.';
        } else if (error.message.includes('404')) {
            message = '요청한 리소스를 찾을 수 없습니다.';
        }
    }
    
    showNotification(message, 'error');
    return message;
}

// Performance Utilities
export function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
}

export async function measureAsyncPerformance(name, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
}

// Export all utility functions
export default {
    formatDate,
    formatDateTime,
    formatTimeAgo,
    formatNumber,
    formatPercentage,
    formatBytes,
    formatCurrency,
    getRiskLevel,
    getRiskColor,
    getRiskLabel,
    validateEmail,
    validateNumber,
    validateRequired,
    validateFileSize,
    validateFileType,
    validateCoordinates,
    formatCoordinates,
    calculateDistance,
    showNotification,
    showLoading,
    hideLoading,
    debounce,
    throttle,
    createElement,
    removeElement,
    toggleClass,
    addClass,
    removeClass,
    groupBy,
    sortBy,
    filterBy,
    calculateAverage,
    calculateSum,
    getUniqueValues,
    prepareChartData,
    generateColors,
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,
    updateURLParams,
    getURLParams,
    downloadFile,
    downloadCSV,
    downloadJSON,
    readFileAsText,
    readFileAsDataURL,
    getClimateVariableInfo,
    getCountryInfo,
    animateNumber,
    fadeIn,
    fadeOut,
    handleError,
    measurePerformance,
    measureAsyncPerformance
};