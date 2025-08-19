/**
 * GCRC Map Component
 * Leaflet.js based interactive map for climate risk visualization
 */

export class ClimateMap {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.map = null;
        this.markers = [];
        this.options = {
            center: [20, 0],
            zoom: 2,
            ...options
        };
    }

    init() {
        // Initialize Leaflet map
        this.map = L.map(this.containerId).setView(this.options.center, this.options.zoom);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        return this.map;
    }

    addRiskMarkers(riskData) {
        // Clear existing markers
        this.clearMarkers();

        riskData.forEach(region => {
            const marker = this.createRiskMarker(region);
            this.markers.push(marker);
        });
    }

    createRiskMarker(region) {
        const riskLevel = this.getRiskLevel(region.risk);
        const color = this.getRiskColor(riskLevel);

        const marker = L.circleMarker([region.lat, region.lng], {
            radius: Math.max(8, region.risk / 10),
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(this.map);

        marker.bindPopup(this.createPopupContent(region));
        return marker;
    }

    createPopupContent(region) {
        return `
            <div class="map-popup">
                <h3>${region.name}</h3>
                <p><strong>위험 유형:</strong> ${region.type}</p>
                <p><strong>위험도:</strong> ${region.risk}/100</p>
                <p><strong>좌표:</strong> ${region.lat.toFixed(4)}, ${region.lng.toFixed(4)}</p>
            </div>
        `;
    }

    getRiskLevel(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        if (score >= 20) return 'low';
        return 'minimal';
    }

    getRiskColor(level) {
        const colors = {
            critical: '#dc2626',
            high: '#ea580c',
            medium: '#f59e0b',
            low: '#22c55e',
            minimal: '#10b981'
        };
        return colors[level] || '#64748b';
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}

export default ClimateMap;