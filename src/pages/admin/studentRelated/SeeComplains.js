import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  Box,
  Checkbox,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Badge,
  Button,
  Snackbar
} from '@mui/material';
import {
  CheckCircleOutline,
  RadioButtonUnchecked,
  Delete,
  Refresh,
  Visibility,
  MarkEmailRead
} from '@mui/icons-material';
import { 
  getAllComplains, 
  updateComplainStatus,
  updateMultipleComplainsStatus,
  deleteComplain,


} from '../../../redux/complainRelated/complainHandle';
import TableTemplate from '../../../components/TableTemplate';
import { clearError, clearResponse  } from '../../../redux/complainRelated/complainSlice';


const SeeComplains = () => {
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);

  const [selectedComplain, setSelectedComplain] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllComplains(currentUser._id, "Complain"));
    }
  }, [currentUser._id, dispatch]);

  useEffect(() => {
    if (response) {
      setSnackbar({ open: true, message: response, severity: "info" });
      // Clear response after showing
      setTimeout(() => dispatch(clearResponse()), 3000);
    }
    if (error) {
      setSnackbar({ open: true, message: error, severity: "error" });
      // Clear error after showing
      setTimeout(() => dispatch(clearError()), 3000);
    }
  }, [response, error, dispatch]);

  const handleStatusToggle = async (complainId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    try {
      await dispatch(updateComplainStatus(complainId, newStatus));
      setSnackbar({ open: true, message: `Complaint marked as ${newStatus}`, severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  const handleViewDetails = (row) => {
    setSelectedComplain(row);
  };

  const handleMarkAllPending = async () => {
    const resolvedComplains = complainsList.filter(complain => complain.status === 'resolved');
    const resolvedIds = resolvedComplains.map(complain => complain._id);
    
    if (resolvedIds.length > 0) {
      try {
        await dispatch(updateMultipleComplainsStatus(resolvedIds, 'pending', currentUser._id));
        setSnackbar({ open: true, message: "All complaints marked as pending", severity: "success" });
      } catch (error) {
        setSnackbar({ open: true, message: "Failed to update complaints", severity: "error" });
      }
    } else {
      setSnackbar({ open: true, message: "No resolved complaints to update", severity: "info" });
    }
  };

  const handleDeleteComplain = async (complainId) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await dispatch(deleteComplain(complainId, currentUser._id));
        setSnackbar({ open: true, message: "Complaint deleted successfully", severity: "success" });
        setSelectedComplain(null);
      } catch (error) {
        setSnackbar({ open: true, message: "Failed to delete complaint", severity: "error" });
      }
    }
  };

  const handleRefresh = () => {
    dispatch(getAllComplains(currentUser._id, "Complain"));
    setSelectedComplain(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const complainColumns = [
    { id: 'user', label: 'User', minWidth: 150 },
    { id: 'complaint', label: 'Complaint', minWidth: 200 },
    { id: 'date', label: 'Date', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100 },
  ];

  const complainRows = complainsList?.map((complain) => {
    const userName = complain.user ? complain.user.name : 'Unknown User';
    const date = new Date(complain.date);
    const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";

    return {
      user: userName,
      complaint: complain.complaint.length > 50 ? complain.complaint.substring(0, 50) + '...' : complain.complaint,
      date: dateString,
      status: complain.status,
      id: complain._id,
      fullComplaint: complain.complaint,
      dbStatus: complain.status,
    };
  }) || [];

  const ComplainButtonHaver = ({ row }) => (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <IconButton
        size="small"
        onClick={() => handleViewDetails(row)}
        color="primary"
        disabled={loading}
      >
        <Visibility />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => handleDeleteComplain(row.id)}
        color="error"
        disabled={loading}
      >
        <Delete />
      </IconButton>
      <Checkbox
        icon={<RadioButtonUnchecked />}
        checkedIcon={<CheckCircleOutline sx={{ color: '#4caf50' }} />}
        checked={row.dbStatus === 'resolved'}
        onChange={() => handleStatusToggle(row.id, row.dbStatus)}
        disabled={loading}
        sx={{
          '&.Mui-checked': {
            color: '#4caf50',
          },
        }}
      />
    </Box>
  );

  // Filter complains by status from database
  const resolvedComplains = complainRows.filter(row => row.dbStatus === 'resolved');
  const pendingComplains = complainRows.filter(row => row.dbStatus === 'pending');

  const getInitials = (name) => {
    if (!name || name === 'Unknown User') return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (str) => {
    if (!str) return '#666666';
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning' },
      resolved: { label: 'Resolved', color: 'success' }
    };
    
    const config = statusConfig[status] || { label: 'Unknown', color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading && complainsList.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading complaints...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          Complaint Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={`Total: ${complainRows.length}`}
            variant="outlined"
            color="primary"
          />
          <Chip
            label={`Pending: ${pendingComplains.length}`}
            variant="outlined"
            color="warning"
          />
          <Chip
            label={`Resolved: ${resolvedComplains.length}`}
            variant="outlined"
            color="success"
          />
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            variant="outlined"
            size="small"
            sx={{ ml: 'auto' }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {complainRows.length === 0 && !loading ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No complaints to display at the moment.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Pending Complaints Table */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#ff9800', 
                  color: 'white',
                  borderBottom: 1, 
                  borderColor: 'divider' 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Pending Complaints ({pendingComplains.length})
                  </Typography>
                </Box>
                {pendingComplains.length > 0 ? (
                  <TableTemplate
                    buttonHaver={ComplainButtonHaver}
                    columns={complainColumns}
                    rows={pendingComplains}
                  />
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <CheckCircleOutline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      All complaints are resolved!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar - Resolved Complaints & Details */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Resolved Complaints Card */}
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#4caf50', 
                    color: 'white' 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Badge badgeContent={resolvedComplains.length} color="error">
                        <CheckCircleOutline />
                      </Badge>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Resolved Complaints
                      </Typography>
                    </Box>
                  </Box>
                  
                  {resolvedComplains.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <RadioButtonUnchecked sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary">
                        No resolved complaints yet
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          onClick={handleMarkAllPending}
                          startIcon={<Refresh />}
                          color="primary"
                          disabled={loading}
                        >
                          Mark All Pending
                        </Button>
                      </Box>
                      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {resolvedComplains.map((row, index) => (
                          <React.Fragment key={row.id}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: getRandomColor(row.user) }}>
                                  {getInitials(row.user)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    {row.user}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                                      {row.complaint}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {row.date}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleStatusToggle(row.id, 'resolved')}
                                  color="default"
                                  disabled={loading}
                                >
                                  <RadioButtonUnchecked />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < resolvedComplains.length - 1 && <Divider variant="inset" component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Selected Complaint Details Card */}
              {selectedComplain && (
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: '#2196f3', 
                      color: 'white' 
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Complaint Details
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: getRandomColor(selectedComplain.user), mr: 2 }}>
                          {getInitials(selectedComplain.user)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {selectedComplain.user}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedComplain.date}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {selectedComplain.fullComplaint || selectedComplain.complaint}
                      </Typography>
                      {getStatusChip(selectedComplain.dbStatus)}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      )}

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
    </Box>
  );
};

export default SeeComplains;