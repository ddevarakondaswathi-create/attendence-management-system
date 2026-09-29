// Get data from localStorage
let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

// Set today's date
const dateInput = document.getElementById("attendanceDate");

const today = new Date();
const todayString = today.toISOString().split("T")[0];

dateInput.value = todayString;

// Change date
dateInput.addEventListener("change", function () {
    displayStudents();
    updateDashboard();
});

// Add student
function addStudent() {

    const name = document.getElementById("studentName").value.trim();
    const roll = document.getElementById("studentRoll").value.trim();

    if (name === "" || roll === "") {
        alert("Please enter student name and roll number.");
        return;
    }

    // Check duplicate roll number
    const existingStudent = students.find(
        student => student.roll.toLowerCase() === roll.toLowerCase()
    );

    if (existingStudent) {
        alert("A student with this roll number already exists.");
        return;
    }

    const student = {
        id: Date.now(),
        name: name,
        roll: roll
    };

    students.push(student);

    saveData();

    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";

    displayStudents();
    updateDashboard();

    alert("Student added successfully!");
}


// Display students
function displayStudents() {

    const table = document.getElementById("studentTable");
    const search = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const selectedDate = dateInput.value;

    table.innerHTML = "";

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(search) ||
        student.roll.toLowerCase().includes(search)
    );

    if (filteredStudents.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No students found.</td>
            </tr>
        `;
        return;
    }

    filteredStudents.forEach((student, index) => {

        let status = "Not Marked";

        if (
            attendance[selectedDate] &&
            attendance[selectedDate][student.id]
        ) {
            status = attendance[selectedDate][student.id];
        }

        let statusClass = "status-not-marked";

        if (status === "Present") {
            statusClass = "status-present";
        } else if (status === "Absent") {
            statusClass = "status-absent";
        }

        table.innerHTML += `
            <tr>
                <td>${index + 1}</td>

                <td>${student.roll}</td>

                <td>${student.name}</td>

                <td class="${statusClass}">
                    ${status}
                </td>

                <td>
                    <button
                        class="present-btn"
                        onclick="markAttendance(${student.id}, 'Present')">
                        Present
                    </button>

                    <button
                        class="absent-btn"
                        onclick="markAttendance(${student.id}, 'Absent')">
                        Absent
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteStudent(${student.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}


// Mark attendance
function markAttendance(studentId, status) {

    const selectedDate = dateInput.value;

    if (!selectedDate) {
        alert("Please select a date.");
        return;
    }

    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }

    attendance[selectedDate][studentId] = status;

    saveData();

    displayStudents();
    updateDashboard();
    displayHistory();
}


// Delete student
function deleteStudent(studentId) {

    const student = students.find(
        student => student.id === studentId
    );

    if (!student) {
        return;
    }

    const confirmation = confirm(
        `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmation) {
        return;
    }

    students = students.filter(
        student => student.id !== studentId
    );

    // Remove student's attendance records
    Object.keys(attendance).forEach(date => {

        if (attendance[date][studentId]) {
            delete attendance[date][studentId];
        }

    });

    saveData();

    displayStudents();
    updateDashboard();
    displayHistory();
}


// Update dashboard
function updateDashboard() {

    const selectedDate = dateInput.value;

    const total = students.length;

    let present = 0;
    let absent = 0;

    if (attendance[selectedDate]) {

        students.forEach(student => {

            const status =
                attendance[selectedDate][student.id];

            if (status === "Present") {
                present++;
            }

            if (status === "Absent") {
                absent++;
            }

        });
    }

    let percentage = 0;

    if (total > 0) {
        percentage = ((present / total) * 100).toFixed(1);
    }

    document.getElementById("totalStudents").textContent = total;
    document.getElementById("presentCount").textContent = present;
    document.getElementById("absentCount").textContent = absent;
    document.getElementById("attendancePercentage").textContent =
        percentage + "%";
}


// Display history
function displayHistory() {

    const historyTable =
        document.getElementById("historyTable");

    historyTable.innerHTML = "";

    const dates = Object.keys(attendance).sort().reverse();

    if (dates.length === 0) {

        historyTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No attendance history available.
                </td>
            </tr>
        `;

        return;
    }

    dates.forEach(date => {

        const dateAttendance = attendance[date];

        Object.keys(dateAttendance).forEach(studentId => {

            const student = students.find(
                student => student.id == studentId
            );

            if (!student) {
                return;
            }

            const status = dateAttendance[studentId];

            const statusClass =
                status === "Present"
                    ? "status-present"
                    : "status-absent";

            historyTable.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td>${student.roll}</td>
                    <td>${student.name}</td>
                    <td class="${statusClass}">
                        ${status}
                    </td>
                </tr>
            `;
        });
    });
}


// Save data
function saveData() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );
}


// Initial display
displayStudents();
updateDashboard();
displayHistory();
