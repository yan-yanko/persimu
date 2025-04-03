/**
 * Extended Persona Data Model - Persimu
 * 
 * This file defines the data structure for extended personas in the system
 * and provides functions for managing the persona list.
 */

// Single persona data structure
const personaTemplate = {
    // Basic identification and information
    id: "",                 // Unique identifier for the persona
    name: "",               // Persona name
    category: "",           // Category (e.g., B2B, B2C)
    imageUrl: "",           // Link to persona image
    shortDescription: "",   // Short description of the persona

    // Demographic information
    demographics: {
        age: 0,                // Age
        gender: "",            // Gender
        location: "",          // Location/city
        occupation: "",        // Occupation
        education: "",         // Education
        incomeLevel: "",       // Income level (low, medium, high)
        familyStatus: ""       // Family status
    },

    // Personality traits and preferences
    personality: {
        traits: [],            // Personality traits (e.g., sociable, thoughtful, skeptical)
        values: [],            // Important values (e.g., family, achievement, security)
        interests: [],         // Areas of interest
        painPoints: [],        // Pain points/challenges
        goals: [],             // Goals and aspirations
        communicationStyle: "" // Communication style (formal, friendly, business-like)
    },

    // Consumer behavior
    consumerBehavior: {
        purchaseMotivations: [],       // Purchase motivations
        decisionFactors: [],           // Factors influencing decisions
        preferredChannels: [],         // Preferred communication channels
        brandRelationships: [],        // Brand relationships
        priceStrategy: [],             // Price strategy (bargain hunter, quality seeker)
        technicalSavviness: ""         // Technical proficiency level (low, medium, high)
    },

    // Background and history
    background: {
        bio: "",               // Short biography
        keyExperiences: [],    // Key life experiences
        challenges: [],        // Main challenges
        influences: []         // Important influences
    },

    // LLM (Language Model) settings
    llmSettings: {
        basePrompt: "",        // Base prompt for the language model
        temperature: 0.7,      // Creativity level (0-1)
        systemContext: "",     // System context for the language model
        maxTokens: 1000        // Maximum number of tokens for response
    }
};

/**
 * Class for managing personas in the system
 */
class PersonaManager {
    constructor() {
        this.personas = new Map();
        this.loadMockPersonas();
    }

    loadMockPersonas() {
        const mockPersonas = [
            {
                id: '1',
                name: 'Daniel Cohen',
                role: 'Product Manager | B2B',
                personality: 'Professional, decisive, results-oriented',
                background: '8 years of experience in product management in tech companies'
            },
            {
                id: '2',
                name: 'Michelle Levy',
                role: 'Marketing Manager | B2B',
                personality: 'Creative, strategic, customer-focused',
                background: '10 years of B2B marketing experience'
            },
            {
                id: '3',
                name: 'Alan David',
                role: 'Potential Customer | B2C',
                personality: 'Cautious, information-seeking, price-conscious',
                background: 'Looking for a new home product'
            },
            {
                id: '4',
                name: 'Rachel Green',
                role: 'Procurement Manager | B2B',
                personality: 'Analytical, precise, ROI-focused',
                background: '12 years of experience in organizational procurement'
            },
            {
                id: '5',
                name: 'Nick Allen',
                role: 'Loyal Customer | B2C',
                personality: 'Brand loyal, quality-oriented',
                background: 'Regular customer of company products'
            }
        ];

        mockPersonas.forEach(persona => {
            this.personas.set(persona.id, persona);
        });
    }

    getPersonaById(id) {
        return this.personas.get(id);
    }

    getAllPersonas() {
        return Array.from(this.personas.values());
    }

    async loadPersonaFromServer(id) {
        try {
            const response = await fetch(`/api/personas/${id}`);
            if (!response.ok) {
                throw new Error('Failed to load persona');
            }
            const persona = await response.json();
            this.personas.set(id, persona);
            return persona;
        } catch (error) {
            console.error('Error loading persona:', error);
            return null;
        }
    }
}

// Export the class and persona template
export { PersonaManager, personaTemplate }; 