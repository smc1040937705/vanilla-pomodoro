/**
 * 番茄钟应用主入口
 */
class PomodoroApp {
    constructor() {
        this.timer = null;
        this.progressRing = null;
        this.statCard = null;
        this.chart = null;
        this.taskList = null;
        this.settingsForm = null;

        this.currentTask = null;
        this.audioEnabled = true;

        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.initComponents();
        this.loadData();
        this.bindEvents();
        this.updateUI();
    }

    /**
     * 初始化组件
     */
    initComponents() {
        // 初始化进度环
        this.progressRing = new ProgressRing('progressRing');

        // 初始化计时器
        const settings = Storage.getSettings();
        this.timer = new Timer({
            workDuration: settings.workDuration,
            breakDuration: settings.breakDuration,
            longBreakDuration: settings.longBreakDuration,
            onTick: this.handleTimerTick.bind(this),
            onComplete: this.handleTimerComplete.bind(this),
            onStateChange: this.handleTimerStateChange.bind(this)
        });

        // 初始化统计卡片
        this.statCard = new StatCard('statsContainer');

        // 初始化图表
        this.chart = new Chart('trendChart');

        // 初始化任务列表
        this.taskList = new TaskList('taskList', {
            onSelect: this.handleTaskSelect.bind(this),
            onAdd: this.handleTaskAdd.bind(this),
            onRemove: this.handleTaskRemove.bind(this)
        });

        // 初始化设置表单
        this.settingsForm = new SettingsForm({
            onSave: this.handleSettingsSave.bind(this)
        });
    }

