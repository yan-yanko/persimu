import {
    Feedback,
    FeedbackType,
    FeedbackTriggerPoint,
    FeedbackStatus,
    FeedbackPriority,
    FeedbackScheduleConfig,
    FeedbackAnalytics,
    FeedbackResponse,
    RatingFeedback,
    SurveyFeedback,
    OpenEndedFeedback,
    FeatureRequestFeedback,
    BugReportFeedback,
    UsabilityFeedback
} from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for feedback data repository
 */
export interface FeedbackRepository {
    saveFeedback(feedback: Feedback): Promise<void>;
    getFeedback(id: string): Promise<Feedback | null>;
    getAllFeedback(filters?: FeedbackFilter): Promise<Feedback[]>;
    updateFeedback(id: string, updates: Partial<Feedback>): Promise<void>;
    saveFeedbackResponse(response: FeedbackResponse): Promise<void>;
    getFeedbackResponses(feedbackId: string): Promise<FeedbackResponse[]>;
}

/**
 * Feedback filter options
 */
export interface FeedbackFilter {
    userId?: string;
    types?: FeedbackType[];
    triggerPoints?: FeedbackTriggerPoint[];
    status?: FeedbackStatus[];
    priority?: FeedbackPriority[];
    dateFrom?: Date;
    dateTo?: Date;
    assignedTo?: string;
    tags?: string[];
}

/**
 * Feedback system manager
 */
export class FeedbackManager {
    private repository: FeedbackRepository;
    private scheduleConfigs: FeedbackScheduleConfig[] = [];
    private userSession: Record<string, {
        lastFeedbackRequests: Partial<Record<FeedbackTriggerPoint, Date>>;
        sessionCount: number;
        sessionDuration: number;
        completedSimulations: number;
        dismissedFeedbacks: string[];
    }> = {};

    constructor(repository: FeedbackRepository) {
        this.repository = repository;
    }

    /**
     * Add a feedback schedule configuration
     */
    public addScheduleConfig(config: FeedbackScheduleConfig): void {
        this.scheduleConfigs.push(config);
    }

    /**
     * Remove a feedback schedule configuration
     */
    public removeScheduleConfig(trigger: FeedbackTriggerPoint, type: FeedbackType): void {
        this.scheduleConfigs = this.scheduleConfigs.filter(config => 
            !(config.trigger === trigger && config.type === type)
        );
    }

    /**
     * Check if feedback should be shown
     */
    public shouldShowFeedback(userId: string, triggerPoint: FeedbackTriggerPoint): FeedbackScheduleConfig | null {
        const userInfo = this.getUserSessionInfo(userId);
        const now = new Date();
        
        // Find relevant configurations for this trigger point
        const relevantConfigs = this.scheduleConfigs.filter(config => config.trigger === triggerPoint);
        
        if (relevantConfigs.length === 0) {
            return null;
        }
        
        // Check conditions for each configuration
        for (const config of relevantConfigs) {
            const lastRequest = userInfo.lastFeedbackRequests[triggerPoint] || new Date(0);
            const hoursSinceLastRequest = (now.getTime() - lastRequest.getTime()) / (1000 * 60 * 60);
            
            // Check display frequency
            if (hoursSinceLastRequest < config.frequency.minTimeBetween) {
                continue;
            }
            
            // Check additional conditions
            if (
                (config.conditions.minSessionCount !== undefined && userInfo.sessionCount < config.conditions.minSessionCount) ||
                (config.conditions.minUsageDuration !== undefined && userInfo.sessionDuration < config.conditions.minUsageDuration) ||
                (config.conditions.completedSimulations !== undefined && userInfo.completedSimulations < config.conditions.completedSimulations) ||
                (config.conditions.randomSampling !== undefined && Math.random() > config.conditions.randomSampling)
            ) {
                continue;
            }
            
            // Update last display time
            userInfo.lastFeedbackRequests[triggerPoint] = now;
            return config;
        }
        
        return null;
    }

    /**
     * Get user session information
     */
    private getUserSessionInfo(userId: string) {
        if (!this.userSession[userId]) {
            this.userSession[userId] = {
                lastFeedbackRequests: {},
                sessionCount: 0,
                sessionDuration: 0,
                completedSimulations: 0,
                dismissedFeedbacks: []
            };
        }
        return this.userSession[userId];
    }

