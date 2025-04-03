import { UserInterviewPlan } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * מודל ראיון משתמש
 */
interface UserInterview {
    id: string;
    planId: string;
    userId: string;
    interviewerName: string;
    status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
    scheduledDate: Date;
    actualDuration?: number; // בדקות
    recordings?: string[];
    notes?: string;
    insights: string[];
    feedbackIds: string[];
    answers: Array<{
        questionId: string;
        answer: string | number | boolean | string[];
        notes?: string;
    }>;
}

/**
 * ממשק למאגר נתוני ראיונות
 */
export interface UserInterviewRepository {
    savePlan(plan: UserInterviewPlan): Promise<void>;
    getPlan(id: string): Promise<UserInterviewPlan | null>;
    getAllPlans(active?: boolean): Promise<UserInterviewPlan[]>;
    updatePlan(id: string, updates: Partial<UserInterviewPlan>): Promise<void>;
    
    saveInterview(interview: UserInterview): Promise<void>;
    getInterview(id: string): Promise<UserInterview | null>;
    getInterviewsByPlan(planId: string): Promise<UserInterview[]>;
    getInterviewsByUser(userId: string): Promise<UserInterview[]>;
    updateInterview(id: string, updates: Partial<UserInterview>): Promise<void>;
}

/**
 * מנהל ראיונות משתמשים
 */
export class UserInterviewManager {
    private repository: UserInterviewRepository;

    constructor(repository: UserInterviewRepository) {
        this.repository = repository;
    }

    /**
     * יצירת תכנית ראיונות חדשה
     */
    public async createInterviewPlan(
        title: string,
        goal: string,
        targetUserCount: number,
        criteria: string[],
        segments: string[],
        startDate: Date,
        endDate: Date,
        durationMinutes: number,
        intervalDays: number,
        incentiveType: 'monetary' | 'product_credit' | 'access_to_features',
        incentiveValue: string,
        incentiveDescription: string,
        questions: Array<{
            text: string;
            type: 'open' | 'scenario' | 'task' | 'rating';
            purpose: string;
            estimatedTimeMinutes: number;
        }>,
        materials: string[] = [],
        notes: string = ''
    ): Promise<string> {
        const plan: UserInterviewPlan = {
            id: uuidv4(),
            title,
            goal,
            targetUsers: {
                count: targetUserCount,
                criteria,
                segments
            },
            schedule: {
                startDate,
                endDate,
                intervalDays,
                durationMinutes
            },
            incentives: {
                type: incentiveType,
                value: incentiveValue,
                description: incentiveDescription
            },
            questions: questions.map(q => ({
                id: uuidv4(),
                ...q
            })),
            materials,
            notes
        };

        await this.repository.savePlan(plan);
        return plan.id;
    }

    /**
     * עדכון תכנית ראיונות
     */
    public async updateInterviewPlan(
        planId: string,
        updates: Partial<UserInterviewPlan>
    ): Promise<void> {
        await this.repository.updatePlan(planId, updates);
    }

    /**
     * הוספת שאלה לתכנית ראיונות
     */
    public async addQuestionToPlan(
        planId: string,
        text: string,
        type: 'open' | 'scenario' | 'task' | 'rating',
        purpose: string,
        estimatedTimeMinutes: number
    ): Promise<string> {
        const plan = await this.repository.getPlan(planId);
        if (!plan) {
            throw new Error(`תכנית ראיונות עם מזהה ${planId} לא נמצאה`);
        }

        const questionId = uuidv4();
        const newQuestion = {
            id: questionId,
            text,
            type,
            purpose,
            estimatedTimeMinutes
        };

        plan.questions.push(newQuestion);
        await this.repository.updatePlan(planId, {
            questions: plan.questions
        });

        return questionId;
    }

