/**
 * Persimu API Client
 * Manages all API communication with the server
 */

export class PersimuAPI {
    constructor(baseUrl = 'http://localhost:3000/api') {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('apiToken');
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Set authentication token
     * @param {string} token - Authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('apiToken', token);
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('apiToken');
    }

    /**
     * Make API request with retry mechanism
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Response>} API response
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            ...options.headers
        };

        let attempts = 0;
        while (attempts < this.retryAttempts) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        this.clearToken();
                        throw new Error('Authentication failed');
                    }
                    throw new Error(`API request failed: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                attempts++;
                if (attempts === this.retryAttempts) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
    }

    // Persona Management
    /**
     * Get all personas
     * @returns {Promise<Array>} List of personas
     */
    async getPersonas() {
        return this.makeRequest('/personas');
    }

    /**
     * Get persona by ID
     * @param {string} id - Persona ID
     * @returns {Promise<Object>} Persona data
     */
    async getPersona(id) {
        return this.makeRequest(`/personas/${id}`);
    }

    /**
     * Create new persona
     * @param {Object} data - Persona data
     * @returns {Promise<Object>} Created persona
     */
    async createPersona(data) {
        return this.makeRequest('/personas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Update persona
     * @param {string} id - Persona ID
     * @param {Object} data - Updated persona data
     * @returns {Promise<Object>} Updated persona
     */
    async updatePersona(id, data) {
        return this.makeRequest(`/personas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Delete persona
     * @param {string} id - Persona ID
     * @returns {Promise<void>}
     */
    async deletePersona(id) {
        return this.makeRequest(`/personas/${id}`, {
            method: 'DELETE'
        });
    }

    // Simulation Management
    /**
     * Get all simulations
     * @returns {Promise<Array>} List of simulations
     */
    async getSimulations() {
        return this.makeRequest('/simulations');
    }

    /**
     * Get simulation by ID
     * @param {string} id - Simulation ID
     * @returns {Promise<Object>} Simulation data
     */
    async getSimulation(id) {
        return this.makeRequest(`/simulations/${id}`);
    }

    /**
     * Create new simulation
     * @param {Object} data - Simulation data
     * @returns {Promise<Object>} Created simulation
     */
    async createSimulation(data) {
        return this.makeRequest('/simulations', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Update simulation
     * @param {string} id - Simulation ID
     * @param {Object} data - Updated simulation data
     * @returns {Promise<Object>} Updated simulation
     */
    async updateSimulation(id, data) {
        return this.makeRequest(`/simulations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Delete simulation
     * @param {string} id - Simulation ID
     * @returns {Promise<void>}
     */
    async deleteSimulation(id) {
        return this.makeRequest(`/simulations/${id}`, {
            method: 'DELETE'
        });
    }

    // Language Model Communication
    /**
     * Send message to language model
     * @param {Object} data - Message data
     * @returns {Promise<Object>} Model response
     */
    async sendToLanguageModel(data) {
        return this.makeRequest('/language-model', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Result Analysis
    /**
     * Get simulation results
     * @param {string} simulationId - Simulation ID
     * @returns {Promise<Object>} Analysis results
     */
    async getSimulationResults(simulationId) {
        return this.makeRequest(`/simulations/${simulationId}/results`);
    }

    /**
     * Get persona insights
     * @param {string} personaId - Persona ID
     * @returns {Promise<Object>} Persona insights
     */
    async getPersonaInsights(personaId) {
        return this.makeRequest(`/personas/${personaId}/insights`);
    }

    // Authentication
    /**
     * Login to API
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} Authentication response
     */
    async login(username, password) {
        const response = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    /**
     * Logout from API
     * @returns {Promise<void>}
     */
    async logout() {
        await this.makeRequest('/auth/logout', {
            method: 'POST'
        });
        this.clearToken();
    }
} 