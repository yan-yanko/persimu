/**
 * לוגיקת הדגמת סימולציית תהליך רכישה
 */
class PurchaseDemo {
    constructor() {
        this.scenario = new PurchaseScenario();
        this.currentState = {
            isRunning: false,
            isPaused: false,
            customers: [],
            metrics: {
                startTime: null,
                duration: 0,
                conversions: 0,
                averageSatisfaction: 0
            }
        };

        this.initializeUI();
        this.setupEventListeners();
    }

    /**
     * אתחול ממשק המשתמש
     */
    initializeUI() {
        // טעינת מידע על התרחיש
        this.updateScenarioInfo();
        
        // טעינת סימולציית לקוחות
        this.updateCustomersGrid();
        
        // טעינת מדדים
        this.updateMetrics();
    }

    /**
     * הגדרת מאזיני אירועים
     */
    setupEventListeners() {
        // כפתור התחלת סימולציה
        document.getElementById('startSimulation').addEventListener('click', () => {
            this.startSimulation();
        });

        // כפתור השהאת סימולציה
        document.getElementById('pauseSimulation').addEventListener('click', () => {
            this.togglePause();
        });

        // כפתור איפוס סימולציה
        document.getElementById('resetSimulation').addEventListener('click', () => {
            this.resetSimulation();
        });

        // שליטה במחיר
        document.getElementById('priceControl').addEventListener('input', (e) => {
            this.updatePrice(e.target.value);
        });

        // שליטה בהנחה
        document.getElementById('discountControl').addEventListener('change', (e) => {
            this.updateDiscount(e.target.value);
        });

        // שליטה במשלוח
        document.getElementById('shippingControl').addEventListener('change', (e) => {
            this.updateShipping(e.target.value);
        });
    }

    /**
     * התחלת סימולציה
     */
    startSimulation() {
        if (!this.currentState.isRunning) {
            this.currentState.isRunning = true;
            this.currentState.isPaused = false;
            this.currentState.metrics.startTime = Date.now();
            
            // הפעלת כפתורים
            document.getElementById('startSimulation').disabled = true;
            document.getElementById('pauseSimulation').disabled = false;
            
            // התחלת סימולציית לקוחות
            this.scenario.startSimulation();
            this.currentState.customers = this.scenario.personas.customers;
            
            // התחלת עדכון מדדים
            this.startMetricsUpdate();
        }
    }

    /**
     * השהאת/המשך סימולציה
     */
    togglePause() {
        if (this.currentState.isRunning) {
            this.currentState.isPaused = !this.currentState.isPaused;
            document.getElementById('pauseSimulation').textContent = 
                this.currentState.isPaused ? 'המשך' : 'השהה';
        }
    }

    /**
     * איפוס סימולציה
     */
    resetSimulation() {
        this.currentState = {
            isRunning: false,
            isPaused: false,
            customers: [],
            metrics: {
                startTime: null,
                duration: 0,
                conversions: 0,
                averageSatisfaction: 0
            }
        };

        // איפוס כפתורים
        document.getElementById('startSimulation').disabled = false;
        document.getElementById('pauseSimulation').disabled = true;
        document.getElementById('pauseSimulation').textContent = 'השהה';

        // איפוס ממשק
        this.updateCustomersGrid();
        this.updateMetrics();
    }

    /**
     * התחלת עדכון מדדים
     */
    startMetricsUpdate() {
        if (!this.currentState.isRunning || this.currentState.isPaused) return;

        // עדכון מדדים
        this.updateMetrics();

        // עדכון סימולציית לקוחות
        this.updateCustomersGrid();

        // בדיקת סיום סימולציה
        if (this.checkSimulationEnd()) {
            this.endSimulation();
        } else {
            // המשך עדכון
            setTimeout(() => this.startMetricsUpdate(), 1000);
        }
    }

    /**
     * בדיקת סיום סימולציה
     */
    checkSimulationEnd() {
        return this.currentState.customers.every(customer => 
            customer.journey.metrics.conversion || 
            customer.journey.stage === 'נטישה'
        );
    }

    /**
     * סיום סימולציה
     */
    endSimulation() {
        this.currentState.isRunning = false;
        document.getElementById('startSimulation').disabled = false;
        document.getElementById('pauseSimulation').disabled = true;
        document.getElementById('pauseSimulation').textContent = 'השהה';

        // הצגת דוח סימולציה
        this.showSimulationReport();
    }

