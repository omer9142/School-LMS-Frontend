import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeacherTimetable } from "../../redux/timetableRelated/timetableHandle";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Avatar,
  Grid
} from '@mui/material';
import {
  Schedule,
  Class,
  Person,
  AccessTime,
  EventAvailable,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';

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
  Saturday: '#ed6c02',
};

const TeacherTimetable = () => {
  const dispatch = useDispatch();
  const { timetable, loading, error } = useSelector((state) => state.timetable);
  const { currentUser } = useSelector((state) => state.user);
  const teacherId = currentUser?._id;

  useEffect(() => {
    if (teacherId) {
      dispatch(getTeacherTimetable(teacherId));
    }
  }, [dispatch, teacherId]);

  // Create timetable grid
  const createTimetableGrid = () => {
    const grid = {};

    days.forEach(day => {
      grid[day] = {};
      periods.forEach((_, index) => {
        grid[day][index + 1] = { free: true };
      });
    });

    timetable.forEach(slot => {
      if (grid[slot.day] && grid[slot.day][slot.periodNumber]) {
        grid[slot.day][slot.periodNumber] = {
          free: false,
          subject: slot.subjectName,
          className: slot.classId?.sclassName || "N/A",
          period: slot.periodNumber
        };
      }
    });

    return grid;
  };

  const timetableGrid = createTimetableGrid();
  const totalSlots = days.length * periods.length;
  const teachingSlots = timetable.length;
  const freeSlots = totalSlots - teachingSlots;
  const teachingDays = new Set(timetable.map(slot => slot.day)).size;

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

  const getCellData = (day, periodIndex) => {
    const periodNumber = periodIndex + 1;
    const slot = timetableGrid[day] && timetableGrid[day][periodNumber];
    
    if (!slot || slot.free) return null;
    return {
      subject: slot.subject,
      className: slot.className
    };
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        background= "black"
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
      <Card sx={{ mb: 4, background: 'black' , color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <Schedule sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Teaching Schedule
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                Weekly timetable for {currentUser?.name}
              </Typography>
            </Box>
          </Box>
          
          {getCurrentDay() !== 'Sunday' && (
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#e3f2fd', mr: 2 }}>
              <AccessTime sx={{ color: '#1976d2' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {teachingSlots}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Teaching Hours
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#e8f5e8', mr: 2 }}>
              <EventAvailable sx={{ color: '#388e3c' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="#388e3c">
                {freeSlots}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Free Periods
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#f3e5f5', mr: 2 }}>
              <CalendarToday sx={{ color: '#7b1fa2' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="#7b1fa2">
                {teachingDays}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Teaching Days
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#fff3e0', mr: 2 }}>
              <TrendingUp sx={{ color: '#f57c00' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="#f57c00">
                {days.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Days
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {(!timetable || timetable.length === 0) ? (
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Class sx={{ fontSize: 80, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            No Timetable Assigned
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Your teaching schedule will appear here once assigned.
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
                        Period / Day
                      </Box>
                    </TableCell>
                    {days.map((day, index) => (
                      <TableCell 
                        key={index} 
                        align="center"
                        sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.95rem',
                          py: 2,
                          minWidth: 140
                        }}
                      >
                        {day}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {periods.map((period, periodIndex) => (
                    <TableRow 
                      key={periodIndex}
                      sx={{ 
                        '&:hover': { bgcolor: '#f8f9fa' }
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          py: 2.5,
                          borderRight: '2px solid #e0e0e0',
                          bgcolor: '#f5f5f5'
                        }}
                      >
                        {period}
                      </TableCell>
                      {days.map((day, dayIndex) => {
                        const cellData = getCellData(day, periodIndex);
                        const isCurrent = isCurrentSlot(day, periodIndex);
                        
                        return (
                          <TableCell 
                            key={dayIndex} 
                            align="center"
                            sx={{ 
                              py: 2.5,
                              position: 'relative',
                              bgcolor: isCurrent ? '#e3f2fd' : 'inherit',
                              border: isCurrent ? '2px solid #1976d2' : 'inherit'
                            }}
                          >
                            {cellData ? (
                              <Box>
                                <Chip
                                  label={cellData.subject}
                                  sx={{
                                    bgcolor: '#e8f5e8',
                                    color: '#2e7d32',
                                    fontWeight: 'medium',
                                    mb: 0.5,
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      transition: 'transform 0.2s'
                                    }
                                  }}
                                />
                                <Typography variant="caption" display="block" color="textSecondary">
                                  {cellData.className}
                                </Typography>
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
            Timetable updates automatically. Contact administration for any schedule changes.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherTimetable;