# מדריך סגנון - ממשק משתמש Persimu

## עקרונות עיצוב

### 1. עקביות
- שימוש בלוח צבעים אחיד בכל המערכת
- שמירה על מרווחים ופרופורציות קבועים
- שימוש בגופנים אחידים לכל הטקסטים

### 2. פשטות
- עיצוב נקי ומינימליסטי
- הימנעות מעומס ויזואלי
- שימוש בחלל לבן (white space) באופן אפקטיבי

### 3. נגישות
- תמיכה מלאה בקוראי מסך
- ניגודיות צבעים מינימלית של 4.5:1
- תמיכה בהגדלת טקסט עד 200%

### 4. רספונסיביות
- התאמה לכל גודל מסך
- תמיכה במכשירים ניידים וטאבלטים
- שימוש ב-Flexbox ו-Grid

## לוח צבעים

### צבעים ראשיים
- צבע ראשי: `#2C3E50` (כחול כהה)
- צבע משני: `#3498DB` (כחול בהיר)
- צבע דגש: `#E74C3C` (אדום)

### צבעי מערכת
- הצלחה: `#2ECC71` (ירוק)
- אזהרה: `#F1C40F` (צהוב)
- שגיאה: `#E74C3C` (אדום)

### צבעי טקסט
- טקסט ראשי: `#2C3E50`
- טקסט משני: `#7F8C8D`
- טקסט בהיר: `#FFFFFF`

## טיפוגרפיה

### גופנים
- גופן ראשי: Rubik
- גופן משני: Open Sans

### גדלי טקסט
- כותרות ראשיות: 2.25rem
- כותרות משניות: 1.875rem
- כותרות קטנות: 1.5rem
- טקסט רגיל: 1rem
- טקסט קטן: 0.875rem
- טקסט זעיר: 0.75rem

### משקלי גופן
- רגיל: 400
- בינוני: 500
- מודגש: 700

## מרווחים

### מרווחים אנכיים
- מרווח קטן: 0.25rem
- מרווח בינוני: 0.5rem
- מרווח גדול: 1rem
- מרווח גדול מאוד: 1.5rem
- מרווח ענק: 2rem

### מרווחים אופקיים
- מרווח קטן: 0.5rem
- מרווח בינוני: 1rem
- מרווח גדול: 2rem

## רכיבי ממשק

### כפתורים
```html
<button class="btn btn-primary">כפתור ראשי</button>
<button class="btn btn-secondary">כפתור משני</button>
<button class="btn btn-accent">כפתור דגש</button>
```

### שדות טקסט
```html
<div class="form-group">
    <label class="form-label">תווית</label>
    <input type="text" class="form-input" />
</div>
```

### כרטיסיות
```html
<div class="card">
    <h3>כותרת</h3>
    <p>תוכן</p>
</div>
```

### התראות
```html
<div class="alert alert-success">הצלחה!</div>
<div class="alert alert-error">שגיאה!</div>
<div class="alert alert-warning">אזהרה!</div>
```

## נגישות

### תקני WCAG 2.1 AA
- ניגודיות צבעים מינימלית של 4.5:1
- תמיכה בהגדלת טקסט עד 200%
- תמיכה בניווט מקלדת
- תמיכה בקוראי מסך

### תמיכה בקוראי מסך
```html
<!-- טקסט חלופי לתמונות -->
<img src="image.jpg" alt="תיאור התמונה" />

<!-- טקסט מוסתר לקוראי מסך -->
<span class="sr-only">טקסט מוסתר</span>
```

### מצבי מיקוד
```css
:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
```

## רספונסיביות

### נקודות שבירה
- מובייל: < 768px
- טאבלט: 768px - 1024px
- דסקטופ: > 1024px

### התאמות למובייל
```css
@media (max-width: 768px) {
    :root {
        --spacing-lg: 1rem;
        --spacing-xl: 1.5rem;
    }
}
```

## אנימציות

### מעברים
- מהיר: 150ms
- רגיל: 250ms
- איטי: 350ms

### אנימציות טעינה
```html
<div class="loading"></div>
```

## קיצורי מקלדת

### קיצורים נפוצים
- `Ctrl + S`: שמירה
- `Ctrl + Z`: ביטול
- `Ctrl + Y`: חזרה על ביטול
- `Tab`: ניווט בין שדות
- `Enter`: אישור
- `Esc`: ביטול/סגירה

## תהליכי משתמש

### אשף יצירת פרסונה
1. בחירת תבנית
2. הגדרת פרטים בסיסיים
3. הגדרת תכונות
4. הגדרת זיכרונות
5. אישור וסיום

### אשף יצירת סימולציה
1. בחירת פרסונות
2. הגדרת תרחיש
3. הגדרת פרמטרים
4. הפעלת סימולציה
5. צפייה בתוצאות

## דוגמאות שימוש

### טופס יצירת פרסונה
```html
<form class="wizard-form">
    <div class="form-group">
        <label class="form-label">שם הפרסונה</label>
        <input type="text" class="form-input" required />
    </div>
    <div class="form-group">
        <label class="form-label">תיאור</label>
        <textarea class="form-input" rows="3"></textarea>
    </div>
    <div class="form-actions">
        <button type="button" class="btn btn-secondary">ביטול</button>
        <button type="submit" class="btn btn-primary">שמירה</button>
    </div>
</form>
```

### כרטיס פרסונה
```html
<div class="card persona-card">
    <div class="persona-header">
        <h3>שם הפרסונה</h3>
        <span class="persona-type">סוכן מכירות</span>
    </div>
    <div class="persona-content">
        <p>תיאור קצר של הפרסונה...</p>
        <div class="persona-stats">
            <span>זיכרונות: 10</span>
            <span>אינטראקציות: 25</span>
        </div>
    </div>
    <div class="persona-actions">
        <button class="btn btn-primary">עריכה</button>
        <button class="btn btn-secondary">הפעלה</button>
    </div>
</div>
``` 