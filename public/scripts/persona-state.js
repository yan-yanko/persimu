/**
 * Persona State Module
 * Manages the emotional and cognitive state of personas during simulation
 */

/**
 * Emotional state types and their properties
 */
const EMOTIONAL_STATES = {
    HAPPY: {
        name: 'Happy',
        icon: '😊',
        color: '#FFD700',
        influence: 1.2
    },
    SAD: {
        name: 'Sad',
        icon: '😢',
        color: '#4682B4',
        influence: 0.8
    },
    ANGRY: {
        name: 'Angry',
        icon: '😠',
        color: '#FF4500',
        influence: 1.5
    },
    SURPRISED: {
        name: 'Surprised',
        icon: '😮',
        color: '#FF69B4',
        influence: 1.3
    },
    NEUTRAL: {
        name: 'Neutral',
        icon: '😐',
        color: '#808080',
        influence: 1.0
    },
    INTERESTED: {
        name: 'Interested',
        icon: '🤔',
        color: '#32CD32',
        influence: 1.4
    },
    BORED: {
        name: 'Bored',
        icon: '😴',
        color: '#A9A9A9',
        influence: 0.7
    },
    TRUSTING: {
        name: 'Trusting',
        icon: '😊',
        color: '#4CAF50',
        influence: 1.2
    },
    SUSPICIOUS: {
        name: 'Suspicious',
        icon: '🤨',
        color: '#FFA500',
        influence: 0.9
    }
};

/**
 * Interest level types
 */
const INTEREST_LEVELS = {
    HIGH: {
        name: 'High',
        value: 1.0,
        color: '#4CAF50'
    },
    MEDIUM: {
        name: 'Medium',
        value: 0.6,
        color: '#FFA500'
    },
    LOW: {
        name: 'Low',
        value: 0.3,
        color: '#FF4500'
    }
};

/**
 * Persona State class
 * Manages the emotional and cognitive state of a persona
 */
export class PersonaState {
    constructor(persona) {
        this.persona = persona;
        this.currentState = {
            mood: 'neutral',
            interest: 0.5,
            trust: 0.5,
            lastInteraction: null
        };
        this.currentEmotion = EMOTIONAL_STATES.NEUTRAL;
        this.interestLevel = INTEREST_LEVELS.MEDIUM;
        this.trustLevel = 0.5; // 0-1 scale
        this.topicPriorities = new Map();
        this.emotionHistory = [];
        this.stateChanges = [];
        this.lastUpdate = Date.now();
        
        // הוספת פרמטרים חדשים
        this.emotionTransitionThreshold = 0.3; // סף לשינוי רגשי
        this.emotionDecayRate = 0.1; // קצב דעיכת רגשות
        this.emotionHistoryMaxSize = 100; // גודל מקסימלי להיסטוריית רגשות
        this.lastEmotionUpdate = Date.now();
        this.emotionConsistencyChecks = [];
        
        this.loadState();
    }

    /**
     * Load state from local storage
     */
    loadState() {
        const storedState = localStorage.getItem(`persona_state_${this.persona.id}`);
        if (storedState) {
            const state = JSON.parse(storedState);
            this.currentState = state.currentState;
            this.currentEmotion = EMOTIONAL_STATES[state.currentEmotion];
            this.interestLevel = INTEREST_LEVELS[state.interestLevel];
            this.trustLevel = state.trustLevel;
            this.topicPriorities = new Map(state.topicPriorities);
            this.emotionHistory = state.emotionHistory;
            this.stateChanges = state.stateChanges;
            this.lastUpdate = state.lastUpdate;
        }
    }

    /**
     * Save state to local storage
     */
    saveState() {
        const state = {
            currentState: this.currentState,
            currentEmotion: this.currentEmotion.name,
            interestLevel: this.interestLevel.name,
            trustLevel: this.trustLevel,
            topicPriorities: Array.from(this.topicPriorities.entries()),
            emotionHistory: this.emotionHistory,
            stateChanges: this.stateChanges,
            lastUpdate: this.lastUpdate
        };
        localStorage.setItem(`persona_state_${this.persona.id}`, JSON.stringify(state));
    }

