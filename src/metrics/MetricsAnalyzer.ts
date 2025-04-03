import { 
    BusinessMetrics, 
    TechnicalMetrics, 
    SimulationQualityMetrics, 
    UserExperienceMetrics,
    MetricTargets
} from './types';

/**
 * תוצאות ניתוח מדדים
 */
interface AnalysisResults {
    trends: {
        business: BusinessTrends;
        technical: TechnicalTrends;
        quality: QualityTrends;
        ux: UXTrends;
    };
    insights: string[];
    recommendations: string[];
}

/**
 * מגמות מדדים עסקיים
 */
interface BusinessTrends {
    activeUsers: {
        trend: number;
        growth: number;
    };
    retention: {
        trend: number;
        churn: number;
    };
}

/**
 * מגמות מדדים טכניים
 */
interface TechnicalTrends {
    performance: {
        trend: number;
        bottlenecks: string[];
    };
    reliability: {
        trend: number;
        issues: string[];
    };
}

/**
 * מגמות מדדי איכות
 */
interface QualityTrends {
    consistency: {
        trend: number;
        issues: string[];
    };
    accuracy: {
        trend: number;
        gaps: string[];
    };
}

/**
 * מגמות מדדי חוויית משתמש
 */
interface UXTrends {
    satisfaction: {
        trend: number;
        painPoints: string[];
    };
    engagement: {
        trend: number;
        barriers: string[];
    };
}

/**
 * שירות ניתוח מדדים
 */
export class MetricsAnalyzer {
    private targets: MetricTargets;

    constructor(targets: MetricTargets) {
        this.targets = targets;
    }

    /**
     * ניתוח מדדים
     */
    public analyze(
        businessMetrics: BusinessMetrics[],
        technicalMetrics: TechnicalMetrics[],
        qualityMetrics: SimulationQualityMetrics[],
        uxMetrics: UserExperienceMetrics[]
    ): AnalysisResults {
        const trends = {
            business: this.analyzeBusinessTrends(businessMetrics),
            technical: this.analyzeTechnicalTrends(technicalMetrics),
            quality: this.analyzeQualityTrends(qualityMetrics),
            ux: this.analyzeUXTrends(uxMetrics)
        };

        const insights = this.generateInsights(trends);
        const recommendations = this.generateRecommendations(trends);

        return {
            trends,
            insights,
            recommendations
        };
    }

    /**
     * ניתוח מגמות עסקיות
     */
    private analyzeBusinessTrends(metrics: BusinessMetrics[]): BusinessTrends {
        if (metrics.length < 2) {
            return {
                activeUsers: { trend: 0, growth: 0 },
                retention: { trend: 0, churn: 0 }
            };
        }

        const latest = metrics[0];
        const previous = metrics[1];

        const activeUsersTrend = this.calculateTrend(
            latest.activeUsers.daily,
            previous.activeUsers.daily
        );

        const activeUsersGrowth = this.calculateGrowthRate(
            latest.activeUsers.monthly,
            previous.activeUsers.monthly
        );

        const retentionTrend = this.calculateTrend(
            latest.retentionRate.day30,
            previous.retentionRate.day30
        );

        const churnRate = 1 - latest.retentionRate.day30;

        return {
            activeUsers: {
                trend: activeUsersTrend,
                growth: activeUsersGrowth
            },
            retention: {
                trend: retentionTrend,
                churn: churnRate
            }
        };
    }

    /**
     * ניתוח מגמות טכניות
     */
    private analyzeTechnicalTrends(metrics: TechnicalMetrics[]): TechnicalTrends {
        if (metrics.length < 2) {
            return {
                performance: { trend: 0, bottlenecks: [] },
                reliability: { trend: 0, issues: [] }
            };
        }

        const latest = metrics[0];
        const previous = metrics[1];

        const performanceTrend = this.calculateTrend(
            previous.responseTimes.average,
            latest.responseTimes.average
        );

        const bottlenecks = this.identifyBottlenecks(latest);

        const reliabilityTrend = this.calculateTrend(
            1 - previous.errors.rate,
            1 - latest.errors.rate
        );

        const issues = this.identifyTechnicalIssues(latest);

        return {
            performance: {
                trend: performanceTrend,
                bottlenecks
            },
            reliability: {
                trend: reliabilityTrend,
                issues
            }
        };
    }

