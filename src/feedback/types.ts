/**
 * Feedback types
 */
export enum FeedbackType {
    RATING = 'rating',          // Numeric/icon ratings
    SURVEY = 'survey',          // Structured survey
    OPEN_ENDED = 'open_ended',  // Open-ended questions
    FEATURE_REQUEST = 'feature_request', // Feature request
    BUG_REPORT = 'bug_report',  // Bug report
    USABILITY = 'usability'     // Usability issue
}

/**
 * Feedback trigger points
 */
export enum FeedbackTriggerPoint {
    POST_SIMULATION_SETUP = 'post_simulation_setup',
    POST_RESULTS = 'post_results',
    POST_SESSION = 'post_session',
    FEATURE_SPECIFIC = 'feature_specific',
    MANUAL = 'manual',
    PERIODIC = 'periodic'
}

/**
 * Feedback processing status
 */
export enum FeedbackStatus {
    NEW = 'new',
    UNDER_REVIEW = 'under_review',
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    DECLINED = 'declined',
    DUPLICATE = 'duplicate'
}

/**
 * Feedback priority
 */
export enum FeedbackPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * Base feedback interface
 */
export interface BaseFeedback {
    id: string;
    userId: string;
    timestamp: Date;
    type: FeedbackType;
    triggerPoint: FeedbackTriggerPoint;
    status: FeedbackStatus;
    priority: FeedbackPriority;
    assignedTo?: string;
    tags: string[];
    context: {
        url: string;
        userAgent: string;
        sessionId: string;
        simulationId?: string;
        featureId?: string;
    };
}

/**
 * Rating feedback
 */
export interface RatingFeedback extends BaseFeedback {
    type: FeedbackType.RATING;
    data: {
        score: number;        // Rating 1-5 or 1-10
        category: string;     // Rating category (usability, performance, etc.)
        comment?: string;     // Optional comment
    };
}

/**
 * Survey feedback
 */
export interface SurveyFeedback extends BaseFeedback {
    type: FeedbackType.SURVEY;
    data: {
        questions: Array<{
            id: string;
            question: string;
            answerType: 'text' | 'rating' | 'selection' | 'boolean';
            answer: string | number | boolean | string[];
        }>;
        completionTime?: number; // Survey completion time in seconds
    };
}

/**
 * Open-ended feedback
 */
export interface OpenEndedFeedback extends BaseFeedback {
    type: FeedbackType.OPEN_ENDED;
    data: {
        question: string;
        answer: string;
        sentiment?: 'positive' | 'neutral' | 'negative'; // Automatic sentiment analysis
    };
}

/**
 * Feature request
 */
export interface FeatureRequestFeedback extends BaseFeedback {
    type: FeedbackType.FEATURE_REQUEST;
    data: {
        title: string;
        description: string;
        useCase: string;
        businessValue?: string;
        voteCount: number;
        similarRequests?: string[]; // IDs of similar requests
        expectedOutput?: string;    // Expected outcome
    };
}

/**
 * Bug report
 */
export interface BugReportFeedback extends BaseFeedback {
    type: FeedbackType.BUG_REPORT;
    data: {
        title: string;
        description: string;
        stepsToReproduce: string[];
        expectedBehavior: string;
        actualBehavior: string;
        attachments?: string[];
        severity: 'low' | 'medium' | 'high' | 'critical';
        frequency: 'rare' | 'occasional' | 'frequent' | 'always';
    };
}

/**
 * Usability issue
 */
export interface UsabilityFeedback extends BaseFeedback {
    type: FeedbackType.USABILITY;
    data: {
        issue: string;
        taskAttempted: string;
        difficultyLevel: number; // 1-5
        suggestion?: string;
        confusionPoints?: string[];
    };
}

/**
 * Union of all feedback types
 */
export type Feedback = 
    | RatingFeedback
    | SurveyFeedback
    | OpenEndedFeedback
    | FeatureRequestFeedback
    | BugReportFeedback
    | UsabilityFeedback;

/**
 * Feedback scheduling configuration
 */
