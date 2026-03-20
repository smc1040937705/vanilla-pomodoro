/**
 * 数据存储模块 - 管理 localStorage 数据
 */

const Storage = {
    KEYS: {
        SETTINGS: 'pomodoro_settings',
        STATS: 'pomodoro_stats',
        TASKS: 'pomodoro_tasks',
        HISTORY: 'pomodoro_history'
    },

    /**
     * 默认设置
     */
    defaultSettings: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15
    },

    /**
     * 获取设置
     * @returns {Object} 设置对象
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            return data ? { ...this.defaultSettings, ...JSON.parse(data) } : this.defaultSettings;
        } catch (e) {
            console.error('Failed to load settings:', e);
            return this.defaultSettings;
        }
    },

    /**
     * 保存设置
     * @param {Object} settings - 设置对象
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    },

    /**
     * 获取统计数据
     * @returns {Object} 统计数据
     */
    getStats() {
        try {
            const data = localStorage.getItem(this.KEYS.STATS);
            const defaultStats = {
                today: 0,
                total: 0,
                streak: 0,
                lastActiveDate: Utils.formatDate(new Date())
            };
            return data ? { ...defaultStats, ...JSON.parse(data) } : defaultStats;
        } catch (e) {
            console.error('Failed to load stats:', e);
            return {
                today: 0,
                total: 0,
                streak: 0,
                lastActiveDate: Utils.formatDate(new Date())
            };
        }
    },

    /**
     * 保存统计数据
     * @param {Object} stats - 统计数据
     */
    saveStats(stats) {
        try {
            localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.error('Failed to save stats:', e);
            return false;
        }
    },

    /**
     * 增加今日番茄数
     */
    incrementTodayPomodoro() {
        const stats = this.getStats();
        const today = Utils.formatDate(new Date());

        // 检查是否是新的一天
        if (stats.lastActiveDate !== today) {
            // 检查是否是连续的一天
            const lastDate = new Date(stats.lastActiveDate);
            const currentDate = new Date(today);
            const diffDays = (currentDate - lastDate) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                stats.streak += 1;
            } else {
                stats.streak = 1;
            }

            stats.today = 1;
            stats.lastActiveDate = today;
        } else {
            stats.today += 1;
        }

        stats.total += 1;
        this.saveStats(stats);
        this.addHistory(today);

        return stats;
    },

    /**
     * 默认任务列表
     */
    defaultTasks: [
        { id: 'default-1', name: '学习', createdAt: Date.now() },
        { id: 'default-2', name: '工作', createdAt: Date.now() },
        { id: 'default-3', name: '阅读', createdAt: Date.now() }
    ],

    /**
     * 获取任务列表
     * @returns {Array} 任务数组
     */
    getTasks() {
        try {
            const data = localStorage.getItem(this.KEYS.TASKS);
            if (data) {
                return JSON.parse(data);
            }
            // 首次使用，返回默认任务并保存
            this.saveTasks(this.defaultTasks);
            return this.defaultTasks;
        } catch (e) {
            console.error('Failed to load tasks:', e);
            return this.defaultTasks;
        }
    },

    /**
     * 保存任务列表
     * @param {Array} tasks - 任务数组
     */
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
            return true;
        } catch (e) {
            console.error('Failed to save tasks:', e);
            return false;
        }
    },

    /**
     * 添加任务
     * @param {string} taskName - 任务名称
     * @returns {Object} 新任务对象
     */
    addTask(taskName) {
        const tasks = this.getTasks();
        const newTask = {
            id: Utils.generateId(),
            name: taskName.trim(),
            createdAt: Date.now()
        };
        tasks.push(newTask);
        this.saveTasks(tasks);
        return newTask;
    },

    /**
     * 删除任务
     * @param {string} taskId - 任务ID
     */
    removeTask(taskId) {
        const tasks = this.getTasks().filter(t => t.id !== taskId);
        this.saveTasks(tasks);
        return tasks;
    },

    /**
     * 获取历史记录
     * @returns {Object} 历史记录对象 { date: count }
     */
    getHistory() {
        try {
            const data = localStorage.getItem(this.KEYS.HISTORY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Failed to load history:', e);
            return {};
        }
    },

    /**
     * 添加历史记录
     * @param {string} date - 日期字符串 YYYY-MM-DD
     */
    addHistory(date) {
        const history = this.getHistory();
        history[date] = (history[date] || 0) + 1;
        try {
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('Failed to save history:', e);
            return false;
        }
    },

    /**
     * 获取最近7天的历史数据
     * @returns {Array} 近7天数据数组 [{ date, count, weekDay }]
     */
    getLast7DaysHistory() {
        const history = this.getHistory();
        const last7Days = Utils.getLast7Days();

        return last7Days.map(date => ({
            date,
            count: history[date] || 0,
            weekDay: Utils.getWeekDay(date)
        }));
    },

    /**
     * 清除所有数据
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    /**
     * 重置为默认设置
     */
    resetToDefaults() {
        this.clearAll();
        return {
            settings: this.getSettings(),
            tasks: this.getTasks()
        };
    },

    /**
     * 导出所有数据
     * @returns {Object} 所有数据
     */
    exportData() {
        return {
            settings: this.getSettings(),
            stats: this.getStats(),
            tasks: this.getTasks(),
            history: this.getHistory()
        };
    },

    /**
     * 导入数据
     * @param {Object} data - 数据对象
     */
    importData(data) {
        if (data.settings) this.saveSettings(data.settings);
        if (data.stats) this.saveStats(data.stats);
        if (data.tasks) this.saveTasks(data.tasks);
        if (data.history) {
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(data.history));
        }
    }
};