    /**
     * ניתוח מגמות איכות
     */
    private analyzeQualityTrends(metrics: SimulationQualityMetrics[]): QualityTrends {
        if (metrics.length < 2) {
            return {
                consistency: { trend: 0, issues: [] },
                accuracy: { trend: 0, gaps: [] }
            };
        }

        const latest = metrics[0];
        const previous = metrics[1];

        const consistencyTrend = this.calculateTrend(
            latest.behaviorConsistency.score,
            previous.behaviorConsistency.score
        );

        const consistencyIssues = this.identifyConsistencyIssues(latest);

        const accuracyTrend = this.calculateTrend(
            latest.behavioralAccuracy.matchRate,
            previous.behavioralAccuracy.matchRate
        );

        const accuracyGaps = this.identifyAccuracyGaps(latest);

        return {
            consistency: {
                trend: consistencyTrend,
                issues: consistencyIssues
            },
            accuracy: {
                trend: accuracyTrend,
                gaps: accuracyGaps
            }
        };
    }

    /**
     * ניתוח מגמות חוויית משתמש
     */
    private analyzeUXTrends(metrics: UserExperienceMetrics[]): UXTrends {
        if (metrics.length < 2) {
            return {
                satisfaction: { trend: 0, painPoints: [] },
                engagement: { trend: 0, barriers: [] }
            };
        }

        const latest = metrics[0];
        const previous = metrics[1];

        const satisfactionTrend = this.calculateTrend(
            latest.satisfaction.overall,
            previous.satisfaction.overall
        );

        const painPoints = this.identifyPainPoints(latest);

        const engagementTrend = this.calculateTrend(
            latest.timeToSuccess.average,
            previous.timeToSuccess.average
        );

        const barriers = this.identifyEngagementBarriers(latest);

        return {
            satisfaction: {
                trend: satisfactionTrend,
                painPoints
            },
            engagement: {
                trend: engagementTrend,
                barriers
            }
        };
    }

    /**
     * יצירת תובנות
     */
    private generateInsights(trends: AnalysisResults['trends']): string[] {
        const insights: string[] = [];

        // תובנות עסקיות
        if (trends.business.activeUsers.trend < 0) {
            insights.push('ירידה במספר המשתמשים הפעילים');
        }
        if (trends.business.retention.churn > 0.3) {
            insights.push('שיעור נטישה גבוה של משתמשים');
        }

        // תובנות טכניות
        if (trends.technical.performance.trend < 0) {
            insights.push('ירידה בביצועי המערכת');
        }
        if (trends.technical.reliability.issues.length > 0) {
            insights.push('בעיות אמינות במערכת');
        }

        // תובנות איכות
        if (trends.quality.consistency.trend < 0) {
            insights.push('ירידה בעקביות התנהגות');
        }
        if (trends.quality.accuracy.trend < 0) {
            insights.push('ירידה בדיוק התנהגותי');
        }

        // תובנות חוויית משתמש
        if (trends.ux.satisfaction.trend < 0) {
            insights.push('ירידה בשביעות רצון משתמשים');
        }
        if (trends.ux.engagement.trend < 0) {
            insights.push('ירידה במעורבות משתמשים');
        }

        return insights;
    }

    /**
     * יצירת המלצות
     */
    private generateRecommendations(trends: AnalysisResults['trends']): string[] {
        const recommendations: string[] = [];

        // המלצות עסקיות
        if (trends.business.activeUsers.trend < 0) {
            recommendations.push('לבחון אסטרטגיות לשיפור אקטיבציית משתמשים');
        }
        if (trends.business.retention.churn > 0.3) {
            recommendations.push('לשפר את תהליכי שימור המשתמשים');
        }

        // המלצות טכניות
        if (trends.technical.performance.bottlenecks.length > 0) {
            recommendations.push('לטפל בצווארי בקבוק בביצועים');
        }
        if (trends.technical.reliability.issues.length > 0) {
            recommendations.push('לשפר את אמינות המערכת');
        }

        // המלצות איכות
        if (trends.quality.consistency.issues.length > 0) {
            recommendations.push('לשפר את עקביות ההתנהגות');
        }
        if (trends.quality.accuracy.gaps.length > 0) {
            recommendations.push('לסגור פערי דיוק התנהגותי');
        }

        // המלצות חוויית משתמש
        if (trends.ux.satisfaction.painPoints.length > 0) {
            recommendations.push('לטפל בנקודות כאב בחוויית המשתמש');
        }
        if (trends.ux.engagement.barriers.length > 0) {
            recommendations.push('להסיר חסמי מעורבות משתמשים');
        }

        return recommendations;
    }

