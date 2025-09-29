// src/pages/Admin/Student/ViewStudent.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, updateUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableHead,
  Typography,
  Tab,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  TextField,
  TableRow,
  TableCell,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { 
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff,
  Edit,
  Save,
  Cancel,
  Person,
  Phone,
  Email,
  LocationOn,
  ContactEmergency,
  DateRange,
  Lock,
} from '@mui/icons-material';
import { removeStuff, updateStudentFields, getStudentAttendance } from '../../../redux/studentRelated/studentHandle';

import CustomPieChart from '../../../components/CustomPieChart';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import Popup from '../../../components/Popup';

// ---------- helpers (fixed %) ----------
const pct2 = (n) => {
  return Math.round(n * 100) / 100;
};

const computeOverallPct = (attendanceArr) => {
  if (!Array.isArray(attendanceArr) || attendanceArr.length === 0) return 0;
  const total = attendanceArr.length;
  const present = attendanceArr.filter(
    (a) => (a?.status || '').toLowerCase() === 'present'
  ).length;
  return pct2((present / total) * 100);
};

const formatPctForDisplay = (n) =>
  Math.abs(n - 100) < 1e-9 ? '100%' : `${n.toFixed(2).replace(/\.00$/, '')}%`;

const getDisplayStudentId = (details) => {
  const explicit =
    details?.studentId ||
    details?.studentID ||
    details?.student_id ||
    details?.registrationId ||
    details?.admissionId ||
    details?.sid;
  if (explicit) return explicit;

  const id = details?._id;
  if (!id) return 'N/A';
  const lastSix = String(id).slice(-6);
  return `STU-${lastSix}`;
};