    /**
     * עדכון מידע על התרחיש
     */
    updateScenarioInfo() {
        const container = document.getElementById('scenarioInfo');
        const context = this.scenario.context;

        container.innerHTML = `
            <div class="company-info">
                <h3>${context.company.name}</h3>
                <p><strong>תעשייה:</strong> ${context.company.industry}</p>
            </div>
            <div class="product-info">
                <h3>מוצר</h3>
                ${this.formatProductInfo(context.company.products[0])}
            </div>
            <div class="environment-info">
                <h3>סביבת מכירה</h3>
                ${this.formatEnvironmentInfo(this.scenario.environment)}
            </div>
        `;
    }

    /**
     * עיצוב מידע על מוצר
     */
    formatProductInfo(product) {
        return `
            <div class="product-details">
                <p><strong>שם:</strong> ${product.name}</p>
                <p><strong>מחיר:</strong> ₪${product.price}</p>
                <p><strong>אחריות:</strong> ${product.warranty}</p>
                <p><strong>תכונות:</strong> ${product.features.join(', ')}</p>
                <p><strong>מתחרים:</strong> ${this.formatCompetitors(product.competitors)}</p>
            </div>
        `;
    }

    /**
     * עיצוב מידע על מתחרים
     */
    formatCompetitors(competitors) {
        return competitors.map(c => `${c.name} (₪${c.price})`).join(', ');
    }

    /**
     * עיצוב מידע על סביבה
     */
    formatEnvironmentInfo(environment) {
        return `
            <div class="store-info">
                <h4>חנות</h4>
                <p><strong>מחיר בסיס:</strong> ₪${environment.store.pricing.base}</p>
                <p><strong>הנחות:</strong> ${this.formatPromotions(environment.store.pricing.promotions)}</p>
                <p><strong>אמצעי תשלום:</strong> ${environment.store.payment.methods.join(', ')}</p>
                <p><strong>אפשרויות משלוח:</strong> ${this.formatShipping(environment.store.shipping)}</p>
            </div>
            <div class="interactions-info">
                <h4>אינטראקציות</h4>
                ${this.formatInteractions(environment.interactions)}
            </div>
        `;
    }

    /**
     * עיצוב מידע על הנחות
     */
    formatPromotions(promotions) {
        return promotions.map(p => `${p.type} של ₪${p.value} (${p.condition})`).join(', ');
    }

    /**
     * עיצוב מידע על משלוח
     */
    formatShipping(shipping) {
        return shipping.methods.map((m, i) => `${m} (${shipping.costs[i] === 0 ? 'חינם' : `₪${shipping.costs[i]}`})`).join(', ');
    }

    /**
     * עיצוב מידע על אינטראקציות
     */
    formatInteractions(interactions) {
        return interactions.map(i => `
            <div class="interaction-item">
                <h5>${i.type}</h5>
                <p>אפשרויות: ${i.options.join(', ')}</p>
                <p>משקל: ${i.weight}</p>
            </div>
        `).join('');
    }

