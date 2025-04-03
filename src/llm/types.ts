/**
 * תצורת מודל שפה
 */
export interface LLMConfig {
    /**
     * שם המודל לשימוש
     */
    model: string;

    /**
     * טמפרטורה - שליטה ברמת היצירתיות (0-1)
     */
    temperature: number;

    /**
     * מספר מקסימלי של טוקנים בתגובה
     */
    maxTokens: number;

    /**
     * מספר מקסימלי של טוקנים בקונטקסט
     */
    maxContextLength: number;

    /**
     * מספר מקסימלי של ניסיונות במקרה של כישלון
     */
    maxRetries: number;

    /**
     * זמן מקסימלי להמתנה לתגובה (במילישניות)
     */
    timeout: number;

    /**
     * פרמטרים נוספים ספציפיים למודל
     */
    additionalParams?: Record<string, unknown>;
}

/**
 * תשובה ממודל שפה
 */
export interface LLMResponse {
    /**
     * הטקסט שנוצר
     */
    text: string;

    /**
     * מספר הטוקנים בשימוש
     */
    tokensUsed: number;

    /**
     * זמן עיבוד (במילישניות)
     */
    processingTime: number;

    /**
     * האם התגובה הושלמה בהצלחה
     */
    success: boolean;

    /**
     * הודעת שגיאה במקרה של כישלון
     */
    error?: string;

    /**
     * מטא-דאטה נוסף מהמודל
     */
    metadata?: Record<string, unknown>;
}

/**
 * תשובת embeddings
 */
export interface EmbeddingResponse {
    /**
     * וקטור ה-embeddings
     */
    embeddings: number[];

    /**
     * מספר הטוקנים בשימוש
     */
    tokensUsed: number;

    /**
     * זמן עיבוד (במילישניות)
     */
    processingTime: number;

    /**
     * האם התגובה הושלמה בהצלחה
     */
    success: boolean;

    /**
     * הודעת שגיאה במקרה של כישלון
     */
    error?: string;
}

/**
 * מדדי ביצועים של מודל
 */
export interface ModelPerformance {
    /**
     * זמן תגובה ממוצע (במילישניות)
     */
    averageResponseTime: number;

    /**
     * אחוז הצלחה
     */
    successRate: number;

    /**
     * מספר טוקנים ממוצע בשימוש
     */
    averageTokensUsed: number;

    /**
     * עלות ממוצעת לשימוש
     */
    averageCost: number;

    /**
     * תמיכה בשפות שונות
     */
    languageSupport: Record<string, number>;
}

/**
 * מגבלות מודל
 */
export interface ModelLimits {
    /**
     * מספר מקסימלי של טוקנים
     */
    maxTokens: number;

    /**
     * אורך מקסימלי של קונטקסט
     */
    maxContextLength: number;
}

/**
 * תמיכה בשפות
 */
export interface LanguageSupport {
    /**
     * תמיכה בעברית
     */
    he: number;

    /**
     * תמיכה באנגלית
     */
    en: number;

    /**
     * תמיכה בערבית
     */
    ar: number;
}

/**
 * עלויות שימוש
 */
export interface Pricing {
    /**
     * עלות לטוקן
     */
    costPerToken: number;

    /**
     * עלות ל-embedding
     */
    costPerEmbedding: number;

    /**
     * מטבע
     */
    currency: string;

    /**
     * מכסה חודשית
     */
    monthlyQuota: number;

    /**
     * עלות חודשית נוכחית
     */
    currentMonthlyCost: number;
}

/**
 * ממשק ספק מודל שפה
 */
export interface LLMProvider {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly models: string[];
    readonly defaultModel: string;

    generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse>;
    getEmbeddings(text: string, model?: string): Promise<EmbeddingResponse>;
    validateConnection(): Promise<boolean>;
    getPricing(): Pricing;
    getModelLimits(model: string): ModelLimits;
    getLanguageSupport(): LanguageSupport;
} 