// Initialize the schedule planner
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set current date
    document.getElementById('current-date').textContent = getCurrentDate();
    
    // Generate time slots (6 AM to 10 PM)
    generateTimeSlots();
    populateTimeSelect();
    
    // Load saved tasks
    loadTasks();
    
    // Event listeners
    document.getElementById('add-task-btn').addEventListener('click', addTask);
    document.getElementById('clear-all').addEventListener('click', clearAllTasks);
    document.getElementById('task-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Update statistics
    updateStatistics();
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
        alert('Please enter a task and select a time!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        time: parseInt(selectedTime),
        duration: duration,
        completed: false
    };
    
    saveTask(task);
    displayTask(task);
    updateStatistics();
    
    // Reset form
    taskInput.value = '';
    timeSelect.value = '';
    taskInput.focus();
}

function displayTask(task) {
    const taskContainer = document.getElementById(`task-${task.time}`);
    
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.dataset.taskId = task.id;
    
    taskElement.innerHTML = `
        <span>${task.text} (${task.duration} min)</span>
        <div class="task-actions">
            <button class="btn-edit" onclick="editTask(${task.id})">✏️</button>
            <button class="btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
        </div>
    `;
    
    taskContainer.appendChild(taskElement);
}

function saveTask(task) {
    const tasks = getSavedTasks();
    tasks.push(task);
    localStorage.setItem('dailySchedule', JSON.stringify(tasks));
}

function getSavedTasks() {
    return JSON.parse(localStorage.getItem('dailySchedule')) || [];
}

function loadTasks() {
    const tasks = getSavedTasks();
    tasks.forEach(task => displayTask(task));
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const tasks = getSavedTasks().filter(task => task.id !== taskId);
        localStorage.setItem('dailySchedule', JSON.stringify(tasks));
        
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }
        
        updateStatistics();
    }
}

function editTask(taskId) {
    const tasks = getSavedTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            localStorage.setItem('dailySchedule', JSON.stringify(tasks));
            
            // Refresh display
            document.querySelector('.time-slots').innerHTML = '';
            generateTimeSlots();
            loadTasks();
            updateStatistics();
        }
    }
}

function clearAllTasks() {
    if (confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
        localStorage.removeItem('dailySchedule');
        document.querySelector('.time-slots').innerHTML = '';
        generateTimeSlots();
        updateStatistics();
    }
}

function updateStatistics() {
    const tasks = getSavedTasks();
    const totalTasks = tasks.length;
    const totalHours = tasks.reduce((sum, task) => sum + (task.duration / 60), 0);
    const productivityScore = Math.min(100, Math.round((totalTasks / 8) * 100)); // Max 8 tasks for 100%
    
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('total-hours').textContent = totalHours.toFixed(1);
    document.getElementById('productivity-score').textContent = `${productivityScore}%`;
}