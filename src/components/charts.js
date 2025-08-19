/**
 * GCRC Charts Component
 * Chart.js based data visualization components
 */

export class ClimateChart {
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;
        this.chart = null;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            ...options
        };
    }

    createLineChart(data, labels) {
        const ctx = document.getElementById(this.canvasId);
        if (!ctx) return null;

        this.destroyChart();

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Climate Data',
                    data: data,
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: this.options
        });

        return this.chart;
    }

    createMultiLineChart(datasets, labels) {
        const ctx = document.getElementById(this.canvasId);
        if (!ctx) return null;

        this.destroyChart();

        const colors = [
            'rgb(37, 99, 235)',
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)'
        ];

        const chartDatasets = datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            tension: 0.4
        }));

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: chartDatasets
            },
            options: this.options
        });

        return this.chart;
    }

    createBarChart(data, labels) {
        const ctx = document.getElementById(this.canvasId);
        if (!ctx) return null;

        this.destroyChart();

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Risk Level',
                    data: data,
                    backgroundColor: data.map(value => this.getRiskColor(value)),
                    borderColor: data.map(value => this.getRiskColor(value)),
                    borderWidth: 1
                }]
            },
            options: {
                ...this.options,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        return this.chart;
    }

    getRiskColor(value) {
        if (value >= 80) return '#dc2626';
        if (value >= 60) return '#ea580c';
        if (value >= 40) return '#f59e0b';
        if (value >= 20) return '#22c55e';
        return '#10b981';
    }

    updateChart(newData, newLabels) {
        if (!this.chart) return;

        this.chart.data.labels = newLabels;
        this.chart.data.datasets[0].data = newData;
        this.chart.update();
    }

    destroyChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    destroy() {
        this.destroyChart();
    }
}

export class TrendChart extends ClimateChart {
    constructor(canvasId) {
        super(canvasId, {
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
        });
    }
}

export default ClimateChart;