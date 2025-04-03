# Deployment Plan - Persimu

## אפשרויות פריסה

### פריסה מקומית

#### דרישות מערכת
- Node.js 14+
- npm או yarn
- גישה לאינטרנט (לשירותי API)

#### שלבי התקנה
1. התקנת תלויות:
   ```bash
   npm install
   ```

2. הגדרת משתני סביבה:
   ```bash
   cp .env.example .env
   # עריכת קובץ .env
   ```

3. בניית הפרויקט:
   ```bash
   npm run build
   ```

4. הפעלת השרת:
   ```bash
   npm start
   ```

### פריסה בשרת ווב

#### דרישות שרת
- Node.js 14+
- PM2 או מערכת ניהול תהליכים דומה
- Nginx או שרת ווב אחר
- SSL תעודה (מומלץ)

#### שלבי פריסה
1. העלאת קבצים לשרת:
   ```bash
   scp -r ./* user@server:/path/to/app
   ```

2. התקנת תלויות בשרת:
   ```bash
   cd /path/to/app
   npm install --production
   ```

3. הגדרת PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. הגדרת Nginx:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### פריסה בענן

#### AWS
1. יצירת EC2 instance
2. התקנת Node.js
3. העלאת קבצים
4. הגדרת Security Groups
5. הפעלת המערכת

#### Google Cloud
1. יצירת Compute Engine instance
2. התקנת Node.js
3. העלאת קבצים
4. הגדרת Firewall Rules
5. הפעלת המערכת

## אבטחה

### אבטחת API
1. שימוש ב-JWT לאימות
2. הגבלת קצב בקשות
3. הצפנת תקשורת
4. ניהול מפתחות API

### הגנה על נתוני משתמשים
1. הצפנת נתונים רגישים
2. גיבוי אוטומטי
3. ניהול הרשאות
4. תיעוד פעולות

## גיבוי ושחזור

### גיבוי נתונים
1. גיבוי אוטומטי יומי:
   ```bash
   # גיבוי קבצי נתונים
   tar -czf backup_$(date +%Y%m%d).tar.gz ./data
   
   # גיבוי מסד נתונים
   mongodump --out ./backup_$(date +%Y%m%d)
   ```

2. שמירת גיבויים:
   - שמירה מקומית
   - העלאה לענן
   - שמירת היסטוריה

### שחזור מערכת
1. שחזור קבצים:
   ```bash
   tar -xzf backup_YYYYMMDD.tar.gz
   ```

2. שחזור מסד נתונים:
   ```bash
   mongorestore ./backup_YYYYMMDD
   ```

3. אימות תקינות:
   - בדיקת קבצים
   - בדיקת מסד נתונים
   - בדיקת תקשורת

## ניטור ותחזוקה

### ניטור מערכת
1. ניטור זמינות
2. ניטור ביצועים
3. ניטור שגיאות
4. התראות אוטומטיות

### תחזוקה שוטפת
1. עדכון תלויות
2. ניקוי קבצי זמניים
3. אופטימיזציה
4. גיבוי נתונים

## פתרון בעיות

### בעיות נפוצות
1. בעיות התחברות
2. בעיות ביצועים
3. בעיות אחסון
4. בעיות תקשורת

### צעדי פתרון
1. בדיקת לוגים
2. אימות הגדרות
3. בדיקת רשת
4. שחזור גיבוי 