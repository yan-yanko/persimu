import { MetricsStorage } from '../MetricsStorage';
import { BusinessMetrics, TechnicalMetrics, SimulationQualityMetrics, UserExperienceMetrics } from '../types';

describe('MetricsStorage', () => {
    let metricsStorage: MetricsStorage;
    let mockDbClient: {
        connect: jest.Mock;
        disconnect: jest.Mock;
        query: jest.Mock;
    };

    beforeEach(() => {
        mockDbClient = {
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            query: jest.fn().mockResolvedValue([])
        };

        metricsStorage = new MetricsStorage(mockDbClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('חיבור וניתוק', () => {
        it('צריך להתחבר למסד הנתונים', async () => {
            await metricsStorage.connect();
            expect(mockDbClient.connect).toHaveBeenCalledTimes(1);
        });

        it('לא צריך להתחבר שוב אם כבר מחובר', async () => {
            await metricsStorage.connect();
            await metricsStorage.connect();
            expect(mockDbClient.connect).toHaveBeenCalledTimes(1);
        });

        it('צריך להתנתק ממסד הנתונים', async () => {
            await metricsStorage.connect();
            await metricsStorage.disconnect();
            expect(mockDbClient.disconnect).toHaveBeenCalledTimes(1);
        });

        it('לא צריך להתנתק אם לא מחובר', async () => {
            await metricsStorage.disconnect();
            expect(mockDbClient.disconnect).not.toHaveBeenCalled();
        });
    });

    describe('שמירת מדדים', () => {
        const timestamp = new Date('2024-01-01T12:00:00Z');

        beforeEach(async () => {
            await metricsStorage.connect();
        });

        it('צריך לשמור מדדים עסקיים', async () => {
            const metrics: BusinessMetrics = {
                activeUsers: {
                    daily: 100,
                    weekly: 500,
                    monthly: 2000
                },
                retentionRate: {
                    day7: 0.8,
                    day30: 0.6
                }
            };

            await metricsStorage.storeBusinessMetrics(metrics, timestamp);

            expect(mockDbClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO business_metrics'),
                expect.arrayContaining([
                    timestamp,
                    100,
                    500,
                    2000,
                    0.8,
                    0.6
                ])
            );
        });

        it('צריך לשמור מדדים טכניים', async () => {
            const metrics: TechnicalMetrics = {
                responseTimes: {
                    average: 200,
                    p95: 500,
                    p99: 800
                },
                errors: {
                    count: 50,
                    rate: 0.02
                },
                resourceUsage: {
                    cpu: 0.6,
                    memory: 0.7,
                    disk: 0.5
                }
            };

            await metricsStorage.storeTechnicalMetrics(metrics, timestamp);

            expect(mockDbClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO technical_metrics'),
                expect.arrayContaining([
                    timestamp,
                    200,
                    500,
                    800,
                    50,
                    0.02,
                    0.6,
                    0.7,
                    0.5
                ])
            );
        });

        it('צריך לשמור מדדי איכות', async () => {
            const metrics: SimulationQualityMetrics = {
                behaviorConsistency: {
                    score: 0.9,
                    violations: 5
                },
                interactionComplexity: {
                    score: 0.7,
                    depth: 3
                },
                behavioralAccuracy: {
                    matchRate: 0.85,
                    deviations: 10
                }
            };

            await metricsStorage.storeQualityMetrics(metrics, timestamp);

            expect(mockDbClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO quality_metrics'),
                expect.arrayContaining([
                    timestamp,
                    0.9,
                    5,
                    0.7,
                    3,
                    0.85,
                    10
                ])
            );
        });

        it('צריך לשמור מדדי חוויית משתמש', async () => {
            const metrics: UserExperienceMetrics = {
                satisfaction: {
                    overall: 4.2,
                    features: { 'feature1': 4.5 }
                },
                usability: {
                    score: 0.8,
                    painPoints: ['issue1']
                },
                timeToSuccess: {
                    average: 120,
                    distribution: { '0-60': 0.3 }
                }
            };

            await metricsStorage.storeUXMetrics(metrics, timestamp);

            expect(mockDbClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO ux_metrics'),
                expect.arrayContaining([
                    timestamp,
                    4.2,
                    JSON.stringify({ 'feature1': 4.5 }),
                    0.8,
                    JSON.stringify(['issue1']),
                    120,
                    JSON.stringify({ '0-60': 0.3 })
                ])
            );
        });
    });

    describe('שליפת מדדים', () => {
        const from = new Date('2024-01-01T00:00:00Z');
        const to = new Date('2024-01-31T23:59:59Z');

        beforeEach(async () => {
            await metricsStorage.connect();
        });

        it('צריך לשלוף מדדים עסקיים', async () => {
            const mockData = [{
                daily_active_users: 100,
                weekly_active_users: 500,
                monthly_active_users: 2000,
                day7_retention_rate: 0.8,
                day30_retention_rate: 0.6
            }];

            mockDbClient.query.mockResolvedValueOnce(mockData);

            const metrics = await metricsStorage.getBusinessMetrics(from, to);

            expect(mockDbClient.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM business_metrics'),
                [from, to]
            );

            expect(metrics[0]).toEqual({
                activeUsers: {
                    daily: 100,
                    weekly: 500,
                    monthly: 2000
                },
                retentionRate: {
                    day7: 0.8,
                    day30: 0.6
                }
            });
        });

        it('צריך לשלוף מדדים טכניים', async () => {
            const mockData = [{
                avg_response_time: 200,
                p95_response_time: 500,
                p99_response_time: 800,
                error_count: 50,
                error_rate: 0.02,
                cpu_usage: 0.6,
                memory_usage: 0.7,
                disk_usage: 0.5
            }];

            mockDbClient.query.mockResolvedValueOnce(mockData);

            const metrics = await metricsStorage.getTechnicalMetrics(from, to);

            expect(mockDbClient.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM technical_metrics'),
                [from, to]
            );

            expect(metrics[0]).toEqual({
                responseTimes: {
                    average: 200,
                    p95: 500,
                    p99: 800
                },
                errors: {
                    count: 50,
                    rate: 0.02
                },
                resourceUsage: {
                    cpu: 0.6,
                    memory: 0.7,
                    disk: 0.5
                }
            });
        });

        it('צריך לשלוף מדדי איכות', async () => {
            const mockData = [{
                behavior_consistency_score: 0.9,
                behavior_violations: 5,
                interaction_complexity_score: 0.7,
                interaction_depth: 3,
                behavioral_match_rate: 0.85,
                behavioral_deviations: 10
            }];

            mockDbClient.query.mockResolvedValueOnce(mockData);

            const metrics = await metricsStorage.getQualityMetrics(from, to);

            expect(mockDbClient.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM quality_metrics'),
                [from, to]
            );

            expect(metrics[0]).toEqual({
                behaviorConsistency: {
                    score: 0.9,
                    violations: 5
                },
                interactionComplexity: {
                    score: 0.7,
                    depth: 3
                },
                behavioralAccuracy: {
                    matchRate: 0.85,
                    deviations: 10
                }
            });
        });

        it('צריך לשלוף מדדי חוויית משתמש', async () => {
            const mockData = [{
                overall_satisfaction: 4.2,
                feature_satisfaction: '{"feature1":4.5}',
                usability_score: 0.8,
                usability_pain_points: '["issue1"]',
                avg_time_to_success: 120,
                time_distribution: '{"0-60":0.3}'
            }];

            mockDbClient.query.mockResolvedValueOnce(mockData);

            const metrics = await metricsStorage.getUXMetrics(from, to);

            expect(mockDbClient.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM ux_metrics'),
                [from, to]
            );

            expect(metrics[0]).toEqual({
                satisfaction: {
                    overall: 4.2,
                    features: { 'feature1': 4.5 }
                },
                usability: {
                    score: 0.8,
                    painPoints: ['issue1']
                },
                timeToSuccess: {
                    average: 120,
                    distribution: { '0-60': 0.3 }
                }
            });
        });
    });

    describe('ניקוי מדדים', () => {
        const olderThan = new Date('2024-01-01T00:00:00Z');

        beforeEach(async () => {
            await metricsStorage.connect();
        });

        it('צריך למחוק מדדים ישנים מכל הטבלאות', async () => {
            await metricsStorage.cleanupOldMetrics(olderThan);

            expect(mockDbClient.query).toHaveBeenCalledTimes(4);
            expect(mockDbClient.query).toHaveBeenCalledWith(
                'DELETE FROM business_metrics WHERE timestamp < ?',
                [olderThan]
            );
            expect(mockDbClient.query).toHaveBeenCalledWith(
                'DELETE FROM technical_metrics WHERE timestamp < ?',
                [olderThan]
            );
            expect(mockDbClient.query).toHaveBeenCalledWith(
                'DELETE FROM quality_metrics WHERE timestamp < ?',
                [olderThan]
            );
            expect(mockDbClient.query).toHaveBeenCalledWith(
                'DELETE FROM ux_metrics WHERE timestamp < ?',
                [olderThan]
            );
        });
    });
}); 