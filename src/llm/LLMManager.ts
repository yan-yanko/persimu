import { LLMProvider, LLMConfig, LLMResponse, EmbeddingResponse, ModelPerformance, UsageCosts } from './types';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { CohereProvider } from './providers/CohereProvider';
import { GoogleProvider } from './providers/GoogleProvider';
import { MistralProvider } from './providers/MistralProvider';

/**
 * מנהל ספקי מודלי שפה
 */
export class LLMManager {
    private providers: Map<string, LLMProvider>;
    private activeProvider: LLMProvider | null;
    private connectionPool: Map<string, number>;
    private performanceMetrics: Map<string, ModelPerformance>;
    private usageCosts: Map<string, UsageCosts>;

    constructor() {
        this.providers = new Map();
        this.activeProvider = null;
        this.connectionPool = new Map();
        this.performanceMetrics = new Map();
        this.usageCosts = new Map();

        // אתחול ספקים
        this.initializeProviders();
    }

    /**
     * אתחול ספקי מודלים
     */
    private initializeProviders(): void {
        // הוספת ספקים
        this.addProvider(new OpenAIProvider(process.env.OPENAI_API_KEY || ''));
        this.addProvider(new AnthropicProvider(process.env.ANTHROPIC_API_KEY || ''));
        this.addProvider(new CohereProvider(process.env.COHERE_API_KEY || ''));
        this.addProvider(new GoogleProvider(process.env.GOOGLE_API_KEY || ''));
        this.addProvider(new MistralProvider(process.env.MISTRAL_API_KEY || ''));
    }

    /**
     * הוספת ספק חדש
     */
    public addProvider(provider: LLMProvider): void {
        this.providers.set(provider.id, provider);
        this.connectionPool.set(provider.id, 0);
        this.performanceMetrics.set(provider.id, {
            averageResponseTime: 0,
            successRate: 0,
            averageTokensUsed: 0,
            averageCost: 0,
            languageSupport: {}
        });
    }

    /**
     * בחירת המודל המתאים ביותר למשימה
     */
    public async selectBestModel(task: {
        complexity: number;
        language: string;
        maxCost?: number;
        requiredFeatures?: string[];
    }): Promise<LLMProvider> {
        let bestProvider: LLMProvider | null = null;
        let bestScore = -1;

        for (const provider of this.providers.values()) {
            const score = await this.calculateProviderScore(provider, task);
            if (score > bestScore) {
                bestScore = score;
                bestProvider = provider;
            }
        }

        if (!bestProvider) {
            throw new Error('לא נמצא מודל מתאים למשימה');
        }

        this.activeProvider = bestProvider;
        return bestProvider;
    }

    /**
     * חישוב ציון לספק עבור משימה ספציפית
     */
    private async calculateProviderScore(
        provider: LLMProvider,
        task: {
            complexity: number;
            language: string;
            maxCost?: number;
            requiredFeatures?: string[];
        }
    ): Promise<number> {
        const performance = this.performanceMetrics.get(provider.id);
        const costs = this.usageCosts.get(provider.id);

        if (!performance || !costs) {
            throw new Error(`נתוני ביצועים או עלויות חסרים עבור ספק ${provider.id}`);
        }

        // חישוב ציון לפי פרמטרים שונים
        const languageScore = performance.languageSupport[task.language] || 0;
        const costScore = task.maxCost ? 
            Math.max(0, 1 - (costs.costPerToken / task.maxCost)) : 1;
        const performanceScore = performance.successRate * (1 / (1 + performance.averageResponseTime / 1000));

        // שקלול הציונים
        return (
            languageScore * 0.4 +
            costScore * 0.3 +
            performanceScore * 0.3
        );
    }

    /**
     * שליחת prompt לקבלת תגובה
     */
    public async generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse> {
        if (!this.activeProvider) {
            throw new Error('לא נבחר מודל פעיל');
        }

        try {
            const startTime = Date.now();
            const response = await this.activeProvider.generate(prompt, config);
            const endTime = Date.now();

            // עדכון מדדי ביצועים
            this.updatePerformanceMetrics(this.activeProvider.id, {
                responseTime: endTime - startTime,
                success: response.success,
                tokensUsed: response.tokensUsed
            });

            return response;
        } catch (error) {
            // במקרה של כישלון, ננסה מודל חלופי
            return this.handleFallback(prompt, config);
        }
    }

    /**
     * טיפול במקרה של כישלון - ניסיון מודל חלופי
     */
    private async handleFallback(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse> {
        const fallbackProviders = Array.from(this.providers.values())
            .filter(p => p.id !== this.activeProvider?.id);

        for (const provider of fallbackProviders) {
            try {
                return await provider.generate(prompt, config);
            } catch (error) {
                continue;
            }
        }

        throw new Error('כל המודלים נכשלו');
    }

    /**
     * עדכון מדדי ביצועים
     */
    private updatePerformanceMetrics(
        providerId: string,
        metrics: {
            responseTime: number;
            success: boolean;
            tokensUsed: number;
        }
    ): void {
        const performance = this.performanceMetrics.get(providerId);
        const currentCount = this.connectionPool.get(providerId);

        if (!performance || currentCount === undefined) {
            throw new Error(`נתוני ביצועים או מונה חיבורים חסרים עבור ספק ${providerId}`);
        }

        // עדכון ממוצעים
        performance.averageResponseTime = 
            (performance.averageResponseTime * currentCount + metrics.responseTime) / (currentCount + 1);
        performance.successRate = 
            (performance.successRate * currentCount + (metrics.success ? 1 : 0)) / (currentCount + 1);
        performance.averageTokensUsed = 
            (performance.averageTokensUsed * currentCount + metrics.tokensUsed) / (currentCount + 1);

        // עדכון מונה חיבורים
        this.connectionPool.set(providerId, currentCount + 1);
    }

    /**
     * קבלת embeddings
     */
    public async getEmbeddings(text: string, model?: string): Promise<EmbeddingResponse> {
        if (!this.activeProvider) {
            throw new Error('לא נבחר מודל פעיל');
        }

        return this.activeProvider.getEmbeddings(text, model);
    }

    /**
     * קבלת מידע על ביצועי מודל
     */
    public getModelPerformance(providerId: string): ModelPerformance {
        const performance = this.performanceMetrics.get(providerId);
        if (!performance) {
            throw new Error(`לא נמצא מידע על ביצועים עבור ספק ${providerId}`);
        }
        return performance;
    }

    /**
     * קבלת מידע על עלויות שימוש
     */
    public getUsageCosts(providerId: string): UsageCosts {
        const costs = this.usageCosts.get(providerId);
        if (!costs) {
            throw new Error(`לא נמצא מידע על עלויות עבור ספק ${providerId}`);
        }
        return costs;
    }

    /**
     * בדיקת תקינות חיבור לספק
     */
    public async validateProviderConnection(providerId: string): Promise<boolean> {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new Error(`לא נמצא ספק ${providerId}`);
        }
        return provider.validateConnection();
    }
} 