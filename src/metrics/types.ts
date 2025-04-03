/**
 * מדדים עסקיים
 */
export interface BusinessMetrics {
    /**
     * משתמשים פעילים
     */
    activeUsers: {
        daily: number;
        weekly: number;
        monthly: number;
    };

    /**
     * שיעור שימור משתמשים
     */
    retentionRate: {
        day7: number;
        day30: number;
    };

    /**
     * זמן שימוש במערכת
     */
    averageSessionDuration?: number;

    /**
     * סטטיסטיקות סימולציות
     */
    simulations?: {
        total: number;
        active: number;
    };

    /**
     * סטטיסטיקות תרחישים
     */
    scenarios?: {
        total: number;
        completed: number;
    };

    /**
     * ROI למשתמש
     */
    roi?: {
        value: number;
        trend: number;
    };
}

/**
 * מדדים טכניים
 */
export interface TechnicalMetrics {
    /**
     * זמני תגובה
     */
    responseTimes: {
        average: number;
        p95: number;
        p99: number;
    };

    /**
     * זמני יצירת סימולציה
     */
    simulationCreation?: {
        average: number;
        success: number;
    };

    /**
     * זמינות המערכת
     */
    systemAvailability?: {
        uptime: number;
        downtime: number;
    };

    /**
     * שגיאות
     */
    errors: {
        count: number;
        rate: number;
    };

    /**
     * צריכת משאבים
     */
    resourceUsage: {
        cpu: number;
        memory: number;
        disk: number;
    };

    /**
     * ביצועי מסד נתונים
     */
    databasePerformance?: {
        queryTime: number;
        connections: number;
    };
}

/**
 * מדדי איכות סימולציה
 */
export interface SimulationQualityMetrics {
    /**
     * עקביות התנהגות
     */
    behaviorConsistency: {
        score: number;
        violations: number;
    };

    /**
     * מורכבות אינטראקציות
     */
    interactionComplexity: {
        score: number;
        depth: number;
    };

    /**
     * דיוק התנהגותי
     */
    behavioralAccuracy: {
        matchRate: number;
        deviations: number;
    };

    /**
     * מגוון תגובות
     */
    responseVariety?: {
        unique: number;
        total: number;
    };

    /**
     * איכות תובנות
     */
    insightQuality?: {
        relevance: number;
        depth: number;
    };
}

/**
 * מדדי חוויית משתמש
 */
export interface UserExperienceMetrics {
    /**
     * ציוני NPS
     */
    nps?: {
        score: number;
        responses: number;
    };

    /**
     * שביעות רצון
     */
    satisfaction: {
        overall: number;
        features: Record<string, number>;
    };

    /**
     * קלות שימוש
     */
    usability: {
        score: number;
        painPoints: string[];
    };

    /**
     * זמן להצלחה ראשונה
     */
    timeToSuccess: {
        average: number;
        distribution: Record<string, number>;
    };

    /**
     * פניות לתמיכה
     */
    support?: {
        tickets: number;
        resolution: number;
    };
}

/**
 * ספי התראה
 */
export interface AlertThresholds {
    /**
     * ספי התראה עסקיים
     */
    business: {
        activeUsers: number;
        retentionRate: number;
    };

    /**
     * ספי התראה טכניים
     */
    technical: {
        responseTime: number;
        errorRate: number;
        cpuUsage: number;
    };

    /**
     * ספי התראה לאיכות
     */
    quality: {
        consistencyScore: number;
        accuracyScore: number;
        satisfactionScore: number;
    };
}

/**
 * תצורת דשבורד
 */
export interface DashboardConfig {
    /**
     * הרשאות צפייה
     */
    alerts: {
        enabled: boolean;
        channels: string[];
    };

    /**
     * תצוגות מותאמות אישית
     */
    views: {
        default: string;
        custom: Record<string, unknown>;
    };

    /**
     * הגדרות התראות
     */
    permissions: {
        roles: string[];
        access: Record<string, string[]>;
    };
}

/**
 * תצורת איסוף נתונים
 */
export interface DataCollectionConfig {
    /**
     * תדירות איסוף
     */
    frequency: {
        business: number;
        technical: number;
        quality: number;
        ux: number;
    };

    /**
     * שמירת נתונים
     */
    retention: {
        days: number;
        aggregation: string;
    };

    /**
     * הגדרות פרטיות
     */
    privacy: {
        anonymize: boolean;
        exclude: string[];
    };
}

/**
 * יעדי מדדים
 */
export interface MetricTargets {
    /**
     * יעדים עסקיים
     */
    business: {
        activeUsers: number;
        retentionRate: number;
    };

    /**
     * יעדים טכניים
     */
    technical: {
        responseTime: number;
        errorRate: number;
        resourceUsage: number;
    };

    /**
     * יעדי איכות
     */
    quality: {
        consistencyScore: number;
        accuracyScore: number;
        satisfactionScore: number;
    };
} 