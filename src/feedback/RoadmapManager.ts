import { RoadmapItem } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * ממשק למאגר נתוני מפת דרכים
 */
export interface RoadmapRepository {
    saveItem(item: RoadmapItem): Promise<void>;
    getItem(id: string): Promise<RoadmapItem | null>;
    getAllItems(filters?: RoadmapFilter): Promise<RoadmapItem[]>;
    updateItem(id: string, updates: Partial<RoadmapItem>): Promise<void>;
    deleteItem(id: string): Promise<void>;
}

/**
 * סינון פריטי מפת דרכים
 */
export interface RoadmapFilter {
    category?: string;
    status?: RoadmapItem['status'][];
    priority?: RoadmapItem['priority'][];
    targetQuarter?: string;
    originatedFrom?: ('user_feedback' | 'team_initiative' | 'business_need')[];
    publiclyVisible?: boolean;
    fromDate?: Date;
    toDate?: Date;
}

/**
 * עדכון במפת הדרכים
 */
interface RoadmapUpdate {
    id: string;
    date: Date;
    userId: string;
    previousStatus?: RoadmapItem['status'];
    newStatus?: RoadmapItem['status'];
    previousPercentComplete?: number;
    newPercentComplete?: number;
    notes?: string;
}

/**
 * מנהל מפת דרכים
 */
export class RoadmapManager {
    private repository: RoadmapRepository;
    private updates: RoadmapUpdate[] = [];

    constructor(repository: RoadmapRepository) {
        this.repository = repository;
    }

    /**
     * יצירת פריט חדש במפת הדרכים
     */
    public async createRoadmapItem(
        title: string,
        description: string,
        category: string,
        priority: RoadmapItem['priority'],
        targetQuarter: string,
        estimatedReleaseDate?: Date,
        originatedFrom: ('user_feedback' | 'team_initiative' | 'business_need')[] = ['team_initiative'],
        feedbackIds: string[] = [],
        features: RoadmapItem['features'] = [],
        publiclyVisible: boolean = true,
        notes?: string
    ): Promise<string> {
        const item: RoadmapItem = {
            id: uuidv4(),
            title,
            description,
            category,
            status: 'planned',
            priority,
            targetQuarter,
            estimatedReleaseDate,
            originatedFrom,
            feedbackIds,
            percentComplete: 0,
            features,
            publiclyVisible,
            notes
        };

        await this.repository.saveItem(item);
        this.recordUpdate({
            id: item.id,
            date: new Date(),
            userId: 'system',
            newStatus: 'planned',
            newPercentComplete: 0,
            notes: 'פריט נוצר'
        });

        return item.id;
    }

    /**
     * עדכון פריט במפת הדרכים
     */
    public async updateRoadmapItem(
        id: string,
        updates: Partial<RoadmapItem>,
        userId: string,
        updateNotes?: string
    ): Promise<void> {
        const item = await this.repository.getItem(id);
        if (!item) {
            throw new Error(`פריט מפת דרכים עם מזהה ${id} לא נמצא`);
        }

        // תיעוד השינוי
        const roadmapUpdate: RoadmapUpdate = {
            id,
            date: new Date(),
            userId
        };

        if (updates.status !== undefined && updates.status !== item.status) {
            roadmapUpdate.previousStatus = item.status;
            roadmapUpdate.newStatus = updates.status;
        }

        if (updates.percentComplete !== undefined && updates.percentComplete !== item.percentComplete) {
            roadmapUpdate.previousPercentComplete = item.percentComplete;
            roadmapUpdate.newPercentComplete = updates.percentComplete;
        }

        if (updateNotes) {
            roadmapUpdate.notes = updateNotes;
        }

        await this.repository.updateItem(id, updates);
        this.recordUpdate(roadmapUpdate);
    }

    /**
     * הוספת תכונה לפריט מפת דרכים
     */
    public async addFeatureToRoadmapItem(
        roadmapId: string,
        title: string,
        description: string,
        userId: string
    ): Promise<void> {
        const item = await this.repository.getItem(roadmapId);
        if (!item) {
            throw new Error(`פריט מפת דרכים עם מזהה ${roadmapId} לא נמצא`);
        }

        const newFeature = {
            title,
            description,
            status: 'planned' as const
        };

        const updatedFeatures = [...item.features, newFeature];
        await this.repository.updateItem(roadmapId, {
            features: updatedFeatures
        });

        this.recordUpdate({
            id: roadmapId,
            date: new Date(),
            userId,
            notes: `תכונה חדשה נוספה: ${title}`
        });
    }

