/**
 * Simulation Manager Module
 * Manages multiple simulations running in parallel
 */

import { Simulation } from './simulation.js';
import { PersonaManager } from './persona-model.js';
import { SimulationEnvironment } from './simulation-environment.js';

export class SimulationManager {
    constructor() {
        this.simulations = new Map();
        this.personaManager = new PersonaManager();
        this.scenarios = new Map();
        this.activeScenarios = new Map();
        this.scheduledTasks = new Map();
        this.environments = new Map();
    }

    /**
     * Create and start a new simulation
     * @param {string} scenarioId - ID of the scenario to run
     * @param {Object} config - Simulation configuration
     * @returns {string} Simulation ID
     */
    async createSimulation(scenarioId, config) {
        const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const simulation = new Simulation();
        
        // Initialize simulation with configuration
        await simulation.initialize(config);
        
        // Create and initialize environment if specified
        if (config.environment) {
            const environment = new SimulationEnvironment();
            if (config.environment.type) {
                environment.createPredefinedEnvironment(config.environment.type);
            } else if (config.environment.entities) {
                config.environment.entities.forEach(entity => {
                    environment.addEntity(entity.id, entity);
                });
            }
            this.environments.set(simulationId, environment);
        }
        
        // Store simulation
        this.simulations.set(simulationId, {
            id: simulationId,
            instance: simulation,
            status: 'active',
            startTime: Date.now(),
            config
        });

        // Start scenario if provided
        if (scenarioId) {
            await this.startScenario(simulationId, scenarioId);
        }

        return simulationId;
    }

    /**
     * Start a predefined scenario
     * @param {string} simulationId - ID of the simulation
     * @param {string} scenarioId - ID of the scenario
     */
    async startScenario(simulationId, scenarioId) {
        const simulation = this.simulations.get(simulationId);
        if (!simulation) {
            throw new Error(`Simulation not found: ${simulationId}`);
        }

        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) {
            throw new Error(`Scenario not found: ${scenarioId}`);
        }

        // Initialize scenario
        this.activeScenarios.set(simulationId, {
            id: scenarioId,
            startTime: Date.now(),
            currentStep: 0,
            status: 'running'
        });

