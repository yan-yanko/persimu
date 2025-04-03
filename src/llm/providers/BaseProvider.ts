import { LLMProvider, LLMConfig, LLMResponse, EmbeddingResponse, ModelLimits, LanguageSupport, Pricing } from '../types';

/**
 * מחלקה בסיסית לספקי מודלי שפה
 */
export abstract class BaseProvider implements LLMProvider {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly models: string[];
    public readonly defaultModel: string;
    protected readonly apiKey: string;
    protected isAvailable: boolean;
    protected currentUsage: number;
    protected monthlyQuota: number;
    protected readonly maxRetries: number;
    protected readonly timeout: number;

    constructor(
        apiKey: string,
        id: string,
        name: string,
        description: string,
        models: string[],
        defaultModel: string,
        monthlyQuota = 1000000,
        maxRetries = 3,
        timeout = 30000
    ) {
        this.apiKey = apiKey;
        this.id = id;
        this.name = name;
        this.description = description;
        this.models = models;
        this.defaultModel = defaultModel;
        this.isAvailable = false;
        this.currentUsage = 0;
        this.monthlyQuota = monthlyQuota;
        this.maxRetries = maxRetries;
        this.timeout = timeout;
    }

    /**
     * שם הספק
     */
    public abstract generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse>;

    /**
     * תיאור הספק
     */
    public abstract getEmbeddings(text: string, model?: string): Promise<EmbeddingResponse>;

    /**
     * בדיקת תקינות חיבור
     */
    public abstract validateConnection(): Promise<boolean>;

    /**
     * קבלת מידע על עלויות
     */
    public getPricing(): Pricing {
        return {
            costPerToken: 0.002,
            costPerEmbedding: 0.0001,
            currency: 'USD',
            monthlyQuota: this.monthlyQuota,
            currentMonthlyCost: this.currentUsage * 0.002
        };
    }

    /**
     * בדיקת מגבלות מודל
     */
    public getModelLimits(model: string): ModelLimits {
        const limits: Record<string, ModelLimits> = {
            'gpt-4': { maxTokens: 8192, maxContextLength: 8192 },
            'gpt-3.5-turbo': { maxTokens: 4096, maxContextLength: 4096 },
            'claude-3-opus': { maxTokens: 200000, maxContextLength: 200000 },
            'claude-3-sonnet': { maxTokens: 200000, maxContextLength: 200000 },
            'command': { maxTokens: 4096, maxContextLength: 4096 },
            'command-light': { maxTokens: 4096, maxContextLength: 4096 },
            'command-nightly': { maxTokens: 4096, maxContextLength: 4096 },
            'command-light-nightly': { maxTokens: 4096, maxContextLength: 4096 },
            'gemini-pro': { maxTokens: 32768, maxContextLength: 32768 },
            'gemini-pro-vision': { maxTokens: 32768, maxContextLength: 32768 },
            'mistral-tiny': { maxTokens: 8192, maxContextLength: 8192 },
            'mistral-small': { maxTokens: 32768, maxContextLength: 32768 },
            'mistral-medium': { maxTokens: 32768, maxContextLength: 32768 },
            'mistral-large': { maxTokens: 32768, maxContextLength: 32768 }
        };

        return limits[model] || { maxTokens: 1000, maxContextLength: 1000 };
    }

    /**
     * בדיקת תמיכה בשפה
     */
    public getLanguageSupport(): LanguageSupport {
        return {
            he: 0.9,
            en: 1.0,
            ar: 0.8
        };
    }

    /**
     * טיפול בשגיאות
     */
    protected handleError(error: any): never {
        if (error.response) {
            throw new Error(`שגיאת שרת: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
            throw new Error('לא התקבלה תשובה מהשרת');
        } else {
            throw new Error(`שגיאה: ${error.message}`);
        }
    }

    /**
     * ניסיון חוזר במקרה של כישלון
     */
    protected async retry<T>(
        operation: () => Promise<T>,
        retries: number = this.maxRetries
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }

        throw lastError;
    }

    /**
     * בדיקת תקינות מודל
     */
    protected validateModel(model: string): void {
        if (!this.models.includes(model)) {
            throw new Error(`מודל ${model} אינו נתמך. מודלים נתמכים: ${this.models.join(', ')}`);
        }
    }
} 