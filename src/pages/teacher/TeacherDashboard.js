import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TeacherSideBar from './TeacherSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import Logout from '../Logout'
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import StudentAttendance from '../admin/studentRelated/StudentAttendance';

import TeacherClassDetails from './TeacherClassDetails';
import TeacherComplain from './TeacherComplain';
import TeacherHomePage from './TeacherHomePage';
import TeacherProfile from './TeacherProfile';
import TeacherViewStudent from './TeacherViewStudent';
import StudentExamMarks from '../admin/studentRelated/StudentExamMarks';
import TeacherSubjects from './TeacherSubjects';
import TeacherTimeTable from './TeacherTimetable';
import MarksPage from './MarksPage';

// ✅ Import new attendance page (to be created)
import ClassAttendance from './ClassAttendance';

import { useSelector } from 'react-redux';

const TeacherDashboard = () => {
    const [open, setOpen] = useState(true);
    const { currentUser } = useSelector((state) => state.user);

    // ✅ check if logged-in teacher is a class teacher
    const isClassTeacher = Boolean(currentUser?.classTeacherOf);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar 
                    open={open} 
                    position='absolute'
                    sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)'
                    }}
                >
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                                color: 'black'
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ 
                                flexGrow: 1,
                                color: 'black',
                                fontWeight: 'bold'
                            }}
                        >
                            Teacher Dashboard
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    open={open}
                    sx={open ? styles.drawerStyled : styles.hideDrawer}
                >
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton 
                            onClick={toggleDrawer}
                            sx={styles.toggleButton}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List 
                        component="nav"
                        sx={{ 
                            backgroundColor: 'black',
                            height: '100%',
                            padding: 0
                        }}
                    >
                        <TeacherSideBar open={open} />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<TeacherHomePage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                        <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />
                        <Route path="/Teacher/profile" element={<TeacherProfile />} />
                        <Route path="/Teacher/complain" element={<TeacherComplain />} />
                        <Route path="/Teacher/class" element={<TeacherClassDetails />} />
                        <Route path="/Teacher/subjects" element={<TeacherSubjects />} />
                        <Route path="/Teacher/class/student/:id" element={<TeacherViewStudent />} />

                        {/* ✅ Existing subject-specific attendance/marks */}
                        <Route path="/Teacher/class/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Teacher/class/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* ✅ Only class teacher gets access to whole-class attendance */}
                        {isClassTeacher && (
                            <Route path="/Teacher/attendance" element={<ClassAttendance />} />
                        )}

                         <Route path="/Teacher/timetable" element={<TeacherTimeTable />} />
                         <Route path="/Teacher/marks" element={<MarksPage />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
};

export default TeacherDashboard;

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
        backgroundColor: 'black',
        color: 'white'
    },
    toggleButton: {
        color: 'white',
        '&:hover': {
            backgroundColor: '#333',
            color: 'white'
        }
    },
    drawerStyled: {
        display: "flex",
        '& .MuiDrawer-paper': {
            backgroundColor: 'black'
        }
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
        '& .MuiDrawer-paper': {
            backgroundColor: 'black'
        }
    },
};