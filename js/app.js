class App {
    constructor() {
        this.timer = null;
        this.statsManager = null;
        this.trendChart = null;
        this.taskList = null;
        this.settingsForm = null;
        
        this.init();
    }

    init() {
        this.initMockData();
        this.initComponents();
        this.bindEvents();
    }

    initMockData() {
        const stats = Storage.getStats();
        const todayKey = Utils.getTodayKey();
        
        if (Object.keys(stats).length === 0) {
            const mockData = {};
            const last7Days = Utils.getLast7Days();
            
            last7Days.forEach((day, index) => {
                if (day.key !== todayKey) {
                    mockData[day.key] = Math.floor(Math.random() * 6) + 2;
                }
            });
            
            mockData[todayKey] = 3;
            
            Object.keys(mockData).forEach(key => {
                Storage.addPomodoros(key, mockData[key]);
            });
        }

        const tasks = Storage.getTasks();
        if (tasks.length === 0) {
            const mockTasks = [
                { id: 1, text: '完成项目文档', completed: true, createdAt: Date.now() },
                { id: 2, text: '学习新技能', completed: false, createdAt: Date.now() },
                { id: 3, text: '代码审查', completed: false, createdAt: Date.now() }
            ];
            Storage.saveTasks(mockTasks);
        }
    }

    initComponents() {
        const timerContainer = document.getElementById('timer-container');
        this.timer = new Timer(timerContainer, {
            onComplete: () => this.updateStats(),
            onModeChange: (mode) => this.onModeChange(mode)
        });

        const statsContainer = document.getElementById('stats-container');
        this.statsManager = new StatsManager(statsContainer);

        this.trendChart = new TrendChart('trendChart');

        const taskContainer = document.getElementById('task-container');
        this.taskList = new TaskList(taskContainer, {
            onUpdate: () => this.statsManager.updateStats(),
            onSetCurrentTask: (taskName) => this.timer.setCurrentTask(taskName)
        });

        this.settingsModal = document.getElementById('settings-modal');
    }

    bindEvents() {
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn.addEventListener('click', () => this.openSettings());

        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
    }

    openSettings() {
        const settingsFormContainer = document.getElementById('settings-form');
        this.settingsForm = new SettingsForm(settingsFormContainer, {
            settings: Storage.getSettings(),
            onSave: (newSettings) => this.timer.updateSettings(newSettings),
            onClose: () => this.closeSettings()
        });
        this.settingsModal.classList.add('active');
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
        if (this.settingsForm) {
            this.settingsForm.destroy();
            this.settingsForm = null;
        }
    }

    updateStats() {
        this.statsManager.updateStats();
        this.trendChart.update();
    }

    onModeChange(mode) {
        console.log('Mode changed to:', mode);
    }

    destroy() {
        if (this.timer) this.timer.destroy();
        if (this.statsManager) this.statsManager.destroy();
        if (this.trendChart) this.trendChart.destroy();
        if (this.taskList) this.taskList.destroy();
        if (this.settingsForm) this.settingsForm.destroy();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