    /**
     * עדכון מצב רגשי עם בדיקות עקביות
     */
    updateEmotionalState(message, context = {}) {
        const previousEmotion = this.currentEmotion;
        const emotionChange = this.analyzeEmotionalImpact(message, context);
        
        // בדיקת תקינות השינוי הרגשי
        if (!this.isValidEmotionTransition(previousEmotion, emotionChange.emotion)) {
            console.warn('Invalid emotion transition detected');
            return;
        }

        // חישוב שינוי הדרגתי
        const newEmotion = this.calculateGradualEmotionTransition(
            previousEmotion,
            emotionChange.emotion,
            emotionChange.intensity
        );
        
        // עדכון המצב הרגשי
        this.currentEmotion = newEmotion;
        
        // רישום שינוי המצב
        this.recordStateChange({
            timestamp: Date.now(),
            previousEmotion: previousEmotion.name,
            newEmotion: this.currentEmotion.name,
            trigger: message,
            context,
            transitionIntensity: emotionChange.intensity
        });

        // עדכון היסטוריית רגשות
        this.updateEmotionHistory(emotionChange);

        // בדיקת עקביות
        this.performEmotionConsistencyCheck();

        // שמירת המצב
        this.saveState();
    }

    /**
     * בדיקת תקינות מעבר רגשי
     */
    isValidEmotionTransition(fromEmotion, toEmotion) {
        // בדיקת מעברים לא הגיוניים
        const invalidTransitions = {
            'HAPPY': ['ANGRY', 'SAD'],
            'SAD': ['HAPPY', 'ANGRY'],
            'ANGRY': ['HAPPY', 'TRUSTING']
        };

        if (invalidTransitions[fromEmotion.name]?.includes(toEmotion.name)) {
            return false;
        }

        return true;
    }

    /**
     * חישוב מעבר רגשי הדרגתי
     */
    calculateGradualEmotionTransition(fromEmotion, toEmotion, intensity) {
        // אם השינוי קטן מדי, נשאר במצב הנוכחי
        if (intensity < this.emotionTransitionThreshold) {
            return fromEmotion;
        }

        // חישוב זמן שעבר מאז העדכון האחרון
        const timeSinceLastUpdate = (Date.now() - this.lastEmotionUpdate) / 1000;
        
        // התאמת עוצמת השינוי לפי הזמן שעבר
        const adjustedIntensity = intensity * Math.min(1, timeSinceLastUpdate / 5);
        
        // אם השינוי קטן מדי, נשאר במצב הנוכחי
        if (adjustedIntensity < this.emotionTransitionThreshold) {
            return fromEmotion;
        }

        // עדכון זמן העדכון האחרון
        this.lastEmotionUpdate = Date.now();

        return toEmotion;
    }

    /**
     * עדכון היסטוריית רגשות
     */
    updateEmotionHistory(emotionChange) {
        this.emotionHistory.push({
            timestamp: Date.now(),
            emotion: this.currentEmotion.name,
            intensity: emotionChange.intensity,
            trigger: emotionChange.trigger
        });

        // הגבלת גודל ההיסטוריה
        if (this.emotionHistory.length > this.emotionHistoryMaxSize) {
            this.emotionHistory = this.emotionHistory.slice(-this.emotionHistoryMaxSize);
        }
    }

