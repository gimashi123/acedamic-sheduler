import React, { useState, useEffect } from 'react';
import { getAnalyticsData } from './analyticsService';
import { Box, Grid, Paper, Typography, CircularProgress, Card, CardContent, Tabs, Tab } from '@mui/material';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Pie, PieChart, Cell, BarChart, Bar, LineChart, Line } from 'recharts';
import { 
  BarChartOutlined, 
  PieChartOutlined, 
  ScatterPlot as ScatterPlotIcon, 
  BubbleChart, 
  GroupWork, 
  School, 
  MenuBook,
  People 
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = ['#4f46e5', '#0ea5e9', '#ec4899', '#8b5cf6', '#f97316', '#10b981'];

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const analyticsData = await getAnalyticsData();
        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            backgroundColor: 'var(--color-bg-primary)',
            borderLeft: '4px solid',
            borderColor: 'error.main'
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Analytics
          </Typography>
          <Typography>
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare data for scatter plot of group sizes
  const scatterData = data.groupSizes.map((item: any) => ({
    x: item.size,
    y: Math.random() * 100, // Random value for y-axis to spread points
    z: item.size,
    name: item.groupName,
    faculty: item.faculty,
  }));

  // Prepare data for pie chart of groups by faculty
  const pieData = Object.entries(data.groupsByFaculty).map(([faculty, count]: [string, any]) => ({
    name: faculty,
    value: count,
  }));

  // Prepare data for lecturer load bar chart
  const lecturerData = data.lectureLoads
    .sort((a: any, b: any) => b.subjectCount - a.subjectCount)
    .slice(0, 8); // Take top 8 for readability

  // Prepare data for faculty distribution
  const facultyData = data.facultyDistribution;

  return (
    <Box p={3}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          color: 'var(--color-text-primary)',
          mb: 3
        }}
      >
        Academic Analytics Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              backgroundColor: 'var(--color-bg-primary)',
              borderTop: '4px solid',
              borderColor: COLORS[0],
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <People sx={{ color: COLORS[0], mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Students
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {data.totalStudents}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average {data.averageStudentsPerGroup.toFixed(1)} per group
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              backgroundColor: 'var(--color-bg-primary)',
              borderTop: '4px solid',
              borderColor: COLORS[1],
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <School sx={{ color: COLORS[1], mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Lecturers
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {data.totalLecturers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Teaching {data.subjectsWithLecturers} subjects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              backgroundColor: 'var(--color-bg-primary)',
              borderTop: '4px solid',
              borderColor: COLORS[2],
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <MenuBook sx={{ color: COLORS[2], mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Subjects
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {data.totalSubjects}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {data.subjectsWithoutLecturers} unassigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              backgroundColor: 'var(--color-bg-primary)',
              borderTop: '4px solid',
              borderColor: COLORS[3],
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <GroupWork sx={{ color: COLORS[3], mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Groups
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {data.totalGroups}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Across {Object.keys(data.groupsByFaculty).length} faculties
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different chart views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<ScatterPlotIcon />} label="Allocation" />
          <Tab icon={<PieChartOutlined />} label="Distribution" />
          <Tab icon={<BarChartOutlined />} label="Workload" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Grid container spacing={3}>
        {tabValue === 0 && (
          <>
            {/* Scatter Plot */}
            <Grid item xs={12} lg={8}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: 500,
                  backgroundColor: 'var(--color-bg-primary)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Group Size Distribution
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Scatter plot showing the size distribution of student groups
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Size" 
                      label={{ value: "Group Size", position: "insideBottom", offset: -5 }}
                      stroke={isDark ? '#f3f4f6' : undefined}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Distribution" 
                      stroke={isDark ? '#f3f4f6' : undefined}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={(props) => {
                        if (!props.active || !props.payload?.length) return null;
                        const data = props.payload[0].payload;
                        return (
                          <Box 
                            sx={{ 
                              backgroundColor: 'var(--color-bg-primary)',
                              border: '1px solid var(--color-border)',
                              p: 1,
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="body2">{data.name}</Typography>
                            <Typography variant="body2">{`Faculty: ${data.faculty}`}</Typography>
                            <Typography variant="body2">{`Size: ${data.x} students`}</Typography>
                          </Box>
                        );
                      }}
                    />
                    <Scatter name="Groups" data={scatterData} fill={COLORS[0]}>
                      {scatterData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Pie Chart for Groups by Type */}
            <Grid item xs={12} md={6} lg={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: 500,
                  backgroundColor: 'var(--color-bg-primary)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Groups by Type
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Distribution of weekday vs weekend groups
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Weekday', value: data.groupsByType.weekday },
                        { name: 'Weekend', value: data.groupsByType.weekend }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} groups`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </>
        )}

        {tabValue === 1 && (
          <>
            {/* Pie Chart for Faculty Distribution */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: 500,
                  backgroundColor: 'var(--color-bg-primary)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Groups by Faculty
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Distribution of groups across different faculties
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} groups`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Faculty Distribution */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: 500,
                  backgroundColor: 'var(--color-bg-primary)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Faculty Distribution
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Distribution of students, groups and subjects by faculty
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={facultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="faculty" 
                      stroke={isDark ? '#f3f4f6' : undefined}
                    />
                    <YAxis stroke={isDark ? '#f3f4f6' : undefined} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="students" name="Students" fill={COLORS[0]} />
                    <Bar dataKey="groups" name="Groups" fill={COLORS[1]} />
                    <Bar dataKey="subjects" name="Subjects" fill={COLORS[2]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </>
        )}

        {tabValue === 2 && (
          <>
            {/* Lecturer Workload */}
            <Grid item xs={12}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: 500,
                  backgroundColor: 'var(--color-bg-primary)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Lecturer Workload
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Number of subjects and total credits assigned to each lecturer
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart
                    data={lecturerData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      stroke={isDark ? '#f3f4f6' : undefined}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="lecturerName" 
                      stroke={isDark ? '#f3f4f6' : undefined}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="subjectCount" name="Number of Subjects" fill={COLORS[0]} />
                    <Bar dataKey="credits" name="Total Credits" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Analytics; 