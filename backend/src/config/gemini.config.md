# Gemini AI Integration Guide

This document explains how to set up and use the Gemini AI API for timetable generation in the Academic Scheduler system.

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to the [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy your API key for use in the next step

### 2. Set Up Environment Variables

Create or edit your `.env` file in the root of your backend directory:

```
# Existing environment variables...

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with the API key you obtained from Google AI Studio.

### 3. Verify the Integration

The system is already configured to use the Gemini API when the `GEMINI_API_KEY` environment variable is present. You can verify this by:

1. Start your backend server: `npm run dev`
2. Go to the frontend's timetable generation page (/schedule)
3. Select a group and generate a constraint-based timetable
4. Click "Optimize with AI" - if the integration is working, you'll get an AI-optimized timetable

## How the Integration Works

The Academic Scheduler uses Gemini AI in the following way:

1. First, a constraint-based timetable is generated using traditional algorithms
2. This timetable is sent to Gemini AI along with all relevant data (groups, subjects, venues, etc.)
3. Gemini AI analyzes the constraints and optimizes the timetable
4. The system receives the optimized timetable and presents both versions to the user
5. The user can choose which version to finalize

## Troubleshooting

If you encounter issues with the Gemini AI integration:

1. **"Simulated AI timetable created" message**: This indicates that the system couldn't find your Gemini API key. Double-check your `.env` file.
2. **API errors**: If you see errors about rate limits or invalid requests, check your API key and make sure you're within the usage limits.
3. **Empty responses**: If Gemini returns empty responses, try simplifying the data being sent.

## API Usage Considerations

- The free tier of Gemini API has usage limits. Monitor your usage if you're generating many timetables.
- The system has a fallback mechanism that will use the constraint-based timetable if the Gemini API fails. 