    /**
     * חישוב מגמה
     */
    private calculateTrend(current: number, previous: number): number {
        if (previous === 0) return 0;
        return (current - previous) / previous;
    }

    /**
     * חישוב שיעור צמיחה
     */
    private calculateGrowthRate(current: number, previous: number): number {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    }

    /**
     * זיהוי צווארי בקבוק
     */
    private identifyBottlenecks(metrics: TechnicalMetrics): string[] {
        const bottlenecks: string[] = [];

        if (metrics.responseTimes.p95 > this.targets.technical.responseTime) {
            bottlenecks.push('זמני תגובה גבוהים');
        }

        if (metrics.resourceUsage.cpu > this.targets.technical.resourceUsage) {
            bottlenecks.push('צריכת CPU גבוהה');
        }

        if (metrics.resourceUsage.memory > this.targets.technical.resourceUsage) {
            bottlenecks.push('צריכת זיכרון גבוהה');
        }

        return bottlenecks;
    }

    /**
     * זיהוי בעיות טכניות
     */
    private identifyTechnicalIssues(metrics: TechnicalMetrics): string[] {
        const issues: string[] = [];

        if (metrics.errors.rate > this.targets.technical.errorRate) {
            issues.push('שיעור שגיאות גבוה');
        }

        if (metrics.resourceUsage.disk > 0.9) {
            issues.push('שימוש גבוה בדיסק');
        }

        return issues;
    }

    /**
     * זיהוי בעיות עקביות
     */
    private identifyConsistencyIssues(metrics: SimulationQualityMetrics): string[] {
        const issues: string[] = [];

        if (metrics.behaviorConsistency.score < this.targets.quality.consistencyScore) {
            issues.push('ציון עקביות נמוך');
        }

        if (metrics.behaviorConsistency.violations > 10) {
            issues.push('מספר גבוה של הפרות עקביות');
        }

        return issues;
    }

    /**
     * זיהוי פערי דיוק
     */
    private identifyAccuracyGaps(metrics: SimulationQualityMetrics): string[] {
        const gaps: string[] = [];

        if (metrics.behavioralAccuracy.matchRate < this.targets.quality.accuracyScore) {
            gaps.push('שיעור התאמה נמוך');
        }

        if (metrics.behavioralAccuracy.deviations > 10) {
            gaps.push('מספר גבוה של סטיות');
        }

        return gaps;
    }

    /**
     * זיהוי נקודות כאב
     */
    private identifyPainPoints(metrics: UserExperienceMetrics): string[] {
        const painPoints: string[] = [];

        if (metrics.satisfaction.overall < this.targets.quality.satisfactionScore) {
            painPoints.push('שביעות רצון נמוכה');
        }

        painPoints.push(...metrics.usability.painPoints);

        return painPoints;
    }

    /**
     * זיהוי חסמי מעורבות
     */
    private identifyEngagementBarriers(metrics: UserExperienceMetrics): string[] {
        const barriers: string[] = [];

        if (metrics.timeToSuccess.average > 300) {
            barriers.push('זמן ארוך להצלחה');
        }

        const lowSatisfactionFeatures = Object.entries(metrics.satisfaction.features)
            .filter(([_, score]) => score < this.targets.quality.satisfactionScore)
            .map(([feature]) => `שביעות רצון נמוכה מ-${feature}`);

        barriers.push(...lowSatisfactionFeatures);

        return barriers;
    }
} 