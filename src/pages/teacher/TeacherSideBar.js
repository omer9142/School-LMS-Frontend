import * as React from 'react';
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useSelector } from 'react-redux';

const TeacherSideBar = ({ open }) => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  // ✅ Check if user is class teacher
  const isClassTeacher = Boolean(currentUser?.classTeacherOf);

  const sidebarStyles = {
    backgroundColor: "black",
    color: "white",
    "&:hover": {
      backgroundColor: "#333"
    },
    border: 'none'
  };

  const iconStyles = {
    color: "white"
  };

  const listItemTextStyles = {
    '& .MuiTypography-root': {
      color: 'white'
    }
  };

  return (
    <div style={{ backgroundColor: 'black', height: '100%' }}>
      <React.Fragment>
        <ListItemButton
          component={Link}
          to="/"
          sx={sidebarStyles}
        >
          <ListItemIcon sx={iconStyles}>
            <HomeIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Home" sx={listItemTextStyles} />}
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/Teacher/class"
          sx={sidebarStyles}
        >
          <ListItemIcon sx={iconStyles}>
            <ClassOutlinedIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Classes" sx={listItemTextStyles} />}
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/Teacher/subjects"
          sx={sidebarStyles}
        >
          <ListItemIcon sx={iconStyles}>
            <ClassOutlinedIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Subjects" sx={listItemTextStyles} />}
        </ListItemButton>



        <ListItemButton
          component={Link}
          to="/Teacher/timetable"
          sx={sidebarStyles}
        >
          <ListItemIcon sx={iconStyles}>
            <ScheduleIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Timetable" sx={listItemTextStyles} />}
        </ListItemButton>

        {/* ✅ Attendance only for class teachers */}
        {isClassTeacher && (
          <ListItemButton
            component={Link}
            to="/Teacher/attendance"
            sx={sidebarStyles}
          >
            <ListItemIcon sx={iconStyles}>
              <CheckCircleOutlineIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Attendance" sx={listItemTextStyles} />}
          </ListItemButton>
        )}

        <ListItemButton
          component={Link}
          to="/Teacher/marks"
          sx={sidebarStyles}
        >
          <ListItemIcon sx={iconStyles}>
            <CheckCircleOutlineIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Marks" sx={listItemTextStyles} />}
        </ListItemButton>
      </React.Fragment>



      <Divider sx={{ backgroundColor: '#333', my: 1 }} />

      <React.Fragment>
        {open && (
          <ListSubheader
            component="div"
            sx={{
              backgroundColor: 'black',
              color: 'white',
              fontWeight: 'bold',
              lineHeight: '36px'
            }}
          >
            Teacher
          </ListSubheader>
        )}

        <ListItemButton
          component={Link}
          to="/Teacher/profile"
          sx={sidebarStyles}
        >
          <ListItemIcon sx={iconStyles}>
            <AccountCircleOutlinedIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Profile" sx={listItemTextStyles} />}
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/logout"
          sx={sidebarStyles}
        >
          <ListItemIcon sx={iconStyles}>
            <ExitToAppIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Logout" sx={listItemTextStyles} />}
        </ListItemButton>
      </React.Fragment>
    </div>
  );
};

export default TeacherSideBar;