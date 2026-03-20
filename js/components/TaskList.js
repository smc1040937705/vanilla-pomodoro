class TaskList {
    constructor(container, options = {}) {
        this.container = container;
        this.tasks = Storage.getTasks();
        this.onUpdate = options.onUpdate || (() => {});
        this.onSetCurrentTask = options.onSetCurrentTask || (() => {});
        this.currentTaskId = null;
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <h3>📝 专注任务</h3>
            <div class="task-input">
                <input type="text" id="task-input" placeholder="添加任务标签...">
                <button id="add-task-btn">添加</button>
            </div>
            <div class="task-list" id="task-list"></div>
        `;

        this.taskInput = this.container.querySelector('#task-input');
        this.addTaskBtn = this.container.querySelector('#add-task-btn');
        this.taskList = this.container.querySelector('#task-list');

        this.renderTasks();
    }

    renderTasks() {
        if (this.tasks.length === 0) {
            this.taskList.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">暂无任务</p>';
            return;
        }

        this.taskList.innerHTML = this.tasks.map((task, index) => `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.id === this.currentTaskId ? 'focused' : ''}" data-index="${index}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <button class="task-focus" title="设为当前专注" style="background: none; border: none; cursor: pointer; padding: 4px 8px; font-size: 14px; opacity: 0.6;">
                    ${task.id === this.currentTaskId ? '🎯' : '🎯'}
                </button>
                <button class="task-delete">🗑️</button>
            </div>
        `).join('');
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        this.taskList.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const index = parseInt(e.target.closest('.task-item').dataset.index);
                this.toggleTask(index);
            }
        });

        this.taskList.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-delete')) {
                const index = parseInt(e.target.closest('.task-item').dataset.index);
                this.deleteTask(index);
            } else if (e.target.classList.contains('task-focus')) {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.setCurrentTask(taskId);
            }
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        this.tasks.push({
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: Date.now()
        });

        this.saveTasks();
        this.taskInput.value = '';
        this.renderTasks();
    }

    toggleTask(index) {
        this.tasks[index].completed = !this.tasks[index].completed;
        this.saveTasks();
        this.renderTasks();
    }

    deleteTask(index) {
        const task = this.tasks[index];
        if (task.id === this.currentTaskId) {
            this.currentTaskId = null;
            this.onSetCurrentTask(null);
        }
        this.tasks.splice(index, 1);
        this.saveTasks();
        this.renderTasks();
    }

    setCurrentTask(taskId) {
        if (this.currentTaskId === taskId) {
            this.currentTaskId = null;
            this.onSetCurrentTask(null);
        } else {
            this.currentTaskId = taskId;
            const task = this.tasks.find(t => t.id === taskId);
            this.onSetCurrentTask(task ? task.text : null);
        }
        this.renderTasks();
    }

    saveTasks() {
        Storage.saveTasks(this.tasks);
        this.onUpdate();
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
