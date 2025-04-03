/**
 * Simulation Analytics Module
 * Analyzes simulation results and generates insights
 */

import { MemorySystem } from './memory-system.js';

export class SimulationAnalytics {
    constructor() {
        this.analyticsData = new Map();
        this.keywordCache = new Map();
    }

    /**
     * Analyze a simulation's conversation history
     * @param {Array} conversationHistory - Array of conversation messages
     * @param {string} simulationId - ID of the simulation
     * @returns {Object} Analysis results
     */
    analyzeConversation(conversationHistory, simulationId) {
        const analysis = {
            sentiment: this.analyzeSentiment(conversationHistory),
            keywords: this.extractKeywords(conversationHistory),
            responseTimes: this.calculateResponseTimes(conversationHistory),
            messageLengths: this.analyzeMessageLengths(conversationHistory),
            topics: this.identifyTopics(conversationHistory),
            emotionalProgression: this.analyzeEmotionalProgression(conversationHistory)
        };

        this.analyticsData.set(simulationId, analysis);
        return analysis;
    }

    /**
     * Analyze sentiment of messages
     * @param {Array} messages - Array of messages
     * @returns {Object} Sentiment analysis results
     */
    analyzeSentiment(messages) {
        const positiveWords = ['excellent', 'great', 'thanks', 'love', 'wonderful', 'fun'];
        const negativeWords = ['bad', 'terrible', 'annoying', 'boring', 'not good', 'frustrating'];
        
        const sentimentScores = messages.map(message => {
            const words = message.content.toLowerCase().split(/\s+/);
            const positiveCount = words.filter(word => positiveWords.includes(word)).length;
            const negativeCount = words.filter(word => negativeWords.includes(word)).length;
            
            return {
                message: message.content,
                score: (positiveCount - negativeCount) * 0.2,
                timestamp: message.timestamp
            };
        });

        return {
            scores: sentimentScores,
            average: sentimentScores.reduce((sum, score) => sum + score.score, 0) / sentimentScores.length,
            trend: this.calculateTrend(sentimentScores.map(s => s.score))
        };
    }

