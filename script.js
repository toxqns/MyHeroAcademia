// Configuration
const START_DATE = new Date(2026, 1, 1); // February 1, 2026
const DAYS_UNTIL_FRIDAY = 5; // Days from start until the Friday we're targeting

// Calculate the target Friday
function getNextFridayFromStart() {
    // Find the first Friday on or after the start date
    let date = new Date(START_DATE);
    const dayOfWeek = date.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // 5 = Friday
    date.setDate(date.getDate() + daysUntilFriday);
    return date;
}

const TARGET_DATE = getNextFridayFromStart();
const TODAY = new Date();

// Remove time from dates for accurate day calculations
TODAY.setHours(0, 0, 0, 0);
START_DATE.setHours(0, 0, 0, 0);
TARGET_DATE.setHours(0, 0, 0, 0);

// Calculate days
function calculateDays() {
    const timeDiff = TARGET_DATE - TODAY;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
}

function calculateElapsedDays() {
    const timeDiff = TODAY - START_DATE;
    const daysElapsed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return Math.max(0, daysElapsed);
}

function calculateTotalDays() {
    const timeDiff = TARGET_DATE - START_DATE;
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return Math.max(1, totalDays);
}

// Calculate progress percentage
function calculateProgress() {
    const totalDays = calculateTotalDays();
    const elapsedDays = calculateElapsedDays();
    const progress = (elapsedDays / totalDays) * 100;
    return Math.min(100, Math.max(0, progress));
}

// Update the dashboard
function updateDashboard() {
    const daysLeft = calculateDays();
    const daysElapsed = calculateElapsedDays();
    const totalDays = calculateTotalDays();
    const progress = calculateProgress();

    // Update DOM elements
    document.getElementById('daysLeft').textContent = daysLeft;
    document.getElementById('daysElapsed').textContent = daysElapsed;
    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = Math.round(progress) + '% Complete';

    // Format dates
    document.getElementById('startDate').textContent = formatDate(START_DATE);
    document.getElementById('targetDate').textContent = formatDate(TARGET_DATE);

    // Update status message
    updateStatusMessage(daysLeft, progress);
}

// Format date for display
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Update status message based on days left
function updateStatusMessage(daysLeft, progress) {
    const statusMsg = document.getElementById('statusMsg');
    const statusContainer = document.querySelector('.status-message');

    // Remove all status classes
    statusContainer.classList.remove('almost', 'close', 'arrived');

    if (daysLeft <= 0) {
        statusMsg.textContent = '🎉 It\'s Friday! Time to get paid!';
        statusContainer.classList.add('arrived');
    } else if (daysLeft <= 2) {
        statusMsg.textContent = `⏰ Almost there! Just ${daysLeft} day${daysLeft === 1 ? '' : 's'} away!`;
        statusContainer.classList.add('close');
    } else if (progress >= 75) {
        statusMsg.textContent = `📅 Getting close! ${daysLeft} days to go...`;
        statusContainer.classList.add('almost');
    } else if (progress >= 50) {
        statusMsg.textContent = `⏳ Halfway there! ${daysLeft} days remaining...`;
    } else {
        statusMsg.textContent = `⏳ Keep waiting... ${daysLeft} days left!`;
    }
}

// Update dashboard on page load
updateDashboard();

// Update every hour to keep progress accurate
setInterval(updateDashboard, 1000 * 60 * 60);
