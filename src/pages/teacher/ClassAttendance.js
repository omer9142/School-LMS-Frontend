import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
  Grid,
  Avatar,
  useTheme,
  alpha,
  Container,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Save,
  CalendarToday,
  Group,
  School,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import axios from "axios";

const ClassAttendance = () => {
  const dispatch = useDispatch();
  const { sclassStudents, loading } = useSelector((state) => state.sclass);
  const { currentUser, token } = useSelector((state) => state.user);
  const theme = useTheme();

  // Handle multiple class teachers
  const classTeacherClasses = Array.isArray(currentUser?.classTeacherOf)
    ? currentUser.classTeacherOf
    : currentUser?.classTeacherOf
    ? [currentUser.classTeacherOf]
    : [];

  const [selectedClassId, setSelectedClassId] = useState(
    classTeacherClasses.length > 0 ? classTeacherClasses[0]._id : null
  );
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch students when selected class changes
  useEffect(() => {
    if (selectedClassId) {
      dispatch(getClassStudents(selectedClassId));
      setAttendance({});
      setSaveSuccess(false);
    }
  }, [dispatch, selectedClassId]);

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaveSuccess(false);
  };

  const saveAttendance = async () => {
    try {
      if (!selectedClassId) {
        alert("No class selected.");
        return;
      }

      setSaveLoading(true);
      const payload = {
        teacherId: currentUser?._id,
        sclassId: selectedClassId,
        date,
        records: sclassStudents.map((s) => ({
          studentId: s._id,
          status: attendance[s._id] || "Absent",
        })),
      };

      await axios.post("http://localhost:5000/Attendance/Mark", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSaveSuccess(true);
      setAttendance({});
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert(
        `Error saving attendance: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // Calculate attendance stats
  const presentCount = Object.values(attendance).filter(
    (status) => status === "Present"
  ).length;
  const absentCount = Object.values(attendance).filter(
    (status) => status === "Absent"
  ).length;
  const totalCount = sclassStudents?.length || 0;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!classTeacherClasses.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            No Class Assignment
          </Typography>
          <Typography variant="body1">
            You are not assigned as a class teacher for any class.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const selectedClass = classTeacherClasses.find(
    (cls) => cls._id === selectedClassId
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Card 
        sx={{ 
          mb: 4, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          boxShadow: theme.shadows[8]
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <School sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Class Attendance
              </Typography>
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center">
                  <CalendarToday sx={{ mr: 1 }} />
                  <Typography variant="h6">{date}</Typography>
                </Box>
                {selectedClass && (
                  <Chip
                    label={selectedClass.sclassName}
                    variant="filled"
                    sx={{ 
                      background: "rgba(255,255,255,0.2)", 
                      color: "white",
                      fontWeight: "bold"
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Controls Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, boxShadow: theme.shadows[3] }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Class Selection
              </Typography>
              
              {classTeacherClasses.length > 1 && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClassId}
                    label="Select Class"
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    {classTeacherClasses.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.sclassName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Attendance Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Present:</Typography>
                  <Chip 
                    label={presentCount} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Absent:</Typography>
                  <Chip 
                    label={absentCount} 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Total:</Typography>
                  <Chip 
                    label={totalCount} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={saveLoading ? <CircularProgress size={20} /> : <Save />}
                onClick={saveAttendance}
                disabled={saveLoading || Object.keys(attendance).length === 0}
                sx={{ 
                  mt: 3,
                  py: 1.5,
                  background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                {saveLoading ? "Saving..." : "Save Attendance"}
              </Button>

              {saveSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Attendance saved successfully!
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Students Table */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: theme.shadows[3] }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">
                  Students List
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click Present/Absent to mark attendance for each student
                </Typography>
              </Box>

              <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", py: 2 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 2 }}>Roll No</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", py: 2 }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(sclassStudents) && sclassStudents.length > 0 ? (
                    sclassStudents.map((student, index) => (
                      <TableRow 
                        key={student._id}
                        sx={{ 
                          '&:nth-of-type(odd)': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.02) 
                          },
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                mr: 2,
                                bgcolor: theme.palette.primary.main 
                              }}
                            >
                              {student.name?.charAt(0) || "S"}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {student.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip 
                            label={student.rollNum} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Box display="flex" gap={1} justifyContent="center">
                            <Button
                              variant={attendance[student._id] === "Present" ? "contained" : "outlined"}
                              color="success"
                              size="small"
                              startIcon={<CheckCircle />}
                              onClick={() => setStatus(student._id, "Present")}
                              sx={{ 
                                minWidth: 100,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold'
                              }}
                            >
                              Present
                            </Button>
                            <Button
                              variant={attendance[student._id] === "Absent" ? "contained" : "outlined"}
                              color="error"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={() => setStatus(student._id, "Absent")}
                              sx={{ 
                                minWidth: 100,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold'
                              }}
                            >
                              Absent
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Group sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                          No students found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedClass ? "No students enrolled in this class." : "Please select a class."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClassAttendance;