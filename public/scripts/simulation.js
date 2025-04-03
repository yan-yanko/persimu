/**
 * Simulation Module
 * 
 * This module handles the chat simulation functionality using OpenAI's GPT-3.5 Turbo API.
 * It manages the conversation flow, message history, and UI interactions.
 * 
 * @module simulation
 */

class Simulation {
    constructor() {
        this.simulationType = null;
        this.conversationHistory = [];
        this.isLoading = false;
        this.loadingTimeout = null;
    }

    /**
     * Initialize UI elements and event listeners
     */
    initializeUI() {
        console.log('Initializing UI elements...');
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.memoryContainer = document.getElementById('memoryContainer');
        this.memoryFilter = document.getElementById('memoryFilter');
        this.simulationTitle = document.getElementById('simulationTitle');
        this.simulationDescription = document.getElementById('simulationDescription');
        this.simulationTypeElement = document.getElementById('simulationType');

        if (!this.chatContainer || !this.messageInput || !this.sendButton || 
            !this.loadingIndicator || !this.memoryContainer || !this.memoryFilter ||
            !this.simulationTitle || !this.simulationDescription || !this.simulationTypeElement) {
            console.error('Some required elements were not found on the page');
            this.handleError(new Error('Required UI elements not found'));
            return;
        }

        console.log('Setting up event listeners...');
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        this.memoryFilter.addEventListener('change', () => this.updateMemoryDisplay());
        
        // Set loading timeout
        this.loadingTimeout = setTimeout(() => {
            if (this.simulationTitle.textContent === 'Loading...' ||
                this.simulationDescription.textContent === 'Preparing simulation environment...') {
                this.handleError(new Error('Simulation loading timeout'));
            }
        }, 10000); // 10 seconds timeout

        this.loadSimulationFromUrl();
    }

    /**
     * Load simulation data from URL parameters
     */
    loadSimulationFromUrl() {
        console.log('Loading simulation from URL parameters...');
        const urlParams = new URLSearchParams(window.location.search);
        this.simulationType = urlParams.get('type');
        
        if (this.simulationType) {
            console.log(`Simulation type: ${this.simulationType}`);
            this.simulationTypeElement.textContent = this.simulationType;
            
            // Show loading state
            this.showLoadingState();
            
            // Initialize simulation with delay to show loading state
            setTimeout(() => {
                let description = '';
                switch(this.simulationType) {
                    case 'Market Research':
                        description = 'Test and validate products or services with virtual consumers';
                        break;
                    case 'Customer Behavior':
                        description = 'Analyze customer decision-making and journey patterns';
                        break;
                    case 'Economic Forecast':
                        description = 'Predict market trends and economic conditions';
                        break;
                    default:
                        description = 'Custom simulation environment';
                }
                
                // Update UI with simulation details
                this.simulationTitle.textContent = this.simulationType;
                this.simulationDescription.textContent = description;
                
                // Initialize conversation
                this.initializeConversation();
                
                // Hide loading state
                this.hideLoadingState();

                // Clear loading timeout as simulation loaded successfully
                if (this.loadingTimeout) {
                    clearTimeout(this.loadingTimeout);
                    this.loadingTimeout = null;
                }
            }, 1000); // Small delay to show loading state
        } else {
            console.error('No simulation type specified in URL');
            this.handleError(new Error('No simulation type specified'));
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        this.isLoading = true;
        this.simulationTitle.textContent = 'Loading...';
        this.simulationDescription.textContent = 'Preparing simulation environment...';
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        this.isLoading = false;
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Initialize the conversation
     */
    initializeConversation() {
        this.addMessageToChat('assistant', this.getWelcomeMessage());
    }

    /**
     * Get welcome message based on simulation type
     */
    getWelcomeMessage() {
        switch(this.simulationType) {
            case 'Market Research':
                return "Welcome to the Market Research simulation. I'm here to help you evaluate products and services from a consumer perspective. What would you like to analyze?";
            
            case 'Customer Behavior':
                return "Welcome to the Customer Behavior simulation. I'm here to help you understand customer decision-making patterns and journeys. What aspects would you like to explore?";
            
            case 'Economic Forecast':
                return "Welcome to the Economic Forecast simulation. I'm here to help you analyze market trends and economic conditions. What would you like to forecast?";
            
            default:
                return "Welcome to the simulation. How can I assist you today?";
        }
    }

    /**
     * Handle sending a message
     */
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;

        this.addMessageToChat('user', message);
        this.messageInput.value = '';
        this.showLoadingIndicator();

        try {
            // Simulate AI response for now
            setTimeout(() => {
                const response = "I understand your message. This is a simulated response for testing purposes.";
                this.addMessageToChat('assistant', response);
                this.hideLoadingIndicator();
            }, 1000);
        } catch (error) {
            console.error('Error handling message:', error);
            this.handleError(error);
        }
    }

    /**
     * Add a message to the chat UI
     */
    addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.textContent = content;
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    /**
     * Show loading indicator
     */
    showLoadingIndicator() {
        this.isLoading = true;
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        this.isLoading = false;
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('Error in simulation:', error);
        
        // Clear loading states
        this.isLoading = false;
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
        if (this.sendButton) {
            this.sendButton.disabled = false;
        }

        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <p>An error occurred: ${error.message}</p>
            <button onclick="window.location.reload()">Try Again</button>
            <button onclick="window.location.href='index.html'">Return to Dashboard</button>
        `;

        // Add error message to chat container or simulation info
        if (this.chatContainer) {
            this.chatContainer.appendChild(errorMessage);
        } else if (this.simulationTitle) {
            this.simulationTitle.textContent = 'Error';
            this.simulationDescription.textContent = error.message;
        }
    }

    /**
     * Update memory display
     */
    updateMemoryDisplay() {
        if (!this.memorySystem) return;

        const filter = this.memoryFilter.value;
        const memories = this.memorySystem.getAllMemories();
        
        this.memoryContainer.innerHTML = '';
        
        memories
            .filter(memory => filter === 'all' || memory.type === filter)
            .forEach(memory => {
                const memoryElement = document.createElement('div');
                memoryElement.className = 'memory-item';
                memoryElement.innerHTML = `
                    <div class="memory-content">${memory.content}</div>
                    <div class="memory-meta">
                        <span class="memory-type">${memory.type}</span>
                        <span class="memory-importance">${Math.round(memory.importance * 100)}%</span>
            </div>
        `;
                this.memoryContainer.appendChild(memoryElement);
            });
    }
}

// Initialize simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Simulation page loaded');
    const simulation = new Simulation();
    simulation.initializeUI();
});

export default Simulation; 