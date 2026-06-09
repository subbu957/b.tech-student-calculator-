/**
 * Student Calculator - B.Tech SGPA/CGPA Engine
 * Client-Side Calculator, State Management, and LocalStorage Logs
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const form = document.getElementById('calculatorForm');
    const resetBtn = document.getElementById('resetBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // Panel Views
    const emptyState = document.getElementById('resultsEmptyState');
    const resultsContent = document.getElementById('resultsContent');
    const historyEmptyState = document.getElementById('historyEmptyState');
    const historyList = document.getElementById('historyList');
    const historyCountBadge = document.getElementById('historyCount');
    
    // Scorecard Values
    const resStudentName = document.getElementById('resStudentName');
    const resDateTime = document.getElementById('resDateTime');
    const resStatusBadge = document.getElementById('resStatusBadge');
    const resCgpaText = document.getElementById('resCgpaText');
    const resPercentageText = document.getElementById('resPercentageText');
    const progressCircle = document.getElementById('progressPercentCircle');
    const resAcademicStandText = document.getElementById('resAcademicStandText');
    const resTotalCredits = document.getElementById('resTotalCredits');
    
    // Workspaces
    const semesterTabsContainer = document.getElementById('semesterTabs');
    const activeSemTitle = document.getElementById('activeSemTitle');
    const courseRowsContainer = document.getElementById('courseRowsContainer');
    const addCourseBtn = document.getElementById('addCourseBtn');
    const studentNameInput = document.getElementById('studentName');
    const nameError = document.getElementById('nameError');
    const semBadgeList = document.getElementById('semBadgeList');

    // Circular Progress configuration
    const circleRadius = 70;
    const circumference = 2 * Math.PI * circleRadius; // ~439.82
    if (progressCircle) {
        progressCircle.style.strokeDasharray = `${circumference}`;
        progressCircle.style.strokeDashoffset = `${circumference}`;
    }

    // --- Curriculum Database ---
    const DEFAULT_CURRICULUM = {
        1: [
            { name: "Linear Algebra & Calculus", credits: 4.0, gradePoint: "" },
            { name: "Chemistry", credits: 4.0, gradePoint: "" },
            { name: "Communicative English", credits: 3.0, gradePoint: "" },
            { name: "Introduction to Programming", credits: 3.0, gradePoint: "" },
            { name: "Chemistry Lab", credits: 1.5, gradePoint: "" },
            { name: "Communicative English Lab", credits: 1.5, gradePoint: "" },
            { name: "Computer Programming Lab", credits: 1.5, gradePoint: "" },
            { name: "Health and Wellness, Yoga and Sports", credits: 1.0, gradePoint: "" }
        ],
        2: [
            { name: "Differential Equations & Vector Calculus", credits: 4.0, gradePoint: "" },
            { name: "Engineering Physics", credits: 4.0, gradePoint: "" },
            { name: "Basic Civil & Mechanical Engineering", credits: 3.0, gradePoint: "" },
            { name: "Engineering Graphics", credits: 3.0, gradePoint: "" },
            { name: "Engineering Physics Lab", credits: 1.5, gradePoint: "" },
            { name: "Engineering Workshop", credits: 1.5, gradePoint: "" },
            { name: "IT Workshop", credits: 1.5, gradePoint: "" },
            { name: "NSS/NCC/Scouts & Guides/Community Service", credits: 1.0, gradePoint: "" }
        ],
        3: [
            { name: "Discrete Mathematics & Graph Theory", credits: 4.0, gradePoint: "" },
            { name: "Digital Logic and Computer Organization", credits: 4.0, gradePoint: "" },
            { name: "Data Structures", credits: 3.0, gradePoint: "" },
            { name: "Environmental Science", credits: 3.0, gradePoint: "" },
            { name: "Data Structures Lab", credits: 1.5, gradePoint: "" },
            { name: "Basic Electrical & Electronics Engineering", credits: 3.0, gradePoint: "" },
            { name: "Electrical & Electronics Engineering Workshop", credits: 1.5, gradePoint: "" }
        ],
        4: [
            { name: "Probability & Statistics", credits: 4.0, gradePoint: "" },
            { name: "Object Oriented Programming Through Java", credits: 3.0, gradePoint: "" },
            { name: "Advanced Data Structures & Algorithms Analysis", credits: 3.0, gradePoint: "" },
            { name: "Universal Human Values", credits: 3.0, gradePoint: "" },
            { name: "Object Oriented Programming Through Java Lab", credits: 1.5, gradePoint: "" },
            { name: "Advanced Data Structures and Algorithms Analysis Lab", credits: 1.5, gradePoint: "" },
            { name: "Python Programming Lab", credits: 1.5, gradePoint: "" }
        ],
        5: [
            { name: "Database Management Systems", credits: 3.0, gradePoint: "" },
            { name: "Database Management Systems Lab", credits: 1.5, gradePoint: "" },
            { name: "Full Stack Development – I", credits: 3.0, gradePoint: "" },
            { name: "Tinkering Lab", credits: 1.5, gradePoint: "" },
            { name: "Design Thinking & Innovation", credits: 2.0, gradePoint: "" },
            { name: "Introduction to Artificial Intelligence", credits: 3.0, gradePoint: "" }
        ],
        6: [
            { name: "Machine Learning", credits: 3.0, gradePoint: "" },
            { name: "Machine Learning Lab", credits: 1.5, gradePoint: "" },
            { name: "Optimization Techniques", credits: 3.0, gradePoint: "" },
            { name: "Full Stack Development – II", credits: 3.0, gradePoint: "" },
            { name: "Exploratory Data Analysis with Python", credits: 3.0, gradePoint: "" },
            { name: "Community Service Internship / Project", credits: 2.0, gradePoint: "" }
        ],
        7: [
            { name: "Natural Language Processing", credits: 3.0, gradePoint: "" },
            { name: "System Software Programming", credits: 3.0, gradePoint: "" },
            { name: "Computer Vision & Image Processing", credits: 3.0, gradePoint: "" },
            { name: "Computer Vision & Machine Learning Lab", credits: 1.5, gradePoint: "" },
            { name: "AI & System Programming Lab", credits: 1.5, gradePoint: "" },
            { name: "English for Competitive Examinations", credits: 2.0, gradePoint: "" }
        ],
        8: [
            { name: "Introduction to Quantum Technology & Applications", credits: 3.0, gradePoint: "" }
        ]
    };

    // --- State Variables ---
    let activeSemester = 1;
    let studentName = "";
    let semestersState = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM)); // deep copy
    let activeStorageMode = localStorage.getItem('gpa_calc_storage_mode') || 'cloud';

    // --- Init ---
    initTheme();
    initStorageMode();
    loadCalculationsHistory();
    renderActiveSemesterCourses();
    calculateAcademicResults();

    // --- Storage Mode Initializer ---
    function initStorageMode() {
        const selector = document.getElementById('storageModeSelector');
        if (!selector) return;

        selector.querySelectorAll('.storage-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === activeStorageMode) {
                btn.classList.add('active');
            }
        });

        selector.addEventListener('click', (e) => {
            const btn = e.target.closest('.storage-btn');
            if (!btn) return;

            selector.querySelectorAll('.storage-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeStorageMode = btn.dataset.mode;
            localStorage.setItem('gpa_calc_storage_mode', activeStorageMode);

            loadCalculationsHistory();
        });
    }

    // --- Theme Switcher ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeToggleIcon(savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleIcon(newTheme);
    });

    function updateThemeToggleIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    // --- Semester Tabs Navigation ---
    semesterTabsContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab-btn');
        if (!tab) return;
        
        // Remove active class from other tabs
        semesterTabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        // Set current active
        tab.classList.add('active');
        activeSemester = parseInt(tab.dataset.sem);
        
        // Update Title & Rows
        activeSemTitle.textContent = `Semester ${activeSemester}`;
        renderActiveSemesterCourses();
        calculateAcademicResults();
    });

    // --- Course Row Renderer ---
    function renderActiveSemesterCourses() {
        courseRowsContainer.innerHTML = '';
        const courses = semestersState[activeSemester];
        
        if (courses.length === 0) {
            courseRowsContainer.innerHTML = '<div class="empty-courses-msg"><p>No courses added to this semester. Click <strong>Add Course</strong> to populate courses.</p></div>';
            return;
        }

        courses.forEach((course, index) => {
            const row = document.createElement('div');
            row.className = 'course-row';
            row.dataset.index = index;
            
            const gradeInfo = getGradeFromGP(course.gradePoint);
            const gradeClass = gradeInfo.point >= 5 ? 'g-pass' : (course.gradePoint !== '' ? 'g-fail' : '');

            row.innerHTML = `
                <input type="text" class="course-name-input" value="${course.name}" placeholder="Course Title" required>
                <input type="number" class="credits-input" value="${course.credits}" step="0.5" min="0" max="10" placeholder="Cr" required>
                <input type="number" class="marks-input" value="${course.gradePoint}" min="0" max="10" step="any" placeholder="0 - 10">
                <span class="row-grade-output ${gradeClass}">${course.gradePoint !== '' ? gradeInfo.letter : '-'}</span>
                <button type="button" class="btn-delete-course" aria-label="Delete course row">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            // Event Listeners for inputs to trigger real-time auto-calculation
            const nameIn = row.querySelector('.course-name-input');
            const credIn = row.querySelector('.credits-input');
            const marksIn = row.querySelector('.marks-input');
            const deleteBtn = row.querySelector('.btn-delete-course');

            nameIn.addEventListener('input', () => {
                course.name = nameIn.value;
            });

            credIn.addEventListener('input', () => {
                const cr = parseFloat(credIn.value);
                course.credits = isNaN(cr) ? 0 : cr;
                calculateAcademicResults();
            });

            marksIn.addEventListener('input', () => {
                const val = marksIn.value.trim();
                if (val === '') {
                    course.gradePoint = '';
                    row.querySelector('.row-grade-output').textContent = '-';
                    row.querySelector('.row-grade-output').className = 'row-grade-output';
                } else {
                    const gp = parseFloat(val);
                    if (!isNaN(gp) && gp >= 0 && gp <= 10) {
                        course.gradePoint = gp;
                        const g = getGradeFromGP(gp);
                        const span = row.querySelector('.row-grade-output');
                        span.textContent = g.letter;
                        span.className = `row-grade-output ${g.point >= 5 ? 'g-pass' : 'g-fail'}`;
                        row.classList.remove('invalid-row');
                    } else {
                        row.classList.add('invalid-row');
                    }
                }
                calculateAcademicResults();
            });

            deleteBtn.addEventListener('click', () => {
                courses.splice(index, 1);
                renderActiveSemesterCourses();
                calculateAcademicResults();
            });

            courseRowsContainer.appendChild(row);
        });
    }

    // --- Add Course Action ---
    addCourseBtn.addEventListener('click', () => {
        semestersState[activeSemester].push({
            name: "Custom Course",
            credits: 3.0,
            gradePoint: ""
        });
        renderActiveSemesterCourses();
        calculateAcademicResults();
        
        // Scroll to the bottom of the course list
        courseRowsContainer.scrollTop = courseRowsContainer.scrollHeight;
    });

    // --- Math Calculations Engine ---
    
    function getGradeFromGP(gp) {
        if (gp === null || gp === undefined || gp === '') {
            return { letter: '-', point: 0 };
        }
        const p = parseFloat(gp);
        if (p >= 10) return { letter: 'O', point: 10 };
        if (p >= 9) return { letter: 'A+', point: 9 };
        if (p >= 8) return { letter: 'A', point: 8 };
        if (p >= 7) return { letter: 'B+', point: 7 };
        if (p >= 6) return { letter: 'B', point: 6 };
        if (p >= 5) return { letter: 'C', point: 5 };
        return { letter: 'F', point: p };
    }

    function calculateAcademicResults() {
        let totalAllCreditPoints = 0;
        let totalAllCredits = 0;
        let activeSemCreditPoints = 0;
        let activeSemCredits = 0;
        let overallHasMarks = false;

        const semesterResults = {};

        // Loop semesters to accumulate values
        for (let sem = 1; sem <= 8; sem++) {
            const courses = semestersState[sem];
            let semCreditPoints = 0;
            let semCredits = 0;
            let semHasMarks = false;
            let semHasFail = false;

            courses.forEach(c => {
                if (c.gradePoint !== '') {
                    const grade = getGradeFromGP(c.gradePoint);
                    semCreditPoints += (grade.point * c.credits);
                    semCredits += c.credits;
                    semHasMarks = true;
                    overallHasMarks = true;
                    
                    if (grade.point < 5) {
                        semHasFail = true;
                    }
                }
            });

            if (semHasMarks && semCredits > 0) {
                const sgpa = semCreditPoints / semCredits;
                semesterResults[sem] = {
                    sgpa: Math.round(sgpa * 100) / 100,
                    credits: semCredits,
                    failed: semHasFail
                };

                // Accumulate totals
                totalAllCreditPoints += semCreditPoints;
                totalAllCredits += semCredits;

                if (sem === activeSemester) {
                    activeSemCreditPoints = semCreditPoints;
                    activeSemCredits = semCredits;
                }
            } else {
                semesterResults[sem] = null;
            }
        }

        // Student name check
        studentName = studentNameInput.value.trim();

        if (!overallHasMarks) {
            emptyState.classList.remove('hidden');
            resultsContent.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        // Math outcomes
        const cgpa = totalAllCredits > 0 ? (totalAllCreditPoints / totalAllCredits) : 0;
        const percentage = cgpa * 10;
        const cgpaFormatted = Math.round(cgpa * 100) / 100;
        const percentageFormatted = Math.round(percentage * 100) / 100;

        // Render overall results
        resStudentName.textContent = studentName || "Student Performance Report";
        resDateTime.textContent = new Date().toLocaleString();
        resCgpaText.textContent = cgpaFormatted.toFixed(2);
        resPercentageText.textContent = `${percentageFormatted.toFixed(1)}%`;
        resTotalCredits.textContent = `${totalAllCredits} Credits`;

        // Radial progress bar update
        const offset = circumference - (cgpa / 10) * circumference;
        progressCircle.style.strokeDashoffset = offset;

        // Determine standing
        let standing = "FAILING STANDING";
        let statusClass = "status-badge fail";
        let badgeText = "FAILED";
        let iconClass = "fa-solid fa-circle-xmark";

        // Check if there are failures in any course
        let hasOverallFail = false;
        for (let sem = 1; sem <= 8; sem++) {
            if (semesterResults[sem] && semesterResults[sem].failed) {
                hasOverallFail = true;
            }
        }

        if (cgpaFormatted >= 7.5 && !hasOverallFail) {
            standing = "Passed in FIRST CLASS WITH DISTINCTION!";
            statusClass = "status-badge pass";
            badgeText = "DISTINCTION";
            iconClass = "fa-solid fa-award";
        } else if (cgpaFormatted >= 6.5 && !hasOverallFail) {
            standing = "Passed in FIRST CLASS standing.";
            statusClass = "status-badge pass";
            badgeText = "FIRST CLASS";
            iconClass = "fa-solid fa-circle-check";
        } else if (cgpaFormatted >= 5.0 && !hasOverallFail) {
            standing = "Passed in SECOND CLASS standing.";
            statusClass = "status-badge pass";
            badgeText = "PASS CLASS";
            iconClass = "fa-solid fa-circle-check";
        } else {
            standing = hasOverallFail ? "Failed in one or more courses (Active backlog)." : "GPA is below minimum passing levels.";
            statusClass = "status-badge fail";
            badgeText = "FAILED / BACKLOG";
            iconClass = "fa-solid fa-triangle-exclamation";
        }

        resAcademicStandText.textContent = standing;
        resStatusBadge.className = statusClass;
        resStatusBadge.querySelector('.badge-text').textContent = badgeText;
        resStatusBadge.querySelector('.badge-icon i').className = iconClass;

        // Render Semester performance grid list
        semBadgeList.innerHTML = '';
        for (let sem = 1; sem <= 8; sem++) {
            const res = semesterResults[sem];
            const div = document.createElement('div');
            div.className = 'sem-summary-badge';
            
            if (sem === activeSemester) {
                div.classList.add('active-calc');
            }

            if (res) {
                div.classList.add(res.failed ? 'has-score-fail' : 'has-score');
                const semPct = res.sgpa * 10;
                div.innerHTML = `
                    <span class="sem-num">Sem ${sem}</span>
                    <span class="sem-sgpa" title="${res.credits} Credits">${res.sgpa.toFixed(2)} SGPA</span>
                    <span class="sem-pct">${semPct.toFixed(1)}%</span>
                `;
            } else {
                div.innerHTML = `
                    <span class="sem-num">Sem ${sem}</span>
                    <span class="sem-sgpa">-</span>
                `;
            }
            semBadgeList.appendChild(div);
        }
    }

    // Live update student name change
    studentNameInput.addEventListener('input', () => {
        studentName = studentNameInput.value.trim();
        resStudentName.textContent = studentName || "Student Performance Report";
    });

    // --- Reset Action ---
    resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset the entire calculator? All active entries will be lost.")) {
            form.reset();
            studentNameInput.closest('.input-group').classList.remove('invalid');
            
            // Re-copy default curricula
            semestersState = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM));
            activeSemester = 1;
            
            // Reset active tab class
            semesterTabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.dataset.sem) === 1) btn.classList.add('active');
            });
            activeSemTitle.textContent = "Semester 1";

            renderActiveSemesterCourses();
            calculateAcademicResults();
            progressCircle.style.strokeDashoffset = `${circumference}`;
        }
    });

    // --- Save Calculations Action ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameVal = studentNameInput.value.trim();
        if (nameVal === '') {
            studentNameInput.closest('.input-group').classList.add('invalid');
            studentNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        studentNameInput.closest('.input-group').classList.remove('invalid');

        // Compile state data to save
        let overallHasMarks = false;
        let totalCredits = 0;
        let totalPoints = 0;
        let hasFail = false;

        for (let sem = 1; sem <= 8; sem++) {
            semestersState[sem].forEach(c => {
                if (c.gradePoint !== '') {
                    overallHasMarks = true;
                    const grade = getGradeFromGP(c.gradePoint);
                    totalCredits += c.credits;
                    totalPoints += (grade.point * c.credits);
                    if (grade.point < 5) hasFail = true;
                }
            });
        }

        if (!overallHasMarks) {
            alert("Please input grade points in at least one course before saving.");
            return;
        }

        const cgpa = totalPoints / totalCredits;
        const percentage = cgpa * 10;

        const record = {
            id: Date.now(),
            studentName: nameVal,
            dateTime: new Date().toLocaleString(),
            cgpa: Math.round(cgpa * 100) / 100,
            percentage: Math.round(percentage * 100) / 100,
            totalCredits,
            hasFail,
            state: semestersState
        };

        saveToHistory(record);
    });

    // --- PDF Export Logic with Browser Print Fallback ---
    downloadPdfBtn.addEventListener('click', () => {
        const student = studentNameInput.value.trim() || "BTech_Report";
        const element = document.getElementById('pdfExportArea');

        const opt = {
            margin:       10,
            filename:     `${student.replace(/\s+/g, '_')}_Academic_Report.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2.2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // UI feedback states
        downloadPdfBtn.disabled = true;
        const origText = downloadPdfBtn.innerHTML;
        downloadPdfBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Exporting PDF...';

        // Check if html2pdf library executes
        try {
            if (typeof html2pdf === 'undefined') {
                throw new Error("html2pdf library is blocked or not loaded.");
            }

            html2pdf().set(opt).from(element).save()
                .then(() => {
                    downloadPdfBtn.disabled = false;
                    downloadPdfBtn.innerHTML = origText;
                })
                .catch((err) => {
                    console.warn("html2pdf failed. Falling back to browser print...", err);
                    triggerFallbackPrint();
                });
        } catch (e) {
            console.warn("html2pdf failed. Falling back to browser print...", e);
            triggerFallbackPrint();
        }

        function triggerFallbackPrint() {
            downloadPdfBtn.disabled = false;
            downloadPdfBtn.innerHTML = origText;
            
            // Message prompt
            alert("Note: PDF download will now open the browser print setup window. Under 'Destination', select 'Save as PDF' to save your report.");
            window.print();
        }
    });

    // --- History Database Engine ---
    const BACKEND_URL = `http://${window.location.hostname}:5000/api`;
    let isServerOnline = false;

    function getLocalHistory() {
        const history = localStorage.getItem('gpa_calc_history');
        return history ? JSON.parse(history) : [];
    }

    function updateConnectionBadge(online) {
        const connectionBadge = document.getElementById('connectionStatus');
        if (!connectionBadge) return;
        if (online) {
            connectionBadge.className = 'connection-status-badge online';
            connectionBadge.querySelector('.status-text').textContent = 'Cloud Synced';
        } else {
            connectionBadge.className = 'connection-status-badge offline';
            connectionBadge.querySelector('.status-text').textContent = 'Local Mode';
        }
    }

    async function loadCalculationsHistory() {
        if (activeStorageMode === 'local') {
            updateConnectionBadge(false);
            const badge = document.getElementById('connectionStatus');
            if (badge) {
                badge.className = 'connection-status-badge offline';
                badge.querySelector('.status-text').textContent = 'Local Mode';
            }
            renderCalculationsHistory(getLocalHistory());
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);

            const res = await fetch(`${BACKEND_URL}/history`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const serverHistory = await res.json();
                isServerOnline = true;
                updateConnectionBadge(true);
                localStorage.setItem('gpa_calc_history', JSON.stringify(serverHistory));
                renderCalculationsHistory(serverHistory);
            } else {
                throw new Error("Server error status");
            }
        } catch (err) {
            console.warn("Backend server offline. Running in Local Mode.");
            isServerOnline = false;
            updateConnectionBadge(false);
            
            const localHistory = getLocalHistory();
            renderCalculationsHistory(localHistory);
        }
    }

    // Check server status periodically every 8 seconds
    setInterval(async () => {
        if (activeStorageMode !== 'cloud') return;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);
            const res = await fetch(`${BACKEND_URL}/history`, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            const wasOnline = isServerOnline;
            isServerOnline = res.ok;
            
            if (isServerOnline !== wasOnline) {
                updateConnectionBadge(isServerOnline);
                if (isServerOnline) {
                    const serverHistory = await res.json();
                    localStorage.setItem('gpa_calc_history', JSON.stringify(serverHistory));
                    renderCalculationsHistory(serverHistory);
                }
            }
        } catch (e) {
            if (isServerOnline) {
                isServerOnline = false;
                updateConnectionBadge(false);
                renderCalculationsHistory(getLocalHistory());
            }
        }
    }, 8000);

    async function saveToHistory(record) {
        if (activeStorageMode === 'cloud' && isServerOnline) {
            try {
                const res = await fetch(`${BACKEND_URL}/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record)
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('gpa_calc_history', JSON.stringify(data.history));
                    renderCalculationsHistory(data.history);
                    return;
                }
            } catch (err) {
                console.error("Save to backend failed, falling back to local:", err);
            }
        }
        
        let history = getLocalHistory();
        history = history.filter(item => !(item.studentName.toLowerCase() === record.studentName.toLowerCase() && 
                                           item.cgpa === record.cgpa && 
                                           item.totalCredits === record.totalCredits));
        history.unshift(record);
        if (history.length > 15) history.pop();
        localStorage.setItem('gpa_calc_history', JSON.stringify(history));
        renderCalculationsHistory(history);
    }

    function renderCalculationsHistory(history) {
        if (history.length === 0) {
            historyEmptyState.classList.remove('hidden');
            historyList.classList.add('hidden');
            clearHistoryBtn.classList.add('hidden');
            historyCountBadge.textContent = '0';
            return;
        }

        historyEmptyState.classList.add('hidden');
        historyList.classList.remove('hidden');
        clearHistoryBtn.classList.remove('hidden');
        historyCountBadge.textContent = history.length;

        historyList.innerHTML = '';
        history.forEach(item => {
            const card = document.createElement('div');
            const statusClass = item.hasFail ? 'card-fail' : 'card-pass';
            const gradeBadgeClass = item.hasFail ? 'g-fail' : 'g-pass';
            const labelText = item.hasFail ? 'BACKLOG' : 'PASSED';
            
            card.className = `history-card ${statusClass}`;
            card.dataset.id = item.id;
            
            card.innerHTML = `
                <div class="history-card-header">
                    <span class="history-name" title="${item.studentName}">${item.studentName}</span>
                    <span class="history-date">${item.dateTime.split(',')[0]}</span>
                </div>
                <div class="history-card-body">
                    <span class="history-percent-badge">${item.cgpa.toFixed(2)} CGPA</span>
                    <span class="history-grade-badge ${gradeBadgeClass}">${item.percentage.toFixed(1)}% (${labelText})</span>
                </div>
                <button class="btn-delete-item" aria-label="Delete history entry" data-id="${item.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            // Card click loads the exact data state
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete-item')) return;
                loadRecordDetails(item);
            });

            // Delete specific card
            card.querySelector('.btn-delete-item').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHistoryItem(item.id);
            });

            historyList.appendChild(card);
        });
    }

    function loadRecordDetails(item) {
        studentNameInput.value = item.studentName;
        studentNameInput.closest('.input-group').classList.remove('invalid');
        
        semestersState = JSON.parse(JSON.stringify(item.state));
        
        activeSemester = 1;
        semesterTabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.sem) === 1) btn.classList.add('active');
        });
        activeSemTitle.textContent = "Semester 1";

        renderActiveSemesterCourses();
        calculateAcademicResults();
    }

    async function deleteHistoryItem(id) {
        if (activeStorageMode === 'cloud' && isServerOnline) {
            try {
                const res = await fetch(`${BACKEND_URL}/delete/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('gpa_calc_history', JSON.stringify(data.history));
                    renderCalculationsHistory(data.history);
                    return;
                }
            } catch (err) {
                console.error("Delete from backend failed, falling back to local:", err);
            }
        }

        let history = getLocalHistory();
        history = history.filter(item => item.id !== id);
        localStorage.setItem('gpa_calc_history', JSON.stringify(history));
        renderCalculationsHistory(history);
    }

    // --- Double Click Confirmation clear history ---
    let clearConfirmTimeout = null;

    clearHistoryBtn.addEventListener('click', async () => {
        if (clearHistoryBtn.classList.contains('confirm-state')) {
            if (activeStorageMode === 'cloud' && isServerOnline) {
                try {
                    const res = await fetch(`${BACKEND_URL}/clear`, { method: 'POST' });
                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('gpa_calc_history', JSON.stringify([]));
                        renderCalculationsHistory([]);
                        resetClearBtn();
                        return;
                    }
                } catch (err) {
                    console.error("Clear backend failed, falling back to local:", err);
                }
            }

            localStorage.removeItem('gpa_calc_history');
            renderCalculationsHistory([]);
            resetClearBtn();
        } else {
            clearHistoryBtn.classList.add('confirm-state');
            clearHistoryBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Confirm Clear?';
            
            clearConfirmTimeout = setTimeout(() => {
                clearHistoryBtn.classList.remove('confirm-state');
                clearHistoryBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Clear History';
            }, 3000);
        }
    });

    function resetClearBtn() {
        clearHistoryBtn.classList.remove('confirm-state');
        clearHistoryBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Clear History';
        if (clearConfirmTimeout) {
            clearTimeout(clearConfirmTimeout);
            clearConfirmTimeout = null;
        }
    }
});
