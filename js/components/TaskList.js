/**
 * TaskList 组件 - 任务标签列表
 */
class TaskList {
    /**
     * @param {string} containerId - 容器元素ID
     * @param {Object} options - 配置选项
     */
    constructor(containerId, options = {}) {
        this.containerId = containerId;

        this.options = {
            onSelect: null,
            onAdd: null,
            onRemove: null,
            ...options
        };

        this.tasks = [];
        this.activeTaskId = null;

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.container = document.getElementById(this.containerId);
        this.render();
    }

    /**
     * 设置任务列表
     * @param {Array} tasks - 任务数组
     */
    setTasks(tasks) {
        this.tasks = tasks;
        this.render();
    }

    /**
     * 添加任务
     * @param {Object} task - 任务对象
     */
    addTask(task) {
        // 检查是否已存在同名任务
        const exists = this.tasks.some(t => t.name === task.name);
        if (exists) {
            return false;
        }

        this.tasks.push(task);
        this.render();

        if (this.options.onAdd) {
            this.options.onAdd(task);
        }

        return true;
    }

    /**
     * 移除任务
     * @param {string} taskId - 任务ID
     */
    removeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;

        this.tasks = this.tasks.filter(t => t.id !== taskId);

        // 如果删除的是当前选中的任务，清除选中状态
        if (this.activeTaskId === taskId) {
            this.activeTaskId = null;
            if (this.options.onSelect) {
                this.options.onSelect(null);
            }
        }

        this.render();

        if (this.options.onRemove) {
            this.options.onRemove(taskId);
        }

        return true;
    }

    /**
     * 选择任务
     * @param {string} taskId - 任务ID
     */
    selectTask(taskId) {
        if (this.activeTaskId === taskId) {
            // 取消选择
            this.activeTaskId = null;
        } else {
            this.activeTaskId = taskId;
        }

        this.render();

        const selectedTask = this.tasks.find(t => t.id === this.activeTaskId);
        if (this.options.onSelect) {
            this.options.onSelect(selectedTask || null);
        }

        return selectedTask || null;
    }

    /**
     * 获取当前选中的任务
     * @returns {Object|null}
     */
    getActiveTask() {
        return this.tasks.find(t => t.id === this.activeTaskId) || null;
    }

    /**
     * 获取所有任务
     * @returns {Array}
     */
    getTasks() {
        return [...this.tasks];
    }

    /**
     * 渲染任务列表
     */
    render() {
        if (!this.container) return;

        if (this.tasks.length === 0) {
            this.container.innerHTML = '<span style="color: #9ca3af; font-size: 0.875rem;">暂无任务，添加一个开始专注吧！</span>';
            return;
        }

        this.container.innerHTML = this.tasks.map(task => {
            const isActive = task.id === this.activeTaskId;
            const taskName = task.name || '未命名任务';
            return `
                <div class="task-tag ${isActive ? 'active' : ''}" data-task-id="${task.id}">
                    <span>${this._escapeHtml(taskName)}</span>
                    <button class="remove-btn" data-action="remove" data-task-id="${task.id}" title="删除任务">×</button>
                </div>
            `;
        }).join('');

        // 绑定事件
        this._bindEvents();
    }

    /**
     * 绑定事件
     */
    _bindEvents() {
        // 任务标签点击事件
        this.container.querySelectorAll('.task-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                // 如果点击的是删除按钮，不触发选择
                if (e.target.closest('[data-action="remove"]')) {
                    return;
                }

                const taskId = tag.dataset.taskId;
                this.selectTask(taskId);
            });
        });

        // 删除按钮事件
        this.container.querySelectorAll('[data-action="remove"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = btn.dataset.taskId;
                this.removeTask(taskId);
            });
        });
    }

    /**
     * HTML转义
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.container.innerHTML = '';
    }
}
