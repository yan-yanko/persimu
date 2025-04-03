/**
 * מערכת להערכת תוצאות סימולציה
 */

class SimulationEvaluator {
    constructor(config = {}) {
        this.metrics = new Map();
        this.goals = new Map();
        this.turningPoints = new Map();
        this.comparisons = new Map();
    }

    /**
     * הערכת הצלחת סימולציה
     */
    async evaluateSimulation(simulationId, goals) {
        const metrics = await this.calculateMetrics(simulationId);
        const goalAchievement = this.evaluateGoals(metrics, goals);
        const turningPoints = await this.identifyTurningPoints(simulationId);

        const evaluation = {
            metrics,
            goalAchievement,
            turningPoints,
            overallScore: this.calculateOverallScore(goalAchievement)
        };

        this.metrics.set(simulationId, evaluation);
        return evaluation;
    }

    /**
     * חישוב מדדים
     */
    async calculateMetrics(simulationId) {
        const simulation = await this.getSimulationData(simulationId);
        
        return {
            engagement: this.calculateEngagement(simulation),
            effectiveness: this.calculateEffectiveness(simulation),
            efficiency: this.calculateEfficiency(simulation),
            satisfaction: this.calculateSatisfaction(simulation),
            learning: this.calculateLearning(simulation)
        };
    }

    /**
     * הערכת יעדים
     */
    evaluateGoals(metrics, goals) {
        return goals.map(goal => ({
            goal: goal.description,
            target: goal.target,
            actual: this.getMetricValue(metrics, goal.metric),
            achievement: this.calculateGoalAchievement(goal, metrics)
        }));
    }

    /**
     * זיהוי נקודות מפנה
     */
    async identifyTurningPoints(simulationId) {
        const simulation = await this.getSimulationData(simulationId);
        const turningPoints = [];

        // ניתוח שינויים משמעותיים במדדים
        const metricChanges = this.analyzeMetricChanges(simulation);
        
        // זיהוי שינויים בהתנהגות
        const behaviorChanges = await this.analyzeBehaviorChanges(simulation);
        
        // זיהוי שינויים בתוצאות
        const outcomeChanges = this.analyzeOutcomeChanges(simulation);

        // מיזוג כל השינויים
        turningPoints.push(...this.mergeTurningPoints(metricChanges, behaviorChanges, outcomeChanges));

        this.turningPoints.set(simulationId, turningPoints);
        return turningPoints;
    }

    /**
     * השוואת תרחישים
     */
    async compareScenarios(scenarioIds) {
        const comparisons = [];

        for (let i = 0; i < scenarioIds.length; i++) {
            for (let j = i + 1; j < scenarioIds.length; j++) {
                const comparison = await this.compareTwoScenarios(
                    scenarioIds[i],
                    scenarioIds[j]
                );
                comparisons.push(comparison);
            }
        }

        this.comparisons.set(scenarioIds.join('_'), comparisons);
        return comparisons;
    }

    /**
     * השוואת שני תרחישים
     */
    async compareTwoScenarios(scenario1Id, scenario2Id) {
        const scenario1 = await this.getSimulationData(scenario1Id);
        const scenario2 = await this.getSimulationData(scenario2Id);

        return {
            metrics: this.compareMetrics(scenario1, scenario2),
            behaviors: this.compareBehaviors(scenario1, scenario2),
            outcomes: this.compareOutcomes(scenario1, scenario2),
            differences: this.identifyKeyDifferences(scenario1, scenario2)
        };
    }

    /**
     * חישוב מעורבות
     */
    calculateEngagement(simulation) {
        const { interactions, duration } = simulation;
        return {
            interactionRate: interactions.length / duration,
            averageResponseTime: this.calculateAverageResponseTime(interactions),
            participationLevel: this.calculateParticipationLevel(interactions)
        };
    }

    /**
     * חישוב יעילות
     */
    calculateEffectiveness(simulation) {
        const { goals, outcomes } = simulation;
        return {
            goalAchievementRate: this.calculateGoalAchievementRate(goals, outcomes),
            qualityOfOutcomes: this.assessOutcomeQuality(outcomes),
            learningTransfer: this.assessLearningTransfer(simulation)
        };
    }

    /**
     * חישוב יעילות
     */
    calculateEfficiency(simulation) {
        const { duration, resources } = simulation;
        return {
            timeEfficiency: this.calculateTimeEfficiency(duration, simulation.goals),
            resourceUtilization: this.calculateResourceUtilization(resources),
            costEffectiveness: this.calculateCostEffectiveness(simulation)
        };
    }

