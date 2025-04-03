/**
 * מערכת תבניות prompt מתקדמת
 */

class PromptSystem {
    constructor(config = {}) {
        this.templates = new Map();
        this.modules = new Map();
        this.cache = new Map();
        this.tokenMonitor = new TokenMonitor();
        this.contextManager = new ContextManager();
        this.personalityMapper = new PersonalityMapper();
        this.maxTextLength = config.maxTextLength || 1000;
        this.specialCharsRegex = /[^\w\s.,!?-]/g;
    }

    /**
     * יצירת prompt מלא
     */
    async createPrompt(config) {
        const {
            agentId,
            interactionType,
            context,
            memories,
            conversationHistory,
            instructions,
            personality
        } = config;

        // טיפול בטקסט ארוך
        const processedContext = this.handleLongText(context);
        const processedMemories = await this.processMemories(memories);
        const processedHistory = this.handleLongText(conversationHistory);

        // בניית prompt מודולרי
        const prompt = {
            identity: await this.buildIdentityModule(agentId, personality),
            environment: await this.buildEnvironmentModule(processedContext),
            memory: await this.buildMemoryModule(processedMemories),
            conversation: await this.buildConversationModule(processedHistory),
            instructions: await this.buildInstructionsModule(instructions)
        };

        // אופטימיזציה לטוקנים
        const optimizedPrompt = await this.optimizePrompt(prompt);

        // שמירה במטמון
        this.cachePrompt(optimizedPrompt);

        return optimizedPrompt;
    }

    /**
     * טיפול בטקסט ארוך
     */
    handleLongText(text) {
        if (!text) return text;

        // טיפול בתווים מיוחדים
        text = this.handleSpecialCharacters(text);

        // חלוקה לקטעים אם הטקסט ארוך מדי
        if (text.length > this.maxTextLength) {
            return this.splitLongText(text);
        }

        return text;
    }

    /**
     * טיפול בתווים מיוחדים
     */
    handleSpecialCharacters(text) {
        // החלפת תווים מיוחדים
        text = text.replace(this.specialCharsRegex, ' ');

        // הסרת רווחים מיותרים
        text = text.replace(/\s+/g, ' ').trim();

        return text;
    }

