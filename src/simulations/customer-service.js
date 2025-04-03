/**
 * סימולציית שירות לקוחות
 */

const { Agent, Simulation } = require('../core');
const { EmotionalState } = require('../personality');

class CustomerServiceSimulation extends Simulation {
    constructor(config = {}) {
        super(config);
        this.serviceCenter = new ServiceCenter(config.serviceCenter);
        this.agents = new Map();
        this.scenarios = new Map();
        this.metrics = new CustomerServiceMetrics();
    }

    /**
     * אתחול הסימולציה
     */
    async initialize() {
        // יצירת נציגי שירות
        await this.createServiceRepresentatives();
        
        // יצירת לקוחות
        await this.createCustomers();
        
        // טעינת תסריטים
        await this.loadScenarios();
        
        // התחלת מערכת הניטור
        this.metrics.startMonitoring();
    }

    /**
     * יצירת נציגי שירות
     */
    async createServiceRepresentatives() {
        const representatives = [
            {
                id: 'rep1',
                name: 'דנה כהן',
                personality: {
                    traits: {
                        patience: 0.8,
                        professionalism: 0.9,
                        empathy: 0.85
                    },
                    emotionalState: new EmotionalState({
                        baseEmotions: {
                            calmness: 0.8,
                            focus: 0.9
                        }
                    })
                },
                skills: ['problem_solving', 'communication', 'product_knowledge'],
                experience: 2
            },
            {
                id: 'rep2',
                name: 'יוסי לוי',
                personality: {
                    traits: {
                        patience: 0.75,
                        professionalism: 0.85,
                        empathy: 0.8
                    },
                    emotionalState: new EmotionalState({
                        baseEmotions: {
                            calmness: 0.75,
                            focus: 0.85
                        }
                    })
                },
                skills: ['technical_support', 'communication', 'customer_service'],
                experience: 1
            }
        ];

        for (const rep of representatives) {
            const agent = new Agent(rep);
            await agent.initialize();
            this.agents.set(rep.id, agent);
        }
    }

    /**
     * יצירת לקוחות
     */
    async createCustomers() {
        const customers = [
            {
                id: 'cust1',
                name: 'אבי ישראלי',
                personality: {
                    traits: {
                        patience: 0.3,
                        assertiveness: 0.8,
                        emotionalStability: 0.4
                    },
                    emotionalState: new EmotionalState({
                        baseEmotions: {
                            frustration: 0.7,
                            anger: 0.5
                        }
                    })
                },
                history: {
                    previousComplaints: 2,
                    customerSince: '2022-01-01'
                }
            },
            {
                id: 'cust2',
                name: 'מיכל גולן',
                personality: {
                    traits: {
                        patience: 0.6,
                        assertiveness: 0.5,
                        emotionalStability: 0.7
                    },
                    emotionalState: new EmotionalState({
                        baseEmotions: {
                            confusion: 0.6,
                            concern: 0.4
                        }
                    })
                },
                history: {
                    previousComplaints: 0,
                    customerSince: '2023-03-15'
                }
            }
        ];

        for (const cust of customers) {
            const agent = new Agent(cust);
            await agent.initialize();
            this.agents.set(cust.id, agent);
        }
    }

    /**
     * טעינת תסריטים
     */
    async loadScenarios() {
        this.scenarios.set('angry_customer', {
            name: 'לקוח כועס',
            description: 'לקוח מתקשר למוקד שירות עם תלונה על מוצר פגום',
            steps: [
                {
                    type: 'customer_initiation',
                    action: 'complain',
                    intensity: 0.8
                },
                {
                    type: 'representative_response',
                    required_skills: ['empathy', 'problem_solving']
                },
                {
                    type: 'resolution_attempt',
                    success_threshold: 0.7
                }
            ]
        });

        this.scenarios.set('confused_customer', {
            name: 'לקוח מבולבל',
            description: 'לקוח מתקשר למוקד שירות עם שאלות לגבי שימוש במוצר',
            steps: [
                {
                    type: 'customer_initiation',
                    action: 'ask_question',
                    intensity: 0.4
                },
                {
                    type: 'representative_response',
                    required_skills: ['product_knowledge', 'communication']
                },
                {
                    type: 'resolution_attempt',
                    success_threshold: 0.6
                }
            ]
        });
    }

    /**
     * הפעלת תסריט
     */
    async runScenario(scenarioId, customerId, representativeId) {
        const scenario = this.scenarios.get(scenarioId);
        const customer = this.agents.get(customerId);
        const representative = this.agents.get(representativeId);

        if (!scenario || !customer || !representative) {
            throw new Error('תסריט או סוכנים לא נמצאו');
        }

        this.metrics.startInteraction(customerId, representativeId);

        for (const step of scenario.steps) {
            if (step.type === 'customer_initiation') {
                await this.handleCustomerInitiation(customer, step);
            } else if (step.type === 'representative_response') {
                await this.handleRepresentativeResponse(representative, step);
            } else if (step.type === 'resolution_attempt') {
                const success = await this.handleResolutionAttempt(
                    customer,
                    representative,
                    step
                );
                if (success) {
                    this.metrics.recordSuccess(customerId, representativeId);
                } else {
                    this.metrics.recordFailure(customerId, representativeId);
                }
            }
        }

        this.metrics.endInteraction(customerId, representativeId);
    }

