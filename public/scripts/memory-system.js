/**
 * Memory System Module
 * Handles the storage and retrieval of memories for personas
 */

/**
 * Base Memory class
 */
class Memory {
    constructor(type, content, importance = 0.5, metadata = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.content = content;
        this.importance = importance;
        this.timestamp = Date.now();
        this.lastAccessed = Date.now();
        this.accessCount = 0;
        this.metadata = metadata;
    }

    /**
     * Update memory importance based on access and time
     */
    updateImportance() {
        const timeDecay = (Date.now() - this.timestamp) / (1000 * 60 * 60 * 24); // days
        const accessBoost = this.accessCount * 0.1;
        this.importance = Math.max(0, Math.min(1, this.importance - (timeDecay * 0.01) + accessBoost));
    }

    /**
     * Record memory access
     */
    recordAccess() {
        this.lastAccessed = Date.now();
        this.accessCount++;
        this.updateImportance();
    }
}

/**
 * Episodic Memory class for storing specific events and interactions
 */
class EpisodicMemory extends Memory {
    constructor(content, importance = 0.5, metadata = {}) {
        super('episodic', content, importance, metadata);
        this.relatedMemories = [];
        this.emotionalContext = metadata.emotionalContext || {};
    }

    /**
     * Add related memory
     * @param {string} memoryId - ID of related memory
     */
    addRelatedMemory(memoryId) {
        if (!this.relatedMemories.includes(memoryId)) {
            this.relatedMemories.push(memoryId);
        }
    }

    /**
     * Add emotional context
     * @param {Object} emotions - Emotional context object
     */
    addEmotionalContext(emotions) {
        this.emotionalContext = { ...this.emotionalContext, ...emotions };
    }
}

/**
 * Semantic Memory class for storing general knowledge and facts
 */
class SemanticMemory extends Memory {
    constructor(content, importance = 0.5, metadata = {}) {
        super('semantic', content, importance, metadata);
        this.categories = metadata.categories || [];
        this.verified = metadata.verified || false;
        this.lastVerified = metadata.lastVerified || null;
    }

    /**
     * Update verification status
     * @param {boolean} verified - Verification status
     */
    updateVerification(verified) {
        this.verified = verified;
        this.lastVerified = Date.now();
    }

    /**
     * Add category
     * @param {string} category - Category to add
     */
    addCategory(category) {
        if (!this.categories.includes(category)) {
            this.categories.push(category);
        }
    }
}

/**
 * Memory System class for managing all memories
 */
export class MemorySystem {
    constructor(personaId) {
        this.personaId = personaId;
        this.memories = [];
    }

    addMemory(type, content, importance = 0.5, metadata = {}) {
        const memory = {
            id: Date.now().toString(),
            type,
            content,
            importance,
            timestamp: new Date().toISOString(),
            metadata
        };

        this.memories.push(memory);
        return memory;
    }

    getRelevantMemories(query, options = {}) {
        const { minImportance = 0, limit = 10 } = options;
        
        return this.memories
            .filter(memory => memory.importance >= minImportance)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, limit);
    }

    getAllMemories() {
        return [...this.memories];
    }

    clearMemories() {
        this.memories = [];
    }
} 