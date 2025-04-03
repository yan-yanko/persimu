/**
 * מערכת מטמון חכמה לתשובות LLM
 */

class CacheSystem {
    constructor(config = {}) {
        this.cache = new Map();
        this.semanticCache = new Map();
        this.maxSize = config.maxSize || 1000;
        this.defaultTTL = config.defaultTTL || 24 * 60 * 60 * 1000; // 24 שעות
        this.similarityThreshold = config.similarityThreshold || 0.8;
        this.vectorStore = new VectorStore();
    }

    /**
     * שמירת תשובה במטמון
     */
    async cacheResponse(query, response, metadata = {}) {
        const key = this.generateCacheKey(query);
        const semanticKey = await this.generateSemanticKey(query);

        const cacheEntry = {
            query,
            response,
            metadata: {
                ...metadata,
                timestamp: Date.now(),
                ttl: metadata.ttl || this.defaultTTL,
                usage: 0
            }
        };

        // שמירה במטמון רגיל
        this.cache.set(key, cacheEntry);

        // שמירה במטמון סמנטי
        this.semanticCache.set(semanticKey, {
            key,
            vector: await this.vectorStore.createEmbedding(query)
        });

        // ניהול גודל המטמון
        this.manageCacheSize();
    }

    /**
     * אחזור תשובה מהמטמון
     */
    async getResponse(query) {
        // ניסיון אחזור מדויק
        const exactMatch = await this.getExactMatch(query);
        if (exactMatch) return exactMatch;

        // ניסיון אחזור סמנטי
        const semanticMatch = await this.getSemanticMatch(query);
        if (semanticMatch) return semanticMatch;

        return null;
    }

    /**
     * אחזור התאמה מדויקת
     */
    async getExactMatch(query) {
        const key = this.generateCacheKey(query);
        const entry = this.cache.get(key);

        if (entry && this.isValidEntry(entry)) {
            entry.metadata.usage++;
            return entry.response;
        }

        return null;
    }

    /**
     * אחזור התאמה סמנטית
     */
    async getSemanticMatch(query) {
        const queryVector = await this.vectorStore.createEmbedding(query);
        let bestMatch = null;
        let bestSimilarity = 0;

        for (const [semanticKey, entry] of this.semanticCache) {
            const similarity = this.vectorStore.cosineSimilarity(
                queryVector,
                entry.vector
            );

            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestMatch = entry;
            }
        }

        if (bestSimilarity >= this.similarityThreshold) {
            const cacheEntry = this.cache.get(bestMatch.key);
            if (cacheEntry && this.isValidEntry(cacheEntry)) {
                cacheEntry.metadata.usage++;
                return cacheEntry.response;
            }
        }

        return null;
    }

    /**
     * בדיקת תקינות רשומת מטמון
     */
    isValidEntry(entry) {
        const age = Date.now() - entry.metadata.timestamp;
        return age < entry.metadata.ttl;
    }

    /**
     * ניהול גודל המטמון
     */
    manageCacheSize() {
        if (this.cache.size > this.maxSize) {
            // מיון לפי שימוש ותוקף
            const sortedEntries = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => {
                    const scoreA = this.calculateEntryScore(a);
                    const scoreB = this.calculateEntryScore(b);
                    return scoreA - scoreB;
                });

            // מחיקת רשומות ישנות
            while (this.cache.size > this.maxSize) {
                const [key] = sortedEntries.shift();
                this.cache.delete(key);
                
                // מחיקת מפתח סמנטי מתאים
                for (const [semanticKey, entry] of this.semanticCache) {
                    if (entry.key === key) {
                        this.semanticCache.delete(semanticKey);
                        break;
                    }
                }
            }
        }
    }

    /**
     * חישוב ציון רשומת מטמון
     */
    calculateEntryScore(entry) {
        const age = Date.now() - entry.metadata.timestamp;
        const usageFactor = Math.exp(-entry.metadata.usage * 0.1);
        const ageFactor = Math.exp(-age / entry.metadata.ttl);
        
        return (ageFactor + usageFactor) / 2;
    }

    /**
     * יצירת מפתח מטמון
     */
    generateCacheKey(query) {
        // כאן ייושם אלגוריתם ליצירת מפתח ייחודי
        return crypto.randomUUID();
    }

    /**
     * יצירת מפתח סמנטי
     */
    async generateSemanticKey(query) {
        const vector = await this.vectorStore.createEmbedding(query);
        return vector.join(',');
    }

    /**
     * ניקוי מטמון
     */
    clearCache() {
        this.cache.clear();
        this.semanticCache.clear();
    }

    /**
     * עדכון TTL
     */
    updateTTL(key, newTTL) {
        const entry = this.cache.get(key);
        if (entry) {
            entry.metadata.ttl = newTTL;
            return true;
        }
        return false;
    }

    /**
     * סטטיסטיקות מטמון
     */
    getCacheStats() {
        return {
            totalEntries: this.cache.size,
            semanticEntries: this.semanticCache.size,
            averageUsage: this.calculateAverageUsage(),
            hitRate: this.calculateHitRate()
        };
    }

    /**
     * חישוב שימוש ממוצע
     */
    calculateAverageUsage() {
        const usages = Array.from(this.cache.values())
            .map(entry => entry.metadata.usage);
        return usages.reduce((a, b) => a + b, 0) / usages.length;
    }

    /**
     * חישוב אחוזי הצלחה
     */
    calculateHitRate() {
        // כאן ייושם אלגוריתם לחישוב אחוזי הצלחה
        return 0.8;
    }
}

/**
 * מערכת אחסון וקטורי
 */
class VectorStore {
    constructor() {
        this.embeddings = new Map();
    }

    async createEmbedding(text) {
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

module.exports = CacheSystem; 