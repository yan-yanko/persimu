import { BaseProvider } from './BaseProvider';
import { LLMConfig, LLMResponse, EmbeddingResponse, Pricing, LanguageSupport } from '../types';
import axios from 'axios';

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        total_tokens: number;
        completion_tokens: number;
        prompt_tokens: number;
    };
    model: string;
}

interface OpenAIEmbeddingResponse {
    data: Array<{
        embedding: number[];
    }>;
    usage: {
        total_tokens: number;
        prompt_tokens: number;
    };
}

/**
 * ספק OpenAI
 */
export class OpenAIProvider extends BaseProvider {
    private readonly baseUrl: string;

    constructor(apiKey: string) {
        super(
            apiKey,
            'openai',
            'OpenAI',
            'ספק מודלי שפה של OpenAI',
            ['gpt-4', 'gpt-3.5-turbo'],
            'gpt-3.5-turbo'
        );
        this.baseUrl = 'https://api.openai.com/v1';
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
                `${this.baseUrl}/chat/completions`,
                {
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: config?.temperature || 0.7,
                    max_tokens: config?.maxTokens || 1000,
                    ...config?.additionalParams
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                }
            );

            const endTime = Date.now();
            return {
                text: response.data.choices[0].message.content,
                tokensUsed: response.data.usage.total_tokens,
                processingTime: endTime - startTime,
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
    public async getEmbeddings(text: string, model = 'text-embedding-ada-002'): Promise<EmbeddingResponse> {
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
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                }
            );

            const endTime = Date.now();
            return {
                embeddings: response.data.data[0].embedding,
                tokensUsed: response.data.usage.total_tokens,
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
                        'Authorization': `Bearer ${this.apiKey}`
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
            costPerToken: 0.002,
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
            'gpt-4': { maxTokens: 8192, maxContextLength: 8192 },
            'gpt-3.5-turbo': { maxTokens: 4096, maxContextLength: 4096 },
            'text-davinci-003': { maxTokens: 4000, maxContextLength: 4000 }
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
} 