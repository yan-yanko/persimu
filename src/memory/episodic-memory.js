/**
 * מערכת זיכרון אפיזודי
 */

class EpisodicMemory {
    constructor(config = {}) {
        this.memories = new Map();
        this.decayRate = config.decayRate || 0.1;
        this.maxMemories = config.maxMemories || 1000;
        this.vectorStore = new VectorStore();
        this.backupInterval = config.backupInterval || 5 * 60 * 1000; // 5 דקות
        this.lastBackup = Date.now();
        this.backupPath = config.backupPath || './backups';
        this.relevanceThreshold = config.relevanceThreshold || 0.7;
        this.memoryCache = new Map();
        this.cacheSize = config.cacheSize || 100;
        
        // הגדרות Sharding
        this.shardManager = new ShardManager({
            numShards: config.numShards || 4,
            shardStrategy: config.shardStrategy || 'agent', // agent, simulation, hybrid
            loadBalancer: new LoadBalancer()
        });
        
        // מערכת ניהול תורים
        this.queueManager = new QueueManager({
            maxQueueSize: config.maxQueueSize || 1000,
            processingInterval: config.processingInterval || 100,
            priorityLevels: config.priorityLevels || 3
        });
        
        // מערכת ניטור ובקרה
        this.monitor = new MemoryMonitor({
            alertThresholds: config.alertThresholds || {
                queueSize: 800,
                shardLoad: 0.8,
                errorRate: 0.1
            },
            metricsInterval: config.metricsInterval || 60000, // דקה
            notificationChannels: config.notificationChannels || ['email']
        });
        
        // התחלת מנגנון גיבוי אוטומטי
        this.startAutoBackup();
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
            importance: this.calculateMemoryImportance(data),
            vector: null, // ימולא מאוחר יותר
            relatedMemories: new Set(),
            metadata: {
                lastAccessed: Date.now(),
                accessCount: 0,
                decayFactor: 1.0,
                emotionalIntensity: this.calculateEmotionalIntensity(data.emotions),
                relevanceScore: 0
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
     * חישוב חשיבות זיכרון
     */
    calculateMemoryImportance(data) {
        const factors = {
            recency: this.calculateRecencyFactor(data.timestamp),
            emotionalIntensity: this.calculateEmotionalIntensity(data.emotions),
            contextRelevance: this.calculateContextRelevance(data.context),
            interactionCount: data.interactionCount || 0
        };

        // שקלול כל הגורמים
        const weights = {
            recency: 0.3,
            emotionalIntensity: 0.3,
            contextRelevance: 0.2,
            interactionCount: 0.2
        };

        return Object.entries(factors).reduce((score, [factor, value]) => 
            score + (value * weights[factor]), 0
        );
    }

    /**
     * חישוב גורם חדשות
     */
    calculateRecencyFactor(timestamp) {
        const age = Date.now() - timestamp;
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 ימים
        return Math.max(0, 1 - (age / maxAge));
    }

    /**
     * חישוב עוצמה רגשית
     */
    calculateEmotionalIntensity(emotions) {
        if (!emotions || emotions.length === 0) return 0;
        
        const intensityMap = {
            'HAPPY': 0.8,
            'SAD': 0.7,
            'ANGRY': 0.9,
            'SURPRISED': 0.6,
            'NEUTRAL': 0.3,
            'INTERESTED': 0.7,
            'BORED': 0.2,
            'TRUSTING': 0.6,
            'SUSPICIOUS': 0.5
        };

        return emotions.reduce((sum, emotion) => 
            sum + (intensityMap[emotion] || 0.5), 0
        ) / emotions.length;
    }

    /**
     * חישוב רלוונטיות הקשר
     */
    calculateContextRelevance(context) {
        // כאן ייושם אלגוריתם לניתוח רלוונטיות הקשר
        return 0.5;
    }

    /**
     * חיפוש סמנטי בזיכרונות עם Sharding
     */
    async semanticSearch(query, limit = 10) {
        const queryVector = this.vectorStore.createEmbedding(query);
        const results = [];

        // חיפוש במטמון קודם
        const cachedResults = this.memoryCache.get(query);
        if (cachedResults) {
            return cachedResults.slice(0, limit);
        }

        // חיפוש בכל השרדים
        const shards = await this.shardManager.getAllShards();
        const searchPromises = shards.map(shard => 
            shard.semanticSearch(queryVector, this.relevanceThreshold)
        );

        const shardResults = await Promise.all(searchPromises);
        
        // איחוד תוצאות
        shardResults.flat().forEach(result => {
            results.push({
                ...result,
                relevance: this.vectorStore.cosineSimilarity(
                    queryVector,
                    result.vector
                )
            });
        });

        // מיון לפי רלוונטיות וחשיבות
        results.sort((a, b) => {
            const scoreA = a.relevance * a.importance;
            const scoreB = b.relevance * b.importance;
            return scoreB - scoreA;
        });

        // שמירה במטמון
        this.updateCache(query, results);

        return results.slice(0, limit);
    }

    /**
     * עדכון מטמון
     */
    updateCache(query, results) {
        if (this.memoryCache.size >= this.cacheSize) {
            // מחיקת הערך הישן ביותר
            const oldestKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(oldestKey);
        }

        this.memoryCache.set(query, results);
    }

    /**
     * סיכום זיכרונות אוטומטי
     */
    async summarizeMemories() {
        const memoryGroups = this.groupSimilarMemories();
        
        for (const group of memoryGroups) {
            if (group.length > 5) { // סף לסיכום
                const summary = await this.createMemorySummary(group);
                this.memories.set(summary.id, summary);
                
                // קישור הסיכום לזיכרונות המקוריים
                group.forEach(memory => {
                    memory.relatedMemories.add(summary.id);
                    summary.relatedMemories.add(memory.id);
                });
            }
        }
    }

    /**
     * קבוצת זיכרונות דומים
     */
    groupSimilarMemories() {
        const groups = [];
        const processed = new Set();

        for (const [id, memory] of this.memories) {
            if (processed.has(id)) continue;

            const group = [memory];
            processed.add(id);

            for (const [otherId, otherMemory] of this.memories) {
                if (id === otherId || processed.has(otherId)) continue;

                const similarity = this.vectorStore.cosineSimilarity(
                    memory.vector,
                    otherMemory.vector
                );

                if (similarity > 0.8) { // סף דמיון גבוה
                    group.push(otherMemory);
                    processed.add(otherId);
                }
            }

            groups.push(group);
        }

        return groups;
    }

    /**
     * יצירת סיכום זיכרונות
     */
    async createMemorySummary(memories) {
        const summary = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: 'SUMMARY',
            context: await this.generateSummaryContext(memories),
            participants: this.extractUniqueParticipants(memories),
            emotions: this.aggregateEmotions(memories),
            importance: this.calculateGroupImportance(memories),
            vector: this.vectorStore.createEmbedding(
                `SUMMARY ${memories.map(m => m.context).join(' ')}`
            ),
            relatedMemories: new Set(memories.map(m => m.id)),
            metadata: {
                lastAccessed: Date.now(),
                accessCount: 0,
                decayFactor: 1.0,
                emotionalIntensity: this.calculateEmotionalIntensity(
                    this.aggregateEmotions(memories)
                ),
                relevanceScore: 0,
                originalCount: memories.length
            }
        };

        return summary;
    }

    /**
     * יצירת הקשר סיכום
     */
    async generateSummaryContext(memories) {
        // כאן ייושם אלגוריתם ליצירת סיכום טקסט
        return `סיכום של ${memories.length} זיכרונות קשורים`;
    }

    /**
     * חילוץ משתתפים ייחודיים
     */
    extractUniqueParticipants(memories) {
        const participants = new Set();
        memories.forEach(memory => {
            memory.participants.forEach(p => participants.add(p));
        });
        return Array.from(participants);
    }

    /**
     * איגום רגשות
     */
    aggregateEmotions(memories) {
        const emotionCounts = new Map();
        
        memories.forEach(memory => {
            memory.emotions.forEach(emotion => {
                emotionCounts.set(
                    emotion,
                    (emotionCounts.get(emotion) || 0) + 1
                );
            });
        });

        // החזרת הרגשות הנפוצים ביותר
        return Array.from(emotionCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([emotion]) => emotion);
    }

    /**
     * חישוב חשיבות קבוצת זיכרונות
     */
    calculateGroupImportance(memories) {
        return memories.reduce((sum, memory) => 
            sum + memory.importance, 0
        ) / memories.length;
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

    /**
     * בדיקת שלמות זיכרון
     */
    async verifyMemoryIntegrity(memory) {
        const checks = {
            hasRequiredFields: this.checkRequiredFields(memory),
            hasValidVector: await this.verifyVector(memory),
            hasValidTimestamp: this.checkTimestamp(memory),
            hasValidRelations: this.checkRelations(memory)
        };

        return Object.values(checks).every(check => check === true);
    }

    /**
     * בדיקת שדות חובה
     */
    checkRequiredFields(memory) {
        const requiredFields = ['id', 'timestamp', 'type', 'context', 'vector'];
        return requiredFields.every(field => memory.hasOwnProperty(field));
    }

    /**
     * בדיקת תקינות וקטור
     */
    async verifyVector(memory) {
        if (!memory.vector) return false;
        return await this.vectorStore.validateVector(memory.vector);
    }

    /**
     * בדיקת חותמת זמן
     */
    checkTimestamp(memory) {
        return memory.timestamp > 0 && memory.timestamp <= Date.now();
    }

    /**
     * בדיקת קשרים
     */
    checkRelations(memory) {
        if (!memory.relatedMemories) return true;
        return Array.isArray(memory.relatedMemories) && 
               memory.relatedMemories.every(id => this.memories.has(id));
    }

    /**
     * גיבוי אוטומטי
     */
    async performBackup() {
        try {
            const backupData = {
                timestamp: Date.now(),
                memories: Array.from(this.memories.entries()),
                metadata: {
                    totalMemories: this.memories.size,
                    lastUpdate: this.lastBackup
                }
            };

            // שמירת גיבוי
            await this.saveBackup(backupData);
            this.lastBackup = Date.now();

            // בדיקת תקינות הגיבוי
            const isValid = await this.verifyBackup(backupData);
            if (!isValid) {
                throw new Error('Backup verification failed');
            }

            return true;
        } catch (error) {
            console.error('Backup failed:', error);
            return false;
        }
    }

    /**
     * שמירת גיבוי
     */
    async saveBackup(backupData) {
        const filename = `memory_backup_${Date.now()}.json`;
        const filepath = `${this.backupPath}/${filename}`;
        
        // שמירת הגיבוי
        await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
        
        // שמירת 5 הגיבויים האחרונים בלבד
        await this.cleanupOldBackups();
    }

    /**
     * ניקוי גיבויים ישנים
     */
    async cleanupOldBackups() {
        const files = await fs.readdir(this.backupPath);
        const backups = files
            .filter(f => f.startsWith('memory_backup_'))
            .sort((a, b) => {
                const timeA = parseInt(a.split('_')[2]);
                const timeB = parseInt(b.split('_')[2]);
                return timeB - timeA;
            });

        // מחיקת גיבויים ישנים
        for (let i = 5; i < backups.length; i++) {
            await fs.unlink(`${this.backupPath}/${backups[i]}`);
        }
    }

    /**
     * התאוששות מגיבוי
     */
    async recoverFromBackup() {
        try {
            const files = await fs.readdir(this.backupPath);
            const latestBackup = files
                .filter(f => f.startsWith('memory_backup_'))
                .sort()
                .pop();

            if (!latestBackup) {
                throw new Error('No backup found');
            }

            const backupData = JSON.parse(
                await fs.readFile(`${this.backupPath}/${latestBackup}`)
            );

            // שחזור הזיכרונות
            this.memories = new Map(backupData.memories);
            
            // בדיקת תקינות
            for (const [id, memory] of this.memories) {
                const isValid = await this.verifyMemoryIntegrity(memory);
                if (!isValid) {
                    console.warn(`Invalid memory found during recovery: ${id}`);
                    this.memories.delete(id);
                }
            }

            return true;
        } catch (error) {
            console.error('Recovery failed:', error);
            return false;
        }
    }

    /**
     * התחלת גיבוי אוטומטי
     */
    startAutoBackup() {
        setInterval(async () => {
            if (Date.now() - this.lastBackup >= this.backupInterval) {
                await this.performBackup();
            }
        }, this.backupInterval);
    }

    /**
     * שמירת זיכרון עם תור
     */
    async saveMemory(memory) {
        try {
            const task = new QueueTask({
                type: 'SAVE_MEMORY',
                priority: this.calculateTaskPriority(memory),
                data: memory
            });

            const result = await this.queueManager.enqueue(task);
            
            // עדכון מטריקות
            this.monitor.recordMetric('memory_save_success', 1);
            this.monitor.recordMetric('memory_save_latency', 
                Date.now() - task.timestamp
            );

            return result;
        } catch (error) {
            // תיעוד שגיאה
            this.monitor.recordError('memory_save_error', error);
            throw error;
        }
    }

    /**
     * אחזור זיכרון עם תור
     */
    async retrieveMemory(id) {
        try {
            const task = new QueueTask({
                type: 'RETRIEVE_MEMORY',
                priority: 1,
                data: { id }
            });

            const result = await this.queueManager.enqueue(task);
            
            // עדכון מטריקות
            this.monitor.recordMetric('memory_retrieve_success', 1);
            this.monitor.recordMetric('memory_retrieve_latency', 
                Date.now() - task.timestamp
            );

            return result;
        } catch (error) {
            // תיעוד שגיאה
            this.monitor.recordError('memory_retrieve_error', error);
            throw error;
        }
    }

    /**
     * חישוב עדיפות משימה
     */
    calculateTaskPriority(memory) {
        const factors = {
            importance: memory.importance,
            recency: this.calculateRecencyFactor(memory.timestamp),
            emotionalIntensity: memory.metadata.emotionalIntensity
        };

        // שקלול גורמים
        const weights = {
            importance: 0.4,
            recency: 0.3,
            emotionalIntensity: 0.3
        };

        const score = Object.entries(factors).reduce((sum, [factor, value]) => 
            sum + (value * weights[factor]), 0
        );

        // המרה לרמת עדיפות
        if (score > 0.8) return 3;
        if (score > 0.5) return 2;
        return 1;
    }

    /**
     * קבלת סטטיסטיקות מערכת
     */
    async getSystemStats() {
        return {
            queueStats: this.queueManager.getStats(),
            shardStats: this.shardManager.getStats(),
            memoryStats: {
                totalMemories: this.memories.size,
                cacheSize: this.memoryCache.size,
                averageLatency: this.monitor.getAverageLatency()
            },
            errorStats: this.monitor.getErrorStats()
        };
    }
}

/**
 * מערכת אחסון וקטורי
 */
class VectorStore {
    constructor() {
        this.embeddings = new Map();
        this.index = new HNSWIndex(); // הוספת אינדקס וקטורי
    }

    createEmbedding(text) {
        // כאן ייושם אלגוריתם יצירת embeddings
        // לדוגמה: שימוש ב-OpenAI API או מודל מקומי
        const embedding = new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
        
        // הוספה לאינדקס
        this.index.add(embedding);
        
        return embedding;
    }

    cosineSimilarity(vec1, vec2) {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (norm1 * norm2);
    }
}

/**
 * אינדקס וקטורי HNSW
 */
class HNSWIndex {
    constructor() {
        this.layers = [];
        this.maxLayers = 16;
        this.maxNeighbors = 16;
        this.efConstruction = 200;
    }

    add(vector) {
        // כאן ייושם אלגוריתם HNSW
    }

    search(query, k = 10) {
        // כאן ייושם אלגוריתם חיפוש HNSW
        return [];
    }
}

/**
 * מנהל שרדים
 */
class ShardManager {
    constructor(config) {
        this.numShards = config.numShards;
        this.shardStrategy = config.shardStrategy;
        this.loadBalancer = config.loadBalancer;
        this.shards = new Map();
        this.initializeShards();
    }

    /**
     * אתחול שרדים
     */
    async initializeShards() {
        for (let i = 0; i < this.numShards; i++) {
            this.shards.set(i, new MemoryShard({
                id: i,
                maxSize: 1000,
                backupInterval: 5 * 60 * 1000
            }));
        }
    }

    /**
     * קבלת מזהה שרד
     */
    getShardId(memory) {
        switch (this.shardStrategy) {
            case 'agent':
                return this.getAgentBasedShardId(memory);
            case 'simulation':
                return this.getSimulationBasedShardId(memory);
            case 'hybrid':
                return this.getHybridShardId(memory);
            default:
                return 0;
        }
    }

    /**
     * קבלת מזהה שרד לפי סוכן
     */
    getAgentBasedShardId(memory) {
        const agentId = memory.participants[0];
        return parseInt(agentId, 16) % this.numShards;
    }

    /**
     * קבלת מזהה שרד לפי סימולציה
     */
    getSimulationBasedShardId(memory) {
        const simulationId = memory.context.simulationId;
        return parseInt(simulationId, 16) % this.numShards;
    }

    /**
     * קבלת מזהה שרד היברידי
     */
    getHybridShardId(memory) {
        const agentId = this.getAgentBasedShardId(memory);
        const simulationId = this.getSimulationBasedShardId(memory);
        return (agentId + simulationId) % this.numShards;
    }

    /**
     * קבלת שרד
     */
    async getShard(shardId) {
        return this.shards.get(shardId);
    }

    /**
     * קבלת כל השרדים
     */
    async getAllShards() {
        return Array.from(this.shards.values());
    }
}

/**
 * שרד זיכרונות
 */
class MemoryShard {
    constructor(config) {
        this.id = config.id;
        this.maxSize = config.maxSize;
        this.backupInterval = config.backupInterval;
        this.memories = new Map();
        this.vectorStore = new VectorStore();
        this.lastBackup = Date.now();
    }

    /**
     * שמירת זיכרון בשרד
     */
    async save(memory) {
        this.memories.set(memory.id, memory);
        this.vectorStore.add(memory.vector);
        
        // ניהול גודל
        if (this.memories.size > this.maxSize) {
            await this.cleanup();
        }
    }

    /**
     * אחזור זיכרון מהשרד
     */
    async retrieve(id) {
        return this.memories.get(id);
    }

    /**
     * חיפוש סמנטי בשרד
     */
    async semanticSearch(queryVector, threshold) {
        const results = [];
        
        for (const [id, memory] of this.memories) {
            const similarity = this.vectorStore.cosineSimilarity(
                queryVector,
                memory.vector
            );

            if (similarity >= threshold) {
                results.push({
                    ...memory,
                    relevance: similarity
                });
            }
        }

        return results;
    }

    /**
     * ניקוי זיכרונות ישנים
     */
    async cleanup() {
        const sortedMemories = Array.from(this.memories.entries())
            .sort(([, a], [, b]) => a.timestamp - b.timestamp);

        while (this.memories.size > this.maxSize) {
            const [id] = sortedMemories.shift();
            this.memories.delete(id);
            this.vectorStore.remove(id);
        }
    }
}

/**
 * מערכת איזון עומסים
 */
class LoadBalancer {
    constructor() {
        this.shardLoads = new Map();
        this.threshold = 0.8; // סף עומס
    }

    /**
     * עדכון עומס שרד
     */
    updateShardLoad(shardId, load) {
        this.shardLoads.set(shardId, load);
    }

    /**
     * בדיקת עומס שרד
     */
    isShardOverloaded(shardId) {
        const load = this.shardLoads.get(shardId) || 0;
        return load > this.threshold;
    }

    /**
     * מציאת שרד פנוי
     */
    findAvailableShard() {
        for (const [shardId, load] of this.shardLoads) {
            if (load < this.threshold) {
                return shardId;
            }
        }
        return null;
    }
}

/**
 * מנהל תורים
 */
class QueueManager {
    constructor(config) {
        this.maxQueueSize = config.maxQueueSize;
        this.processingInterval = config.processingInterval;
        this.priorityLevels = config.priorityLevels;
        this.queues = new Map();
        this.processing = false;
        this.initializeQueues();
        this.startProcessing();
    }

    /**
     * אתחול תורים
     */
    initializeQueues() {
        for (let i = 1; i <= this.priorityLevels; i++) {
            this.queues.set(i, []);
        }
    }

    /**
     * הוספת משימה לתור
     */
    async enqueue(task) {
        if (this.getTotalQueueSize() >= this.maxQueueSize) {
            // דחיית משימות לא קריטיות
            if (task.priority < 3) {
                throw new Error('Queue full, task rejected');
            }
        }

        const queue = this.queues.get(task.priority);
        queue.push(task);

        // החזרת הבטחה שתפתור כשהמשימה תסיים
        return new Promise((resolve, reject) => {
            task.resolve = resolve;
            task.reject = reject;
        });
    }

    /**
     * קבלת גודל כולל של התורים
     */
    getTotalQueueSize() {
        return Array.from(this.queues.values())
            .reduce((sum, queue) => sum + queue.length, 0);
    }

    /**
     * התחלת עיבוד תורים
     */
    startProcessing() {
        this.processing = true;
        this.processQueues();
    }

    /**
     * עיבוד תורים
     */
    async processQueues() {
        while (this.processing) {
            for (let i = this.priorityLevels; i >= 1; i--) {
                const queue = this.queues.get(i);
                if (queue.length > 0) {
                    const task = queue.shift();
                    await this.processTask(task);
                }
            }
            await new Promise(resolve => 
                setTimeout(resolve, this.processingInterval)
            );
        }
    }

    /**
     * עיבוד משימה
     */
    async processTask(task) {
        try {
            let result;
            switch (task.type) {
                case 'SAVE_MEMORY':
                    result = await this.processSaveMemory(task.data);
                    break;
                case 'RETRIEVE_MEMORY':
                    result = await this.processRetrieveMemory(task.data.id);
                    break;
                default:
                    throw new Error(`Unknown task type: ${task.type}`);
            }
            task.resolve(result);
        } catch (error) {
            task.reject(error);
        }
    }

    /**
     * עיבוד שמירת זיכרון
     */
    async processSaveMemory(memory) {
        // כאן ייושם הלוגיקה לשמירת זיכרון
        return true;
    }

    /**
     * עיבוד אחזור זיכרון
     */
    async processRetrieveMemory(id) {
        // כאן ייושם הלוגיקה לאחזור זיכרון
        return null;
    }

    /**
     * עצירת עיבוד תורים
     */
    stopProcessing() {
        this.processing = false;
    }
}

/**
 * משימת תור
 */
class QueueTask {
    constructor(config) {
        this.type = config.type;
        this.priority = config.priority;
        this.data = config.data;
        this.timestamp = Date.now();
        this.resolve = null;
        this.reject = null;
    }
}

/**
 * מערכת ניטור זיכרונות
 */
class MemoryMonitor {
    constructor(config) {
        this.alertThresholds = config.alertThresholds;
        this.metricsInterval = config.metricsInterval;
        this.notificationChannels = config.notificationChannels;
        this.metrics = new Map();
        this.errors = new Map();
        this.latencies = [];
        this.startMonitoring();
    }

    /**
     * התחלת ניטור
     */
    startMonitoring() {
        setInterval(() => {
            this.checkThresholds();
            this.cleanupOldMetrics();
        }, this.metricsInterval);
    }

    /**
     * תיעוד מטריקה
     */
    recordMetric(name, value) {
        const currentMetrics = this.metrics.get(name) || [];
        currentMetrics.push({
            timestamp: Date.now(),
            value
        });
        this.metrics.set(name, currentMetrics);
    }

    /**
     * תיעוד שגיאה
     */
    recordError(type, error) {
        const currentErrors = this.errors.get(type) || [];
        currentErrors.push({
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack
        });
        this.errors.set(type, currentErrors);
    }

    /**
     * בדיקת ספים
     */
    checkThresholds() {
        const queueSize = this.getCurrentQueueSize();
        const shardLoad = this.getCurrentShardLoad();
        const errorRate = this.getCurrentErrorRate();

        if (queueSize > this.alertThresholds.queueSize) {
            this.sendAlert('QUEUE_SIZE_HIGH', {
                current: queueSize,
                threshold: this.alertThresholds.queueSize
            });
        }

        if (shardLoad > this.alertThresholds.shardLoad) {
            this.sendAlert('SHARD_LOAD_HIGH', {
                current: shardLoad,
                threshold: this.alertThresholds.shardLoad
            });
        }

        if (errorRate > this.alertThresholds.errorRate) {
            this.sendAlert('ERROR_RATE_HIGH', {
                current: errorRate,
                threshold: this.alertThresholds.errorRate
            });
        }
    }

    /**
     * שליחת התראה
     */
    async sendAlert(type, data) {
        const message = this.formatAlertMessage(type, data);
        
        for (const channel of this.notificationChannels) {
            switch (channel) {
                case 'email':
                    await this.sendEmailAlert(message);
                    break;
                case 'webhook':
                    await this.sendWebhookAlert(message);
                    break;
                case 'sms':
                    await this.sendSMSAlert(message);
                    break;
            }
        }
    }

    /**
     * פורמט הודעת התראה
     */
    formatAlertMessage(type, data) {
        const messages = {
            QUEUE_SIZE_HIGH: `גודל התור חורג מהסף: ${data.current}/${data.threshold}`,
            SHARD_LOAD_HIGH: `עומס שרד חורג מהסף: ${data.current}/${data.threshold}`,
            ERROR_RATE_HIGH: `שיעור שגיאות חורג מהסף: ${data.current}/${data.threshold}`
        };

        return {
            type,
            message: messages[type],
            timestamp: Date.now(),
            data
        };
    }

    /**
     * קבלת גודל תור נוכחי
     */
    getCurrentQueueSize() {
        return this.metrics.get('queue_size')?.slice(-1)[0]?.value || 0;
    }

    /**
     * קבלת עומס שרד נוכחי
     */
    getCurrentShardLoad() {
        return this.metrics.get('shard_load')?.slice(-1)[0]?.value || 0;
    }

    /**
     * קבלת שיעור שגיאות נוכחי
     */
    getCurrentErrorRate() {
        const recentErrors = this.errors.get('memory_save_error')?.length || 0;
        const recentOperations = this.metrics.get('memory_save_success')?.length || 1;
        return recentErrors / recentOperations;
    }

    /**
     * קבלת ממוצע זמן תגובה
     */
    getAverageLatency() {
        if (this.latencies.length === 0) return 0;
        return this.latencies.reduce((sum, lat) => sum + lat, 0) / this.latencies.length;
    }

    /**
     * קבלת סטטיסטיקות שגיאות
     */
    getErrorStats() {
        const stats = {};
        
        for (const [type, errors] of this.errors) {
            stats[type] = {
                count: errors.length,
                recentErrors: errors.slice(-10),
                rate: errors.length / (Date.now() - errors[0]?.timestamp || 1)
            };
        }

        return stats;
    }

    /**
     * ניקוי מטריקות ישנות
     */
    cleanupOldMetrics() {
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 שעות

        for (const [name, metrics] of this.metrics) {
            this.metrics.set(
                name,
                metrics.filter(m => m.timestamp > cutoff)
            );
        }

        for (const [type, errors] of this.errors) {
            this.errors.set(
                type,
                errors.filter(e => e.timestamp > cutoff)
            );
        }
    }
}

module.exports = EpisodicMemory; 