/**
 * תרחיש סימולציית מחקר שוק
 */
class MarketResearchScenario {
    constructor() {
        this.context = {
            company: {
                name: 'בריאות-טעים',
                industry: 'מזון בריאות',
                product: {
                    name: 'פרי-בר',
                    concept: 'חטיף פירות יבשים טבעי עם תוספת חלבון צמחי',
                    description: 'חטיף בריאות חדשני המשלב פירות יבשים איכותיים עם חלבון אפונה, ללא תוספת סוכר',
                    price: 15.90,
                    packaging: {
                        size: '50 גרם',
                        design: 'שקית מתכלה עם חלון שקוף',
                        colors: ['ירוק', 'לבן']
                    },
                    nutrition: {
                        calories: 180,
                        protein: 8,
                        carbs: 25,
                        fat: 3,
                        fiber: 5
                    },
                    variants: [
                        { name: 'תות-בננה', price: 15.90 },
                        { name: 'תמר-תאנים', price: 15.90 },
                        { name: 'מנגו-קוקוס', price: 16.90 }
                    ]
                }
            }
        };

        this.personas = {
            agents: [
                {
                    id: 1,
                    name: 'דנה כהן',
                    demographics: {
                        age: 28,
                        gender: 'נקבה',
                        income: 'גבוה',
                        location: 'תל אביב',
                        occupation: 'מפתחת תוכנה'
                    },
                    lifestyle: 'ספורטיבי',
                    consumption: {
                        frequency: 'יומי',
                        preferences: ['חטיפי בריאות', 'פירות יבשים'],
                        priceSensitivity: 0.3,
                        healthAwareness: 0.9
                    },
                    nutrition: {
                        diet: 'צמחוני',
                        restrictions: ['ללא גלוטן'],
                        preferences: ['חלבון צמחי', 'סיבים תזונתיים']
                    }
                },
                {
                    id: 2,
                    name: 'יוסי לוי',
                    demographics: {
                        age: 45,
                        gender: 'זכר',
                        income: 'בינוני-גבוה',
                        location: 'ירושלים',
                        occupation: 'רואה חשבון'
                    },
                    lifestyle: 'מסורתי',
                    consumption: {
                        frequency: 'שבועי',
                        preferences: ['חטיפים קלאסיים', 'פיצוחים'],
                        priceSensitivity: 0.7,
                        healthAwareness: 0.5
                    },
                    nutrition: {
                        diet: 'רגיל',
                        restrictions: [],
                        preferences: ['טעם', 'מחיר']
                    }
                },
                {
                    id: 3,
                    name: 'מיכל אברהם',
                    demographics: {
                        age: 35,
                        gender: 'נקבה',
                        income: 'בינוני',
                        location: 'חיפה',
                        occupation: 'מעצבת פנים'
                    },
                    lifestyle: 'חדשני',
                    consumption: {
                        frequency: 'יומי',
                        preferences: ['מוצרים חדשניים', 'חטיפים בריאות'],
                        priceSensitivity: 0.5,
                        healthAwareness: 0.8
                    },
                    nutrition: {
                        diet: 'טבעוני',
                        restrictions: ['ללא מוצרי חלב', 'ללא ביצים'],
                        preferences: ['חלבון צמחי', 'חומרים טבעיים']
                    }
                }
                // ... עוד סוכנים יוספו כאן
            ]
        };

        this.researchMethods = {
            focusGroup: {
                name: 'קבוצת מיקוד וירטואלית',
                protocol: {
                    duration: 90,
                    participants: 8,
                    topics: [
                        'תגובה ראשונית לקונספט',
                        'הערכת אריזה ומיתוג',
                        'נכונות לשלם',
                        'השוואה למתחרים'
                    ],
                    questions: [
                        'מה דעתך על הרעיון של חטיף פירות יבשים עם חלבון?',
                        'האם המחיר המוצע סביר בעיניך?',
                        'מה דעתך על האריזה המוצעת?',
                        'האם תרצה לנסות את המוצר?'
                    ]
                }
            },
            interviews: {
                name: 'ראיונות אישיים מובנים',
                protocol: {
                    duration: 30,
                    participants: 15,
                    topics: [
                        'הרגלי צריכה',
                        'העדפות טעם',
                        'רגישות למחיר',
                        'נכונות לרכישה'
                    ],
                    questions: [
                        'כמה פעמים בשבוע אתה צורך חטיפים?',
                        'מה חשוב לך בחטיף בריאות?',
                        'מה המחיר המקסימלי שתהיה מוכן לשלם?',
                        'האם תרצה לנסות את המוצר?'
                    ]
                }
            },
            conceptTesting: {
                name: 'בחינת קונספט',
                protocol: {
                    duration: 45,
                    participants: 20,
                    topics: [
                        'הערכת קונספט',
                        'השוואה למתחרים',
                        'נכונות לרכישה',
                        'המלצות לשיפור'
                    ],
                    questions: [
                        'מה דעתך על הרעיון?',
                        'האם תרצה לנסות את המוצר?',
                        'מה המחיר המתאים בעיניך?',
                        'האם יש לך המלצות לשיפור?'
                    ]
                }
            }
        };

        this.responseModel = {
            initialReaction: {
                factors: [
                    { name: 'חדשנות', weight: 0.3 },
                    { name: 'בריאות', weight: 0.3 },
                    { name: 'טעם', weight: 0.2 },
                    { name: 'מחיר', weight: 0.2 }
                ],
                thresholds: {
                    high: 0.8,
                    medium: 0.5,
                    low: 0.3
                }
            },
            productEvaluation: {
                attributes: [
                    { name: 'טעם', weight: 0.3 },
                    { name: 'ערך תזונתי', weight: 0.2 },
                    { name: 'נוחות', weight: 0.2 },
                    { name: 'אריזה', weight: 0.15 },
                    { name: 'מחיר', weight: 0.15 }
                ]
            },
            purchaseProbability: {
                factors: [
                    { name: 'תגובה ראשונית', weight: 0.3 },
                    { name: 'הערכת מוצר', weight: 0.3 },
                    { name: 'רגישות למחיר', weight: 0.2 },
                    { name: 'הרגלי צריכה', weight: 0.2 }
                ]
            }
        };

        this.interactions = [];
        this.insights = [];
    }

