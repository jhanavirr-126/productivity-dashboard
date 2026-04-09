// State
let tasks = [];
let goals = [];
let completed = [];
let notifications = [];

let timerInterval = null;
let totalSeconds = 1500;
let remainingSeconds = 1500;
let isRunning = false;
let focusMinutes = 0;
let pomodorosCount = 0;
let currentMode = 'focus';

const modeTimes = { focus: 1500, short: 300, long: 900 };
const modeLabels = { focus: 'Focus session', short: 'Short break', long: 'Long break' };
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let weekFocus = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

const tips = [
  "Break big tasks into small steps.",
  "Consistency beats intensity every time.",
  "A 5-minute start beats a perfect plan.",
  "Rest is part of productivity.",
  "Progress, not perfection.",
  "One task at a time — focus wins.",
  "Review your goals every morning.",
  "Drink water. Your brain needs it.",
  "Sleep is the best study tool.",
  "Celebrate small wins!"
];

// ── Notifications ──
function addNotification(icon, msg) {
  const now = new Date();
  const time =
    now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0');
  notifications.unshift({ icon, msg, time });
  renderNotifications();
  showToast(icon, msg);
}

function renderNotifications() {
  const list = document.getElementById('notifList');
  const badge = document.getElementById('notifBadge');
  if (notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
    badge.classList.remove('show');
    return;
  }
  badge.textContent = notifications.length > 9 ? '9+' : notifications.length;
  badge.classList.add('show');
  list.innerHTML = notifications.map(n =>
    `<div class="notif-item">
      <span class="notif-icon">${n.icon}</span>
      <div>
        <div>${n.msg}</div>
        <span class="notif-time">${n.time}</span>
      </div>
    </div>`
  ).join('');
}

function clearNotifications() {
  notifications = [];
  renderNotifications();
}

function toggleNotifPanel() {
  document.getElementById('notifPanel').classList.toggle('open');
}

document.addEventListener('click', function(e) {
  const wrapper = document.getElementById('notifWrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    document.getElementById('notifPanel').classList.remove('open');
  }
});

// ── Toast ──
let toastTimeout;
function showToast(icon, msg) {
  clearTimeout(toastTimeout);
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Tasks ──
function addTask() {
  const val = document.getElementById('taskInput').value.trim();
  if (!val) return;
  const cat = document.getElementById('taskCategory').value;
  const pri = document.getElementById('taskPriority').value;
  tasks.push({ id: Date.now(), text: val, cat, pri });
  document.getElementById('taskInput').value = '';
  renderTasks();
  addNotification('📝', 'Task added: "' + val + '"');
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  completed.push({ label: '[Task | ' + task.cat + '] ' + task.text });
  tasks = tasks.filter(t => t.id !== id);
  document.getElementById('statTasks').textContent =
    parseInt(document.getElementById('statTasks').textContent) + 1;
  updateMotivation();
  renderTasks();
  renderCompleted();
  addNotification('✅', 'Task completed: "' + task.text + '"');
}

function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
  if (task) addNotification('🗑️', 'Task deleted: "' + task.text + '"');
}

function renderTasks() {
  const list = document.getElementById('taskList');
  if (tasks.length === 0) {
    list.innerHTML = '<div style="color:#999;font-size:12px;text-align:center;">No tasks yet.</div>';
    return;
  }
  list.innerHTML = tasks.map(t =>
    '<div class="task-item">' +
      '<div class="task-left">' +
        '<input type="checkbox" onchange="toggleTask(' + t.id + ')" />' +
        '<span class="task-text">[' + t.cat + ' | ' + t.pri + '] ' + t.text + '</span>' +
      '</div>' +
      '<button class="btn btn-sm" onclick="deleteTask(' + t.id + ')">Delete</button>' +
    '</div>'
  ).join('');
}

// ── Goals ──
function addGoal() {
  const val = document.getElementById('goalInput').value.trim();
  if (!val) return;
  goals.push({ id: Date.now(), text: val });
  document.getElementById('goalInput').value = '';
  renderGoals();
  addNotification('🎯', 'Goal added: "' + val + '"');
}

function toggleGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;
  completed.push({ label: '[Goal] ' + goal.text });
  goals = goals.filter(g => g.id !== id);
  document.getElementById('statGoals').textContent =
    parseInt(document.getElementById('statGoals').textContent) + 1;
  updateMotivation();
  renderGoals();
  renderCompleted();
  addNotification('🏆', 'Goal achieved: "' + goal.text + '"');
}

