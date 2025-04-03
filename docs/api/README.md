# תיעוד API - סימולציית מחקר שוק

## תוכן עניינים
1. [סקירה כללית](#סקירה-כללית)
2. [התחלה מהירה](#התחלה-מהירה)
3. [התקנה](#התקנה)
4. [ארכיטקטורה](#ארכיטקטורה)
5. [אבטחה והרשאות](#אבטחה-והרשאות)
6. [נקודות קצה](#נקודות-קצה)
7. [SDK](#sdk)
8. [שאלות נפוצות](#שאלות-נפוצות)

## סקירה כללית

מערכת סימולציית מחקר השוק מאפשרת לפתח ולבצע סימולציות של מחקרי שוק באמצעות סוכנים וירטואליים. המערכת מספקת ממשק תכנות (API) המאפשר אינטגרציה עם מערכות חיצוניות ופיתוח יישומים מותאמים אישית.

### תכונות עיקריות
- יצירה וניהול של סימולציות מחקר שוק
- הגדרת סוכנים וירטואליים עם מאפיינים שונים
- ניהול שיטות מחקר (קבוצות מיקוד, ראיונות, בדיקות קונספט)
- ניתוח תוצאות בזמן אמת
- אינטגרציה עם מודלי שפה מתקדמים
- ממשק REST API מקיף

## התחלה מהירה

### דרישות מערכת
- Node.js 14 ומעלה
- npm או yarn
- גישה לאינטרנט (לאינטגרציה עם מודלי שפה)

### התקנה בסיסית
```bash
npm install @persimu/market-research-api
```

### דוגמה בסיסית
```javascript
const { MarketResearchAPI } = require('@persimu/market-research-api');

const api = new MarketResearchAPI({
    apiKey: 'your-api-key',
    environment: 'development'
});

// יצירת סימולציה חדשה
const simulation = await api.createSimulation({
    name: 'מחקר שוק למוצר חדש',
    product: {
        name: 'פרי-בר',
        description: 'חטיף פירות יבשים טבעי',
        price: 15.90
    }
});

// הרצת סימולציה
await simulation.start();
```

## התקנה

### התקנה מקומית
1. הורדת הקוד:
```bash
git clone https://github.com/your-org/persimu-market-research.git
cd persimu-market-research
```

2. התקנת תלויות:
```bash
npm install
```

3. הגדרת משתני סביבה:
```bash
cp .env.example .env
# עריכת קובץ .env עם הגדרות נדרשות
```

4. הפעלת השרת:
```bash
npm run dev
```

### התקנה על שרת
1. התקנת Node.js ונתיבי גישה:
```bash
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. התקנת המערכת:
```bash
git clone https://github.com/your-org/persimu-market-research.git
cd persimu-market-research
npm install --production
```

3. הגדרת PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

### התקנה בענן
המערכת תומכת בהתקנה על שירותי ענן נפוצים:

#### AWS
```bash
# התקנה על EC2
aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --instance-type t2.micro

# התקנה על ECS
aws ecs create-cluster --cluster-name persimu-cluster
```

#### Google Cloud
```bash
# התקנה על Compute Engine
gcloud compute instances create persimu-instance --machine-type=e2-micro

# התקנה על Cloud Run
gcloud run deploy persimu-service --source .
```

## ארכיטקטורה

### מבנה המערכת
```
persimu-market-research/
├── src/
│   ├── api/           # נקודות קצה של ה-API
│   ├── core/          # לוגיקת ליבה
│   ├── models/        # מודלים וסכמות
│   ├── services/      # שירותים
│   └── utils/         # כלי עזר
├── tests/             # בדיקות
├── docs/              # תיעוד
└── examples/          # דוגמאות קוד
```

### תהליכי ליבה
1. **ניהול סימולציות**
   - יצירה והגדרה
   - הרצה וניטור
   - ניתוח תוצאות

2. **ניהול סוכנים**
   - הגדרת מאפיינים
   - התנהגות וקבלת החלטות
   - אינטראקציות

3. **ניהול מחקר**
   - שיטות מחקר
   - איסוף נתונים
   - ניתוח תוצאות

## אבטחה והרשאות

### אימות
המערכת משתמשת ב-JWT לאימות:
```javascript
const token = await api.authenticate({
    apiKey: 'your-api-key',
    secret: 'your-api-secret'
});
```

### הרשאות
- **admin**: גישה מלאה למערכת
- **researcher**: ניהול סימולציות ומחקר
- **analyst**: צפייה בתוצאות וניתוח
- **viewer**: צפייה בלבד

### אבטחת נתונים
- הצפנת נתונים במנוחה
- הצפנת תקשורת (HTTPS)
- ניהול מפתחות API
- הגבלת גישה לפי IP

## נקודות קצה

### סימולציות
```http
POST /api/v1/simulations
GET /api/v1/simulations
GET /api/v1/simulations/{id}
PUT /api/v1/simulations/{id}
DELETE /api/v1/simulations/{id}
```

### סוכנים
```http
POST /api/v1/agents
GET /api/v1/agents
GET /api/v1/agents/{id}
PUT /api/v1/agents/{id}
DELETE /api/v1/agents/{id}
```

### מחקר
```http
POST /api/v1/research/methods
GET /api/v1/research/results
GET /api/v1/research/analysis
```

## SDK

### התקנה
```bash
npm install @persimu/market-research-sdk
```

### שימוש בסיסי
```javascript
const { MarketResearchSDK } = require('@persimu/market-research-sdk');

const sdk = new MarketResearchSDK({
    apiKey: 'your-api-key'
});

// יצירת סימולציה
const simulation = await sdk.createSimulation({
    name: 'מחקר שוק',
    product: {
        name: 'פרי-בר',
        price: 15.90
    }
});

// ניהול סוכנים
const agent = await sdk.createAgent({
    name: 'דנה כהן',
    demographics: {
        age: 28,
        income: 'גבוה'
    }
});

// ניתוח תוצאות
const results = await sdk.analyzeResults(simulation.id);
```

## שאלות נפוצות

### שאלות כלליות
1. **מהי סימולציית מחקר שוק?**
   - מערכת המאפשרת סימולציה של מחקרי שוק באמצעות סוכנים וירטואליים.

2. **איך עובדת המערכת?**
   - המערכת משתמשת במודלי שפה מתקדמים ליצירת סוכנים וירטואליים המגיבים באופן ריאליסטי.

3. **מה המגבלות של המערכת?**
   - מגבלות API: 100 בקשות לדקה
   - גודל מקסימלי לבקשה: 10MB
   - מספר מקסימלי של סוכנים: 1000

### שאלות טכניות
1. **איך מתחברים ל-API?**
   ```javascript
   const api = new MarketResearchAPI({
       apiKey: 'your-api-key'
   });
   ```

2. **איך מטפלים בשגיאות?**
   ```javascript
   try {
       await api.createSimulation(data);
   } catch (error) {
       console.error('שגיאה:', error.message);
   }
   ```

3. **איך מנהלים הרשאות?**
   ```javascript
   const token = await api.authenticate({
       apiKey: 'your-api-key',
       permissions: ['read', 'write']
   });
   ```

### שאלות על ביצועים
1. **מה זמן התגובה של ה-API?**
   - זמן תגובה ממוצע: 200ms
   - זמן מקסימלי: 2s

2. **איך מטפלים בעומסים?**
   - שימוש ב-caching
   - rate limiting
   - load balancing

3. **איך משפרים ביצועים?**
   - שימוש ב-batch requests
   - caching תשובות
   - אופטימיזציית שאילתות 