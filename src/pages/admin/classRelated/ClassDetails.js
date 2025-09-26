import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassDetails, getClassStudents, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
  Box, Container, Typography, Tab, IconButton, Card, CardContent, Grid, Divider
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { resetSubjects } from "../../../redux/sclassRelated/sclassSlice";
import { BlueButton, GreenButton, PurpleButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';

const ClassDetails = () => {
  const params = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { subjectsList, sclassStudents, sclassDetails, loading, error, response, getresponse } = useSelector((state) => state.sclass);

  const classID = params.id

  useEffect(() => {
    dispatch(getClassDetails(classID, "Sclass"));
    dispatch(getSubjectList(classID, "ClassSubjects"))
    dispatch(getClassStudents(classID));
  }, [dispatch, classID])

  if (error) console.log(error);

  const [value, setValue] = useState('1');
  const handleChange = (event, newValue) => setValue(newValue);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const deleteHandler = (deleteID, address) => {
    setMessage("Sorry the delete function has been disabled for now.")
    setShowPopup(true)
  }

  // =============== Subjects Section ===============
  const subjectColumns = [
    { id: 'name', label: 'Subject Name', minWidth: 170 },
    { id: 'code', label: 'Subject Code', minWidth: 100 },
  ]

  const subjectRows = subjectsList?.map((subject) => ({
    name: subject.subName,
    code: subject.subCode,
    id: subject._id,
  })) || []

  const SubjectsButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => deleteHandler(row.id, "Subject")}>
        <DeleteIcon color="error" />
      </IconButton>
      <BlueButton
        variant="contained"
        onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}
      >
        View
      </BlueButton >
    </>
  );

  const subjectActions = [
    {
      icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
      action: () => navigate("/Admin/addsubject/" + classID)
    },
    {
      icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
      action: () => deleteHandler(classID, "SubjectsClass")
    }
  ];

  const ClassSubjectsSection = () => (
    <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        {response ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GreenButton
              variant="contained"
              onClick={() => navigate("/Admin/addsubject/" + classID)}
            >
              Add Subjects
            </GreenButton>
          </Box>
        ) : (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Subjects List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
            <SpeedDialTemplate actions={subjectActions} />
          </>
        )}
      </CardContent>
    </Card>
  );

  // =============== Students Section ===============
  const studentColumns = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
  ]

  const studentRows = sclassStudents.map((student) => ({
    name: student.name,
    rollNum: student.rollNum,
    id: student._id,
  }))

  const StudentsButtonHaver = ({ row }) => (
    <>
      <IconButton onClick={() => deleteHandler(row.id, "Student")}>
        <PersonRemoveIcon color="error" />
      </IconButton>
      <BlueButton
        variant="contained"
        onClick={() => navigate("/Admin/students/student/" + row.id)}
      >
        View
      </BlueButton>
     
    </>
  );

  const studentActions = [
    {
      icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student',
      action: () => navigate("/Admin/class/addstudents/" + classID)
    },
    {
      icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students',
      action: () => deleteHandler(classID, "StudentsClass")
    },
  ];

  const ClassStudentsSection = () => (
    <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        {getresponse ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GreenButton
              variant="contained"
              onClick={() => navigate("/Admin/class/addstudents/" + classID)}
            >
              Add Students
            </GreenButton>
          </Box>
        ) : (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Students List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
            <SpeedDialTemplate actions={studentActions} />
          </>
        )}
      </CardContent>
    </Card>
  );

  // =============== Teachers Section ===============
  const ClassTeachersSection = () => {
    const teachers = sclassDetails?.teachers || []

    const teacherColumns = [
      { id: 'name', label: 'Name', minWidth: 170 },
      { id: 'email', label: 'Email', minWidth: 200 },
    ]

    const teacherRows = teachers.map((teacher) => ({
      name: teacher.name,
      email: teacher.email,
      id: teacher._id,
    }))

    const TeachersButtonHaver = ({ row }) => (
      <BlueButton
        variant="contained"
        onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
      >
        View
      </BlueButton>
    )

    return (
      <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Teachers List
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableTemplate buttonHaver={TeachersButtonHaver} columns={teacherColumns} rows={teacherRows} />
        </CardContent>
      </Card>
    )
  }

  // =============== Class Details Section ===============
  const ClassDetailsSection = () => {
    const numberOfSubjects = subjectsList.length;
    const numberOfStudents = sclassStudents.length;
    const numberOfTeachers = sclassDetails?.teachers ? sclassDetails.teachers.length : 0;

    return (
      <Card sx={{ p: 3, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Class Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Class: {sclassDetails?.sclassName}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Subjects: {numberOfSubjects}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Students: {numberOfStudents}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Teachers: {numberOfTeachers}</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            {getresponse &&
              <GreenButton
                variant="contained"
                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
              >
                Add Students
              </GreenButton>
            }
            {response &&
              <GreenButton
                variant="contained"
                onClick={() => navigate("/Admin/addsubject/" + classID)}
              >
                Add Subjects
              </GreenButton>
            }
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', position: 'sticky', top: 64, zIndex: 100 }}>
              <TabList onChange={handleChange} sx={{ px: 2 }}>
                <Tab label="Details" value="1" />
                <Tab label="Subjects" value="2" />
                <Tab label="Students" value="3" />
                <Tab label="Teachers" value="4" />
              </TabList>
            </Box>
            <Container sx={{ mt: 4, mb: 6 }}>
              <TabPanel value="1"><ClassDetailsSection /></TabPanel>
              <TabPanel value="2"><ClassSubjectsSection /></TabPanel>
              <TabPanel value="3"><ClassStudentsSection /></TabPanel>
              <TabPanel value="4"><ClassTeachersSection /></TabPanel>
            </Container>
          </TabContext>
        </Box>
      )}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ClassDetails;
