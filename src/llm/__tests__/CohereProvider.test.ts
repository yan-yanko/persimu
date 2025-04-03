import { CohereProvider } from '../providers/CohereProvider';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CohereProvider', () => {
    let provider: CohereProvider;
    const apiKey = 'test-api-key';

    beforeEach(() => {
        provider = new CohereProvider(apiKey);
        jest.clearAllMocks();
    });

    describe('generate', () => {
        it('should generate text successfully', async () => {
            const mockResponse = {
                data: {
                    generations: [{
                        text: 'תשובה לדוגמה',
                        finish_reason: 'complete'
                    }],
                    meta: {
                        billed_tokens: 42,
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
                    model: 'command',
                    finishReason: 'complete'
                }
            });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.cohere.ai/v1/generate',
                {
                    model: 'command',
                    prompt: 'שאלה לדוגמה',
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
                    embeddings: [[0.1, 0.2, 0.3]],
                    meta: {
                        billed_tokens: 10,
                        completion_tokens: 5
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
                'https://api.cohere.ai/v1/embed',
                {
                    model: 'embed-english-v3.0',
                    texts: ['טקסט לדוגמה']
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
                'https://api.cohere.ai/v1/models',
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
                costPerToken: 0.001,
                costPerEmbedding: 0.0001,
                currency: 'USD'
            });
        });
    });

    describe('getModelLimits', () => {
        it('should return model limits for command', async () => {
            const limits = await provider.getModelLimits('command');

            expect(limits).toEqual({
                maxTokens: 4096,
                maxContextLength: 4096,
                maxBatchSize: 1
            });
        });

        it('should return default model limits for unknown model', async () => {
            const limits = await provider.getModelLimits('unknown-model');

            expect(limits).toEqual({
                maxTokens: 4096,
                maxContextLength: 4096,
                maxBatchSize: 1
            });
        });
    });

    describe('getLanguageSupport', () => {
        it('should return full support for English', async () => {
            const support = await provider.getLanguageSupport('en');
            expect(support).toBe(1);
        });

        it('should return partial support for other languages', async () => {
            const support = await provider.getLanguageSupport('he');
            expect(support).toBe(0.5);
        });
    });
}); 