# Academic Scheduler - Backend

This is the backend server for the Academic Scheduler system, providing API endpoints for managing academic schedules, users, groups, subjects, venues, and timetable generation.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
# Server Configuration
BACKEND_PORT=5001
FRONTEND_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/academic-scheduler

# JWT Secret Keys
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

4. Seed initial data (if needed):
```bash
npm run seed
```

## Gemini AI Integration

The system uses Google's Gemini AI for optimizing timetables. To set this up:

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Navigate to the API Keys section
4. Create a new API key
5. Add this key to your `.env` file: `GEMINI_API_KEY=your_key_here`

### How Gemini AI is Used

1. The system first generates a timetable using constraint-based algorithms
2. This timetable is sent to Gemini AI for optimization
3. Gemini analyzes constraints and suggests improvements
4. The system presents both versions to the user
5. Users can select their preferred version

### Gemini Configuration

The Gemini API integration is configured in these files:

- `src/controller/gemini.helper.js`: Core functions for Gemini API
- `src/controller/timetable.controller.js`: Integration with timetable generation
- `src/config/gemini.config.md`: Detailed documentation

If the Gemini API key is not configured, the system will operate in simulation mode.

## API Endpoints

### Timetable Endpoints

- `GET /api/timetable`: Get all timetables
- `GET /api/timetable/group/:groupId`: Get timetable for a specific group
- `POST /api/timetable/generate/constraint`: Generate constraint-based timetable
- `POST /api/timetable/generate/ai`: Generate AI-optimized timetable
- `POST /api/timetable/finalize`: Finalize a timetable

## Environment Variables

| Variable | Description | Required |
|----------|-------------|:--------:|
| BACKEND_PORT | Port for backend server | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| ACCESS_TOKEN_SECRET | Secret for JWT access tokens | Yes |
| REFRESH_TOKEN_SECRET | Secret for JWT refresh tokens | Yes |
| GEMINI_API_KEY | Google Gemini AI API key | No* |

*If not provided, AI timetable generation will run in simulation mode. 