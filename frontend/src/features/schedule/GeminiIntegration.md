# Gemini AI Integration for Timetable Generation

This document provides information for frontend developers about the Gemini AI integration in the Academic Scheduler system.

## Overview

The Academic Scheduler uses a hybrid approach for timetable generation:

1. **Constraint-based Generation**: The initial timetable is created using traditional algorithms that respect all hard constraints (no conflicts, appropriate venues, etc.)

2. **AI Optimization**: The timetable is then sent to Google's Gemini AI to further optimize it for better overall scheduling.

3. **User Selection**: The system presents both versions to allow users to select their preferred timetable.

## User Interface Features

The Schedule component has been enhanced with several features to support Gemini AI integration:

- **AI Optimization Button**: The "Optimize with AI" button sends the constraint-based timetable to the backend for Gemini processing.
- **AI Status Indicator**: The UI indicates whether Gemini is being used or if the system is running in simulation mode.
- **Comparison View**: Users can easily switch between the constraint-based and AI-optimized timetables using tabs.
- **Finalization Option**: Users can choose which version to finalize as the active timetable.

## Implementation Details

### Detection of Gemini Usage

The frontend detects if Gemini is being used based on the response from the backend:

```typescript
// From Schedule.tsx
const usingGemini = !timetable.generatedBy.includes('system');
setIsUsingGemini(usingGemini);
```

### Conditional UI Elements

The UI adapts based on whether Gemini is configured:

```tsx
{isUsingGemini === false && (
  <Alert severity="info" sx={{ mb: 2 }}>
    This is a simulated AI timetable. For true AI optimization, 
    please configure the Gemini API key in the backend .env file.
  </Alert>
)}
```

### Error Handling

The frontend handles cases where the Gemini API fails or is not configured:

- If Gemini is not configured, the UI shows a simulation message
- If Gemini API calls fail, the system falls back to the constraint-based timetable

## Testing Gemini Integration

To test the Gemini integration from the frontend:

1. Ensure the backend has the `GEMINI_API_KEY` properly configured in the `.env` file
2. Navigate to the `/schedule` route in the application
3. Select a student group and generate a constraint-based timetable
4. Click "Optimize with AI" to trigger the Gemini integration
5. Verify that the "Gemini AI-Optimized Timetable" appears (not the simulation message)

If the Gemini integration is working correctly, you should see different timetable arrangements in the AI-optimized tab compared to the constraint-based tab.

## Future Enhancements

Future versions of the UI may include:

- Visualizations showing the improvements made by Gemini AI
- Customization options for the AI prompt
- Progress indicators for the optimization process
- Export options for comparing different timetable versions 