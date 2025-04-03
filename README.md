# ספריית ניהול ספקי מודלי שפה

ספרייה זו מספקת ממשק אחיד לעבודה עם מספר ספקי מודלי שפה מובילים, כולל OpenAI, Anthropic, Cohere, Google ו-Mistral.

## תכונות עיקריות

- ממשק אחיד לכל הספקים
- תמיכה במספר מודלים לכל ספק
- ניהול חיבורים וניסיונות חוזרים
- מעקב אחר עלויות ושימוש
- תמיכה בשפות שונות
- בדיקת מגבלות מודלים

## התקנה

```bash
npm install llm-providers
```

או

```bash
yarn add llm-providers
```

## שימוש בסיסי

```typescript
import { LLMManager, OpenAIProvider, AnthropicProvider } from 'llm-providers';

// יצירת מנהל
const manager = new LLMManager();

// הוספת ספקים
manager.addProvider(new OpenAIProvider(process.env.OPENAI_API_KEY));
manager.addProvider(new AnthropicProvider(process.env.ANTHROPIC_API_KEY));

// בחירת המודל המתאים ביותר למשימה
const provider = await manager.selectBestModel({
  complexity: 0.8,
  language: 'he',
  maxCost: 0.01
});

// שליחת prompt
const response = await provider.generate('מה המשמעות של החיים?', {
  temperature: 0.7,
  maxTokens: 1000
});

console.log(response.text);
```

## ספקים נתמכים

### OpenAI
- מודלים: gpt-4, gpt-3.5-turbo, text-davinci-003
- תמיכה בשפות: מלאה
- מגבלות: תלוי במודל

### Anthropic
- מודלים: claude-3-opus, claude-3-sonnet, claude-3-haiku
- תמיכה בשפות: מלאה
- מגבלות: תלוי במודל

### Cohere
- מודלים: command, command-light, command-nightly
- תמיכה בשפות: בעיקר אנגלית
- מגבלות: תלוי במודל

### Google
- מודלים: gemini-pro, gemini-pro-vision, text-bison
- תמיכה בשפות: מלאה
- מגבלות: תלוי במודל

### Mistral
- מודלים: mistral-large, mistral-medium, mistral-small
- תמיכה בשפות: מלאה
- מגבלות: תלוי במודל

## הגדרות סביבה

העתק את קובץ `.env.example` ל-`.env` והגדר את מפתחות ה-API הנדרשים:

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
COHERE_API_KEY=your_cohere_api_key
GOOGLE_API_KEY=your_google_api_key
MISTRAL_API_KEY=your_mistral_api_key
```

## פיתוח

```bash
# התקנת תלויות
npm install

# בנייה
npm run build

# בדיקות
npm test

# בדיקת סגנון קוד
npm run lint

# פורמט קוד
npm run format
```

## רישיון

MIT 