    /**
     * עדכון סטטוס תכונה בפריט מפת דרכים
     */
    public async updateFeatureStatus(
        roadmapId: string,
        featureTitle: string,
        status: 'planned' | 'in_progress' | 'completed',
        userId: string
    ): Promise<void> {
        const item = await this.repository.getItem(roadmapId);
        if (!item) {
            throw new Error(`פריט מפת דרכים עם מזהה ${roadmapId} לא נמצא`);
        }

        const updatedFeatures = [...item.features];
        const featureIndex = updatedFeatures.findIndex(f => f.title === featureTitle);
        
        if (featureIndex === -1) {
            throw new Error(`תכונה עם כותרת "${featureTitle}" לא נמצאה בפריט מפת הדרכים`);
        }

        updatedFeatures[featureIndex] = {
            ...updatedFeatures[featureIndex],
            status
        };

        await this.repository.updateItem(roadmapId, {
            features: updatedFeatures
        });

        this.recordUpdate({
            id: roadmapId,
            date: new Date(),
            userId,
            notes: `סטטוס תכונה "${featureTitle}" עודכן ל-${status}`
        });

        // עדכון אחוז השלמה של הפריט
        await this.recalculateItemCompletion(roadmapId);
    }

    /**
     * חישוב מחדש של אחוז ההשלמה של פריט
     */
    private async recalculateItemCompletion(itemId: string): Promise<void> {
        const item = await this.repository.getItem(itemId);
        if (!item) return;

        if (item.features.length === 0) return;

        // ספירת תכונות לפי סטטוס
        const completedFeatures = item.features.filter(f => f.status === 'completed').length;
        const inProgressFeatures = item.features.filter(f => f.status === 'in_progress').length;
        
        // חישוב אחוז השלמה
        const percentComplete = Math.round(
            ((completedFeatures + (inProgressFeatures * 0.5)) / item.features.length) * 100
        );

        if (percentComplete !== item.percentComplete) {
            await this.repository.updateItem(itemId, { percentComplete });
        }

        // עדכון סטטוס הפריט בהתאם להתקדמות
        let newStatus = item.status;
        if (percentComplete === 100 && item.status !== 'completed') {
            newStatus = 'completed';
        } else if (percentComplete > 0 && percentComplete < 100 && item.status === 'planned') {
            newStatus = 'in_progress';
        }

        if (newStatus !== item.status) {
            await this.repository.updateItem(itemId, { status: newStatus });
        }
    }

    /**
     * קישור משוב לפריט במפת הדרכים
     */
    public async linkFeedbackToRoadmapItem(
        roadmapId: string,
        feedbackId: string,
        userId: string
    ): Promise<void> {
        const item = await this.repository.getItem(roadmapId);
        if (!item) {
            throw new Error(`פריט מפת דרכים עם מזהה ${roadmapId} לא נמצא`);
        }

        if (!item.feedbackIds) {
            item.feedbackIds = [];
        }

        if (!item.feedbackIds.includes(feedbackId)) {
            const updatedFeedbackIds = [...item.feedbackIds, feedbackId];
            await this.repository.updateItem(roadmapId, {
                feedbackIds: updatedFeedbackIds
            });

            this.recordUpdate({
                id: roadmapId,
                date: new Date(),
                userId,
                notes: `משוב עם מזהה ${feedbackId} קושר לפריט`
            });
        }
    }

    /**
     * עדכון תאריך שחרור משוער
     */
    public async updateEstimatedReleaseDate(
        roadmapId: string,
        estimatedReleaseDate: Date,
        userId: string,
        reason?: string
    ): Promise<void> {
        const item = await this.repository.getItem(roadmapId);
        if (!item) {
            throw new Error(`פריט מפת דרכים עם מזהה ${roadmapId} לא נמצא`);
        }

        await this.repository.updateItem(roadmapId, { estimatedReleaseDate });

        let notes = `תאריך שחרור משוער עודכן ל-${estimatedReleaseDate.toLocaleDateString()}`;
        if (reason) {
            notes += ` - סיבה: ${reason}`;
        }

        this.recordUpdate({
            id: roadmapId,
            date: new Date(),
            userId,
            notes
        });
    }

    /**
     * דחיית פריט במפת הדרכים
     */
    public async delayRoadmapItem(
        roadmapId: string,
        newTargetQuarter: string,
        newEstimatedReleaseDate: Date | null,
        reason: string,
        userId: string
    ): Promise<void> {
        const item = await this.repository.getItem(roadmapId);
        if (!item) {
            throw new Error(`פריט מפת דרכים עם מזהה ${roadmapId} לא נמצא`);
        }

        const updates: Partial<RoadmapItem> = {
            status: 'delayed',
            targetQuarter: newTargetQuarter
        };

        if (newEstimatedReleaseDate) {
            updates.estimatedReleaseDate = newEstimatedReleaseDate;
        } else {
            updates.estimatedReleaseDate = undefined;
        }

        await this.repository.updateItem(roadmapId, updates);

        this.recordUpdate({
            id: roadmapId,
            date: new Date(),
            userId,
            previousStatus: item.status,
            newStatus: 'delayed',
            notes: `פריט נדחה לרבעון ${newTargetQuarter} - סיבה: ${reason}`
        });
    }

