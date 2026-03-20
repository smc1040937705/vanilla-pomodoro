/**
 * 工具函数模块
 */

const Utils = {
    /**
     * 格式化时间为 MM:SS
     * @param {number} milliseconds - 毫秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(milliseconds) {
        const totalSeconds = Math.ceil(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * 格式化日期为 YYYY-MM-DD
     * @param {Date} date - 日期对象
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 获取最近7天的日期数组
     * @returns {string[]} 日期字符串数组
     */
    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(this.formatDate(date));
        }
        return days;
    },

    /**
     * 获取星期几的简写
     * @param {string} dateStr - 日期字符串 YYYY-MM-DD
     * @returns {string} 星期简写
     */
    getWeekDay(dateStr) {
        const date = new Date(dateStr);
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        return `周${weekDays[date.getDay()]}`;
    },

    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
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
    },

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * 播放提示音
     * @param {string} type - 提示音类型 ('work' | 'break')
     */
    playNotificationSound(type = 'work') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'work') {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        } else {
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.2);
        }

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    },

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 ('success' | 'error')
     * @param {number} duration - 显示时长（毫秒）
     */
    showNotification(message, type = 'success', duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    },

    /**
     * 验证设置表单
     * @param {Object} settings - 设置对象
     * @returns {Object} 验证结果 { isValid: boolean, errors: Object }
     */
    validateSettings(settings) {
        const errors = {};

        if (!settings.workDuration || settings.workDuration < 1 || settings.workDuration > 60) {
            errors.workDuration = '专注时长必须在 1-60 分钟之间';
        }

        if (!settings.breakDuration || settings.breakDuration < 1 || settings.breakDuration > 30) {
            errors.breakDuration = '短休息时长必须在 1-30 分钟之间';
        }

        if (!settings.longBreakDuration || settings.longBreakDuration < 1 || settings.longBreakDuration > 60) {
            errors.longBreakDuration = '长休息时长必须在 1-60 分钟之间';
        }

        // 长休息必须大于等于短休息
        if (settings.longBreakDuration && settings.breakDuration && 
            settings.longBreakDuration < settings.breakDuration) {
            errors.longBreakDuration = '长休息时长不能短于短休息时长';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * 深拷贝对象
     * @param {Object} obj - 要拷贝的对象
     * @returns {Object} 拷贝后的对象
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * 节流函数
     * @param {Function} func - 要执行的函数
     * @param {number} limit - 限制时间（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};
