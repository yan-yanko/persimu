/**
 * Simulation Environment Module
 * Manages the virtual world of the simulation
 */

export class SimulationEnvironment {
    constructor() {
        this.entities = new Map();
        this.rules = new Map();
        this.events = new Map();
        this.scheduledEvents = new Map();
        this.state = {
            currentTime: new Date(),
            activeEvents: new Set(),
            environmentState: new Map()
        };
    }

    /**
     * Add an entity to the environment
     * @param {string} entityId - Unique identifier for the entity
     * @param {Object} entity - Entity configuration
     */
    addEntity(entityId, entity) {
        this.entities.set(entityId, {
            id: entityId,
            type: entity.type,
            properties: entity.properties,
            relationships: new Map(),
            state: entity.initialState || {}
        });
    }

    /**
     * Add a rule to the environment
     * @param {string} ruleId - Unique identifier for the rule
     * @param {Object} rule - Rule configuration
     */
    addRule(ruleId, rule) {
        this.rules.set(ruleId, {
            id: ruleId,
            type: rule.type,
            conditions: rule.conditions,
            actions: rule.actions,
            priority: rule.priority || 0
        });
    }

    /**
     * Schedule an event in the environment
     * @param {string} eventId - Unique identifier for the event
     * @param {Object} event - Event configuration
     */
    scheduleEvent(eventId, event) {
        this.events.set(eventId, {
            id: eventId,
            type: event.type,
            trigger: event.trigger,
            actions: event.actions,
            duration: event.duration,
            repeat: event.repeat
        });

        if (event.trigger.type === 'time') {
            this.scheduleTimeBasedEvent(eventId, event.trigger);
        }
    }

    /**
     * Schedule a time-based event
     * @param {string} eventId - Event identifier
     * @param {Object} trigger - Trigger configuration
     */
    scheduleTimeBasedEvent(eventId, trigger) {
        const now = Date.now();
        const triggerTime = new Date(trigger.time).getTime();
        const delay = triggerTime - now;

        if (delay > 0) {
            const timeoutId = setTimeout(() => {
                this.activateEvent(eventId);
            }, delay);

            this.scheduledEvents.set(eventId, {
                timeoutId,
                trigger
            });
        }
    }

    /**
     * Activate an event
     * @param {string} eventId - Event identifier
     */
    activateEvent(eventId) {
        const event = this.events.get(eventId);
        if (!event) return;

        this.state.activeEvents.add(eventId);
        
        // Execute event actions
        event.actions.forEach(action => {
            this.executeAction(action);
        });

        // Handle event duration
        if (event.duration) {
            setTimeout(() => {
                this.deactivateEvent(eventId);
            }, event.duration);
        }

        // Handle repeating events
        if (event.repeat) {
            this.scheduleEvent(eventId, event);
        }
    }

    /**
     * Deactivate an event
     * @param {string} eventId - Event identifier
     */
    deactivateEvent(eventId) {
        this.state.activeEvents.delete(eventId);
    }