        // Start scenario execution
        await this.executeScenario(simulationId, scenarioId);
    }

    /**
     * Execute scenario steps
     * @param {string} simulationId - ID of the simulation
     * @param {string} scenarioId - ID of the scenario
     */
    async executeScenario(simulationId, scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        const activeScenario = this.activeScenarios.get(simulationId);
        const simulation = this.simulations.get(simulationId);
        const environment = this.environments.get(simulationId);

        while (activeScenario.currentStep < scenario.steps.length) {
            const step = scenario.steps[activeScenario.currentStep];
            
            try {
                // Execute step
                await this.executeStep(simulation.instance, step, environment);
                
                // Update progress
                activeScenario.currentStep++;
                
                // Check conditions
                if (step.conditions) {
                    const conditionsMet = await this.checkConditions(simulation.instance, step.conditions, environment);
                    if (!conditionsMet) {
                        activeScenario.status = 'failed';
                        break;
                    }
                }

                // Wait if specified
                if (step.delay) {
                    await new Promise(resolve => setTimeout(resolve, step.delay));
                }
            } catch (error) {
                console.error(`Error executing step ${activeScenario.currentStep}:`, error);
                activeScenario.status = 'failed';
                break;
            }
        }

        // Mark scenario as completed if all steps were successful
        if (activeScenario.status === 'running') {
            activeScenario.status = 'completed';
        }
    }

    /**
     * Execute a single scenario step
     * @param {Simulation} simulation - Simulation instance
     * @param {Object} step - Step configuration
     * @param {SimulationEnvironment} environment - Environment instance
     */
    async executeStep(simulation, step, environment) {
        switch (step.type) {
            case 'message':
                await simulation.processUserMessage(step.content, step.personaId);
                break;
            case 'delay':
                await new Promise(resolve => setTimeout(resolve, step.duration));
                break;
            case 'condition':
                return await this.checkConditions(simulation, step.conditions, environment);
            case 'action':
                await this.executeAction(simulation, step.action, environment);
                break;
            case 'environment':
                await this.executeEnvironmentAction(environment, step.action);
                break;
            default:
                throw new Error(`Unknown step type: ${step.type}`);
        }
    }

    /**
     * Execute an environment action
     * @param {SimulationEnvironment} environment - Environment instance
     * @param {Object} action - Action configuration
     */
    async executeEnvironmentAction(environment, action) {
        switch (action.type) {
            case 'addEntity':
                environment.addEntity(action.entityId, action.entity);
                break;
            case 'updateEntity':
                environment.updateEntityState(action.entityId, action.changes);
                break;
            case 'removeEntity':
                environment.removeEntity(action.entityId);
                break;
            case 'addRule':
                environment.addRule(action.ruleId, action.rule);
                break;
            case 'scheduleEvent':
                environment.scheduleEvent(action.eventId, action.event);
                break;
            default:
                throw new Error(`Unknown environment action type: ${action.type}`);
        }
    }

    /**
     * Check scenario conditions
     * @param {Simulation} simulation - Simulation instance
     * @param {Object} conditions - Conditions to check
     * @param {SimulationEnvironment} environment - Environment instance
     * @returns {Promise<boolean>} Whether conditions are met
     */
    async checkConditions(simulation, conditions, environment) {
        for (const [key, value] of Object.entries(conditions)) {
            switch (key) {
                case 'emotion':
                    const state = simulation.getPersonaState(value.personaId);
                    if (!state || state.currentEmotion.name !== value.emotion) {
                        return false;
                    }
                    break;
                case 'trust':
                    const trustState = simulation.getPersonaState(value.personaId);
                    if (!trustState || trustState.trustLevel < value.minTrust) {
                        return false;
                    }
                    break;
                case 'messageCount':
                    if (simulation.conversationHistory.length < value.count) {
                        return false;
                    }
                    break;
                case 'environment':
                    if (!environment.checkConditions(value)) {
                        return false;
                    }
                    break;
                default:
                    throw new Error(`Unknown condition type: ${key}`);
            }
        }
        return true;
    }

    /**
     * Execute a custom action
     * @param {Simulation} simulation - Simulation instance
     * @param {Object} action - Action configuration
     * @param {SimulationEnvironment} environment - Environment instance
     */
    async executeAction(simulation, action, environment) {
        switch (action.type) {
            case 'updateState':
                const state = simulation.getPersonaState(action.personaId);
                if (state) {
                    state.updateEmotionalState(action.emotion);
                    state.updateTrustLevel(action.trust);
                }
                break;
            case 'addMemory':
                simulation.memorySystem.addMemory(
                    action.memoryType,
                    action.content,
                    action.importance
                );
                break;
            case 'environment':
                await this.executeEnvironmentAction(environment, action.environmentAction);
                break;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }

    /**
     * Define a new scenario
     * @param {string} scenarioId - Unique scenario ID
     * @param {Object} scenario - Scenario configuration
     */
    defineScenario(scenarioId, scenario) {
        this.scenarios.set(scenarioId, {
            id: scenarioId,
            name: scenario.name,
            description: scenario.description,
            steps: scenario.steps,
            successCriteria: scenario.successCriteria,
            failureCriteria: scenario.failureCriteria
        });
    }

    /**
     * Schedule a simulation to run at a specific time
     * @param {string} scenarioId - ID of the scenario to run
     * @param {Object} config - Simulation configuration
     * @param {Date} scheduleTime - When to run the simulation
     * @returns {string} Scheduled task ID
     */
    scheduleSimulation(scenarioId, config, scheduleTime) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const task = {
            id: taskId,
            scenarioId,
            config,
            scheduleTime,
            status: 'scheduled'
        };

        this.scheduledTasks.set(taskId, task);
        this.scheduleTask(task);

        return taskId;
    }

    /**
     * Schedule a task to run at the specified time
     * @param {Object} task - Task configuration
     */
    scheduleTask(task) {
        const now = Date.now();
        const delay = task.scheduleTime.getTime() - now;

        if (delay > 0) {
            setTimeout(async () => {
                task.status = 'running';
                await this.createSimulation(task.scenarioId, task.config);
                task.status = 'completed';
            }, delay);
        } else {
            task.status = 'failed';
            task.error = 'Schedule time has passed';
        }
    }

    /**
     * Get status of all simulations
     * @returns {Array} Array of simulation statuses
     */
    getSimulationStatuses() {
        return Array.from(this.simulations.values()).map(sim => ({
            id: sim.id,
            status: sim.status,
            startTime: sim.startTime,
            config: sim.config,
            environment: this.environments.get(sim.id)?.getState()
        }));
    }

    /**
     * Get status of all active scenarios
     * @returns {Array} Array of active scenario statuses
     */
    getActiveScenarioStatuses() {
        return Array.from(this.activeScenarios.values()).map(scenario => ({
            id: scenario.id,
            status: scenario.status,
            startTime: scenario.startTime,
            currentStep: scenario.currentStep
        }));
    }

    /**
     * Get status of all scheduled tasks
     * @returns {Array} Array of scheduled task statuses
     */
    getScheduledTaskStatuses() {
        return Array.from(this.scheduledTasks.values()).map(task => ({
            id: task.id,
            status: task.status,
            scheduleTime: task.scheduleTime,
            scenarioId: task.scenarioId
        }));
    }

    /**
     * Pause a simulation
     * @param {string} simulationId - ID of the simulation to pause
     */
    pauseSimulation(simulationId) {
        const simulation = this.simulations.get(simulationId);
        if (simulation) {
            simulation.status = 'paused';
            if (this.activeScenarios.has(simulationId)) {
                this.activeScenarios.get(simulationId).status = 'paused';
            }
            const environment = this.environments.get(simulationId);
            if (environment) {
                // Pause all scheduled events
                environment.scheduledEvents.forEach((event, eventId) => {
                    clearTimeout(event.timeoutId);
                    environment.scheduledEvents.delete(eventId);
                });
            }
        }
    }

    /**
     * Resume a paused simulation
     * @param {string} simulationId - ID of the simulation to resume
     */
    resumeSimulation(simulationId) {
        const simulation = this.simulations.get(simulationId);
        if (simulation) {
            simulation.status = 'active';
            if (this.activeScenarios.has(simulationId)) {
                const activeScenario = this.activeScenarios.get(simulationId);
                activeScenario.status = 'running';
                this.executeScenario(simulationId, activeScenario.id);
            }
            const environment = this.environments.get(simulationId);
            if (environment) {
                // Resume all events
                environment.events.forEach((event, eventId) => {
                    if (event.trigger.type === 'time') {
                        environment.scheduleTimeBasedEvent(eventId, event.trigger);
                    }
                });
            }
        }
    }

    /**
     * Stop a simulation
     * @param {string} simulationId - ID of the simulation to stop
     */
    stopSimulation(simulationId) {
        const simulation = this.simulations.get(simulationId);
        if (simulation) {
            simulation.status = 'stopped';
            if (this.activeScenarios.has(simulationId)) {
                this.activeScenarios.get(simulationId).status = 'stopped';
            }
            const environment = this.environments.get(simulationId);
            if (environment) {
                // Clear all scheduled events
                environment.scheduledEvents.forEach((event, eventId) => {
                    clearTimeout(event.timeoutId);
                    environment.scheduledEvents.delete(eventId);
                });
                // Clear all active events
                environment.state.activeEvents.clear();
            }
        }
    }
} 