import { LLMManager } from '../LLMManager';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { AnthropicProvider } from '../providers/AnthropicProvider';
import { CohereProvider } from '../providers/CohereProvider';
import { GoogleProvider } from '../providers/GoogleProvider';
import { MistralProvider } from '../providers/MistralProvider';

jest.mock('../providers/OpenAIProvider');
jest.mock('../providers/AnthropicProvider');
jest.mock('../providers/CohereProvider');
jest.mock('../providers/GoogleProvider');
jest.mock('../providers/MistralProvider');

describe('LLMManager', () => {
    let manager: LLMManager;
    let openaiProvider: jest.Mocked<OpenAIProvider>;
    let anthropicProvider: jest.Mocked<AnthropicProvider>;
    let cohereProvider: jest.Mocked<CohereProvider>;
    let googleProvider: jest.Mocked<GoogleProvider>;
    let mistralProvider: jest.Mocked<MistralProvider>;

    beforeEach(() => {
        manager = new LLMManager();
        openaiProvider = new OpenAIProvider('test-key') as jest.Mocked<OpenAIProvider>;
        anthropicProvider = new AnthropicProvider('test-key') as jest.Mocked<AnthropicProvider>;
        cohereProvider = new CohereProvider('test-key') as jest.Mocked<CohereProvider>;
        googleProvider = new GoogleProvider('test-key') as jest.Mocked<GoogleProvider>;
        mistralProvider = new MistralProvider('test-key') as jest.Mocked<MistralProvider>;
    });

    describe('addProvider', () => {
        it('should add a provider successfully', () => {
            manager.addProvider(openaiProvider);
            expect(manager['providers'].has('openai')).toBeTruthy();
        });

        it('should not add duplicate providers', () => {
            manager.addProvider(openaiProvider);
            manager.addProvider(openaiProvider);
            expect(manager['providers'].size).toBe(1);
        });
    });

    describe('selectBestModel', () => {
        beforeEach(() => {
            manager.addProvider(openaiProvider);
            manager.addProvider(anthropicProvider);
            manager.addProvider(cohereProvider);
            manager.addProvider(googleProvider);
            manager.addProvider(mistralProvider);
        });

        it('should select the best model based on language support', async () => {
            openaiProvider.getLanguageSupport.mockReturnValue({ 'he': 0.9, 'en': 1.0 });
            anthropicProvider.getLanguageSupport.mockReturnValue({ 'he': 0.85, 'en': 1.0 });
            cohereProvider.getLanguageSupport.mockReturnValue({ 'he': 0.7, 'en': 1.0 });
            googleProvider.getLanguageSupport.mockReturnValue({ 'he': 0.8, 'en': 1.0 });
            mistralProvider.getLanguageSupport.mockReturnValue({ 'he': 0.75, 'en': 1.0 });

            const provider = await manager.selectBestModel({
                complexity: 0.5,
                language: 'he',
                maxCost: 0.01
            });

            expect(provider.id).toBe('openai');
        });

        it('should select the best model based on cost', async () => {
            openaiProvider.getPricing.mockReturnValue({
                costPerToken: 0.002,
                costPerEmbedding: 0.0001,
                currency: 'USD',
                monthlyQuota: 1000000,
                currentMonthlyCost: 0
            });
            mistralProvider.getPricing.mockReturnValue({
                costPerToken: 0.0007,
                costPerEmbedding: 0.00007,
                currency: 'USD',
                monthlyQuota: 1000000,
                currentMonthlyCost: 0
            });

            const provider = await manager.selectBestModel({
                complexity: 0.5,
                language: 'en',
                maxCost: 0.001
            });

            expect(provider.id).toBe('mistral');
        });

        it('should throw error when no providers are available', async () => {
            manager = new LLMManager();
            await expect(manager.selectBestModel({
                complexity: 0.5,
                language: 'he',
                maxCost: 0.01
            })).rejects.toThrow('לא נמצא מודל מתאים למשימה');
        });
    });

    describe('generate', () => {
        beforeEach(() => {
            manager.addProvider(openaiProvider);
            openaiProvider.generate.mockResolvedValue({
                text: 'תשובה לדוגמה',
                tokensUsed: 10,
                processingTime: 100,
                success: true
            });
        });

        it('should generate text successfully', async () => {
            const response = await manager.generate('שאלה לדוגמה');
            expect(response.text).toBe('תשובה לדוגמה');
            expect(response.success).toBeTruthy();
        });

        it('should throw error when no active provider is set', async () => {
            manager = new LLMManager();
            await expect(manager.generate('שאלה לדוגמה')).rejects.toThrow('לא נבחר מודל פעיל');
        });

        it('should try fallback providers on failure', async () => {
            manager.addProvider(anthropicProvider);
            openaiProvider.generate.mockRejectedValue(new Error('שגיאה'));
            anthropicProvider.generate.mockResolvedValue({
                text: 'תשובה מספק חלופי',
                tokensUsed: 10,
                processingTime: 100,
                success: true
            });

            const response = await manager.generate('שאלה לדוגמה');
            expect(response.text).toBe('תשובה מספק חלופי');
            expect(response.success).toBeTruthy();
        });
    });

    describe('getEmbeddings', () => {
        beforeEach(() => {
            manager.addProvider(openaiProvider);
            openaiProvider.getEmbeddings.mockResolvedValue({
                embeddings: [0.1, 0.2, 0.3],
                tokensUsed: 5,
                processingTime: 50,
                success: true
            });
        });

        it('should get embeddings successfully', async () => {
            const response = await manager.getEmbeddings('טקסט לדוגמה');
            expect(response.embeddings).toEqual([0.1, 0.2, 0.3]);
            expect(response.success).toBeTruthy();
        });

        it('should throw error when no active provider is set', async () => {
            manager = new LLMManager();
            await expect(manager.getEmbeddings('טקסט לדוגמה')).rejects.toThrow('לא נבחר מודל פעיל');
        });
    });

    describe('getModelPerformance', () => {
        it('should return performance metrics for a provider', () => {
            manager.addProvider(openaiProvider);
            const performance = manager.getModelPerformance('openai');
            expect(performance).toBeDefined();
            expect(performance.averageResponseTime).toBe(0);
            expect(performance.successRate).toBe(0);
        });

        it('should throw error for unknown provider', () => {
            expect(() => manager.getModelPerformance('unknown')).toThrow('לא נמצא מידע על ביצועים עבור ספק unknown');
        });
    });

    describe('getUsageCosts', () => {
        it('should return usage costs for a provider', () => {
            manager.addProvider(openaiProvider);
            const costs = manager.getUsageCosts('openai');
            expect(costs).toBeDefined();
            expect(costs.currency).toBe('USD');
        });

        it('should throw error for unknown provider', () => {
            expect(() => manager.getUsageCosts('unknown')).toThrow('לא נמצא מידע על עלויות עבור ספק unknown');
        });
    });

    describe('validateProviderConnection', () => {
        beforeEach(() => {
            manager.addProvider(openaiProvider);
            openaiProvider.validateConnection.mockResolvedValue(true);
        });

        it('should validate connection successfully', async () => {
            const isValid = await manager.validateProviderConnection('openai');
            expect(isValid).toBeTruthy();
        });

        it('should throw error for unknown provider', async () => {
            await expect(manager.validateProviderConnection('unknown')).rejects.toThrow('לא נמצא ספק unknown');
        });
    });
}); 