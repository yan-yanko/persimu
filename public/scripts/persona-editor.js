import { PersonaManager, personaTemplate } from './persona-model.js';

/**
 * Persona Editor Module
 * Handles the persona editor form functionality
 */
class PersonaEditor {
    constructor() {
        this.personaManager = new PersonaManager();
        this.currentPersonaId = null;
        this.form = document.getElementById('personaForm');
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        this.initializeEventListeners();
        this.loadPersonaFromUrl();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        // Form actions
        document.getElementById('saveButton').addEventListener('click', () => this.handleSave());
        document.getElementById('resetButton').addEventListener('click', () => this.handleReset());
        document.getElementById('cancelButton').addEventListener('click', () => this.handleCancel());

        // Form validation
        this.form.addEventListener('input', () => this.validateForm());
    }

    /**
     * Load persona data from URL parameters
     */
    loadPersonaFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const personaId = urlParams.get('id');
        
        if (personaId) {
            this.currentPersonaId = personaId;
            const persona = this.personaManager.getPersonaById(personaId);
            if (persona) {
                this.populateForm(persona);
            }
        }
    }

    /**
     * Populate form with persona data
     * @param {Object} persona - Persona data object
     */
    populateForm(persona) {
        // Helper function to set nested object values
        const setNestedValue = (element, path, value) => {
            if (element) {
                if (Array.isArray(value)) {
                    element.value = value.join(', ');
                } else if (typeof value === 'object' && value !== null) {
                    Object.entries(value).forEach(([key, val]) => {
                        const input = document.querySelector(`[name="${path}.${key}"]`);
                        if (input) {
                            if (Array.isArray(val)) {
                                input.value = val.join('\n');
                            } else {
                                input.value = val;
                            }
                        }
                    });
                } else {
                    element.value = value;
                }
            }
        };

        // Populate all form fields
        Object.entries(persona).forEach(([key, value]) => {
            if (key === 'id') return;
            
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                setNestedValue(element, key, value);
            }
        });
    }

    /**
     * Switch between form tabs
     * @param {string} tabId - ID of the tab to show
     */
    switchTab(tabId) {
        // Update tab buttons
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });

        // Update tab contents
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    }

    /**
     * Validate form data
     * @returns {boolean} Whether the form is valid
     */
    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('invalid');
                isValid = false;
            } else {
                field.classList.remove('invalid');
            }
        });

        return isValid;
    }

    /**
     * Collect form data into a persona object
     * @returns {Object} Persona data object
     */
    collectFormData() {
        const formData = new FormData(this.form);
        const persona = { ...personaTemplate };

        // Helper function to handle nested objects
        const setNestedValue = (obj, path, value) => {
            const parts = path.split('.');
            let current = obj;
            
            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]] = current[parts[i]] || {};
            }
            
            const lastPart = parts[parts.length - 1];
            if (Array.isArray(current[lastPart])) {
                current[lastPart] = value.split(',').map(item => item.trim()).filter(Boolean);
            } else if (typeof current[lastPart] === 'object' && current[lastPart] !== null) {
                Object.assign(current[lastPart], value);
            } else {
                current[lastPart] = value;
            }
        };

        // Process all form fields
        formData.forEach((value, key) => {
            if (key.includes('.')) {
                setNestedValue(persona, key, value);
            } else {
                persona[key] = value;
            }
        });

        return persona;
    }

    /**
     * Handle form save
     */
    handleSave() {
        if (!this.validateForm()) {
            alert('Please fill in all required fields');
            return;
        }

        const personaData = this.collectFormData();
        
        if (this.currentPersonaId) {
            // Update existing persona
            if (this.personaManager.updatePersona(this.currentPersonaId, personaData)) {
                alert('Persona updated successfully');
                window.location.href = 'personas.html';
            } else {
                alert('Error updating persona');
            }
        } else {
            // Create new persona
            const newId = this.personaManager.addPersona(personaData);
            if (newId) {
                alert('Persona created successfully');
                window.location.href = 'personas.html';
            } else {
                alert('Error creating persona');
            }
        }
    }

    /**
     * Handle form reset
     */
    handleReset() {
        if (confirm('Are you sure you want to reset the form?')) {
            this.form.reset();
            if (this.currentPersonaId) {
                const persona = this.personaManager.getPersonaById(this.currentPersonaId);
                if (persona) {
                    this.populateForm(persona);
                }
            }
        }
    }

    /**
     * Handle form cancel
     */
    handleCancel() {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            window.location.href = 'personas.html';
        }
    }
}

// Initialize the editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PersonaEditor();
}); 