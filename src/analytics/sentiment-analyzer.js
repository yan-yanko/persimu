/**
 * מערכת לניתוח סנטימנט וטון
 */

class SentimentAnalyzer {
    constructor(config = {}) {
        this.sentimentHistory = new Map();
        this.emotionHistory = new Map();
        this.toneHistory = new Map();
        this.lexicon = this.loadLexicon();
    }

    /**
     * ניתוח סנטימנט בסיסי
     */
    async analyzeBasicSentiment(text) {
        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        words.forEach(word => {
            const sentiment = this.lexicon.sentiment[word];
            if (sentiment) {
                switch (sentiment) {
                    case 'positive':
                        positiveCount++;
                        break;
                    case 'negative':
                        negativeCount++;
                        break;
                    default:
                        neutralCount++;
                }
            }
        });

        const total = positiveCount + negativeCount + neutralCount;
        const score = total > 0
            ? (positiveCount - negativeCount) / total
            : 0;

        return {
            score,
            counts: { positive: positiveCount, negative: negativeCount, neutral: neutralCount },
            sentiment: this.determineSentiment(score)
        };
    }

    /**
     * ניתוח רגשות מתקדם
     */
    async analyzeEmotions(text) {
        const words = text.toLowerCase().split(/\s+/);
        const emotions = new Map();

        words.forEach(word => {
            const emotion = this.lexicon.emotions[word];
            if (emotion) {
                emotions.set(emotion, (emotions.get(emotion) || 0) + 1);
            }
        });

        return {
            emotions: Array.from(emotions.entries()).map(([emotion, count]) => ({
                emotion,
                count,
                intensity: this.calculateEmotionIntensity(emotion, count)
            })),
            dominantEmotion: this.findDominantEmotion(emotions)
        };
    }

    /**
     * ניתוח טון דיבור
     */
    async analyzeTone(text) {
        const words = text.toLowerCase().split(/\s+/);
        const tones = new Map();

        words.forEach(word => {
            const tone = this.lexicon.tones[word];
            if (tone) {
                tones.set(tone, (tones.get(tone) || 0) + 1);
            }
        });

        return {
            tones: Array.from(tones.entries()).map(([tone, count]) => ({
                tone,
                count,
                percentage: (count / words.length) * 100
            })),
            dominantTone: this.findDominantTone(tones)
        };
    }

    /**
     * מעקב אחר שינויי סנטימנט
     */
    trackSentimentChanges(agentId, timestamp, sentiment) {
        if (!this.sentimentHistory.has(agentId)) {
            this.sentimentHistory.set(agentId, []);
        }

        const history = this.sentimentHistory.get(agentId);
        history.push({ timestamp, ...sentiment });

        // שמירת רק 1000 רשומות אחרונות
        if (history.length > 1000) {
            history.shift();
        }

        return this.analyzeSentimentTrend(history);
    }

    /**
     * ניתוח מגמת סנטימנט
     */
    analyzeSentimentTrend(history) {
        if (history.length < 2) return null;

        const scores = history.map(h => h.score);
        const trend = this.calculateTrend(scores);

        return {
            trend,
            volatility: this.calculateVolatility(scores),
            average: scores.reduce((sum, score) => sum + score, 0) / scores.length
        };
    }

    /**
     * טעינת לקסיקון
     */
    loadLexicon() {
        return {
            sentiment: {
                'מעולה': 'positive',
                'מצוין': 'positive',
                'תודה': 'positive',
                'אהבתי': 'positive',
                'נהדר': 'positive',
                'כיף': 'positive',
                'רע': 'negative',
                'נורא': 'negative',
                'מעצבן': 'negative',
                'משעמם': 'negative',
                'לא טוב': 'negative',
                'מתסכל': 'negative'
            },
            emotions: {
                'שמחה': 'happiness',
                'מעולה': 'happiness',
                'מצוין': 'happiness',
                'תודה': 'gratitude',
                'אהבתי': 'love',
                'נהדר': 'joy',
                'כיף': 'fun',
                'רע': 'sadness',
                'נורא': 'sadness',
                'מעצבן': 'anger',
                'משעמם': 'boredom',
                'לא טוב': 'disappointment',
                'מתסכל': 'frustration',
                'וואו': 'surprise',
                'מדהים': 'amazement',
                'מעורר השתאות': 'wonder'
            },
            tones: {
                'אנא': 'formal',
                'תודה': 'polite',
                'סליחה': 'apologetic',
                'בבקשה': 'polite',
                'אני מציע': 'suggestive',
                'חשוב לציין': 'formal',
                'וואלה': 'casual',
                'מגניב': 'casual',
                'אחלה': 'casual',
                'מעולה': 'enthusiastic',
                'מצוין': 'enthusiastic',
                'רע': 'negative',
                'נורא': 'negative',
                'מעצבן': 'aggressive'
            }
        };
    }

    /**
     * קביעת סנטימנט
     */
    determineSentiment(score) {
        if (score > 0.2) return 'positive';
        if (score < -0.2) return 'negative';
        return 'neutral';
    }

    /**
     * חישוב עוצמת רגש
     */
    calculateEmotionIntensity(emotion, count) {
        const baseIntensities = {
            happiness: 0.8,
            gratitude: 0.6,
            love: 0.9,
            joy: 0.8,
            fun: 0.7,
            sadness: 0.7,
            anger: 0.9,
            boredom: 0.4,
            disappointment: 0.6,
            frustration: 0.8,
            surprise: 0.7,
            amazement: 0.8,
            wonder: 0.7
        };

        return Math.min(1, baseIntensities[emotion] * (1 + count * 0.1));
    }

    /**
     * מציאת רגש דומיננטי
     */
    findDominantEmotion(emotions) {
        let maxCount = 0;
        let dominant = null;

        emotions.forEach((count, emotion) => {
            if (count > maxCount) {
                maxCount = count;
                dominant = emotion;
            }
        });

        return dominant;
    }

    /**
     * מציאת טון דומיננטי
     */
    findDominantTone(tones) {
        let maxCount = 0;
        let dominant = null;

        tones.forEach((count, tone) => {
            if (count > maxCount) {
                maxCount = count;
                dominant = tone;
            }
        });

        return dominant;
    }

    /**
     * חישוב מגמה
     */
    calculateTrend(scores) {
        if (scores.length < 2) return 0;

        const x = Array.from({ length: scores.length }, (_, i) => i);
        const y = scores;

        const n = scores.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    /**
     * חישוב תנודתיות
     */
    calculateVolatility(scores) {
        if (scores.length < 2) return 0;

        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        return Math.sqrt(variance);
    }
}

module.exports = SentimentAnalyzer; 