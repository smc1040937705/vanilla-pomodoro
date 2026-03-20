/**
 * Timer 组件 - 计时器核心逻辑
 */
class Timer {
    /**
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            onTick: null,
            onComplete: null,
            onStateChange: null,
            ...options
        };

        this.state = 'idle'; // 'idle' | 'running' | 'paused'
        this.mode = 'work'; // 'work' | 'break' | 'longBreak'
        this.remainingTime = 0;
        this.totalTime = 0;
        this.startTime = 0;
        this.pauseTime = 0;
        this.timerId = null;
        this.completedPomodoros = 0;

        this.init();
    }

    /**
     * 初始化计时器
     */
    init() {
        this.setMode('work');
    }

    /**
     * 设置计时器模式
     * @param {string} mode - 模式 ('work' | 'break' | 'longBreak')
     */
    setMode(mode) {
        this.mode = mode;
        let duration;

        switch (mode) {
            case 'work':
                duration = this.options.workDuration;
                break;
            case 'break':
                duration = this.options.breakDuration;
                break;
            case 'longBreak':
                duration = this.options.longBreakDuration;
                break;
            default:
                duration = this.options.workDuration;
        }

        this.totalTime = duration * 60 * 1000;
        this.remainingTime = this.totalTime;
        this.state = 'idle';

        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        this._notifyStateChange();
        this._notifyTick();
    }

    /**
     * 开始计时
     */
    start() {
        if (this.state === 'running') return;

        if (this.state === 'idle') {
            this.startTime = Date.now();
        } else if (this.state === 'paused') {
            const pausedDuration = Date.now() - this.pauseTime;
            this.startTime += pausedDuration;
        }

        this.state = 'running';
        this._notifyStateChange();

        this.timerId = setInterval(() => {
            this._tick();
        }, 100); // 每100ms检查一次，确保精度
    }

    /**
     * 暂停计时
     */
    pause() {
        if (this.state !== 'running') return;

        this.state = 'paused';
        this.pauseTime = Date.now();

        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        this._notifyStateChange();
    }

    /**
     * 重置计时器
     */
    reset() {
        this.state = 'idle';
        this.remainingTime = this.totalTime;

        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        this._notifyStateChange();
        this._notifyTick();
    }

    /**
     * 切换开始/暂停
     */
    toggle() {
        if (this.state === 'running') {
            this.pause();
        } else {
            this.start();
        }
    }

    /**
     * 计时器滴答
     */
    _tick() {
        const now = Date.now();
        const elapsed = now - this.startTime;
        this.remainingTime = Math.max(0, this.totalTime - elapsed);

        this._notifyTick();

        if (this.remainingTime <= 0) {
            this._complete();
        }
    }

    /**
     * 计时完成
     */
    _complete() {
        this.state = 'idle';

        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        // 记录完成的番茄数
        if (this.mode === 'work') {
            this.completedPomodoros++;
        }

        this._notifyComplete();
        this._notifyStateChange();
    }

    /**
     * 切换到下一个模式
     */
    nextMode() {
        if (this.mode === 'work') {
            // 每4个番茄后长休息
            if (this.completedPomodoros > 0 && this.completedPomodoros % 4 === 0) {
                this.setMode('longBreak');
            } else {
                this.setMode('break');
            }
        } else {
            this.setMode('work');
        }
    }

    /**
     * 获取当前进度 (0-1)
     */
    getProgress() {
        return 1 - (this.remainingTime / this.totalTime);
    }

    /**
     * 获取剩余时间（毫秒）
     */
    getRemainingTime() {
        return this.remainingTime;
    }

    /**
     * 获取格式化后的剩余时间
     */
    getFormattedTime() {
        return Utils.formatTime(this.remainingTime);
    }

    /**
     * 获取当前状态
     */
    getState() {
        return {
            state: this.state,
            mode: this.mode,
            remainingTime: this.remainingTime,
            totalTime: this.totalTime,
            progress: this.getProgress(),
            formattedTime: this.getFormattedTime(),
            completedPomodoros: this.completedPomodoros
        };
    }

    /**
     * 更新设置
     * @param {Object} settings - 设置对象
     */
    updateSettings(settings) {
        this.options = { ...this.options, ...settings };

        // 如果当前处于idle状态，更新当前模式的时间
        if (this.state === 'idle') {
            this.setMode(this.mode);
        }
    }

    /**
     * 通知状态变化
     */
    _notifyStateChange() {
        if (this.options.onStateChange) {
            this.options.onStateChange(this.getState());
        }
    }

    /**
     * 通知时间变化
     */
    _notifyTick() {
        if (this.options.onTick) {
            this.options.onTick(this.getState());
        }
    }

    /**
     * 通知计时完成
     */
    _notifyComplete() {
        if (this.options.onComplete) {
            this.options.onComplete({
                mode: this.mode,
                completedPomodoros: this.completedPomodoros
            });
        }
    }

    /**
     * 销毁计时器
     */
    destroy() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
}
