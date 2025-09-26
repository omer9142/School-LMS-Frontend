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
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 10 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
          Subject Marks
        </Typography>
        <TableContainer sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>Subject</StyledTableCell>
                <StyledTableCell align="center">Marks</StyledTableCell>
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
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                      transition: "all 0.2s ease"
                    }}
                  >
                    <StyledTableCell>{result.subName.subName}</StyledTableCell>
                    <StyledTableCell align="center">{result.marksObtained}</StyledTableCell>
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
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 10 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
          Performance Chart
        </Typography>
        <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
      </Paper>
    );
  };

  const renderClassDetailsSection = () => {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold" >
          Class Details
        </Typography>
        <Typography variant="h6" gutterBottom>
          You are currently in Class <b>{sclassDetails && sclassDetails.sclassName}</b>
        </Typography>
        <br/>
        <hr />
        <br/>
        <Typography variant="subtitle1" fontWeight="bold"  gutterBottom>
          Subjects:
        </Typography>
        {subjectsList &&
          subjectsList.map((subject, index) => (
            <Box
              key={index}
              sx={{
                p: 1,
                borderBottom: "1px solid #eee",
                "&:last-child": { borderBottom: "none" }
              }}
            >
              <Typography variant="body1">
                {subject.subName} ({subject.subCode})
              </Typography>
            </Box>
          ))}
      </Paper>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loading ? (
        <Typography align="center">Loading...</Typography>
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
                }}
                elevation={5}
              >
                <BottomNavigation
                  value={selectedSection}
                  onChange={handleSectionChange}
                  showLabels
                  sx={{
                    borderRadius: "16px 16px 0 0",
                    background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                    color: "#fff"
                  }}
                >
                  <BottomNavigationAction
                    label="Table"
                    value="table"
                    icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                    sx={{ color: "#fff" }}
                  />
                  <BottomNavigationAction
                    label="Chart"
                    value="chart"
                    icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                    sx={{ color: "#fff" }}
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