    /**
     * בדיקת עקביות רגשית
     */
    performEmotionConsistencyCheck() {
        const recentHistory = this.emotionHistory.slice(-5);
        
        // בדיקת תדירות שינויים
        const timeBetweenChanges = recentHistory.map((entry, i) => 
            i > 0 ? entry.timestamp - recentHistory[i-1].timestamp : 0
        );
        
        const averageTimeBetweenChanges = timeBetweenChanges.reduce((a, b) => a + b, 0) / timeBetweenChanges.length;
        
        // אם השינויים תכופים מדי, נשמור את הבדיקה
        if (averageTimeBetweenChanges < 1000) { // פחות משנייה בין שינויים
            this.emotionConsistencyChecks.push({
                timestamp: Date.now(),
                type: 'RAPID_CHANGES',
                details: {
                    averageTime: averageTimeBetweenChanges,
                    emotions: recentHistory.map(e => e.emotion)
                }
            });
        }

        // בדיקת מעברים לא הגיוניים
        for (let i = 1; i < recentHistory.length; i++) {
            if (!this.isValidEmotionTransition(
                { name: recentHistory[i-1].emotion },
                { name: recentHistory[i].emotion }
            )) {
                this.emotionConsistencyChecks.push({
                    timestamp: Date.now(),
                    type: 'INVALID_TRANSITION',
                    details: {
                        from: recentHistory[i-1].emotion,
                        to: recentHistory[i].emotion
                    }
                });
            }
        }
    }

    /**
     * דעיכת רגשות לאורך זמן
     */
    decayEmotions() {
        const timeSinceLastUpdate = (Date.now() - this.lastEmotionUpdate) / 1000;
        
        // אם עבר זמן רב, נחזור למצב ניטרלי בהדרגה
        if (timeSinceLastUpdate > 300) { // 5 דקות
            const decayFactor = Math.min(1, (timeSinceLastUpdate - 300) / 300);
            this.currentEmotion = this.calculateGradualEmotionTransition(
                this.currentEmotion,
                EMOTIONAL_STATES.NEUTRAL,
                decayFactor
            );
            
            this.lastEmotionUpdate = Date.now();
            this.saveState();
        }
    }

    /**
     * Analyze emotional impact of a message
     * @param {string} message - User message
     * @param {Object} context - Additional context
     * @returns {Object} Emotional impact
     */
    analyzeEmotionalImpact(message, context) {
        // Simple sentiment analysis (can be enhanced with NLP)
        const positiveWords = ['excellent', 'great', 'thanks', 'love', 'wonderful', 'fun'];
        const negativeWords = ['bad', 'terrible', 'annoying', 'boring', 'not good', 'frustrating'];
        
        const words = message.toLowerCase().split(/\s+/);
        let positiveCount = words.filter(word => positiveWords.includes(word)).length;
        let negativeCount = words.filter(word => negativeWords.includes(word)).length;
        
        // Calculate emotional impact
        const intensity = Math.min(1, Math.max(0, (positiveCount - negativeCount) * 0.2));
        
        // Determine emotion based on impact
        let emotion;
        if (intensity > 0.3) {
            emotion = EMOTIONAL_STATES.HAPPY;
        } else if (intensity < -0.3) {
            emotion = EMOTIONAL_STATES.SAD;
        } else {
            emotion = EMOTIONAL_STATES.NEUTRAL;
        }

        return { emotion, intensity };
    }

    /**
     * Update interest level based on interaction
     * @param {string} message - User message
     * @param {Object} context - Additional context
     */
    updateInterestLevel(message, context = {}) {
        const previousLevel = this.interestLevel;
        
        // Analyze message for engagement indicators
        const engagementScore = this.analyzeEngagement(message, context);
        
        // Update interest level based on engagement
        if (engagementScore > 0.7) {
            this.interestLevel = INTEREST_LEVELS.HIGH;
        } else if (engagementScore < 0.3) {
            this.interestLevel = INTEREST_LEVELS.LOW;
        } else {
            this.interestLevel = INTEREST_LEVELS.MEDIUM;
        }
        
        // Record state change
        this.recordStateChange({
            timestamp: Date.now(),
            previousLevel: previousLevel.name,
            newLevel: this.interestLevel.name,
            trigger: message,
            context
        });
        
        this.currentState.lastInteraction = new Date();
        this.saveState();
    }