    /**
     * חלוקת טקסט ארוך לקטעים
     */
    splitLongText(text) {
        const chunks = [];
        let currentChunk = '';
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > this.maxTextLength) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            } else {
                currentChunk += ' ' + sentence;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * עיבוד זיכרונות
     */
    async processMemories(memories) {
        if (!Array.isArray(memories)) return [];

        return memories.map(memory => ({
            ...memory,
            content: this.handleLongText(memory.content),
            context: this.handleLongText(memory.context)
        }));
    }

    /**
     * בניית מודול זהות
     */
    async buildIdentityModule(agentId, personality) {
        const baseTemplate = await this.getTemplate('identity');
        const personalityParams = this.personalityMapper.mapToPrompt(personality);
        
        return {
            template: baseTemplate,
            params: {
                agentId,
                ...personalityParams
            }
        };
    }

    /**
     * בניית מודול סביבה
     */
    async buildEnvironmentModule(context) {
        const baseTemplate = await this.getTemplate('environment');
        
        return {
            template: baseTemplate,
            params: {
                context: this.contextManager.compressContext(context)
            }
        };
    }

    /**
     * בניית מודול זיכרונות
     */
    async buildMemoryModule(memories) {
        const baseTemplate = await this.getTemplate('memory');
        const relevantMemories = await this.filterRelevantMemories(memories);
        
        // טיפול בזיכרונות ארוכים
        const processedMemories = relevantMemories.map(memory => {
            if (typeof memory.content === 'string' && memory.content.length > this.maxTextLength) {
                return {
                    ...memory,
                    content: this.splitLongText(memory.content)[0] // לוקח רק את הקטע הראשון
                };
            }
            return memory;
        });
        
        return {
            template: baseTemplate,
            params: {
                memories: processedMemories
            }
        };
    }

    /**
     * בניית מודול שיחה
     */
    async buildConversationModule(history) {
        const baseTemplate = await this.getTemplate('conversation');
        const processedHistory = Array.isArray(history) ? 
            history.map(h => this.handleLongText(h)) : 
            this.handleLongText(history);
        
        return {
            template: baseTemplate,
            params: {
                history: processedHistory
            }
        };
    }

    /**
     * בניית מודול הנחיות
     */
    async buildInstructionsModule(instructions) {
        const baseTemplate = await this.getTemplate('instructions');
        const processedInstructions = this.handleLongText(instructions);
        
        return {
            template: baseTemplate,
            params: {
                instructions: this.optimizeInstructions(processedInstructions)
            }
        };
    }

    /**
     * אופטימיזציה של הנחיות
     */
    optimizeInstructions(instructions) {
        if (!instructions) return '';

        // הסרת רווחים מיותרים
        instructions = instructions.replace(/\s+/g, ' ').trim();

        // חלוקה למשפטים
        const sentences = instructions.match(/[^.!?]+[.!?]+/g) || [];

        // מיון משפטים לפי חשיבות
        const sortedSentences = sentences.sort((a, b) => {
            const aImportance = this.calculateSentenceImportance(a);
            const bImportance = this.calculateSentenceImportance(b);
            return bImportance - aImportance;
        });

        // החזרת המשפטים החשובים ביותר
        return sortedSentences.slice(0, 5).join(' ');
    }

    /**
     * חישוב חשיבות משפט
     */
    calculateSentenceImportance(sentence) {
        const keywords = ['חשוב', 'חובה', 'נדרש', 'יש', 'צריך', 'אל'];
        return keywords.reduce((score, keyword) => 
            score + (sentence.includes(keyword) ? 2 : 0), 0
        );
    }

    /**
     * אופטימיזציה של prompt
     */
    async optimizePrompt(prompt) {
        // דחיסת היסטוריית שיחה
        prompt.conversation.params.history = await this.compressConversationHistory(
            prompt.conversation.params.history
        );

        // סינון זיכרונות לפי רלוונטיות
        prompt.memory.params.memories = await this.filterRelevantMemories(
            prompt.memory.params.memories
        );

        // בחירת מודל LLM מתאים
        const model = await this.selectOptimalModel(prompt);

        return {
            ...prompt,
            model,
            tokenCount: await this.tokenMonitor.estimateTokens(prompt)
        };
    }

    /**
     * דחיסת היסטוריית שיחה
     */
    async compressConversationHistory(history) {
        if (history.length <= 5) return history;

        // שמירת השיחה האחרונה
        const recentMessages = history.slice(-5);

        // סיכום השיחות הקודמות
        const summary = await this.summarizeConversation(history.slice(0, -5));

        return [
            { role: 'system', content: `סיכום שיחה קודמת: ${summary}` },
            ...recentMessages
        ];
    }

    /**
     * סינון זיכרונות רלוונטיים
     */
    async filterRelevantMemories(memories) {
        const relevanceThreshold = 0.7;
        
        return memories
            .filter(memory => memory.relevance >= relevanceThreshold)
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 5); // שמירה על 5 הזיכרונות הרלוונטיים ביותר
    }

    /**
     * בחירת מודל LLM אופטימלי
     */
    async selectOptimalModel(prompt) {
        const complexity = await this.assessPromptComplexity(prompt);
        
        if (complexity > 0.8) {
            return 'gpt-4';
        } else if (complexity > 0.5) {
            return 'gpt-3.5-turbo';
        } else {
            return 'gpt-3.5-turbo-instruct';
        }
    }

    /**
     * הערכת מורכבות prompt
     */
    async assessPromptComplexity(prompt) {
        const factors = {
            memoryCount: prompt.memory.params.memories.length / 10,
            historyLength: prompt.conversation.params.history.length / 20,
            instructionComplexity: this.measureInstructionComplexity(prompt.instructions.params.instructions)
        };

        return Object.values(factors).reduce((sum, factor) => sum + factor, 0) / 3;
    }

    /**
     * מדידת מורכבות הנחיות
     */
    measureInstructionComplexity(instructions) {
        // כאן ייושם אלגוריתם למדידת מורכבות הנחיות
        return 0.5;
    }

    /**
     * שמירה במטמון
     */
    cachePrompt(prompt) {
        const key = this.generateCacheKey(prompt);
        this.cache.set(key, {
            prompt,
            timestamp: Date.now(),
            usage: 0
        });
    }

    /**
     * יצירת מפתח מטמון
     */
    generateCacheKey(prompt) {
        // כאן ייושם אלגוריתם ליצירת מפתח מטמון ייחודי
        return crypto.randomUUID();
    }
}

/**
 * מערכת ניטור טוקנים
 */
class TokenMonitor {
    constructor() {
        this.usage = new Map();
    }

    async estimateTokens(prompt) {
        // כאן ייושם אלגוריתם להערכת מספר הטוקנים
        return 1000;
    }

    trackUsage(model, tokens) {
        const currentUsage = this.usage.get(model) || 0;
        this.usage.set(model, currentUsage + tokens);
    }
}

/**
 * מנהל הקשר
 */
class ContextManager {
    constructor() {
        this.contexts = new Map();
    }

    compressContext(context) {
        // כאן ייושם אלגוריתם לדחיסת הקשר
        return context;
    }

    switchContext(oldContext, newContext) {
        // כאן ייושם אלגוריתם למעבר בין הקשרים
    }
}

/**
 * מיפוי אישיות
 */
class PersonalityMapper {
    constructor() {
        this.traits = new Map();
    }

    mapToPrompt(personality) {
        // כאן ייושם אלגוריתם למיפוי תכונות אישיות לפרמטרים
        return {
            tone: personality.tone,
            formality: personality.formality,
            empathy: personality.empathy
        };
    }
}

module.exports = PromptSystem; 