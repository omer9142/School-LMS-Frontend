import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { Dialog, DialogTitle, List, ListItemButton, ListItemText, TextField, InputAdornment } from '@mui/material';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, TablePagination, Button, Box, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowTeachers = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [classPicker, setClassPicker] = useState({ open: false, teacherId: null, classIds: [], classNames: [] });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        console.error(error);
    }

    const openClassPicker = (row) => {
        if (!row.teachSclassID.length) return;
        if (row.teachSclassID.length === 1) {
            navigate(`/Admin/teachers/choosesubject/${row.teachSclassID[0]}/${row.id}`);
        } else {
            setClassPicker({
                open: true,
                teacherId: row.id,
                classIds: row.teachSclassID,
                classNames: row.teachSclassNames,
            });
        }
    };
    const closeClassPicker = () => setClassPicker(s => ({ ...s, open: false }));

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address)).then(() => {
            dispatch(getAllTeachers(currentUser._id)); // refresh table
        });
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubject', label: 'Subject', minWidth: 100 },
        { id: 'teachSclass', label: 'Class', minWidth: 170 },
    ];

    const rows = teachersList.map((teacher) => {
        const classObjs = teacher.teachSclass || [];
        const subjectObjs = teacher.teachSubject || [];

        return {
            name: teacher.name,
            teachSubject: Array.isArray(subjectObjs)
                ? subjectObjs.map(s => s?.subName).filter(Boolean).join(", ")
                : subjectObjs?.subName || "No subject assigned",
            teachSclass: classObjs.length ? classObjs.map(cls => cls.sclassName).join(", ") : "No class assigned",
            teachSclassID: classObjs.map(cls => cls._id) || [],
            teachSclassNames: classObjs.map(cls => cls.sclassName) || [],
            id: teacher._id,
        };
    });

    // 🔍 Filter rows according to search term
    const filteredRows = rows.filter(row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.teachSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.teachSclass.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const actions = [
        {
            icon: <PersonRemoveIcon color="error" />,
            name: 'Delete All Teachers',
            action: () => deleteHandler(currentUser._id, "Teachers")
        },
        {
            name: 'Add Teacher',
            action: () => navigate("/Admin/teachers/chooseclass", { state: { situation: "Teacher" } })
        }
    ];

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', p:2 }}>
            {/* 🔍 Search Filter */}
            <Box sx={{ mb:2, display:'flex', justifyContent:'flex-start' }}>
                <TextField
                    size="large"
                    variant="outlined"
                    placeholder="Search by name, subject or class..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0);
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                     sx={{ width: '350px' }}
                />
            </Box>

            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                                <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        if (column.id === 'teachSubject') {
                                            return (
                                                <StyledTableCell key={column.id} align={column.align}>
                                                    {value && value !== "No subject assigned" ? (
                                                        value
                                                    ) : (
                                                        <Button variant="contained"
                                                            onClick={() => openClassPicker(row)}>
                                                            Add Subject
                                                        </Button>
                                                    )}
                                                </StyledTableCell>
                                            );
                                        }
                                        return (
                                            <StyledTableCell key={column.id} align={column.align}>
                                                {value}
                                            </StyledTableCell>
                                        );
                                    })}
                                    <StyledTableCell align="center">
                                        <IconButton onClick={() => deleteHandler(row.id, "Teacher")}>
                                            <PersonRemoveIcon color="error" />
                                        </IconButton>
                                        <BlueButton variant="contained"
                                            onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}>
                                            View
                                        </BlueButton>
                                        <GreenButton variant="contained"
                                            onClick={() =>
                                                navigate("/Admin/teachers/chooseclass", {
                                                    state: { situation: "Teacher", teacherId: row.id }
                                                })
                                            }>
                                            Assign Class
                                        </GreenButton>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={filteredRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                }}
            />

            <SpeedDialTemplate actions={actions} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

            {/* Dialog for multiple class selection */}
            <Dialog open={classPicker.open} onClose={closeClassPicker}>
                <DialogTitle>Select a class</DialogTitle>
                <List>
                    {classPicker.classIds.map((cid, idx) => (
                        <ListItemButton
                            key={cid}
                            onClick={() => {
                                closeClassPicker();
                                navigate(`/Admin/teachers/choosesubject/${cid}/${classPicker.teacherId}`);
                            }}
                        >
                            <ListItemText primary={classPicker.classNames[idx]} />
                        </ListItemButton>
                    ))}
                </List>
            </Dialog>
        </Paper>
    );
};

export default ShowTeachers;
