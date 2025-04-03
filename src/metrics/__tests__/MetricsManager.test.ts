import { MetricsManager } from '../MetricsManager';
import {
    defaultBusinessMetrics,
    defaultTechnicalMetrics,
    defaultSimulationQualityMetrics,
    defaultUserExperienceMetrics,
    initialAlertThresholds,
    initialDashboardConfig
} from '../defaults';

describe('MetricsManager', () => {
    let metricsManager: MetricsManager;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        metricsManager = new MetricsManager();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('עדכון מדדים', () => {
        it('צריך לעדכן מדדים עסקיים', () => {
            const newMetrics = {
                activeUsers: {
                    ...defaultBusinessMetrics.activeUsers,
                    daily: 1000
                }
            };

            metricsManager.updateBusinessMetrics(newMetrics);
            const allMetrics = metricsManager.getAllMetrics();
            
            expect(allMetrics.business.activeUsers.daily).toBe(1000);
        });

        it('צריך לעדכן מדדים טכניים', () => {
            const newMetrics = {
                responseTimes: {
                    ...defaultTechnicalMetrics.responseTimes,
                    average: 250
                }
            };

            metricsManager.updateTechnicalMetrics(newMetrics);
            const allMetrics = metricsManager.getAllMetrics();
            
            expect(allMetrics.technical.responseTimes.average).toBe(250);
        });

        it('צריך לעדכן מדדי איכות', () => {
            const newMetrics = {
                behaviorConsistency: {
                    ...defaultSimulationQualityMetrics.behaviorConsistency,
                    score: 0.85
                }
            };

            metricsManager.updateQualityMetrics(newMetrics);
            const allMetrics = metricsManager.getAllMetrics();
            
            expect(allMetrics.quality.behaviorConsistency.score).toBe(0.85);
        });

        it('צריך לעדכן מדדי חוויית משתמש', () => {
            const newMetrics = {
                satisfaction: {
                    ...defaultUserExperienceMetrics.satisfaction,
                    overall: 4.5
                }
            };

            metricsManager.updateUXMetrics(newMetrics);
            const allMetrics = metricsManager.getAllMetrics();
            
            expect(allMetrics.ux.satisfaction.overall).toBe(4.5);
        });
    });

    describe('התראות', () => {
        beforeEach(() => {
            metricsManager.updateDashboardConfig({
                alerts: {
                    ...initialDashboardConfig.alerts,
                    enabled: true
                }
            });
        });

        it('צריך לשלוח התראה כאשר מספר המשתמשים הפעילים נמוך', () => {
            const lowActiveUsers = {
                activeUsers: {
                    ...defaultBusinessMetrics.activeUsers,
                    daily: initialAlertThresholds.business.activeUsers - 1
                }
            };

            metricsManager.updateBusinessMetrics(lowActiveUsers);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('משתמשים פעילים מתחת לסף')
            );
        });

        it('צריך לשלוח התראה כאשר זמן התגובה גבוה', () => {
            const highResponseTime = {
                responseTimes: {
                    ...defaultTechnicalMetrics.responseTimes,
                    average: initialAlertThresholds.technical.responseTime + 1
                }
            };

            metricsManager.updateTechnicalMetrics(highResponseTime);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('זמן תגובה גבוה')
            );
        });

        it('צריך לשלוח התראה כאשר ציון העקביות נמוך', () => {
            const lowConsistency = {
                behaviorConsistency: {
                    ...defaultSimulationQualityMetrics.behaviorConsistency,
                    score: initialAlertThresholds.quality.consistencyScore - 0.1
                }
            };

            metricsManager.updateQualityMetrics(lowConsistency);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('ציון עקביות נמוך')
            );
        });

        it('צריך לשלוח התראה כאשר שביעות הרצון נמוכה', () => {
            const lowSatisfaction = {
                satisfaction: {
                    ...defaultUserExperienceMetrics.satisfaction,
                    overall: initialAlertThresholds.quality.satisfactionScore - 0.1
                }
            };

            metricsManager.updateUXMetrics(lowSatisfaction);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('שביעות רצון נמוכה')
            );
        });

        it('לא צריך לשלוח התראות כאשר הן מושבתות', () => {
            metricsManager.updateDashboardConfig({
                alerts: {
                    ...initialDashboardConfig.alerts,
                    enabled: false
                }
            });

            const lowActiveUsers = {
                activeUsers: {
                    ...defaultBusinessMetrics.activeUsers,
                    daily: initialAlertThresholds.business.activeUsers - 1
                }
            };

            metricsManager.updateBusinessMetrics(lowActiveUsers);
            
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    describe('דוחות וייצוא', () => {
        it('צריך לייצא נתונים עם תקופה מוגדרת', () => {
            const from = new Date('2024-01-01');
            const to = new Date('2024-01-31');
            
            const exportedData = metricsManager.exportData(from, to);
            
            expect(exportedData).toEqual({
                metrics: metricsManager.getAllMetrics(),
                period: { from, to }
            });
        });

        it('צריך לייצר דוח תקופתי', () => {
            const report = metricsManager.generateReport('daily');
            
            expect(report).toEqual({
                type: 'daily',
                metrics: metricsManager.getAllMetrics(),
                targets: expect.any(Object)
            });
        });
    });
}); 