    /**
     * הסרת שאלה מתכנית ראיונות
     */
    public async removeQuestionFromPlan(planId: string, questionId: string): Promise<void> {
        const plan = await this.repository.getPlan(planId);
        if (!plan) {
            throw new Error(`תכנית ראיונות עם מזהה ${planId} לא נמצאה`);
        }

        const updatedQuestions = plan.questions.filter(q => q.id !== questionId);
        if (updatedQuestions.length === plan.questions.length) {
            throw new Error(`שאלה עם מזהה ${questionId} לא נמצאה בתכנית`);
        }

        await this.repository.updatePlan(planId, {
            questions: updatedQuestions
        });
    }

    /**
     * תזמון ראיון משתמש חדש
     */
    public async scheduleInterview(
        planId: string,
        userId: string,
        interviewerName: string,
        scheduledDate: Date
    ): Promise<string> {
        const plan = await this.repository.getPlan(planId);
        if (!plan) {
            throw new Error(`תכנית ראיונות עם מזהה ${planId} לא נמצאה`);
        }

        // בדיקה שהתאריך המתוזמן בטווח של תכנית הראיונות
        if (scheduledDate < plan.schedule.startDate || scheduledDate > plan.schedule.endDate) {
            throw new Error(`התאריך המבוקש מחוץ לטווח של תכנית הראיונות`);
        }

        const interview: UserInterview = {
            id: uuidv4(),
            planId,
            userId,
            interviewerName,
            status: 'scheduled',
            scheduledDate,
            insights: [],
            feedbackIds: [],
            answers: []
        };

        await this.repository.saveInterview(interview);
        return interview.id;
    }

    /**
     * עדכון סטטוס ראיון
     */
    public async updateInterviewStatus(
        interviewId: string,
        status: UserInterview['status'],
        actualDuration?: number
    ): Promise<void> {
        const updates: Partial<UserInterview> = { status };
        
        if (status === 'completed' && actualDuration) {
            updates.actualDuration = actualDuration;
        }
        
        await this.repository.updateInterview(interviewId, updates);
    }

    /**
     * הוספת תשובה לשאלה בראיון
     */
    public async addAnswerToInterview(
        interviewId: string,
        questionId: string,
        answer: string | number | boolean | string[],
        notes?: string
    ): Promise<void> {
        const interview = await this.repository.getInterview(interviewId);
        if (!interview) {
            throw new Error(`ראיון עם מזהה ${interviewId} לא נמצא`);
        }

        const plan = await this.repository.getPlan(interview.planId);
        if (!plan) {
            throw new Error(`תכנית ראיונות עם מזהה ${interview.planId} לא נמצאה`);
        }

        // בדיקה שהשאלה קיימת בתכנית
        const questionExists = plan.questions.some(q => q.id === questionId);
        if (!questionExists) {
            throw new Error(`שאלה עם מזהה ${questionId} לא נמצאה בתכנית`);
        }

        // בדיקה אם כבר יש תשובה לשאלה זו ועדכונה, אחרת הוספת תשובה חדשה
        const existingAnswerIndex = interview.answers.findIndex(a => a.questionId === questionId);
        if (existingAnswerIndex !== -1) {
            interview.answers[existingAnswerIndex] = {
                questionId,
                answer,
                notes
            };
        } else {
            interview.answers.push({
                questionId,
                answer,
                notes
            });
        }

        await this.repository.updateInterview(interviewId, {
            answers: interview.answers
        });
    }

    /**
     * הוספת תובנה מראיון
     */
    public async addInsightToInterview(
        interviewId: string,
        insight: string
    ): Promise<void> {
        const interview = await this.repository.getInterview(interviewId);
        if (!interview) {
            throw new Error(`ראיון עם מזהה ${interviewId} לא נמצא`);
        }

        if (!interview.insights.includes(insight)) {
            interview.insights.push(insight);
            await this.repository.updateInterview(interviewId, {
                insights: interview.insights
            });
        }
    }

