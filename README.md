# Student Calculator - B.Tech SGPA & CGPA Analyzer

Student Calculator is a premium, modern, and highly responsive web application designed for B.Tech students to evaluate their academic performance. Created by **bvssubbu**, it features a real-time computation system, custom semester tabs, default B.Tech courses, local storage database logging, and dual-mode PDF printing.

## Key Features

- **8-Semester Navigation tabs**: Click tabs to toggle input dashboards between Semester 1 and Semester 8.
- **Pre-loaded B.Tech Curriculum**: Comes pre-populated with standard engineering subjects:
  - **First Year**: Chemistry, English, Linear Algebra, Programming, Physics, Workshop labs.
  - **Second Year**: Discrete Math, Data Structures, OOP Java, Python Lab, Universal Human Values.
  - **Third Year**: DBMS, Machine Learning, Design Thinking, Probability & Statistics, Full Stack Dev I & II.
  - **Fourth Year**: NLP, System Software, Quantum Technology, Computer Vision, Exploratory Data Analysis.
- **Real-Time Grade Mapping (10-Point scale)**:
  - Marks $\ge 90$: **O** (Outstanding) = 10 GP
  - Marks $80-89$: **A+** (Excellent) = 9 GP
  - Marks $70-79$: **A** (Very Good) = 8 GP
  - Marks $60-69$: **B+** (Good) = 7 GP
  - Marks $50-59$: **B** (Above Average) = 6 GP
  - Marks $35-49$: **C** (Pass) = 5 GP
  - Marks $<35$: **F** (Fail) = 0 GP
- **Real-Time Calculations**: As you type course marks or adjust course credits, the app instantly updates:
  - **Subject Grade Letters**
  - **Semester SGPA**: $SGPA = \frac{\sum(\text{Grade Point} \times \text{Credits})}{\sum \text{Credits}}$
  - **Overall CGPA**: $CGPA = \frac{\sum(\text{All Credit Points})}{\sum \text{All Credits}}$
  - **Overall Percentage**: $Percentage = CGPA \times 10$
  - **Earned Credits Count**
- **Flexible Course Management**: Users can adjust default credit limits, add custom course rows, or delete existing subjects dynamically.
- **Visual Analytics**: An animated radial ring displaying CGPA performance, color-coded semester overview badges, and standing alerts (e.g. *First Class with Distinction*, *Pass Class*, *Backlog/Fail*).
- **Dual Export Setup**: Saves scorecards as A4 vectors via client-side libraries. If blocked by browser sandbox restrictions, it automatically launches browser print styling configurations (`window.print()`).
- **Dark Mode Switch**: Smooth lighting transition that preserves active calculations.
- **Local Storage Calculations History**: Saves calculation logs, enabling users to reload states with a single click. Includes double-click confirmations to prevent accidental history deletions.

## Project Structure

```
student-result-calculator/
│
├── index.html          # Dynamic B.Tech workspace layout and scorecard elements
├── style.css           # Custom design rules, variable styling, and layout rules
├── script.js           # Arithmetic computation engine, curriculum loading, and REST API triggers
├── README.md           # Documentation, academic guidelines, and local execution instructions
│
└── server/             # Node.js/Express Backend Server
    ├── server.js       # Main API endpoints, REST route controllers
    ├── database.json   # Local file-based calculations database
    └── package.json    # Backend project metadata and dependencies
```

## How to Run Locally

### 1. Run the Backend API Server
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   The backend will start running at `http://localhost:5000`.

### 2. Run the Frontend Client
1. Open the project root directory in a separate terminal:
   ```bash
   C:\Users\bvssu\.gemini\antigravity-ide\scratch\student-result-calculator
   ```
2. Start the local server:
   ```bash
   python -m http.server 8000
   ```
3. Open **`http://localhost:8000`** in your browser. The connection badge in the header will display **"Cloud Synced"** when the backend is online, and automatically fall back to **"Local Mode"** (using `localStorage`) if the backend server is stopped.

