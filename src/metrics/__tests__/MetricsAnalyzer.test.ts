import { MetricsAnalyzer } from '../MetricsAnalyzer';
import { BusinessMetrics, TechnicalMetrics, SimulationQualityMetrics, UserExperienceMetrics, MetricTargets } from '../types';

describe('MetricsAnalyzer', () => {
    let metricsAnalyzer: MetricsAnalyzer;
    let targets: MetricTargets;

    beforeEach(() => {
        targets = {
            business: {
                activeUsers: 1000,
                retentionRate: 0.7
            },
            technical: {
                responseTime: 500,
                errorRate: 0.01,
                resourceUsage: 0.8
            },
            quality: {
                consistencyScore: 0.8,
                accuracyScore: 0.9,
                satisfactionScore: 4.0
            }
        };

        metricsAnalyzer = new MetricsAnalyzer(targets);
    });

    describe('ניתוח מדדים', () => {
        it('צריך לנתח מדדים עם מגמות חיוביות', () => {
            const businessMetrics: BusinessMetrics[] = [
                {
                    activeUsers: { daily: 1200, weekly: 5000, monthly: 20000 },
                    retentionRate: { day7: 0.85, day30: 0.75 }
                },
                {
                    activeUsers: { daily: 1000, weekly: 4500, monthly: 18000 },
                    retentionRate: { day7: 0.8, day30: 0.7 }
                }
            ];

            const technicalMetrics: TechnicalMetrics[] = [
                {
                    responseTimes: { average: 200, p95: 400, p99: 600 },
                    errors: { count: 50, rate: 0.005 },
                    resourceUsage: { cpu: 0.6, memory: 0.7, disk: 0.5 }
                },
                {
                    responseTimes: { average: 250, p95: 450, p99: 650 },
                    errors: { count: 100, rate: 0.01 },
                    resourceUsage: { cpu: 0.7, memory: 0.8, disk: 0.6 }
                }
            ];

            const qualityMetrics: SimulationQualityMetrics[] = [
                {
                    behaviorConsistency: { score: 0.9, violations: 5 },
                    interactionComplexity: { score: 0.8, depth: 3 },
                    behavioralAccuracy: { matchRate: 0.95, deviations: 8 }
                },
                {
                    behaviorConsistency: { score: 0.85, violations: 8 },
                    interactionComplexity: { score: 0.75, depth: 3 },
                    behavioralAccuracy: { matchRate: 0.9, deviations: 12 }
                }
            ];

            const uxMetrics: UserExperienceMetrics[] = [
                {
                    satisfaction: { overall: 4.5, features: { 'feature1': 4.8 } },
                    usability: { score: 0.9, painPoints: [] },
                    timeToSuccess: { average: 180, distribution: { '0-60': 0.4 } }
                },
                {
                    satisfaction: { overall: 4.2, features: { 'feature1': 4.5 } },
                    usability: { score: 0.85, painPoints: ['issue1'] },
                    timeToSuccess: { average: 200, distribution: { '0-60': 0.35 } }
                }
            ];

            const results = metricsAnalyzer.analyze(
                businessMetrics,
                technicalMetrics,
                qualityMetrics,
                uxMetrics
            );

            expect(results.trends.business.activeUsers.trend).toBeGreaterThan(0);
            expect(results.trends.business.retention.trend).toBeGreaterThan(0);
            expect(results.trends.technical.performance.trend).toBeGreaterThan(0);
            expect(results.trends.quality.consistency.trend).toBeGreaterThan(0);
            expect(results.trends.ux.satisfaction.trend).toBeGreaterThan(0);
            expect(results.insights.length).toBe(0);
            expect(results.recommendations.length).toBe(0);
        });

        it('צריך לנתח מדדים עם מגמות שליליות', () => {
            const businessMetrics: BusinessMetrics[] = [
                {
                    activeUsers: { daily: 800, weekly: 4000, monthly: 15000 },
                    retentionRate: { day7: 0.6, day30: 0.5 }
                },
                {
                    activeUsers: { daily: 1000, weekly: 4500, monthly: 18000 },
                    retentionRate: { day7: 0.8, day30: 0.7 }
                }
            ];

            const technicalMetrics: TechnicalMetrics[] = [
                {
                    responseTimes: { average: 600, p95: 800, p99: 1000 },
                    errors: { count: 200, rate: 0.02 },
                    resourceUsage: { cpu: 0.9, memory: 0.85, disk: 0.95 }
                },
                {
                    responseTimes: { average: 400, p95: 600, p99: 800 },
                    errors: { count: 100, rate: 0.01 },
                    resourceUsage: { cpu: 0.7, memory: 0.8, disk: 0.6 }
                }
            ];

            const qualityMetrics: SimulationQualityMetrics[] = [
                {
                    behaviorConsistency: { score: 0.7, violations: 15 },
                    interactionComplexity: { score: 0.6, depth: 2 },
                    behavioralAccuracy: { matchRate: 0.8, deviations: 20 }
                },
                {
                    behaviorConsistency: { score: 0.85, violations: 8 },
                    interactionComplexity: { score: 0.75, depth: 3 },
                    behavioralAccuracy: { matchRate: 0.9, deviations: 12 }
                }
            ];

            const uxMetrics: UserExperienceMetrics[] = [
                {
                    satisfaction: { overall: 3.5, features: { 'feature1': 3.2 } },
                    usability: { score: 0.7, painPoints: ['issue1', 'issue2'] },
                    timeToSuccess: { average: 350, distribution: { '0-60': 0.2 } }
                },
                {
                    satisfaction: { overall: 4.2, features: { 'feature1': 4.5 } },
                    usability: { score: 0.85, painPoints: ['issue1'] },
                    timeToSuccess: { average: 200, distribution: { '0-60': 0.35 } }
                }
            ];

            const results = metricsAnalyzer.analyze(
                businessMetrics,
                technicalMetrics,
                qualityMetrics,
                uxMetrics
            );

            expect(results.trends.business.activeUsers.trend).toBeLessThan(0);
            expect(results.trends.business.retention.trend).toBeLessThan(0);
            expect(results.trends.technical.performance.trend).toBeLessThan(0);
            expect(results.trends.quality.consistency.trend).toBeLessThan(0);
            expect(results.trends.ux.satisfaction.trend).toBeLessThan(0);
            expect(results.insights).toContain('ירידה במספר המשתמשים הפעילים');
            expect(results.insights).toContain('שיעור נטישה גבוה של משתמשים');
            expect(results.insights).toContain('ירידה בביצועי המערכת');
            expect(results.insights).toContain('ירידה בעקביות התנהגות');
            expect(results.insights).toContain('ירידה בשביעות רצון משתמשים');
            expect(results.recommendations).toContain('לבחון אסטרטגיות לשיפור אקטיבציית משתמשים');
            expect(results.recommendations).toContain('לשפר את תהליכי שימור המשתמשים');
            expect(results.recommendations).toContain('לטפל בצווארי בקבוק בביצועים');
            expect(results.recommendations).toContain('לשפר את עקביות ההתנהגות');
            expect(results.recommendations).toContain('לטפל בנקודות כאב בחוויית המשתמש');
        });

        it('צריך לטפל במקרה של מדדים חסרים', () => {
            const results = metricsAnalyzer.analyze([], [], [], []);

            expect(results.trends.business.activeUsers.trend).toBe(0);
            expect(results.trends.business.retention.trend).toBe(0);
            expect(results.trends.technical.performance.trend).toBe(0);
            expect(results.trends.quality.consistency.trend).toBe(0);
            expect(results.trends.ux.satisfaction.trend).toBe(0);
            expect(results.insights).toHaveLength(0);
            expect(results.recommendations).toHaveLength(0);
        });
    });

    describe('זיהוי בעיות', () => {
        it('צריך לזהות צווארי בקבוק', () => {
            const metrics: TechnicalMetrics = {
                responseTimes: { average: 400, p95: 600, p99: 800 },
                errors: { count: 100, rate: 0.02 },
                resourceUsage: { cpu: 0.9, memory: 0.85, disk: 0.7 }
            };

            const bottlenecks = (metricsAnalyzer as any).identifyBottlenecks(metrics);

            expect(bottlenecks).toContain('זמני תגובה גבוהים');
            expect(bottlenecks).toContain('צריכת CPU גבוהה');
            expect(bottlenecks).toContain('צריכת זיכרון גבוהה');
        });

        it('צריך לזהות בעיות עקביות', () => {
            const metrics: SimulationQualityMetrics = {
                behaviorConsistency: { score: 0.7, violations: 15 },
                interactionComplexity: { score: 0.6, depth: 2 },
                behavioralAccuracy: { matchRate: 0.8, deviations: 20 }
            };

            const issues = (metricsAnalyzer as any).identifyConsistencyIssues(metrics);

            expect(issues).toContain('ציון עקביות נמוך');
            expect(issues).toContain('מספר גבוה של הפרות עקביות');
        });

        it('צריך לזהות נקודות כאב', () => {
            const metrics: UserExperienceMetrics = {
                satisfaction: { overall: 3.5, features: { 'feature1': 3.2 } },
                usability: { score: 0.7, painPoints: ['issue1', 'issue2'] },
                timeToSuccess: { average: 350, distribution: { '0-60': 0.2 } }
            };

            const painPoints = (metricsAnalyzer as any).identifyPainPoints(metrics);

            expect(painPoints).toContain('שביעות רצון נמוכה');
            expect(painPoints).toContain('issue1');
            expect(painPoints).toContain('issue2');
        });
    });

    describe('חישובים', () => {
        it('צריך לחשב מגמה', () => {
            expect((metricsAnalyzer as any).calculateTrend(120, 100)).toBe(0.2);
            expect((metricsAnalyzer as any).calculateTrend(80, 100)).toBe(-0.2);
            expect((metricsAnalyzer as any).calculateTrend(100, 0)).toBe(0);
        });

        it('צריך לחשב שיעור צמיחה', () => {
            expect((metricsAnalyzer as any).calculateGrowthRate(120, 100)).toBe(20);
            expect((metricsAnalyzer as any).calculateGrowthRate(80, 100)).toBe(-20);
            expect((metricsAnalyzer as any).calculateGrowthRate(100, 0)).toBe(0);
        });
    });
}); 