    /**
     * התחלת סימולציה
     */
    startSimulation() {
        this.interactions = [];
        this.insights = [];
        
        // התחלת מחקר שוק
        this.runFocusGroup();
        this.runInterviews();
        this.runConceptTesting();
        
        // ניתוח תוצאות
        this.analyzeResults();
    }

    /**
     * הרצת קבוצת מיקוד
     */
    runFocusGroup() {
        const protocol = this.researchMethods.focusGroup.protocol;
        const participants = this.personas.agents.slice(0, protocol.participants);
        
        participants.forEach(agent => {
            protocol.topics.forEach(topic => {
                const response = this.generateAgentResponse(agent, topic);
                this.interactions.push({
                    type: 'focusGroup',
                    agent: agent.id,
                    topic: topic,
                    response: response,
                    timestamp: Date.now()
                });
            });
        });
    }

    /**
     * הרצת ראיונות
     */
    runInterviews() {
        const protocol = this.researchMethods.interviews.protocol;
        const participants = this.personas.agents.slice(0, protocol.participants);
        
        participants.forEach(agent => {
            protocol.topics.forEach(topic => {
                const response = this.generateAgentResponse(agent, topic);
                this.interactions.push({
                    type: 'interview',
                    agent: agent.id,
                    topic: topic,
                    response: response,
                    timestamp: Date.now()
                });
            });
        });
    }

    /**
     * הרצת בחינת קונספט
     */
    runConceptTesting() {
        const protocol = this.researchMethods.conceptTesting.protocol;
        const participants = this.personas.agents.slice(0, protocol.participants);
        
        participants.forEach(agent => {
            protocol.topics.forEach(topic => {
                const response = this.generateAgentResponse(agent, topic);
                this.interactions.push({
                    type: 'conceptTesting',
                    agent: agent.id,
                    topic: topic,
                    response: response,
                    timestamp: Date.now()
                });
            });
        });
    }

    /**
     * יצירת תגובת סוכן
     */
    generateAgentResponse(agent, topic) {
        const response = {
            sentiment: this.calculateSentiment(agent, topic),
            interest: this.calculateInterest(agent, topic),
            willingnessToPay: this.calculateWillingnessToPay(agent),
            purchaseProbability: this.calculatePurchaseProbability(agent),
            feedback: this.generateFeedback(agent, topic)
        };

        return response;
    }

    /**
     * חישוב סנטימנט
     */
    calculateSentiment(agent, topic) {
        let sentiment = 0;
        
        // התאמה לפי סגנון חיים
        if (agent.lifestyle === 'ספורטיבי' && topic.includes('בריאות')) {
            sentiment += 0.3;
        }
        
        // התאמה לפי העדפות תזונה
        if (agent.nutrition.diet === 'טבעוני' && topic.includes('חלבון צמחי')) {
            sentiment += 0.2;
        }
        
        // התאמה לפי רגישות למחיר
        if (agent.consumption.priceSensitivity < 0.5 && topic.includes('מחיר')) {
            sentiment += 0.1;
        }
        
        return Math.min(1, Math.max(0, sentiment));
    }