    /**
     * Update user session data
     */
    public updateUserSession(
        userId: string,
        updates: {
            incrementSession?: boolean;
            incrementDuration?: number;
            incrementSimulations?: number;
            dismissedFeedback?: string;
        }
    ): void {
        const userInfo = this.getUserSessionInfo(userId);
        
        if (updates.incrementSession) {
            userInfo.sessionCount++;
        }
        
        if (updates.incrementDuration) {
            userInfo.sessionDuration += updates.incrementDuration;
        }
        
        if (updates.incrementSimulations) {
            userInfo.completedSimulations += updates.incrementSimulations;
        }
        
        if (updates.dismissedFeedback) {
            userInfo.dismissedFeedbacks.push(updates.dismissedFeedback);
        }
    }

    /**
     * Create a rating feedback
     */
    public async createRatingFeedback(
        userId: string,
        triggerPoint: FeedbackTriggerPoint,
        score: number,
        category: string,
        comment?: string,
        context: Partial<BaseFeedback['context']> = {}
    ): Promise<string> {
        const feedback: RatingFeedback = {
            id: uuidv4(),
            userId,
            timestamp: new Date(),
            type: FeedbackType.RATING,
            triggerPoint,
            status: FeedbackStatus.NEW,
            priority: FeedbackPriority.MEDIUM,
            tags: [category],
            context: this.createContext(context),
            data: { score, category, comment }
        };
        
        await this.repository.saveFeedback(feedback);
        return feedback.id;
    }

    /**
     * Create a survey feedback
     */
    public async createSurveyFeedback(
        userId: string,
        triggerPoint: FeedbackTriggerPoint,
        questions: SurveyFeedback['data']['questions'],
        completionTime?: number,
        context: Partial<BaseFeedback['context']> = {}
    ): Promise<string> {
        const feedback: SurveyFeedback = {
            id: uuidv4(),
            userId,
            timestamp: new Date(),
            type: FeedbackType.SURVEY,
            triggerPoint,
            status: FeedbackStatus.NEW,
            priority: FeedbackPriority.MEDIUM,
            tags: [],
            context: this.createContext(context),
            data: { questions, completionTime }
        };
        
        await this.repository.saveFeedback(feedback);
        return feedback.id;
    }

    /**
     * Create an open-ended feedback
     */
    public async createOpenEndedFeedback(
        userId: string,
        triggerPoint: FeedbackTriggerPoint,
        question: string,
        answer: string,
        sentiment?: 'positive' | 'neutral' | 'negative',
        context: Partial<BaseFeedback['context']> = {}
    ): Promise<string> {
        const feedback: OpenEndedFeedback = {
            id: uuidv4(),
            userId,
            timestamp: new Date(),
            type: FeedbackType.OPEN_ENDED,
            triggerPoint,
            status: FeedbackStatus.NEW,
            priority: FeedbackPriority.MEDIUM,
            tags: [],
            context: this.createContext(context),
            data: { question, answer, sentiment }
        };
        
        await this.repository.saveFeedback(feedback);
        return feedback.id;
    }

    /**
     * Create a feature request
     */
    public async createFeatureRequest(
        userId: string,
        triggerPoint: FeedbackTriggerPoint,
        title: string,
        description: string,
        useCase: string,
        businessValue?: string,
        context: Partial<BaseFeedback['context']> = {}
    ): Promise<string> {
        const feedback: FeatureRequestFeedback = {
            id: uuidv4(),
            userId,
            timestamp: new Date(),
            type: FeedbackType.FEATURE_REQUEST,
            triggerPoint,
            status: FeedbackStatus.NEW,
            priority: FeedbackPriority.MEDIUM,
            tags: [],
            context: this.createContext(context),
            data: {
                title,
                description,
                useCase,
                businessValue,
                voteCount: 1,
                similarRequests: []
            }
        };
        
        await this.repository.saveFeedback(feedback);
        return feedback.id;
    }

    /**
     * Create a bug report
     */
    public async createBugReport(
        userId: string,
        triggerPoint: FeedbackTriggerPoint,
        title: string,
        description: string,
        stepsToReproduce: string[],
        expectedBehavior: string,
        actualBehavior: string,
        severity: 'low' | 'medium' | 'high' | 'critical',
        frequency: 'rare' | 'occasional' | 'frequent' | 'always',
        attachments?: string[],
        context: Partial<BaseFeedback['context']> = {}
    ): Promise<string> {
        const feedback: BugReportFeedback = {
            id: uuidv4(),
            userId,
            timestamp: new Date(),
            type: FeedbackType.BUG_REPORT,
            triggerPoint,
            status: FeedbackStatus.NEW,
            priority: this.mapSeverityToPriority(severity),
            tags: [severity, frequency],
            context: this.createContext(context),
            data: {
                title,
                description,
                stepsToReproduce,
                expectedBehavior,
                actualBehavior,
                severity,
                frequency,
                attachments
            }
        };
        
        await this.repository.saveFeedback(feedback);
        return feedback.id;
    }

