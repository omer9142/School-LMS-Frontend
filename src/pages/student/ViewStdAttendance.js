// src/pages/student/ViewStdAttendance.jsx
import React, { useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Container,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { getStudentAttendance } from "../../redux/studentRelated/studentHandle";
import { 
  CheckCircle as PresentIcon, 
  Cancel as AbsentIcon,
  CalendarToday as CalendarIcon
} from "@mui/icons-material";

const ViewStdAttendance = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const { attendance = [], status } = useSelector((state) => state.student);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getStudentAttendance(currentUser._id));
    }
  }, [dispatch, currentUser]);

  const attendanceStats = useMemo(() => {
    const presentDays = attendance.filter((d) => d.status === "Present").length;
    const totalDays = attendance.length;
    const percentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
    
    return {
      present: presentDays,
      total: totalDays,
      percentage
    };
  }, [attendance]);

  if (status === "loading") {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ 
            fontWeight: "bold", 
            mb: 4,
            color: "black",
            textShadow: "0px 2px 3px rgba(0,0,0,0.1)"
          }}
        >
          <CalendarIcon sx={{ mr: 1, verticalAlign: "bottom" }} />
          Attendance Record
        </Typography>

        {/* Stats Summary Card */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
              Overall Attendance Summary
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  {attendanceStats.percentage}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {attendanceStats.present} of {attendanceStats.total} days
                </Typography>
              </Box>
              
              <Box width="60%" sx={{ maxWidth: 300 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={attendanceStats.percentage} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                      backgroundColor: "#4caf50"
                    }
                  }} 
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Paper
          elevation={2}
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
            background: "white"
          }}
        >
          {attendance.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#555" }}>
                Daily Attendance Details
              </Typography>
              
              <Table sx={{ minWidth: 300 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((record, idx) => {
                    const date = new Date(record.date);
                    const isPresent = record.status === "Present";
                    
                    return (
                      <TableRow 
                        key={idx}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                          '&:hover': { backgroundColor: '#f0f0f0' }
                        }}
                      >
                        <TableCell>
                          {date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </TableCell>
                        <TableCell>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={isPresent ? <PresentIcon /> : <AbsentIcon />}
                            label={record.status}
                            sx={{
                              backgroundColor: isPresent 
                                ? "rgba(76, 175, 80, 0.15)" 
                                : "rgba(244, 67, 54, 0.15)",
                              color: isPresent ? "#2e7d32" : "#d32f2f",
                              fontWeight: "bold",
                              border: isPresent 
                                ? "1px solid #4caf50" 
                                : "1px solid #f44336",
                              borderRadius: 1
                            }}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No attendance records found.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Attendance data will appear here once available.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ViewStdAttendance;