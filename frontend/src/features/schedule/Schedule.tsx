import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Container, Grid, CircularProgress, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Alert, Tabs, Tab, Divider, Tooltip, Link, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { timetableApi } from '../../utils/api';
import { Group, Timetable, TimeSlot } from '../../types';
import useAuthStore from '../../store/authStore';
import TimetableView from './TimetableView';
import AIBadge from './AIBadge';
import { groupApi } from '../../utils/api'; // Import the group API

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Schedule: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [constraintTimetable, setConstraintTimetable] = useState<Timetable | null>(null);
  const [aiTimetable, setAiTimetable] = useState<Timetable | null>(null);
  const [finalTimetable, setFinalTimetable] = useState<Timetable | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUsingGemini, setIsUsingGemini] = useState<boolean | null>(null);
  const [isMultiGroupMode, setIsMultiGroupMode] = useState<boolean>(false);

  // Fetch all groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedGroups = await groupApi.getAllGroups();
        setGroups(fetchedGroups);
      } catch (err: any) {
        const statusCode = err.response?.status;
        let errorMessage = 'Failed to fetch groups';
        
        if (statusCode === 404) {
          errorMessage = 'Group service not found. Please check API configuration.';
        } else if (statusCode === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (statusCode === 500) {
          errorMessage = 'Server error while fetching groups. Please try again later.';
        }
        
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  // Fetch timetable for selected group
  useEffect(() => {
    if (!isMultiGroupMode && selectedGroup) {
      fetchTimetable();
    }
  }, [selectedGroup, isMultiGroupMode]);

  const fetchTimetable = async () => {
    if (!selectedGroup) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to get an existing timetable for the group
      const timetable = await timetableApi.getTimetableByGroup(selectedGroup);
      
      if (timetable) {
        // If we have a timetable, check which version it is
        if (timetable.version === 'final') {
          setFinalTimetable(timetable);
          setActiveTab(2); // Set the tab to the final timetable
        } else if (timetable.version === 'constraint') {
          setConstraintTimetable(timetable);
          setActiveTab(0); // Set the tab to the constraint timetable
        } else if (timetable.version === 'ai') {
          setAiTimetable(timetable);
          setActiveTab(1); // Set the tab to the AI timetable
        }
      }
    } catch (err) {
      // If no timetable exists, we'll generate one when the user clicks the button
      console.log('No existing timetable found for this group');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGroupChange = (event: SelectChangeEvent<string>) => {
    setSelectedGroup(event.target.value);
    // Reset timetables
    setConstraintTimetable(null);
    setAiTimetable(null);
    setFinalTimetable(null);
  };

  const handleMultiGroupChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedGroups(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleGroupSelectionMode = () => {
    setIsMultiGroupMode(!isMultiGroupMode);
    // Clear selections when switching modes
    setSelectedGroup('');
    setSelectedGroups([]);
    // Reset timetables
    setConstraintTimetable(null);
    setAiTimetable(null);
    setFinalTimetable(null);
  };
  
  const generateConstraintBasedTimetable = async () => {
    if (isMultiGroupMode) {
      if (selectedGroups.length === 0) {
        setError('Please select at least one group');
        return;
      }
    } else if (!selectedGroup) {
      setError('Please select a group first');
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      // Handle single group selection
      if (!isMultiGroupMode) {
        const timetable = await timetableApi.generateConstraintTimetable(selectedGroup);
        setConstraintTimetable(timetable);
        setSuccess('Constraint-based timetable generated successfully');
        setActiveTab(0); // Switch to constraint tab
      } 
      // Handle multi-group selection
      else {
        const timetable = await timetableApi.generateMultiGroupTimetable(selectedGroups);
        setConstraintTimetable(timetable);
        setSuccess(`Constraint-based timetable generated successfully for ${selectedGroups.length} groups`);
        setActiveTab(0); // Switch to constraint tab
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate constraint-based timetable');
    } finally {
      setGenerating(false);
    }
  };
  
  const generateAITimetable = async () => {
    if (isMultiGroupMode) {
      if (selectedGroups.length === 0) {
        setError('Please select at least one group');
        return;
      }
    } else if (!selectedGroup) {
      setError('Please select a group first');
      return;
    }
    
    if (!constraintTimetable) {
      setError('Please generate a constraint-based timetable first');
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      let timetable;
      if (!isMultiGroupMode) {
        timetable = await timetableApi.generateAITimetable(selectedGroup);
      } else {
        // For multi-group mode, just use the first group for now
        // In the future, the backend could be updated to support AI optimization for multiple groups
        timetable = await timetableApi.generateAITimetable(selectedGroups[0]);
      }
      
      setAiTimetable(timetable);
      
      // Determine if Gemini was used based on the response message
      const usingGemini = !timetable.generatedBy.includes('system');
      setIsUsingGemini(usingGemini);
      
      setSuccess(usingGemini 
        ? `AI-optimized timetable generated successfully with Gemini AI${isMultiGroupMode ? ' for ' + selectedGroups.length + ' groups' : ''}` 
        : `Timetable simulated (Gemini API not configured)${isMultiGroupMode ? ' for ' + selectedGroups.length + ' groups' : ''}`);
      
      setActiveTab(1); // Switch to AI tab
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate AI timetable');
      setIsUsingGemini(false);
    } finally {
      setGenerating(false);
    }
  };
  
  const finalizeTimetable = async (timetableId: string) => {
    setGenerating(true);
    setError(null);
    
    try {
      const timetable = await timetableApi.finalizeTimetable(timetableId);
      setFinalTimetable(timetable);
      setSuccess('Timetable finalized successfully');
      setActiveTab(2); // Switch to final tab
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to finalize timetable');
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Academic Timetable Generator
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Generate and optimize timetables for student groups using constraint-based and AI approaches
        </Typography>
        
        <Box display="flex" alignItems="center" mb={2}>
          <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            This system uses a hybrid approach: first generating a timetable with constraints, then optimizing it with Gemini AI. 
            <Link href="https://ai.google.dev/" target="_blank" rel="noopener" sx={{ ml: 1 }}>
              Learn more about Gemini
            </Link>
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => {
                  setError(null);
                  const fetchGroups = async () => {
                    try {
                      setLoading(true);
                      const fetchedGroups = await groupApi.getAllGroups();
                      setGroups(fetchedGroups);
                      setError(null);
                    } catch (err: any) {
                      const statusCode = err.response?.status;
                      let errorMessage = 'Failed to fetch groups';
                      
                      if (statusCode === 404) {
                        errorMessage = 'Group service not found. Please check API configuration.';
                      } else if (statusCode === 401) {
                        errorMessage = 'Authentication required. Please log in again.';
                      } else if (statusCode === 500) {
                        errorMessage = 'Server error while fetching groups. Please try again later.';
                      }
                      
                      setError(errorMessage);
                      console.error(err);
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchGroups();
                }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Box display="flex" alignItems="center" mb={2}>
              <Button 
                variant={isMultiGroupMode ? "contained" : "outlined"}
                color="primary"
                onClick={toggleGroupSelectionMode}
                sx={{ mr: 2 }}
              >
                {isMultiGroupMode ? "Multi-Group Mode: ON" : "Multi-Group Mode: OFF"}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {isMultiGroupMode 
                  ? "Select multiple groups to create a combined timetable" 
                  : "Switch to multi-group mode to schedule multiple groups together"}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {!isMultiGroupMode ? (
              <FormControl fullWidth>
                <InputLabel id="group-select-label">Select Group</InputLabel>
                <Select
                  labelId="group-select-label"
                  value={selectedGroup}
                  label="Select Group"
                  onChange={handleGroupChange}
                  disabled={loading || generating}
                >
                  {groups.map((group) => (
                    <MenuItem key={group._id} value={group._id}>
                      {group.name} - {group.faculty} ({group.groupType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel id="multi-group-select-label">Select Multiple Groups</InputLabel>
                <Select
                  labelId="multi-group-select-label"
                  multiple
                  value={selectedGroups}
                  onChange={handleMultiGroupChange}
                  input={<OutlinedInput label="Select Multiple Groups" />}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return 'Select groups';
                    }
                    if (selected.length <= 2) {
                      return selected.map(id => {
                        const group = groups.find(g => g._id === id);
                        return group ? group.name : id;
                      }).join(', ');
                    }
                    return `${selected.length} groups selected`;
                  }}
                  MenuProps={MenuProps}
                  disabled={loading || generating}
                >
                  {groups.map((group) => (
                    <MenuItem key={group._id} value={group._id}>
                      <Checkbox checked={selectedGroups.indexOf(group._id) > -1} />
                      <ListItemText primary={`${group.name} - ${group.faculty} (${group.groupType})`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={generateConstraintBasedTimetable}
                disabled={(isMultiGroupMode ? selectedGroups.length === 0 : !selectedGroup) || loading || generating}
                startIcon={generating && activeTab === 0 ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Generate Constraint-Based Timetable
              </Button>
              
              <Tooltip title="Uses Gemini AI to optimize the timetable. Requires API key configuration on the backend.">
                <span>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={generateAITimetable}
                    disabled={!constraintTimetable || loading || generating}
                    startIcon={generating && activeTab === 1 ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    Optimize with AI
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {!loading && groups.length === 0 && !error && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, mt: 2 }}>
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Student Groups Available
            </Typography>
            <Typography variant="body1" paragraph>
              You need to create at least one student group before generating timetables.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              href="/groups"
            >
              Create Student Group
            </Button>
          </Box>
        </Paper>
      )}
      
      {((isMultiGroupMode && selectedGroups.length > 0) || (!isMultiGroupMode && selectedGroup)) && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Constraint-Based Timetable" disabled={!constraintTimetable} />
            <Tab label="AI-Optimized Timetable" disabled={!aiTimetable} />
            <Tab label="Final Timetable" disabled={!finalTimetable} />
          </Tabs>
          
          {activeTab === 0 && constraintTimetable && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Constraint-Based Timetable</Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => finalizeTimetable(constraintTimetable._id)}
                >
                  Finalize This Version
                </Button>
              </Box>
              <TimetableView timetable={constraintTimetable} />
            </>
          )}
          
          {activeTab === 1 && aiTimetable && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" mr={2}>
                    {isUsingGemini === true 
                      ? 'AI-Optimized Timetable' 
                      : 'AI Simulation'}
                  </Typography>
                  <AIBadge isActive={isUsingGemini === true} />
                </Box>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => finalizeTimetable(aiTimetable._id)}
                >
                  Finalize This Version
                </Button>
              </Box>
              {isUsingGemini === false && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This is a simulated AI timetable. For true AI optimization, please configure the Gemini API key in the backend .env file.
                </Alert>
              )}
              <TimetableView timetable={aiTimetable} />
            </>
          )}
          
          {activeTab === 2 && finalTimetable && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Final Timetable</Typography>
                <Typography variant="body2" color="textSecondary">
                  This is the active timetable for the selected group
                </Typography>
              </Box>
              <TimetableView timetable={finalTimetable} />
            </>
          )}
          
          {loading && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default Schedule; 