    /**
     * Create a usability feedback
     */
    public async createUsabilityFeedback(
        userId: string,
        triggerPoint: FeedbackTriggerPoint,
        issue: string,
        taskAttempted: string,
        difficultyLevel: number,
        suggestion?: string,
        confusionPoints?: string[],
        context: Partial<BaseFeedback['context']> = {}
    ): Promise<string> {
        const feedback: UsabilityFeedback = {
            id: uuidv4(),
            userId,
            timestamp: new Date(),
            type: FeedbackType.USABILITY,
            triggerPoint,
            status: FeedbackStatus.NEW,
            priority: this.mapDifficultyToPriority(difficultyLevel),
            tags: [`difficulty:${difficultyLevel}`],
            context: this.createContext(context),
            data: {
                issue,
                taskAttempted,
                difficultyLevel,
                suggestion,
                confusionPoints
            }
        };
        
        await this.repository.saveFeedback(feedback);
        return feedback.id;
    }

    /**
     * Map bug severity to priority
     */
    private mapSeverityToPriority(severity: string): FeedbackPriority {
        switch (severity) {
            case 'critical': return FeedbackPriority.CRITICAL;
            case 'high': return FeedbackPriority.HIGH;
            case 'medium': return FeedbackPriority.MEDIUM;
            default: return FeedbackPriority.LOW;
        }
    }

    /**
     * Map difficulty level to priority
     */
    private mapDifficultyToPriority(difficultyLevel: number): FeedbackPriority {
        if (difficultyLevel >= 5) return FeedbackPriority.CRITICAL;
        if (difficultyLevel >= 4) return FeedbackPriority.HIGH;
        if (difficultyLevel >= 3) return FeedbackPriority.MEDIUM;
        return FeedbackPriority.LOW;
    }

    /**
     * Create feedback context
     */
    private createContext(partialContext: Partial<BaseFeedback['context']>): BaseFeedback['context'] {
        return {
            url: partialContext.url || window.location.href,
            userAgent: partialContext.userAgent || navigator.userAgent,
            sessionId: partialContext.sessionId || 'unknown-session',
            simulationId: partialContext.simulationId,
            featureId: partialContext.featureId
        };
    }

    /**
     * Update feedback status
     */
    public async updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<void> {
        await this.repository.updateFeedback(id, { status });
    }

    /**
     * Update feedback priority
     */
    public async updateFeedbackPriority(id: string, priority: FeedbackPriority): Promise<void> {
        await this.repository.updateFeedback(id, { priority });
    }

    /**
     * Assign feedback to a user
     */
    public async assignFeedback(id: string, assignedTo: string): Promise<void> {
        await this.repository.updateFeedback(id, { assignedTo });
    }

    /**
     * Add a tag to feedback
     */
    public async addFeedbackTag(id: string, tag: string): Promise<void> {
        const feedback = await this.repository.getFeedback(id);
        if (!feedback) return;
        
        if (!feedback.tags.includes(tag)) {
            await this.repository.updateFeedback(id, {
                tags: [...feedback.tags, tag]
            });
        }
    }

    /**
     * Vote for a feature request
     */
    public async voteForFeatureRequest(id: string): Promise<void> {
        const feedback = await this.repository.getFeedback(id);
        if (!feedback || feedback.type !== FeedbackType.FEATURE_REQUEST) return;
        
        const featureRequest = feedback as FeatureRequestFeedback;
        await this.repository.updateFeedback(id, {
            data: {
                ...featureRequest.data,
                voteCount: featureRequest.data.voteCount + 1
            }
        });
    }

    /**
     * Respond to feedback
     */
    public async respondToFeedback(
        feedbackId: string,
        responseType: 'automated' | 'manual',
        message: string,
        respondentId?: string,
        action?: FeedbackResponse['action']
    ): Promise<void> {
        const response: FeedbackResponse = {
            feedbackId,
            responseType,
            respondentId,
            message,
            timestamp: new Date(),
            action
        };
        
        await this.repository.saveFeedbackResponse(response);
    }

    /**
     * Search feedback
     */
    public async searchFeedback(filters: FeedbackFilter): Promise<Feedback[]> {
        return this.repository.getAllFeedback(filters);
    }

