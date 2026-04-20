# Quick Start Guide - Intervention Dashboard Features

## What's New? ✨

### ✅ Backend API for Intervention Logs
- Log every stress intervention with metadata
- Track effectiveness ratings and user feedback
- Query intervention history and statistics

### ✅ Gemini AI Personalized Recommendations
- Generate AI-powered wellness recommendations
- Adapt suggestions based on user history
- Provide rationale for each recommendation

### ✅ Export Session PDF Reports
- Generate professional PDF session reports
- Include intervention logs and statistics
- Download for archival or sharing

---

## Setup (5 minutes)

### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key" button
3. Copy the key

### Step 2: Update .env
Open `backend/.env` and replace:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### Step 3: Install Dependencies
Already done! ✓ (pdfkit and @google/generative-ai are installed)

### Step 4: Start Backend
```bash
cd backend
npm run dev
```

---

## Using the Features

### 📝 Log an Intervention

In the Intervention Dashboard, click **"Log This Intervention"** button:

```javascript
// Automatically logs:
{
  deviceId: "device-001",
  stressIndex: 75,
  activity: 0.15,
  intervention: "Box breathing for 60 seconds",
  category: "breathing",
  sessionId: "session-123456"
}
```

### 🧠 Get AI Recommendations

Click **"Get AI Recommendations"** in the Intervention Logs panel:

```
AI will analyze:
✓ Your stress patterns
✓ Intervention history
✓ Effectiveness rates
✓ Activity levels

Then provide personalized recommendations!
```

### 📊 Export Session Report

Click **"Export PDF"** to download session report:

```
PDF includes:
✓ Session summary (total interventions, avg stress)
✓ All logged interventions with timestamps
✓ Category breakdown
✓ Effectiveness statistics
```

---

## API Quick Reference

### Log Intervention
```bash
POST /api/interventions/log
{
  "deviceId": "device-001",
  "stressIndex": 75,
  "activity": 0.15,
  "intervention": "Your intervention text",
  "category": "breathing|movement|hydration|recovery|maintenance",
  "sessionId": "session-123456"
}
```

### Get Recommendations
```bash
GET /api/interventions/recommendations/device-001
```

### Export PDF
```bash
GET /api/interventions/export/session-123456/pdf?deviceId=device-001
```

### Get Statistics
```bash
GET /api/interventions/device-001/stats?days=7
```

---

## File Structure

### Backend Files Created/Modified:
```
backend/
├── controllers/
│   ├── interventionController.js (NEW)
│   └── sensorController.js
├── models/
│   ├── interventionLog.js (NEW)
│   └── stressPrediction.js
├── routes/
│   ├── interventionRoutes.js (NEW)
│   └── ...
├── server.js (UPDATED)
├── .env (UPDATED - add GEMINI_API_KEY)
└── INTERVENTION_API_DOCS.md (NEW)
```

### Frontend Files Created/Modified:
```
frontend/src/
├── pages/
│   └── InterventionDashboard.jsx (UPDATED)
├── components/
│   └── InterventionLogs.jsx (NEW)
└── App.jsx (UPDATED)
```

---

## Intervention Categories

- **🫁 Breathing**: Box breathing, deep breathing, breathwork
- **🚶 Movement**: Walk, stretch, exercise, yoga
- **💧 Hydration**: Water break, drink water, hydration
- **😴 Recovery**: Rest, meditation, nap, sleep
- **🧘 Maintenance**: Journaling, music, calm activity

---

## User Flow

1. **Dashboard** shows real-time stress
2. **System suggests intervention** based on stress level
3. **User clicks "Log This Intervention"** 
4. **Intervention is saved** to database
5. **User rates effectiveness** in Intervention Logs panel
6. **System learns** from feedback
7. **AI generates better recommendations** over time
8. **User exports PDF report** of session

---

## Example Scenario

**Time: 10:00 AM**
- Stress level: 78/100
- Activity: Low
- System: "Try box breathing for 60 seconds"

**User Action:**
1. Clicks "Log This Intervention"
2. Does box breathing exercise
3. Waits 5 minutes

**Time: 10:05 AM**
- Stress level: 62/100
- User rates intervention: 85% effective
- Feedback: "Much calmer now"

**Later:**
- User clicks "Get AI Recommendations"
- AI says: "Breathing exercises are 89% effective for you - do them 3x daily"
- User exports PDF report showing progress

---

## Troubleshooting

### "Recommendations not loading"
- ✓ Check GEMINI_API_KEY in .env
- ✓ Verify API key is valid
- ✓ Check browser console for errors
- ✓ Ensure backend is running

### "PDF download failed"
- ✓ Check sessionId exists
- ✓ Verify deviceId matches
- ✓ Check if interventions exist in session
- ✓ Verify file system permissions

### "No interventions showing"
- ✓ Click "Log This Intervention" button first
- ✓ Check sessionId and deviceId match
- ✓ Verify MongoDB connection
- ✓ Check if data exists in database

---

## Next Steps

### 1. Test the Features
- Go to Intervention Dashboard
- Click "View Logs"
- Click "Log This Intervention"
- Click "Get AI Recommendations"
- Click "Export PDF"

### 2. Configure Gemini
- Get API key from Google AI Studio
- Update .env with your key
- Test recommendations

### 3. Customize Categories
Edit `backend/models/interventionLog.js` to add more categories:
```javascript
category: {
  type: String,
  enum: ["breathing", "movement", "hydration", "recovery", "maintenance"],
  // Add more here
}
```

### 4. Monitor Effectiveness
- Collect user feedback regularly
- Analyze statistics in "Intervention Logs"
- Adjust recommendations based on data

---

## Dashboard Navigation

### In Sidebar:
- 📈 Live Dashboard - real-time stress data
- 📊 Analytics - historical trends
- **🧠 Intervention Dashboard** ← You are here!

### In Intervention Dashboard:
- View Logs button - toggle intervention panel
- Log This Intervention - save current recommendation
- Get AI Recommendations - generate personalized tips
- Export PDF - download session report

---

## Performance Tips

1. **Limit PDF exports** - only generate when needed
2. **Cache recommendations** - reuse for 1 hour
3. **Batch interventions** - log multiple at once
4. **Pagination** - only load 50 interventions at a time

---

## Security Reminders

⚠️ **Never share your GEMINI_API_KEY**
- Keep it in .env file only
- Add .env to .gitignore
- Rotate periodically
- Use environment variable in production

---

## API Rate Limits (Free Tier)

- Gemini API: 60 requests per minute
- Recommendation cache: 1 hour
- PDF exports: unlimited

---

## Need Help?

1. Check [INTERVENTION_API_DOCS.md](./INTERVENTION_API_DOCS.md) for detailed docs
2. Test endpoints with Postman/cURL
3. Check browser DevTools > Network tab
4. Review backend logs in terminal
5. Verify .env configuration

---

**You're all set!** 🚀

Start with the Intervention Dashboard and enjoy AI-powered stress management!

---

**Version:** 1.0.0  
**Last Updated:** April 20, 2026