const ViewStudent = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  const studentID = params.id;
  const address = 'Student';

  // Redux state
  const { userDetails, loading, error } = useSelector((state) => state.user);
  const { attendance } = useSelector((state) => state.student);

  // Local state - Updated to include all fields
  const [name, setName] = useState('');
  const [rollNum, setRollNum] = useState('');
  const [password, setPassword] = useState('');
  const [sclassName, setSclassName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [subjectAttendance, setSubjectAttendance] = useState([]);

  // Additional fields for update
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address1, setAddress1] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Tab state
  const [value, setValue] = useState('1');

  // Fetch user details + fresh per-day attendance
  useEffect(() => {
    dispatch(getUserDetails(studentID, address));
    dispatch(getStudentAttendance(studentID));
  }, [dispatch, studentID]);

  useEffect(() => {
    if (userDetails?.sclassName?._id) {
      dispatch(getSubjectList(userDetails.sclassName._id, 'ClassSubjects'));
    }
  }, [dispatch, userDetails]);

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name || '');
      setRollNum(userDetails.rollNum || '');
      setPassword(''); // Don't pre-fill password for security
      setSclassName(userDetails.sclassName || '');
      setStudentSchool(userDetails.school || '');

      setSubjectAttendance(
        Array.isArray(attendance) && attendance.length > 0
          ? attendance
          : (userDetails.attendance || [])
      );

      setEmail(userDetails.email || '');
      setPhoneNumber(userDetails.phoneNumber || '');
      setDob(userDetails.dob ? userDetails.dob.split('T')[0] : '');
      setFatherName(userDetails.fatherName || '');
      setAddress1(userDetails.address || '');
      setEmergencyContact(userDetails.emergencyContact || '');
    }
  }, [userDetails, attendance]);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  const fields = useMemo(
    () => ({
      name,
      rollNum,
      email,
      phoneNumber,
      dob,
      fatherName,
      address: address1,
      emergencyContact,
      ...(password !== '' && { password }),
    }),
    [name, rollNum, email, phoneNumber, dob, fatherName, address1, emergencyContact, password]
  );

  const submitHandler = (event) => {
    event.preventDefault();
    dispatch(updateUser(fields, studentID, address))
      .then(() => {
        dispatch(getUserDetails(studentID, address));
        setEditDialogOpen(false);
        setMessage('Student details updated successfully!');
        setShowPopup(true);
        setPassword(''); // Clear password field after successful update
      })
      .catch((err) => {
        console.error(err);
        setMessage('Failed to update student details.');
        setShowPopup(true);
      });
  };

  const deleteHandler = () => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      dispatch(removeStuff(studentID, address))
        .then(() => {
          navigate('/Admin/students');
        })
        .catch((err) => {
          console.error("Failed to delete student:", err);
          setMessage("Failed to delete student.");
          setShowPopup(true);
        });
    }
  };

  const openEditDialog = () => {
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setPassword(''); // Clear password when closing
    setShowCurrentPassword(false); // Reset current password visibility
    setShowPassword(false); // Reset new password visibility
  };

  // ---------- attendance memo (per-day system) ----------
  const attendanceData = useMemo(() => {
    if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) {
      return {
        overallAttendancePercentage: 0,
        overallAbsentPercentage: 100,
        chartData: [
          { name: 'Present', value: 0 },
          { name: 'Absent', value: 100 },
        ],
      };
    }

    const overallPct = computeOverallPct(subjectAttendance);
    const overallAbsentPct = pct2(100 - overallPct);

    const chartData = [
      { name: 'Present', value: overallPct },
      { name: 'Absent', value: overallAbsentPct },
    ];

    return {
      overallAttendancePercentage: overallPct,
      overallAbsentPercentage: overallAbsentPct,
      chartData,
    };
  }, [subjectAttendance]);

  const { overallAttendancePercentage, chartData } = attendanceData;

  const StudentAttendanceSection = () => {
    if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No attendance data found
          </Typography>
          {/* Removed Add Attendance button as requested */}
        </Box>
      );
    }

    return (
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary">
              Daily Attendance Records
            </Typography>
            
            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="h6" color="white" textAlign="center">
                Overall Attendance: {formatPctForDisplay(overallAttendancePercentage)}
              </Typography>
              <Typography variant="body2" color="white" textAlign="center">
                Total Sessions: {subjectAttendance.length}
              </Typography>
            </Box>

            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Day</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {subjectAttendance.map((att, index) => {
                  const dateObj = new Date(att.date);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                  return (
                    <StyledTableRow key={index}>
                      <StyledTableCell>{dateObj.toLocaleDateString()}</StyledTableCell>
                      <StyledTableCell>{dayName}</StyledTableCell>
                      <StyledTableCell>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: att.status === "Present" ? "success.main" : "error.main",
                            textTransform: "uppercase"
                          }}
                        >
                          {att.status}
                        </Typography>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance Chart
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CustomPieChart data={chartData} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const StudentDetailsSection = () => {
    if (!userDetails) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No student found.</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 2 }}>
        {/* Profile Header with Avatar */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
              <Avatar
                alt="Student Avatar"
                src={userDetails?.profileImage?.url || ''}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {userDetails?.name?.charAt(0)}
              </Avatar>

              <Typography variant="h4" gutterBottom textAlign="center">
                {userDetails?.name || 'N/A'}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Roll No: {userDetails?.rollNum || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Class: {userDetails?.sclassName?.sclassName || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                School: {userDetails?.school?.schoolName || 'N/A'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateRange sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                      <Typography variant="body1">
                        {userDetails?.dob ? new Date(userDetails.dob).toDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Father's Name</Typography>
                      <Typography variant="body1">{userDetails?.fatherName || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ minWidth: '120px' }}>
                      Student ID:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {getDisplayStudentId(userDetails)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{userDetails?.email || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">{userDetails?.phoneNumber || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ContactEmergency sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Emergency Contact</Typography>
                      <Typography variant="body1">{userDetails?.emergencyContact || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Address Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">{userDetails?.address || 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Admission Date: {userDetails?.createdAt ? new Date(userDetails.createdAt).toDateString() : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Attendance Overview Card */}
        {Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Attendance Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Overall Attendance:</strong>{' '}
                    {formatPctForDisplay(overallAttendancePercentage)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Based on {subjectAttendance.length} session(s)
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CustomPieChart data={chartData} />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            sx={styles.styledButton} 
            onClick={openEditDialog}
            startIcon={<Edit />}
            size="large"
          >
            Edit Student
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={deleteHandler}
            startIcon={<DeleteIcon />}
            size="large"
          >
            Delete Student
          </Button>
        </Box>
      </Box>
    );
  };

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading student details...</Typography>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading student details: {error}
        </Alert>
        <Button variant="contained" onClick={() => dispatch(getUserDetails(studentID, address))}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <TabList
              onChange={handleChange}
              centered
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                bgcolor: 'background.paper',
              }}
            >
              <Tab label="Details" value="1" />
              <Tab label="Attendance" value="2" />
            </TabList>
          </Box>
          <Container sx={{ py: 3, mb: 8 }}>
            <TabPanel value="1" sx={{ px: 0 }}>
              <StudentDetailsSection />
            </TabPanel>
            <TabPanel value="2" sx={{ px: 0 }}>
              <StudentAttendanceSection />
            </TabPanel>
          </Container>
        </TabContext>
      </Box>

      {/* Edit Student Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={closeEditDialog} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Typography variant="h5" color="primary">
            <Edit sx={{ mr: 1, verticalAlign: 'middle' }} />
            Edit Student Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={submitHandler}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  value={rollNum}
                  onChange={(e) => setRollNum(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ContactEmergency color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

             
              

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <LocationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password (optional)"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Leave blank to keep current password"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={closeEditDialog}
            variant="outlined" 
            startIcon={<Cancel />}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={submitHandler}
            variant="contained" 
            sx={styles.styledButton}
            startIcon={<Save />}
            size="large"
          >
            Update Student
          </Button>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ViewStudent;

const styles = {
  styledButton: {
    backgroundColor: '#000000ff',
    '&:hover': {
      backgroundColor: '#1565c0',
    },
  },
};