    /**
     * עדכון סימולציית לקוחות
     */
    updateCustomersGrid() {
        const container = document.getElementById('customersGrid');
        container.innerHTML = this.currentState.customers.map(customer => `
            <div class="customer-card">
                <div class="customer-header">
                    <h3>${customer.name}</h3>
                    <span class="stage-badge ${customer.journey.stage}">${customer.journey.stage}</span>
                </div>
                <div class="customer-details">
                    <p><strong>גיל:</strong> ${customer.demographics.age}</p>
                    <p><strong>מקצוע:</strong> ${customer.demographics.occupation}</p>
                    <p><strong>רמת הכנסה:</strong> ${customer.demographics.income}</p>
                    <p><strong>סגנון החלטה:</strong> ${customer.decisionStyle}</p>
                    <p><strong>ידע טכני:</strong> ${customer.techKnowledge}</p>
                </div>
                <div class="customer-preferences">
                    <h4>העדפות</h4>
                    <div class="preferences-grid">
                        <div class="preference-item">
                            <span class="label">איכות</span>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${customer.preferences.quality * 100}%"></div>
                            </div>
                        </div>
                        <div class="preference-item">
                            <span class="label">מחיר</span>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${customer.preferences.price * 100}%"></div>
                            </div>
                        </div>
                        <div class="preference-item">
                            <span class="label">חדשנות</span>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${customer.preferences.innovation * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="customer-journey">
                    <h4>מסע לקוח</h4>
                    <div class="journey-timeline">
                        ${this.formatJourneyTimeline(customer.journey.touchpoints)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * עיצוב ציר זמן מסע
     */
    formatJourneyTimeline(touchpoints) {
        return touchpoints.map(touchpoint => `
            <div class="timeline-item">
                <div class="time">${new Date(touchpoint.timestamp).toLocaleTimeString()}</div>
                <div class="type">${touchpoint.type}</div>
                <div class="details">${touchpoint.details || ''}</div>
            </div>
        `).join('');
    }

    /**
     * עדכון מדדים
     */
    updateMetrics() {
        if (this.currentState.metrics.startTime) {
            this.currentState.metrics.duration = 
                (Date.now() - this.currentState.metrics.startTime) / 1000;
        }

        const conversions = this.currentState.customers.filter(c => 
            c.journey.metrics.conversion
        ).length;

        const satisfactions = this.currentState.customers.map(c => 
            c.journey.metrics.satisfaction
        );

        this.currentState.metrics.conversions = conversions;
        this.currentState.metrics.averageSatisfaction = 
            satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length;

        const container = document.getElementById('liveMetrics');
        container.innerHTML = `
            <div class="metric-card">
                <div class="metric-value">${Math.round(this.currentState.metrics.duration)}</div>
                <div class="metric-label">זמן סימולציה (שניות)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.currentState.metrics.conversions}</div>
                <div class="metric-label">המרות</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(this.currentState.metrics.averageSatisfaction * 10)}</div>
                <div class="metric-label">שביעות רצון ממוצעת (1-10)</div>
            </div>
        `;
    }

    /**
     * עדכון מחיר
     */
    updatePrice(value) {
        const priceElement = document.getElementById('priceValue');
        priceElement.textContent = `₪${value}`;
        
        if (this.currentState.isRunning) {
            this.scenario.context.company.products[0].price = parseInt(value);
            this.updateCustomersGrid();
        }
    }

    /**
     * עדכון הנחה
     */
    updateDiscount(value) {
        if (this.currentState.isRunning) {
            const promotion = {
                type: 'הנחה',
                value: parseInt(value),
                condition: 'רכישה ראשונה'
            };
            this.scenario.environment.store.pricing.promotions[0] = promotion;
            this.updateCustomersGrid();
        }
    }

    /**
     * עדכון משלוח
     */
    updateShipping(value) {
        if (this.currentState.isRunning) {
            this.scenario.environment.store.shipping.costs[0] = parseInt(value);
            this.updateCustomersGrid();
        }
    }

    /**
     * הצגת דוח סימולציה
     */
    showSimulationReport() {
        const report = this.scenario.getSimulationReport();
        const container = document.getElementById('simulationReport');

        container.innerHTML = `
            <div class="report-section">
                <h3>סיכום סימולציה</h3>
                <div class="report-metrics">
                    <div class="metric">
                        <span class="label">זמן סימולציה:</span>
                        <span class="value">${Math.round(report.summary.averageDuration)} שניות</span>
                    </div>
                    <div class="metric">
                        <span class="label">שיעור המרה:</span>
                        <span class="value">${Math.round(report.summary.conversions / report.summary.totalCustomers * 100)}%</span>
                    </div>
                    <div class="metric">
                        <span class="label">שביעות רצון:</span>
                        <span class="value">${Math.round(report.summary.averageSatisfaction * 10)}/10</span>
                    </div>
                </div>
            </div>
            <div class="report-section">
                <h3>ניתוח שלבי מסע</h3>
                <div class="journey-analysis">
                    ${this.formatJourneyAnalysis(report.details.journeyStages)}
                </div>
            </div>
            <div class="report-section">
                <h3>ניתוח גורמי החלטה</h3>
                <div class="decision-analysis">
                    ${this.formatDecisionAnalysis(report.details.decisionFactors)}
                </div>
            </div>
            <div class="report-section">
                <h3>המלצות לשיפור</h3>
                <div class="recommendations">
                    ${this.formatRecommendations(report.recommendations)}
                </div>
            </div>
        `;
    }

    /**
     * עיצוב ניתוח מסע
     */
    formatJourneyAnalysis(stages) {
        return Object.entries(stages).map(([stage, data]) => `
            <div class="stage-item">
                <h4>${stage}</h4>
                <p>לקוחות: ${data.customers}</p>
                <p>זמן ממוצע: ${Math.round(data.averageTime)} שניות</p>
            </div>
        `).join('');
    }

    /**
     * עיצוב ניתוח החלטות
     */
    formatDecisionAnalysis(factors) {
        return Object.entries(factors).map(([factor, data]) => `
            <div class="factor-item">
                <h4>${factor}</h4>
                <p>משקל: ${data.weight}</p>
                <p>השפעה: ${Math.round(data.impact * 100)}%</p>
            </div>
        `).join('');
    }

    /**
     * עיצוב המלצות
     */
    formatRecommendations(recommendations) {
        return recommendations.map(rec => `
            <div class="recommendation-item ${rec.priority}">
                <h4>${rec.type}</h4>
                <p>${rec.description}</p>
                <span class="priority">עדיפות: ${rec.priority}</span>
            </div>
        `).join('');
    }
}

// יצירת מופע גלובלי
const demo = new PurchaseDemo(); 