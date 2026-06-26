// ─── Config ───────────────────────────────────────────────────────────────────
const START_DATE = new Date(2026, 1, 1); // Feb 1 2026 – when the debt began
START_DATE.setHours(0, 0, 0, 0);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

// Returns the next Friday strictly after today (skips to following Friday if today is Friday)
function nextFriday(from) {
    const d = new Date(from);
    const dow = d.getDay(); // 0 Sun … 6 Sat
    const diff = (5 - dow + 7) % 7;
    d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
    return d;
}

// Count Fridays that have fully passed since START_DATE (not counting today)
function fridaysMissed() {
    const now = today();
    let count = 0;
    let cursor = new Date(START_DATE);
    const dow = cursor.getDay();
    const diff = (5 - dow + 7) % 7 || 7;
    cursor.setDate(cursor.getDate() + diff);
    while (cursor < now) {
        count++;
        cursor.setDate(cursor.getDate() + 7);
    }
    return count;
}

// Probability: 60% base, -15% per missed Friday, floor 3%
function calcProbability(missed) {
    return Math.max(3, 60 - missed * 15);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function updateDashboard() {
    const now         = today();
    const target      = nextFriday(now);
    const missed      = fridaysMissed();
    const prob        = calcProbability(missed);
    const daysLeft    = Math.round((target - now) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.round((now - START_DATE) / (1000 * 60 * 60 * 24));

    document.getElementById('daysLeft').textContent     = daysLeft;
    document.getElementById('daysElapsed').textContent  = daysElapsed;
    document.getElementById('totalDays').textContent    = missed;
    document.getElementById('startDate').textContent    = formatDate(START_DATE);
    document.getElementById('targetDate').textContent   = formatDate(target);
    document.getElementById('progressBar').style.width  = prob + '%';
    document.getElementById('progressText').textContent = prob + '% Chance He Pays';

    updateStatusMessage(daysLeft, prob, missed);
}

function updateStatusMessage(daysLeft, prob, missed) {
    const statusMsg       = document.getElementById('statusMsg');
    const statusContainer = document.querySelector('.status-message');

    statusContainer.classList.remove('almost', 'close', 'arrived', 'bleak');

    if (prob <= 5) {
        statusMsg.textContent = `💀 ${missed} Fridays deep and nothing. It's not looking good.`;
        statusContainer.classList.add('bleak');
    } else if (prob <= 20) {
        statusMsg.textContent = `😬 ${missed} missed Fridays… Tre really said "nah."`;
        statusContainer.classList.add('bleak');
    } else if (prob <= 40) {
        statusMsg.textContent = `🤔 ${daysLeft} day${daysLeft === 1 ? '' : 's'} until Friday. Maybe this time?`;
        statusContainer.classList.add('almost');
    } else if (daysLeft <= 1) {
        statusMsg.textContent = `⏰ Tomorrow's Friday. Tre knows what he did.`;
        statusContainer.classList.add('close');
    } else {
        statusMsg.textContent = `⏳ ${daysLeft} days until the next chance. History says don't hold your breath.`;
    }
}

updateDashboard();
setInterval(updateDashboard, 1000 * 60 * 60); // refresh every hour

// ─── Realistic Snow (Canvas) ──────────────────────────────────────────────────

const canvas = document.getElementById('snowCanvas');
const ctx    = canvas.getContext('2d');

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const FLAKE_COUNT = 200;
const flakes = [];

function rand(a, b) { return a + Math.random() * (b - a); }

for (let i = 0; i < FLAKE_COUNT; i++) {
    flakes.push({
        x:           rand(0, window.innerWidth),
        y:           rand(-window.innerHeight, window.innerHeight),
        r:           rand(0.5, 3.5),
        speed:       rand(0.4, 2.2),
        drift:       rand(-0.4, 0.4),
        wobble:      rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.005, 0.02),
        opacity:     rand(0.4, 1.0),
    });
}

function drawSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const f of flakes) {
        f.wobble += f.wobbleSpeed;
        f.x += f.drift + Math.sin(f.wobble) * 0.5;
        f.y += f.speed;

        if (f.y > canvas.height + 10) { f.y = -10; f.x = rand(0, canvas.width); }
        if (f.x > canvas.width  + 10) f.x = -10;
        if (f.x < -10)                f.x = canvas.width + 10;

        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        g.addColorStop(0, `rgba(255,255,255,${f.opacity})`);
        g.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }

    requestAnimationFrame(drawSnow);
}

drawSnow();
