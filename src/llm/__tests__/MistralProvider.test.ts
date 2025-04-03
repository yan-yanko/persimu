import { MistralProvider } from '../providers/MistralProvider';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MistralProvider', () => {
    let provider: MistralProvider;
    const apiKey = 'test-api-key';

    beforeEach(() => {
        provider = new MistralProvider(apiKey);
        jest.clearAllMocks();
    });

    describe('generate', () => {
        it('should generate text successfully', async () => {
            const mockResponse = {
                data: {
                    choices: [{
                        message: {
                            content: 'תשובה לדוגמה'
                        },
                        finish_reason: 'stop'
                    }],
                    usage: {
                        total_tokens: 42,
                        completion_tokens: 21
                    }
                }
            };

            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await provider.generate('שאלה לדוגמה');

            expect(response).toEqual({
                text: 'תשובה לדוגמה',
                tokensUsed: 42,
                processingTime: 21,
                success: true,
                metadata: {
                    model: 'mistral-small',
                    finishReason: 'stop'
                }
            });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: 'mistral-small',
                    messages: [{ role: 'user', content: 'שאלה לדוגמה' }],
                    temperature: 0.7,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
        });

        it('should handle errors', async () => {
            const errorMessage = 'שגיאת API';
            mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

            await expect(provider.generate('test')).rejects.toThrow(`שגיאה: ${errorMessage}`);
        });
    });

    describe('getEmbeddings', () => {
        it('should get embeddings successfully', async () => {
            const mockResponse = {
                data: {
                    data: [{
                        embedding: [0.1, 0.2, 0.3]
                    }],
                    usage: {
                        total_tokens: 10,
                        prompt_tokens: 5
                    }
                }
            };

            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await provider.getEmbeddings('טקסט לדוגמה');

            expect(response).toEqual({
                embeddings: [0.1, 0.2, 0.3],
                tokensUsed: 10,
                processingTime: 5,
                success: true
            });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.mistral.ai/v1/embeddings',
                {
                    model: 'mistral-embed',
                    input: 'טקסט לדוגמה'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
        });

        it('should handle errors', async () => {
            const errorMessage = 'שגיאת API';
            mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

            await expect(provider.getEmbeddings('test')).rejects.toThrow(`שגיאה: ${errorMessage}`);
        });
    });

    describe('validateConnection', () => {
        it('should validate connection successfully', async () => {
            mockedAxios.get.mockResolvedValueOnce({});

            const isValid = await provider.validateConnection();

            expect(isValid).toBe(true);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://api.mistral.ai/v1/models',
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    },
                    timeout: 30000
                }
            );
        });

        it('should return false on connection error', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('שגיאת חיבור'));

            const isValid = await provider.validateConnection();

            expect(isValid).toBe(false);
        });
    });

    describe('getPricing', () => {
        it('should return pricing information', async () => {
            const pricing = await provider.getPricing();

            expect(pricing).toEqual({
                costPerToken: 0.0005,
                costPerEmbedding: 0.00005,
                currency: 'USD'
            });
        });
    });

    describe('getModelLimits', () => {
        it('should return model limits for mistral-small', async () => {
            const limits = await provider.getModelLimits('mistral-small');

            expect(limits).toEqual({
                maxTokens: 4096,
                maxContextLength: 32768,
                maxBatchSize: 1
            });
        });

        it('should return default model limits for unknown model', async () => {
            const limits = await provider.getModelLimits('unknown-model');

            expect(limits).toEqual({
                maxTokens: 4096,
                maxContextLength: 32768,
                maxBatchSize: 1
            });
        });
    });

    describe('getLanguageSupport', () => {
        it('should return full support for any language', async () => {
            const support = await provider.getLanguageSupport('he');
            expect(support).toBe(1);
        });
    });
}); 