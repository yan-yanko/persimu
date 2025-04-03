/**
 * Prompt Builder Module
 * Handles the creation and optimization of prompts for language models
 */
export default class PromptBuilder {
    constructor() {
        this.systemPromptTemplate = `
You are {name}, {role}. 
Personality: {personality}
Background: {background}

You should respond in a way that matches your personality and background.
Use natural language appropriate for your role.
Keep your responses concise and focused.
`;
    }

    /**
     * Build system prompt for a persona
     * @param {Object} persona - Persona data object
     * @returns {string} System prompt
     */
    buildSystemPrompt(persona) {
        if (!persona) return '';

        return this.systemPromptTemplate
            .replace('{name}', persona.name)
            .replace('{role}', persona.role)
            .replace('{personality}', persona.personality)
            .replace('{background}', persona.background);
    }

    /**
     * Build conversation prompt
     * @param {string} message - The message to be replied to
     * @param {Array} history - Conversation history
     * @param {Object} persona - Persona data object
     * @returns {string} Conversation prompt
     */
    buildConversationPrompt(message, history, persona) {
        return message;
    }

    /**
     * Get model-specific prompt format
     * @param {string} model - Model identifier
     * @returns {Object} Model-specific format
     */
    getModelFormat(model) {
        return {
            user: 'user',
            assistant: 'assistant',
            system: 'system'
        };
    }
} 