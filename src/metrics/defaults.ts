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

/**
 * ערכי ברירת מחדל למדדים עסקיים
 */
export const defaultBusinessMetrics: BusinessMetrics = {
    activeUsers: {
        daily: 0,
        weekly: 0,
        monthly: 0
    },
    retentionRate: {
        day7: 0,
        day30: 0,
        day90: 0
    },
    averageSessionDuration: 0,
    simulations: {
        total: 0,
        active: 0,
        completed: 0,
        averageDuration: 0
    },
    scenarios: {
        total: 0,
        active: 0,
        averageAgents: 0
    },
    roi: {
        averageSavings: 0,
        costReduction: 0,
        timeToValue: 0
    }
};

/**
 * ערכי ברירת מחדל למדדים טכניים
 */
export const defaultTechnicalMetrics: TechnicalMetrics = {
    responseTimes: {
        average: 0,
        p95: 0,
        p99: 0
    },
    simulationCreation: {
        average: 0,
        p95: 0,
        failures: 0
    },
    systemAvailability: {
        uptime: 100,
        lastDowntime: new Date(),
        plannedMaintenance: []
    },
    errors: {
        rate: 0,
        byType: {},
        critical: 0
    },
    resourceUsage: {
        cpu: 0,
        memory: 0,
        bandwidth: 0,
        storage: 0
    },
    databasePerformance: {
        queryTime: 0,
        connections: 0,
        cacheHitRate: 0
    }
};

/**
 * ערכי ברירת מחדל למדדי איכות סימולציה
 */
export const defaultSimulationQualityMetrics: SimulationQualityMetrics = {
    behaviorConsistency: {
        score: 0,
        violations: 0,
        patterns: 0
    },
    interactionComplexity: {
        score: 0,
        depth: 0,
        branching: 0
    },
    responseVariety: {
        uniqueResponses: 0,
        contextualRelevance: 0,
        creativityScore: 0
    },
    behavioralAccuracy: {
        matchRate: 0,
        deviations: 0,
        confidence: 0
    },
    insightQuality: {
        relevance: 0,
        actionability: 0,
        novelty: 0
    }
};

/**
 * ערכי ברירת מחדל למדדי חוויית משתמש
 */
export const defaultUserExperienceMetrics: UserExperienceMetrics = {
    nps: {
        score: 0,
        responses: 0,
        trend: 0
    },
    satisfaction: {
        overall: 0,
        byFeature: {},
        comments: []
    },
    usability: {
        score: 0,
        taskCompletionRate: 0,
        timeToTask: 0
    },
    timeToFirstSuccess: {
        average: 0,
        byUserType: {}
    },
    support: {
        ticketsRate: 0,
        resolutionTime: 0,
        satisfactionScore: 0
    }
};

/**
 * ספי התראה ראשוניים
 */
export const initialAlertThresholds: AlertThresholds = {
    technical: {
        responseTime: 1000, // מילישניות
        errorRate: 1, // אחוז
        cpuUsage: 80, // אחוז
        memoryUsage: 80, // אחוז
        diskSpace: 90 // אחוז
    },
    business: {
        activeUsers: 100,
        retentionRate: 50, // אחוז
        revenueDecline: 10 // אחוז
    },
    quality: {
        consistencyScore: 0.8,
        accuracyScore: 0.85,
        satisfactionScore: 4.0
    }
};

/**
 * תצורת דשבורד ראשונית
 */
export const initialDashboardConfig: DashboardConfig = {
    permissions: [
        {
            role: 'admin',
            metrics: ['all'],
            exportAllowed: true
        },
        {
            role: 'manager',
            metrics: ['business', 'quality', 'ux'],
            exportAllowed: true
        },
        {
            role: 'user',
            metrics: ['ux'],
            exportAllowed: false
        }
    ],
    customViews: [
        {
            name: 'סקירה כללית',
            metrics: ['activeUsers', 'retentionRate', 'simulations'],
            layout: 'grid'
        },
        {
            name: 'ביצועים טכניים',
            metrics: ['responseTimes', 'errors', 'resourceUsage'],
            layout: 'list'
        }
    ],
    alerts: {
        enabled: true,
        channels: ['email', 'slack'],
        frequency: 'realtime'
    }
};

/**
 * תצורת איסוף נתונים ראשונית
 */
export const initialDataCollectionConfig: DataCollectionConfig = {
    frequency: {
        technical: '1m',
        business: '1h',
        quality: '1d'
    },
    retention: {
        rawData: 30, // ימים
        aggregated: 365, // ימים
        logs: 90 // ימים
    },
    privacy: {
        anonymization: true,
        dataFields: ['userId', 'email', 'ip'],
        consentRequired: true
    }
};

/**
 * יעדי מדדים ראשוניים
 */
export const initialMetricTargets: MetricTargets = {
    business: {
        activeUsers: 1000,
        retentionRate: 70,
        revenue: 100000
    },
    technical: {
        responseTime: 500,
        uptime: 99.9,
        errorRate: 0.1
    },
    quality: {
        consistency: 0.9,
        accuracy: 0.95,
        satisfaction: 4.5
    }
}; 