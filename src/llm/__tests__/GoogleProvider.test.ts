import { GoogleProvider } from '../providers/GoogleProvider';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GoogleProvider', () => {
    let provider: GoogleProvider;
    const apiKey = 'test-api-key';

    beforeEach(() => {
        provider = new GoogleProvider(apiKey);
        jest.clearAllMocks();
    });

    describe('generate', () => {
        it('should generate text successfully', async () => {
            const mockResponse = {
                data: {
                    candidates: [{
                        content: {
                            parts: [{
                                text: 'תשובה לדוגמה'
                            }]
                        },
                        finishReason: 'STOP'
                    }],
                    usage: {
                        promptTokenCount: 20,
                        completionTokenCount: 22
                    }
                }
            };

            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await provider.generate('שאלה לדוגמה');

            expect(response).toEqual({
                text: 'תשובה לדוגמה',
                tokensUsed: 42,
                processingTime: 22,
                success: true,
                metadata: {
                    model: 'gemini-pro',
                    finishReason: 'STOP'
                }
            });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
                {
                    contents: [{ parts: [{ text: 'שאלה לדוגמה' }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000
                    }
                },
                {
                    headers: {
                        'x-goog-api-key': apiKey,
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
                    embedding: {
                        values: [0.1, 0.2, 0.3]
                    },
                    usage: {
                        promptTokenCount: 5,
                        completionTokenCount: 5
                    }
                }
            };

            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await provider.getEmbeddings('טקסט לדוגמה');

            expect(response).toEqual({
                embeddings: [0.1, 0.2, 0.3],
                tokensUsed: 5,
                processingTime: 5,
                success: true
            });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent',
                {
                    text: 'טקסט לדוגמה'
                },
                {
                    headers: {
                        'x-goog-api-key': apiKey,
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
                'https://generativelanguage.googleapis.com/v1/models',
                {
                    headers: {
                        'x-goog-api-key': apiKey
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
        it('should return model limits for gemini-pro', async () => {
            const limits = await provider.getModelLimits('gemini-pro');

            expect(limits).toEqual({
                maxTokens: 2048,
                maxContextLength: 32768,
                maxBatchSize: 1
            });
        });

        it('should return default model limits for unknown model', async () => {
            const limits = await provider.getModelLimits('unknown-model');

            expect(limits).toEqual({
                maxTokens: 2048,
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