import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTeacherDetails,
  assignClassTeacher,
  removeTeacherSubjects,
  removeClassTeacherAction
} from '../../../redux/teacherRelated/teacherHandle';
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';

const TeacherDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const { loading, teacherDetails, error, response } = useSelector((state) => state.teacher);

  const teacherID = params.id;

  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeSubOpen, setRemoveSubOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Modal handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedClass(null);
  };

  const handleAssignOpen = () => setAssignOpen(true);
  const handleAssignClose = () => {
    setAssignOpen(false);
    setSelectedClass(null);
  };

  const handleRemoveSubOpen = () => setRemoveSubOpen(true);
  const handleRemoveSubClose = () => {
    setRemoveSubOpen(false);
    setSelectedSubjects([]);
  };

  const handleChooseClass = () => {
    if (selectedClass) {
      navigate(`/Admin/teachers/choosesubject/${selectedClass}/${teacherDetails?._id}`);
      handleClose();
    }
  };

  // ✅ FIXED: assignClassTeacher with proper error handling
  const handleAssignClassTeacher = async () => {
    if (!selectedClass) {
      setSnackbar({ open: true, message: "Please select a class", severity: "warning" });
      return;
    }

    try {
      await dispatch(assignClassTeacher(teacherDetails?._id, selectedClass));
      setSnackbar({ open: true, message: "Class teacher assigned successfully!", severity: "success" });
      handleAssignClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Error assigning class teacher', severity: "error" });
    }
  };

  // ✅ FIXED: removeSubjects with proper error handling
  const handleRemoveSubjects = async () => {
    if (!selectedSubjects.length) {
      setSnackbar({ open: true, message: "Please select subjects to remove", severity: "warning" });
      return;
    }

    try {
      await dispatch(removeTeacherSubjects(teacherID, selectedSubjects));
      setSnackbar({ open: true, message: "Selected subjects removed successfully", severity: "success" });
      handleRemoveSubClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to remove subjects', severity: "error" });
    }
  };

  // ✅ FIXED: removeClassTeacher with proper error handling
  const handleRemoveClassTeacher = async (classId) => {
    if (!classId) return;

    if (window.confirm("Are you sure you want to remove this teacher as class teacher for this class?")) {
      try {
        await dispatch(removeClassTeacherAction(teacherID, classId));
        setSnackbar({ open: true, message: "Class teacher removed successfully", severity: "success" });
      } catch (err) {
        setSnackbar({ open: true, message: err.message || "Failed to remove class teacher", severity: "error" });
      }
    }
  };

  // Render assigned class teachers as buttons with remove option
  {
    teacherDetails?.classTeacherOf?.map((cls) => (
      <Box key={cls._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography>{cls.sclassName}</Typography>
        <Button size="small" color="error" onClick={() => handleRemoveClassTeacher(cls._id)}>Remove</Button>
      </Box>
    ))
  }


  useEffect(() => {
    dispatch(getTeacherDetails(teacherID));
  }, [dispatch, teacherID]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: "error" });
    }
    if (response) {
      setSnackbar({ open: true, message: response.message || "Operation successful", severity: "success" });
    }
  }, [error, response]);

  const handleRefresh = () => {
    dispatch(getTeacherDetails(teacherID));
    setSnackbar({ open: true, message: "Refreshing teacher data...", severity: "info" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && !teacherDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading teacher details...</Typography>
      </Box>
    );
  }

  if (!teacherDetails && !loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Teacher not found</Alert>
      </Container>
    );
  }

  const subjects = Array.isArray(teacherDetails?.teachSubject)
    ? teacherDetails.teachSubject
    : teacherDetails?.teachSubject
      ? [teacherDetails.teachSubject]
      : [];


  // Get class teacher name(s)
  const classTeacherOfName = teacherDetails?.classTeacherOf?.length
    ? teacherDetails.classTeacherOf.map(cls => cls.sclassName).join(', ')
    : 'Not Assigned';

  const isClassTeacher = teacherDetails?.classTeacherOf?.length > 0;



  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Teacher Profile</Typography>
        <Button variant="outlined" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight="bold">{teacherDetails?.name}</Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <Typography><strong>Email:</strong> {teacherDetails?.email || 'N/A'}</Typography>
            <Typography><strong>Date of Birth:</strong> {teacherDetails?.dob || 'N/A'}</Typography>
            <Typography><strong>Father's Name:</strong> {teacherDetails?.fatherName || 'N/A'}</Typography>
            <Typography><strong>Address:</strong> {teacherDetails?.address || 'N/A'}</Typography>
            <Typography><strong>Phone Number:</strong> {teacherDetails?.phoneNumber || 'N/A'}</Typography>
            <Typography><strong>Emergency Contact:</strong> {teacherDetails?.emergencyContact || 'N/A'}</Typography>

            {/* Classes Assigned */}
            <Typography>
              <strong>Classes Assigned:</strong>{' '}
              {teacherDetails?.teachSclass?.length
                ? teacherDetails.teachSclass.map(cls => cls.sclassName).join(', ')
                : 'No classes assigned'}
            </Typography>

            {/* Class Teacher Status */}
           <Box sx={{ mt: 2 }}>
    <Typography variant="h6"><strong>Class Teacher Of:</strong></Typography>
    {teacherDetails?.classTeacherOf?.length > 0 ? (
        teacherDetails.classTeacherOf.map((cls) => (
            <Box key={cls._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography>{cls.sclassName}</Typography>
                <Button 
                    size="small" 
                    color="error" 
                    variant="outlined"
                    onClick={() => handleRemoveClassTeacher(cls._id)}
                >
                    Remove
                </Button>
            </Box>
        ))
    ) : (
        <Typography color="text.secondary">Not Assigned</Typography>
    )}
</Box>





            {/* Subjects */}
            {subjects.length > 0 ? (
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}><strong>Subjects:</strong></Typography>
                {subjects.map((sub, idx) => (
                  <Box key={idx} sx={{ pl: 2, mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography><strong>Subject:</strong> {sub?.subName}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Course Code:</strong> {sub?.subCode || 'N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Class:</strong> {sub?.sclassName?.sclassName || 'N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Sessions:</strong> {sub?.sessions || 0}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No subjects assigned yet.</Typography>
            )}
          </Stack>

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={handleOpen} disabled={!teacherDetails?.teachSclass?.length}>
              Assign Subjects
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAssignOpen}
              disabled={!teacherDetails?.teachSclass?.length} // only disable if teacher has no classes at all
            >
              Assign Class Teacher
            </Button>


            <Button variant="outlined" color="error" onClick={handleRemoveSubOpen} disabled={!subjects.length}>
              Remove Subject
            </Button>
           
          </Box>

          {/* Assign Class Teacher Modal */}
          <Dialog open={assignOpen} onClose={handleAssignClose} fullWidth maxWidth="sm">
            <DialogTitle>Select Class to Assign as Class Teacher</DialogTitle>
            <DialogContent dividers>
              {teacherDetails?.teachSclass?.length ? teacherDetails.teachSclass.map((cls) => (
                <Box
                  key={cls._id}
                  onClick={() => setSelectedClass(cls._id)}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: "1px solid",
                    borderColor: selectedClass === cls._id ? "primary.main" : "grey.300",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "grey.100" }
                  }}
                >
                  <Typography>{cls.sclassName}</Typography>
                </Box>
              )) : <Typography>No classes assigned.</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAssignClose}>Cancel</Button>
              <Button onClick={handleAssignClassTeacher} disabled={!selectedClass} variant="contained">
                Assign as Class Teacher
              </Button>
            </DialogActions>
          </Dialog>

          {/* Assign Subjects Modal */}
          <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Select Class for Subjects</DialogTitle>
            <DialogContent dividers>
              {teacherDetails?.teachSclass?.length ? teacherDetails.teachSclass.map((cls) => (
                <Box
                  key={cls._id}
                  onClick={() => setSelectedClass(cls._id)}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: "1px solid",
                    borderColor: selectedClass === cls._id ? "primary.main" : "grey.300",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "grey.100" }
                  }}
                >
                  <Typography>{cls.sclassName}</Typography>
                </Box>
              )) : <Typography>No classes assigned.</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleChooseClass} disabled={!selectedClass} variant="contained">
                Continue to Subjects
              </Button>
            </DialogActions>
          </Dialog>

          {/* Remove Subjects Modal */}
          <Dialog open={removeSubOpen} onClose={handleRemoveSubClose} fullWidth maxWidth="sm">
            <DialogTitle>Select Subjects to Remove</DialogTitle>
            <DialogContent dividers>
              {subjects.map((sub) => (
                <Box key={sub._id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <input
                    type="checkbox"
                    value={sub._id}
                    checked={selectedSubjects.includes(sub._id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedSubjects([...selectedSubjects, sub._id]);
                      else setSelectedSubjects(selectedSubjects.filter((id) => id !== sub._id));
                    }}
                  />
                  <Typography sx={{ ml: 1 }}>{sub.subName} - {sub.sclassName?.sclassName}</Typography>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRemoveSubClose}>Cancel</Button>
              <Button onClick={handleRemoveSubjects} disabled={!selectedSubjects.length} variant="contained" color="error">
                Remove Selected
              </Button>
            </DialogActions>
          </Dialog>

        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeacherDetails;