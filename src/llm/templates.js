/**
 * מערכת תבניות prompt
 */

class PromptTemplates {
    constructor() {
        this.templates = new Map();
        this.loadTemplates();
    }

    /**
     * טעינת תבניות
     */
    loadTemplates() {
        // תבנית זהות בסיסית
        this.templates.set('identity', {
            base: `אתה סוכן AI עם המאפיינים הבאים:
- מזהה: {agentId}
- טון: {tone}
- רמת פורמליות: {formality}
- רמת אמפתיה: {empathy}

התנהג בהתאם למאפיינים אלו בכל אינטראקציה.`
        });

        // תבנית סביבה
        this.templates.set('environment', {
            base: `הקשר נוכחי:
{context}

התחשב בהקשר זה בעת מתן תשובות.`
        });

        // תבנית זיכרונות
        this.templates.set('memory', {
            base: `זיכרונות רלוונטיים:
{memories}

השתמש בזיכרונות אלו כדי לספק תשובות מותאמות אישית.`
        });

        // תבנית שיחה
        this.templates.set('conversation', {
            base: `היסטוריית שיחה:
{history}

המשך את השיחה באופן טבעי ועקבי.`
        });

        // תבנית הנחיות
        this.templates.set('instructions', {
            base: `הנחיות ספציפיות:
{instructions}

עקוב אחר ההנחיות הללו בעת מתן תשובה.`
        });

        // תבניות אינטראקציה ספציפיות
        this.templates.set('conversation_interaction', {
            base: `אתה מנהל שיחה עם המשתמש.
- שמור על טון {tone}
- השתמש בשפה {formality}
- גלה {empathy} אמפתיה
- השתמש בזיכרונות רלוונטיים
- עקוב אחר ההנחיות הספציפיות`
        });

        this.templates.set('decision_making', {
            base: `אתה מקבל החלטה.
- שקול את כל הגורמים הרלוונטיים
- השתמש בזיכרונות קודמים
- שקול את ההשלכות
- תן הסבר מפורט להחלטה`
        });

        this.templates.set('planning', {
            base: `אתה מתכנן פעולה.
- הגדר מטרות ברורות
- זהה משאבים נדרשים
- צור תוכנית מפורטת
- זהה נקודות ביקורת`
        });
    }

    /**
     * קבלת תבנית
     */
    getTemplate(type) {
        return this.templates.get(type)?.base || '';
    }

    /**
     * הוספת תבנית חדשה
     */
    addTemplate(type, template) {
        this.templates.set(type, {
            base: template
        });
    }

    /**
     * עדכון תבנית קיימת
     */
    updateTemplate(type, template) {
        if (this.templates.has(type)) {
            this.templates.set(type, {
                base: template
            });
            return true;
        }
        return false;
    }

    /**
     * מחיקת תבנית
     */
    deleteTemplate(type) {
        return this.templates.delete(type);
    }

    /**
     * רשימת כל סוגי התבניות
     */
    listTemplateTypes() {
        return Array.from(this.templates.keys());
    }

    /**
     * בדיקת קיום תבנית
     */
    hasTemplate(type) {
        return this.templates.has(type);
    }

    /**
     * עיבוד תבנית עם פרמטרים
     */
    processTemplate(type, params) {
        let template = this.getTemplate(type);
        
        // החלפת פרמטרים בתבנית
        Object.entries(params).forEach(([key, value]) => {
            template = template.replace(`{${key}}`, value);
        });

        return template;
    }

    /**
     * יצירת prompt מלא
     */
    createFullPrompt(modules) {
        const parts = [];

        // הוספת כל המודולים לפי הסדר
        if (modules.identity) {
            parts.push(this.processTemplate('identity', modules.identity.params));
        }
        if (modules.environment) {
            parts.push(this.processTemplate('environment', modules.environment.params));
        }
        if (modules.memory) {
            parts.push(this.processTemplate('memory', modules.memory.params));
        }
        if (modules.conversation) {
            parts.push(this.processTemplate('conversation', modules.conversation.params));
        }
        if (modules.instructions) {
            parts.push(this.processTemplate('instructions', modules.instructions.params));
        }

        return parts.join('\n\n');
    }
}

module.exports = PromptTemplates; 