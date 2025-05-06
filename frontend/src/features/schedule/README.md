# Academic Scheduler - Timetable Generation Module

This module provides a sophisticated timetable generation system that combines traditional constraint-based scheduling with Google's Gemini AI for optimization.

## Features

- **Constraint-based Timetable Generation**: Creates conflict-free schedules respecting venue, lecturer, and student group availability
- **AI-powered Optimization**: Uses Google's Gemini AI to further optimize timetables for better overall scheduling
- **Interactive Comparison**: Allows users to compare different timetable versions side by side
- **Finalization Workflow**: Simple process to select and activate the preferred timetable

## Components

- **Schedule.tsx**: Main component for timetable generation and management
- **TimetableView.tsx**: Component for displaying timetables in a grid format
- **GeminiIntegration.md**: Documentation for frontend Gemini integration
- **Backend Integration**: Works with `/api/timetable` endpoints for all operations

## Using the Timetable Generator

1. Navigate to the `/schedule` route
2. Select a student group from the dropdown
3. Click "Generate Constraint-Based Timetable" to create the initial timetable
4. Click "Optimize with AI" to enhance the timetable with Gemini AI
5. Compare both versions using the tabs
6. Click "Finalize This Version" on your preferred timetable

## Gemini AI Integration

This module integrates with Google's Gemini AI, requiring:

- A valid Gemini API key in the backend `.env` file
- Internet connectivity for API calls
- Proper configuration as described in `/backend/src/config/gemini.config.md`

If the Gemini API key is not configured, the system will operate in simulation mode, showing this in the UI.

## Data Flow

1. **Constraint Generation**: Backend creates initial timetable using algorithms
2. **AI Enhancement**: Timetable sent to Gemini with all relevant context
3. **Optimization**: Gemini analyzes and returns an improved schedule
4. **Presentation**: Both versions displayed for comparison
5. **Selection**: User selects preferred version
6. **Finalization**: Selected timetable becomes the active one

## Customization

The system can be customized by:

- Modifying the prompt in `gemini.helper.js` to change optimization priorities
- Adjusting time slots in the backend configuration
- Changing the UI layout and styling in Schedule.tsx

For more details on Gemini integration, see `GeminiIntegration.md` in this directory. 