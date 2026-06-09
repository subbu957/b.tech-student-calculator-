/**
 * Student Calculator - Backend Server
 * Node.js / Express API Server with JSON File Storage
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read from JSON database
function readDatabase() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            // Initialize with an empty array if database.json doesn't exist
            fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf-8');
            return [];
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error reading database file:', error);
        return [];
    }
}

// Helper function to write to JSON database
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error writing to database file:', error);
        return false;
    }
}

// API Endpoints

// 1. Get History List
app.get('/api/history', (req, res) => {
    const history = readDatabase();
    res.json(history);
});

// 2. Save new report card calculation
app.post('/api/save', (req, res) => {
    const record = req.body;
    
    // Simple verification
    if (!record || !record.studentName) {
        return res.status(400).json({ error: 'Invalid record. Student Name is required.' });
    }

    const history = readDatabase();
    
    // Check if duplicate exists (matching name, cgpa, and credits to avoid spam)
    const isDuplicate = history.some(item => 
        item.studentName === record.studentName &&
        item.cgpa === record.cgpa &&
        item.totalCredits === record.totalCredits
    );

    if (isDuplicate) {
        return res.json({ message: 'Record already exists.', history });
    }

    // Add ID and timestamp if not already provided by frontend
    if (!record.id) record.id = Date.now();
    if (!record.dateTime) record.dateTime = new Date().toLocaleString();

    history.unshift(record); // Add to the beginning of the array (newest first)
    
    // Cap history at 15 items to keep it clean
    if (history.length > 15) {
        history.pop();
    }

    if (writeDatabase(history)) {
        res.status(201).json({ message: 'Record saved successfully!', history });
    } else {
        res.status(500).json({ error: 'Failed to write record to server database.' });
    }
});

// 3. Delete individual calculation by ID
app.delete('/api/delete/:id', (req, res) => {
    const idToDelete = parseInt(req.params.id);
    if (isNaN(idToDelete)) {
        return res.status(400).json({ error: 'Invalid ID format.' });
    }

    let history = readDatabase();
    const originalLength = history.length;
    history = history.filter(item => item.id !== idToDelete);

    if (history.length === originalLength) {
        return res.status(404).json({ error: 'Record not found.' });
    }

    if (writeDatabase(history)) {
        res.json({ message: 'Record deleted successfully.', history });
    } else {
        res.status(500).json({ error: 'Failed to update database after deletion.' });
    }
});

// 4. Clear entire calculations history
app.post('/api/clear', (req, res) => {
    if (writeDatabase([])) {
        res.json({ message: 'History cleared successfully.', history: [] });
    } else {
        res.status(500).json({ error: 'Failed to clear database.' });
    }
});

// Serve a beautiful database dashboard table at root
app.get('/', (req, res) => {
    const history = readDatabase();
    
    // Helper function to calculate semester SGPA
    function getSemSGPA(courses) {
        let creditPoints = 0;
        let credits = 0;
        courses.forEach(c => {
            if (c.gradePoint !== '' && c.gradePoint !== null && c.gradePoint !== undefined) {
                const gp = parseFloat(c.gradePoint);
                let point = 0;
                if (gp >= 10) point = 10;
                else if (gp >= 9) point = 9;
                else if (gp >= 8) point = 8;
                else if (gp >= 7) point = 7;
                else if (gp >= 6) point = 6;
                else if (gp >= 5) point = 5;
                creditPoints += (point * c.credits);
                credits += c.credits;
            }
        });
        return credits > 0 ? (creditPoints / credits).toFixed(2) : null;
    }

    // Helper to get grade letter
    function getGradeLetter(gpStr) {
        if (gpStr === '' || gpStr === null || gpStr === undefined) return '-';
        const gp = parseFloat(gpStr);
        if (gp >= 10) return 'O';
        if (gp >= 9) return 'A+';
        if (gp >= 8) return 'A';
        if (gp >= 7) return 'B+';
        if (gp >= 6) return 'B';
        if (gp >= 5) return 'C';
        return 'F';
    }

    let tableContent = '';
    if (history.length === 0) {
        tableContent = `
            <div class="empty-state">
                <i class="fa-solid fa-database"></i>
                <h2>No Records Found</h2>
                <p>The backend database is currently empty. Open the calculator frontend to save some records.</p>
            </div>
        `;
    } else {
        tableContent = `
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Date & Time</th>
                        <th>Total Credits</th>
                        <th>CGPA Score</th>
                        <th>Overall %</th>
                        <th>Academic Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(item => {
                        // Build details section HTML
                        let detailsHtml = '';
                        for (let sem = 1; sem <= 8; sem++) {
                            const courses = item.state[sem] || [];
                            const activeCourses = courses.filter(c => c.gradePoint !== '' && c.gradePoint !== null && c.gradePoint !== undefined);
                            
                            if (activeCourses.length > 0) {
                                const sgpa = getSemSGPA(courses);
                                detailsHtml += `
                                    <div class="sem-section">
                                        <div class="sem-title">
                                            <span>Semester ${sem}</span>
                                            <span style="font-size: 0.85rem; color: var(--text-muted);">SGPA: ${sgpa}</span>
                                        </div>
                                        <div class="courses-grid">
                                            ${activeCourses.map(c => `
                                                <div class="course-card">
                                                    <div>
                                                        <div class="course-title" title="${c.name}">${c.name}</div>
                                                        <div class="course-meta">Credits: ${c.credits}</div>
                                                    </div>
                                                    <div>
                                                        <span class="course-gp">${parseFloat(c.gradePoint).toFixed(1)}</span>
                                                        <span class="badge ${parseFloat(c.gradePoint) >= 5 ? 'pass' : 'fail'}" style="padding: 0.15rem 0.4rem; font-size: 0.65rem; margin-left: 0.25rem;">
                                                            ${getGradeLetter(c.gradePoint)}
                                                        </span>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `;
                            }
                        }

                        return `
                            <tr class="student-row" onclick="toggleDetails(${item.id})">
                                <td class="student-name">
                                    <i class="fa-solid fa-chevron-right expand-chevron" id="chevron-${item.id}" style="margin-right: 0.5rem; transition: transform 0.2s; font-size: 0.8rem; color: var(--text-muted);"></i>
                                    ${item.studentName}
                                </td>
                                <td>${item.dateTime}</td>
                                <td>${item.totalCredits} Credits</td>
                                <td style="font-weight: 700;">${item.cgpa.toFixed(2)}</td>
                                <td style="font-weight: 700; color: var(--primary);">${item.percentage.toFixed(1)}%</td>
                                <td>
                                    <span class="badge ${item.hasFail ? 'fail' : 'pass'}">
                                        <i class="fa-solid ${item.hasFail ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
                                        ${item.hasFail ? 'BACKLOG' : 'PASSED'}
                                    </span>
                                </td>
                                <td onclick="event.stopPropagation()">
                                    <button onclick="deleteRecord(${item.id})" class="btn-delete" title="Delete record">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr id="details-${item.id}" class="details-row" style="display: none;">
                                <td colspan="7">
                                    <div class="details-container">
                                        <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1rem; font-weight: 700; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                            <i class="fa-solid fa-folder-open text-primary"></i> Academic Breakdown for ${item.studentName}
                                        </h3>
                                        ${detailsHtml || '<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">No active course entries found.</p>'}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Records | Student Calculator Backend</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --bg-app: #f2f7fc;
            --bg-panel: #ffffff;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --success: #10b981;
            --success-light: #d1fae5;
            --fail: #ef4444;
            --fail-light: #fee2e2;
            --border-color: #e2e8f0;
            --radius-md: 16px;
            --transition: all 0.3s ease;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-app);
            color: var(--text-main);
            margin: 0;
            padding: 2rem;
            display: flex;
            justify-content: center;
        }

        .container {
            width: 100%;
            max-width: 1000px;
            background-color: var(--bg-panel);
            border-radius: var(--radius-md);
            box-shadow: 0 10px 30px rgba(30, 41, 59, 0.05);
            padding: 2.5rem;
            border: 1px solid var(--border-color);
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
        }

        h1 {
            font-size: 1.8rem;
            font-weight: 800;
            margin: 0;
            color: var(--primary);
        }

        .subtitle {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.25rem;
        }

        .btn-home {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: var(--transition);
        }

        .btn-home:hover {
            background-color: var(--primary-hover);
            transform: translateY(-1px);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            text-align: left;
        }

        th {
            background-color: #f8fafc;
            color: var(--text-muted);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 1rem;
            border-bottom: 2px solid var(--border-color);
        }

        td {
            padding: 1.25rem 1rem;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.9rem;
            vertical-align: middle;
        }

        .student-row {
            cursor: pointer;
            transition: var(--transition);
        }

        .student-row:hover {
            background-color: #f8fafc;
        }

        .student-name {
            font-weight: 700;
            color: var(--text-main);
            display: flex;
            align-items: center;
        }

        .badge {
            padding: 0.3rem 0.6rem;
            border-radius: 50px;
            font-size: 0.72rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }

        .badge.pass {
            background-color: var(--success-light);
            color: var(--success);
        }

        .badge.fail {
            background-color: var(--fail-light);
            color: var(--fail);
        }

        .btn-delete {
            background: none;
            border: none;
            color: var(--fail);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 6px;
            transition: var(--transition);
        }

        .btn-delete:hover {
            background-color: var(--fail-light);
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-muted);
        }

        .empty-state i {
            font-size: 3rem;
            color: var(--border-color);
            margin-bottom: 1rem;
        }

        .clear-btn {
            background-color: transparent;
            color: var(--fail);
            border: 1px solid var(--fail);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }

        .clear-btn:hover {
            background-color: var(--fail-light);
        }

        /* Expander Styles */
        .details-row {
            background-color: #f8fafc;
        }

        .details-container {
            padding: 1.5rem 2rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin: 0.5rem 1rem 1rem 1rem;
            background-color: white;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
            animation: slideDown 0.3s ease;
        }

        .sem-section {
            margin-bottom: 1.5rem;
        }

        .sem-section:last-child {
            margin-bottom: 0;
        }

        .sem-title {
            font-weight: 700;
            font-size: 0.95rem;
            color: var(--primary);
            margin-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.25rem;
            display: flex;
            justify-content: space-between;
        }

        .courses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
        }

        .course-card {
            background-color: var(--bg-app);
            padding: 0.75rem 1rem;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            border: 1px solid var(--border-color);
        }

        .course-title {
            font-weight: 600;
            color: var(--text-main);
            max-width: 170px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .course-meta {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.15rem;
        }

        .course-gp {
            font-weight: 800;
            color: var(--text-main);
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <h1>B.Tech Calculator Database</h1>
                <div class="subtitle">Calculations saved in backend storage (database.json)</div>
            </div>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <button onclick="clearAllHistory()" class="clear-btn"><i class="fa-solid fa-trash-can"></i> Clear Database</button>
                <a href="http://localhost:8000" class="btn-home"><i class="fa-solid fa-calculator"></i> Open Calculator</a>
            </div>
        </header>

        ${tableContent}
    </div>

    <script>
        function toggleDetails(id) {
            const row = document.getElementById('details-' + id);
            const chevron = document.getElementById('chevron-' + id);
            
            if (row.style.display === 'none') {
                row.style.display = 'table-row';
                chevron.style.transform = 'rotate(90deg)';
            } else {
                row.style.display = 'none';
                chevron.style.transform = 'rotate(0deg)';
            }
        }

        function deleteRecord(id) {
            if (confirm("Are you sure you want to delete this calculation record?")) {
                fetch('/api/delete/' + id, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(data => {
                        window.location.reload();
                    })
                    .catch(err => alert("Error deleting record: " + err));
            }
        }

        function clearAllHistory() {
            if (confirm("WARNING: Are you sure you want to delete ALL calculations from the server?")) {
                fetch('/api/clear', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        window.location.reload();
                    })
                    .catch(err => alert("Error clearing database: " + err));
            }
        }
    </script>
</body>
</html>
    `;
    res.send(html);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Student Calculator Server listening on http://localhost:${PORT}`);
});
