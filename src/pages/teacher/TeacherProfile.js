import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Avatar,
  Container,
  Paper,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import { updateSuccess } from '../../redux/teacherRelated/teacherSlice';
import { useSelector, useDispatch } from 'react-redux';
// import { uploadTeacherProfilePicture } from '../../redux/teacherRelated/teacherHandle'; // Will implement later

const TeacherProfile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
  });

  // Initialize formData from currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || '',
      });
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  // Editable form handlers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSaveChanges = async () => {
  try {
    setSaving(true);

    // 1. Update teacher basic info
    await axios.put(
      `${process.env.REACT_APP_BASE_URL}/Teacher/${currentUser._id}`,
      formData
    );

    // 2. Fetch fresh teacher details (with populated school, classes, subjects)
    const { data: freshTeacher } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/Teacher/${currentUser._id}`
    );

    // 3. Update Redux + localStorage
    dispatch(updateSuccess(freshTeacher));
    localStorage.setItem('user', JSON.stringify(freshTeacher));

    // 4. Sync formData instantly
    setFormData({
      name: freshTeacher.name || '',
      email: freshTeacher.email || '',
      phoneNumber: freshTeacher.phoneNumber || '',
      address: freshTeacher.address || '',
      emergencyContact: freshTeacher.emergencyContact || '',
    });

    // 5. Reload the page to reflect all changes
    window.location.reload();

  } catch (err) {
    console.error(err);
    alert('Failed to update details');
  } finally {
    setSaving(false);
  }
};


  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const teachClasses = currentUser?.teachSclass || [];
  const teachSubjects = currentUser?.teachSubject || [];
  const teacherSchool = currentUser?.school?.schoolName || 'N/A';

  return (
    <Container maxWidth="md">
      {/* Profile Picture + Classes/Subjects */}
      <StyledPaper elevation={3}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
              <Avatar
                alt="Teacher Avatar"
                src={previewUrl || currentUser?.profileImage?.url || ''}
                sx={{ width: 150, height: 150 }}
              >
                {currentUser?.name?.charAt(0)}
              </Avatar>

              <Box mt={2} display="flex" flexDirection="column" alignItems="center" gap={1}>
                <input type="file" accept="image/*" onChange={handleFileChange} disabled />
                {/* <Button
                  variant="contained"
                  sx={{ mt: 1 }}
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  startIcon={uploading ? <CircularProgress size={20} /> : null}
                >
                  {uploading ? 'Uploading...' : 'Upload Profile Picture'}
                </Button> */}
                {selectedFile && (
                  <Typography variant="caption" color="textSecondary">
                    Selected: {selectedFile.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" textAlign="center">
              {currentUser?.name}
            </Typography>
            <Typography variant="subtitle1" textAlign="center">
              School: {teacherSchool}
            </Typography>
            <Typography variant="subtitle1" textAlign="center">
              Classes: {teachClasses.map((cls) => cls?.sclassName).join(', ') || 'N/A'}
            </Typography>
            <Typography variant="subtitle1" textAlign="center">
              Subjects: {teachSubjects.map((sub) => sub?.subName).join(', ') || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </StyledPaper>

      {/* Personal Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <strong>Date of Birth:</strong> {currentUser?.dob ? new Date(currentUser.dob).toDateString() : 'N/A'}
            </Grid>
            <Grid item xs={12} sm={6}>
              <strong>Father's Name:</strong> {currentUser?.fatherName || 'N/A'}
            </Grid>
            <Grid item xs={12} sm={6}>
              <strong>Email:</strong> {currentUser?.email || 'N/A'}
            </Grid>
            <Grid item xs={12} sm={6}>
              <strong>Phone:</strong> {currentUser?.phoneNumber || 'N/A'}
            </Grid>
            <Grid item xs={12} sm={6}>
              <strong>Address:</strong> {currentUser?.address || 'N/A'}
            </Grid>
            <Grid item xs={12} sm={6}>
              <strong>Emergency Contact:</strong> {currentUser?.emergencyContact || 'N/A'}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Editable Update Form */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Update Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Name" name="name" fullWidth value={formData.name} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" name="email" fullWidth value={formData.email} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" name="phoneNumber" fullWidth value={formData.phoneNumber} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Address" name="address" fullWidth value={formData.address} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Emergency Contact" name="emergencyContact" fullWidth value={formData.emergencyContact} onChange={handleInputChange} />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TeacherProfile;

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
`;