    /**
     * חישוב שביעות רצון
     */
    calculateSatisfaction(simulation) {
        const { feedback, interactions } = simulation;
        return {
            userSatisfaction: this.calculateUserSatisfaction(feedback),
            interactionQuality: this.assessInteractionQuality(interactions),
            overallExperience: this.assessOverallExperience(simulation)
        };
    }

    /**
     * חישוב למידה
     */
    calculateLearning(simulation) {
        const { preAssessment, postAssessment, interactions } = simulation;
        return {
            knowledgeGain: this.calculateKnowledgeGain(preAssessment, postAssessment),
            skillImprovement: this.assessSkillImprovement(simulation),
            behaviorChange: this.assessBehaviorChange(simulation)
        };
    }

    /**
     * חישוב ציון כולל
     */
    calculateOverallScore(goalAchievement) {
        const weights = {
            engagement: 0.2,
            effectiveness: 0.3,
            efficiency: 0.2,
            satisfaction: 0.15,
            learning: 0.15
        };

        return Object.entries(weights).reduce((score, [metric, weight]) => {
            const metricScore = goalAchievement.find(g => g.metric === metric)?.achievement || 0;
            return score + (metricScore * weight);
        }, 0);
    }

    /**
     * ניתוח שינויים במדדים
     */
    analyzeMetricChanges(simulation) {
        const changes = [];
        const windowSize = 10;

        for (let i = 0; i < simulation.metrics.length - windowSize; i++) {
            const window1 = simulation.metrics.slice(i, i + windowSize);
            const window2 = simulation.metrics.slice(i + windowSize, i + windowSize * 2);

            if (this.isSignificantChange(window1, window2)) {
                changes.push({
                    timestamp: simulation.metrics[i + windowSize].timestamp,
                    type: this.determineChangeType(window1, window2),
                    magnitude: this.calculateChangeMagnitude(window1, window2)
                });
            }
        }

        return changes;
    }

    /**
     * ניתוח שינויים בהתנהגות
     */
    async analyzeBehaviorChanges(simulation) {
        const changes = [];
        const behaviorPatterns = await this.extractBehaviorPatterns(simulation);

        for (let i = 0; i < behaviorPatterns.length - 1; i++) {
            if (this.isBehaviorChange(behaviorPatterns[i], behaviorPatterns[i + 1])) {
                changes.push({
                    timestamp: behaviorPatterns[i + 1].timestamp,
                    type: this.determineBehaviorChangeType(
                        behaviorPatterns[i],
                        behaviorPatterns[i + 1]
                    ),
                    details: this.describeBehaviorChange(
                        behaviorPatterns[i],
                        behaviorPatterns[i + 1]
                    )
                });
            }
        }

        return changes;
    }

    /**
     * ניתוח שינויים בתוצאות
     */
    analyzeOutcomeChanges(simulation) {
        const changes = [];
        const outcomes = simulation.outcomes;

        for (let i = 0; i < outcomes.length - 1; i++) {
            if (this.isOutcomeChange(outcomes[i], outcomes[i + 1])) {
                changes.push({
                    timestamp: outcomes[i + 1].timestamp,
                    type: this.determineOutcomeChangeType(outcomes[i], outcomes[i + 1]),
                    impact: this.assessOutcomeImpact(outcomes[i], outcomes[i + 1])
                });
            }
        }

        return changes;
    }

    /**
     * מיזוג נקודות מפנה
     */
    mergeTurningPoints(metricChanges, behaviorChanges, outcomeChanges) {
        const allPoints = [
            ...metricChanges.map(c => ({ ...c, source: 'metrics' })),
            ...behaviorChanges.map(c => ({ ...c, source: 'behavior' })),
            ...outcomeChanges.map(c => ({ ...c, source: 'outcomes' }))
        ];

        // מיון לפי זמן
        allPoints.sort((a, b) => a.timestamp - b.timestamp);

        // מיזוג נקודות קרובות
        const merged = [];
        let current = null;

        allPoints.forEach(point => {
            if (!current || point.timestamp - current.timestamp > 60000) { // יותר מדקה
                if (current) merged.push(current);
                current = point;
            } else {
                current = this.mergePoints(current, point);
            }
        });

        if (current) merged.push(current);
        return merged;
    }

    /**
     * מיזוג נקודות מפנה
     */
    mergePoints(point1, point2) {
        return {
            timestamp: point1.timestamp,
            type: [...new Set([...point1.type, ...point2.type])],
            sources: [...new Set([point1.source, point2.source])],
            magnitude: Math.max(point1.magnitude, point2.magnitude),
            details: {
                ...point1.details,
                ...point2.details
            }
        };
    }
}

module.exports = SimulationEvaluator; 