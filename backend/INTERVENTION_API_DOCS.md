# Intervention Dashboard Backend APIs - Documentation

## New Features Added

### 1. **Intervention Logs API**
Tracks all stress management interventions with effectiveness ratings and user feedback.

### 2. **Gemini AI Recommendations**
Personalized stress management recommendations based on user history and patterns.

### 3. **Session PDF Export**
Generate professional PDF reports of intervention sessions.

---

## Setup Instructions

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key
4. Update `.env` file in backend:
   ```
   GEMINI_API_KEY="your_api_key_here"
   ```

### 2. Install Dependencies

```bash
cd backend
npm install pdfkit @google/generative-ai
```

### 3. Required Environment Variables

```env
PORT=5000
MONGO_URI="your_mongodb_uri"
FIREBASE_DATABASE_URL="your_firebase_url"
FIREBASE_PATH=data
GEMINI_API_KEY="your_gemini_api_key"
```

---

## API Endpoints

### Intervention Logs

#### Log an Intervention
```
POST /api/interventions/log
Content-Type: application/json

{
  "deviceId": "device-001",
  "stressIndex": 75,
  "activity": 0.15,
  "intervention": "Box breathing for 60 seconds",
  "category": "breathing",
  "sessionId": "session-123456",
  "metadata": {
    "heartRate": 92,
    "buildupDetected": true,
    "recoverySeconds": 45
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "intervention-id",
    "deviceId": "device-001",
    "stressIndex": 75,
    "intervention": "Box breathing for 60 seconds",
    "category": "breathing",
    "completed": false,
    "effectiveness": null,
    "createdAt": "2026-04-20T10:30:00.000Z"
  },
  "message": "Intervention logged successfully"
}
```

---

#### Get Interventions for Device
```
GET /api/interventions/:deviceId?limit=50&skip=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "id",
      "deviceId": "device-001",
      "intervention": "Box breathing",
      "category": "breathing",
      "effectiveness": 85,
      "completed": true,
      "userFeedback": "Felt much better",
      "createdAt": "2026-04-20T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "skip": 0
  }
}
```

---

#### Get Session Interventions
```
GET /api/interventions/session/:sessionId
```

---

#### Update Intervention Feedback
```
PUT /api/interventions/:interventionId/feedback
Content-Type: application/json

{
  "effectiveness": 85,
  "userFeedback": "Very helpful, stress reduced significantly",
  "completed": true
}
```

---

#### Get Intervention Statistics
```
GET /api/interventions/:deviceId/stats?days=7
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "completed": 35,
    "byCategory": {
      "breathing": 15,
      "movement": 12,
      "hydration": 10,
      "recovery": 5
    },
    "avgEffectiveness": 78,
    "topIntervention": "Box breathing for 60 seconds"
  },
  "period": "Last 7 days"
}
```

---

### Gemini AI Recommendations

#### Get Personalized Recommendations
```
GET /api/interventions/recommendations/:deviceId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "title": "Progressive Muscle Relaxation",
        "description": "A 10-minute guided PMR session tailored to your stress patterns",
        "category": "recovery",
        "duration": 10,
        "rationale": "Your data shows sustained high stress levels; PMR has been 89% effective for similar patterns"
      },
      {
        "title": "Morning Walk Routine",
        "description": "Start each morning with a 20-minute walk to establish baseline stress reduction",
        "category": "movement",
        "duration": 20,
        "rationale": "Movement interventions show 76% effectiveness in your history"
      }
    ],
    "summary": "Based on your 42 interventions over 7 days, breathing exercises work best for you..."
  },
  "message": "Personalized recommendations generated successfully"
}
```

---

### PDF Export

#### Export Session as PDF
```
GET /api/interventions/export/:sessionId/pdf?deviceId=device-001
```

**Response:** Binary PDF file

**Usage in Frontend:**
```javascript
const exportPDF = async () => {
  const response = await axios.get(
    `/api/interventions/export/${sessionId}/pdf?deviceId=${deviceId}`,
    { responseType: 'blob' }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `session-${sessionId}.pdf`);
  document.body.appendChild(link);
  link.click();
};
```

---

## Database Schema

### InterventionLog Schema
```javascript
{
  deviceId: String (indexed),
  stressIndex: Number (0-100),
  activity: Number (0-1),
  intervention: String,
  category: String (breathing|movement|hydration|recovery|maintenance),
  duration: Number (seconds),
  effectiveness: Number (0-100, nullable),
  userFeedback: String,
  completed: Boolean,
  sessionId: String (indexed),
  notes: String,
  metadata: {
    heartRate: Number,
    buildupDetected: Boolean,
    recoverySeconds: Number
  },
  createdAt: Date (indexed),
  updatedAt: Date
}
```

