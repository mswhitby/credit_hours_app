window.searchByID = function searchByID(id) {
    const mockStudents = {
        "12345": {
            id: "12345",
            name: "Aaliyah Roberson",
            grade: "11",
            missedHours: 8,
            madeUpHours: 5,
            requiredCredits: 26,
            currentCredits: 23,
            attendanceHistory: [
                { date: "2025-04-15", type: "Absence", hours: 2, status: "Missed" },
                { date: "2025-04-20", type: "Makeup", hours: 1, status: "Completed", activity: "After School Tutoring" },
                { date: "2025-04-25", type: "Absence", hours: 1, status: "Missed" },
                { date: "2025-04-27", type: "Makeup", hours: 2, status: "Completed", activity: "Saturday School" },
                { date: "2025-04-30", type: "Absence", hours: 3, status: "Missed" }
            ]
        },
        "67890": {
            id: "67890",
            name: "Xander Fields",
            grade: "12",
            missedHours: 6,
            madeUpHours: 6,
            requiredCredits: 26,
            currentCredits: 26,
            attendanceHistory: [
                { date: "2025-04-10", type: "Absence", hours: 3, status: "Missed" },
                { date: "2025-04-15", type: "Makeup", hours: 3, status: "Completed", activity: "Evening Study Hall" },
                { date: "2025-04-20", type: "Absence", hours: 3, status: "Missed" },
                { date: "2025-04-21", type: "Makeup", hours: 3, status: "Completed", activity: "Saturday School" }
            ]
        }
    };

    return mockStudents[id] || null;
}