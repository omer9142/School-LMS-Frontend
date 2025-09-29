import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentTimetable } from '../../redux/studentRelated/studentHandle';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  Avatar,
} from '@mui/material';
import { Schedule, Class, Person } from '@mui/icons-material';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
  "Period 1",
  "Period 2", 
  "Period 3",
  "Period 4",
  "Period 5",
  "Period 6",
  "Period 7",
  "Period 8",
];

const dayColors = {
  Monday: '#1976d2',
  Tuesday: '#388e3c',
  Wednesday: '#f57c00',
  Thursday: '#7b1fa2',
  Friday: '#d32f2f',
};

const StudentTimeTable = () => {
  const dispatch = useDispatch();
  const { loading, error, timetable } = useSelector((state) => state.student);
  const { currentUser } = useSelector((state) => state.user);
  const studentId = currentUser?._id;

  useEffect(() => {
    console.log("StudentTimeTable mounted, studentId:", studentId);
    console.log("Current timetable data:", timetable);
    if (studentId) {
      dispatch(getStudentTimetable(studentId));
    }
  }, [dispatch, studentId]);

  const getCellData = (day, periodIndex) => {
    const entry = timetable?.find(
      (t) => t.day === day && t.periodNumber === periodIndex + 1
    );
    
    if (!entry) return null;
    return entry.subjectName || "Unknown Subject";
  };

  const getCurrentDay = () => {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[today.getDay()];
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 8 && hour < 9) return 1;
    if (hour >= 9 && hour < 10) return 2;
    if (hour >= 10 && hour < 11) return 3;
    if (hour >= 11 && hour < 12) return 4;
    if (hour >= 13 && hour < 14) return 5;
    if (hour >= 14 && hour < 15) return 6;
    if (hour >= 15 && hour < 16) return 7;
    if (hour >= 16 && hour < 17) return 8;
    return null;
  };

  const isCurrentSlot = (day, periodIndex) => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    return day === currentDay && (periodIndex + 1) === currentPeriod;
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white' }}>
          Loading your timetable...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Card sx={{ backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="error" variant="h6">
              Oops! Something went wrong
            </Typography>
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <Schedule sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                My Class Timetable
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                Welcome back, {currentUser?.name || 'Student'}! Here's your weekly schedule.
              </Typography>
            </Box>
          </Box>
          
          {getCurrentDay() !== 'Saturday' && getCurrentDay() !== 'Sunday' && (
            <Chip 
              label={`Today is ${getCurrentDay()}`}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </CardContent>
      </Card>

      {(!timetable || timetable.length === 0) ? (
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Class sx={{ fontSize: 80, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            No Timetable Available
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Your class timetable hasn't been created yet. Please contact your administrator.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table sx={{ '& .MuiTableCell-root': { borderColor: '#e0e0e0' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        py: 2,
                        borderRight: '2px solid #e0e0e0'
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person sx={{ color: '#666' }} />
                        Day
                      </Box>
                    </TableCell>
                    {periods.map((period, index) => (
                      <TableCell 
                        key={index} 
                        align="center"
                        sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.95rem',
                          py: 2,
                          minWidth: 120
                        }}
                      >
                        {period}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {days.map((day, rowIndex) => (
                    <TableRow 
                      key={rowIndex}
                      sx={{ 
                        '&:hover': { bgcolor: '#f8f9fa' },
                        bgcolor: getCurrentDay() === day ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          py: 2.5,
                          borderRight: '2px solid #e0e0e0',
                          bgcolor: dayColors[day],
                          color: 'white',
                          position: 'relative'
                        }}
                      >
                        {day}
                        {getCurrentDay() === day && (
                          <Chip 
                            label="Today"
                            size="small"
                            sx={{ 
                              position: 'absolute',
                              bottom: 4,
                              right: 8,
                              bgcolor: 'rgba(255,255,255,0.3)',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </TableCell>
                      {periods.map((_, colIndex) => {
                        const subject = getCellData(day, colIndex);
                        const isCurrent = isCurrentSlot(day, colIndex);
                        
                        return (
                          <TableCell 
                            key={colIndex} 
                            align="center"
                            sx={{ 
                              py: 2.5,
                              position: 'relative',
                              bgcolor: isCurrent ? '#e3f2fd' : 'inherit',
                              border: isCurrent ? '2px solid #1976d2' : 'inherit'
                            }}
                          >
                            {subject ? (
                              <Box>
                                <Chip
                                  label={subject}
                                  sx={{
                                    bgcolor: subject === 'Unknown Subject' ? '#ffebee' : '#e8f5e8',
                                    color: subject === 'Unknown Subject' ? '#d32f2f' : '#2e7d2e',
                                    fontWeight: 'medium',
                                    minWidth: 80,
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      transition: 'transform 0.2s'
                                    }
                                  }}
                                />
                                {isCurrent && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      display: 'block', 
                                      mt: 0.5, 
                                      color: '#1976d2',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    Current
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#bdbdbd',
                                  fontStyle: 'italic'
                                }}
                              >
                                Free Period
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Footer Info */}
      <Card sx={{ mt: 3, bgcolor: '#f8f9fa' }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="body2" color="textSecondary" align="center">
            Timetable updates automatically. Contact your class teacher for any schedule changes.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentTimeTable;