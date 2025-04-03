# תיעוד נקודות קצה API

## סימולציות

### יצירת סימולציה חדשה
```http
POST /api/v1/simulations
```

#### תיאור
יוצר סימולציית מחקר שוק חדשה.

#### פרמטרים נדרשים
```json
{
    "name": "מחקר שוק למוצר חדש",
    "product": {
        "name": "פרי-בר",
        "description": "חטיף פירות יבשים טבעי",
        "price": 15.90,
        "features": [
            "100% טבעי",
            "עשיר בחלבון צמחי",
            "ללא סוכר"
        ]
    },
    "researchMethods": [
        "focusGroup",
        "interviews",
        "conceptTesting"
    ]
}
```

#### תגובה מוצלחת
```json
{
    "id": "sim_123",
    "name": "מחקר שוק למוצר חדש",
    "status": "created",
    "createdAt": "2024-03-20T10:00:00Z",
    "product": {
        "name": "פרי-בר",
        "description": "חטיף פירות יבשים טבעי",
        "price": 15.90
    }
}
```

#### קודי שגיאה
- `400`: פרמטרים לא תקינים
- `401`: לא מורשה
- `429`: חריגת מגבלת בקשות

### קבלת רשימת סימולציות
```http
GET /api/v1/simulations
```

#### פרמטרים אופציונליים
- `page`: מספר עמוד (ברירת מחדל: 1)
- `limit`: מספר פריטים בעמוד (ברירת מחדל: 10)
- `status`: סטטוס הסימולציה
- `sortBy`: שדה למיון
- `sortOrder`: סדר מיון (asc/desc)

#### תגובה מוצלחת
```json
{
    "data": [
        {
            "id": "sim_123",
            "name": "מחקר שוק למוצר חדש",
            "status": "running",
            "createdAt": "2024-03-20T10:00:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100
    }
}
```

### קבלת פרטי סימולציה
```http
GET /api/v1/simulations/{id}
```

#### פרמטרים נדרשים
- `id`: מזהה הסימולציה

#### תגובה מוצלחת
```json
{
    "id": "sim_123",
    "name": "מחקר שוק למוצר חדש",
    "status": "running",
    "createdAt": "2024-03-20T10:00:00Z",
    "product": {
        "name": "פרי-בר",
        "description": "חטיף פירות יבשים טבעי",
        "price": 15.90
    },
    "metrics": {
        "totalAgents": 50,
        "completedInteractions": 150,
        "averageSentiment": 0.75
    }
}
```

### עדכון סימולציה
```http
PUT /api/v1/simulations/{id}
```

#### פרמטרים נדרשים
- `id`: מזהה הסימולציה

#### גוף הבקשה
```json
{
    "name": "שם מעודכן",
    "product": {
        "price": 16.90
    }
}
```

#### תגובה מוצלחת
```json
{
    "id": "sim_123",
    "name": "שם מעודכן",
    "status": "running",
    "product": {
        "price": 16.90
    }
}
```

## סוכנים

### יצירת סוכן חדש
```http
POST /api/v1/agents
```

#### גוף הבקשה
```json
{
    "name": "דנה כהן",
    "demographics": {
        "age": 28,
        "gender": "נקבה",
        "income": "גבוה",
        "location": "תל אביב",
        "occupation": "מפתחת תוכנה"
    },
    "lifestyle": "ספורטיבי",
    "consumption": {
        "frequency": "יומי",
        "preferences": ["חטיפי בריאות", "פירות יבשים"],
        "priceSensitivity": 0.3,
        "healthAwareness": 0.9
    },
    "nutrition": {
        "diet": "צמחוני",
        "restrictions": ["ללא גלוטן"],
        "preferences": ["חלבון צמחי", "סיבים תזונתיים"]
    }
}
```

#### תגובה מוצלחת
```json
{
    "id": "agent_123",
    "name": "דנה כהן",
    "createdAt": "2024-03-20T10:00:00Z",
    "demographics": {
        "age": 28,
        "gender": "נקבה"
    }
}
```

### קבלת רשימת סוכנים
```http
GET /api/v1/agents
```

#### פרמטרים אופציונליים
- `simulationId`: מזהה הסימולציה
- `page`: מספר עמוד
- `limit`: מספר פריטים בעמוד
- `demographics`: סינון לפי מאפיינים דמוגרפיים

#### תגובה מוצלחת
```json
{
    "data": [
        {
            "id": "agent_123",
            "name": "דנה כהן",
            "demographics": {
                "age": 28,
                "gender": "נקבה"
            }
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 50
    }
}
```

## מחקר

### הרצת שיטת מחקר
```http
POST /api/v1/research/methods
```

#### גוף הבקשה
```json
{
    "simulationId": "sim_123",
    "method": "focusGroup",
    "parameters": {
        "duration": 90,
        "participants": 8,
        "topics": [
            "תגובה ראשונית לקונספט",
            "הערכת אריזה ומיתוג"
        ]
    }
}
```

#### תגובה מוצלחת
```json
{
    "id": "research_123",
    "method": "focusGroup",
    "status": "running",
    "startedAt": "2024-03-20T10:00:00Z",
    "participants": 8
}
```

### קבלת תוצאות מחקר
```http
GET /api/v1/research/results
```

#### פרמטרים נדרשים
- `simulationId`: מזהה הסימולציה
- `method`: שיטת המחקר

#### תגובה מוצלחת
```json
{
    "method": "focusGroup",
    "totalParticipants": 8,
    "results": [
        {
            "agentId": "agent_123",
            "sentiment": 0.8,
            "interest": 0.9,
            "willingnessToPay": 18.90,
            "feedback": "מעניין מאוד, אשמח לנסות"
        }
    ],
    "summary": {
        "averageSentiment": 0.75,
        "averageWillingnessToPay": 17.50
    }
}
```

### קבלת ניתוח תוצאות
```http
GET /api/v1/research/analysis
```

#### פרמטרים נדרשים
- `simulationId`: מזהה הסימולציה

#### תגובה מוצלחת
```json
{
    "summary": {
        "totalParticipants": 50,
        "averageSentiment": 0.75,
        "averageWillingnessToPay": 17.50,
        "averagePurchaseProbability": 0.65
    },
    "insights": [
        {
            "type": "sentiment",
            "priority": "high",
            "description": "תגובה חיובית מאוד לקונספט המוצר"
        }
    ],
    "recommendations": [
        {
            "type": "pricing",
            "priority": "medium",
            "description": "יש לשקול הורדת מחיר או הוספת ערך"
        }
    ]
}
```

## מגבלות ומגבלות שימוש

### מגבלות כלליות
- **Rate Limit**: 100 בקשות לדקה
- **גודל בקשה מקסימלי**: 10MB
- **זמן תגובה ממוצע**: 200ms
- **זמן תגובה מקסימלי**: 2s

### מגבלות ספציפיות
- **מספר סוכנים מקסימלי**: 1000
- **מספר משתתפים בקבוצת מיקוד**: 8
- **משך זמן מקסימלי לסימולציה**: 24 שעות
- **מספר שיטות מחקר במקביל**: 3

### טיפול בשגיאות
```json
{
    "error": {
        "code": "RATE_LIMIT_EXCEEDED",
        "message": "חריגת מגבלת בקשות",
        "details": {
            "limit": 100,
            "reset": "2024-03-20T10:01:00Z"
        }
    }
}
```

### קודי שגיאה נפוצים
- `400`: פרמטרים לא תקינים
- `401`: לא מורשה
- `403`: גישה אסורה
- `404`: לא נמצא
- `429`: חריגת מגבלת בקשות
- `500`: שגיאת שרת פנימית 