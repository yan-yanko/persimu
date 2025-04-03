import { BaseProvider } from './BaseProvider';
import { LLMConfig, LLMResponse, EmbeddingResponse, Pricing, LanguageSupport } from '../types';
import axios from 'axios';

interface CohereResponse {
    text: string;
    finish_reason: string;
    model: string;
    meta: {
        api_version: string;
        billed_units: {
            input_tokens: number;
            output_tokens: number;
        };
    };
}

interface CohereEmbeddingResponse {
    embeddings: number[][];
    meta: {
        api_version: string;
        billed_units: {
            input_tokens: number;
        };
    };
}

/**
 * ספק Cohere
 */
export class CohereProvider extends BaseProvider {
    private readonly baseUrl: string;

    constructor(apiKey: string) {
        super(
            apiKey,
            'cohere',
            'Cohere',
            'ספק מודלי שפה של Cohere',
            ['command', 'command-light', 'command-nightly'],
            'command'
        );
        this.baseUrl = 'https://api.cohere.ai/v1';
    }

    /**
     * שליחת prompt לקבלת תגובה
     */
    public async generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse> {
        try {
            const response = await axios.post<CohereResponse>(
                `${this.baseUrl}/generate`,
                {
                    model: config?.model || this.defaultModel,
                    prompt,
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
                text: response.data.text,
                tokensUsed: response.data.meta.billed_units.input_tokens + response.data.meta.billed_units.output_tokens,
                processingTime: 0, // Cohere לא מספק זמן עיבוד
                success: true,
                metadata: {
                    model: response.data.model,
                    finishReason: response.data.finish_reason,
                    apiVersion: response.data.meta.api_version
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
    public async getEmbeddings(text: string, model: string = 'embed-english-v3.0'): Promise<EmbeddingResponse> {
        try {
            const response = await axios.post<CohereEmbeddingResponse>(
                `${this.baseUrl}/embed`,
                {
                    model,
                    texts: [text],
                    truncate: 'END'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                embeddings: response.data.embeddings[0],
                tokensUsed: response.data.meta.billed_units.input_tokens,
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
            costPerToken: 0.0015,
            costPerEmbedding: 0.00015,
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
            'command': { maxTokens: 4096, maxContextLength: 4096 },
            'command-light': { maxTokens: 2048, maxContextLength: 2048 },
            'command-nightly': { maxTokens: 4096, maxContextLength: 8192 }
        };

        return limits[model] || { maxTokens: 1000, maxContextLength: 1000 };
    }

    /**
     * בדיקת תמיכה בשפה
     */
    public getLanguageSupport(): LanguageSupport {
        return {
            he: 0.7,
            en: 1.0,
            ar: 0.6
        };
    }
} 