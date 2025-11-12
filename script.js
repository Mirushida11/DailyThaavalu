// Initialize the schedule planner
function initializeApp() {
    // Initialize theme
    initializeTheme();
    
    // Set current date
    document.getElementById('current-date').textContent = getCurrentDate();
    
    // Generate time slots (6 AM to 10 PM)
    generateTimeSlots();
    populateTimeSelect();
    
    // Load saved tasks (from user's account)
    loadTasks();
    
    // Event listeners
    document.getElementById('add-task-btn').addEventListener('click', addTask);
    document.getElementById('clear-all').addEventListener('click', clearAllTasks);
    document.getElementById('task-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Mobile-friendly touch improvements
    setupTouchInteractions();
    
    // Update statistics
    updateStatistics();
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '🌞' : '🌙';
    }
    
    // Update manifest theme color
    updateThemeColor(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    showToast(`Switched to ${newTheme} theme`, 'info');
}

function updateThemeColor(theme) {
    const themeColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColor);
    }
}

function setupTouchInteractions() {
    // Better touch feedback for all interactive elements
    const interactiveElements = document.querySelectorAll('button, .task-item, .time-slot');
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Close keyboard when tapping outside inputs
    document.addEventListener('touchstart', function(e) {
        if (!e.target.matches('input, select, textarea')) {
            document.activeElement.blur();
        }
    });
}

function getCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

function generateTimeSlots() {
    const timeSlotsContainer = document.querySelector('.time-slots');
    timeSlotsContainer.innerHTML = '';
    
    for (let hour = 6; hour <= 22; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.dataset.hour = hour;
        
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = formatTime(hour);
        
        const taskContainer = document.createElement('div');
        taskContainer.className = 'task-container';
        taskContainer.id = `task-${hour}`;
        
        timeSlot.appendChild(timeLabel);
        timeSlot.appendChild(taskContainer);
        timeSlotsContainer.appendChild(timeSlot);
    }
}

function populateTimeSelect() {
    const timeSelect = document.getElementById('time-select');
    timeSelect.innerHTML = '<option value="">Select Time</option>';
    
    for (let hour = 6; hour <= 22; hour++) {
        const option = document.createElement('option');
        option.value = hour;
        option.textContent = formatTime(hour);
        timeSelect.appendChild(option);
    }
}

function formatTime(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour === 0 ? 12 : displayHour} ${period}`;
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const timeSelect = document.getElementById('time-select');
    const durationSelect = document.getElementById('duration-select');
    
    const taskText = taskInput.value.trim();
    const selectedTime = timeSelect.value;
    const duration = parseInt(durationSelect.value);
    
    if (!taskText || !selectedTime) {
        showToast('Please enter a task and select a time!', 'warning');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        time: parseInt(selectedTime),
        duration: duration,
        completed: false,
        created: new Date().toISOString()
    };
    
    saveTask(task);
    displayTask(task);
    updateStatistics();
    
    // Reset form
    taskInput.value = '';
    timeSelect.value = '';
    taskInput.focus();
    
    // Show success feedback
    showToast('Task added successfully!', 'success');
    
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function displayTask(task) {
    const taskContainer = document.getElementById(`task-${task.time}`);
    
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.dataset.taskId = task.id;
    
    taskElement.innerHTML = `
        <span class="task-text">${task.text}</span>
        <span class="task-duration">${task.duration} min</span>
        <div class="task-actions">
            <button class="btn-edit" onclick="editTask(${task.id})" title="Edit task">✏️</button>
            <button class="btn-delete" onclick="deleteTask(${task.id})" title="Delete task">🗑️</button>
        </div>
    `;
    
    taskContainer.appendChild(taskElement);
}

function saveTask(task) {
    if (!window.authSystem || !window.authSystem.currentUser) {
        // Fallback to localStorage if auth system not available
        const tasks = getSavedTasks();
        tasks.push(task);
        localStorage.setItem('dailySchedule', JSON.stringify(tasks));
        return;
    }
    
    // Use auth system to save task
    const currentTasks = window.authSystem.getCurrentUserTasks();
    currentTasks.push(task);
    window.authSystem.saveCurrentUserTasks(currentTasks);
}

function getSavedTasks() {
    if (!window.authSystem || !window.authSystem.currentUser) {
        // Fallback to localStorage if auth system not available
        return JSON.parse(localStorage.getItem('dailySchedule')) || [];
    }
    
    // Use auth system to get tasks
    return window.authSystem.getCurrentUserTasks();
}

function loadTasks() {
    const tasks = getSavedTasks();
    tasks.forEach(task => displayTask(task));
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        if (!window.authSystem || !window.authSystem.currentUser) {
            // Fallback to localStorage if auth system not available
            const tasks = getSavedTasks().filter(task => task.id !== taskId);
            localStorage.setItem('dailySchedule', JSON.stringify(tasks));
        } else {
            // Use auth system to delete task
            const currentTasks = window.authSystem.getCurrentUserTasks();
            const updatedTasks = currentTasks.filter(task => task.id !== taskId);
            window.authSystem.saveCurrentUserTasks(updatedTasks);
        }
        
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }
        
        updateStatistics();
        showToast('Task deleted', 'info');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
}

function editTask(taskId) {
    let tasks;
    if (!window.authSystem || !window.authSystem.currentUser) {
        tasks = getSavedTasks();
    } else {
        tasks = window.authSystem.getCurrentUserTasks();
    }
    
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
           
