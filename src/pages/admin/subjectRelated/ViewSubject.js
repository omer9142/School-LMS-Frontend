import React, { useEffect, useState } from 'react'
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Tab, Container, Typography, BottomNavigation, BottomNavigationAction, Paper, Card, CardContent, Divider } from '@mui/material';
import { BlueButton, GreenButton, PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

const ViewSubject = () => {
  const navigate = useNavigate()
  const params = useParams()
  const dispatch = useDispatch();
  const { subloading, subjectDetails, sclassStudents, getresponse, error } = useSelector((state) => state.sclass);

  const { classID, subjectID } = params

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  if (error) {
    console.log(error)
  }

  const [value, setValue] = useState('1');
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [selectedSection, setSelectedSection] = useState('attendance');
  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const studentColumns = [
    { id: 'rollNum', label: 'Roll No.', minWidth: 100 },
    { id: 'name', label: 'Name', minWidth: 170 },
  ]

  const studentRows = sclassStudents.map((student) => {
    return {
      rollNum: student.rollNum,
      name: student.name,
      id: student._id,
    };
  })

  const StudentsAttendanceButtonHaver = ({ row }) => (
    <>
      <BlueButton
        variant="contained"
        onClick={() => navigate("/Admin/students/student/" + row.id)}
      >
        View
      </BlueButton>
      <PurpleButton
        variant="contained"
        onClick={() =>
          navigate(`/Admin/subject/student/attendance/${row.id}/${subjectID}`)
        }
        sx={{ ml: 1 }}
      >
        Take Attendance
      </PurpleButton>
    </>
  );

  const StudentsMarksButtonHaver = ({ row }) => (
    <>
      <BlueButton
        variant="contained"
        onClick={() => navigate("/Admin/students/student/" + row.id)}
      >
        View
      </BlueButton>
      <PurpleButton
        variant="contained"
        onClick={() => navigate(`/Admin/subject/student/marks/${row.id}/${subjectID}`)}
        sx={{ ml: 1 }}
      >
        Provide Marks
      </PurpleButton>
    </>
  );

  const SubjectStudentsSection = () => {
    return (
      <>
        {getresponse ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <GreenButton
              variant="contained"
              onClick={() => navigate("/Admin/class/addstudents/" + classID)}
            >
              Add Students
            </GreenButton>
          </Box>
        ) : (
          <>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Students List
            </Typography>

            <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 8 }}>
              <CardContent>
                {selectedSection === 'attendance' &&
                  <TableTemplate buttonHaver={StudentsAttendanceButtonHaver} columns={studentColumns} rows={studentRows} />
                }
                {selectedSection === 'marks' &&
                  <TableTemplate buttonHaver={StudentsMarksButtonHaver} columns={studentColumns} rows={studentRows} />
                }
              </CardContent>
            </Card>

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={6}>
              <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                <BottomNavigationAction
                  label="Attendance"
                  value="attendance"
                  icon={selectedSection === 'attendance' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                />
                <BottomNavigationAction
                  label="Marks"
                  value="marks"
                  icon={selectedSection === 'marks' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                />
              </BottomNavigation>
            </Paper>
          </>
        )}
      </>
    )
  }

  const SubjectDetailsSection = () => {
    const numberOfStudents = sclassStudents.length;

    return (
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, mb: 8 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Subject Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            <strong>Subject Name:</strong> {subjectDetails?.subName}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Subject Code:</strong> {subjectDetails?.subCode}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Sessions:</strong> {subjectDetails?.sessions}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Number of Students:</strong> {numberOfStudents}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Class:</strong> {subjectDetails?.sclassName?.sclassName}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Teacher:</strong> {subjectDetails?.teacher ? subjectDetails.teacher.name : "Not Assigned"}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {subloading ?
        <div>Loading...</div>
        :
        <Box sx={{ width: '100%', typography: 'body1', marginBottom: "3rem"  }} >
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', position: 'fixed', width: '100%', zIndex: 1 }}>
              <TabList onChange={handleChange} centered>
                <Tab label="Details" value="1" />
                <Tab label="Students" value="2" />
              </TabList>
            </Box>
            <br/><br/>
            <Container sx={{ marginTop: "2rem", marginBottom: "3rem" }}>
              <TabPanel value="1">
                <SubjectDetailsSection />
              </TabPanel>
              <TabPanel value="2">
                <SubjectStudentsSection />
              </TabPanel>
            </Container>
          </TabContext>
        </Box>
      }
    </>
  )
}

export default ViewSubject
