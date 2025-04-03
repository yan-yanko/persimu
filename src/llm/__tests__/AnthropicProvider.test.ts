import { AnthropicProvider } from '../providers/AnthropicProvider';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AnthropicProvider', () => {
    let provider: AnthropicProvider;
    const apiKey = 'test-api-key';

    beforeEach(() => {
        provider = new AnthropicProvider(apiKey);
        jest.clearAllMocks();
    });

    describe('generate', () => {
        it('should generate text successfully', async () => {
            const mockResponse = {
                data: {
                    content: [{
                        text: 'תשובה לדוגמה'
                    }],
                    usage: {
                        input_tokens: 20,
                        output_tokens: 22
                    },
                    stop_reason: 'end_turn'
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
                    model: 'claude-3-sonnet-20240229',
                    finishReason: 'end_turn'
                }
            });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.anthropic.com/v1/messages',
                {
                    model: 'claude-3-sonnet-20240229',
                    messages: [{ role: 'user', content: 'שאלה לדוגמה' }],
                    temperature: 0.7,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
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
                    embedding: [0.1, 0.2, 0.3],
                    usage: {
                        input_tokens: 5,
                        output_tokens: 5
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
                'https://api.anthropic.com/v1/embeddings',
                {
                    model: 'claude-3-sonnet-20240229',
                    input: 'טקסט לדוגמה'
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
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
                'https://api.anthropic.com/v1/models',
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
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
                costPerToken: 0.003,
                costPerEmbedding: 0.0002,
                currency: 'USD'
            });
        });
    });

    describe('getModelLimits', () => {
        it('should return model limits for claude-3-opus', async () => {
            const limits = await provider.getModelLimits('claude-3-opus-20240229');

            expect(limits).toEqual({
                maxTokens: 4096,
                maxContextLength: 200000,
                maxBatchSize: 1
            });
        });

        it('should return default model limits for unknown model', async () => {
            const limits = await provider.getModelLimits('unknown-model');

            expect(limits).toEqual({
                maxTokens: 4096,
                maxContextLength: 200000,
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