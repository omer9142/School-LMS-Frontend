import React, { useEffect } from 'react';
import { getTeacherDetails, assignClassTeacher } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";


import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';

const TeacherDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

  const teacherID = params.id;

  const [open, setOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false); // ✅ for assign class teacher modal
  const [selectedClass, setSelectedClass] = React.useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAssignOpen = () => setAssignOpen(true);
  const handleAssignClose = () => setAssignOpen(false);

  const handleChooseClass = () => {
    if (selectedClass) {
      navigate(`/Admin/teachers/choosesubject/${selectedClass}/${teacherDetails?._id}`);
      handleClose();
    }
  };

  // ✅ Assign Class Teacher Logic
 const handleAssignClassTeacher = async () => {
  if (!selectedClass) return;
  try {
    await assignClassTeacher(teacherDetails?._id, selectedClass);
    alert("Class teacher assigned successfully!");
    handleAssignClose();
    dispatch(getTeacherDetails(teacherID)); // refresh details
  } catch (err) {
    alert(err.message || "Error assigning class teacher");
  }
};

  useEffect(() => {
    dispatch(getTeacherDetails(teacherID));
  }, [dispatch, teacherID]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(getTeacherDetails(teacherID));
      }
    };
    const handleFocus = () => {
      dispatch(getTeacherDetails(teacherID));
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch, teacherID]);

  const handleRefresh = () => {
    dispatch(getTeacherDetails(teacherID));
  };

  if (error) {
    console.error(error);
  }

  const subjects = Array.isArray(teacherDetails?.teachSubject)
    ? teacherDetails.teachSubject
    : teacherDetails?.teachSubject
      ? [teacherDetails.teachSubject]
      : [];

  const classTeacherOfName = teacherDetails?.teachSclass?.find(
    (cls) => cls._id === teacherDetails?.classTeacherOf
  )?.sclassName || "Not Assigned";

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">
              Teacher Profile
            </Typography>
            <Button variant="outlined" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </Box>

          {/* Card */}
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {teacherDetails?.name}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Typography><strong>Email:</strong> {teacherDetails?.email || "N/A"}</Typography>
                <Typography><strong>Date of Birth:</strong> {teacherDetails?.dob || "N/A"}</Typography>
                <Typography><strong>Father's Name:</strong> {teacherDetails?.fatherName || "N/A"}</Typography>
                <Typography><strong>Address:</strong> {teacherDetails?.address || "N/A"}</Typography>
                <Typography><strong>Phone Number:</strong> {teacherDetails?.phoneNumber || "N/A"}</Typography>
                <Typography><strong>Emergency Contact:</strong> {teacherDetails?.emergencyContact || "N/A"}</Typography>

                <Typography>
                  <strong>Class Name:</strong>{" "}
                  {teacherDetails?.teachSclass?.length
                    ? teacherDetails.teachSclass.map(cls => cls.sclassName).join(", ")
                    : "No class assigned"}
                </Typography>

                <Typography>
                  <strong>Class Teacher Of:</strong> {classTeacherOfName}
                </Typography>

                {subjects.length > 0 ? (
                  subjects.map((sub, idx) => (
                    <Box key={idx} sx={{ pl: 1 }}>
                      <Typography><strong>Subject:</strong> {sub?.subName}</Typography>
                      <Typography variant="body2" color="text.secondary"><strong>Course Code:</strong> {sub?.subCode || "N/A"}</Typography>
                      <Typography variant="body2" color="text.secondary"><strong>Class:</strong> {sub?.sclassName?.sclassName || "N/A"}</Typography>
                      <Typography variant="body2" color="text.secondary"><strong>Sessions:</strong> {sub?.sessions || 0}</Typography>
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">No subjects assigned yet.</Typography>
                )}
              </Stack>

              {/* Buttons */}
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleOpen}
                  disabled={!teacherDetails?.teachSclass?.length}
                >
                  Assign Subjects
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleAssignOpen}
                  disabled={!teacherDetails?.teachSclass?.length}
                >
                  Assign Class Teacher
                </Button>
              </Box>

              {/* Modal for Assign Class Teacher */}
              <Dialog open={assignOpen} onClose={handleAssignClose} fullWidth maxWidth="sm">
                <DialogTitle>Select Class to Assign as Class Teacher</DialogTitle>
                <DialogContent dividers>
                  {teacherDetails?.teachSclass?.length ? (
                    teacherDetails.teachSclass.map((cls) => (
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
                          "&:hover": { backgroundColor: "grey.100" },
                        }}
                      >
                        <Typography>{cls.sclassName}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography>No classes assigned.</Typography>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleAssignClose}>Cancel</Button>
                  <Button onClick={handleAssignClassTeacher} disabled={!selectedClass} variant="contained">
                    Assign
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Modal for Assign Subjects (existing) */}
              <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Select Class</DialogTitle>
                <DialogContent dividers>
                  {teacherDetails?.teachSclass?.length ? (
                    teacherDetails.teachSclass.map((cls) => (
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
                          "&:hover": { backgroundColor: "grey.100" },
                        }}
                      >
                        <Typography>{cls.sclassName}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography>No classes assigned.</Typography>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button onClick={handleChooseClass} disabled={!selectedClass} variant="contained">
                    Continue
                  </Button>
                </DialogActions>
              </Dialog>

            </CardContent>
          </Card>
        </Container>
      )}
    </>
  );
};

export default TeacherDetails;