    /**
     * חישוב רמת התעניינות
     */
    calculateInterest(agent, topic) {
        let interest = 0;
        
        // התאמה לפי הרגלי צריכה
        if (agent.consumption.frequency === 'יומי' && topic.includes('צריכה')) {
            interest += 0.3;
        }
        
        // התאמה לפי העדפות
        if (agent.consumption.preferences.includes('חטיפי בריאות') && topic.includes('בריאות')) {
            interest += 0.2;
        }
        
        // התאמה לפי מודעות בריאות
        if (agent.consumption.healthAwareness > 0.7 && topic.includes('תזונה')) {
            interest += 0.2;
        }
        
        return Math.min(1, Math.max(0, interest));
    }

    /**
     * חישוב נכונות לשלם
     */
    calculateWillingnessToPay(agent) {
        const basePrice = this.context.company.product.price;
        let multiplier = 1;
        
        // התאמה לפי הכנסה
        if (agent.demographics.income === 'גבוה') {
            multiplier *= 1.2;
        } else if (agent.demographics.income === 'בינוני') {
            multiplier *= 0.9;
        }
        
        // התאמה לפי רגישות למחיר
        multiplier *= (1 - agent.consumption.priceSensitivity);
        
        return Math.round(basePrice * multiplier);
    }

    /**
     * חישוב הסתברות לרכישה
     */
    calculatePurchaseProbability(agent) {
        let probability = 0;
        
        // התאמה לפי סגנון חיים
        if (agent.lifestyle === 'ספורטיבי' || agent.lifestyle === 'חדשני') {
            probability += 0.3;
        }
        
        // התאמה לפי הרגלי צריכה
        if (agent.consumption.frequency === 'יומי') {
            probability += 0.2;
        }
        
        // התאמה לפי העדפות
        if (agent.consumption.preferences.includes('חטיפי בריאות')) {
            probability += 0.2;
        }
        
        // התאמה לפי מודעות בריאות
        probability += agent.consumption.healthAwareness * 0.3;
        
        return Math.min(1, Math.max(0, probability));
    }

    /**
     * יצירת משוב
     */
    generateFeedback(agent, topic) {
        const feedbacks = {
            positive: [
                'מעניין מאוד, אשמח לנסות',
                'נראה בריא וטעים',
                'מחיר סביר',
                'אריזה יפה ונוחה'
            ],
            neutral: [
                'מעניין, אבל צריך לנסות',
                'תלוי במחיר',
                'תלוי בטעם',
                'צריך לראות איך זה בשימוש'
            ],
            negative: [
                'מחיר גבוה מדי',
                'לא בטוח שאני אוהב את הטעם',
                'אריזה לא נוחה',
                'לא מתאים לי'
            ]
        };

        const sentiment = this.calculateSentiment(agent, topic);
        const category = sentiment > 0.6 ? 'positive' : sentiment > 0.3 ? 'neutral' : 'negative';
        const feedback = feedbacks[category][Math.floor(Math.random() * feedbacks[category].length)];

        return feedback;
    }

    /**
     * ניתוח תוצאות
     */
    analyzeResults() {
        // ניתוח סנטימנט
        const sentimentAnalysis = this.analyzeSentiment();
        
        // ניתוח נכונות לשלם
        const willingnessAnalysis = this.analyzeWillingnessToPay();
        
        // ניתוח הסתברות לרכישה
        const purchaseAnalysis = this.analyzePurchaseProbability();
        
        // ניתוח משוב
        const feedbackAnalysis = this.analyzeFeedback();
        
        // יצירת תובנות
        this.generateInsights(sentimentAnalysis, willingnessAnalysis, purchaseAnalysis, feedbackAnalysis);
    }

    /**
     * ניתוח סנטימנט
     */
    analyzeSentiment() {
        const sentiments = this.interactions.map(i => i.response.sentiment);
        return {
            average: sentiments.reduce((a, b) => a + b, 0) / sentiments.length,
            distribution: {
                positive: sentiments.filter(s => s > 0.6).length,
                neutral: sentiments.filter(s => s > 0.3 && s <= 0.6).length,
                negative: sentiments.filter(s => s <= 0.3).length
            }
        };
    }

    /**
     * ניתוח נכונות לשלם
     */
    analyzeWillingnessToPay() {
        const willingness = this.interactions.map(i => i.response.willingnessToPay);
        return {
            average: willingness.reduce((a, b) => a + b, 0) / willingness.length,
            min: Math.min(...willingness),
            max: Math.max(...willingness),
            distribution: {
                high: willingness.filter(w => w > this.context.company.product.price * 1.2).length,
                medium: willingness.filter(w => w > this.context.company.product.price * 0.8 && w <= this.context.company.product.price * 1.2).length,
                low: willingness.filter(w => w <= this.context.company.product.price * 0.8).length
            }
        };
    }

