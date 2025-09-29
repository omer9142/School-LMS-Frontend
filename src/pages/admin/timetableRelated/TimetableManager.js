import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getAllSclasses } from "../../../redux/sclassRelated/sclassHandle";
import axios from "axios";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
    "Period 1",
    "Period 2",
    "Period 3",
    "Period 4",
    "Period 5",
    "Period 6",
    "Period 7",
    "Period 8",
];

const TimetableManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { sclassesList, loading: classesLoading } = useSelector(
        (state) => state.sclass
    );
    const { currentUser } = useSelector((state) => state.user);

    const [selectedClass, setSelectedClass] = useState("");
    const [timetable, setTimetable] = useState([]);
    const [loadingTimetable, setLoadingTimetable] = useState(false);

    // Fetch classes when component mounts
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllSclasses(currentUser._id, "sclass"));
        }
    }, [dispatch, currentUser]);

    // Fetch timetable when a class is selected
    useEffect(() => {
        if (!selectedClass) return;

        const fetchTimetable = async () => {
            setLoadingTimetable(true);
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/timetable/class/${selectedClass}`
                );
                console.log("Fetched timetable data:", res.data); // Debug log
                setTimetable(res.data);
            } catch (err) {
                console.error("Error fetching timetable:", err);
                setTimetable([]);
            }
            setLoadingTimetable(false);
        };

        fetchTimetable();
    }, [selectedClass]);

    // ✅ Use the subjectName field returned from backend
    const getCellData = (day, periodIndex) => {
        const entry = timetable.find(
            (t) => t.day === day && t.periodNumber === periodIndex + 1
        );
        
        if (!entry) return "-";

        const subjectName = entry.subjectName || "Unknown Subject";
        return subjectName;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Class Timetable
            </Typography>

            <Button
                variant="contained"
                color="primary"
                sx={{ mb: 2 }}
                onClick={() => navigate("/timetable/create")}
            >
                Create Timetable
            </Button>

            {/* Class Selector */}
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Class</InputLabel>
                <Select
                    value={selectedClass}
                    label="Select Class"
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    {sclassesList &&
                        sclassesList.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>
                                {cls.sclassName}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            {classesLoading || loadingTimetable ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Day</TableCell>
                                {periods.map((period, index) => (
                                    <TableCell key={index} align="center">
                                        {period}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {days.map((day, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    <TableCell>{day}</TableCell>
                                    {periods.map((_, colIndex) => (
                                        <TableCell key={colIndex} align="center">
                                            {getCellData(day, colIndex)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default TimetableManager;