---

## Frontend Components

### InterventionLogs Component
Display intervention history, statistics, and collect user feedback.

**Props:**
- `sessionId` (string): Current session ID
- `deviceId` (string): Device ID

**Features:**
- View recent interventions
- Rate intervention effectiveness
- Get AI recommendations
- Export PDF reports
- Auto-refresh data

**Usage:**
```jsx
import InterventionLogs from '@/components/InterventionLogs';

<InterventionLogs 
  sessionId="session-123456" 
  deviceId="device-001" 
/>
```

---

## Best Practices

### Logging Interventions
1. Log immediately when intervention is suggested
2. Include all metadata for better AI recommendations
3. Update feedback once user rates the intervention
4. Set `completed: true` only when user confirms completion

### Generating Recommendations
1. Call after 5+ interventions for better accuracy
2. Cache recommendations for 1 hour to reduce API calls
3. Handle API errors gracefully with fallback recommendations
4. User consent required before using Gemini

### PDF Export
1. Export after session completion
2. Include feedback and effectiveness ratings
3. Archive PDFs for compliance/records
4. Generate periodically (daily/weekly summaries)

---

## Error Handling

### Gemini API Errors
```javascript
try {
  const response = await axios.get('/api/interventions/recommendations/:deviceId');
} catch (error) {
  console.error('Failed to get recommendations:', error.message);
  // Fallback to default recommendations
  showDefaultTips();
}
```

### PDF Export Errors
- Check device ID and session ID
- Ensure intervention data exists
- Verify pdfkit is installed
- Check file system permissions

---

## Performance Optimization

### Indexes
- `deviceId + createdAt` for device history queries
- `sessionId` for session queries
- `category` for category-based analytics

### Caching Strategy
- Cache AI recommendations for 1 hour
- Cache user stats for 5 minutes
- Use pagination (limit: 50) for large datasets

### Batch Operations
- Log multiple interventions in one request
- Update stats once per session end
- Generate PDF only on user request

---

## Security Considerations

1. **API Key Protection**
   - Never expose Gemini API key in frontend
   - Use environment variables only
   - Rotate keys periodically

2. **Data Privacy**
   - Sanitize user feedback
   - Encrypt sensitive health data
   - Comply with HIPAA/GDPR if applicable

3. **Rate Limiting**
   - Limit API calls to Gemini (free tier: 60/min)
   - Implement backoff strategy
   - Cache responses

---

## Troubleshooting

### Gemini API Not Working
```
❌ Error: GEMINI_API_KEY is undefined
✅ Solution: Add GEMINI_API_KEY to .env file

❌ Error: API Rate Limit Exceeded
✅ Solution: Implement caching and backoff strategy

❌ Error: Invalid JSON response
✅ Solution: Check Gemini model name (should be 'gemini-pro')
```

### PDF Export Issues
```
❌ Error: Module 'pdfkit' not found
✅ Solution: npm install pdfkit

❌ Error: File system permission denied
✅ Solution: Check server file permissions
```

---

## Testing

### Test Logging Intervention
```bash
curl -X POST http://localhost:5000/api/interventions/log \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "stressIndex": 75,
    "activity": 0.2,
    "intervention": "Test intervention",
    "category": "breathing",
    "sessionId": "test-session"
  }'
```

### Test Get Recommendations
```bash
curl http://localhost:5000/api/interventions/recommendations/test-device
```

### Test PDF Export
```bash
curl http://localhost:5000/api/interventions/export/test-session/pdf?deviceId=test-device \
  --output test-session.pdf
```

---

## Future Enhancements

1. **Advanced Analytics**
   - Weekly/monthly reports
   - Trend analysis
   - Stress pattern detection

2. **Social Features**
   - Share recommendations with friends
   - Group challenges
   - Leaderboards

3. **Integration**
   - Wearable device sync
   - Calendar integration
   - Email notifications

4. **ML Improvements**
   - Custom intervention recommendations
   - Predictive stress modeling
   - Personalized algorithms

---

## Support

For issues or questions:
1. Check error logs: `logs/` directory
2. Verify API key configuration
3. Check MongoDB connection
4. Review browser console for frontend errors
5. Test API endpoints with Postman/cURL

---

**Version:** 1.0.0  
**Last Updated:** April 20, 2026
