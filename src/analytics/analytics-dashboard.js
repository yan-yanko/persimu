/**
 * ממשק משתמש לניתוח אנליטי
 */

class AnalyticsDashboard {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        this.config = {
            theme: 'light',
            refreshInterval: 30000,
            ...config
        };
        
        this.charts = new Map();
        this.filters = new Map();
        this.savedQueries = new Map();
        
        this.initialize();
    }

    /**
     * אתחול הדשבורד
     */
    async initialize() {
        this.createLayout();
        this.setupEventListeners();
        this.loadInitialData();
        this.startAutoRefresh();
    }

    /**
     * יצירת מבנה הדשבורד
     */
    createLayout() {
        this.container.innerHTML = `
            <div class="analytics-dashboard">
                <div class="dashboard-header">
                    <h1>ניתוח אנליטי</h1>
                    <div class="header-controls">
                        <button class="refresh-btn">רענון</button>
                        <button class="export-btn">ייצוא</button>
                        <button class="save-query-btn">שמירת שאילתה</button>
                    </div>
                </div>
                
                <div class="dashboard-filters">
                    <div class="filter-group">
                        <label>טווח זמן:</label>
                        <select id="timeRange">
                            <option value="1h">שעה אחרונה</option>
                            <option value="24h">24 שעות</option>
                            <option value="7d">7 ימים</option>
                            <option value="30d">30 ימים</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>סוג נתונים:</label>
                        <select id="dataType">
                            <option value="all">הכל</option>
                            <option value="behavior">התנהגות</option>
                            <option value="sentiment">רגשות</option>
                            <option value="performance">ביצועים</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>סוכנים:</label>
                        <select id="agents" multiple>
                            <!-- יתמלא דינמית -->
                        </select>
                    </div>
                </div>
                
                <div class="dashboard-grid">
                    <div class="grid-item" id="overview">
                        <h2>סקירה כללית</h2>
                        <div class="metrics-grid">
                            <!-- יתמלא דינמית -->
                        </div>
                    </div>
                    
                    <div class="grid-item" id="behaviorChart">
                        <h2>ניתוח התנהגות</h2>
                        <canvas></canvas>
                    </div>
                    
                    <div class="grid-item" id="sentimentChart">
                        <h2>ניתוח רגשות</h2>
                        <canvas></canvas>
                    </div>
                    
                    <div class="grid-item" id="performanceChart">
                        <h2>מדדי ביצוע</h2>
                        <canvas></canvas>
                    </div>
                    
                    <div class="grid-item" id="timeline">
                        <h2>ציר זמן</h2>
                        <div class="timeline-container">
                            <!-- יתמלא דינמית -->
                        </div>
                    </div>
                    
                    <div class="grid-item" id="heatmap">
                        <h2>מפת חום אינטראקציות</h2>
                        <canvas></canvas>
                    </div>
                </div>
                
                <div class="dashboard-footer">
                    <div class="saved-queries">
                        <h3>שאילתות שמורות</h3>
                        <div class="queries-list">
                            <!-- יתמלא דינמית -->
                        </div>
                    </div>
                    
                    <div class="export-options">
                        <h3>ייצוא נתונים</h3>
                        <div class="export-buttons">
                            <button data-format="csv">CSV</button>
                            <button data-format="pdf">PDF</button>
                            <button data-format="json">JSON</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * הגדרת מאזיני אירועים
     */
    setupEventListeners() {
        // רענון נתונים
        this.container.querySelector('.refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });

        // שינוי פילטרים
        this.container.querySelectorAll('.filter-group select').forEach(select => {
            select.addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // ייצוא נתונים
        this.container.querySelectorAll('.export-buttons button').forEach(button => {
            button.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.exportData(format);
            });
        });

        // שמירת שאילתה
        this.container.querySelector('.save-query-btn').addEventListener('click', () => {
            this.saveCurrentQuery();
        });
    }

    /**
     * טעינת נתונים ראשונית
     */
    async loadInitialData() {
        await this.loadAgents();
        await this.loadMetrics();
        this.initializeCharts();
        this.updateTimeline();
        this.updateHeatmap();
    }

    /**
     * טעינת רשימת סוכנים
     */
    async loadAgents() {
        const agents = await this.fetchAgents();
        const select = this.container.querySelector('#agents');
        
        agents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.id;
            option.textContent = agent.name;
            select.appendChild(option);
        });
    }

    /**
     * טעינת מדדים
     */
    async loadMetrics() {
        const metrics = await this.fetchMetrics();
        const metricsGrid = this.container.querySelector('.metrics-grid');
        
        metricsGrid.innerHTML = metrics.map(metric => `
            <div class="metric-card">
                <h3>${metric.title}</h3>
                <div class="metric-value">${metric.value}</div>
                <div class="metric-trend ${metric.trend}">
                    ${metric.trendValue}
                </div>
            </div>
        `).join('');
    }

    /**
     * אתחול גרפים
     */
    initializeCharts() {
        // גרף התנהגות
        this.charts.set('behavior', new Chart(
            this.container.querySelector('#behaviorChart canvas'),
            this.getBehaviorChartConfig()
        ));

        // גרף רגשות
        this.charts.set('sentiment', new Chart(
            this.container.querySelector('#sentimentChart canvas'),
            this.getSentimentChartConfig()
        ));

        // גרף ביצועים
        this.charts.set('performance', new Chart(
            this.container.querySelector('#performanceChart canvas'),
            this.getPerformanceChartConfig()
        ));
    }

    /**
     * עדכון ציר זמן
     */
    async updateTimeline() {
        const timeline = await this.fetchTimeline();
        const container = this.container.querySelector('.timeline-container');
        
        container.innerHTML = timeline.map(event => `
            <div class="timeline-event ${event.type}">
                <div class="event-time">${this.formatTime(event.timestamp)}</div>
                <div class="event-content">
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                </div>
                <div class="event-metrics">
                    ${this.renderEventMetrics(event.metrics)}
                </div>
            </div>
        `).join('');
    }

    /**
     * עדכון מפת חום
     */
    async updateHeatmap() {
        const heatmapData = await this.fetchHeatmapData();
        const canvas = this.container.querySelector('#heatmap canvas');
        const ctx = canvas.getContext('2d');
        
        // ציור מפת חום
        this.drawHeatmap(ctx, heatmapData);
    }

    /**
     * רענון נתונים
     */
    async refreshData() {
        await this.loadMetrics();
        this.updateCharts();
        this.updateTimeline();
        this.updateHeatmap();
    }

    /**
     * עדכון גרפים
     */
    updateCharts() {
        this.charts.forEach((chart, type) => {
            this.updateChartData(chart, type);
        });
    }

    /**
     * עדכון נתוני גרף
     */
    async updateChartData(chart, type) {
        const data = await this.fetchChartData(type);
        chart.data = data;
        chart.update();
    }

    /**
     * יישום פילטרים
     */
    async applyFilters() {
        const filters = this.getActiveFilters();
        await this.refreshData();
    }

    /**
     * קבלת פילטרים פעילים
     */
    getActiveFilters() {
        return {
            timeRange: this.container.querySelector('#timeRange').value,
            dataType: this.container.querySelector('#dataType').value,
            agents: Array.from(this.container.querySelector('#agents').selectedOptions)
                .map(option => option.value)
        };
    }

    /**
     * שמירת שאילתה נוכחית
     */
    saveCurrentQuery() {
        const filters = this.getActiveFilters();
        const name = prompt('שם השאילתה:');
        
        if (name) {
            this.savedQueries.set(name, filters);
            this.updateSavedQueriesList();
        }
    }

    /**
     * עדכון רשימת שאילתות שמורות
     */
    updateSavedQueriesList() {
        const container = this.container.querySelector('.queries-list');
        
        container.innerHTML = Array.from(this.savedQueries.entries())
            .map(([name, filters]) => `
                <div class="saved-query">
                    <span>${name}</span>
                    <button onclick="dashboard.loadSavedQuery('${name}')">טען</button>
                    <button onclick="dashboard.deleteSavedQuery('${name}')">מחק</button>
                </div>
            `).join('');
    }

    /**
     * טעינת שאילתה שמורה
     */
    loadSavedQuery(name) {
        const filters = this.savedQueries.get(name);
        if (filters) {
            this.applyFilters(filters);
        }
    }

    /**
     * מחיקת שאילתה שמורה
     */
    deleteSavedQuery(name) {
        this.savedQueries.delete(name);
        this.updateSavedQueriesList();
    }

    /**
     * ייצוא נתונים
     */
    async exportData(format) {
        const data = await this.fetchExportData();
        const blob = this.createExportBlob(data, format);
        this.downloadBlob(blob, `analytics-export.${format}`);
    }

    /**
     * יצירת קובץ ייצוא
     */
    createExportBlob(data, format) {
        switch (format) {
            case 'csv':
                return new Blob([this.convertToCSV(data)], { type: 'text/csv' });
            case 'json':
                return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            case 'pdf':
                return this.createPDF(data);
            default:
                throw new Error(`פורמט לא נתמך: ${format}`);
        }
    }

    /**
     * הורדת קובץ
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * התחלת רענון אוטומטי
     */
    startAutoRefresh() {
        setInterval(() => {
            this.refreshData();
        }, this.config.refreshInterval);
    }
}

module.exports = AnalyticsDashboard; 