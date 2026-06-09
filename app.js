/**
 * GradeCraft - Student Result Calculator
 * Demonstrating variables, conditions, and functions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECTING DOM ELEMENTS (using const variables)
    const form = document.getElementById('marksForm');
    
    // Input fields
    const subjects = ['math', 'science', 'english', 'history', 'art'];
    
    // Result elements
    const emptyState = document.getElementById('emptyState');
    const resultContent = document.getElementById('resultContent');
    const totalVal = document.getElementById('totalVal');
    const percentageVal = document.getElementById('percentageVal');
    const percentageStatus = document.getElementById('percentageStatus');
    const percentageRing = document.getElementById('percentageRing');
    const gradeVal = document.getElementById('gradeVal');
    const gradeCard = document.getElementById('gradeCard');
    const remarksVal = document.getElementById('remarksVal');

    // Circle circumference constant (2 * PI * r) where r = 50
    const CIRCUMFERENCE = 314.16;

    // 2. INPUT VALIDATION FUNCTIONS (using parameters, returns, and conditions)
    
    /**
     * Checks if a score is valid (a number between 0 and 100 inclusive)
     * @param {number} val 
     * @returns {boolean}
     */
    function isValidScore(val) {
        // Condition checking if the value is not empty, is a number, and falls within 0-100
        return !isNaN(val) && val >= 0 && val <= 100;
    }

    /**
     * Validates all input fields in the form
     * @returns {boolean} True if all subjects are valid, false otherwise
     */
    function validateForm() {
        let isFormValid = true;

        // Loop through subjects to check each input
        subjects.forEach(subjectId => {
            const inputElement = document.getElementById(subjectId);
            const errorElement = document.getElementById(`${subjectId}-error`);
            const val = parseFloat(inputElement.value.trim());

            if (inputElement.value.trim() === '' || !isValidScore(val)) {
                // Invalid input condition
                inputElement.classList.add('invalid');
                errorElement.style.display = 'block';
                isFormValid = false;
            } else {
                // Valid input condition
                inputElement.classList.remove('invalid');
                errorElement.style.display = 'none';
            }
        });

        return isFormValid;
    }

    // Live validation feedback on input change
    subjects.forEach(subjectId => {
        const inputElement = document.getElementById(subjectId);
        inputElement.addEventListener('input', () => {
            const errorElement = document.getElementById(`${subjectId}-error`);
            const val = parseFloat(inputElement.value.trim());
            
            if (isValidScore(val) || inputElement.value.trim() === '') {
                inputElement.classList.remove('invalid');
                errorElement.style.display = 'none';
            }
        });
    });

    // 3. CALCULATION & PROCESSING FUNCTIONS (Core variables, conditions, and functions)

    /**
     * Calculates the sum of all subject scores
     * @param {Array<number>} scores 
     * @returns {number}
     */
    function calculateTotal(scores) {
        let sum = 0; // Local variable to accumulate scores
        for (let i = 0; i < scores.length; i++) {
            sum += scores[i];
        }
        return sum;
    }

    /**
     * Calculates the percentage score
     * @param {number} total 
     * @param {number} maxTotal 
     * @returns {number}
     */
    function calculatePercentage(total, maxTotal) {
        const percentage = (total / maxTotal) * 100;
        return parseFloat(percentage.toFixed(1)); // return formatted single-digit decimal percentage
    }

    /**
     * Determines grade details, remarks, and styling colors based on percentage
     * @param {number} percentage 
     * @returns {Object} { grade, status, remarks, color }
     */
    function getPerformanceGrade(percentage) {
        // Variables to store output details
        let grade = '';
        let status = '';
        let remarks = '';
        let color = '';

        // Conditional checks (if-else chain) matching percentage ranges
        if (percentage >= 90) {
            grade = 'A+';
            status = 'Outstanding';
            remarks = 'Incredible mastery! You demonstrated spectacular skills and standard-setting execution in every domain. Keep shining!';
            color = 'var(--accent-success)';
        } else if (percentage >= 80) {
            grade = 'A';
            status = 'Excellent';
            remarks = 'Excellent results! You have shown superb understanding and strong effort. Maintain this focus, and you will hit the peak.';
            color = '#38bdf8'; // Sky blue
        } else if (percentage >= 70) {
            grade = 'B';
            status = 'Good Work';
            remarks = 'Very good work! Consistent and reliable performance across the board. Identify minor weak points to elevate your overall average.';
            color = '#818cf8'; // Violet-blue
        } else if (percentage >= 60) {
            grade = 'C';
            status = 'Satisfactory';
            remarks = 'A decent attempt. You meet the requirements, but extra focus on core principles and revision will yield significantly higher grades.';
            color = 'var(--accent-warning)';
        } else if (percentage >= 50) {
            grade = 'D';
            status = 'Needs Effort';
            remarks = 'Passed, but your results indicate a struggle with several subjects. Seek help from instructors and schedule extra study sessions.';
            color = '#fb923c'; // Orange
        } else {
            grade = 'F';
            status = 'Needs Attention';
            remarks = 'Critical improvement required. You did not meet the minimum passing benchmark. Let’s sit down, review the core issues, and start fresh.';
            color = 'var(--accent-error)';
        }

        return { grade, status, remarks, color };
    }

    // 4. PRESENTATION & ANIMATION FUNCTIONS
    
    /**
     * Triggers numbers counting up and updates circular indicator smoothly
     * @param {number} targetTotal 
     * @param {number} targetPercentage 
     * @param {Object} gradeObj 
     */
    function animateDashboard(targetTotal, targetPercentage, gradeObj) {
        // Toggle panel states
        emptyState.classList.add('hidden');
        resultContent.classList.remove('hidden');

        // Dynamic updates
        percentageStatus.textContent = gradeObj.status;
        percentageStatus.style.color = gradeObj.color;
        
        gradeVal.textContent = gradeObj.grade;
        gradeVal.style.background = `linear-gradient(135deg, ${gradeObj.color}, #ffffff)`;
        gradeVal.style.webkitBackgroundClip = 'text';
        gradeVal.style.webkitTextFillColor = 'transparent';
        
        remarksVal.textContent = gradeObj.remarks;

        // Custom highlight border styling for grade card to make it look responsive
        gradeCard.style.borderColor = `rgba(${hexToRgb(gradeObj.color)}, 0.25)`;

        // Setup ring animation stroke offset
        // offset = Circumference * (1 - percentage/100)
        const offset = CIRCUMFERENCE - (CIRCUMFERENCE * targetPercentage) / 100;
        
        // Dynamically assign colors to the SVG ring
        percentageRing.style.stroke = gradeObj.color;
        percentageRing.style.filter = `drop-shadow(0 0 6px ${gradeObj.color}7f)`; // Soft glowing indicator
        percentageRing.style.strokeDashoffset = offset;

        // Animate total marks number count-up
        let currentTotal = 0;
        const totalDuration = 1000; // 1 second animation
        const totalStep = Math.ceil(targetTotal / (totalDuration / 16)); // ~60fps
        
        const totalTimer = setInterval(() => {
            currentTotal += totalStep;
            if (currentTotal >= targetTotal) {
                totalVal.textContent = targetTotal;
                clearInterval(totalTimer);
            } else {
                totalVal.textContent = currentTotal;
            }
        }, 16);

        // Animate percentage text count-up
        let currentPercentage = 0;
        const percentStep = targetPercentage / (totalDuration / 16);
        
        const percentTimer = setInterval(() => {
            currentPercentage += percentStep;
            if (currentPercentage >= targetPercentage) {
                percentageVal.textContent = targetPercentage;
                clearInterval(percentTimer);
            } else {
                percentageVal.textContent = currentPercentage.toFixed(1);
            }
        }, 16);
    }

    /**
     * Helper to extract HEX styling variables or standard CSS colors to RGB components
     */
    function hexToRgb(colorStr) {
        if (colorStr.startsWith('var')) {
            // Safe fallback for custom css variable evaluation
            if (colorStr.includes('success')) return '16, 185, 129';
            if (colorStr.includes('warning')) return '245, 158, 11';
            if (colorStr.includes('error')) return '239, 68, 68';
            return '99, 102, 241';
        }
        if (colorStr.startsWith('#')) {
            const bigint = parseInt(colorStr.slice(1), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `${r}, ${g}, ${b}`;
        }
        return '255, 255, 255';
    }

    // 5. EVENT LISTENERS
    
    // Form submission listener
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Stop page reload

        if (validateForm()) {
            // Gather input values into an array
            const scores = [];
            subjects.forEach(subjectId => {
                const val = parseFloat(document.getElementById(subjectId).value);
                scores.push(val);
            });

            // Perform core logic
            const total = calculateTotal(scores);
            const maxScore = subjects.length * 100;
            const percentage = calculatePercentage(total, maxScore);
            const performanceDetails = getPerformanceGrade(percentage);

            // Output data visual animation
            animateDashboard(total, percentage, performanceDetails);
        }
    });

});