    /**
     * מחיקת פריט ממפת הדרכים
     */
    public async deleteRoadmapItem(roadmapId: string, userId: string, reason: string): Promise<void> {
        const item = await this.repository.getItem(roadmapId);
        if (!item) {
            throw new Error(`פריט מפת דרכים עם מזהה ${roadmapId} לא נמצא`);
        }

        await this.repository.deleteItem(roadmapId);

        this.recordUpdate({
            id: roadmapId,
            date: new Date(),
            userId,
            previousStatus: item.status,
            notes: `פריט נמחק מהמפה - סיבה: ${reason}`
        });
    }

    /**
     * קבלת עדכונים להיסטוריית השינויים
     */
    private recordUpdate(update: RoadmapUpdate): void {
        this.updates.push(update);
    }

    /**
     * קבלת היסטוריית שינויים לפריט
     */
    public getItemHistory(itemId: string): RoadmapUpdate[] {
        return this.updates
            .filter(update => update.id === itemId)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * קבלת מפת הדרכים הציבורית
     */
    public async getPublicRoadmap(): Promise<RoadmapItem[]> {
        return this.repository.getAllItems({
            publiclyVisible: true
        });
    }

    /**
     * קבלת פריטים לפי קטגוריה
     */
    public async getItemsByCategory(category: string): Promise<RoadmapItem[]> {
        return this.repository.getAllItems({ category });
    }

    /**
     * קבלת פריטים לפי רבעון
     */
    public async getItemsByQuarter(targetQuarter: string): Promise<RoadmapItem[]> {
        return this.repository.getAllItems({ targetQuarter });
    }

    /**
     * קבלת פריטים ממשוב
     */
    public async getItemsFromFeedback(feedbackId: string): Promise<RoadmapItem[]> {
        const allItems = await this.repository.getAllItems();
        return allItems.filter(item => 
            item.feedbackIds && item.feedbackIds.includes(feedbackId)
        );
    }

    /**
     * חיפוש פריטים לפי מילת מפתח
     */
    public async searchRoadmap(keyword: string): Promise<RoadmapItem[]> {
        const allItems = await this.repository.getAllItems();
        const lowerKeyword = keyword.toLowerCase();
        
        return allItems.filter(item => {
            return (
                item.title.toLowerCase().includes(lowerKeyword) ||
                item.description.toLowerCase().includes(lowerKeyword) ||
                item.notes?.toLowerCase().includes(lowerKeyword) ||
                item.features.some(f => 
                    f.title.toLowerCase().includes(lowerKeyword) || 
                    f.description.toLowerCase().includes(lowerKeyword)
                )
            );
        });
    }

    /**
     * קבלת סיכום מצב מפת הדרכים
     */
    public async getRoadmapSummary(): Promise<{
        totalItems: number;
        byStatus: Record<RoadmapItem['status'], number>;
        byQuarter: Record<string, number>;
        byCategory: Record<string, number>;
        upcomingReleases: { id: string; title: string; date: Date }[];
        recentlyCompleted: { id: string; title: string; percentComplete: number }[];
    }> {
        const allItems = await this.repository.getAllItems();
        
        // ספירה לפי סטטוס
        const byStatus: Record<RoadmapItem['status'], number> = {
            'planned': 0,
            'in_progress': 0,
            'completed': 0,
            'delayed': 0
        };
        
        // ספירה לפי רבעון
        const byQuarter: Record<string, number> = {};
        
        // ספירה לפי קטגוריה
        const byCategory: Record<string, number> = {};
        
        // איסוף נתונים
        allItems.forEach(item => {
            // ספירה לפי סטטוס
            byStatus[item.status]++;
            
            // ספירה לפי רבעון
            byQuarter[item.targetQuarter] = (byQuarter[item.targetQuarter] || 0) + 1;
            
            // ספירה לפי קטגוריה
            byCategory[item.category] = (byCategory[item.category] || 0) + 1;
        });
        
        // פריטים קרובים לשחרור
        const now = new Date();
        const upcomingReleases = allItems
            .filter(item => 
                item.estimatedReleaseDate && 
                item.estimatedReleaseDate > now && 
                item.status !== 'completed'
            )
            .sort((a, b) => 
                (a.estimatedReleaseDate?.getTime() || 0) - (b.estimatedReleaseDate?.getTime() || 0)
            )
            .slice(0, 5)
            .map(item => ({
                id: item.id,
                title: item.title,
                date: item.estimatedReleaseDate as Date
            }));
        
        // פריטים שהושלמו לאחרונה
        const recentlyCompleted = allItems
            .filter(item => item.status === 'completed')
            .sort((a, b) => b.percentComplete - a.percentComplete)
            .slice(0, 5)
            .map(item => ({
                id: item.id,
                title: item.title,
                percentComplete: item.percentComplete
            }));
        
        return {
            totalItems: allItems.length,
            byStatus,
            byQuarter,
            byCategory,
            upcomingReleases,
            recentlyCompleted
        };
    }
} 