import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography, Grid, Box, Avatar, Container, Paper, Button, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { uploadStudentProfilePicture } from '../../redux/userRelated/userHandle'; // ✅ Updated import

const StudentProfile = () => {
  const { currentUser, response, error, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  // ✅ Fixed: Added missing state variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  if (response) console.log(response);
  if (error) console.error(error);

  const sclassName = currentUser?.sclassName?.sclassName || 'N/A';
  const studentSchool = currentUser?.school?.schoolName || 'N/A';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image first!');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Uploading file:', selectedFile.name);

      // ✅ Updated function name
      const result = await dispatch(uploadStudentProfilePicture(currentUser._id, formData));
      
      if (result.success) {
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        alert('Profile picture uploaded successfully!');
      } else {
        alert(result.message || 'Failed to upload profile picture');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
              <Avatar 
                alt="Student Avatar"
                src={previewUrl || currentUser?.profileImage?.url || ''}  // ✅ Show preview or current image
                sx={{ width: 150, height: 150 }}
              >
                {currentUser?.name?.charAt(0)}
              </Avatar>
              
              <Box mt={2} display="flex" flexDirection="column" alignItems="center" gap={1}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ margin: '10px 0' }}
                />
                
                <Button 
                  variant="contained" 
                  sx={{ mt: 1 }} 
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  startIcon={uploading ? <CircularProgress size={20} /> : null}
                >
                  {uploading ? 'Uploading...' : 'Upload Profile Picture'}
                </Button>
                
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
              Roll No: {currentUser?.rollNum}
            </Typography>
            <Typography variant="subtitle1" textAlign="center">
              Class: {sclassName}
            </Typography>
            <Typography variant="subtitle1" textAlign="center">
              School: {studentSchool}
            </Typography>
          </Grid>
        </Grid>
      </StyledPaper>

      <Card>
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
    </Container>
  );
};

export default StudentProfile;

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
`;