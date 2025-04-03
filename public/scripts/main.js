/**
 * Main entry point for the Persimu system
 * Manages all main components and provides a unified interface for all pages
 */

import { PersonaManager } from './persona-manager.js';
import { SimulationManager } from './simulation-manager.js';
import { SimulationAnalytics } from './simulation-analytics.js';
import { SimulationEnvironment } from './simulation-environment.js';
import { PersimuAPI } from './api.js';

export class PersimuApp {
    constructor() {
        this.api = new PersimuAPI();
        this.simulationManager = null;
        this.environment = null;
        this.analytics = null;
        this.currentPage = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('Application is already initialized');
            return;
        }

        try {
            // Check browser compatibility
            if (!this.checkBrowserCompatibility()) {
                throw new Error('Your browser does not support all required features');
            }

            // Initialize main components
            this.simulationManager = new SimulationManager(this.api);
            this.environment = new SimulationEnvironment(this.api);
            this.analytics = new SimulationAnalytics(this.api);

            // Detect current page
            this.currentPage = this.detectCurrentPage();

            // Register global events
            this.registerGlobalEvents();

            this.isInitialized = true;
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            throw error;
        }
    }

    /**
     * Check browser compatibility
     * @returns {boolean} Whether the browser is compatible
     */
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'Promise',
            'Map',
            'Set',
            'async/await',
            'localStorage',
            'sessionStorage'
        ];

        return requiredFeatures.every(feature => {
            switch (feature) {
                case 'async/await':
                    return typeof async function(){}.constructor === 'function';
                default:
                    return typeof window[feature] !== 'undefined';
            }
        });
    }

    /**
     * Detect current page based on URL
     * @returns {string} Current page name
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('simulation.html')) return 'simulation';
        if (path.includes('simulation-dashboard.html')) return 'dashboard';
        if (path.includes('environment-editor.html')) return 'environment';
        return 'unknown';
    }

    /**
     * Register global events
     */
    registerGlobalEvents() {
        // Handle navigation between pages
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                this.handleNavigation(link.href);
            }
        });

        // Handle page load
        window.addEventListener('load', () => {
            this.handlePageLoad();
        });

        // Handle window unload
        window.addEventListener('beforeunload', (e) => {
            this.handleWindowUnload(e);
        });
    }

    /**
     * Handle navigation between pages
     * @param {string} url - Target URL
     */
    async handleNavigation(url) {
        try {
            // Save current state if needed
            await this.saveCurrentState();

            // Navigate to new page
            window.location.href = url;
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }

    /**
     * Handle page load
     */
    async handlePageLoad() {
        try {
            // Load saved state if exists
            await this.loadState();

            // Adapt interface for current page
            this.adaptSimulationPage();
        } catch (error) {
            console.error('Page load error:', error);
        }
    }

    /**
     * Handle window unload
     * @param {Event} event - Window unload event
     */
    async handleWindowUnload(event) {
        try {
            // Save state before closing
            await this.saveCurrentState();
        } catch (error) {
            console.error('State save error:', error);
        }
    }

    /**
     * Save current state to session storage
     * @returns {Promise<void>}
     */
    async saveCurrentState() {
        // Save simulation state
        if (this.simulationManager) {
            const simulationState = this.simulationManager.getSimulationStatuses();
            sessionStorage.setItem('simulationState', JSON.stringify(simulationState));
        }

        // Save environment state
        if (this.environment) {
            const environmentState = this.environment.getState();
            sessionStorage.setItem('environmentState', JSON.stringify(environmentState));
        }
    }

    /**
     * Load state from session storage
     * @returns {Promise<void>}
     */
    async loadState() {
        // Load simulation state
        const simulationState = sessionStorage.getItem('simulationState');
        if (simulationState && this.simulationManager) {
            const state = JSON.parse(simulationState);
            // Restore simulation state
        }

        // Load environment state
        const environmentState = sessionStorage.getItem('environmentState');
        if (environmentState && this.environment) {
            const state = JSON.parse(environmentState);
            // Restore environment state
        }
    }

    /**
     * Adapt interface for simulation page
     */
    adaptSimulationPage() {
        // Specific adaptations for simulation page
    }

    /**
     * Adapt interface for dashboard page
     */
    adaptDashboardPage() {
        // Specific adaptations for dashboard page
    }

    /**
     * Adapt interface for environment editor page
     */
    adaptEnvironmentEditorPage() {
        // Specific adaptations for environment editor page
    }

    /**
     * Display error message to user
     * @param {Error} error - Error object
     */
    displayError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = error.message;
        document.body.prepend(errorMessage);
    }
}

// Create global instance
const app = new PersimuApp();

/**
 * Initialize the application
 * Entry point for all pages
 */
export async function initializeApp() {
    try {
        await window.persimuApp.initialize();
    } catch (error) {
        console.error('Application initialization error:', error);
        // Display error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'An error occurred while initializing the application. Please refresh the page.';
        document.body.prepend(errorMessage);
    }
} 