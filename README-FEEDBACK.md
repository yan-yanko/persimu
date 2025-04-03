# מערכת משוב מקיפה - Persimu

מערכת משוב מקיפה לאיסוף, ניהול ואנליזה של משוב לקוחות, תכנית בטא, ראיונות משתמשים ומפת דרכים למוצר.

## רכיבים עיקריים

מערכת המשוב מורכבת מארבעה מודולים עיקריים:

1. **מנהל משוב (FeedbackManager)** - איסוף וניהול משוב ממשתמשים בכל נקודות המגע במערכת
2. **מנהל בטא (BetaManager)** - ניהול מלא של תכנית בטא כולל משתתפים, תכונות לבדיקה ומעקב אחר משוב
3. **מנהל ראיונות משתמשים (UserInterviewManager)** - תכנון וניהול ראיונות משתמשים ותיעוד התובנות העולות מהם
4. **מנהל מפת דרכים (RoadmapManager)** - ניהול מפת דרכים למוצר המשלבת משוב משתמשים בתכנית הפיתוח העתידית

## התקנה

```bash
# התקנה באמצעות npm
npm install --save persimu-feedback

# או באמצעות yarn
yarn add persimu-feedback
```

## שימוש בסיסי

### יצירת מנהל משוב

```typescript
import { FeedbackManager } from 'persimu-feedback';
import { createFeedbackRepository } from './your-repository-implementation';

// יצירת אובייקט מאגר נתונים למשוב (נדרש מימוש ספציפי)
const feedbackRepository = createFeedbackRepository();

// יצירת מנהל משוב
const feedbackManager = new FeedbackManager(feedbackRepository);
```

### הגדרת תזמון להצגת בקשות משוב

```typescript
import { FeedbackType, FeedbackTriggerPoint } from 'persimu-feedback';

// הגדרת תזמון לסקר שביעות רצון לאחר השלמת סימולציה
feedbackManager.addScheduleConfig({
    trigger: FeedbackTriggerPoint.POST_RESULTS,
    type: FeedbackType.SURVEY,
    frequency: {
        newUsers: 1,        // להציג למשתמשים חדשים בסשן הראשון
        regularUsers: 5,    // להציג למשתמשים קבועים כל 5 סשנים
        minTimeBetween: 72  // מינימום 72 שעות בין בקשות
    },
    conditions: {
        minSessionCount: 2,            // לפחות 2 סשנים
        completedSimulations: 1,       // לפחות סימולציה אחת הושלמה
        randomSampling: 0.5            // להציג רק ל-50% מהמשתמשים
    },
    content: {
        title: "כיצד עבדה הסימולציה עבורך?",
        description: "אנו מעוניינים לשמוע על חווייתך. המשוב שלך יעזור לנו להשתפר.",
        buttonText: "תן משוב",
        dismissible: true
    }
});
```

### בדיקה האם להציג בקשת משוב

```typescript
// בדיקה אם להציג משוב בנקודה מסוימת
const userId = "user123";
const triggerPoint = FeedbackTriggerPoint.POST_RESULTS;

const shouldShow = feedbackManager.shouldShowFeedback(userId, triggerPoint);
if (shouldShow) {
    // הצגת בקשת משוב למשתמש בהתאם לתצורה שהוחזרה
    showFeedbackRequest(shouldShow.content);
}
```

### יצירת משוב

```typescript
// יצירת משוב דירוג
const ratingFeedbackId = await feedbackManager.createRatingFeedback(
    "user123",
    FeedbackTriggerPoint.POST_RESULTS,
    4,  // דירוג 4 מתוך 5
    "usability",
    "ממשק נוח לשימוש, אך היו כמה קשיים בהגדרת תרחישים"
);

// יצירת משוב סקר
const surveyFeedbackId = await feedbackManager.createSurveyFeedback(
    "user123",
    FeedbackTriggerPoint.POST_SESSION,
    [
        {
            id: "q1",
            question: "כמה קל היה להגדיר סימולציה?",
            answerType: "rating",
            answer: 4
        },
        {
            id: "q2",
            question: "מה היו האתגרים העיקריים?",
            answerType: "text",
            answer: "הגדרת כללי התנהגות למשתתפים הייתה מורכבת"
        }
    ],
    120  // זמן מילוי בשניות
);

// יצירת דיווח באג
const bugReportId = await feedbackManager.createBugReport(
    "user123",
    FeedbackTriggerPoint.MANUAL,
    "בעיית תצוגת גרפים בדוח",
    "הגרפים אינם מוצגים כראוי בדוח התוצאות",
    [
        "נכנסתי לדף תוצאות הסימולציה",
        "לחצתי על לשונית 'ניתוח גרפי'",
        "הגרפים הופיעו ריקים ללא נתונים"
    ],
    "הגרפים אמורים להציג נתונים מהסימולציה",
    "הגרפים מופיעים ריקים",
    "high",
    "frequent"
);
```

