/**
 * מחלקת הדגמת מחקר שוק
 */
class MarketResearchDemo {
    constructor() {
        this.scenario = new MarketResearchScenario();
        this.isRunning = false;
        this.isPaused = false;
        this.currentMethod = null;
        this.results = [];
        this.metrics = {
            totalParticipants: 0,
            averageSentiment: 0,
            averageWillingnessToPay: 0,
            averagePurchaseProbability: 0,
            feedbackCategories: {}
        };

        this.initializeUI();
        this.setupEventListeners();
    }

    /**
     * אתחול ממשק המשתמש
     */
    initializeUI() {
        // עדכון מידע על התרחיש
        this.updateScenarioInfo();
        
        // עדכון מידע על המוצר
        this.updateProductInfo();
        
        // עדכון אפשרויות התערבות
        this.updateInterventionOptions();
        
        // אתחול תוצאות בזמן אמת
        this.updateLiveResults();
    }

    /**
     * הגדרת מאזיני אירועים
     */
    setupEventListeners() {
        // כפתורי שליטה
        document.getElementById('startBtn').addEventListener('click', () => this.startSimulation());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSimulation());

        // אפשרויות התערבות
        document.getElementById('priceControl').addEventListener('input', (e) => this.updatePrice(e.target.value));
        document.getElementById('packagingControl').addEventListener('change', (e) => this.updatePackaging(e.target.value));
        document.getElementById('flavorControl').addEventListener('change', (e) => this.updateFlavor(e.target.value));
    }

    /**
     * עדכון מידע על התרחיש
     */
    updateScenarioInfo() {
        const scenarioInfo = document.getElementById('scenarioInfo');
        scenarioInfo.innerHTML = `
            <h2>מידע על התרחיש</h2>
            <p><strong>חברה:</strong> ${this.scenario.company.name}</p>
            <p><strong>תעשייה:</strong> ${this.scenario.company.industry}</p>
            <p><strong>מוצר:</strong> ${this.scenario.product.name}</p>
            <p><strong>מטרות עסקיות:</strong></p>
            <ul>
                ${this.scenario.businessGoals.map(goal => `<li>${goal}</li>`).join('')}
            </ul>
        `;
    }

    /**
     * עדכון מידע על המוצר
     */
    updateProductInfo() {
        const productInfo = document.getElementById('productInfo');
        productInfo.innerHTML = `
            <h2>מידע על המוצר</h2>
            <div class="concept">
                <h3>${this.scenario.product.name}</h3>
                <p>${this.scenario.product.description}</p>
            </div>
            <div class="price">
                ₪${this.scenario.product.price}
            </div>
            <div class="features">
                <h3>תכונות עיקריות</h3>
                <ul>
                    ${this.scenario.product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            <div class="nutrition">
                <h3>ערכים תזונתיים</h3>
                <ul>
                    ${Object.entries(this.scenario.product.nutrition).map(([key, value]) => 
                        `<li>${key}: ${value}</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * עדכון אפשרויות התערבות
     */
    updateInterventionOptions() {
        const interventionOptions = document.getElementById('interventionOptions');
        interventionOptions.innerHTML = `
            <h2>אפשרויות התערבות</h2>
            <div class="intervention-controls">
                <div class="control-group">
                    <label for="priceControl">מחיר (₪)</label>
                    <input type="range" id="priceControl" min="10" max="30" step="0.1" 
                           value="${this.scenario.product.price}">
                </div>
                <div class="control-group">
                    <label for="packagingControl">גודל אריזה</label>
                    <select id="packagingControl">
                        ${this.scenario.product.packaging.map(option => 
                            `<option value="${option}">${option}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="control-group">
                    <label for="flavorControl">טעמים</label>
                    <select id="flavorControl">
                        ${this.scenario.product.flavors.map(flavor => 
                            `<option value="${flavor}">${flavor}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * עדכון תוצאות בזמן אמת
     */
    updateLiveResults() {
        const liveResults = document.getElementById('liveResults');
        liveResults.innerHTML = `
            <h2>תוצאות בזמן אמת</h2>
            <div class="results-grid">
                <div class="result-card">
                    <h3>משתתפים</h3>
                    <p>${this.metrics.totalParticipants}</p>
                </div>
                <div class="result-card">
                    <h3>סנטימנט ממוצע</h3>
                    <p>${this.metrics.averageSentiment.toFixed(2)}</p>
                </div>
                <div class="result-card">
                    <h3>נכונות לשלם</h3>
                    <p>₪${this.metrics.averageWillingnessToPay.toFixed(2)}</p>
                </div>
                <div class="result-card">
                    <h3>הסתברות רכישה</h3>
                    <p>${(this.metrics.averagePurchaseProbability * 100).toFixed(1)}%</p>
                </div>
            </div>
        `;
    }

    /**
     * התחלת סימולציה
     */
    startSimulation() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.runNextMethod();
        }
    }

    /**
     * השהיית סימולציה
     */
    pauseSimulation() {
        if (this.isRunning) {
            this.isPaused = true;
        }
    }

    /**
     * איפוס סימולציה
     */
    resetSimulation() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentMethod = null;
        this.results = [];
        this.metrics = {
            totalParticipants: 0,
            averageSentiment: 0,
            averageWillingnessToPay: 0,
            averagePurchaseProbability: 0,
            feedbackCategories: {}
        };
        this.updateLiveResults();
    }

    /**
     * הרצת שיטת מחקר הבאה
     */
    async runNextMethod() {
        if (!this.isRunning || this.isPaused) return;

        const methods = ['focusGroup', 'interviews', 'conceptTesting'];
        const currentIndex = methods.indexOf(this.currentMethod);
        const nextIndex = (currentIndex + 1) % methods.length;
        this.currentMethod = methods[nextIndex];

        const methodCard = document.querySelector(`#${this.currentMethod}Card`);
        methodCard.classList.add('active');

        let results;
        switch (this.currentMethod) {
            case 'focusGroup':
                results = await this.scenario.runFocusGroup();
                break;
            case 'interviews':
                results = await this.scenario.runInterviews();
                break;
            case 'conceptTesting':
                results = await this.scenario.runConceptTesting();
                break;
        }

        this.results.push(...results);
        this.updateMetrics();
        this.updateLiveResults();

        methodCard.classList.remove('active');

        if (this.isRunning && !this.isPaused) {
            setTimeout(() => this.runNextMethod(), 2000);
        }
    }

    /**
     * עדכון מדדים
     */
    updateMetrics() {
        const totalResults = this.results.length;
        if (totalResults === 0) return;

        this.metrics.totalParticipants = totalResults;
        this.metrics.averageSentiment = this.results.reduce((sum, r) => sum + r.sentiment, 0) / totalResults;
        this.metrics.averageWillingnessToPay = this.results.reduce((sum, r) => sum + r.willingnessToPay, 0) / totalResults;
        this.metrics.averagePurchaseProbability = this.results.reduce((sum, r) => sum + r.purchaseProbability, 0) / totalResults;

        // עדכון קטגוריות משוב
        this.results.forEach(result => {
            result.feedback.forEach(feedback => {
                if (!this.metrics.feedbackCategories[feedback.category]) {
                    this.metrics.feedbackCategories[feedback.category] = 0;
                }
                this.metrics.feedbackCategories[feedback.category]++;
            });
        });
    }

    /**
     * עדכון מחיר
     */
    updatePrice(price) {
        this.scenario.product.price = parseFloat(price);
        this.updateProductInfo();
    }

    /**
     * עדכון אריזה
     */
    updatePackaging(packaging) {
        this.scenario.product.packaging = [packaging];
        this.updateProductInfo();
    }

    /**
     * עדכון טעם
     */
    updateFlavor(flavor) {
        this.scenario.product.flavors = [flavor];
        this.updateProductInfo();
    }
}

// יצירת מופע של הדגמת מחקר שוק
const demo = new MarketResearchDemo(); 