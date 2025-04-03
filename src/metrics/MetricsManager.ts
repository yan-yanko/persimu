import {
    BusinessMetrics,
    TechnicalMetrics,
    SimulationQualityMetrics,
    UserExperienceMetrics,
    AlertThresholds,
    DashboardConfig,
    DataCollectionConfig,
    MetricTargets
} from './types';

import {
    defaultBusinessMetrics,
    defaultTechnicalMetrics,
    defaultSimulationQualityMetrics,
    defaultUserExperienceMetrics,
    initialAlertThresholds,
    initialDashboardConfig,
    initialDataCollectionConfig,
    initialMetricTargets
} from './defaults';

/**
 * מנהל מדדים
 */
export class MetricsManager {
    private businessMetrics: BusinessMetrics;
    private technicalMetrics: TechnicalMetrics;
    private qualityMetrics: SimulationQualityMetrics;
    private uxMetrics: UserExperienceMetrics;
    private alertThresholds: AlertThresholds;
    private dashboardConfig: DashboardConfig;
    private dataCollectionConfig: DataCollectionConfig;
    private metricTargets: MetricTargets;

    constructor() {
        this.businessMetrics = { ...defaultBusinessMetrics };
        this.technicalMetrics = { ...defaultTechnicalMetrics };
        this.qualityMetrics = { ...defaultSimulationQualityMetrics };
        this.uxMetrics = { ...defaultUserExperienceMetrics };
        this.alertThresholds = { ...initialAlertThresholds };
        this.dashboardConfig = { ...initialDashboardConfig };
        this.dataCollectionConfig = { ...initialDataCollectionConfig };
        this.metricTargets = { ...initialMetricTargets };
    }

    /**
     * עדכון מדדים עסקיים
     */
    public updateBusinessMetrics(metrics: Partial<BusinessMetrics>): void {
        this.businessMetrics = {
            ...this.businessMetrics,
            ...metrics
        };
        this.checkBusinessAlerts();
    }

    /**
     * עדכון מדדים טכניים
     */
    public updateTechnicalMetrics(metrics: Partial<TechnicalMetrics>): void {
        this.technicalMetrics = {
            ...this.technicalMetrics,
            ...metrics
        };
        this.checkTechnicalAlerts();
    }

    /**
     * עדכון מדדי איכות
     */
    public updateQualityMetrics(metrics: Partial<SimulationQualityMetrics>): void {
        this.qualityMetrics = {
            ...this.qualityMetrics,
            ...metrics
        };
        this.checkQualityAlerts();
    }

    /**
     * עדכון מדדי חוויית משתמש
     */
    public updateUXMetrics(metrics: Partial<UserExperienceMetrics>): void {
        this.uxMetrics = {
            ...this.uxMetrics,
            ...metrics
        };
        this.checkUXAlerts();
    }

    /**
     * קבלת כל המדדים
     */
    public getAllMetrics() {
        return {
            business: this.businessMetrics,
            technical: this.technicalMetrics,
            quality: this.qualityMetrics,
            ux: this.uxMetrics
        };
    }

    /**
     * עדכון ספי התראה
     */
    public updateAlertThresholds(thresholds: Partial<AlertThresholds>): void {
        this.alertThresholds = {
            ...this.alertThresholds,
            ...thresholds
        };
    }

    /**
     * עדכון תצורת דשבורד
     */
    public updateDashboardConfig(config: Partial<DashboardConfig>): void {
        this.dashboardConfig = {
            ...this.dashboardConfig,
            ...config
        };
    }

    /**
     * עדכון תצורת איסוף נתונים
     */
    public updateDataCollectionConfig(config: Partial<DataCollectionConfig>): void {
        this.dataCollectionConfig = {
            ...this.dataCollectionConfig,
            ...config
        };
    }

    /**
     * עדכון יעדי מדדים
     */
    public updateMetricTargets(targets: Partial<MetricTargets>): void {
        this.metricTargets = {
            ...this.metricTargets,
            ...targets
        };
    }

    /**
     * בדיקת התראות עסקיות
     */
    private checkBusinessAlerts(): void {
        const { activeUsers, retentionRate } = this.businessMetrics;
        const thresholds = this.alertThresholds.business;

        if (activeUsers.daily < thresholds.activeUsers) {
            this.triggerAlert('business', 'משתמשים פעילים מתחת לסף');
        }

        if (retentionRate.day30 < thresholds.retentionRate) {
            this.triggerAlert('business', 'שיעור שימור נמוך');
        }
    }

    /**
     * בדיקת התראות טכניות
     */
    private checkTechnicalAlerts(): void {
        const { responseTimes, errors, resourceUsage } = this.technicalMetrics;
        const thresholds = this.alertThresholds.technical;

        if (responseTimes.average > thresholds.responseTime) {
            this.triggerAlert('technical', 'זמן תגובה גבוה');
        }

        if (errors.rate > thresholds.errorRate) {
            this.triggerAlert('technical', 'שיעור שגיאות גבוה');
        }

        if (resourceUsage.cpu > thresholds.cpuUsage) {
            this.triggerAlert('technical', 'צריכת CPU גבוהה');
        }
    }

    /**
     * בדיקת התראות איכות
     */
    private checkQualityAlerts(): void {
        const { behaviorConsistency, behavioralAccuracy } = this.qualityMetrics;
        const thresholds = this.alertThresholds.quality;

        if (behaviorConsistency.score < thresholds.consistencyScore) {
            this.triggerAlert('quality', 'ציון עקביות נמוך');
        }

        if (behavioralAccuracy.matchRate < thresholds.accuracyScore) {
            this.triggerAlert('quality', 'ציון דיוק נמוך');
        }
    }

    /**
     * בדיקת התראות חוויית משתמש
     */
    private checkUXAlerts(): void {
        const { satisfaction } = this.uxMetrics;
        const thresholds = this.alertThresholds.quality;

        if (satisfaction.overall < thresholds.satisfactionScore) {
            this.triggerAlert('ux', 'שביעות רצון נמוכה');
        }
    }

    /**
     * שליחת התראה
     */
    private triggerAlert(type: string, message: string): void {
        if (this.dashboardConfig.alerts.enabled) {
            console.log(`[${type}] התראה: ${message}`);
            // כאן יש להוסיף לוגיקה לשליחת התראות לערוצים השונים
        }
    }

    /**
     * ייצוא נתונים
     */
    public exportData(from: Date, to: Date) {
        // כאן יש להוסיף לוגיקה לייצוא נתונים
        return {
            metrics: this.getAllMetrics(),
            period: { from, to }
        };
    }

    /**
     * ייצור דוח תקופתי
     */
    public generateReport(type: 'daily' | 'weekly' | 'monthly') {
        // כאן יש להוסיף לוגיקה ליצירת דוחות
        return {
            type,
            metrics: this.getAllMetrics(),
            targets: this.metricTargets
        };
    }
} 