### ניתוח ואנליטיקת משוב

```typescript
// קבלת אנליטיקת משוב לתקופה מסוימת
const startDate = new Date("2023-01-01");
const endDate = new Date("2023-06-30");

const analytics = await feedbackManager.analyzeFeedbackData(startDate, endDate);

console.log(`סך כל המשובים: ${analytics.usage.totalSubmissions}`);
console.log(`אחוז משוב חיובי: ${analytics.sentiment.positive}%`);
console.log(`אחוז משוב שלילי: ${analytics.sentiment.negative}%`);
console.log(`זמן מילוי ממוצע: ${analytics.response.avgCompletionTime} שניות`);
```

## ניהול תכנית בטא

### יצירת תכנית בטא

```typescript
import { BetaManager } from 'persimu-feedback';
import { createBetaRepository } from './your-repository-implementation';

// יצירת אובייקט מאגר נתונים לתכנית בטא (נדרש מימוש ספציפי)
const betaRepository = createBetaRepository();

// יצירת מנהל בטא
const betaManager = new BetaManager(betaRepository);

// יצירת תכנית בטא חדשה
const betaProgramId = await betaManager.createBetaProgram(
    "בטא לגרסה 2.0",
    "בדיקת ממשק משתמש חדש וכלי סימולציה מתקדמים",
    50,  // קיבולת משתתפים
    new Date("2023-08-01"),  // תחילת גיוס
    new Date("2023-08-30"),  // סיום גיוס
    new Date("2023-09-01"),  // תחילת תכנית
    new Date("2023-10-30"),  // סיום תכנית
    [
        "משתמשים פעילים בגרסה הנוכחית",
        "ניסיון בתחום הסימולציה",
        "מגוון ארגונים וגדלים"
    ],
    true  // דורש NDA
);

// הוספת תכונות לבדיקה בתכנית הבטא
await betaManager.addFeature(
    betaProgramId,
    "עורך תרחישים מתקדם",
    "ממשק drag-and-drop חדש ליצירת תרחישים מורכבים",
    [
        "בדיקת שימושיות הממשק החדש",
        "מדידת זמן יצירת תרחיש בהשוואה לגרסה הקודמת",
        "איתור באגים ובעיות תאימות"
    ]
);

// הזמנת משתתפים
const participantId = await betaManager.inviteParticipant(
    betaProgramId,
    "user456",
    "user@example.com",
    "משה ישראלי"
);
```

### מעקב אחר פעילות בתכנית בטא

```typescript
// תיעוד פעילות משתתף בבטא
await betaManager.recordParticipantActivity(
    participantId,
    "feature-123"  // מזהה תכונה שנבדקה
);

// תיעוד משוב מתכנית בטא
await betaManager.recordFeedback(
    participantId,
    ratingFeedbackId,  // מזהה משוב שנוצר
    "feature-123"      // מזהה תכונה
);

// קבלת סטטיסטיקות תכנית
const stats = await betaManager.getProgramStats(betaProgramId);
console.log(`משתתפים פעילים: ${stats.totalActive}`);
console.log(`ממוצע משובים למשתתף: ${stats.avgFeedbackPerParticipant}`);
```

## ניהול ראיונות משתמשים

### יצירת תכנית ראיונות

```typescript
import { UserInterviewManager } from 'persimu-feedback';
import { createInterviewRepository } from './your-repository-implementation';

// יצירת אובייקט מאגר נתונים לראיונות (נדרש מימוש ספציפי)
const interviewRepository = createInterviewRepository();

// יצירת מנהל ראיונות
const interviewManager = new UserInterviewManager(interviewRepository);

// יצירת תכנית ראיונות חדשה
const interviewPlanId = await interviewManager.createInterviewPlan(
    "חקר שימושיות ממשק החדש",
    "הבנת חוויית המשתמש עם הממשק החדש ואיתור נקודות חיכוך",
    10,  // מספר משתתפים מטרה
    ["משתמשים חדשים", "משתמשים ותיקים"],  // קריטריונים
    ["מנהלי HR", "מנהלי הדרכה", "יועצים ארגוניים"],  // מגזרים
    new Date("2023-09-01"),  // תאריך התחלה
    new Date("2023-09-30"),  // תאריך סיום
    60,  // משך ראיון בדקות
    3,   // מרווח ימים בין ראיונות
    "product_credit",  // סוג תמריץ
    "חודש שימוש חינם",  // ערך התמריץ
    "כל משתתף יקבל חודש שימוש בחינם בגרסה המתקדמת",  // תיאור התמריץ
    [
        {
            text: "תאר את הניסיון שלך עם המערכת עד כה",
            type: "open",
            purpose: "הבנת הרקע ונקודת המבט של המשתמש",
            estimatedTimeMinutes: 5
        },
        {
            text: "נסה ליצור סימולציה חדשה באמצעות הממשק החדש",
            type: "task",
            purpose: "מדידת קלות שימוש בממשק החדש",
            estimatedTimeMinutes: 15
        }
    ]
);
```

