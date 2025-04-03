import { BusinessMetrics, TechnicalMetrics, SimulationQualityMetrics, UserExperienceMetrics } from './types';

/**
 * ממשק למסד נתונים
 */
interface DatabaseClient {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params: unknown[]): Promise<unknown>;
}

/**
 * שירות שמירת מדדים
 */
export class MetricsStorage {
    private dbClient: DatabaseClient;
    private connected: boolean = false;

    constructor(dbClient: DatabaseClient) {
        this.dbClient = dbClient;
    }

    /**
     * התחברות למסד הנתונים
     */
    public async connect(): Promise<void> {
        if (!this.connected) {
            await this.dbClient.connect();
            this.connected = true;
        }
    }

    /**
     * ניתוק ממסד הנתונים
     */
    public async disconnect(): Promise<void> {
        if (this.connected) {
            await this.dbClient.disconnect();
            this.connected = false;
        }
    }

    /**
     * שמירת מדדים עסקיים
     */
    public async storeBusinessMetrics(metrics: BusinessMetrics, timestamp: Date): Promise<void> {
        const sql = `
            INSERT INTO business_metrics (
                timestamp,
                daily_active_users,
                weekly_active_users,
                monthly_active_users,
                day7_retention_rate,
                day30_retention_rate
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            timestamp,
            metrics.activeUsers.daily,
            metrics.activeUsers.weekly,
            metrics.activeUsers.monthly,
            metrics.retentionRate.day7,
            metrics.retentionRate.day30
        ];

        await this.dbClient.query(sql, params);
    }

    /**
     * שמירת מדדים טכניים
     */
    public async storeTechnicalMetrics(metrics: TechnicalMetrics, timestamp: Date): Promise<void> {
        const sql = `
            INSERT INTO technical_metrics (
                timestamp,
                avg_response_time,
                p95_response_time,
                p99_response_time,
                error_count,
                error_rate,
                cpu_usage,
                memory_usage,
                disk_usage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            timestamp,
            metrics.responseTimes.average,
            metrics.responseTimes.p95,
            metrics.responseTimes.p99,
            metrics.errors.count,
            metrics.errors.rate,
            metrics.resourceUsage.cpu,
            metrics.resourceUsage.memory,
            metrics.resourceUsage.disk
        ];

        await this.dbClient.query(sql, params);
    }

    /**
     * שמירת מדדי איכות
     */
    public async storeQualityMetrics(metrics: SimulationQualityMetrics, timestamp: Date): Promise<void> {
        const sql = `
            INSERT INTO quality_metrics (
                timestamp,
                behavior_consistency_score,
                behavior_violations,
                interaction_complexity_score,
                interaction_depth,
                behavioral_match_rate,
                behavioral_deviations
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            timestamp,
            metrics.behaviorConsistency.score,
            metrics.behaviorConsistency.violations,
            metrics.interactionComplexity.score,
            metrics.interactionComplexity.depth,
            metrics.behavioralAccuracy.matchRate,
            metrics.behavioralAccuracy.deviations
        ];

        await this.dbClient.query(sql, params);
    }

    /**
     * שמירת מדדי חוויית משתמש
     */
    public async storeUXMetrics(metrics: UserExperienceMetrics, timestamp: Date): Promise<void> {
        const sql = `
            INSERT INTO ux_metrics (
                timestamp,
                overall_satisfaction,
                feature_satisfaction,
                usability_score,
                usability_pain_points,
                avg_time_to_success,
                time_distribution
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            timestamp,
            metrics.satisfaction.overall,
            JSON.stringify(metrics.satisfaction.features),
            metrics.usability.score,
            JSON.stringify(metrics.usability.painPoints),
            metrics.timeToSuccess.average,
            JSON.stringify(metrics.timeToSuccess.distribution)
        ];

        await this.dbClient.query(sql, params);
    }

    /**
     * שליפת מדדים עסקיים
     */
    public async getBusinessMetrics(from: Date, to: Date): Promise<BusinessMetrics[]> {
        const sql = `
            SELECT *
            FROM business_metrics
            WHERE timestamp BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `;

        const result = await this.dbClient.query(sql, [from, to]) as any[];
        
        return result.map(row => ({
            activeUsers: {
                daily: row.daily_active_users,
                weekly: row.weekly_active_users,
                monthly: row.monthly_active_users
            },
            retentionRate: {
                day7: row.day7_retention_rate,
                day30: row.day30_retention_rate
            }
        }));
    }

    /**
     * שליפת מדדים טכניים
     */
    public async getTechnicalMetrics(from: Date, to: Date): Promise<TechnicalMetrics[]> {
        const sql = `
            SELECT *
            FROM technical_metrics
            WHERE timestamp BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `;

        const result = await this.dbClient.query(sql, [from, to]) as any[];
        
        return result.map(row => ({
            responseTimes: {
                average: row.avg_response_time,
                p95: row.p95_response_time,
                p99: row.p99_response_time
            },
            errors: {
                count: row.error_count,
                rate: row.error_rate
            },
            resourceUsage: {
                cpu: row.cpu_usage,
                memory: row.memory_usage,
                disk: row.disk_usage
            }
        }));
    }

    /**
     * שליפת מדדי איכות
     */
    public async getQualityMetrics(from: Date, to: Date): Promise<SimulationQualityMetrics[]> {
        const sql = `
            SELECT *
            FROM quality_metrics
            WHERE timestamp BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `;

        const result = await this.dbClient.query(sql, [from, to]) as any[];
        
        return result.map(row => ({
            behaviorConsistency: {
                score: row.behavior_consistency_score,
                violations: row.behavior_violations
            },
            interactionComplexity: {
                score: row.interaction_complexity_score,
                depth: row.interaction_depth
            },
            behavioralAccuracy: {
                matchRate: row.behavioral_match_rate,
                deviations: row.behavioral_deviations
            }
        }));
    }

    /**
     * שליפת מדדי חוויית משתמש
     */
    public async getUXMetrics(from: Date, to: Date): Promise<UserExperienceMetrics[]> {
        const sql = `
            SELECT *
            FROM ux_metrics
            WHERE timestamp BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `;

        const result = await this.dbClient.query(sql, [from, to]) as any[];
        
        return result.map(row => ({
            satisfaction: {
                overall: row.overall_satisfaction,
                features: JSON.parse(row.feature_satisfaction)
            },
            usability: {
                score: row.usability_score,
                painPoints: JSON.parse(row.usability_pain_points)
            },
            timeToSuccess: {
                average: row.avg_time_to_success,
                distribution: JSON.parse(row.time_distribution)
            }
        }));
    }

    /**
     * מחיקת מדדים ישנים
     */
    public async cleanupOldMetrics(olderThan: Date): Promise<void> {
        const tables = [
            'business_metrics',
            'technical_metrics',
            'quality_metrics',
            'ux_metrics'
        ];

        for (const table of tables) {
            const sql = `DELETE FROM ${table} WHERE timestamp < ?`;
            await this.dbClient.query(sql, [olderThan]);
        }
    }
} 