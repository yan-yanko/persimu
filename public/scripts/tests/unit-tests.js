/**
 * Unit Tests for Persimu System Components
 */

import { PersonaManager } from '../persona-manager.js';
import { PromptBuilder } from '../prompt-builder.js';
import { MemorySystem } from '../memory-system.js';
import { EmotionSystem } from '../emotion-system.js';

// Test Suite: Persona Data Model
describe('Persona Data Model Tests', () => {
    let personaManager;

    beforeEach(() => {
        personaManager = new PersonaManager();
    });

    test('should create a valid persona with required fields', () => {
        const persona = personaManager.createPersona({
            name: 'Test Persona',
            role: 'Customer',
            traits: ['friendly', 'professional'],
            background: 'Test background'
        });

        expect(persona).toHaveProperty('id');
        expect(persona.name).toBe('Test Persona');
        expect(persona.role).toBe('Customer');
        expect(persona.traits).toContain('friendly');
        expect(persona.background).toBe('Test background');
    });

    test('should validate required fields when creating persona', () => {
        expect(() => {
            personaManager.createPersona({
                name: 'Test Persona'
            });
        }).toThrow('Missing required fields');
    });

    test('should update persona properties correctly', () => {
        const persona = personaManager.createPersona({
            name: 'Test Persona',
            role: 'Customer',
            traits: ['friendly'],
            background: 'Test background'
        });

        const updatedPersona = personaManager.updatePersona(persona.id, {
            traits: ['friendly', 'professional']
        });

        expect(updatedPersona.traits).toContain('professional');
    });

    test('should handle persona deletion', () => {
        const persona = personaManager.createPersona({
            name: 'Test Persona',
            role: 'Customer',
            traits: ['friendly'],
            background: 'Test background'
        });

        personaManager.deletePersona(persona.id);
        expect(() => personaManager.getPersona(persona.id)).toThrow('Persona not found');
    });
});

// Test Suite: Prompt Builder
describe('Prompt Builder Tests', () => {
    let promptBuilder;

    beforeEach(() => {
        promptBuilder = new PromptBuilder();
    });

    test('should build valid system prompt', () => {
        const persona = {
            name: 'Test Persona',
            role: 'Customer',
            traits: ['friendly'],
            background: 'Test background'
        };

        const prompt = promptBuilder.buildSystemPrompt(persona);
        expect(prompt).toContain(persona.name);
        expect(prompt).toContain(persona.role);
        expect(prompt).toContain(persona.traits[0]);
    });

    test('should include context in prompt', () => {
        const context = {
            previousMessages: [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there!' }
            ]
        };

        const prompt = promptBuilder.buildPromptWithContext(context);
        expect(prompt).toContain('Hello');
        expect(prompt).toContain('Hi there!');
    });

    test('should handle empty context', () => {
        const prompt = promptBuilder.buildPromptWithContext({});
        expect(prompt).toBeDefined();
    });

    test('should format prompt according to model requirements', () => {
        const prompt = promptBuilder.buildFormattedPrompt({
            system: 'Test system prompt',
            user: 'Test user message'
        });

        expect(prompt).toMatch(/^System:.*User:/s);
    });
});