    /**
     * Extract keywords from messages
     * @param {Array} messages - Array of messages
     * @returns {Object} Keyword analysis results
     */
    extractKeywords(messages) {
        const stopWords = ['the', 'a', 'and', 'in', 'to', 'of', 'for', 'with', 'on', 'at', 'from'];
        const wordFreq = new Map();
        
        messages.forEach(message => {
            const words = message.content.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (!stopWords.includes(word) && word.length > 2) {
                    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
                }
            });
        });

        const keywords = Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, freq]) => ({
                word,
                frequency: freq,
                percentage: (freq / messages.length) * 100
            }));

        return {
            keywords,
            wordCloud: this.generateWordCloud(keywords)
        };
    }

    /**
     * Calculate response times between messages
     * @param {Array} messages - Array of messages
     * @returns {Object} Response time analysis
     */
    calculateResponseTimes(messages) {
        const responseTimes = [];
        
        for (let i = 1; i < messages.length; i++) {
            const timeDiff = messages[i].timestamp - messages[i-1].timestamp;
            responseTimes.push({
                from: messages[i-1].role,
                to: messages[i].role,
                duration: timeDiff
            });
        }

        return {
            times: responseTimes,
            average: responseTimes.reduce((sum, rt) => sum + rt.duration, 0) / responseTimes.length,
            max: Math.max(...responseTimes.map(rt => rt.duration)),
            min: Math.min(...responseTimes.map(rt => rt.duration))
        };
    }

    /**
     * Analyze message lengths
     * @param {Array} messages - Array of messages
     * @returns {Object} Message length analysis
     */
    analyzeMessageLengths(messages) {
        const lengths = messages.map(message => ({
            role: message.role,
            length: message.content.length,
            wordCount: message.content.split(/\s+/).length
        }));

        return {
            lengths,
            average: lengths.reduce((sum, l) => sum + l.length, 0) / lengths.length,
            averageWords: lengths.reduce((sum, l) => sum + l.wordCount, 0) / lengths.length,
            byRole: this.groupByRole(lengths)
        };
    }

    /**
     * Identify main topics in conversation
     * @param {Array} messages - Array of messages
     * @returns {Object} Topic analysis
     */
    identifyTopics(messages) {
        const topics = new Map();
        const topicKeywords = {
            'Performance': ['performance', 'efficiency', 'speed'],
            'Price': ['cost', 'pricing', 'budget'],
            'Support': ['help', 'assistance', 'support'],
            'Quality': ['quality', 'materials', 'durability'],
            'Innovation': ['new', 'innovation', 'innovative']
        };

        messages.forEach(message => {
            const words = message.content.toLowerCase().split(/\s+/);
            Object.entries(topicKeywords).forEach(([topic, keywords]) => {
                const matches = words.filter(word => keywords.includes(word)).length;
                if (matches > 0) {
                    topics.set(topic, (topics.get(topic) || 0) + matches);
                }
            });
        });

        return {
            topics: Array.from(topics.entries()).map(([topic, count]) => ({
                topic,
                count,
                percentage: (count / messages.length) * 100
            })),
            heatmap: this.generateTopicHeatmap(topics)
        };
    }

    /**
     * Analyze emotional progression
     * @param {Array} messages - Array of messages
     * @returns {Object} Emotional progression analysis
     */
    analyzeEmotionalProgression(messages) {
        const emotions = messages.map(message => ({
            timestamp: message.timestamp,
            emotion: this.detectEmotion(message.content)
        }));

        return {
            progression: emotions,
            transitions: this.analyzeEmotionTransitions(emotions),
            dominantEmotions: this.findDominantEmotions(emotions)
        };
    }

    /**
     * Detect emotion in text
     * @param {string} text - Text to analyze
     * @returns {string} Detected emotion
     */
    detectEmotion(text) {
        const emotionKeywords = {
            'Happy': ['excellent', 'great', 'thanks', 'love', 'wonderful', 'fun'],
            'Sad': ['bad', 'terrible', 'annoying', 'boring', 'not good', 'frustrating'],
            'Angry': ['angry', 'annoying', 'frustrating'],
            'Surprised': ['wow', 'amazing', 'astonishing'],
            'Neutral': []
        };

        const words = text.toLowerCase().split(/\s+/);
        let maxMatches = 0;
        let detectedEmotion = 'Neutral';

        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
            const matches = words.filter(word => keywords.includes(word)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedEmotion = emotion;
            }
        });

        return detectedEmotion;
    }

    /**
     * Analyze emotion transitions
     * @param {Array} emotions - Array of emotions
     * @returns {Object} Transition analysis
     */
    analyzeEmotionTransitions(emotions) {
        const transitions = new Map();
        
        for (let i = 1; i < emotions.length; i++) {
            const from = emotions[i-1].emotion;
            const to = emotions[i].emotion;
            const key = `${from}->${to}`;
            transitions.set(key, (transitions.get(key) || 0) + 1);
        }

        return Array.from(transitions.entries()).map(([transition, count]) => ({
            from: transition.split('->')[0],
            to: transition.split('->')[1],
            count,
            percentage: (count / (emotions.length - 1)) * 100
        }));
    }

    /**
     * Find dominant emotions
     * @param {Array} emotions - Array of emotions
     * @returns {Array} Dominant emotions
     */
    findDominantEmotions(emotions) {
        const emotionCounts = new Map();
        
        emotions.forEach(({emotion}) => {
            emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
        });

        return Array.from(emotionCounts.entries())
            .map(([emotion, count]) => ({
                emotion,
                count,
                percentage: (count / emotions.length) * 100
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    }

    /**
     * Generate word cloud data
     * @param {Array} keywords - Array of keywords with frequencies
     * @returns {Array} Word cloud data
     */
    generateWordCloud(keywords) {
        return keywords.map(({word, frequency}) => ({
            text: word,
            size: Math.min(50, Math.max(12, frequency * 2))
        }));
    }

    /**
     * Generate topic heatmap data
     * @param {Map} topics - Map of topics and their frequencies
     * @returns {Array} Heatmap data
     */
    generateTopicHeatmap(topics) {
        return Array.from(topics.entries()).map(([topic, count]) => ({
            topic,
            intensity: Math.min(1, count / 10)
        }));
    }

    /**
     * Group data by role
     * @param {Array} data - Array of data points
     * @returns {Object} Grouped data
     */
    groupByRole(data) {
        const grouped = new Map();
        
        data.forEach(item => {
            if (!grouped.has(item.role)) {
                grouped.set(item.role, []);
            }
            grouped.get(item.role).push(item);
        });

        return Object.fromEntries(grouped);
    }

    /**
     * Calculate trend of values
     * @param {Array} values - Array of numeric values
     * @returns {string} Trend direction
     */
    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.1) return 'increasing';
        if (secondAvg < firstAvg * 0.9) return 'decreasing';
        return 'stable';
    }

    /**
     * Get analytics data for a simulation
     * @param {string} simulationId - ID of the simulation
     * @returns {Object} Analytics data
     */
    getAnalyticsData(simulationId) {
        return this.analyticsData.get(simulationId);
    }

    /**
     * Compare multiple simulations
     * @param {Array} simulationIds - Array of simulation IDs
     * @returns {Object} Comparison results
     */
    compareSimulations(simulationIds) {
        const comparison = {
            sentiment: this.compareSentiment(simulationIds),
            responseTimes: this.compareResponseTimes(simulationIds),
            topics: this.compareTopics(simulationIds),
            emotions: this.compareEmotions(simulationIds)
        };

        return comparison;
    }

    /**
     * Compare sentiment between simulations
     * @param {Array} simulationIds - Array of simulation IDs
     * @returns {Object} Sentiment comparison
     */
    compareSentiment(simulationIds) {
        const sentiments = simulationIds.map(id => {
            const data = this.analyticsData.get(id);
            return {
                id,
                average: data.sentiment.average,
                trend: data.sentiment.trend
            };
        });

        return {
            simulations: sentiments,
            average: sentiments.reduce((sum, s) => sum + s.average, 0) / sentiments.length
        };
    }

    /**
     * Compare response times between simulations
     * @param {Array} simulationIds - Array of simulation IDs
     * @returns {Object} Response time comparison
     */
    compareResponseTimes(simulationIds) {
        const times = simulationIds.map(id => {
            const data = this.analyticsData.get(id);
            return {
                id,
                average: data.responseTimes.average,
                max: data.responseTimes.max,
                min: data.responseTimes.min
            };
        });

        return {
            simulations: times,
            average: times.reduce((sum, t) => sum + t.average, 0) / times.length
        };
    }

    /**
     * Compare topics between simulations
     * @param {Array} simulationIds - Array of simulation IDs
     * @returns {Object} Topic comparison
     */
    compareTopics(simulationIds) {
        const topics = new Map();
        
        simulationIds.forEach(id => {
            const data = this.analyticsData.get(id);
            data.topics.topics.forEach(({topic, count, percentage}) => {
                if (!topics.has(topic)) {
                    topics.set(topic, []);
                }
                topics.get(topic).push({
                    simulationId: id,
                    count,
                    percentage
                });
            });
        });

        return {
            topics: Array.from(topics.entries()).map(([topic, data]) => ({
                topic,
                simulations: data
            }))
        };
    }

    /**
     * Compare emotions between simulations
     * @param {Array} simulationIds - Array of simulation IDs
     * @returns {Object} Emotion comparison
     */
    compareEmotions(simulationIds) {
        const emotions = new Map();
        
        simulationIds.forEach(id => {
            const data = this.analyticsData.get(id);
            data.emotionalProgression.dominantEmotions.forEach(({emotion, count, percentage}) => {
                if (!emotions.has(emotion)) {
                    emotions.set(emotion, []);
                }
                emotions.get(emotion).push({
                    simulationId: id,
                    count,
                    percentage
                });
            });
        });

        return {
            emotions: Array.from(emotions.entries()).map(([emotion, data]) => ({
                emotion,
                simulations: data
            }))
        };
    }
} 