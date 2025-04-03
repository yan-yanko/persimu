import { OpenAIProvider } from '../providers/OpenAIProvider';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import { InternalAxiosRequestConfig } from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenAIProvider', () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
        provider = new OpenAIProvider('test-api-key');
    });

    describe('generate', () => {
        it('should generate text successfully', async () => {
            const mockResponse: AxiosResponse = {
                data: {
                    choices: [{
                        message: {
                            content: 'תשובה לדוגמה'
                        },
                        finish_reason: 'stop'
                    }],
                    usage: {
                        total_tokens: 10,
                        completion_tokens: 5,
                        prompt_tokens: 5
                    },
                    model: 'gpt-3.5-turbo'
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig
            };

            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await provider.generate('שאלה לדוגמה');

            expect(response.text).toBe('תשובה לדוגמה');
            expect(response.success).toBeTruthy();
            expect(response.tokensUsed).toBe(10);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.openai.com/v1/chat/completions',
                expect.any(Object),
                expect.any(Object)
            );
        });

        it('should handle errors gracefully', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('שגיאת API'));

            const response = await provider.generate('שאלה לדוגמה');

            expect(response.success).toBeFalsy();
            expect(response.error).toBe('שגיאת API');
        });
    });

    describe('getEmbeddings', () => {
        it('should get embeddings successfully', async () => {
            const mockResponse: AxiosResponse = {
                data: {
                    data: [{
                        embedding: [0.1, 0.2, 0.3]
                    }],
                    usage: {
                        total_tokens: 5,
                        prompt_tokens: 5
                    }
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig
            };

            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await provider.getEmbeddings('טקסט לדוגמה');

            expect(response.embeddings).toEqual([0.1, 0.2, 0.3]);
            expect(response.success).toBeTruthy();
            expect(response.tokensUsed).toBe(5);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.openai.com/v1/embeddings',
                expect.any(Object),
                expect.any(Object)
            );
        });

        it('should handle errors gracefully', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('שגיאת API'));

            const response = await provider.getEmbeddings('טקסט לדוגמה');

            expect(response.success).toBeFalsy();
            expect(response.error).toBe('שגיאת API');
        });
    });

    describe('validateConnection', () => {
        it('should validate connection successfully', async () => {
            const mockResponse: AxiosResponse = {
                data: {},
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig
            };

            mockedAxios.get.mockResolvedValueOnce(mockResponse);

            const isValid = await provider.validateConnection();

            expect(isValid).toBeTruthy();
            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://api.openai.com/v1/models',
                expect.any(Object)
            );
        });

        it('should return false on connection error', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('שגיאת חיבור'));

            const isValid = await provider.validateConnection();

            expect(isValid).toBeFalsy();
        });
    });

    describe('getPricing', () => {
        it('should return correct pricing information', () => {
            const pricing = provider.getPricing();

            expect(pricing.costPerToken).toBe(0.002);
            expect(pricing.costPerEmbedding).toBe(0.0001);
            expect(pricing.currency).toBe('USD');
            expect(pricing.monthlyQuota).toBe(1000000);
            expect(pricing.currentMonthlyCost).toBe(0);
        });
    });

    describe('getModelLimits', () => {
        it('should return correct limits for known models', () => {
            const limits = provider.getModelLimits('gpt-4');

            expect(limits.maxTokens).toBe(8192);
            expect(limits.maxContextLength).toBe(8192);
        });

        it('should return default limits for unknown models', () => {
            const limits = provider.getModelLimits('unknown-model');

            expect(limits.maxTokens).toBe(1000);
            expect(limits.maxContextLength).toBe(1000);
        });
    });

    describe('getLanguageSupport', () => {
        it('should return correct language support scores', () => {
            const support = provider.getLanguageSupport();

            expect(support.he).toBe(0.9);
            expect(support.en).toBe(1.0);
            expect(support.ar).toBe(0.8);
        });
    });
}); 