    /**
     * הוספת פידבק שנוצר מראיון
     */
    public async addFeedbackToInterview(
        interviewId: string,
        feedbackId: string
    ): Promise<void> {
        const interview = await this.repository.getInterview(interviewId);
        if (!interview) {
            throw new Error(`ראיון עם מזהה ${interviewId} לא נמצא`);
        }

        if (!interview.feedbackIds.includes(feedbackId)) {
            interview.feedbackIds.push(feedbackId);
            await this.repository.updateInterview(interviewId, {
                feedbackIds: interview.feedbackIds
            });
        }
    }

    /**
     * הוספת הקלטות וחומרים לראיון
     */
    public async addRecordingsToInterview(
        interviewId: string,
        recordings: string[]
    ): Promise<void> {
        const interview = await this.repository.getInterview(interviewId);
        if (!interview) {
            throw new Error(`ראיון עם מזהה ${interviewId} לא נמצא`);
        }

        const currentRecordings = interview.recordings || [];
        const updatedRecordings = [...currentRecordings, ...recordings];

        await this.repository.updateInterview(interviewId, {
            recordings: updatedRecordings
        });
    }

    /**
     * הוספת הערות לראיון
     */
    public async addNotesToInterview(
        interviewId: string,
        notes: string
    ): Promise<void> {
        await this.repository.updateInterview(interviewId, { notes });
    }

    /**
     * קבלת כל הראיונות בתכנית
     */
    public async getInterviewsByPlan(planId: string): Promise<UserInterview[]> {
        return this.repository.getInterviewsByPlan(planId);
    }

    /**
     * קבלת כל הראיונות של משתמש
     */
    public async getInterviewsByUser(userId: string): Promise<UserInterview[]> {
        return this.repository.getInterviewsByUser(userId);
    }

    /**
     * קבלת סיכום תכנית ראיונות
     */
    public async getPlanSummary(planId: string): Promise<{
        plan: UserInterviewPlan;
        totalInterviews: number;
        completedInterviews: number;
        canceledInterviews: number;
        noShowInterviews: number;
        averageDuration: number;
        insights: string[];
        feedbackCount: number;
        completionRate: number;
    }> {
        const plan = await this.repository.getPlan(planId);
        if (!plan) {
            throw new Error(`תכנית ראיונות עם מזהה ${planId} לא נמצאה`);
        }

        const interviews = await this.repository.getInterviewsByPlan(planId);
        
        const totalInterviews = interviews.length;
        const completedInterviews = interviews.filter(i => i.status === 'completed').length;
        const canceledInterviews = interviews.filter(i => i.status === 'canceled').length;
        const noShowInterviews = interviews.filter(i => i.status === 'no_show').length;
        
        // חישוב משך זמן ממוצע של ראיונות שהושלמו
        const completedInterviewsWithDuration = interviews
            .filter(i => i.status === 'completed' && i.actualDuration !== undefined);
        
        const totalDuration = completedInterviewsWithDuration
            .reduce((sum, interview) => sum + (interview.actualDuration || 0), 0);
        
        const averageDuration = completedInterviewsWithDuration.length > 0
            ? totalDuration / completedInterviewsWithDuration.length
            : 0;
        
        // איסוף כל התובנות מהראיונות
        const allInsights = interviews
            .flatMap(interview => interview.insights);
        
        // הסרת תובנות כפולות
        const uniqueInsights = [...new Set(allInsights)];
        
        // ספירת סך הכל פידבקים שנוצרו
        const feedbackCount = interviews
            .reduce((sum, interview) => sum + interview.feedbackIds.length, 0);
        
        // שיעור השלמה (רק ראיונות שהושלמו מתוך אלו שתוזמנו)
        const completionRate = totalInterviews > 0
            ? (completedInterviews / totalInterviews) * 100
            : 0;
        
        return {
            plan,
            totalInterviews,
            completedInterviews,
            canceledInterviews,
            noShowInterviews,
            averageDuration,
            insights: uniqueInsights,
            feedbackCount,
            completionRate
        };
    }
} 