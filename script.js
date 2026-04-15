// ============ DOM ELEMENTS ============
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksContainer = document.getElementById('tasksContainer');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const toast = document.getElementById('toast');

// Stats elements
const totalTasksEl = document.getElementById('totalTasks');
const activeTasksEl = document.getElementById('activeTasks');
const completedTasksEl = document.getElementById('completedTasks');
const progressFill = document.getElementById('progressFill');
const progressPercentage = document.getElementById('progressPercentage');

// ============ STATE MANAGEMENT ============
let tasks = [];
let currentFilter = 'all';
const STORAGE_KEY = 'tasks_list';

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderTasks();
    setupEventListeners();
});

// ============ EVENT LISTENERS ============
function setupEventListeners() {
    // Add task
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Filter tasks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Clear completed
    clearCompletedBtn.addEventListener('click', clearCompleted);
}

// ============ TASK OPERATIONS ============
function addTask() {
    const taskText = taskInput.value.trim();

    if (!taskText) {
        showToast('Please enter a task', 'warning');
        return;
    }

    if (taskText.length > 200) {
        showToast('Task is too long (max 200 characters)', 'warning');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    tasks.unshift(newTask);
    taskInput.value = '';
    taskInput.focus();
    saveTasksToStorage();
    renderTasks();
    showToast('Task added successfully! 🎉', 'success');
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
    renderTasks();
    showToast('Task deleted', 'info');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
    }
}

function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;

    if (completedCount === 0) {
        showToast('No completed tasks to clear', 'warning');
        return;
    }

    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage();
    renderTasks();
    showToast(`${completedCount} completed task(s) removed`, 'success');
}

// ============ RENDERING ============
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h2>No tasks found</h2>
                <p>${getEmptyStateMessage()}</p>
            </div>
        `;
    } else {
        tasksContainer.innerHTML = filteredTasks
            .map(task => createTaskElement(task))
            .join('');

        // Add event listeners to task elements
        document.querySelectorAll('.checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                toggleTask(parseInt(e.target.dataset.id));
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteTask(parseInt(e.target.dataset.id));
            });
        });
    }

    updateStats();
    updateProgress();
}

function createTaskElement(task) {
    return `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                data-id="${task.id}"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-date">${task.createdAt}</span>
            <button class="delete-btn" data-id="${task.id}" title="Delete task">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function getEmptyStateMessage() {
    switch (currentFilter) {
        case 'active':
            return 'All tasks completed! Time to celebrate 🎉';
        case 'completed':
            return 'No completed tasks yet. Keep working! 💪';
        default:
            return 'Add a task to get started on your journey to productivity!';
    }
}

// ============ STATS & PROGRESS ============
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    totalTasksEl.textContent = total;
    activeTasksEl.textContent = active;
    completedTasksEl.textContent = completed;
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
}

// ============ LOCAL STORAGE ============
function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasksFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : [];
}

// ============ UTILITIES ============
function showToast(message, type = 'success') {
    toast.textContent = '';
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        taskInput.focus();
    }
});