function deleteGoal(id) {
  const goal = goals.find(g => g.id === id);
  goals = goals.filter(g => g.id !== id);
  renderGoals();
  if (goal) addNotification('🗑️', 'Goal deleted: "' + goal.text + '"');
}

function renderGoals() {
  const list = document.getElementById('goalList');
  if (goals.length === 0) {
    list.innerHTML = '<div style="color:#999;font-size:12px;text-align:center;">No goals yet.</div>';
    return;
  }
  list.innerHTML = goals.map(g =>
    '<div class="task-item">' +
      '<div class="task-left">' +
        '<input type="checkbox" onchange="toggleGoal(' + g.id + ')" />' +
        '<span class="task-text">' + g.text + '</span>' +
      '</div>' +
      '<button class="btn btn-sm" onclick="deleteGoal(' + g.id + ')">Delete</button>' +
    '</div>'
  ).join('');
}

// ── Completed ──
function renderCompleted() {
  const list = document.getElementById('completedList');
  if (completed.length === 0) {
    list.innerHTML = '<div style="color:#999;font-size:13px;text-align:center;">Nothing completed yet.</div>';
    return;
  }
  list.innerHTML = completed.map(c =>
    '<div class="completed-item">' + c.label + '</div>'
  ).join('');
}

// ── Pomodoro ──
function setMode(mode) {
  currentMode = mode;
  stopTimer();
  totalSeconds = modeTimes[mode];
  remainingSeconds = totalSeconds;
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('sessionLabel').textContent = modeLabels[mode];
  updateTimerDisplay();
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(tick, 1000);
  addNotification('⏱️', modeLabels[currentMode] + ' started!');
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  addNotification('⏸️', 'Timer paused.');
}

function stopTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  totalSeconds = modeTimes[currentMode];
  remainingSeconds = totalSeconds;
  document.getElementById('progressFill').style.width = '100%';
  updateTimerDisplay();
}

function tick() {
  if (remainingSeconds <= 0) {
    clearInterval(timerInterval);
    isRunning = false;
    if (currentMode === 'focus') {
      const mins = modeTimes.focus / 60;
      focusMinutes += mins;
      document.getElementById('statFocus').textContent = focusMinutes;
      pomodorosCount++;
      document.getElementById('statPomodoros').textContent = pomodorosCount;
      const today = days[new Date().getDay()];
      weekFocus[today] = (weekFocus[today] || 0) + mins;
      updateChart();
      addNotification('🍅', 'Pomodoro #' + pomodorosCount + ' done! +' + mins + ' min focus.');
    } else {
      addNotification('☕', 'Break over! Time to focus.');
    }
    updateMotivation();
    return;
  }
  remainingSeconds--;
  updateTimerDisplay();
  document.getElementById('progressFill').style.width =
    ((remainingSeconds / totalSeconds) * 100) + '%';
}

function updateTimerDisplay() {
  const m = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const s = (remainingSeconds % 60).toString().padStart(2, '0');
  document.getElementById('timer-display').textContent = m + ':' + s;
}

// ── Chart ──
function updateChart() {
  const maxVal = Math.max(...Object.values(weekFocus), 1);
  Object.keys(weekFocus).forEach(function(day) {
    const bar = document.getElementById('bar-' + day);
    if (bar) {
      const h = Math.max(4, (weekFocus[day] / maxVal) * 110);
      bar.style.height = h + 'px';
    }
  });
}

// ── Motivation ──
function updateMotivation() {
  const t = parseInt(document.getElementById('statTasks').textContent);
  const g = parseInt(document.getElementById('statGoals').textContent);
  const msgs = [
    "You can do it!",
    "Great start! Keep going!",
    "You're on a roll!",
    "Amazing progress!",
    "Unstoppable!"
  ];
  const idx = Math.min(t + g, msgs.length - 1);
  document.getElementById('motivateText').textContent = msgs[idx];
}

// ── Tips ──
function newTip() {
  const idx = Math.floor(Math.random() * tips.length);
  document.getElementById('tipText').textContent = tips[idx];
}

// ── Start ──
renderTasks();
renderGoals();
renderCompleted();
updateChart();
newTip();