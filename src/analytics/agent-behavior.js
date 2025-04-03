/**
 * מערכת לניתוח התנהגות סוכנים
 */

class AgentBehaviorAnalyzer {
    constructor(config = {}) {
        this.patterns = new Map();
        this.behaviorHistory = new Map();
        this.interactionMatrix = new Map();
        this.metrics = {
            responseTimes: new Map(),
            decisionComplexity: new Map(),
            actionFrequency: new Map()
        };
    }

    /**
     * ניתוח דפוסי התנהגות
     */
    async analyzeBehaviorPatterns(agentId, actions) {
        const patterns = {
            repetitive: this.findRepetitiveActions(actions),
            changes: this.detectBehaviorChanges(actions),
            interactions: this.analyzeInteractions(actions)
        };

        this.patterns.set(agentId, patterns);
        return patterns;
    }

    /**
     * זיהוי פעולות חוזרות
     */
    findRepetitiveActions(actions) {
        const actionCounts = new Map();
        const timeWindows = this.groupActionsByTimeWindow(actions);

        // חישוב תדירות פעולות
        actions.forEach(action => {
            const key = `${action.type}_${action.context}`;
            actionCounts.set(key, (actionCounts.get(key) || 0) + 1);
        });

        // זיהוי דפוסים חוזרים
        const repetitive = Array.from(actionCounts.entries())
            .filter(([_, count]) => count > 2)
            .map(([key, count]) => ({
                pattern: key,
                frequency: count,
                timeWindows: this.findPatternInTimeWindows(key, timeWindows)
            }));

        return repetitive;
    }

    /**
     * זיהוי שינויי התנהגות
     */
    detectBehaviorChanges(actions) {
        const changes = [];
        const windowSize = 10; // גודל חלון לניתוח

        for (let i = 0; i < actions.length - windowSize; i++) {
            const window1 = actions.slice(i, i + windowSize);
            const window2 = actions.slice(i + windowSize, i + windowSize * 2);

            const metrics1 = this.calculateWindowMetrics(window1);
            const metrics2 = this.calculateWindowMetrics(window2);

            if (this.isSignificantChange(metrics1, metrics2)) {
                changes.push({
                    timestamp: actions[i + windowSize].timestamp,
                    type: this.determineChangeType(metrics1, metrics2),
                    magnitude: this.calculateChangeMagnitude(metrics1, metrics2)
                });
            }
        }

        return changes;
    }

    /**
     * ניתוח אינטראקציות בין סוכנים
     */
    analyzeInteractions(actions) {
        const interactions = new Map();

        actions.forEach(action => {
            if (action.interaction) {
                const key = `${action.agentId}_${action.interaction.targetId}`;
                if (!interactions.has(key)) {
                    interactions.set(key, {
                        count: 0,
                        types: new Map(),
                        sentiment: []
                    });
                }

                const interaction = interactions.get(key);
                interaction.count++;
                interaction.types.set(
                    action.interaction.type,
                    (interaction.types.get(action.interaction.type) || 0) + 1
                );
                interaction.sentiment.push(action.interaction.sentiment);
            }
        });

        return Array.from(interactions.entries()).map(([key, data]) => ({
            agents: key.split('_'),
            count: data.count,
            types: Array.from(data.types.entries()),
            averageSentiment: this.calculateAverageSentiment(data.sentiment)
        }));
    }

    /**
     * חישוב מדדי התנהגות
     */
    calculateBehaviorMetrics(actions) {
        return {
            responseTime: this.calculateAverageResponseTime(actions),
            decisionComplexity: this.assessDecisionComplexity(actions),
            actionFrequency: this.calculateActionFrequency(actions)
        };
    }

    /**
     * חישוב זמן תגובה ממוצע
     */
    calculateAverageResponseTime(actions) {
        const responseTimes = actions
            .filter(action => action.responseTime)
            .map(action => action.responseTime);

        return responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;
    }