    /**
     * טיפול בפניית לקוח
     */
    async handleCustomerInitiation(customer, step) {
        const emotionalState = customer.getEmotionalState();
        const response = await customer.generateResponse({
            action: step.action,
            intensity: step.intensity,
            emotionalState
        });

        this.metrics.recordCustomerAction(customer.id, {
            action: step.action,
            intensity: step.intensity,
            emotionalState: emotionalState.getCurrentState()
        });

        return response;
    }

    /**
     * טיפול בתגובת נציג
     */
    async handleRepresentativeResponse(representative, step) {
        const response = await representative.generateResponse({
            required_skills: step.required_skills,
            context: this.getCurrentContext()
        });

        this.metrics.recordRepresentativeAction(representative.id, {
            skills_used: step.required_skills,
            response_quality: this.evaluateResponseQuality(response)
        });

        return response;
    }

    /**
     * טיפול בניסיון פתרון
     */
    async handleResolutionAttempt(customer, representative, step) {
        const resolution = await representative.generateResolution({
            customer_state: customer.getEmotionalState(),
            success_threshold: step.success_threshold
        });

        const success = this.evaluateResolution(resolution, step.success_threshold);

        this.metrics.recordResolution(customer.id, representative.id, {
            success,
            quality: this.evaluateResolutionQuality(resolution)
        });

        return success;
    }

    /**
     * הערכת איכות תגובה
     */
    evaluateResponseQuality(response) {
        // לוגיקת הערכת איכות
        return 0.8; // דוגמה
    }

    /**
     * הערכת איכות פתרון
     */
    evaluateResolutionQuality(resolution) {
        // לוגיקת הערכת איכות
        return 0.85; // דוגמה
    }

    /**
     * קבלת הקשר נוכחי
     */
    getCurrentContext() {
        return {
            time: new Date(),
            serviceCenter: this.serviceCenter.getStatus(),
            metrics: this.metrics.getCurrentMetrics()
        };
    }
}

/**
 * מוקד שירות
 */
class ServiceCenter {
    constructor(config = {}) {
        this.name = config.name || 'מוקד שירות וירטואלי';
        this.operatingHours = config.operatingHours || {
            start: '09:00',
            end: '17:00'
        };
        this.status = 'active';
    }

    getStatus() {
        return {
            name: this.name,
            status: this.status,
            operatingHours: this.operatingHours
        };
    }
}

/**
 * מדדי ביצוע
 */
class CustomerServiceMetrics {
    constructor() {
        this.interactions = new Map();
        this.metrics = {
            totalInteractions: 0,
            successfulResolutions: 0,
            averageResponseTime: 0,
            customerSatisfaction: 0
        };
    }

    startMonitoring() {
        setInterval(() => {
            this.updateMetrics();
        }, 60000); // עדכון כל דקה
    }

    startInteraction(customerId, representativeId) {
        this.interactions.set(`${customerId}-${representativeId}`, {
            startTime: Date.now(),
            actions: [],
            resolution: null
        });
        this.metrics.totalInteractions++;
    }

    endInteraction(customerId, representativeId) {
        const interaction = this.interactions.get(`${customerId}-${representativeId}`);
        if (interaction) {
            interaction.endTime = Date.now();
            this.updateInteractionMetrics(interaction);
        }
    }

    recordCustomerAction(customerId, action) {
        // תיעוד פעולת לקוח
    }

    recordRepresentativeAction(representativeId, action) {
        // תיעוד פעולת נציג
    }

    recordResolution(customerId, representativeId, resolution) {
        const interaction = this.interactions.get(`${customerId}-${representativeId}`);
        if (interaction) {
            interaction.resolution = resolution;
            if (resolution.success) {
                this.metrics.successfulResolutions++;
            }
        }
    }

    recordSuccess(customerId, representativeId) {
        // תיעוד הצלחה
    }

    recordFailure(customerId, representativeId) {
        // תיעוד כישלון
    }

    updateMetrics() {
        // חישוב מדדים מעודכנים
        this.metrics.averageResponseTime = this.calculateAverageResponseTime();
        this.metrics.customerSatisfaction = this.calculateCustomerSatisfaction();
    }

    calculateAverageResponseTime() {
        let totalTime = 0;
        let count = 0;

        for (const interaction of this.interactions.values()) {
            if (interaction.endTime) {
                totalTime += interaction.endTime - interaction.startTime;
                count++;
            }
        }

        return count > 0 ? totalTime / count : 0;
    }

    calculateCustomerSatisfaction() {
        // חישוב שביעות רצון לקוחות
        return 0.85; // דוגמה
    }

    getCurrentMetrics() {
        return { ...this.metrics };
    }
}

module.exports = CustomerServiceSimulation; 