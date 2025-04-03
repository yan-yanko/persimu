/**
 * תרחיש סימולציית שירות לקוחות
 */

class CustomerServiceScenario {
    constructor() {
        this.context = {
            company: {
                name: "סמארט-טק",
                industry: "אלקטרוניקה",
                products: [
                    {
                        id: "SMART-WATCH-001",
                        name: "שעון חכם דור 3",
                        price: 999,
                        warranty: "שנה",
                        features: ["מדידת דופק", "GPS", "התראות"]
                    }
                ],
                policies: {
                    returns: {
                        period: "14 ימים",
                        conditions: "מוצר מקורי באריזה",
                        process: "החזרה לסניף או שליחה בדואר"
                    },
                    complaints: {
                        escalation: {
                            levels: ["נציג", "מנהל", "מנהל בכיר"],
                            timeframes: [5, 15, 30] // דקות
                        }
                    }
                }
            }
        };

        this.personas = {
            customer: {
                name: "דני כהן",
                demographics: {
                    age: 35,
                    gender: "זכר",
                    occupation: "מנהל פרויקטים",
                    location: "תל אביב"
                },
                purchaseHistory: [
                    {
                        date: "2024-01-15",
                        product: "SMART-WATCH-001",
                        price: 999,
                        satisfaction: 8
                    }
                ],
                communicationStyle: {
                    directness: 0.8,
                    aggressiveness: 0.3,
                    patience: 0.4
                },
                expectations: {
                    responseTime: "מידי",
                    solutionQuality: "מושלם",
                    compensation: "מלא"
                },
                currentState: {
                    emotion: "מתוסכל",
                    urgency: 0.8,
                    previousAttempts: 1
                }
            },
            representative: {
                name: "שירה לוי",
                experience: {
                    years: 2,
                    department: "שירות לקוחות",
                    specialization: "מוצרים חכמים"
                },
                technicalKnowledge: {
                    level: 0.8,
                    areas: ["שעונים חכמים", "אפליקציות", "הגדרות"]
                },
                communicationStyle: {
                    empathy: 0.9,
                    professionalism: 0.9,
                    patience: 0.8
                },
                problemSolving: {
                    approach: "שיטתית",
                    creativity: 0.7,
                    efficiency: 0.8
                },
                limitations: {
                    maxDiscount: 20,
                    canEscalate: true,
                    maxRefund: 1000
                }
            }
        };

        this.environment = {
            crm: {
                customerInfo: true,
                purchaseHistory: true,
                previousInteractions: true,
                notes: true
            },
            productCatalog: {
                availability: true,
                specifications: true,
                troubleshooting: true
            },
            policies: {
                returns: true,
                warranty: true,
                escalation: true
            },
            constraints: {
                maxCallDuration: 15, // דקות
                maxEscalations: 2,
                requiredMetrics: [
                    "זמן טיפול",
                    "שביעות רצון",
                    "יעילות פתרון",
                    "צורך באסקלציה"
                ]
            }
        };

        this.script = {
            opening: {
                greeting: "שלום, כאן שירה ממוקד השירות של סמארט-טק, כיצד אוכל לעזור?",
                customerIdentification: "שלום, אני דני כהן, רכשתי שעון חכם לפני שבוע",
                issueIdentification: "השעון לא עובד כמו שצריך, הוא לא מדוד נכון את הדופק"
            },
            problemClarification: {
                questions: [
                    "האם תוכל לתאר את הבעיה בפירוט?",
                    "האם ניסית לאתחל את המכשיר?",
                    "האם הבעיה קיימת מאז הרכישה?"
                ],
                possibleResponses: {
                    positive: "כן, ניסיתי הכל",
                    negative: "לא, זו הפעם הראשונה",
                    neutral: "לא בטוח"
                }
            },
            solutionAttempts: [
                {
                    level: 1,
                    solutions: [
                        "הדרכה לאתחול",
                        "בדיקת הגדרות",
                        "עדכון תוכנה"
                    ]
                },
                {
                    level: 2,
                    solutions: [
                        "החלפת מוצר",
                        "החזר כספי חלקי",
                        "העברה למנהל"
                    ]
                }
            ],
            escalation: {
                triggers: [
                    "לקוח מאיים לעזוב",
                    "זמן שיחה חריג",
                    "תלונה חוזרת"
                ],
                process: [
                    "העברה למנהל",
                    "הצעת פיצוי",
                    "החלפת מוצר"
                ]
            },
            closing: {
                success: {
                    confirmation: "האם הפתרון שהצעתי עונה על צרכיך?",
                    followUp: "אשמח לעזור בעתיד אם תצטרך"
                },
                failure: {
                    escalation: "אני מעבירה אותך למנהל שירות",
                    compensation: "אני מציעה פיצוי של 10% על הרכישה הבאה"
                }
            }
        };

        this.metrics = {
            quantitative: {
                callDuration: 0,
                satisfactionScore: 0,
                solutionEfficiency: 0,
                escalationCount: 0
            },
            qualitative: {
                customerSentiment: [],
                representativePerformance: [],
                solutionQuality: ""
            }
        };
    }

    /**
     * התחלת סימולציה
     */
    startSimulation() {
        return {
            context: this.context,
            personas: this.personas,
            environment: this.environment,
            script: this.script,
            metrics: this.metrics
        };
    }

    /**
     * עדכון מדדים
     */
    updateMetrics(interaction) {
        this.metrics.quantitative.callDuration += interaction.duration;
        this.metrics.quantitative.satisfactionScore = interaction.satisfaction;
        this.metrics.quantitative.solutionEfficiency = interaction.efficiency;
        this.metrics.quantitative.escalationCount += interaction.escalated ? 1 : 0;

        this.metrics.qualitative.customerSentiment.push(interaction.sentiment);
        this.metrics.qualitative.representativePerformance.push(interaction.performance);
        this.metrics.qualitative.solutionQuality = interaction.solutionQuality;
    }

    /**
     * קבלת דוח סימולציה
     */
    getSimulationReport() {
        return {
            summary: {
                duration: this.metrics.quantitative.callDuration,
                satisfaction: this.metrics.quantitative.satisfactionScore,
                efficiency: this.metrics.quantitative.solutionEfficiency,
                escalations: this.metrics.quantitative.escalationCount
            },
            details: {
                sentiment: this.metrics.qualitative.customerSentiment,
                performance: this.metrics.qualitative.representativePerformance,
                solutionQuality: this.metrics.qualitative.solutionQuality
            },
            recommendations: this.generateRecommendations()
        };
    }

    /**
     * יצירת המלצות
     */
    generateRecommendations() {
        const recommendations = [];

        if (this.metrics.quantitative.satisfactionScore < 7) {
            recommendations.push({
                type: "שיפור שירות",
                description: "יש לשפר את איכות הפתרונות המוצעים",
                priority: "גבוה"
            });
        }

        if (this.metrics.quantitative.escalationCount > 0) {
            recommendations.push({
                type: "הכשרה",
                description: "יש להכשיר נציגים נוספים בטיפול במקרים מורכבים",
                priority: "בינוני"
            });
        }

        if (this.metrics.quantitative.callDuration > 10) {
            recommendations.push({
                type: "יעילות",
                description: "יש לפעול להפחתת זמן הטיפול הממוצע",
                priority: "נמוך"
            });
        }

        return recommendations;
    }
}

module.exports = CustomerServiceScenario; 