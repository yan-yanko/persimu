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