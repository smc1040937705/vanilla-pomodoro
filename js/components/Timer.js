class Timer {
    constructor(container, options = {}) {
        this.container = container;
        this.settings = options.settings || Storage.getSettings();
        this.onComplete = options.onComplete || (() => {});
        this.onModeChange = options.onModeChange || (() => {});
        
        this.mode = 'work';
        this.status = 'idle';
        this.remainingTime = this.settings.workDuration;
        this.totalTime = this.settings.workDuration;
        this.pomodoroCount = 0;
        this.timerId = null;
        this.startTime = null;
        this.pauseTime = null;
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateDisplay();
    }

    render() {
        this.container.innerHTML = `
            <div class="timer-display">
                <div id="progress-ring"></div>
                <div class="timer-text">
                    <div class="timer-label" id="timer-label">工作时间</div>
                    <div class="timer-time" id="timer-time">25:00</div>
                </div>
            </div>
            <div class="current-task" id="current-task" style="display: none; margin-bottom: 20px; padding: 12px 20px; background: #fef3c7; border-radius: 8px; text-align: center;">
                <span style="color: #92400e; font-weight: 500;">🎯 当前专注：</span>
                <span id="current-task-name" style="color: #78350f; font-weight: 600;"></span>
            </div>
            <div class="timer-controls">
                <button class="btn btn-primary" id="start-btn">开始</button>
                <button class="btn btn-secondary" id="reset-btn">重置</button>
            </div>
            <div class="mode-selector">
                <button class="mode-btn work active" data-mode="work">工作</button>
                <button class="mode-btn rest" data-mode="shortRest">短休息</button>
                <button class="mode-btn rest" data-mode="longRest">长休息</button>
            </div>
        `;
        
        const progressContainer = this.container.querySelector('#progress-ring');
        this.progressRing = new ProgressRing(progressContainer, {
            color: '#ef4444'
        });
        
        this.timerLabel = this.container.querySelector('#timer-label');
        this.timerTime = this.container.querySelector('#timer-time');
        this.startBtn = this.container.querySelector('#start-btn');
        this.resetBtn = this.container.querySelector('#reset-btn');
        this.modeBtns = this.container.querySelectorAll('.mode-btn');
        this.currentTaskEl = this.container.querySelector('#current-task');
        this.currentTaskNameEl = this.container.querySelector('#current-task-name');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggle());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.setMode(mode);
            });
        });
    }

    toggle() {
        if (this.status === 'running') {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (this.status === 'completed') {
            this.reset();
        }
        
        this.status = 'running';
        this.startBtn.textContent = '暂停';
        this.updateBodyClass();
        
        if (this.pauseTime) {
            this.startTime = Date.now() - (this.pauseTime - this.startTime);
        } else {
            this.startTime = Date.now();
        }
        
        this.timerId = requestAnimationFrame(() => this.tick());
    }

    pause() {
        this.status = 'paused';
        this.pauseTime = Date.now();
        this.startBtn.textContent = '继续';
        this.updateBodyClass();
        
        if (this.timerId) {
            cancelAnimationFrame(this.timerId);
        }
    }

    reset() {
        this.status = 'idle';
        this.startBtn.textContent = '开始';
        this.remainingTime = this.totalTime;
        this.startTime = null;
        this.pauseTime = null;
        this.updateBodyClass();
        
        if (this.timerId) {
            cancelAnimationFrame(this.timerId);
        }
        
        this.updateDisplay();
    }

    tick() {
        if (this.status !== 'running') return;
        
        const elapsed = Date.now() - this.startTime;
        this.remainingTime = Math.max(0, this.totalTime - elapsed);
        
        this.updateDisplay();
        
        if (this.remainingTime <= 0) {
            this.complete();
        } else {
            this.timerId = requestAnimationFrame(() => this.tick());
        }
    }

    complete() {
        this.status = 'completed';
        this.startBtn.textContent = '开始';
        
        if (this.timerId) {
            cancelAnimationFrame(this.timerId);
        }
        
        Utils.playAlertSound();
        this.showAlert();
        
        if (this.mode === 'work') {
            this.pomodoroCount++;
            Storage.addPomodoros(Utils.getTodayKey());
            this.onComplete();
        }
        
        this.autoSwitchMode();
    }

    autoSwitchMode() {
        if (this.mode === 'work') {
            if (this.pomodoroCount % this.settings.longRestInterval === 0) {
                this.setMode('longRest', false);
            } else {
                this.setMode('shortRest', false);
            }
        } else {
            this.setMode('work', false);
        }
    }

    setMode(mode, userInitiated = true) {
        if (userInitiated) {
            this.pomodoroCount = 0;
        }
        
        this.mode = mode;
        
        switch (mode) {
            case 'work':
                this.totalTime = this.settings.workDuration;
                this.timerLabel.textContent = '工作时间';
                this.progressRing.setColor('#ef4444');
                break;
            case 'shortRest':
                this.totalTime = this.settings.shortRestDuration;
                this.timerLabel.textContent = '短休息';
                this.progressRing.setColor('#22c55e');
                break;
            case 'longRest':
                this.totalTime = this.settings.longRestDuration;
                this.timerLabel.textContent = '长休息';
                this.progressRing.setColor('#22c55e');
                break;
        }
        
        this.remainingTime = this.totalTime;
        this.reset();
        
        this.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.onModeChange(mode);
    }

    updateDisplay() {
        this.timerTime.textContent = Utils.formatTime(this.remainingTime);
        
        const progress = 1 - (this.remainingTime / this.totalTime);
        this.progressRing.draw(progress);
    }

    updateBodyClass() {
        document.body.classList.remove('work-mode', 'rest-mode', 'pause-mode');
        
        if (this.status === 'paused' || this.status === 'idle') {
            document.body.classList.add('pause-mode');
        } else if (this.mode === 'work') {
            document.body.classList.add('work-mode');
        } else {
            document.body.classList.add('rest-mode');
        }
    }

    showAlert() {
        const alertModal = document.getElementById('alert-modal');
        const alertMessage = document.getElementById('alert-message');
        const alertCloseBtn = document.getElementById('alert-close-btn');
        
        if (!alertModal || !alertMessage || !alertCloseBtn) {
            return;
        }
        
        alertMessage.textContent = this.mode === 'work' 
            ? '工作时间结束！休息一下吧 🍅' 
            : '休息时间结束！继续工作吧 💪';
        
        alertModal.classList.add('active');
        
        const closeAlert = () => {
            alertModal.classList.remove('active');
            alertCloseBtn.removeEventListener('click', closeAlert);
        };
        
        alertCloseBtn.addEventListener('click', closeAlert);
        
        setTimeout(() => {
            closeAlert();
        }, 5000);
    }

    updateSettings(settings) {
        this.settings = settings;
        this.setMode(this.mode);
    }

    setCurrentTask(taskName) {
        if (taskName) {
            this.currentTaskNameEl.textContent = taskName;
            this.currentTaskEl.style.display = 'block';
        } else {
            this.currentTaskEl.style.display = 'none';
        }
    }

    getState() {
        return {
            mode: this.mode,
            status: this.status,
            remainingTime: this.remainingTime,
            totalTime: this.totalTime,
            pomodoroCount: this.pomodoroCount
        };
    }

    destroy() {
        if (this.timerId) {
            cancelAnimationFrame(this.timerId);
        }
        this.progressRing.destroy();
    }
}
