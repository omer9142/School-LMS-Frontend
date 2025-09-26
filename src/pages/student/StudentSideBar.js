import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';

const StudentSideBar = ({ open }) => {
    const location = useLocation();
    
    const sidebarStyles = {
        backgroundColor: "black",
        color: "white",
        "&:hover": {
            backgroundColor: "#333"
        }
    };

    const iconStyles = {
        color: "white"
    };

    return (
        <>
            <React.Fragment>
                <ListItemButton
                    component={Link}
                    to="/"
                    sx={sidebarStyles}
                >
                    <ListItemIcon sx={iconStyles}>
                        <HomeIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Home" />}
                </ListItemButton>

                <ListItemButton 
                    component={Link} 
                    to="/Student/subjects"
                    sx={sidebarStyles}
                >
                    <ListItemIcon sx={iconStyles}>
                        <AssignmentIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Class" />}
                </ListItemButton>

                <ListItemButton 
                    component={Link} 
                    to="/Student/attendance"
                    sx={sidebarStyles}
                >
                    <ListItemIcon sx={iconStyles}>
                        <ClassOutlinedIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Attendance" />}
                </ListItemButton>

                 <ListItemButton 
                    component={Link} 
                    to="/Student/timetable"
                    sx={sidebarStyles}
                >
                    <ListItemIcon sx={iconStyles}>
                        <ScheduleIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Timetable" />}
                </ListItemButton>

                <ListItemButton 
                    component={Link} 
                    to="/Student/complain"
                    sx={sidebarStyles}
                >
                    <ListItemIcon sx={iconStyles}>
                        <AnnouncementOutlinedIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Complain" />}
                </ListItemButton>
            </React.Fragment>
            
            <Divider sx={{ backgroundColor: '#333', my: 1 }} />
            
            <React.Fragment>
                {open && (
                    <ListSubheader 
                        component="div" 
                        inset
                        sx={{ 
                            backgroundColor: 'black', 
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        User
                    </ListSubheader>
                )}
                
                <ListItemButton 
                    component={Link} 
                    to="/Student/profile"
                    sx={sidebarStyles}
                >
                    <ListItemIcon sx={iconStyles}>
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Profile" />}
                </ListItemButton>
                
                <ListItemButton 
                    component={Link} 
                    to="/logout"
                    sx={sidebarStyles}
                >
                    <ListItemIcon sx={iconStyles}>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Logout" />}
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default StudentSideBar