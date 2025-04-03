import { BaseProvider } from './BaseProvider';
import { LLMConfig, LLMResponse, EmbeddingResponse, Pricing, LanguageSupport } from '../types';
import axios from 'axios';

interface GoogleResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
        finishReason: string;
        tokenCount: {
            totalTokens: number;
            promptTokens: number;
            generatedTokens: number;
        };
    }>;
    modelId: string;
}

interface GoogleEmbeddingResponse {
    embeddings: Array<{
        values: number[];
        statistics: {
            truncated: boolean;
            tokenCount: number;
        };
    }>;
}

/**
 * ספק Google
 */
export class GoogleProvider extends BaseProvider {
    private readonly baseUrl: string;

    constructor(apiKey: string) {
        super(
            apiKey,
            'google',
            'Google',
            'ספק מודלי שפה של Google',
            ['gemini-pro', 'gemini-pro-vision', 'text-bison'],
            'gemini-pro'
        );
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
    }

    /**
     * שליחת prompt לקבלת תגובה
     */
    public async generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse> {
        try {
            const response = await axios.post<GoogleResponse>(
                `${this.baseUrl}/models/${config?.model || this.defaultModel}:generateContent`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: config?.temperature || 0.7,
                        maxOutputTokens: config?.maxTokens || 1000,
                        ...config?.additionalParams
                    }
                },
                {
                    headers: {
                        'x-goog-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                text: response.data.candidates[0].content.parts[0].text,
                tokensUsed: response.data.candidates[0].tokenCount.totalTokens,
                processingTime: 0, // Google לא מספק זמן עיבוד
                success: true,
                metadata: {
                    model: response.data.modelId,
                    finishReason: response.data.candidates[0].finishReason
                }
            };
        } catch (error) {
            return {
                text: '',
                tokensUsed: 0,
                processingTime: 0,
                success: false,
                error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
            };
        }
    }

    /**
     * קבלת embeddings
     */
    public async getEmbeddings(text: string, model: string = 'embedding-001'): Promise<EmbeddingResponse> {
        try {
            const response = await axios.post<GoogleEmbeddingResponse>(
                `${this.baseUrl}/models/${model}:embedContent`,
                {
                    content: {
                        parts: [{
                            text: text
                        }]
                    }
                },
                {
                    headers: {
                        'x-goog-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                embeddings: response.data.embeddings[0].values,
                tokensUsed: response.data.embeddings[0].statistics.tokenCount,
                processingTime: 0,
                success: true
            };
        } catch (error) {
            return {
                embeddings: [],
                tokensUsed: 0,
                processingTime: 0,
                success: false,
                error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
            };
        }
    }

    /**
     * בדיקת תקינות חיבור
     */
    public async validateConnection(): Promise<boolean> {
        try {
            await axios.get(`${this.baseUrl}/models`, {
                headers: {
                    'x-goog-api-key': this.apiKey
                }
            });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * קבלת מידע על עלויות
     */
    public getPricing(): Pricing {
        return {
            costPerToken: 0.001,
            costPerEmbedding: 0.0001,
            currency: 'USD',
            monthlyQuota: 1000000,
            currentMonthlyCost: 0
        };
    }

    /**
     * בדיקת מגבלות מודל
     */
    public getModelLimits(model: string): { maxTokens: number; maxContextLength: number } {
        const limits: Record<string, { maxTokens: number; maxContextLength: number }> = {
            'gemini-pro': { maxTokens: 8192, maxContextLength: 32768 },
            'gemini-pro-vision': { maxTokens: 4096, maxContextLength: 16384 },
            'text-bison': { maxTokens: 8192, maxContextLength: 8192 }
        };

        return limits[model] || { maxTokens: 1000, maxContextLength: 1000 };
    }

    /**
     * בדיקת תמיכה בשפה
     */
    public getLanguageSupport(): LanguageSupport {
        return {
            he: 0.8,
            en: 1.0,
            ar: 0.7
        };
    }
} 