import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StudentSideBar from './StudentSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentSubjects from './StudentSubjects';
import ViewStdAttendance from './ViewStdAttendance';
import StudentComplain from './StudentComplain';
import StudentMarks from './StudentMarks';
import Logout from '../Logout'
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import StudentTimeTable from './StudentTimeTable';
import StudentMarksPage from './StudentMarks';


const StudentDashboard = () => {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex', borderRadius: '10px', overflow: 'hidden' }}>
                <CssBaseline />
                <AppBar open={open} position='fixed' sx={{ 
                    backgroundColor: '#F5F4F9',
                    color: 'black',
                    zIndex: 1200,
                    marginLeft: open ? '240px' : '60px',
                    width: open ? 'calc(100% - 240px)' : 'calc(100% - 60px)',
                    transition: 'margin-left 0.3s, width 0.3s',
                }}>
                    <Toolbar sx={{ pr: '24px' }}>
                        <Box sx={{ flexGrow: 1 }} />
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton 
                            onClick={toggleDrawer} 
                            sx={{ 
                                color: 'white',
                                display: 'block'
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider sx={{ backgroundColor: '#333' }} />
                    <List component="nav">
                        <StudentSideBar open={open} />
                    </List>
                </Drawer>
                <Box component="main" sx={{
                    ...styles.boxStyled,
                    marginLeft: open ? '240px' : '60px',
                    width: open ? 'calc(100% - 240px)' : 'calc(100% - 60px)',
                    transition: 'margin-left 0.3s, width 0.3s',
                }}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<StudentHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Student/dashboard" element={<StudentHomePage />} />
                        <Route path="/Student/profile" element={<StudentProfile />} />

                        <Route path="/Student/subjects" element={<StudentSubjects />} />
                        <Route path="/Student/attendance" element={<ViewStdAttendance />} />
                        <Route path="/Student/complain" element={<StudentComplain />} />

                        <Route path="/Student/timetable" element={<StudentTimeTable />} />
                        <Route path="/Student/Marks" element={<StudentMarksPage />} />


                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default StudentDashboard

const styles = {
    boxStyled: {
        backgroundColor: '#ffffff',
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        paddingTop: '64px', // Add padding for AppBar height
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        px: [1],
        backgroundColor: 'black',
    },
    drawerStyled: {
        display: "flex",
        '& .MuiDrawer-paper': {
            backgroundColor: 'black',
            color: 'white',
            position: 'fixed',
            whiteSpace: 'nowrap',
            width: 240,
            transition: 'width 0.3s',
            zIndex: 1300,
            height: '100vh',
            top: 0,
            left: 0,
        },
    },
    hideDrawer: {
        display: 'flex',
        '& .MuiDrawer-paper': {
            backgroundColor: 'black',
            color: 'white',
            position: 'fixed',
            whiteSpace: 'nowrap',
            width: 80,
            transition: 'width 0.3s',
            overflowX: 'hidden',
            zIndex: 1300,
            height: '100vh',
            top: 0,
            left: 0,
        },
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}