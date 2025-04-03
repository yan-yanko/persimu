import { LLMConfig, LLMResponse, EmbeddingResponse } from '../types';

/**
 * ממשק בסיסי לכל ספק מודל שפה
 */
export interface LLMProvider {
    /**
     * מזהה ייחודי של הספק
     */
    readonly id: string;

    /**
     * שם הספק
     */
    readonly name: string;

    /**
     * תיאור הספק
     */
    readonly description: string;

    /**
     * רשימת המודלים הזמינים
     */
    readonly availableModels: string[];

    /**
     * שליחת prompt לקבלת תגובה
     */
    generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse>;

    /**
     * קבלת embeddings עבור טקסט
     */
    getEmbeddings(text: string, model?: string): Promise<EmbeddingResponse>;

    /**
     * בדיקת תקינות החיבור לספק
     */
    validateConnection(): Promise<boolean>;

    /**
     * קבלת מידע על עלויות שימוש
     */
    getPricingInfo(): Promise<{
        costPerToken: number;
        costPerEmbedding: number;
        currency: string;
    }>;

    /**
     * קבלת מידע על מגבלות המודל
     */
    getModelLimits(model: string): Promise<{
        maxTokens: number;
        maxContextLength: number;
        maxBatchSize: number;
    }>;
} 