import { BaseProvider } from './BaseProvider';
import { LLMConfig, LLMResponse, EmbeddingResponse, Pricing, LanguageSupport } from '../types';
import axios from 'axios';

interface MistralResponse {
    choices: Array<{
        message: {
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    model: string;
}

interface MistralEmbeddingResponse {
    data: Array<{
        embedding: number[];
        index: number;
    }>;
    usage: {
        prompt_tokens: number;
    };
    model: string;
}

/**
 * ספק Mistral
 */
export class MistralProvider extends BaseProvider {
    private readonly baseUrl: string;

    constructor(apiKey: string) {
        super(
            apiKey,
            'mistral',
            'Mistral',
            'ספק מודלי שפה של Mistral',
            ['mistral-large', 'mistral-medium', 'mistral-small'],
            'mistral-medium'
        );
        this.baseUrl = 'https://api.mistral.ai/v1';
    }

    /**
     * שליחת prompt לקבלת תגובה
     */
    public async generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse> {
        try {
            const response = await axios.post<MistralResponse>(
                `${this.baseUrl}/chat/completions`,
                {
                    model: config?.model || this.defaultModel,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: config?.temperature || 0.7,
                    max_tokens: config?.maxTokens || 1000,
                    ...config?.additionalParams
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                text: response.data.choices[0].message.content,
                tokensUsed: response.data.usage.total_tokens,
                processingTime: 0, // Mistral לא מספק זמן עיבוד
                success: true,
                metadata: {
                    model: response.data.model,
                    finishReason: response.data.choices[0].finish_reason
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
    public async getEmbeddings(text: string, model: string = 'mistral-embed'): Promise<EmbeddingResponse> {
        try {
            const response = await axios.post<MistralEmbeddingResponse>(
                `${this.baseUrl}/embeddings`,
                {
                    model,
                    input: text
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                embeddings: response.data.data[0].embedding,
                tokensUsed: response.data.usage.prompt_tokens,
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
                    'Authorization': `Bearer ${this.apiKey}`
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
            costPerToken: 0.0007,
            costPerEmbedding: 0.00007,
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
            'mistral-large': { maxTokens: 8192, maxContextLength: 32768 },
            'mistral-medium': { maxTokens: 4096, maxContextLength: 32768 },
            'mistral-small': { maxTokens: 4096, maxContextLength: 32768 }
        };

        return limits[model] || { maxTokens: 1000, maxContextLength: 1000 };
    }

    /**
     * בדיקת תמיכה בשפה
     */
    public getLanguageSupport(): LanguageSupport {
        return {
            he: 0.75,
            en: 1.0,
            ar: 0.65
        };
    }
} 