    /**
     * Analyze feedback data
     */
    public async analyzeFeedbackData(dateFrom?: Date, dateTo?: Date): Promise<FeedbackAnalytics> {
        const allFeedback = await this.repository.getAllFeedback({
            dateFrom,
            dateTo
        });
        
        // Create basic analytics structure
        const analytics: FeedbackAnalytics = {
            response: {
                rate: 0,
                avgCompletionTime: 0,
                abandonmentRate: 0
            },
            sentiment: {
                positive: 0,
                neutral: 0,
                negative: 0
            },
            usage: {
                totalSubmissions: allFeedback.length,
                byType: {} as Record<FeedbackType, number>,
                byTriggerPoint: {} as Record<FeedbackTriggerPoint, number>
            },
            trends: {
                daily: {},
                weekly: {},
                monthly: {}
            }
        };
        
        // Initialize counters by type and trigger
        Object.values(FeedbackType).forEach(type => {
            analytics.usage.byType[type] = 0;
        });
        
        Object.values(FeedbackTriggerPoint).forEach(trigger => {
            analytics.usage.byTriggerPoint[trigger] = 0;
        });
        
        // Process data
        allFeedback.forEach(feedback => {
            // Count by type and trigger
            analytics.usage.byType[feedback.type]++;
            analytics.usage.byTriggerPoint[feedback.triggerPoint]++;
            
            // Sentiment analysis
            if (feedback.type === FeedbackType.OPEN_ENDED) {
                const openEndedFeedback = feedback as OpenEndedFeedback;
                if (openEndedFeedback.data.sentiment === 'positive') {
                    analytics.sentiment.positive++;
                } else if (openEndedFeedback.data.sentiment === 'negative') {
                    analytics.sentiment.negative++;
                } else {
                    analytics.sentiment.neutral++;
                }
            } else if (feedback.type === FeedbackType.RATING) {
                const ratingFeedback = feedback as RatingFeedback;
                const score = ratingFeedback.data.score;
                if (score > 3) { // Assuming 1-5 scale
                    analytics.sentiment.positive++;
                } else if (score < 3) {
                    analytics.sentiment.negative++;
                } else {
                    analytics.sentiment.neutral++;
                }
            }
            
            // Trend analysis by time
            const date = feedback.timestamp;
            const dayKey = date.toISOString().split('T')[0];
            const weekKey = this.getWeekKey(date);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            
            analytics.trends.daily[dayKey] = (analytics.trends.daily[dayKey] || 0) + 1;
            analytics.trends.weekly[weekKey] = (analytics.trends.weekly[weekKey] || 0) + 1;
            analytics.trends.monthly[monthKey] = (analytics.trends.monthly[monthKey] || 0) + 1;
        });
        
        // Calculate sentiment percentages
        const totalSentiment = analytics.sentiment.positive + analytics.sentiment.neutral + analytics.sentiment.negative;
        if (totalSentiment > 0) {
            analytics.sentiment.positive = (analytics.sentiment.positive / totalSentiment) * 100;
            analytics.sentiment.neutral = (analytics.sentiment.neutral / totalSentiment) * 100;
            analytics.sentiment.negative = (analytics.sentiment.negative / totalSentiment) * 100;
        }
        
        // Average completion time (for surveys)
        const surveys = allFeedback.filter(f => f.type === FeedbackType.SURVEY) as SurveyFeedback[];
        if (surveys.length > 0) {
            const totalCompletionTime = surveys.reduce((sum, survey) => {
                return sum + (survey.data.completionTime || 0);
            }, 0);
            analytics.response.avgCompletionTime = totalCompletionTime / surveys.length;
        }
        
        return analytics;
    }

    /**
     * Calculate week key from date
     */
    private getWeekKey(date: Date): string {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay()); // Set to beginning of week (Sunday)
        return d.toISOString().split('T')[0];
    }

    /**
     * Find similar feature requests
     */
    public async findSimilarFeatureRequests(title: string, description: string): Promise<FeatureRequestFeedback[]> {
        const allFeatureRequests = await this.repository.getAllFeedback({
            types: [FeedbackType.FEATURE_REQUEST]
        }) as FeatureRequestFeedback[];
        
        // Simple keyword matching logic
        // In a real project, a more advanced information retrieval algorithm would be better
        const keywords = [...title.toLowerCase().split(' '), ...description.toLowerCase().split(' ')]
            .filter(word => word.length > 3); // Remove short words
        
        return allFeatureRequests.filter(request => {
            const requestText = `${request.data.title} ${request.data.description}`.toLowerCase();
            return keywords.some(keyword => requestText.includes(keyword));
        });
    }
}

/**
 * Helper interface for TypeScript type checking
 * Not required functionally, but needed for code correctness
 */
interface BaseFeedback {
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