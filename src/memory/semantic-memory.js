/**
 * מערכת זיכרון סמנטי
 */

class SemanticMemory {
    constructor(config = {}) {
        this.knowledge = new Map();
        this.categories = new Set();
        this.relationships = new Map();
        this.conflicts = new Map();
        this.vectorStore = new VectorStore();
    }

    /**
     * מבנה נתונים לידע סמנטי
     */
    createKnowledge(data) {
        const knowledge = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: data.type, // עובדה, אמונה, כלל
            content: data.content,
            category: data.category,
            certainty: data.certainty || 100,
            source: data.source,
            vector: null,
            metadata: {
                lastUpdated: Date.now(),
                updateCount: 0,
                confidence: 1.0
            }
        };

        // חישוב וקטור embedding
        knowledge.vector = this.vectorStore.createEmbedding(knowledge.content);

        // שמירת הידע
        this.knowledge.set(knowledge.id, knowledge);
        this.categories.add(knowledge.category);

        // בדיקת סתירות
        this.checkConflicts(knowledge);

        return knowledge;
    }

    /**
     * חילוץ ידע מאינטראקציות
     */
    extractKnowledge(interaction) {
        const extractedKnowledge = {
            type: 'fact',
            content: interaction.summary,
            category: this.determineCategory(interaction),
            certainty: this.calculateCertainty(interaction),
            source: {
                type: 'interaction',
                id: interaction.id,
                timestamp: interaction.timestamp
            }
        };

        return this.createKnowledge(extractedKnowledge);
    }

    /**
     * בדיקת סתירות בידע
     */
    checkConflicts(knowledge) {
        const potentialConflicts = this.findPotentialConflicts(knowledge);
        
        for (const conflict of potentialConflicts) {
            const conflictId = `${knowledge.id}-${conflict.id}`;
            this.conflicts.set(conflictId, {
                knowledge1: knowledge,
                knowledge2: conflict,
                timestamp: Date.now(),
                resolution: null
            });
        }
    }

    /**
     * מציאת סתירות פוטנציאליות
     */
    findPotentialConflicts(knowledge) {
        const conflicts = [];
        const similarityThreshold = 0.8;

        for (const [id, existingKnowledge] of this.knowledge) {
            if (id === knowledge.id) continue;

            const similarity = this.vectorStore.cosineSimilarity(
                knowledge.vector,
                existingKnowledge.vector
            );

            if (similarity > similarityThreshold && 
                knowledge.certainty > 80 && 
                existingKnowledge.certainty > 80) {
                conflicts.push(existingKnowledge);
            }
        }

        return conflicts;
    }

    /**
     * פתרון סתירות
     */
    resolveConflict(conflictId, resolution) {
        const conflict = this.conflicts.get(conflictId);
        if (!conflict) return false;

        conflict.resolution = {
            decision: resolution.decision,
            timestamp: Date.now(),
            explanation: resolution.explanation
        };

        // עדכון הידע בהתאם להחלטה
        if (resolution.decision === 'keep1') {
            this.updateKnowledge(conflict.knowledge2.id, {
                certainty: conflict.knowledge2.certainty * 0.5
            });
        } else if (resolution.decision === 'keep2') {
            this.updateKnowledge(conflict.knowledge1.id, {
                certainty: conflict.knowledge1.certainty * 0.5
            });
        }

        return true;
    }

    /**
     * עדכון ידע
     */
    updateKnowledge(id, updates) {
        const knowledge = this.knowledge.get(id);
        if (!knowledge) return null;

        Object.assign(knowledge, updates);
        knowledge.metadata.lastUpdated = Date.now();
        knowledge.metadata.updateCount++;

        // חישוב מחדש של הוודאות
        knowledge.certainty = this.calculateUpdatedCertainty(knowledge);

        return knowledge;
    }

    /**
     * חישוב וודאות מעודכנת
     */
    calculateUpdatedCertainty(knowledge) {
        const baseCertainty = knowledge.certainty;
        const updateFactor = Math.exp(-knowledge.metadata.updateCount * 0.1);
        const timeFactor = Math.exp(-(Date.now() - knowledge.timestamp) / (1000 * 60 * 60 * 24 * 30));
        
        return Math.min(100, baseCertainty * updateFactor * timeFactor);
    }

    /**
     * אחזור ידע לפי קטגוריה
     */
    retrieveKnowledgeByCategory(category, limit = 10) {
        return Array.from(this.knowledge.values())
            .filter(k => k.category === category)
            .sort((a, b) => b.certainty - a.certainty)
            .slice(0, limit);
    }

    /**
     * חיפוש סמנטי
     */
    semanticSearch(query, limit = 10) {
        const queryVector = this.vectorStore.createEmbedding(query);
        
        return Array.from(this.knowledge.values())
            .map(knowledge => ({
                ...knowledge,
                relevance: this.vectorStore.cosineSimilarity(
                    queryVector,
                    knowledge.vector
                ) * (knowledge.certainty / 100)
            }))
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, limit);
    }

    /**
     * קביעת קטגוריה
     */
    determineCategory(interaction) {
        // כאן ייושם אלגוריתם לסיווג קטגוריות
        // לדוגמה: שימוש ב-NLP או מודל סיווג
        return 'general';
    }

    /**
     * חישוב וודאות
     */
    calculateCertainty(interaction) {
        // כאן ייושם אלגוריתם לחישוב וודאות
        // לדוגמה: שימוש במודל בייסיאני או מודל למידת מכונה
        return 80;
    }
}

module.exports = SemanticMemory; 