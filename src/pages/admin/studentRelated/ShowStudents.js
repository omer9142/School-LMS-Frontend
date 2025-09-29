import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents, removeStuff } from '../../../redux/studentRelated/studentHandle';

import {
    Paper, Box, IconButton, TextField, Typography
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import SearchIcon from '@mui/icons-material/Search';

import * as React from 'react';
import Popup from '../../../components/Popup';

// Add the student ID formatting function
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

const ShowStudents = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(getAllStudents());
    }, [dispatch]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const deleteHandler = (deleteID, address) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            dispatch(removeStuff(deleteID, address))
                .then(() => {
                    dispatch(getAllStudents()); // refresh the list
                })
                .catch(err => {
                    console.error(err);
                    setMessage("Failed to delete student.");
                    setShowPopup(true);
                });
        }
    };

    // Filter students based on search term
    const filteredStudents = Array.isArray(studentsList)
        ? studentsList.filter(student => 
            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNum?.toString().includes(searchTerm) ||
            student?.sclassName?.sclassName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getDisplayStudentId(student)?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
        { id: 'studentId', label: 'Student ID', minWidth: 120 }, // Added Student ID column
    ];

    const studentRows = filteredStudents.map((student) => ({
        name: student.name,
        rollNum: student.rollNum,
        sclassName: student?.sclassName?.sclassName ?? "Not Assigned",
        studentId: getDisplayStudentId(student), // Added Student ID
        id: student._id,
    }));

    // ✅ Only View + Delete now
    const StudentButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Student")}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    type="button"
                    onClick={() => navigate(`student/${row.id}`)}
                >
                    View
                </BlueButton>
            </>
        );
    };

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students',
            action: () => deleteHandler(currentUser._id, "Students")
        },
    ];

    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <>
                    {response ?
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/addstudents")}>
                                Add Students
                            </GreenButton>
                        </Box>
                        :
                        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
                            {/* Search Bar */}
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by name, roll number, class, or student ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {filteredStudents.length} student(s) found
                                    {searchTerm && ` for "${searchTerm}"`}
                                </Typography>
                            </Box>

                            {filteredStudents.length > 0 ?
                                <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
                                :
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                                    </Typography>
                                    {searchTerm && (
                                        <GreenButton 
                                            variant="contained" 
                                            onClick={() => setSearchTerm("")}
                                            sx={{ mt: 2 }}
                                        >
                                            Clear Search
                                        </GreenButton>
                                    )}
                                </Box>
                            }
                            <SpeedDialTemplate actions={actions} />
                        </Paper>
                    }
                </>
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowStudents;