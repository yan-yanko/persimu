/**
 * לוגיקת הדגמת סימולציית שירות לקוחות
 */

class CustomerServiceDemo {
    constructor() {
        this.scenario = new CustomerServiceScenario();
        this.currentState = {
            isRunning: false,
            isPaused: false,
            currentStep: 0,
            messages: [],
            metrics: {
                startTime: null,
                duration: 0,
                satisfaction: 0,
                efficiency: 0,
                escalations: 0
            }
        };

        this.initializeUI();
        this.setupEventListeners();
    }

    /**
     * אתחול ממשק המשתמש
     */
    initializeUI() {
        // טעינת מידע על הלקוח
        this.updateCustomerInfo();
        
        // טעינת מידע על התרחיש
        this.updateScenarioInfo();
        
        // טעינת מדדים
        this.updateMetrics();
        
        // טעינת אפשרויות פעולה
        this.updateActionButtons();
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

        // שליחת הודעה
        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendMessage();
        });

        // הקלדת הודעה
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
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
            
            // התחלת תסריט
            this.startScript();
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
            currentStep: 0,
            messages: [],
            metrics: {
                startTime: null,
                duration: 0,
                satisfaction: 0,
                efficiency: 0,
                escalations: 0
            }
        };

        // איפוס כפתורים
        document.getElementById('startSimulation').disabled = false;
        document.getElementById('pauseSimulation').disabled = true;
        document.getElementById('pauseSimulation').textContent = 'השהה';

        // ניקוי הודעות
        this.clearMessages();
        
        // איפוס מדדים
        this.updateMetrics();
    }

    /**
     * התחלת תסריט
     */
    startScript() {
        const script = this.scenario.script;
        
        // הוספת פתיחת שיחה
        this.addMessage(script.opening.greeting, 'representative');
        this.addMessage(script.opening.customerIdentification, 'customer');
        this.addMessage(script.opening.issueIdentification, 'customer');

        // הוספת שאלות הבהרה
        script.problemClarification.questions.forEach(question => {
            this.addMessage(question, 'representative');
        });
    }

    /**
     * שליחת הודעה
     */
    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (message) {
            this.addMessage(message, 'representative');
            input.value = '';
            this.processCustomerResponse(message);
        }
    }

    /**
     * עיבוד תגובת לקוח
     */
    processCustomerResponse(message) {
        const script = this.scenario.script;
        const currentStep = this.currentState.currentStep;

        // ניתוח תגובה
        const sentiment = this.analyzeSentiment(message);
        this.updateMetrics({ sentiment });

        // בחירת תגובה מתאימה
        const response = this.selectResponse(message, sentiment);
        if (response) {
            this.addMessage(response, 'representative');
        }

        // בדיקת צורך באסקלציה
        if (this.shouldEscalate(sentiment)) {
            this.handleEscalation();
        }
    }

    /**
     * ניתוח סנטימנט
     */
    analyzeSentiment(message) {
        // מילות מפתח רגשיות
        const emotionalWords = {
            positive: ['מעולה', 'תודה', 'מצוין', 'אני מרוצה', 'עובד טוב', 'מסופק'],
            negative: ['רע', 'נורא', 'מתסכל', 'מעצבן', 'לא עובד', 'בסדר גמור'],
            neutral: ['בסדר', 'אוקיי', 'רגיל', 'נורמלי', 'ממוצע']
        };

        // טון דיבור
        const tones = {
            formal: ['אנא', 'תודה', 'בבקשה', 'אשמח'],
            informal: ['היי', 'שלום', 'תודה רבה', 'אני אשמח'],
            aggressive: ['אני דורש', 'אני רוצה', 'תמיד', 'לעולם לא'],
            friendly: ['אני אשמח', 'תודה רבה', 'מעולה', 'מצוין']
        };

        // רגשות
        const emotions = {
            anger: ['כועס', 'מטורף', 'מעצבן', 'נורא'],
            frustration: ['מתסכל', 'מעצבן', 'לא עובד', 'בסדר גמור'],
            satisfaction: ['מעולה', 'מצוין', 'אני מרוצה', 'עובד טוב'],
            disappointment: ['מאכזב', 'לא מה שציפיתי', 'לא כמו שצריך']
        };

        // חישוב ציונים
        let sentimentScore = 0;
        let intensity = 0;
        let detectedEmotions = [];
        let detectedTones = [];

        // בדיקת מילות מפתח רגשיות
        for (const [category, words] of Object.entries(emotionalWords)) {
            for (const word of words) {
                if (message.includes(word)) {
                    switch (category) {
                        case 'positive':
                            sentimentScore += 0.3;
                            break;
                        case 'negative':
                            sentimentScore -= 0.3;
                            break;
                    }
                    intensity += 0.2;
                }
            }
        }

        // בדיקת טון דיבור
        for (const [tone, words] of Object.entries(tones)) {
            for (const word of words) {
                if (message.includes(word)) {
                    detectedTones.push(tone);
                    switch (tone) {
                        case 'aggressive':
                            sentimentScore -= 0.2;
                            intensity += 0.3;
                            break;
                        case 'friendly':
                            sentimentScore += 0.1;
                            break;
                    }
                }
            }
        }

        // בדיקת רגשות
        for (const [emotion, words] of Object.entries(emotions)) {
            for (const word of words) {
                if (message.includes(word)) {
                    detectedEmotions.push(emotion);
                    switch (emotion) {
                        case 'anger':
                        case 'frustration':
                            sentimentScore -= 0.4;
                            intensity += 0.4;
                            break;
                        case 'satisfaction':
                            sentimentScore += 0.4;
                            break;
                        case 'disappointment':
                            sentimentScore -= 0.3;
                            intensity += 0.3;
                            break;
                    }
                }
            }
        }

        // נרמול ציונים
        sentimentScore = Math.max(-1, Math.min(1, sentimentScore));
        intensity = Math.max(0, Math.min(1, intensity));

        return {
            score: sentimentScore,
            emotions: [...new Set(detectedEmotions)],
            tones: [...new Set(detectedTones)],
            intensity: intensity
        };
    }

    /**
     * בחירת תגובה
     */
    selectResponse(message, sentiment) {
        const script = this.scenario.script;
        const solutions = script.solutionAttempts[0].solutions;

        // בחירת פתרון מתאים
        return solutions[Math.floor(Math.random() * solutions.length)];
    }

    /**
     * בדיקת צורך באסקלציה
     */
    shouldEscalate(sentiment) {
        return sentiment.intensity > 0.7 || this.currentState.metrics.escalations > 0;
    }

    /**
     * טיפול באסקלציה
     */
    handleEscalation() {
        const script = this.scenario.script;
        this.currentState.metrics.escalations++;

        // הוספת הודעת אסקלציה
        this.addMessage(script.escalation.process[0], 'representative');
        
        // עדכון מדדים
        this.updateMetrics({ escalated: true });
    }

    /**
     * הוספת הודעה
     */
    addMessage(text, sender) {
        const message = {
            text,
            sender,
            timestamp: new Date()
        };

        this.currentState.messages.push(message);
        this.displayMessage(message);
    }

    /**
     * הצגת הודעה
     */
    displayMessage(message) {
        const container = document.getElementById('conversationMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}`;
        messageElement.textContent = message.text;
        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * ניקוי הודעות
     */
    clearMessages() {
        const container = document.getElementById('conversationMessages');
        container.innerHTML = '';
    }

    /**
     * עדכון מידע על הלקוח
     */
    updateCustomerInfo() {
        const customer = this.scenario.personas.customer;
        const container = document.getElementById('customerInfo');

        container.innerHTML = `
            <div class="customer-details">
                <p><strong>שם:</strong> ${customer.name}</p>
                <p><strong>גיל:</strong> ${customer.demographics.age}</p>
                <p><strong>מקצוע:</strong> ${customer.demographics.occupation}</p>
                <p><strong>מיקום:</strong> ${customer.demographics.location}</p>
            </div>
            <div class="customer-history">
                <h3>היסטוריית רכישות</h3>
                ${this.formatPurchaseHistory(customer.purchaseHistory)}
            </div>
        `;
    }

    /**
     * עיצוב היסטוריית רכישות
     */
    formatPurchaseHistory(history) {
        return history.map(purchase => `
            <div class="purchase-item">
                <p><strong>תאריך:</strong> ${purchase.date}</p>
                <p><strong>מוצר:</strong> ${purchase.product}</p>
                <p><strong>מחיר:</strong> ₪${purchase.price}</p>
                <p><strong>שביעות רצון:</strong> ${purchase.satisfaction}/10</p>
            </div>
        `).join('');
    }

    /**
     * עדכון מידע על התרחיש
     */
    updateScenarioInfo() {
        const context = this.scenario.context;
        const container = document.getElementById('scenarioInfo');

        container.innerHTML = `
            <div class="company-info">
                <h3>${context.company.name}</h3>
                <p><strong>תעשייה:</strong> ${context.company.industry}</p>
            </div>
            <div class="product-info">
                <h3>מוצר</h3>
                ${this.formatProductInfo(context.company.products[0])}
            </div>
            <div class="policies-info">
                <h3>מדיניות</h3>
                ${this.formatPoliciesInfo(context.company.policies)}
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
            </div>
        `;
    }

    /**
     * עיצוב מידע על מדיניות
     */
    formatPoliciesInfo(policies) {
        return `
            <div class="policy-details">
                <h4>החזרות</h4>
                <p><strong>תקופה:</strong> ${policies.returns.period}</p>
                <p><strong>תנאים:</strong> ${policies.returns.conditions}</p>
                <p><strong>תהליך:</strong> ${policies.returns.process}</p>
                
                <h4>תלונות</h4>
                <p><strong>רמות אסקלציה:</strong> ${policies.complaints.escalation.levels.join(' → ')}</p>
                <p><strong>זמני טיפול:</strong> ${policies.complaints.escalation.timeframes.join(', ')} דקות</p>
            </div>
        `;
    }

    /**
     * עדכון מדדים
     */
    updateMetrics(interaction = {}) {
        if (this.currentState.metrics.startTime) {
            this.currentState.metrics.duration = 
                (Date.now() - this.currentState.metrics.startTime) / 1000;
        }

        if (interaction.sentiment) {
            this.currentState.metrics.satisfaction = 
                (this.currentState.metrics.satisfaction + interaction.sentiment.score) / 2;
        }

        if (interaction.escalated) {
            this.currentState.metrics.escalations++;
        }

        const container = document.getElementById('liveMetrics');
        container.innerHTML = `
            <div class="metric-card">
                <div class="metric-value">${Math.round(this.currentState.metrics.duration)}</div>
                <div class="metric-label">זמן שיחה (שניות)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(this.currentState.metrics.satisfaction * 10)}</div>
                <div class="metric-label">שביעות רצון (1-10)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.currentState.metrics.escalations}</div>
                <div class="metric-label">אסקלציות</div>
            </div>
        `;
    }

    /**
     * עדכון כפתורי פעולה
     */
    updateActionButtons() {
        const container = document.getElementById('actionButtons');
        const script = this.scenario.script;

        container.innerHTML = script.solutionAttempts[0].solutions.map(solution => `
            <button class="action-btn" onclick="demo.selectSolution('${solution}')">
                ${solution}
            </button>
        `).join('');
    }

    /**
     * בחירת פתרון
     */
    selectSolution(solution) {
        if (!this.currentState.isRunning || this.currentState.isPaused) return;

        const script = this.scenario.script;
        const customer = this.scenario.personas.customer;
        const representative = this.scenario.personas.representative;

        // בדיקת מגבלות נציג
        if (solution.includes('החזר') && solution.includes('מלא')) {
            if (this.currentState.metrics.escalations === 0) {
                this.addMessage("מצטערת, אני לא יכולה להציע החזר מלא בשלב זה", 'representative');
                return;
            }
        }

        // הוספת הודעת פתרון
        this.addMessage(solution, 'representative');

        // חישוב שביעות רצון
        let satisfactionChange = 0;
        switch (solution) {
            case 'הדרכה לאתחול':
                satisfactionChange = -0.2;
                break;
            case 'בדיקת הגדרות':
                satisfactionChange = -0.1;
                break;
            case 'עדכון תוכנה':
                satisfactionChange = 0.1;
                break;
            case 'החלפת מוצר':
                satisfactionChange = 0.5;
                break;
            case 'החזר כספי חלקי':
                satisfactionChange = 0.3;
                break;
            case 'העברה למנהל':
                satisfactionChange = -0.3;
                break;
        }

        // עדכון מדדים
        this.updateMetrics({
            satisfaction: satisfactionChange,
            solution: solution
        });

        // בדיקת סגירת שיחה
        if (this.shouldCloseConversation(solution)) {
            this.closeConversation(solution);
        }
    }

    /**
     * בדיקת סגירת שיחה
     */
    shouldCloseConversation(solution) {
        const metrics = this.currentState.metrics;
        const customer = this.scenario.personas.customer;

        // סגירה אוטומטית במקרה של שביעות רצון גבוהה
        if (metrics.satisfaction > 0.7) {
            return true;
        }

        // סגירה אוטומטית במקרה של אסקלציה
        if (metrics.escalations >= this.scenario.environment.constraints.maxEscalations) {
            return true;
        }

        // סגירה אוטומטית במקרה של פתרון מוצלח
        if (['החלפת מוצר', 'החזר כספי מלא'].includes(solution)) {
            return true;
        }

        return false;
    }

    /**
     * סגירת שיחה
     */
    closeConversation(solution) {
        const script = this.scenario.script;
        const metrics = this.currentState.metrics;

        // בחירת הודעת סגירה
        let closingMessage;
        if (metrics.satisfaction > 0.7) {
            closingMessage = script.closing.success.confirmation;
        } else if (metrics.escalations >= this.scenario.environment.constraints.maxEscalations) {
            closingMessage = script.closing.failure.escalation;
        } else {
            closingMessage = script.closing.success.followUp;
        }

        // הוספת הודעת סגירה
        this.addMessage(closingMessage, 'representative');

        // הפסקת סימולציה
        this.currentState.isRunning = false;
        document.getElementById('startSimulation').disabled = false;
        document.getElementById('pauseSimulation').disabled = true;
        document.getElementById('pauseSimulation').textContent = 'השהה';

        // הצגת דוח סימולציה
        this.showSimulationReport();
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
                        <span class="label">זמן שיחה:</span>
                        <span class="value">${Math.round(report.summary.duration)} דקות</span>
                    </div>
                    <div class="metric">
                        <span class="label">שביעות רצון:</span>
                        <span class="value">${Math.round(report.summary.satisfaction * 10)}/10</span>
                    </div>
                    <div class="metric">
                        <span class="label">יעילות פתרון:</span>
                        <span class="value">${Math.round(report.summary.efficiency * 10)}/10</span>
                    </div>
                    <div class="metric">
                        <span class="label">אסקלציות:</span>
                        <span class="value">${report.summary.escalations}</span>
                    </div>
                </div>
            </div>
            <div class="report-section">
                <h3>ניתוח רגשי</h3>
                <div class="sentiment-analysis">
                    ${this.formatSentimentAnalysis(report.details.sentiment)}
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
     * עיצוב ניתוח רגשי
     */
    formatSentimentAnalysis(sentiment) {
        const emotions = sentiment.map(s => s.emotions).flat();
        const tones = sentiment.map(s => s.tones).flat();
        
        const emotionCounts = this.countOccurrences(emotions);
        const toneCounts = this.countOccurrences(tones);

        return `
            <div class="emotions">
                <h4>רגשות שזוהו</h4>
                ${Object.entries(emotionCounts).map(([emotion, count]) => `
                    <div class="emotion-item">
                        <span class="emotion">${emotion}</span>
                        <span class="count">${count}</span>
                    </div>
                `).join('')}
            </div>
            <div class="tones">
                <h4>טון דיבור</h4>
                ${Object.entries(toneCounts).map(([tone, count]) => `
                    <div class="tone-item">
                        <span class="tone">${tone}</span>
                        <span class="count">${count}</span>
                    </div>
                `).join('')}
            </div>
        `;
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

    /**
     * ספירת הופעות
     */
    countOccurrences(array) {
        return array.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});
    }
}

// יצירת מופע גלובלי
const demo = new CustomerServiceDemo(); 