// To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.confirmCallback = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadTasksFromStorage();
        this.updateUI();
    }

    // Initialize DOM elements
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.errorMessage = document.getElementById('errorMessage');
        this.emptyState = document.getElementById('emptyState');
        
        // Statistics elements
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Filter elements
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // Modal elements
        this.editModal = document.getElementById('editModal');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.editErrorMessage = document.getElementById('editErrorMessage');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        
        // Confirmation modal elements
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
        this.confirmActionBtn = document.getElementById('confirmActionBtn');
    }

    // Attach event listeners
    attachEventListeners() {
        // Add task events
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.taskInput.addEventListener('input', () => this.clearError());

        // Filter events
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear events
        this.clearCompletedBtn.addEventListener('click', () => {
            this.showConfirmation(
                'Are you sure you want to clear all completed tasks?',
                () => this.clearCompletedTasks()
            );
        });

        this.clearAllBtn.addEventListener('click', () => {
            this.showConfirmation(
                'Are you sure you want to clear all tasks? This action cannot be undone.',
                () => this.clearAllTasks()
            );
        });

        // Edit modal events
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.saveEditBtn.addEventListener('click', () => this.saveEditedTask());
        this.editTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEditedTask();
        });
        this.editTaskInput.addEventListener('input', () => this.clearEditError());

        // Confirmation modal events
        this.cancelConfirmBtn.addEventListener('click', () => this.closeConfirmModal());
        this.confirmActionBtn.addEventListener('click', () => this.executeConfirmAction());

        // Close modals when clicking outside
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });

        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditModal();
                this.closeConfirmModal();
            }
        });
    }

    // Generate unique ID for tasks
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Validate task input
    validateTask(text) {
        const trimmedText = text.trim();
        
        if (!trimmedText) {
            return { isValid: false, error: 'Task cannot be empty!' };
        }
        
        if (trimmedText.length > 200) {
            return { isValid: false, error: 'Task cannot exceed 200 characters!' };
        }
        
        // Check for duplicate tasks
        const isDuplicate = this.tasks.some(task => 
            task.text.toLowerCase() === trimmedText.toLowerCase()
        );
        
        if (isDuplicate) {
            return { isValid: false, error: 'This task already exists!' };
        }
        
        return { isValid: true, text: trimmedText };
    }

    // Add new task
    addTask() {
        const validation = this.validateTask(this.taskInput.value);
        
        if (!validation.isValid) {
            this.showError(validation.error);
            return;
        }

        const newTask = {
            id: this.generateId(),
            text: validation.text,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.unshift(newTask); // Add to beginning for better UX
        this.taskInput.value = '';
        this.clearError();
        this.saveTasksToStorage();
        this.updateUI();
        
        // Show success feedback
        this.showSuccessMessage('Task added successfully!');
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasksToStorage();
            this.updateUI();
        }
    }

    // Delete task
    deleteTask(id) {
        this.showConfirmation(
            'Are you sure you want to delete this task?',
            () => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasksToStorage();
                this.updateUI();
                this.showSuccessMessage('Task deleted successfully!');
            }
        );
    }

    // Edit task
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            this.editTaskInput.value = task.text;
            this.editModal.style.display = 'block';
            this.editTaskInput.focus();
            this.clearEditError();
        }
    }

    // Save edited task
    saveEditedTask() {
        const validation = this.validateTask(this.editTaskInput.value);
        
        if (!validation.isValid) {
            this.showEditError(validation.error);
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = validation.text;
            this.saveTasksToStorage();
            this.updateUI();
            this.closeEditModal();
            this.showSuccessMessage('Task updated successfully!');
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.updateUI();
    }

    // Get filtered tasks
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    // Clear completed tasks
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showError('No completed tasks to clear!');
            return;
        }
        
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasksToStorage();
        this.updateUI();
        this.showSuccessMessage(`${completedCount} completed task(s) cleared!`);
    }

    // Clear all tasks
    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showError('No tasks to clear!');
            return;
        }
        
        const taskCount = this.tasks.length;
        this.tasks = [];
        this.saveTasksToStorage();
        this.updateUI();
        this.showSuccessMessage(`All ${taskCount} task(s) cleared!`);
    }

    // Update UI
    updateUI() {
        this.updateTaskList();
        this.updateStatistics();
        this.updateProgress();
        this.updateActionButtons();
    }

    // Update task list display
    updateTaskList() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.style.display = 'block';
            
            // Update empty state message based on filter
            const emptyStateH3 = this.emptyState.querySelector('h3');
            const emptyStateP = this.emptyState.querySelector('p');
            
            switch (this.currentFilter) {
                case 'completed':
                    emptyStateH3.textContent = 'No completed tasks';
                    emptyStateP.textContent = 'Complete some tasks to see them here!';
                    break;
                case 'pending':
                    emptyStateH3.textContent = 'No pending tasks';
                    emptyStateP.textContent = 'Great job! All tasks are completed!';
                    break;
                default:
                    emptyStateH3.textContent = 'No tasks yet';
                    emptyStateP.textContent = 'Add a task above to get started!';
            }
        } else {
            this.taskList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.taskList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');
        }
    }

    // Create task element HTML
    createTaskElement(task) {
        const createdDate = new Date(task.createdAt).toLocaleDateString();
        const completedDate = task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '';
        
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="todoApp.toggleTask('${task.id}')"
                >
                <div class="task-text" title="Created: ${createdDate}${completedDate ? ` | Completed: ${completedDate}` : ''}">
                    ${this.escapeHtml(task.text)}
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="todoApp.editTask('${task.id}')" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete-btn" onclick="todoApp.deleteTask('${task.id}')" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }

    // Update statistics
    updateStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
    }

    // Update progress bar
    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}%`;
    }

    // Update action buttons state
    updateActionButtons() {
        const hasCompleted = this.tasks.some(t => t.completed);
        const hasTasks = this.tasks.length > 0;

        this.clearCompletedBtn.disabled = !hasCompleted;
        this.clearAllBtn.disabled = !hasTasks;
        
        this.clearCompletedBtn.style.opacity = hasCompleted ? '1' : '0.5';
        this.clearAllBtn.style.opacity = hasTasks ? '1' : '0.5';
    }

    // Show confirmation modal
    showConfirmation(message, callback) {
        this.confirmMessage.textContent = message;
        this.confirmCallback = callback;
        this.confirmModal.style.display = 'block';
    }

    // Execute confirmed action
    executeConfirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
            this.confirmCallback = null;
        }
        this.closeConfirmModal();
    }

    // Close confirmation modal
    closeConfirmModal() {
        this.confirmModal.style.display = 'none';
        this.confirmCallback = null;
    }

    // Close edit modal
    closeEditModal() {
        this.editModal.style.display = 'none';
        this.editingTaskId = null;
        this.editTaskInput.value = '';
        this.clearEditError();
    }

    // Show error message
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        setTimeout(() => this.clearError(), 5000);
    }

    // Clear error message
    clearError() {
        this.errorMessage.style.display = 'none';
        this.errorMessage.textContent = '';
    }

    // Show edit error message
    showEditError(message) {
        this.editErrorMessage.textContent = message;
        this.editErrorMessage.style.display = 'block';
    }

    // Clear edit error message
    clearEditError() {
        this.editErrorMessage.style.display = 'none';
        this.editErrorMessage.textContent = '';
    }

    // Show success message
    showSuccessMessage(message) {
        // Create temporary success message element
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(successDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save tasks to localStorage
    saveTasksToStorage() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks to localStorage:', error);
            this.showError('Failed to save tasks. Please check your browser settings.');
        }
    }

    // Load tasks from localStorage
    loadTasksFromStorage() {
        try {
            const savedTasks = localStorage.getItem('todoApp_tasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
                
                // Validate loaded data
                this.tasks = this.tasks.filter(task => 
                    task && 
                    typeof task.id === 'string' && 
                    typeof task.text === 'string' && 
                    typeof task.completed === 'boolean'
                );
            }
        } catch (error) {
            console.error('Failed to load tasks from localStorage:', error);
            this.tasks = [];
            this.showError('Failed to load saved tasks. Starting fresh.');
        }
    }

    // Export tasks as JSON
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('Tasks exported successfully!');
    }

    // Import tasks from JSON file
    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                
                if (Array.isArray(importedTasks)) {
                    // Validate and merge tasks
                    const validTasks = importedTasks.filter(task => 
                        task && 
                        typeof task.text === 'string' && 
                        typeof task.completed === 'boolean'
                    );
                    
                    // Add unique IDs if missing
                    validTasks.forEach(task => {
                        if (!task.id) task.id = this.generateId();
                        if (!task.createdAt) task.createdAt = new Date().toISOString();
                    });
                    
                    this.tasks = [...this.tasks, ...validTasks];
                    this.saveTasksToStorage();
                    this.updateUI();
                    this.showSuccessMessage(`Imported ${validTasks.length} task(s) successfully!`);
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showError('Failed to import tasks. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    // Get app statistics
    getStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(t => 
            new Date(t.createdAt).toDateString() === today
        ).length;
        
        const todayCompleted = this.tasks.filter(t => 
            t.completedAt && new Date(t.completedAt).toDateString() === today
        ).length;

        return {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            todayTasks,
            todayCompleted,
            productivity: todayTasks > 0 ? Math.round((todayCompleted / todayTasks) * 100) : 0
        };
    }
}

// Add CSS for success message animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
let todoApp;

document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task quickly
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement === todoApp?.taskInput) {
            todoApp.addTask();
        }
    }
    
    // Ctrl/Cmd + A to focus on task input
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        todoApp?.taskInput.focus();
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    if (todoApp) {
        todoApp.updateUI();
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && todoApp) {
        // Reload tasks when page becomes visible (in case of sync from other tabs)
        todoApp.loadTasksFromStorage();
        todoApp.updateUI();
    }
});

// Export for global access
window.todoApp = todoApp;
