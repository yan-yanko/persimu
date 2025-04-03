/**
 * תרחיש סימולציית תהליך רכישה
 */
class PurchaseScenario {
    constructor() {
        this.context = {
            company: {
                name: 'סמארט-הום',
                industry: 'טכנולוגיה לבית חכם',
                products: [{
                    name: 'סמארט-האב',
                    price: 1299,
                    features: [
                        'שליטה מרחוק במכשירי חשמל',
                        'מערכת אבטחה חכמה',
                        'חיסכון באנרגיה',
                        'תמיכה בקול'
                    ],
                    warranty: 'שנתיים',
                    competitors: [
                        { name: 'גוגל נסט', price: 1499 },
                        { name: 'אמזון אקו', price: 999 },
                        { name: 'אפל הומפוד', price: 1999 }
                    ]
                }]
            }
        };

        this.personas = {
            customers: [
                {
                    name: 'דנה כהן',
                    demographics: {
                        age: 28,
                        occupation: 'מפתחת תוכנה',
                        income: 'גבוה',
                        location: 'תל אביב'
                    },
                    decisionStyle: 'מחושב',
                    techKnowledge: 'מומחה',
                    preferences: {
                        quality: 0.9,
                        price: 0.7,
                        innovation: 0.8
                    },
                    journey: {
                        stage: 'awareness',
                        touchpoints: [],
                        decisions: []
                    }
                },
                {
                    name: 'יוסי לוי',
                    demographics: {
                        age: 45,
                        occupation: 'רואה חשבון',
                        income: 'בינוני-גבוה',
                        location: 'ירושלים'
                    },
                    decisionStyle: 'מתלבט',
                    techKnowledge: 'בינוני',
                    preferences: {
                        quality: 0.8,
                        price: 0.9,
                        innovation: 0.6
                    },
                    journey: {
                        stage: 'awareness',
                        touchpoints: [],
                        decisions: []
                    }
                },
                {
                    name: 'מיכל אברהם',
                    demographics: {
                        age: 35,
                        occupation: 'מעצבת פנים',
                        income: 'בינוני',
                        location: 'חיפה'
                    },
                    decisionStyle: 'אימפולסיבי',
                    techKnowledge: 'נמוך',
                    preferences: {
                        quality: 0.7,
                        price: 0.8,
                        innovation: 0.9
                    },
                    journey: {
                        stage: 'awareness',
                        touchpoints: [],
                        decisions: []
                    }
                }
            ]
        };

        this.environment = {
            store: {
                online: true,
                pricing: {
                    base: 1299,
                    promotions: [
                        { type: 'הנחה', value: 200, condition: 'רכישה ראשונה' },
                        { type: 'חינם', value: 100, condition: 'משלוח' }
                    ]
                },
                reviews: {
                    average: 4.5,
                    count: 128,
                    distribution: {
                        5: 75,
                        4: 35,
                        3: 12,
                        2: 4,
                        1: 2
                    }
                },
                payment: {
                    methods: ['כרטיס אשראי', 'ביט', 'PayPal'],
                    installments: [1, 3, 6, 12]
                },
                shipping: {
                    methods: ['דואר שליחים', 'איסוף עצמי'],
                    costs: [50, 0]
                }
            },
            interactions: [
                {
                    type: 'חיפוש מידע',
                    weight: 0.3,
                    options: [
                        'קריאת מאפייני מוצר',
                        'צפייה בסרטון הדרכה',
                        'השוואת מחירים',
                        'קריאת חוות דעת'
                    ]
                },
                {
                    type: 'התייעצות',
                    weight: 0.2,
                    options: [
                        'שיחה עם חברים',
                        'התייעצות עם מומחה',
                        'סקירת פורומים',
                        'צפייה בבלוגים'
                    ]
                },
                {
                    type: 'רכישה',
                    weight: 0.5,
                    options: [
                        'הוספה לסל',
                        'בחירת אמצעי תשלום',
                        'בחירת משלוח',
                        'הזמנה'
                    ]
                }
            ]
        };

        this.journey = {
            stages: [
                {
                    name: 'מודעות',
                    metrics: ['חשיפה', 'זמן צפייה', 'עומק אינטראקציה'],
                    touchpoints: ['פרסום', 'רשתות חברתיות', 'חיפוש']
                },
                {
                    name: 'התעניינות',
                    metrics: ['ביקורים חוזרים', 'השוואות', 'שמירה'],
                    touchpoints: ['דף מוצר', 'ביקורות', 'השוואות']
                },
                {
                    name: 'הערכה',
                    metrics: ['זמן בדיקה', 'השוואות', 'התייעצויות'],
                    touchpoints: ['חוות דעת', 'פורומים', 'מומחים']
                },
                {
                    name: 'החלטה',
                    metrics: ['המרה', 'נטישה', 'החזרה'],
                    touchpoints: ['סל קניות', 'תשלום', 'אישור']
                },
                {
                    name: 'רכישה',
                    metrics: ['השלמת רכישה', 'שביעות רצון', 'המלצות'],
                    touchpoints: ['אישור', 'משלוח', 'קבלה']
                }
            ]
        };

        this.decisionModel = {
            factors: [
                {
                    name: 'מחיר',
                    weight: 0.3,
                    subFactors: ['מחיר בסיס', 'הנחות', 'תשלומים']
                },
                {
                    name: 'איכות',
                    weight: 0.25,
                    subFactors: ['חוות דעת', 'אחריות', 'תכונות']
                },
                {
                    name: 'חדשנות',
                    weight: 0.2,
                    subFactors: ['טכנולוגיה', 'עדכניות', 'ייחודיות']
                },
                {
                    name: 'חברתי',
                    weight: 0.15,
                    subFactors: ['המלצות', 'רשתות חברתיות', 'סטטוס']
                },
                {
                    name: 'אישי',
                    weight: 0.1,
                    subFactors: ['צורך', 'תקציב', 'העדפות']
                }
            ]
        };
    }