    /**
     * 加载数据
     */
    loadData() {
        // 加载设置
        const settings = Storage.getSettings();
        this.settingsForm.load(settings);

        // 加载统计数据
        const stats = Storage.getStats();
        this.statCard.update(stats);

        // 加载历史数据
        const history = Storage.getLast7DaysHistory();
        this.chart.setData(history);

        // 加载任务列表
        const tasks = Storage.getTasks();
        this.taskList.setTasks(tasks);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 模式切换按钮
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });

        // 开始/暂停按钮
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.toggleTimer();
            });
        }

        // 重置按钮
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetTimer();
            });
        }

        // 添加任务
        const addTaskBtn = document.getElementById('addTask');
        const taskInput = document.getElementById('taskInput');

        if (addTaskBtn && taskInput) {
            addTaskBtn.addEventListener('click', () => {
                this.addNewTask(taskInput.value);
                taskInput.value = '';
            });

            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addNewTask(taskInput.value);
                    taskInput.value = '';
                }
            });
        }

        // 音频开关
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.audioEnabled = !this.audioEnabled;
                audioToggle.textContent = this.audioEnabled ? '🔔' : '🔕';
                Utils.showNotification(this.audioEnabled ? '声音已开启' : '声音已关闭', 'success');
            });
        }

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            // 页面重新可见时更新UI
            if (!document.hidden) {
                this.updateUI();
            }
        });
    }

    /**
     * 切换计时器模式
     * @param {string} mode - 模式 ('work' | 'break' | 'longBreak')
     */
    switchMode(mode) {
        if (this.timer.state === 'running') {
            // 如果正在运行，先暂停
            this.timer.pause();
        }

        this.timer.setMode(mode);
        this.updateModeButtons(mode);
        this.updateTimerDisplay();
        this.updateTaskLabel();
    }

    /**
     * 切换计时器开始/暂停
     */
    toggleTimer() {
        this.timer.toggle();
    }

    /**
     * 重置计时器
     */
    resetTimer() {
        this.timer.reset();
    }

    /**
     * 计时器滴答回调
     * @param {Object} state - 计时器状态
     */
    handleTimerTick(state) {
        this.updateTimerDisplay();
        this.progressRing.setProgress(state.progress, state.mode);
    }

    /**
     * 计时器完成回调
     * @param {Object} result - 完成结果
     */
    handleTimerComplete(result) {
        // 播放提示音
        if (this.audioEnabled) {
            Utils.playNotificationSound(result.mode === 'work' ? 'work' : 'break');
        }

        // 播放完成动画
        this.progressRing.playCompleteAnimation();

        // 如果是工作模式完成，增加统计
        if (result.mode === 'work') {
            const stats = Storage.incrementTodayPomodoro();
            this.statCard.update(stats);

            // 更新图表
            const history = Storage.getLast7DaysHistory();
            this.chart.setData(history);

            // 显示完成任务的通知
            if (this.currentTask) {
                Utils.showNotification(`🎉 恭喜完成「${this.currentTask.name}」！`, 'success');
            } else {
                Utils.showNotification('🎉 恭喜完成一个番茄！', 'success');
            }
        } else {
            Utils.showNotification('休息结束，准备开始新的专注！', 'success');
        }

        // 自动切换到下一个模式
        setTimeout(() => {
            this.timer.nextMode();
            this.updateModeButtons(this.timer.mode);
            this.updateTimerDisplay();
            this.updateStartButton();
            this.updateTaskLabel();
        }, 1500);
    }

    /**
     * 计时器状态变化回调
     * @param {Object} state - 计时器状态
     */
    handleTimerStateChange(state) {
        this.updateStartButton();

        // 更新页面标题
        if (state.state === 'running') {
            document.title = `${state.formattedTime} - 番茄钟`;
        } else {
            document.title = '番茄钟计时器';
        }
    }

    /**
     * 任务选择回调
     * @param {Object} task - 选中的任务
     */
    handleTaskSelect(task) {
        this.currentTask = task;
        this.updateTaskLabel();
    }

    /**
     * 任务添加回调
     * @param {Object} task - 添加的任务
     */
    handleTaskAdd(task) {
        Storage.addTask(task.name);
        Utils.showNotification('任务已添加', 'success');
    }

    /**
     * 任务移除回调
     * @param {string} taskId - 任务ID
     */
    handleTaskRemove(taskId) {
        Storage.removeTask(taskId);
        Utils.showNotification('任务已删除', 'success');
    }

    /**
     * 设置保存回调
     * @param {Object} settings - 设置对象
     */
    handleSettingsSave(settings) {
        this.timer.updateSettings(settings);

        // 如果当前处于idle状态，更新显示
        if (this.timer.state === 'idle') {
            this.updateTimerDisplay();
        }
    }

    /**
     * 添加新任务
     * @param {string} taskName - 任务名称
     */
    addNewTask(taskName) {
        const name = taskName.trim();
        if (!name) {
            Utils.showNotification('请输入任务名称', 'error');
            return;
        }

        const task = {
            id: Utils.generateId(),
            name: name,
            createdAt: Date.now()
        };

        const success = this.taskList.addTask(task);
        if (success) {
            Storage.saveTasks(this.taskList.getTasks());
        } else {
            Utils.showNotification('该任务已存在', 'error');
        }
    }

    /**
     * 更新计时器显示
     */
    updateTimerDisplay() {
        if (!this.timer) return;
        const state = this.timer.getState();
        const timeDisplay = document.getElementById('timeDisplay');

        if (timeDisplay) {
            timeDisplay.textContent = state.formattedTime;
            timeDisplay.className = `time-text ${state.mode}`;
        }

        // 更新进度环
        this.progressRing.setProgress(state.progress, state.mode);
    }

    /**
     * 更新模式按钮状态
     * @param {string} activeMode - 当前激活的模式
     */
    updateModeButtons(activeMode) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === activeMode) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * 更新开始按钮状态
     */
    updateStartButton() {
        const startBtn = document.getElementById('startBtn');
        if (!startBtn) return;
        if (!this.timer) return;

        const state = this.timer.getState();
        const isRunning = state.state === 'running';

        startBtn.innerHTML = isRunning ? '<span>⏸</span> 暂停' : '<span>▶</span> 开始';

        // 更新按钮颜色
        startBtn.className = `control-btn btn-primary ${state.mode === 'break' || state.mode === 'longBreak' ? 'break' : ''}`;
    }

    /**
     * 更新任务标签显示
     */
    updateTaskLabel() {
        const taskLabel = document.getElementById('taskLabel');
        if (!taskLabel) return;

        const state = this.timer.getState();

        if (state.mode === 'work') {
            if (this.currentTask) {
                taskLabel.textContent = `正在专注: ${this.currentTask.name}`;
            } else {
                taskLabel.textContent = '准备开始专注';
            }
        } else if (state.mode === 'break') {
            taskLabel.textContent = '短休息中...';
        } else if (state.mode === 'longBreak') {
            taskLabel.textContent = '长休息中...';
        }
    }

    /**
     * 更新UI
     */
    updateUI() {
        if (!this.timer) return;
        this.updateTimerDisplay();
        this.updateModeButtons(this.timer.mode);
        this.updateStartButton();
        this.updateTaskLabel();
    }

    /**
     * 销毁应用
     */
    destroy() {
        if (this.timer) this.timer.destroy();
        if (this.progressRing) this.progressRing.destroy();
        if (this.statCard) this.statCard.destroy();
        if (this.chart) this.chart.destroy();
        if (this.taskList) this.taskList.destroy();
        if (this.settingsForm) this.settingsForm.destroy();
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroApp = new PomodoroApp();
});