    /**
     * ניתוח הסתברות לרכישה
     */
    analyzePurchaseProbability() {
        const probabilities = this.interactions.map(i => i.response.purchaseProbability);
        return {
            average: probabilities.reduce((a, b) => a + b, 0) / probabilities.length,
            distribution: {
                high: probabilities.filter(p => p > 0.7).length,
                medium: probabilities.filter(p => p > 0.4 && p <= 0.7).length,
                low: probabilities.filter(p => p <= 0.4).length
            }
        };
    }

    /**
     * ניתוח משוב
     */
    analyzeFeedback() {
        const feedbacks = this.interactions.map(i => i.response.feedback);
        const categories = {
            positive: feedbacks.filter(f => f.includes('מעניין') || f.includes('בריא') || f.includes('סביר')),
            neutral: feedbacks.filter(f => f.includes('תלוי') || f.includes('צריך')),
            negative: feedbacks.filter(f => f.includes('גבוה') || f.includes('לא'))
        };

        return {
            distribution: {
                positive: categories.positive.length,
                neutral: categories.neutral.length,
                negative: categories.negative.length
            },
            keyPhrases: this.extractKeyPhrases(feedbacks)
        };
    }

    /**
     * חילוץ ביטויים מרכזיים
     */
    extractKeyPhrases(feedbacks) {
        const phrases = {};
        feedbacks.forEach(feedback => {
            const words = feedback.split(' ');
            words.forEach(word => {
                if (word.length > 3) {
                    phrases[word] = (phrases[word] || 0) + 1;
                }
            });
        });
        return Object.entries(phrases)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([phrase, count]) => ({ phrase, count }));
    }

    /**
     * יצירת תובנות
     */
    generateInsights(sentimentAnalysis, willingnessAnalysis, purchaseAnalysis, feedbackAnalysis) {
        // תובנות על סנטימנט
        if (sentimentAnalysis.average > 0.7) {
            this.insights.push({
                type: 'sentiment',
                priority: 'high',
                description: 'תגובה חיובית מאוד לקונספט המוצר'
            });
        }

        // תובנות על נכונות לשלם
        if (willingnessAnalysis.average < this.context.company.product.price) {
            this.insights.push({
                type: 'pricing',
                priority: 'high',
                description: 'יש לשקול הורדת מחיר או הוספת ערך'
            });
        }

        // תובנות על הסתברות לרכישה
        if (purchaseAnalysis.average > 0.6) {
            this.insights.push({
                type: 'purchase',
                priority: 'high',
                description: 'פוטנציאל רכישה גבוה בקרב קהל היעד'
            });
        }

        // תובנות על משוב
        if (feedbackAnalysis.distribution.negative > feedbackAnalysis.distribution.positive) {
            this.insights.push({
                type: 'feedback',
                priority: 'medium',
                description: 'יש לשפר את המוצר בהתאם למשוב'
            });
        }
    }

    /**
     * קבלת דוח מחקר
     */
    getResearchReport() {
        const sentimentAnalysis = this.analyzeSentiment();
        const willingnessAnalysis = this.analyzeWillingnessToPay();
        const purchaseAnalysis = this.analyzePurchaseProbability();
        const feedbackAnalysis = this.analyzeFeedback();

        return {
            summary: {
                totalParticipants: this.personas.agents.length,
                averageSentiment: sentimentAnalysis.average,
                averageWillingnessToPay: willingnessAnalysis.average,
                averagePurchaseProbability: purchaseAnalysis.average
            },
            details: {
                sentiment: sentimentAnalysis,
                willingnessToPay: willingnessAnalysis,
                purchaseProbability: purchaseAnalysis,
                feedback: feedbackAnalysis
            },
            insights: this.insights,
            recommendations: this.generateRecommendations()
        };
    }

    /**
     * יצירת המלצות
     */
    generateRecommendations() {
        const recommendations = [];
        const report = this.getResearchReport();

        // המלצות על בסיס סנטימנט
        if (report.summary.averageSentiment < 0.6) {
            recommendations.push({
                type: 'קונספט',
                priority: 'גבוה',
                description: 'יש לשפר את הקונספט ולהדגיש יתרונות ייחודיים'
            });
        }

        // המלצות על בסיס נכונות לשלם
        if (report.summary.averageWillingnessToPay < this.context.company.product.price) {
            recommendations.push({
                type: 'מחיר',
                priority: 'גבוה',
                description: 'יש לשקול הורדת מחיר או הוספת ערך למוצר'
            });
        }

        // המלצות על בסיס הסתברות לרכישה
        if (report.summary.averagePurchaseProbability < 0.5) {
            recommendations.push({
                type: 'המרה',
                priority: 'בינוני',
                description: 'יש לשפר את פוטנציאל ההמרה דרך שיפור המוצר והתאמתו לצרכים'
            });
        }

        return recommendations;
    }
} 