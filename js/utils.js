const Utils = {
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    getTodayKey() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    },

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                key: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
                label: `${date.getMonth() + 1}/${date.getDate()}`
            });
        }
        return days;
    },

    playAlertSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

const Storage = {
    KEYS: {
        SETTINGS: 'pomodoro_settings',
        STATS: 'pomodoro_stats',
        TASKS: 'pomodoro_tasks'
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    getSettings() {
        return this.get(this.KEYS.SETTINGS, {
            workDuration: 25 * 60 * 1000,
            shortRestDuration: 5 * 60 * 1000,
            longRestDuration: 15 * 60 * 1000,
            longRestInterval: 4
        });
    },

    saveSettings(settings) {
        this.set(this.KEYS.SETTINGS, settings);
    },

    getStats() {
        return this.get(this.KEYS.STATS, {});
    },

    addPomodoros(dateKey, count = 1) {
        const stats = this.getStats();
        stats[dateKey] = (stats[dateKey] || 0) + count;
        this.set(this.KEYS.STATS, stats);
        return stats;
    },

    getTasks() {
        return this.get(this.KEYS.TASKS, []);
    },

    saveTasks(tasks) {
        this.set(this.KEYS.TASKS, tasks);
    }
};