    /**
     * Execute an action in the environment
     * @param {Object} action - Action configuration
     */
    executeAction(action) {
        switch (action.type) {
            case 'updateEntity':
                this.updateEntityState(action.entityId, action.changes);
                break;
            case 'createEntity':
                this.addEntity(action.entityId, action.entity);
                break;
            case 'removeEntity':
                this.removeEntity(action.entityId);
                break;
            case 'updateRule':
                this.updateRule(action.ruleId, action.changes);
                break;
            case 'triggerEvent':
                this.activateEvent(action.eventId);
                break;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }

    /**
     * Update entity state
     * @param {string} entityId - Entity identifier
     * @param {Object} changes - State changes to apply
     */
    updateEntityState(entityId, changes) {
        const entity = this.entities.get(entityId);
        if (!entity) return;

        Object.assign(entity.state, changes);
    }

    /**
     * Remove an entity from the environment
     * @param {string} entityId - Entity identifier
     */
    removeEntity(entityId) {
        this.entities.delete(entityId);
    }

    /**
     * Update a rule in the environment
     * @param {string} ruleId - Rule identifier
     * @param {Object} changes - Rule changes to apply
     */
    updateRule(ruleId, changes) {
        const rule = this.rules.get(ruleId);
        if (!rule) return;

        Object.assign(rule, changes);
    }

    /**
     * Check if conditions are met
     * @param {Object} conditions - Conditions to check
     * @returns {boolean} Whether conditions are met
     */
    checkConditions(conditions) {
        for (const [key, value] of Object.entries(conditions)) {
            switch (key) {
                case 'time':
                    if (!this.checkTimeCondition(value)) return false;
                    break;
                case 'entityState':
                    if (!this.checkEntityStateCondition(value)) return false;
                    break;
                case 'eventActive':
                    if (!this.checkEventActiveCondition(value)) return false;
                    break;
                default:
                    throw new Error(`Unknown condition type: ${key}`);
            }
        }
        return true;
    }

    /**
     * Check time-based condition
     * @param {Object} condition - Time condition
     * @returns {boolean} Whether condition is met
     */
    checkTimeCondition(condition) {
        const now = new Date();
        const targetTime = new Date(condition.time);

        switch (condition.operator) {
            case 'before':
                return now < targetTime;
            case 'after':
                return now > targetTime;
            case 'between':
                return now >= new Date(condition.start) && now <= new Date(condition.end);
            default:
                throw new Error(`Unknown time operator: ${condition.operator}`);
        }
    }

    /**
     * Check entity state condition
     * @param {Object} condition - Entity state condition
     * @returns {boolean} Whether condition is met
     */
    checkEntityStateCondition(condition) {
        const entity = this.entities.get(condition.entityId);
        if (!entity) return false;

        return Object.entries(condition.state).every(([key, value]) => 
            entity.state[key] === value
        );
    }

    /**
     * Check event active condition
     * @param {Object} condition - Event active condition
     * @returns {boolean} Whether condition is met
     */
    checkEventActiveCondition(condition) {
        return this.state.activeEvents.has(condition.eventId) === condition.active;
    }

    /**
     * Get environment state
     * @returns {Object} Current environment state
     */
    getState() {
        return {
            currentTime: this.state.currentTime,
            activeEvents: Array.from(this.state.activeEvents),
            entities: Array.from(this.entities.entries()).map(([id, entity]) => ({
                id,
                type: entity.type,
                state: entity.state
            })),
            rules: Array.from(this.rules.entries()).map(([id, rule]) => ({
                id,
                type: rule.type,
                priority: rule.priority
            }))
        };
    }

    /**
     * Create a predefined environment
     * @param {string} type - Type of environment to create
     */
    createPredefinedEnvironment(type) {
        switch (type) {
            case 'virtualStore':
                this.createVirtualStore();
                break;
            case 'ecommerce':
                this.createEcommerce();
                break;
            case 'customerService':
                this.createCustomerService();
                break;
            case 'socialNetwork':
                this.createSocialNetwork();
                break;
            default:
                throw new Error(`Unknown environment type: ${type}`);
        }
    }

    /**
     * Create a virtual store environment
     */
    createVirtualStore() {
        // Add store entity
        this.addEntity('store', {
            type: 'store',
            properties: {
                name: 'חנות וירטואלית',
                openingHours: { start: '09:00', end: '17:00' },
                categories: ['אלקטרוניקה', 'ביגוד', 'מזון']
            },
            initialState: {
                isOpen: false,
                currentCustomers: 0
            }
        });

        // Add products
        this.addEntity('products', {
            type: 'productCatalog',
            properties: {
                categories: ['אלקטרוניקה', 'ביגוד', 'מזון']
            },
            initialState: {
                inventory: new Map()
            }
        });

        // Add rules
        this.addRule('storeHours', {
            type: 'timeBased',
            conditions: {
                time: {
                    operator: 'between',
                    start: '09:00',
                    end: '17:00'
                }
            },
            actions: [{
                type: 'updateEntity',
                entityId: 'store',
                changes: { isOpen: true }
            }]
        });

        // Add events
        this.scheduleEvent('dailyOpening', {
            type: 'storeEvent',
            trigger: {
                type: 'time',
                time: '09:00'
            },
            actions: [{
                type: 'updateEntity',
                entityId: 'store',
                changes: { isOpen: true }
            }],
            repeat: true
        });
    }

    /**
     * Create an e-commerce environment
     */
    createEcommerce() {
        // Add website entity
        this.addEntity('website', {
            type: 'ecommerce',
            properties: {
                name: 'חנות אונליין',
                features: ['חיפוש', 'סל קניות', 'תשלום']
            },
            initialState: {
                activeUsers: 0,
                currentPromotions: []
            }
        });

        // Add inventory system
        this.addEntity('inventory', {
            type: 'inventorySystem',
            properties: {
                warehouses: ['מרכז', 'צפון', 'דרום']
            },
            initialState: {
                stock: new Map(),
                orders: []
            }
        });

        // Add rules
        this.addRule('stockCheck', {
            type: 'inventory',
            conditions: {
                entityState: {
                    entityId: 'inventory',
                    state: { lowStock: true }
                }
            },
            actions: [{
                type: 'triggerEvent',
                eventId: 'lowStockAlert'
            }]
        });

        // Add events
        this.scheduleEvent('dailyStockUpdate', {
            type: 'inventory',
            trigger: {
                type: 'time',
                time: '00:00'
            },
            actions: [{
                type: 'updateEntity',
                entityId: 'inventory',
                changes: { lastUpdate: new Date() }
            }],
            repeat: true
        });
    }

    /**
     * Create a customer service environment
     */
    createCustomerService() {
        // Add call center entity
        this.addEntity('callCenter', {
            type: 'service',
            properties: {
                name: 'מוקד שירות',
                departments: ['תמיכה טכנית', 'שירות לקוחות', 'תלונות']
            },
            initialState: {
                activeAgents: 0,
                waitingCustomers: 0
            }
        });

        // Add queue system
        this.addEntity('queue', {
            type: 'queueSystem',
            properties: {
                maxWaitTime: 300, // 5 minutes
                priorityLevels: ['רגיל', 'דחוף', 'VIP']
            },
            initialState: {
                queue: [],
                averageWaitTime: 0
            }
        });

        // Add rules
        this.addRule('highWaitTime', {
            type: 'queue',
            conditions: {
                entityState: {
                    entityId: 'queue',
                    state: { averageWaitTime: { $gt: 300 } }
                }
            },
            actions: [{
                type: 'triggerEvent',
                eventId: 'escalateQueue'
            }]
        });

        // Add events
        this.scheduleEvent('shiftChange', {
            type: 'staff',
            trigger: {
                type: 'time',
                time: '08:00'
            },
            actions: [{
                type: 'updateEntity',
                entityId: 'callCenter',
                changes: { shift: 'morning' }
            }],
            repeat: true
        });
    }

    /**
     * Create a social network environment
     */
    createSocialNetwork() {
        // Add network entity
        this.addEntity('network', {
            type: 'social',
            properties: {
                name: 'רשת חברתית',
                features: ['פוסטים', 'הודעות', 'קבוצות']
            },
            initialState: {
                activeUsers: 0,
                posts: [],
                groups: []
            }
        });

        // Add content moderation system
        this.addEntity('moderation', {
            type: 'contentModeration',
            properties: {
                rules: ['תוכן לא הולם', 'ספאם', 'הטרדה']
            },
            initialState: {
                reportedContent: [],
                blockedUsers: []
            }
        });

        // Add rules
        this.addRule('contentViolation', {
            type: 'moderation',
            conditions: {
                entityState: {
                    entityId: 'moderation',
                    state: { hasViolations: true }
                }
            },
            actions: [{
                type: 'triggerEvent',
                eventId: 'moderationAlert'
            }]
        });

        // Add events
        this.scheduleEvent('dailyReport', {
            type: 'analytics',
            trigger: {
                type: 'time',
                time: '00:00'
            },
            actions: [{
                type: 'updateEntity',
                entityId: 'network',
                changes: { lastReport: new Date() }
            }],
            repeat: true
        });
    }
} 