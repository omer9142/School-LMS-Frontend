import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import {
  getClassDetails,
  getClassStudents,
  getSubjectList,
  removeStudentFromClass,
  getUnassignedStudents,
  assignStudentToClass,
  deleteSubject,
  deleteAllSubjects,
  removeAllStudentsFromClass,
} from "../../../redux/sclassRelated/sclassHandle";
import {
  Box, Container, Typography, Tab, IconButton, Card,
  CardContent, Grid, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem,
  ListItemText, Checkbox, ListItemIcon, Button,
  TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { BlueButton, GreenButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';
import SearchIcon from '@mui/icons-material/Search';

// Add the student ID formatting function from ViewStudent
const getDisplayStudentId = (student) => {
  const explicit =
    student?.studentId ||
    student?.studentID ||
    student?.student_id ||
    student?.registrationId ||
    student?.admissionId ||
    student?.sid;
  if (explicit) return explicit;

  // fallback to short form from Mongo _id
  const id = student?._id;
  if (!id) return 'N/A';
  const lastSix = String(id).slice(-6);
  return `STU-${lastSix}`;
};

const ClassDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    subjectsList,
    sclassStudents,
    sclassDetails,
    loading,
    error,
    response,
    getresponse,
    unassignedStudents
  } = useSelector((state) => state.sclass);

  const classID = params.id;
  const schoolID = sclassDetails?.school?._id;

  useEffect(() => {
    dispatch(getClassDetails(classID, "Sclass"));
    dispatch(getSubjectList(classID, "ClassSubjects"));
    dispatch(getClassStudents(classID));
  }, [dispatch, classID]);

  if (error) console.log(error);

  const [value, setValue] = useState('1');
  const handleChange = (event, newValue) => setValue(newValue);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

 

  // =============== Unassigned Students Modal ===============
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const openModal = () => {
    if (schoolID) {
      dispatch(getUnassignedStudents(schoolID));
    }
    setSelectedStudents([]);
    setSearchTerm("");
    setOpenAssignModal(true);
  };
  
  const closeModal = () => {
    setOpenAssignModal(false);
    setSelectedStudents([]);
    setSearchTerm("");
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignSelected = async () => {
    if (selectedStudents.length === 0) {
      setMessage("Please select at least one student to assign.");
      setShowPopup(true);
      return;
    }

    try {
      for (const studentId of selectedStudents) {
        await dispatch(assignStudentToClass(classID, studentId));
      }
      
      dispatch(getClassStudents(classID));
      if (schoolID) {
        dispatch(getUnassignedStudents(schoolID));
      }
      
      setMessage(`Successfully assigned ${selectedStudents.length} student(s) to the class.`);
      setShowPopup(true);
      closeModal();
    } catch (error) {
      setMessage("Error assigning students. Please try again.");
      setShowPopup(true);
    }
  };

  // Filter unassigned students based on search term
  const filteredUnassignedStudents = unassignedStudents?.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNum?.toString().includes(searchTerm) ||
    getDisplayStudentId(student)?.toLowerCase().includes(searchTerm.toLowerCase()) // Updated to use formatted student ID
  ) || [];

  // =============== Subjects Section ===============
  const subjectColumns = [
    { id: 'name', label: 'Subject Name', minWidth: 170 },
    { id: 'code', label: 'Subject Code', minWidth: 100 },
  ];

  const subjectRows = subjectsList?.map((subject) => ({
    name: subject.subName,
    code: subject.subCode,
    id: subject._id,
  })) || [];

const SubjectsButtonHaver = ({ row }) => (
  <>
    <IconButton
      onClick={async () => {
        await dispatch(deleteSubject(row.id, "Subject")); // ✅ hit backend
        dispatch(getSubjectList(classID, "ClassSubjects")); // refresh list
      }}
    >
      <DeleteIcon color="error" />
    </IconButton>
    <BlueButton
      variant="contained"
      onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}
    >
      View
    </BlueButton>
  </>
);


  const subjectActions = [
    {
      icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
      action: () => navigate("/Admin/addsubject/" + classID)
    },
    {
      icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
      action: async () => {
  await dispatch(deleteAllSubjects(classID));
  dispatch(getSubjectList(classID, "ClassSubjects"));
}
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
  ];

  const studentRows = sclassStudents.map((student) => ({
    name: student.name,
    rollNum: student.rollNum,
    id: student._id,
  }));

  const StudentsButtonHaver = ({ row }) => (
    <>
      <IconButton 
        onClick={async () => {
          await dispatch(removeStudentFromClass(classID, row.id));
          dispatch(getClassStudents(classID));
          if (schoolID) {
            dispatch(getUnassignedStudents(schoolID));
          }
        }}
      >
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
    icon: <PersonAddAlt1Icon color="primary" />, 
    name: 'Add Students',
    action: openModal
  },
  {
    icon: <PersonRemoveIcon color="error" />,
    name: 'Remove All Students',
    action: async () => {
      try {
        // Show confirmation dialog (optional)
        const confirm = window.confirm('Are you sure you want to remove all students from this class? This action cannot be undone.');
        if (!confirm) return;

        console.log('Removing all students from class:', classID);
        
        const result = await dispatch(removeAllStudentsFromClass(classID));
        
        if (result.success) {
          setMessage("All students removed from class successfully");
          setShowPopup(true);
          
          // Refresh data
          dispatch(getClassStudents(classID));
          if (schoolID) {
            dispatch(getUnassignedStudents(schoolID));
          }
        } else {
          setMessage(result.error || "Failed to remove students");
          setShowPopup(true);
        }
        
      } catch (error) {
        console.error('Remove all students error:', error);
        setMessage("Error removing students. Please try again.");
        setShowPopup(true);
      }
    }
  },
];

  const ClassStudentsSection = () => (
    <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        {getresponse ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GreenButton
              variant="contained"
              onClick={openModal}
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
    const teachers = sclassDetails?.teachers || [];
    const teacherColumns = [
      { id: 'name', label: 'Name', minWidth: 170 },
      { id: 'email', label: 'Email', minWidth: 200 },
    ];
    const teacherRows = teachers.map((teacher) => ({
      name: teacher.name,
      email: teacher.email,
      id: teacher._id,
    }));
    const TeachersButtonHaver = ({ row }) => (
      <BlueButton
        variant="contained"
        onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
      >
        View
      </BlueButton>
    );
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
    );
  };

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
                onClick={openModal}
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
  };

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

      {/* Modal for selecting unassigned students */}
      <Dialog open={openAssignModal} onClose={closeModal} fullWidth maxWidth="lg">
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Select Students to Assign to Class
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '500px' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading unassigned students...</Typography>
            </Box>
          ) : (!unassignedStudents || unassignedStudents.length === 0) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography color="text.secondary">
                No unassigned students found.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Search Bar */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by name, father's name, roll number, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {filteredUnassignedStudents.length} student(s) found
                </Typography>
              </Box>

              {/* Students Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedStudents.length > 0 && 
                            selectedStudents.length < filteredUnassignedStudents.length
                          }
                          checked={
                            filteredUnassignedStudents.length > 0 && 
                            selectedStudents.length === filteredUnassignedStudents.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(filteredUnassignedStudents.map(student => student._id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>NAME</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>FATHER'S NAME</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ROLL NUMBER</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>STUDENT ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUnassignedStudents.map((student) => (
                      <TableRow
                        key={student._id}
                        hover
                        onClick={() => handleStudentToggle(student._id)}
                        sx={{
                          cursor: 'pointer',
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: selectedStudents.includes(student._id) ? '#e3f2fd' : 'inherit'
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleStudentToggle(student._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {student.name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.fatherName || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.rollNum || 'Not assigned'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {getDisplayStudentId(student)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedStudents.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e8', borderRadius: 1, border: '1px solid #c8e6c9' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                    {selectedStudents.length} student(s) selected for assignment
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeModal} color="inherit" variant="outlined">
            Cancel
          </Button>
          <GreenButton
            onClick={handleAssignSelected}
            disabled={selectedStudents.length === 0 || loading}
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
          >
            Assign Selected ({selectedStudents.length})
          </GreenButton>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ClassDetails;