export interface FeedbackScheduleConfig {
    trigger: FeedbackTriggerPoint;
    type: FeedbackType;
    frequency: {
        newUsers: number;     // How many times to show for new users (sessions)
        regularUsers: number; // How many times to show for regular users (sessions)
        minTimeBetween: number; // Minimum time between requests (in hours)
    };
    conditions: {
        minSessionCount?: number;  // Minimum number of sessions
        minUsageDuration?: number; // Minimum usage time (in minutes)
        completedSimulations?: number; // Number of completed simulations
        specificAction?: string;  // Specific action performed
        randomSampling?: number;  // Percentage of users to show (0-1)
    };
    content: {
        title: string;
        description: string;
        buttonText: string;
        dismissible: boolean; // Whether the feedback prompt can be dismissed
        theme?: 'light' | 'dark'; // Theme
    };
}

/**
 * Feedback analytics
 */
export interface FeedbackAnalytics {
    response: {
        rate: number;      // Percentage of feedback requests answered
        avgCompletionTime: number; // Average completion time
        abandonmentRate: number;  // Percentage of abandoned feedback
    };
    sentiment: {
        positive: number;  // Percentage of positive feedback
        neutral: number;   // Percentage of neutral feedback
        negative: number;  // Percentage of negative feedback
    };
    usage: {
        totalSubmissions: number; // Total feedback submissions
        byType: Record<FeedbackType, number>; // Count by feedback type
        byTriggerPoint: Record<FeedbackTriggerPoint, number>; // Count by trigger point
    };
    trends: {
        daily: Record<string, number>; // Feedback count by day
        weekly: Record<string, number>; // Feedback count by week
        monthly: Record<string, number>; // Feedback count by month
    };
}

/**
 * System response to feedback
 */
export interface FeedbackResponse {
    feedbackId: string;
    responseType: 'automated' | 'manual';
    respondentId?: string;
    message: string;
    timestamp: Date;
    action?: {
        type: 'bug_fix' | 'feature_implementation' | 'task_creation' | 'follow_up_question';
        taskId?: string;
        targetReleaseDate?: Date;
    };
}

/**
 * User interview plan
 */
export interface UserInterviewPlan {
    id: string;
    title: string;
    goal: string;
    targetUsers: {
        count: number;
        criteria: string[];
        segments: string[];
    };
    schedule: {
        startDate: Date;
        endDate: Date;
        intervalDays: number;
        durationMinutes: number;
    };
    incentives: {
        type: 'monetary' | 'product_credit' | 'access_to_features';
        value: string;
        description: string;
    };
    questions: Array<{
        id: string;
        text: string;
        type: 'open' | 'scenario' | 'task' | 'rating';
        purpose: string;
        estimatedTimeMinutes: number;
    }>;
    materials: string[];
    notes: string;
}

/**
 * Beta program configuration
 */
export interface BetaProgramConfig {
    id: string;
    name: string;
    description: string;
    capacity: number;
    status: 'planned' | 'recruiting' | 'active' | 'completed';
    timeline: {
        recruitmentStart: Date;
        recruitmentEnd: Date;
        programStart: Date;
        programEnd: Date;
        milestones: Array<{
            date: Date;
            title: string;
            description: string;
        }>;
    };
    eligibilityCriteria: string[];
    features: Array<{
        id: string;
        name: string;
        description: string;
        status: 'planned' | 'available' | 'removed';
        testObjectives: string[];
    }>;
    communications: {
        welcomeMessage: string;
        channels: string[];
        checkInFrequency: number; // In days
    };
    metrics: string[];
    nda: {
        required: boolean;
        documentUrl?: string;
    };
}

/**
 * Product roadmap item
 */
export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    category: string;
    status: 'planned' | 'in_progress' | 'completed' | 'delayed';
    priority: 'low' | 'medium' | 'high';
    targetQuarter: string; // e.g., "Q1 2024"
    estimatedReleaseDate?: Date;
    originatedFrom: ('user_feedback' | 'team_initiative' | 'business_need')[];
    feedbackIds?: string[]; // Related feedback IDs
    percentComplete: number; // 0-100
    features: Array<{
        title: string;
        description: string;
        status: 'planned' | 'in_progress' | 'completed';
    }>;
    publiclyVisible: boolean;
    notes?: string;
} 