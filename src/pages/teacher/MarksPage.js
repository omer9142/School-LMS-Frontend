import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchMarksByTeacher, 
  addMarks, 
  updateMarks, 
  deleteMarks 
} from "../../redux/marksRelated/marksHandle";
import { getTeacherDetails } from "../../redux/teacherRelated/teacherHandle";
import { getClassStudents, getClassDetails } from "../../redux/sclassRelated/sclassHandle";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Container,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const MarksPage = () => {
  const dispatch = useDispatch();
  const { marksList, loading, response, error } = useSelector((state) => state.marks);
  const { currentUser } = useSelector((state) => state.user);
  const { teacherDetails } = useSelector((state) => state.teacher);
  const { sclassStudents, classDetails } = useSelector((state) => state.sclass);

  const [formData, setFormData] = useState({
    studentId: "",
    subjectId: "",
    assessmentType: "",
    topic: "",
    date: "",
    obtainedMarks: "",
    totalMarks: "",
  });

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [fetchingData, setFetchingData] = useState(true);
  
  // State for edit functionality
  const [editingMark, setEditingMark] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [markToDelete, setMarkToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // ✅ Add state to track when we need to refresh
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Fetch teacher details to get subjects and classes
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getTeacherDetails(currentUser._id));
      dispatch(fetchMarksByTeacher(currentUser._id));
    }
  }, [currentUser, dispatch]);

  // Extract classes and subjects from teacherDetails
  useEffect(() => {
    if (teacherDetails) {
      // Get subjects taught by the teacher
      const teacherSubjects = teacherDetails.teachSubject || [];
      setSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : [teacherSubjects]);

      // Get classes taught by the teacher
      const classes = teacherDetails.teachSclass || [];
      const normalizedClasses = Array.isArray(classes) ? classes : [classes];
      setTeacherClasses(normalizedClasses.filter(cls => cls));

      setFetchingData(false);
    }
  }, [teacherDetails]);

  // Fetch students when a class is selected
  useEffect(() => {
    if (selectedClassId) {
      dispatch(getClassStudents(selectedClassId));
      dispatch(getClassDetails(selectedClassId));
    }
  }, [dispatch, selectedClassId]);

  // Update students list when class students are fetched
  useEffect(() => {
    if (sclassStudents && selectedClassId) {
      setStudents(Array.isArray(sclassStudents) ? sclassStudents : [sclassStudents]);
    }
  }, [sclassStudents, selectedClassId]);

  // ✅ Enhanced auto-refresh logic with better handling
  useEffect(() => {
    if (response && currentUser?._id) {
      console.log('✅ Marks operation successful, refreshing data...');
      setSnackbar({ open: true, message: response, severity: "success" });
      
      // Refresh marks list immediately after successful operation
      setTimeout(() => {
        dispatch(fetchMarksByTeacher(currentUser._id));
      }, 100); // Small delay to ensure backend has processed the change
    }
    
    if (error) {
      console.log('❌ Marks operation failed:', error);
      setSnackbar({ open: true, message: error, severity: "error" });
    }
  }, [response, error, dispatch, currentUser]);

  // ✅ Additional effect to handle manual refresh trigger
  useEffect(() => {
    if (shouldRefresh && currentUser?._id) {
      console.log('🔄 Manual refresh triggered...');
      dispatch(fetchMarksByTeacher(currentUser._id));
      setShouldRefresh(false);
    }
  }, [shouldRefresh, dispatch, currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setFormData(prev => ({ ...prev, studentId: "" }));
  };

  // ✅ Enhanced handleSubmit with better refresh logic
  const handleSubmit = async () => {
    if (!formData.studentId || !formData.subjectId) {
      setSnackbar({ open: true, message: "Please select both student and subject", severity: "warning" });
      return;
    }

    console.log('📝 Adding marks...', formData);
    
    try {
      // Dispatch the add marks action
      await dispatch(addMarks({ 
        teacherId: currentUser._id, 
        ...formData 
      }));
      
      // Clear the form
      setFormData({
        studentId: "",
        subjectId: "",
        assessmentType: "",
        topic: "",
        date: "",
        obtainedMarks: "",
        totalMarks: "",
      });
      
      // ✅ Trigger refresh after a short delay
      setTimeout(() => {
        setShouldRefresh(true);
      }, 500);
      
    } catch (error) {
      console.error('Error adding marks:', error);
      setSnackbar({ open: true, message: "Error adding marks", severity: "error" });
    }
  };

  // Edit functionality
  const handleEditClick = (mark) => {
    setEditingMark(mark);
    setFormData({
      studentId: mark.studentId._id || mark.studentId,
      subjectId: mark.subjectId._id || mark.subjectId,
      assessmentType: mark.assessmentType,
      topic: mark.topic,
      date: mark.date ? new Date(mark.date).toISOString().split('T')[0] : "",
      obtainedMarks: mark.obtainedMarks,
      totalMarks: mark.totalMarks,
    });
    setEditDialogOpen(true);
  };

  // ✅ Enhanced handleUpdateSubmit with better refresh logic
  const handleUpdateSubmit = async () => {
    if (!formData.studentId || !formData.subjectId) {
      setSnackbar({ open: true, message: "Please select both student and subject", severity: "warning" });
      return;
    }

    console.log('✏️ Updating marks...', formData);
    
    try {
      await dispatch(updateMarks(editingMark._id, formData));
      setEditDialogOpen(false);
      setEditingMark(null);
      
      // Reset form
      setFormData({
        studentId: "",
        subjectId: "",
        assessmentType: "",
        topic: "",
        date: "",
        obtainedMarks: "",
        totalMarks: "",
      });
      
      // ✅ Trigger refresh after a short delay
      setTimeout(() => {
        setShouldRefresh(true);
      }, 500);
      
    } catch (error) {
      console.error('Error updating marks:', error);
      setSnackbar({ open: true, message: "Error updating marks", severity: "error" });
    }
  };

  // Delete functionality
  const handleDeleteClick = (mark) => {
    setMarkToDelete(mark);
    setDeleteDialogOpen(true);
  };

  // ✅ Enhanced handleDeleteConfirm with better refresh logic
  const handleDeleteConfirm = async () => {
    console.log('🗑️ Deleting marks...', markToDelete._id);
    
    try {
      await dispatch(deleteMarks(markToDelete._id));
      setDeleteDialogOpen(false);
      setMarkToDelete(null);
      
      // ✅ Trigger refresh after a short delay
      setTimeout(() => {
        setShouldRefresh(true);
      }, 500);
      
    } catch (error) {
      console.error('Error deleting marks:', error);
      setSnackbar({ open: true, message: "Error deleting marks", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Light mode with black accents theme
  const theme = {
    primary: '#1976d2',
    secondary: '#dc004e',
    accent: '#1a1a1a',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
  };

  if (fetchingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading teacher data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg" sx={{ width: '90%' }}>
        {/* Header */}
        <Typography 
          variant="h4" 
          mb={4} 
          sx={{ 
            color: theme.accent,
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: `2px solid ${theme.accent}`,
            pb: 1
          }}
        >
          Marks Management
        </Typography>

        {/* Add/Edit Marks Form */}
        <Card 
          sx={{ 
            backgroundColor: theme.surface,
            mb: 4,
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.border}`
          }}
        >
          <CardContent>
            <Typography 
              variant="h6" 
              mb={3} 
              sx={{ 
                color: theme.accent,
                fontWeight: '600'
              }}
            >
              {editingMark ? 'Edit Marks' : 'Add New Marks'}
            </Typography>
            
            <Box
              sx={{ 
                display: "grid", 
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3 
              }}
            >
              {/* Class Selection */}
              <FormControl fullWidth>
                <InputLabel sx={{ color: theme.textSecondary }}>Class</InputLabel>
                <Select
                  value={selectedClassId}
                  onChange={handleClassChange}
                  label="Class"
                  sx={{
                    color: theme.text,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.accent }
                  }}
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {teacherClasses.map((classItem) => {
                    const classId = typeof classItem === 'string' ? classItem : classItem._id;
                    const className = typeof classItem === 'string' ? classItem : classItem.sclassName;
                    return (
                      <MenuItem key={classId} value={classId}>
                        {className || classId}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {/* Student Dropdown */}
              <TextField
                select
                label="Student"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                disabled={!selectedClassId && !editingMark}
                sx={{
                  '& .MuiInputBase-root': { color: theme.text },
                  '& .MuiInputLabel-root': { color: theme.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.accent },
                  '&.Mui-disabled': { backgroundColor: '#f5f5f5' }
                }}
              >
                <MenuItem value="">Select Student</MenuItem>
                {students.length > 0 ? (
                  students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name} (Roll: {student.rollNum || 'N/A'})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {selectedClassId ? "No students found in this class" : "Select a class first"}
                  </MenuItem>
                )}
              </TextField>

              {/* Subject Dropdown */}
              <TextField
                select
                label="Subject"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                sx={{
                  '& .MuiInputBase-root': { color: theme.text },
                  '& .MuiInputLabel-root': { color: theme.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.accent }
                }}
              >
                <MenuItem value="">Select Subject</MenuItem>
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.subName} ({subject.sessions || 0} sessions)
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No subjects found</MenuItem>
                )}
              </TextField>

              <TextField
                select
                label="Assessment Type"
                name="assessmentType"
                value={formData.assessmentType}
                onChange={handleChange}
                sx={{
                  '& .MuiInputBase-root': { color: theme.text },
                  '& .MuiInputLabel-root': { color: theme.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.accent }
                }}
              >
                <MenuItem value="">Select Type</MenuItem>
                {["Test", "Quiz", "Mid Term", "Final", "Other"].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                sx={{
                  '& .MuiInputBase-root': { color: theme.text },
                  '& .MuiInputLabel-root': { color: theme.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.accent }
                }}
              />

              <TextField
                label="Date"
                name="date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={handleChange}
                sx={{
                  '& .MuiInputBase-root': { color: theme.text },
                  '& .MuiInputLabel-root': { color: theme.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.accent }
                }}
              />

              <TextField
                label="Obtained Marks"
                name="obtainedMarks"
                type="number"
                value={formData.obtainedMarks}
                onChange={handleChange}
                sx={{
                  '& .MuiInputBase-root': { color: theme.text },
                  '& .MuiInputLabel-root': { color: theme.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.accent }
                }}
              />

              <TextField
                label="Total Marks"
                name="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={handleChange}
                sx={{
                  '& .MuiInputBase-root': { color: theme.text },
                  '& .MuiInputLabel-root': { color: theme.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.accent }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={editingMark ? handleUpdateSubmit : handleSubmit}
                disabled={!formData.studentId || !formData.subjectId || loading}
                sx={{
                  backgroundColor: theme.accent,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#000000',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  },
                  '&:disabled': {
                    backgroundColor: theme.textSecondary,
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Processing...
                  </>
                ) : (
                  editingMark ? 'Update Marks' : 'Add Marks'
                )}
              </Button>
              
              {editingMark && (
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingMark(null);
                    setFormData({
                      studentId: "",
                      subjectId: "",
                      assessmentType: "",
                      topic: "",
                      date: "",
                      obtainedMarks: "",
                      totalMarks: "",
                    });
                  }}
                  sx={{
                    borderColor: theme.accent,
                    color: theme.accent,
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Marks Table */}
        <Card 
          sx={{ 
            backgroundColor: theme.surface,
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.border}`
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.accent,
                  fontWeight: '600'
                }}
              >
                Marks Records ({marksList.length})
              </Typography>
              
              {/* ✅ Manual refresh button */}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShouldRefresh(true)}
                disabled={loading}
                sx={{
                  borderColor: theme.accent,
                  color: theme.accent,
                  '&:hover': {
                    borderColor: '#000000',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                {loading ? <CircularProgress size={16} /> : 'Refresh'}
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading marks data...</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Student</TableCell>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Class</TableCell>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Topic</TableCell>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Marks</TableCell>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Percentage</TableCell>
                    <TableCell sx={{ color: theme.accent, fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marksList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ color: theme.textSecondary, textAlign: 'center', py: 4 }}>
                        No marks records found. Add some marks to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    marksList.map((mark) => {
                      const percentage = ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(1);
                      return (
                        <TableRow 
                          key={mark._id}
                          sx={{ 
                            '&:hover': { backgroundColor: '#f9f9f9' },
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <TableCell sx={{ color: theme.text, fontWeight: '500' }}>
                            {mark.studentId?.name || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: theme.text }}>
                            {mark.studentId?.sclassName?.sclassName || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: theme.text }}>{mark.subjectId?.subName || 'N/A'}</TableCell>
                          <TableCell sx={{ color: theme.text }}>{mark.assessmentType}</TableCell>
                          <TableCell sx={{ color: theme.text }}>{mark.topic}</TableCell>
                          <TableCell sx={{ color: theme.text }}>
                            {mark.date ? new Date(mark.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: theme.text, fontWeight: 'bold' }}>
                            {mark.obtainedMarks} / {mark.totalMarks}
                          </TableCell>
                          <TableCell sx={{ color: percentage >= 50 ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }}>
                            {percentage}%
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                onClick={() => handleEditClick(mark)}
                                disabled={loading}
                                sx={{ color: theme.primary, '&:hover': { backgroundColor: '#e3f2fd' } }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton 
                                onClick={() => handleDeleteClick(mark)}
                                disabled={loading}
                                sx={{ color: theme.secondary, '&:hover': { backgroundColor: '#ffebee' } }}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete marks for {markToDelete?.studentId?.name || 'this student'}? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

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
    </Box>
  );
};

export default MarksPage;