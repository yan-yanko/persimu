/**
 * Demo Manager
 * Manages demo scenarios and result presentation
 */

import { PersonaManager } from './persona-manager.js';
import { SimulationManager } from './simulation-manager.js';
import { SimulationAnalytics } from './simulation-analytics.js';
import { PersimuAPI } from './api.js';

export class DemoManager {
    constructor() {
        // Initialize API and managers
        this.api = new PersimuAPI();
        this.personaManager = new PersonaManager(this.api);
        this.simulationManager = new SimulationManager(this.api);
        this.analytics = new SimulationAnalytics(this.api);
        
        // Demo state
        this.currentScenario = null;
        this.isRunning = false;
        this.demoData = {
            personas: [],
            conversations: [],
            insights: []
        };
    }

    /**
     * Initialize the demo system
     */
    async initialize() {
        try {
            // Load demo data
            await this.loadDemoData();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update UI
            this.updateUI();
        } catch (error) {
            console.error('Error initializing demo:', error);
            this.displayError('Failed to initialize demo system');
        }
    }

    /**
     * Load demo data
     */
    async loadDemoData() {
        try {
            // Load personas from API
            this.demoData.personas = await this.api.getPersonas();
            
            // Load scenarios from API
            const scenarios = await this.api.getSimulations();
            this.demoData.scenarios = scenarios.filter(s => s.type === 'demo');
        } catch (error) {
            console.error('Error loading demo data:', error);
            throw error;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Scenario selection
        document.getElementById('scenario-selector').addEventListener('change', (e) => {
            this.selectScenario(e.target.value);
        });

        // Control buttons
        document.getElementById('start-demo').addEventListener('click', () => {
            this.startDemo();
        });

        document.getElementById('stop-demo').addEventListener('click', () => {
            this.stopDemo();
        });

        document.getElementById('reset-demo').addEventListener('click', () => {
            this.resetDemo();
        });
    }

    /**
     * Select a demo scenario
     * @param {string} scenarioId - ID of the selected scenario
     */
    selectScenario(scenarioId) {
        this.currentScenario = this.demoData.scenarios.find(s => s.id === scenarioId);
        this.updateUI();
    }

    /**
     * Start the demo
     */
    async startDemo() {
        if (!this.currentScenario || this.isRunning) return;

        try {
            this.isRunning = true;
            this.demoData.conversations = [];
            this.demoData.insights = [];

            // Create new simulation
            const simulation = await this.api.createSimulation({
                type: 'demo',
                scenarioId: this.currentScenario.id,
                status: 'running'
            });

            // Run scenario steps
            for (const step of this.currentScenario.steps) {
                await this.addMessage(step.role, step.message);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Update simulation status
            await this.api.updateSimulation(simulation.id, {
                status: 'completed'
            });

            // Generate insights
            await this.generateInsights();
            this.isRunning = false;
        } catch (error) {
            console.error('Error running demo:', error);
            this.displayError('Failed to run demo scenario');
            this.isRunning = false;
        }
    }

    /**
     * Stop the demo
     */
    async stopDemo() {
        if (!this.isRunning) return;

        try {
            this.isRunning = false;
            // Additional cleanup if needed
        } catch (error) {
            console.error('Error stopping demo:', error);
            this.displayError('Failed to stop demo');
        }
    }

    /**
     * Reset the demo
     */
    async resetDemo() {
        try {
            this.currentScenario = null;
            this.isRunning = false;
            this.demoData.conversations = [];
            this.demoData.insights = [];
            this.updateUI();
        } catch (error) {
            console.error('Error resetting demo:', error);
            this.displayError('Failed to reset demo');
        }
    }

    /**
     * Add a message to the chat
     * @param {string} role - Role of the message sender
     * @param {string} message - Message content
     */
    async addMessage(role, message) {
        try {
            const chatDisplay = document.getElementById('chat-display');
            const messageElement = document.createElement('div');
            messageElement.className = `message ${role}`;
            messageElement.textContent = message;
            chatDisplay.appendChild(messageElement);
            chatDisplay.scrollTop = chatDisplay.scrollHeight;

            // Store message in conversations array
            this.demoData.conversations.push({
                role,
                message,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    }

    /**
     * Generate insights from the demo
     */
    async generateInsights() {
        try {
            const insightsDisplay = document.getElementById('insights-display');
            insightsDisplay.innerHTML = '';

            // Get insights from API
            const insights = await this.api.getSimulationResults(this.currentScenario.id);

            // Display insights
            for (const insight of insights) {
                const insightElement = document.createElement('div');
                insightElement.className = 'insight-card';
                insightElement.innerHTML = `
                    <h3>${insight.type}</h3>
                    <p>${insight.content}</p>
                `;
                insightsDisplay.appendChild(insightElement);
            }
        } catch (error) {
            console.error('Error generating insights:', error);
            this.displayError('Failed to generate insights');
        }
    }

    /**
     * Update the UI
     */
    updateUI() {
        try {
            // Update personas display
            const personasDisplay = document.getElementById('personas-display');
            personasDisplay.innerHTML = this.demoData.personas.map(persona => `
                <div class="persona-card">
                    <h3>${persona.name}</h3>
                    <p>${persona.role}</p>
                    <p>${persona.personality}</p>
                </div>
            `).join('');

            // Update scenario selector
            const scenarioSelector = document.getElementById('scenario-selector');
            scenarioSelector.innerHTML = `
                <option value="">Select a scenario</option>
                ${this.demoData.scenarios.map(scenario => `
                    <option value="${scenario.id}">${scenario.name}</option>
                `).join('')}
            `;

            // Update control buttons
            const startButton = document.getElementById('start-demo');
            const stopButton = document.getElementById('stop-demo');
            const resetButton = document.getElementById('reset-demo');

            startButton.disabled = !this.currentScenario || this.isRunning;
            stopButton.disabled = !this.isRunning;
            resetButton.disabled = !this.currentScenario && !this.isRunning;
        } catch (error) {
            console.error('Error updating UI:', error);
            this.displayError('Failed to update interface');
        }
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
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
}

// Create global instance
const demoManager = new DemoManager();

// Initialize demo when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    demoManager.initialize();
}); 