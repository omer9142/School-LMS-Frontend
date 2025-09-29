import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList, getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import {
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Paper,
  Table,
  TableBody,
  TableHead,
  Typography,
  Box,
  TableContainer
} from '@mui/material';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import CustomBarChart from '../../components/CustomBarChart'

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const StudentSubjects = () => {

  const dispatch = useDispatch();
  const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
  const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getUserDetails(currentUser._id, "Student"));
  }, [dispatch, currentUser._id])

  const [subjectMarks, setSubjectMarks] = useState([]);
  const [selectedSection, setSelectedSection] = useState('table');

  useEffect(() => {
    if (userDetails) {
      setSubjectMarks(userDetails.examResult || []);
    }
  }, [userDetails])

  useEffect(() => {
    if (subjectMarks.length === 0 && currentUser?.sclassName?._id) {
      dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
    }
  }, [subjectMarks.length, dispatch, currentUser?.sclassName?._id]);

  useEffect(() => {
    if (currentUser?.sclassName?._id) {
      dispatch(getClassDetails(currentUser.sclassName._id, "Sclass"));
    }
  }, [dispatch, currentUser?.sclassName?._id]);


  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const renderTableSection = () => {
    return (
      <Paper 
        elevation={8} 
        sx={{ 
          p: 3, 
          borderRadius: 4, 
          mb: 10,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0, 0, 0, 0.26)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
          }
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          fontWeight="bold" 
          sx={{
            color: 'primary.main',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            mb: 3
          }}
        >
          Subject Marks
        </Typography>
        <TableContainer 
          sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Table>
            <TableHead>
              <StyledTableRow sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
                <StyledTableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Subject</StyledTableCell>
                <StyledTableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Marks</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {subjectMarks.map((result, index) => {
                if (!result.subName || !result.marksObtained) {
                  return null;
                }
                return (
                  <StyledTableRow
                    key={index}
                    sx={{
                      "&:hover": { 
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      },
                      transition: "all 0.3s ease",
                      background: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent'
                    }}
                  >
                    <StyledTableCell sx={{ fontSize: '1rem', fontWeight: 500 }}>{result.subName.subName}</StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontSize: '1rem', fontWeight: 600, color: 'black' }}>{result.marksObtained}</StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const renderChartSection = () => {
    return (
      <Paper 
        elevation={8} 
        sx={{ 
          p: 3, 
          borderRadius: 1, 
          mb: 10,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(25, 118, 210, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
          }
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          fontWeight="bold" 
          sx={{
            color: 'black',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            mb: 3
          }}
        >
          Performance Chart
        </Typography>
        <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
      </Paper>
    );
  };

  const renderClassDetailsSection = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          overflow: "hidden",
          maxWidth: 600,
          mx: "auto",
          boxShadow: '0 16px 24px rgba(0, 0, 0, 0.31)',
          background: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.9)'
          }
        }}
      >
        {/* Top Heading Box */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #000000ff 0%, #1565c060 100%)',
            p: 3,
            textAlign: "center",
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
            }
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ 
              color: "#fff", 
              textTransform: "uppercase", 
              letterSpacing: 2,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            Class Details
          </Typography>
        </Box>

        {/* Bottom Content Box */}
        <Box
          sx={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            p: 4,
            textAlign: "left"
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ 
              color: "black", 
              mb: 3,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Class Information
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: "#333", mb: 2 }}>
            You are currently in <Box component="span" sx={{ color: "black", fontWeight: "bold" }}>Class {sclassDetails?.sclassName}</Box>
          </Typography>

          <Box mt={3}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ 
                color: "black", 
                mb: 2,
                pb: 1,
                borderBottom: '2px solid',
                borderColor: 'primary.main'
              }}
            >
              Subjects
            </Typography>

            {subjectsList && subjectsList.length > 0 ? (
              subjectsList.map((subject, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    "&:last-child": { borderBottom: "none" },
                    background: index % 2 === 0 ? 'rgba(25, 118, 210, 0.03)' : 'transparent',
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(25, 118, 210, 0.08)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ color: "#000", fontWeight: 500 }}>
                    {subject.subName} <Box component="span" sx={{ color: "text.secondary", fontSize: '0.9rem' }}>({subject.subCode})</Box>
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: 'italic' }}>
                No subjects found.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loading ? (
        <Typography align="center" variant="h6" sx={{ color: 'text.secondary' }}>Loading...</Typography>
      ) : (
        <>
          {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 ? (
            <>
              {selectedSection === 'table' && renderTableSection()}
              {selectedSection === 'chart' && renderChartSection()}
              
              <Paper
                sx={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderRadius: "16px 16px 0 0",
                  background: 'transparent',
                  boxShadow: 'none'
                }}
                elevation={0}
              >
                <BottomNavigation
                  value={selectedSection}
                  onChange={handleSectionChange}
                  showLabels
                  sx={{
                    borderRadius: "16px 16px 0 0",
                    background: 'linear-gradient(135deg, #000000ff 0%, #000000ff 100%)',
                    color: "#fff",
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                    height: '70px'
                  }}
                >
                  <BottomNavigationAction
                    label="Table"
                    value="table"
                    icon={selectedSection === 'table' ? 
                      <TableChartIcon sx={{ fontSize: 28 }} /> : 
                      <TableChartOutlinedIcon sx={{ fontSize: 28 }} />
                    }
                    sx={{ 
                      color: "#fff",
                      '&.Mui-selected': { 
                        color: '#fff',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 2,
                        mx: 1
                      }
                    }}
                  />
                  <BottomNavigationAction
                    label="Chart"
                    value="chart"
                    icon={selectedSection === 'chart' ? 
                      <InsertChartIcon sx={{ fontSize: 28 }} /> : 
                      <InsertChartOutlinedIcon sx={{ fontSize: 28 }} />
                    }
                    sx={{ 
                      color: "#fff",
                      '&.Mui-selected': { 
                        color: '#fff',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 2,
                        mx: 1
                      }
                    }}
                  />
                </BottomNavigation>
              </Paper>
            </>
          ) : (
            renderClassDetailsSection()
          )}
        </>
      )}
    </Container>
  );
};

export default StudentSubjects;