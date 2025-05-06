import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface AIBadgeProps {
  isActive: boolean;
  size?: 'small' | 'medium';
}

/**
 * A component that displays a badge indicating whether Gemini AI is being used
 */
const AIBadge: React.FC<AIBadgeProps> = ({ isActive, size = 'medium' }) => {
  if (!isActive) {
    return (
      <Tooltip title="Gemini AI is not configured. Using simulation mode.">
        <Chip
          icon={<SmartToyIcon />}
          label="AI Simulation"
          variant="outlined"
          color="default"
          size={size}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="This timetable was optimized using Google's Gemini AI">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          icon={<SmartToyIcon />}
          label="Gemini AI"
          variant="filled"
          color="secondary"
          size={size}
          sx={{
            background: 'linear-gradient(90deg, #8e44ad 0%, #3498db 100%)',
            color: 'white',
            fontWeight: 'bold',
          }}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            ml: 1, 
            display: { xs: 'none', sm: 'block' } 
          }}
        >
          Powered by Google AI
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default AIBadge; 