    /**
     * הערכת מורכבות החלטות
     */
    assessDecisionComplexity(actions) {
        return actions.map(action => ({
            timestamp: action.timestamp,
            complexity: this.calculateDecisionComplexity(action)
        }));
    }

    /**
     * חישוב מורכבות החלטה
     */
    calculateDecisionComplexity(action) {
        const factors = {
            options: action.options?.length || 0,
            contextSize: action.context?.length || 0,
            dependencies: action.dependencies?.length || 0
        };

        return (
            factors.options * 0.4 +
            factors.contextSize * 0.3 +
            factors.dependencies * 0.3
        );
    }

    /**
     * חישוב תדירות פעולות
     */
    calculateActionFrequency(actions) {
        const frequencies = new Map();

        actions.forEach(action => {
            const key = action.type;
            frequencies.set(key, (frequencies.get(key) || 0) + 1);
        });

        return Array.from(frequencies.entries()).map(([type, count]) => ({
            type,
            count,
            percentage: (count / actions.length) * 100
        }));
    }

    /**
     * קבוצת פעולות לפי חלונות זמן
     */
    groupActionsByTimeWindow(actions) {
        const windows = new Map();
        const windowSize = 3600000; // שעה אחת במילישניות

        actions.forEach(action => {
            const windowIndex = Math.floor(action.timestamp / windowSize);
            if (!windows.has(windowIndex)) {
                windows.set(windowIndex, []);
            }
            windows.get(windowIndex).push(action);
        });

        return windows;
    }

    /**
     * חישוב מדדים לחלון זמן
     */
    calculateWindowMetrics(actions) {
        return {
            actionCount: actions.length,
            averageResponseTime: this.calculateAverageResponseTime(actions),
            complexity: this.assessDecisionComplexity(actions).reduce((sum, c) => sum + c.complexity, 0),
            interactionCount: actions.filter(a => a.interaction).length
        };
    }

    /**
     * בדיקת שינוי משמעותי
     */
    isSignificantChange(metrics1, metrics2) {
        const threshold = 0.3; // סף לשינוי משמעותי

        return (
            Math.abs(metrics1.actionCount - metrics2.actionCount) / metrics1.actionCount > threshold ||
            Math.abs(metrics1.averageResponseTime - metrics2.averageResponseTime) / metrics1.averageResponseTime > threshold ||
            Math.abs(metrics1.complexity - metrics2.complexity) / metrics1.complexity > threshold ||
            Math.abs(metrics1.interactionCount - metrics2.interactionCount) / metrics1.interactionCount > threshold
        );
    }

    /**
     * קביעת סוג השינוי
     */
    determineChangeType(metrics1, metrics2) {
        const changes = [];

        if (metrics2.actionCount > metrics1.actionCount * 1.3) {
            changes.push('INCREASED_ACTIVITY');
        }
        if (metrics2.averageResponseTime < metrics1.averageResponseTime * 0.7) {
            changes.push('FASTER_RESPONSES');
        }
        if (metrics2.complexity > metrics1.complexity * 1.3) {
            changes.push('MORE_COMPLEX_DECISIONS');
        }
        if (metrics2.interactionCount > metrics1.interactionCount * 1.3) {
            changes.push('MORE_INTERACTIONS');
        }

        return changes;
    }

    /**
     * חישוב גודל השינוי
     */
    calculateChangeMagnitude(metrics1, metrics2) {
        return {
            actionCount: (metrics2.actionCount - metrics1.actionCount) / metrics1.actionCount,
            responseTime: (metrics2.averageResponseTime - metrics1.averageResponseTime) / metrics1.averageResponseTime,
            complexity: (metrics2.complexity - metrics1.complexity) / metrics1.complexity,
            interactions: (metrics2.interactionCount - metrics1.interactionCount) / metrics1.interactionCount
        };
    }

    /**
     * חישוב סנטימנט ממוצע
     */
    calculateAverageSentiment(sentiments) {
        if (sentiments.length === 0) return 0;
        return sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    }
}

module.exports = AgentBehaviorAnalyzer; 