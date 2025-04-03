/**
 * מערכת זיכרון אפיזודי
 */

class EpisodicMemory {
    constructor(config = {}) {
        this.memories = new Map();
        this.decayRate = config.decayRate || 0.1;
        this.maxMemories = config.maxMemories || 1000;
        this.vectorStore = new VectorStore();
    }

    /**
     * מבנה נתונים לזיכרון אפיזודי
     */
    createMemory(data) {
        const memory = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: data.type, // שיחה, פעולה, תצפית
            context: data.context,
            participants: data.participants || [],
            emotions: data.emotions || [],
            importance: data.importance || 5,
            vector: null, // ימולא מאוחר יותר
            relatedMemories: new Set(),
            metadata: {
                lastAccessed: Date.now(),
                accessCount: 0,
                decayFactor: 1.0
            }
        };

        // חישוב וקטור embedding
        memory.vector = this.vectorStore.createEmbedding(
            `${memory.type} ${memory.context} ${memory.participants.join(' ')}`
        );

        // שמירת הזיכרון
        this.memories.set(memory.id, memory);

        // קישור לזיכרונות קשורים
        this.linkRelatedMemories(memory);

        // ניהול גודל הזיכרון
        this.manageMemorySize();

        return memory;
    }

    /**
     * אלגוריתם דעיכת זיכרון
     */
    decayMemory(memory) {
        const age = Date.now() - memory.timestamp;
        const timeFactor = Math.exp(-this.decayRate * age / (1000 * 60 * 60 * 24)); // דעיכה יומית
        const accessFactor = Math.exp(-memory.metadata.accessCount * 0.1); // דעיכה לפי גישה
        
        memory.metadata.decayFactor = timeFactor * accessFactor;
        memory.importance *= memory.metadata.decayFactor;

        return memory;
    }

    /**
     * קישור בין זיכרונות קשורים
     */
    linkRelatedMemories(memory) {
        const similarityThreshold = 0.7;

        for (const [id, existingMemory] of this.memories) {
            if (id === memory.id) continue;

            const similarity = this.vectorStore.cosineSimilarity(
                memory.vector,
                existingMemory.vector
            );

            if (similarity > similarityThreshold) {
                memory.relatedMemories.add(id);
                existingMemory.relatedMemories.add(memory.id);
            }
        }
    }

    /**
     * ניהול גודל הזיכרון
     */
    manageMemorySize() {
        if (this.memories.size > this.maxMemories) {
            const sortedMemories = Array.from(this.memories.entries())
                .sort(([, a], [, b]) => {
                    const scoreA = a.importance * a.metadata.decayFactor;
                    const scoreB = b.importance * b.metadata.decayFactor;
                    return scoreA - scoreB;
                });

            // מחיקת הזיכרונות הפחות חשובים
            while (this.memories.size > this.maxMemories) {
                const [id] = sortedMemories.shift();
                this.memories.delete(id);
            }
        }
    }

    /**
     * אחזור זיכרונות לפי רלוונטיות
     */
    retrieveMemories(context, limit = 10) {
        const contextVector = this.vectorStore.createEmbedding(context);
        
        const memories = Array.from(this.memories.values())
            .map(memory => ({
                ...memory,
                relevance: this.vectorStore.cosineSimilarity(
                    contextVector,
                    memory.vector
                ) * memory.importance * memory.metadata.decayFactor
            }))
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, limit);

        // עדכון מונה גישות
        memories.forEach(memory => {
            memory.metadata.lastAccessed = Date.now();
            memory.metadata.accessCount++;
        });

        return memories;
    }

    /**
     * עדכון זיכרון
     */
    updateMemory(id, updates) {
        const memory = this.memories.get(id);
        if (!memory) return null;

        Object.assign(memory, updates);
        memory.vector = this.vectorStore.createEmbedding(
            `${memory.type} ${memory.context} ${memory.participants.join(' ')}`
        );

        // עדכון קישורים
        this.linkRelatedMemories(memory);

        return memory;
    }

    /**
     * מחיקת זיכרון
     */
    deleteMemory(id) {
        const memory = this.memories.get(id);
        if (!memory) return false;

        // הסרת קישורים
        memory.relatedMemories.forEach(relatedId => {
            const relatedMemory = this.memories.get(relatedId);
            if (relatedMemory) {
                relatedMemory.relatedMemories.delete(id);
            }
        });

        this.memories.delete(id);
        return true;
    }
}

/**
 * מערכת אחסון וקטורי
 */
class VectorStore {
    constructor() {
        this.embeddings = new Map();
    }

    createEmbedding(text) {
        // כאן ייושם אלגוריתם יצירת embeddings
        // לדוגמה: שימוש ב-OpenAI API או מודל מקומי
        return new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    }

    cosineSimilarity(vec1, vec2) {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (norm1 * norm2);
    }
}

module.exports = EpisodicMemory; 