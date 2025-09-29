import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import {deleteSubject} from '../../../redux/sclassRelated/sclassHandle'
import PostAddIcon from '@mui/icons-material/PostAdd';
import {
    Paper, Box, IconButton, TextField, Typography
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import SearchIcon from '@mui/icons-material/Search';

const ShowSubjects = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

   const deleteHandler = (deleteID, address) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
        dispatch(deleteSubject(deleteID, address))
            .then(() => {
                dispatch(getSubjectList(currentUser._id, "AllSubjects")); // refresh subject list
            })
            .catch((err) => {
                console.error(err);
                setMessage("Failed to delete subject.");
                setShowPopup(true);
            });
    }
};

    // Filter subjects based on search term
    const filteredSubjects = Array.isArray(subjectsList) 
        ? subjectsList.filter(subject => 
            subject?.subName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject?.sclassName?.sclassName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject?.sessions?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    const subjectColumns = [
        { id: 'subName', label: 'Subject Name', minWidth: 170 },
        { id: 'sessions', label: 'Sessions', minWidth: 170 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ]

    const subjectRows = filteredSubjects.map((subject) => {
        return {
            subName: subject?.subName || "N/A",
            sessions: subject?.sessions || "N/A",
            sclassName: subject?.sclassName?.sclassName || "Unassigned",
            sclassID: subject?.sclassName?._id || "N/A",
            id: subject?._id || "N/A",
        };
    });


    const SubjectsButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Subject")}>
                    <DeleteIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                >
                    View
                </BlueButton>

            </>
        );
    };

    const actions = [
        {
            icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
            action: () => navigate("/Admin/subjects/chooseclass")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
            action: () => deleteHandler(currentUser._id, "Subjects")
        }
    ];

    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <>
                    {response ?
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained"
                                onClick={() => navigate("/Admin/subjects/chooseclass")}>
                                Add Subjects
                            </GreenButton>
                        </Box>
                        :
                        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
                            {/* Search Bar */}
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by subject name, class name, or sessions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {filteredSubjects.length} subject(s) found
                                    {searchTerm && ` for "${searchTerm}"`}
                                </Typography>
                            </Box>

                            {filteredSubjects.length > 0 ?
                                <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                                :
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {searchTerm ? 'No subjects found matching your search.' : 'No subjects found.'}
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

export default ShowSubjects;