    /**
     * Analyze message for engagement indicators
     * @param {string} message - User message
     * @param {Object} context - Additional context
     * @returns {number} Engagement score
     */
    analyzeEngagement(message, context) {
        // Simple engagement analysis (can be enhanced)
        const engagementWords = ['למה', 'איך', 'מה', 'מתי', 'איפה', 'מי'];
        const words = message.toLowerCase().split(/\s+/);
        const questionCount = words.filter(word => engagementWords.includes(word)).length;
        
        return Math.min(1, questionCount * 0.2);
    }

    /**
     * Update trust level based on interaction
     * @param {string} message - User message
     * @param {Object} context - Additional context
     */
    updateTrustLevel(message, context = {}) {
        const previousTrust = this.trustLevel;
        
        // Analyze message for trust indicators
        const trustChange = this.analyzeTrustChange(message, context);
        
        // Update trust level with gradual change
        this.trustLevel = Math.max(0, Math.min(1, this.trustLevel + trustChange));
        
        // Record state change
        this.recordStateChange({
            timestamp: Date.now(),
            previousTrust,
            newTrust: this.trustLevel,
            trigger: message,
            context
        });
        
        this.currentState.lastInteraction = new Date();
        this.saveState();
    }

    /**
     * Analyze message for trust indicators
     * @param {string} message - User message
     * @param {Object} context - Additional context
     * @returns {number} Trust change value
     */
    analyzeTrustChange(message, context) {
        // Simple trust analysis (can be enhanced)
        const trustWords = ['אני מאמין', 'אני סומך', 'אני בוטח', 'אני מאמין בך'];
        const distrustWords = ['לא מאמין', 'חשד', 'ספק', 'לא סומך'];
        
        const words = message.toLowerCase().split(/\s+/);
        const trustCount = words.filter(word => trustWords.includes(word)).length;
        const distrustCount = words.filter(word => distrustWords.includes(word)).length;
        
        return (trustCount - distrustCount) * 0.1;
    }

    /**
     * Update topic priority
     * @param {string} topic - Topic name
     * @param {number} priority - Priority value (0-1)
     */
    updateTopicPriority(topic, priority) {
        this.topicPriorities.set(topic, Math.max(0, Math.min(1, priority)));
        this.saveState();
    }

    /**
     * Record state change
     * @param {Object} change - State change details
     */
    recordStateChange(change) {
        this.stateChanges.push(change);
        if (this.stateChanges.length > 100) {
            this.stateChanges = this.stateChanges.slice(-100);
        }
    }

    /**
     * Get current state summary
     * @returns {Object} Current state summary
     */
    getStateSummary() {
        return {
            currentState: this.currentState,
            emotion: this.currentEmotion,
            interestLevel: this.interestLevel,
            trustLevel: this.trustLevel,
            topicPriorities: Array.from(this.topicPriorities.entries()),
            lastUpdate: this.lastUpdate
        };
    }

    /**
     * Get emotion history
     * @returns {Array} Emotion history
     */
    getEmotionHistory() {
        return this.emotionHistory;
    }

    /**
     * Get state changes history
     * @returns {Array} State changes history
     */
    getStateChanges() {
        return this.stateChanges;
    }

    updateState(interaction) {
        // עדכון פשוט של מצב הפרסונה בהתאם לאינטראקציה
        this.currentState.lastInteraction = new Date();
    }

    getCurrentState() {
        return { ...this.currentState };
    }

    resetState() {
        this.currentState = {
            mood: 'neutral',
            interest: 0.5,
            trust: 0.5,
            lastInteraction: null
        };
        this.currentEmotion = EMOTIONAL_STATES.NEUTRAL;
        this.interestLevel = INTEREST_LEVELS.MEDIUM;
        this.trustLevel = 0.5;
        this.topicPriorities = new Map();
        this.emotionHistory = [];
        this.stateChanges = [];
        this.lastUpdate = Date.now();
        this.saveState();
    }
} 