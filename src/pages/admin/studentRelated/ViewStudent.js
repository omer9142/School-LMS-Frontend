// src/pages/Admin/Student/ViewStudent.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, updateUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableHead,
  Typography,
  Tab,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  TextField,
  TableRow,
  TableCell,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { KeyboardArrowUp, KeyboardArrowDown, Delete as DeleteIcon } from '@mui/icons-material';
import { removeStuff, updateStudentFields, getStudentAttendance } from '../../../redux/studentRelated/studentHandle';

// removed groupAttendanceBySubject import (we use per-day attendance now)

import CustomBarChart from '../../../components/CustomBarChart';
import CustomPieChart from '../../../components/CustomPieChart';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import Popup from '../../../components/Popup';

// ---------- helpers (fixed %) ----------
const pct2 = (n) => {
  // produce a number with 2 decimal precision (not a string)
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

// Prefer the explicit backend student ID if available
const getDisplayStudentId = (details) => {
  const explicit =
    details?.studentId ||
    details?.studentID ||
    details?.student_id ||
    details?.registrationId ||
    details?.admissionId ||
    details?.sid;
  if (explicit) return explicit;

  // fallback to short form from Mongo _id
  const id = details?._id;
  if (!id) return 'N/A';
  const lastSix = String(id).slice(-6);
  return `STU-${lastSix}`;
};

const ViewStudent = () => {
  const [showTab, setShowTab] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  const studentID = params.id;
  const address = 'Student';

  // Redux state
  const { userDetails, loading, error } = useSelector((state) => state.user);
  const { attendance } = useSelector((state) => state.student); // <-- per-day attendance

  // Local state - Updated to include all fields
  const [name, setName] = useState('');
  const [rollNum, setRollNum] = useState('');
  const [password, setPassword] = useState('');
  const [sclassName, setSclassName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [subjectAttendance, setSubjectAttendance] = useState([]); // will hold per-day attendance array

  // Additional fields for update
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address1, setAddress1] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [openStates, setOpenStates] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  // Tab state
  const [value, setValue] = useState('1');
  const [selectedSection, setSelectedSection] = useState('table');

  // Fetch user details + fresh per-day attendance
  useEffect(() => {
    dispatch(getUserDetails(studentID, address));
    dispatch(getStudentAttendance(studentID)); // <-- fetch per-day attendance
  }, [dispatch, studentID]);

  useEffect(() => {
    if (userDetails?.sclassName?._id) {
      dispatch(getSubjectList(userDetails.sclassName._id, 'ClassSubjects'));
    }
  }, [dispatch, userDetails]);

  useEffect(() => {
    if (userDetails) {
      // sync editable fields once when userDetails changes (not on every keystroke)
      setName(userDetails.name || '');
      setRollNum(userDetails.rollNum || '');
      setSclassName(userDetails.sclassName || '');
      setStudentSchool(userDetails.school || '');
      setSubjectMarks(userDetails.examResult || []);

      // Use the redux-fetched per-day attendance if present; otherwise fall back to userDetails.attendance
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

  const handleOpen = (subId) => {
    setOpenStates((prevState) => ({
      ...prevState,
      [subId]: !prevState[subId],
    }));
  };

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  const handleSectionChange = (_event, newSection) => {
    setSelectedSection(newSection);
  };

  // fields payload
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
      })
      .catch((err) => console.error(err));
  };

  const deleteHandler = () => {
  if (window.confirm("Are you sure you want to delete this student?")) {
    dispatch(removeStuff(studentID, address))
      .then(() => {
        navigate('/Admin/students'); // ✅ go back to students list after delete
      })
      .catch((err) => {
        console.error("Failed to delete student:", err);
        setMessage("Failed to delete student.");
        setShowPopup(true);
      });
  }
};


  const removeHandler = (id, deladdress) => {
    dispatch(removeStuff(id, deladdress)).then(() => {
      dispatch(getUserDetails(studentID, address));
    });
  };

  const removeSubAttendance = (subId) => {
    // keep existing endpoint call if you still need to remove subject-attendance groups (legacy)
    dispatch(updateStudentFields(studentID, { subId }, 'RemoveStudentSubAtten')).then(() => {
      dispatch(getUserDetails(studentID, address));
    });
  };

  // ---------- attendance memo (per-day system) ----------
  const attendanceData = useMemo(() => {
    // subjectAttendance is now the per-day array: [{date, status, subName?}, ...]
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

  const { overallAttendancePercentage, overallAbsentPercentage, chartData } = attendanceData;

  const StudentAttendanceSection = () => {
    // render a daily attendance table (no per-subject grouping)
    const renderTableSection = () => {
      return (
        <>
          <Typography variant="h5" gutterBottom>
            Daily Attendance
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Day</b></TableCell>
                <TableCell><b>Status</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {subjectAttendance && subjectAttendance.length > 0 ? (
                subjectAttendance.map((att, index) => {
                  const dateObj = new Date(att.date);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                  return (
                    <TableRow key={index}>
                      <TableCell>{dateObj.toLocaleDateString()}</TableCell>
                      <TableCell>{dayName}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: att.status === "Present" ? "green" : "red"
                          }}
                        >
                          {att.status}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No Attendance Records
                  </TableCell>
                </TableRow>
              )}
            </TableBody>


          </Table>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6">
              Overall Attendance Percentage: {formatPctForDisplay(overallAttendancePercentage)}
            </Typography>
          </Box>

          
        </>
      );
    };

    const renderChartSection = () => {
      return (
        <Box>
          <Typography variant="h5" gutterBottom>
            Attendance Chart
          </Typography>
          {/* Use the pie chart for present/absent */}
          <CustomPieChart data={chartData} />
        </Box>
      );
    };

    if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No attendance data found
          </Typography>
          <Button
            variant="contained"
            sx={styles.styledButton}
            onClick={() => navigate('/Admin/students/student/attendance/' + studentID)}
          >
            Add Attendance
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        {selectedSection === 'table' && renderTableSection()}
        {selectedSection === 'chart' && renderChartSection()}

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
            <BottomNavigationAction
              label="Table"
              value="table"
              icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
            />
            <BottomNavigationAction
              label="Chart"
              value="chart"
              icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    );
  };

  // (StudentMarksSection unchanged) - left intact from your original file
  const StudentMarksSection = () => {
    const renderTableSection = () => {
      return (
        <>
          <Typography variant="h5" gutterBottom>
            Subject Marks
          </Typography>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>Subject</StyledTableCell>
                <StyledTableCell>Marks</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(subjectMarks) &&
                subjectMarks.map((result, index) => {
                  if (!result?.subName || result.marksObtained == null) return null;
                  return (
                    <StyledTableRow key={index}>
                      <StyledTableCell>
                        {typeof result.subName === 'string'
                          ? result.subName
                          : result.subName?.subName || 'Unknown Subject'}
                      </StyledTableCell>
                      <StyledTableCell>{result.marksObtained}</StyledTableCell>
                    </StyledTableRow>
                  );
                })}
            </TableBody>
          </Table>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              sx={styles.styledButton}
              onClick={() => navigate('/Admin/students/student/marks/' + studentID)}
            >
              Add Marks
            </Button>
          </Box>
        </>
      );
    };

    const renderChartSection = () => {
      return (
        <Box>
          <Typography variant="h5" gutterBottom>
            Marks Chart
          </Typography>
          <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
        </Box>
      );
    };

    if (!Array.isArray(subjectMarks) || subjectMarks.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No marks data found
          </Typography>
          <Button
            variant="contained"
            sx={styles.styledButton}
            onClick={() => navigate('/Admin/students/student/marks/' + studentID)}
          >
            Add Marks
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        {selectedSection === 'table' && renderTableSection()}
        {selectedSection === 'chart' && renderChartSection()}

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
            <BottomNavigationAction
              label="Table"
              value="table"
              icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
            />
            <BottomNavigationAction
              label="Chart"
              value="chart"
              icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
            />
          </BottomNavigation>
        </Paper>
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
      <Box sx={{ py: 2 }} id="student-details-section">
        {/* Profile Header with Avatar */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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
        </Paper>

        {/* Personal Information Card */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                borderBottom: '2px solid #1976d2',
                pb: 1,
                mb: 2,
                color: 'primary.main',
              }}
            >
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Date of Birth:</strong>{' '}
                  {userDetails?.dob ? new Date(userDetails.dob).toDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Father's Name:</strong> {userDetails?.fatherName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {userDetails?.email || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {userDetails?.phoneNumber || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Address:</strong> {userDetails?.address || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Emergency Contact:</strong> {userDetails?.emergencyContact || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Student ID:</strong> {getDisplayStudentId(userDetails)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Admission Date:</strong>{' '}
                  {userDetails?.createdAt ? new Date(userDetails.createdAt).toDateString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Attendance Overview Card */}
        {Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  borderBottom: '2px solid #1976d2',
                  pb: 1,
                  mb: 2,
                  color: 'primary.main',
                }}
              >
                Attendance Overview
              </Typography>
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
            </Box>
          </Paper>
        )}

        {/* Academic Summary Card */}
        {Array.isArray(subjectMarks) && subjectMarks.length > 0 && (
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  borderBottom: '2px solid #1976d2',
                  pb: 1,
                  mb: 2,
                  color: 'primary.main',
                }}
              >
                Academic Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Subjects:</strong> {subjectMarks.length}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Average Score:</strong>{' '}
                    {subjectMarks.length > 0
                      ? (
                        subjectMarks.reduce(
                          (sum, mark) => sum + (mark.marksObtained || 0),
                          0
                        ) / subjectMarks.length
                      ).toFixed(2)
                      : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="contained" sx={styles.styledButton} onClick={() => setShowTab(!showTab)}>
            {showTab ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            Edit Student
          </Button>
          <Button variant="contained" color="error" onClick={deleteHandler}>
            Delete Student
          </Button>
        </Box>

        {/* Edit Form */}
        <Collapse in={showTab} timeout="auto" unmountOnExit>
          <Paper elevation={2} sx={{ mt: 3, p: 3 }} id="edit-form-section">
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                borderBottom: '2px solid #1976d2',
                pb: 1,
                mb: 2,
                color: 'primary.main',
              }}
            >
              Edit Student Details
            </Typography>

            {/* ✅ Using stable MUI TextField components (prevents focus loss) */}
            <form onSubmit={submitHandler}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Roll Number"
                    value={rollNum}
                    onChange={(e) => setRollNum(e.target.value)}
                  // text instead of number avoids odd cursor jumps and keeps leading zeros
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    multiline
                    minRows={3}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password (optional)"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" sx={styles.styledButton}>
                  Update Student
                </Button>
                <Button variant="outlined" onClick={() => setShowTab(false)}>
                  Cancel
                </Button>
              </Box>
            </form>
          </Paper>
        </Collapse>
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
              <Tab label="Marks" value="3" />
            </TabList>
          </Box>
          <Container sx={{ py: 3, mb: 8 }}>
            <TabPanel value="1" sx={{ px: 0 }}>
              <StudentDetailsSection />
            </TabPanel>
            <TabPanel value="2" sx={{ px: 0 }}>
              <StudentAttendanceSection />
            </TabPanel>
            <TabPanel value="3" sx={{ px: 0 }}>
              <StudentMarksSection />
            </TabPanel>
          </Container>
        </TabContext>
      </Box>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ViewStudent;

const styles = {
  attendanceButton: {
    backgroundColor: '#270843',
    '&:hover': {
      backgroundColor: '#3f1068',
    },
  },
  styledButton: {
    backgroundColor: '#02250b',
    '&:hover': {
      backgroundColor: '#106312',
    },
  },
};