    /**
     * התחלת סימולציה
     */
    startSimulation() {
        this.personas.customers.forEach(customer => {
            this.initializeCustomerJourney(customer);
        });
    }

    /**
     * אתחול מסע לקוח
     */
    initializeCustomerJourney(customer) {
        customer.journey = {
            stage: 'awareness',
            touchpoints: [],
            decisions: [],
            metrics: {
                startTime: Date.now(),
                duration: 0,
                satisfaction: 0,
                conversion: false
            }
        };
    }

    /**
     * עדכון מסע לקוח
     */
    updateCustomerJourney(customer, interaction) {
        const currentStage = customer.journey.stage;
        const stages = this.journey.stages;
        const currentStageIndex = stages.findIndex(s => s.name === currentStage);

        // הוספת נקודת מגע
        customer.journey.touchpoints.push({
            type: interaction.type,
            timestamp: Date.now(),
            details: interaction.details
        });

        // חישוב התקדמות
        const progress = this.calculateJourneyProgress(customer, interaction);
        
        // בדיקת מעבר שלב
        if (progress >= 0.8 && currentStageIndex < stages.length - 1) {
            customer.journey.stage = stages[currentStageIndex + 1].name;
        }

        // עדכון מדדים
        this.updateCustomerMetrics(customer, interaction);
    }

    /**
     * חישוב התקדמות במסע
     */
    calculateJourneyProgress(customer, interaction) {
        const stage = this.journey.stages.find(s => s.name === customer.journey.stage);
        const touchpoints = customer.journey.touchpoints.filter(t => 
            stage.touchpoints.includes(t.type)
        );

        return touchpoints.length / stage.touchpoints.length;
    }

    /**
     * עדכון מדדי לקוח
     */
    updateCustomerMetrics(customer, interaction) {
        const metrics = customer.journey.metrics;
        
        // עדכון זמן
        metrics.duration = (Date.now() - metrics.startTime) / 1000;

        // עדכון שביעות רצון
        if (interaction.satisfaction) {
            metrics.satisfaction = (metrics.satisfaction + interaction.satisfaction) / 2;
        }

        // עדכון המרה
        if (interaction.type === 'רכישה' && interaction.details.completed) {
            metrics.conversion = true;
        }
    }

