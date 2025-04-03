/**
 * Advanced Analytics Module
 * Contains advanced algorithms for simulation analysis and data visualization
 */

import { PersimuAPI } from './api.js';
import Chart from 'chart.js/auto';

export class AdvancedAnalytics {
    constructor(api) {
        this.api = api;
        this.charts = new Map();
        this.analysisData = {
            sentiment: {},
            behavior: {},
            insights: [],
            predictions: {}
        };
    }

    /**
     * Initialize analytics dashboard
     */
    async initialize() {
        try {
            // Load initial data
            await this.loadData();
            
            // Set up visualizations
            this.setupVisualizations();
            
            // Start real-time updates
            this.startRealTimeUpdates();
        } catch (error) {
            console.error('Error initializing analytics:', error);
            this.displayError('Failed to initialize analytics dashboard');
        }
    }

    /**
     * Load analysis data
     */
    async loadData() {
        try {
            // Get all simulations
            const simulations = await this.api.getSimulations();
            
            // Process each simulation
            for (const simulation of simulations) {
                await this.processSimulation(simulation);
            }
            
            // Update visualizations
            this.updateVisualizations();
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    /**
     * Process a single simulation
     * @param {Object} simulation - Simulation data
     */
    async processSimulation(simulation) {
        try {
            // Get simulation results
            const results = await this.api.getSimulationResults(simulation.id);
            
            // Analyze sentiment
            await this.analyzeSentiment(results);
            
            // Analyze behavior patterns
            await this.analyzeBehaviorPatterns(results);
            
            // Generate insights
            await this.generateInsights(results);
            
            // Make predictions
            await this.makePredictions(results);
        } catch (error) {
            console.error('Error processing simulation:', error);
            throw error;
        }
    }

    /**
     * Analyze sentiment in conversations
     * @param {Object} results - Simulation results
     */
    async analyzeSentiment(results) {
        try {
            const sentimentData = {
                positive: 0,
                negative: 0,
                neutral: 0,
                trends: []
            };

            // Process each message
            for (const message of results.messages) {
                const sentiment = await this.api.sendToLanguageModel({
                    type: 'sentiment',
                    message: message.content
                });

                // Update sentiment counts
                switch (sentiment.score) {
                    case 'positive':
                        sentimentData.positive++;
                        break;
                    case 'negative':
                        sentimentData.negative++;
                        break;
                    default:
                        sentimentData.neutral++;
                }

                // Add to trends
                sentimentData.trends.push({
                    timestamp: message.timestamp,
                    score: sentiment.score
                });
            }

            this.analysisData.sentiment = sentimentData;
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            throw error;
        }
    }

    /**
     * Analyze behavior patterns
     * @param {Object} results - Simulation results
     */
    async analyzeBehaviorPatterns(results) {
        try {
            const behaviorData = {
                patterns: [],
                topics: {},
                interactions: []
            };

            // Analyze conversation flow
            for (let i = 0; i < results.messages.length - 1; i++) {
                const current = results.messages[i];
                const next = results.messages[i + 1];

                // Identify topic transitions
                const transition = await this.api.sendToLanguageModel({
                    type: 'topic_transition',
                    current: current.content,
                    next: next.content
                });

                behaviorData.interactions.push({
                    from: current.role,
                    to: next.role,
                    topic: transition.topic
                });
            }

            // Identify common topics
            const topics = await this.api.sendToLanguageModel({
                type: 'topic_analysis',
                messages: results.messages
            });

            behaviorData.topics = topics;

            this.analysisData.behavior = behaviorData;
        } catch (error) {
            console.error('Error analyzing behavior patterns:', error);
            throw error;
        }
    }

    /**
     * Generate insights from analysis
     * @param {Object} results - Simulation results
     */
    async generateInsights(results) {
        try {
            const insights = await this.api.sendToLanguageModel({
                type: 'insights',
                data: {
                    sentiment: this.analysisData.sentiment,
                    behavior: this.analysisData.behavior,
                    messages: results.messages
                }
            });

            this.analysisData.insights = insights;
        } catch (error) {
            console.error('Error generating insights:', error);
            throw error;
        }
    }

    /**
     * Make predictions based on historical data
     * @param {Object} results - Simulation results
     */
    async makePredictions(results) {
        try {
            const predictions = await this.api.sendToLanguageModel({
                type: 'predictions',
                data: {
                    historical: results,
                    current: this.analysisData
                }
            });

            this.analysisData.predictions = predictions;
        } catch (error) {
            console.error('Error making predictions:', error);
            throw error;
        }
    }

    /**
     * Set up data visualizations
     */
    setupVisualizations() {
        // Sentiment Chart
        const sentimentCtx = document.getElementById('sentiment-chart');
        this.charts.set('sentiment', new Chart(sentimentCtx, {
            type: 'pie',
            data: {
                labels: ['Positive', 'Negative', 'Neutral'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#4CAF50', '#F44336', '#9E9E9E']
                }]
            }
        }));

        // Behavior Pattern Chart
        const behaviorCtx = document.getElementById('behavior-chart');
        this.charts.set('behavior', new Chart(behaviorCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Topic Transitions',
                    data: [],
                    borderColor: '#2196F3'
                }]
            }
        }));

        // Insights Heatmap
        const heatmapCtx = document.getElementById('insights-heatmap');
        this.charts.set('heatmap', new Chart(heatmapCtx, {
            type: 'matrix',
            data: {
                datasets: [{
                    data: [],
                    backgroundColor: (context) => {
                        const value = context.dataset.data[context.dataIndex];
                        return `rgba(33, 150, 243, ${value})`;
                    }
                }]
            }
        }));
    }

    /**
     * Update visualizations with current data
     */
    updateVisualizations() {
        // Update sentiment chart
        const sentimentChart = this.charts.get('sentiment');
        sentimentChart.data.datasets[0].data = [
            this.analysisData.sentiment.positive,
            this.analysisData.sentiment.negative,
            this.analysisData.sentiment.neutral
        ];
        sentimentChart.update();

        // Update behavior chart
        const behaviorChart = this.charts.get('behavior');
        behaviorChart.data.labels = this.analysisData.behavior.interactions.map(i => 
            `${i.from} → ${i.to}`
        );
        behaviorChart.data.datasets[0].data = this.analysisData.behavior.interactions.map(i => 
            i.topic
        );
        behaviorChart.update();

        // Update insights heatmap
        const heatmapChart = this.charts.get('heatmap');
        heatmapChart.data.datasets[0].data = this.analysisData.insights.map(insight => ({
            x: insight.category,
            y: insight.impact,
            v: insight.confidence
        }));
        heatmapChart.update();
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        // Update every 30 seconds
        setInterval(async () => {
            try {
                await this.loadData();
            } catch (error) {
                console.error('Error updating data:', error);
            }
        }, 30000);
    }

    /**
     * Export analysis report
     * @param {string} format - Export format (pdf, csv, json)
     */
    async exportReport(format) {
        try {
            const report = {
                timestamp: new Date().toISOString(),
                data: this.analysisData
            };

            let content;
            let filename;

            switch (format) {
                case 'json':
                    content = JSON.stringify(report, null, 2);
                    filename = 'analytics-report.json';
                    break;
                case 'csv':
                    content = this.convertToCSV(report);
                    filename = 'analytics-report.csv';
                    break;
                case 'pdf':
                    // Implement PDF generation
                    throw new Error('PDF export not implemented');
                default:
                    throw new Error('Unsupported export format');
            }

            // Create download link
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
            this.displayError('Failed to export report');
        }
    }

    /**
     * Convert report data to CSV format
     * @param {Object} report - Report data
     * @returns {string} CSV content
     */
    convertToCSV(report) {
        const rows = [];
        
        // Add headers
        rows.push(['Category', 'Metric', 'Value']);
        
        // Add sentiment data
        Object.entries(report.data.sentiment).forEach(([key, value]) => {
            if (typeof value === 'number') {
                rows.push(['Sentiment', key, value]);
            }
        });
        
        // Add behavior data
        report.data.behavior.interactions.forEach(interaction => {
            rows.push(['Behavior', 'Interaction', `${interaction.from} → ${interaction.to}`]);
        });
        
        // Add insights
        report.data.insights.forEach(insight => {
            rows.push(['Insight', insight.category, insight.description]);
        });
        
        return rows.map(row => row.join(',')).join('\n');
    }

    /**
     * Display error message
     * @param {string} message - Error message
     */
    displayError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.prepend(errorElement);
        
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
} 