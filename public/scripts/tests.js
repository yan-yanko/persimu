/**
 * System Testing Module
 * Contains functions for testing system functionality
 */

import { PersonaManager } from './persona-manager.js';
import { SimulationManager } from './simulation-manager.js';
import { SimulationAnalytics } from './simulation-analytics.js';
import { PersimuAPI } from './api.js';

export class SystemTester {
    constructor() {
        this.results = [];
        this.api = new PersimuAPI();
        this.personaManager = new PersonaManager(this.api);
        this.simulationManager = new SimulationManager(this.api);
        this.analytics = new SimulationAnalytics(this.api);
    }

    /**
     * Run all system tests
     */
    async runAllTests() {
        this.results = [];
        
        try {
            // Run individual tests
            await this.testAuthentication();
            await this.testPersonaLoading();
            await this.testMemorySystem();
            await this.testPromptBuilding();
            await this.testAPIIntegration();
            await this.testUI();
            
            // Display results
            this.displayResults();
        } catch (error) {
            console.error('Error running tests:', error);
            this.results.push({
                test: 'Test Suite',
                success: false,
                message: `Error: ${error.message}`
            });
            this.displayResults();
        }
    }

    /**
     * Test authentication functionality
     */
    async testAuthentication() {
        try {
            const response = await this.api.login('admin', 'admin');
            this.results.push({
                test: 'Authentication',
                success: !!response.token,
                message: response.token ? 
                    'Authentication successful' : 
                    'Authentication failed'
            });
        } catch (error) {
            this.results.push({
                test: 'Authentication',
                success: false,
                message: `Error: ${error.message}`
            });
        }
    }

    /**
     * Test persona loading functionality
     */
    async testPersonaLoading() {
        try {
            const personas = await this.api.getPersonas();
            this.results.push({
                test: 'Persona Loading',
                success: Array.isArray(personas),
                message: Array.isArray(personas) ? 
                    `Successfully loaded ${personas.length} personas` : 
                    'Failed to load personas'
            });
        } catch (error) {
            this.results.push({
                test: 'Persona Loading',
                success: false,
                message: `Error: ${error.message}`
            });
        }
    }

    /**
     * Test memory system functionality
     */
    async testMemorySystem() {
        try {
            const testPersona = await this.api.createPersona({
                name: 'Test Persona',
                personality: 'Test personality'
            });
            
            const updatedPersona = await this.api.updatePersona(testPersona.id, {
                memory: ['Test memory']
            });
            
            this.results.push({
                test: 'Memory System',
                success: updatedPersona.memory && updatedPersona.memory.length > 0,
                message: updatedPersona.memory && updatedPersona.memory.length > 0 ? 
                    'Memory system working correctly' : 
                    'Failed to update memory'
            });

            // Cleanup
            await this.api.deletePersona(testPersona.id);
        } catch (error) {
            this.results.push({
                test: 'Memory System',
                success: false,
                message: `Error: ${error.message}`
            });
        }
    }

    /**
     * Test prompt building for language model
     */
    async testPromptBuilding() {
        try {
            const testPersona = await this.api.createPersona({
                name: 'Test Persona',
                personality: 'Test personality'
            });
            
            const response = await this.api.sendToLanguageModel({
                personaId: testPersona.id,
                message: 'Test message'
            });
            
            this.results.push({
                test: 'Prompt Building',
                success: !!response.response,
                message: response.response ? 
                    'Prompt built successfully' : 
                    'Failed to build prompt'
            });

            // Cleanup
            await this.api.deletePersona(testPersona.id);
        } catch (error) {
            this.results.push({
                test: 'Prompt Building',
                success: false,
                message: `Error: ${error.message}`
            });
        }
    }

    /**
     * Test integration with language model API
     */
    async testAPIIntegration() {
        try {
            const response = await this.api.sendToLanguageModel({
                message: 'Test message'
            });
            
            this.results.push({
                test: 'API Integration',
                success: !!response.response,
                message: response.response ? 
                    'API integration working' : 
                    'Failed to get API response'
            });
        } catch (error) {
            this.results.push({
                test: 'API Integration',
                success: false,
                message: `Error: ${error.message}`
            });
        }
    }

    /**
     * Test persona editor UI functionality
     */
    async testUI() {
        try {
            const uiElements = [
                'persona-form',
                'personality-input',
                'memory-section',
                'save-button'
            ];
            
            const allElementsExist = uiElements.every(id => 
                document.getElementById(id) !== null
            );
            
            this.results.push({
                test: 'UI Elements',
                success: allElementsExist,
                message: allElementsExist ? 
                    'All UI elements present' : 
                    'Missing UI elements'
            });
        } catch (error) {
            this.results.push({
                test: 'UI Elements',
                success: false,
                message: `Error: ${error.message}`
            });
        }
    }

    /**
     * Create container for test results
     */
    createResultsContainer() {
        let container = document.getElementById('test-results');
        if (!container) {
            container = document.createElement('div');
            container.id = 'test-results';
            container.className = 'test-results';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Display test results
     */
    displayResults() {
        const container = this.createResultsContainer();
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.success).length;
        
        container.innerHTML = `
            <div class="test-summary">
                <h2>Test Results</h2>
                <p>Total Tests: ${totalTests}</p>
                <p>Passed: ${passedTests}</p>
                <p>Failed: ${totalTests - passedTests}</p>
            </div>
            <div class="test-details">
                ${this.results.map(result => `
                    <div class="test-result ${result.success ? 'success' : 'failure'}">
                        <h3>${result.test}</h3>
                        <p>${result.message}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Create global instance
const systemTester = new SystemTester();

// Add styles for test results
const style = document.createElement('style');
style.textContent = `
    .test-results {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .test-summary {
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .test-result {
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 4px;
    }
    
    .test-result.success {
        background: #e8f5e9;
        border: 1px solid #c8e6c9;
    }
    
    .test-result.failure {
        background: #ffebee;
        border: 1px solid #ffcdd2;
    }
`;
document.head.appendChild(style);

// Export main test function
export function runAllTests() {
    systemTester.runAllTests();
} 