import { BaseProvider } from './BaseProvider';
import { LLMConfig, LLMResponse, EmbeddingResponse, Pricing, LanguageSupport } from '../types';
import axios from 'axios';

interface AnthropicResponse {
    completion: string;
    stop_reason: string;
    model: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

interface AnthropicEmbeddingResponse {
    embeddings: number[][];
    usage: {
        input_tokens: number;
    };
}

/**
 * ספק Anthropic
 */
export class AnthropicProvider extends BaseProvider {
    private readonly baseUrl: string;

    constructor(apiKey: string) {
        super(
            apiKey,
            'anthropic',
            'Anthropic',
            'ספק מודלי שפה של Anthropic',
            ['claude-3-opus', 'claude-3-sonnet'],
            'claude-3-sonnet'
        );
        this.baseUrl = 'https://api.anthropic.com/v1';
    }

    /**
     * שליחת prompt לקבלת תגובה
     */
    public async generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse> {
        const model = config?.model || this.defaultModel;
        this.validateModel(model);

        try {
            const startTime = Date.now();
            const response = await axios.post(
                `${this.baseUrl}/messages`,
                {
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: config?.temperature || 0.7,
                    max_tokens: config?.maxTokens || 1000,
                    ...config?.additionalParams
                },
                {
                    headers: {
                        'x-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                }
            );

            const endTime = Date.now();
            return {
                text: response.data.content[0].text,
                tokensUsed: response.data.usage.input_tokens + response.data.usage.output_tokens,
                processingTime: endTime - startTime,
                success: true
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
    public async getEmbeddings(text: string, model = 'claude-3-sonnet'): Promise<EmbeddingResponse> {
        try {
            const startTime = Date.now();
            const response = await axios.post(
                `${this.baseUrl}/embeddings`,
                {
                    model,
                    input: text
                },
                {
                    headers: {
                        'x-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                }
            );

            const endTime = Date.now();
            return {
                embeddings: response.data.embedding,
                tokensUsed: response.data.usage.input_tokens,
                processingTime: endTime - startTime,
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
            await axios.get(
                `${this.baseUrl}/models`,
                {
                    headers: {
                        'x-api-key': this.apiKey
                    },
                    timeout: this.timeout
                }
            );
            this.isAvailable = true;
            return true;
        } catch (error) {
            this.isAvailable = false;
            return false;
        }
    }

    /**
     * קבלת מידע על עלויות
     */
    public getPricing(): Pricing {
        return {
            costPerToken: 0.003,
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
            'claude-3-opus': { maxTokens: 4096, maxContextLength: 200000 },
            'claude-3-sonnet': { maxTokens: 4096, maxContextLength: 200000 },
            'claude-3-haiku': { maxTokens: 4096, maxContextLength: 200000 }
        };

        return limits[model] || { maxTokens: 1000, maxContextLength: 1000 };
    }

    /**
     * בדיקת תמיכה בשפה
     */
    public getLanguageSupport(): LanguageSupport {
        return {
            he: 0.85,
            en: 1.0,
            ar: 0.75
        };
    }
} 