### ניהול ראיונות

```typescript
// תזמון ראיון חדש
const interviewId = await interviewManager.scheduleInterview(
    interviewPlanId,
    "user789",
    "רונית כהן",
    new Date("2023-09-15T10:00:00")
);

// הוספת תשובה לשאלה בראיון
await interviewManager.addAnswerToInterview(
    interviewId,
    "question-1",  // מזהה שאלה
    "השתמשתי במערכת כשלושה חודשים ואני מרוצה באופן כללי",
    "המשתמש מביע שביעות רצון כללית אך נראה שיש מקום לשיפור"
);

// הוספת תובנה מהראיון
await interviewManager.addInsightToInterview(
    interviewId,
    "משתמשים מתקשים למצוא את כפתור הוספת משתתפים לסימולציה בממשק החדש"
);

// עדכון סטטוס ראיון לאחר השלמתו
await interviewManager.updateInterviewStatus(
    interviewId,
    "completed",
    55  // משך הראיון בפועל בדקות
);

// קבלת סיכום תכנית ראיונות
const summary = await interviewManager.getPlanSummary(interviewPlanId);
console.log(`ראיונות שהושלמו: ${summary.completedInterviews}`);
console.log(`שיעור השלמה: ${summary.completionRate}%`);
```

## ניהול מפת דרכים

### יצירת פריטים במפת הדרכים

```typescript
import { RoadmapManager } from 'persimu-feedback';
import { createRoadmapRepository } from './your-repository-implementation';

// יצירת אובייקט מאגר נתונים למפת דרכים (נדרש מימוש ספציפי)
const roadmapRepository = createRoadmapRepository();

// יצירת מנהל מפת דרכים
const roadmapManager = new RoadmapManager(roadmapRepository);

// יצירת פריט חדש במפת הדרכים
const roadmapItemId = await roadmapManager.createRoadmapItem(
    "ממשק משתמש חדש",
    "שיפור חוויית המשתמש עם ממשק דראג-אנד-דרופ לבניית תרחישים",
    "UX",  // קטגוריה
    "high",  // עדיפות
    "Q4 2023",  // רבעון יעד
    new Date("2023-11-15"),  // תאריך שחרור משוער
    ["user_feedback", "team_initiative"],  // מקור הפריט
    [bugReportId, ratingFeedbackId]  // מזהי משוב קשורים
);

// הוספת תכונה לפריט במפת הדרכים
await roadmapManager.addFeatureToRoadmapItem(
    roadmapItemId,
    "עורך תרחישים חזותי",
    "ממשק עריכה חזותי בגרירה",
    "system"
);

// קישור משוב נוסף לפריט במפת הדרכים
await roadmapManager.linkFeedbackToRoadmapItem(
    roadmapItemId,
    surveyFeedbackId,
    "admin"
);
```

### ניהול מפת הדרכים הציבורית

```typescript
// עדכון סטטוס פריט במפת הדרכים
await roadmapManager.updateRoadmapItem(
    roadmapItemId,
    {
        status: "in_progress",
        percentComplete: 30
    },
    "dev-team",
    "הפיתוח החל ב-1 בספטמבר"
);

// דחיית פריט במפת הדרכים
await roadmapManager.delayRoadmapItem(
    roadmapItemId,
    "Q1 2024",
    new Date("2024-01-15"),
    "צורך בפיתוח תשתיות נוספות",
    "product-manager"
);

// קבלת מפת הדרכים הציבורית
const publicRoadmap = await roadmapManager.getPublicRoadmap();

// קבלת סיכום מצב מפת הדרכים
const roadmapSummary = await roadmapManager.getRoadmapSummary();
console.log(`סך כל הפריטים: ${roadmapSummary.totalItems}`);
console.log(`פריטים בפיתוח: ${roadmapSummary.byStatus.in_progress}`);
```

## מודולים ופונקציות נוספות

המערכת מכילה פונקציונליות נרחבת נוספת. עיינו בתיעוד המלא של כל מודול:

- [תיעוד מנהל משוב](./docs/feedback-manager.md)
- [תיעוד מנהל בטא](./docs/beta-manager.md)
- [תיעוד מנהל ראיונות](./docs/interview-manager.md)
- [תיעוד מנהל מפת דרכים](./docs/roadmap-manager.md)

## הרחבת המערכת

כדי להשתמש במערכת, עליכם לממש את הממשקים של מאגרי הנתונים עבור כל מודול:

- `FeedbackRepository`
- `BetaRepository`
- `UserInterviewRepository`
- `RoadmapRepository`

המימוש יכול להיות עבור כל סוג של מאגר נתונים - MySQL, MongoDB, Firebase, וכו'. למידע נוסף [ראו את המדריך למימוש מאגרי נתונים](./docs/repositories.md). 