// Test Suite: Memory System
describe('Memory System Tests', () => {
    let memorySystem;

    beforeEach(() => {
        memorySystem = new MemorySystem();
    });

    test('should store and retrieve memories', () => {
        const memory = {
            type: 'interaction',
            content: 'Test memory',
            timestamp: Date.now()
        };

        memorySystem.storeMemory(memory);
        const retrieved = memorySystem.getMemories();
        expect(retrieved).toContainEqual(expect.objectContaining(memory));
    });

    test('should prioritize recent memories', () => {
        const oldMemory = {
            type: 'interaction',
            content: 'Old memory',
            timestamp: Date.now() - 1000
        };

        const newMemory = {
            type: 'interaction',
            content: 'New memory',
            timestamp: Date.now()
        };

        memorySystem.storeMemory(oldMemory);
        memorySystem.storeMemory(newMemory);

        const recent = memorySystem.getRecentMemories(1);
        expect(recent[0].content).toBe('New memory');
    });

    test('should handle memory consolidation', () => {
        const memories = [
            { type: 'interaction', content: 'Memory 1', timestamp: Date.now() },
            { type: 'interaction', content: 'Memory 2', timestamp: Date.now() }
        ];

        memories.forEach(m => memorySystem.storeMemory(m));
        memorySystem.consolidateMemories();

        const consolidated = memorySystem.getConsolidatedMemories();
        expect(consolidated.length).toBeLessThan(memories.length);
    });

    test('should respect memory limits', () => {
        const maxMemories = 5;
        for (let i = 0; i < maxMemories + 5; i++) {
            memorySystem.storeMemory({
                type: 'interaction',
                content: `Memory ${i}`,
                timestamp: Date.now()
            });
        }

        const memories = memorySystem.getMemories();
        expect(memories.length).toBeLessThanOrEqual(maxMemories);
    });
});

// Test Suite: Emotion System
describe('Emotion System Tests', () => {
    let emotionSystem;

    beforeEach(() => {
        emotionSystem = new EmotionSystem();
    });

    test('should update emotional state based on input', () => {
        const input = {
            sentiment: 'positive',
            intensity: 0.8
        };

        emotionSystem.updateEmotionalState(input);
        const state = emotionSystem.getCurrentState();
        expect(state.sentiment).toBe('positive');
        expect(state.intensity).toBe(0.8);
    });

    test('should decay emotional intensity over time', () => {
        emotionSystem.updateEmotionalState({
            sentiment: 'positive',
            intensity: 1.0
        });

        // Simulate time passing
        jest.advanceTimersByTime(1000 * 60 * 5); // 5 minutes
        emotionSystem.decayEmotions();

        const state = emotionSystem.getCurrentState();
        expect(state.intensity).toBeLessThan(1.0);
    });

    test('should handle multiple emotions', () => {
        emotionSystem.updateEmotionalState({
            sentiment: 'positive',
            intensity: 0.8,
            emotions: ['happy', 'excited']
        });

        const state = emotionSystem.getCurrentState();
        expect(state.emotions).toContain('happy');
        expect(state.emotions).toContain('excited');
    });

    test('should maintain emotional history', () => {
        const states = [
            { sentiment: 'positive', intensity: 0.8 },
            { sentiment: 'neutral', intensity: 0.5 },
            { sentiment: 'negative', intensity: 0.3 }
        ];

        states.forEach(state => emotionSystem.updateEmotionalState(state));
        const history = emotionSystem.getEmotionalHistory();

        expect(history.length).toBe(states.length);
        expect(history[0].sentiment).toBe('positive');
        expect(history[history.length - 1].sentiment).toBe('negative');
    });
});

// Run all tests
describe('Integration Tests', () => {
    test('should maintain persona consistency across systems', () => {
        const personaManager = new PersonaManager();
        const memorySystem = new MemorySystem();
        const emotionSystem = new EmotionSystem();

        const persona = personaManager.createPersona({
            name: 'Test Persona',
            role: 'Customer',
            traits: ['friendly'],
            background: 'Test background'
        });

        const memory = {
            type: 'interaction',
            content: 'Test interaction',
            personaId: persona.id,
            timestamp: Date.now()
        };

        memorySystem.storeMemory(memory);
        emotionSystem.updateEmotionalState({
            sentiment: 'positive',
            intensity: 0.8,
            personaId: persona.id
        });

        const memories = memorySystem.getMemoriesByPersona(persona.id);
        const emotionalState = emotionSystem.getCurrentState(persona.id);

        expect(memories[0].personaId).toBe(persona.id);
        expect(emotionalState.personaId).toBe(persona.id);
    });
}); 