    /**
     * קבלת דוח סימולציה
     */
    getSimulationReport() {
        const report = {
            summary: {
                totalCustomers: this.personas.customers.length,
                conversions: this.personas.customers.filter(c => c.journey.metrics.conversion).length,
                averageSatisfaction: this.calculateAverageSatisfaction(),
                averageDuration: this.calculateAverageDuration()
            },
            details: {
                journeyStages: this.analyzeJourneyStages(),
                decisionFactors: this.analyzeDecisionFactors(),
                touchpoints: this.analyzeTouchpoints()
            },
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    /**
     * חישוב ממוצע שביעות רצון
     */
    calculateAverageSatisfaction() {
        const satisfactions = this.personas.customers.map(c => c.journey.metrics.satisfaction);
        return satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length;
    }

    /**
     * חישוב ממוצע זמן מסע
     */
    calculateAverageDuration() {
        const durations = this.personas.customers.map(c => c.journey.metrics.duration);
        return durations.reduce((a, b) => a + b, 0) / durations.length;
    }

    /**
     * ניתוח שלבי מסע
     */
    analyzeJourneyStages() {
        const stages = {};
        this.journey.stages.forEach(stage => {
            stages[stage.name] = {
                customers: this.personas.customers.filter(c => c.journey.stage === stage.name).length,
                averageTime: this.calculateAverageStageTime(stage.name)
            };
        });
        return stages;
    }

    /**
     * חישוב זמן ממוצע בשלב
     */
    calculateAverageStageTime(stageName) {
        const customers = this.personas.customers.filter(c => c.journey.stage === stageName);
        const times = customers.map(c => {
            const stageTouchpoints = c.journey.touchpoints.filter(t => 
                this.journey.stages.find(s => s.name === stageName).touchpoints.includes(t.type)
            );
            if (stageTouchpoints.length === 0) return 0;
            return (stageTouchpoints[stageTouchpoints.length - 1].timestamp - stageTouchpoints[0].timestamp) / 1000;
        });
        return times.reduce((a, b) => a + b, 0) / times.length;
    }

    /**
     * ניתוח גורמי החלטה
     */
    analyzeDecisionFactors() {
        const factors = {};
        this.decisionModel.factors.forEach(factor => {
            factors[factor.name] = {
                weight: factor.weight,
                impact: this.calculateFactorImpact(factor)
            };
        });
        return factors;
    }

    /**
     * חישוב השפעת גורם
     */
    calculateFactorImpact(factor) {
        const customers = this.personas.customers.filter(c => c.journey.metrics.conversion);
        return customers.reduce((sum, customer) => {
            return sum + (customer.preferences[factor.name.toLowerCase()] || 0);
        }, 0) / customers.length;
    }

    /**
     * ניתוח נקודות מגע
     */
    analyzeTouchpoints() {
        const touchpoints = {};
        this.personas.customers.forEach(customer => {
            customer.journey.touchpoints.forEach(touchpoint => {
                if (!touchpoints[touchpoint.type]) {
                    touchpoints[touchpoint.type] = {
                        count: 0,
                        satisfaction: 0
                    };
                }
                touchpoints[touchpoint.type].count++;
                if (touchpoint.satisfaction) {
                    touchpoints[touchpoint.type].satisfaction += touchpoint.satisfaction;
                }
            });
        });

        // חישוב ממוצע שביעות רצון
        Object.keys(touchpoints).forEach(type => {
            touchpoints[type].satisfaction /= touchpoints[type].count;
        });

        return touchpoints;
    }

    /**
     * יצירת המלצות
     */
    generateRecommendations() {
        const recommendations = [];
        const report = this.getSimulationReport();

        // המלצות על בסיס שיעור המרה
        if (report.summary.conversions / report.summary.totalCustomers < 0.3) {
            recommendations.push({
                type: 'המרה',
                priority: 'גבוה',
                description: 'יש לשפר את שיעור ההמרה על ידי הוספת תמריצי רכישה והפחתת חסמים'
            });
        }

        // המלצות על בסיס שביעות רצון
        if (report.summary.averageSatisfaction < 0.7) {
            recommendations.push({
                type: 'שביעות רצון',
                priority: 'בינוני',
                description: 'יש לשפר את חווית המשתמש ולהתאים את המוצר לצרכים'
            });
        }

        // המלצות על בסיס זמן מסע
        if (report.summary.averageDuration > 3600) { // יותר משעה
            recommendations.push({
                type: 'יעילות',
                priority: 'נמוך',
                description: 'יש לקצר את תהליך הרכישה ולפשט את נקודות המגע'
            });
        }

        return recommendations;
    }
} 