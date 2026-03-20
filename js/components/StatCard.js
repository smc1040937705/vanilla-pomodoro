class StatCard {
    constructor(container, options = {}) {
        this.container = container;
        this.icon = options.icon || '📊';
        this.label = options.label || '统计';
        this.value = options.value || 0;
        this.color = options.color || '#ef4444';
        
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.element = document.createElement('div');
        this.element.className = 'stat-card';
        this.element.innerHTML = `
            <div class="stat-icon">${this.icon}</div>
            <div class="stat-value" style="color: ${this.color}">${this.value}</div>
            <div class="stat-label">${this.label}</div>
        `;
        this.container.appendChild(this.element);
        
        this.valueElement = this.element.querySelector('.stat-value');
    }

    setValue(value) {
        this.value = value;
        if (this.valueElement) {
            this.valueElement.textContent = value;
        }
    }

    destroy() {
        this.element.remove();
    }
}

class StatsManager {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.init();
    }

    init() {
        const cardConfigs = [
            { icon: '🍅', label: '今日番茄数', color: '#ef4444', key: 'today' },
            { icon: '⏱️', label: '专注分钟', color: '#3b82f6', key: 'minutes' },
            { icon: '📈', label: '本周总计', color: '#22c55e', key: 'week' },
            { icon: '🎯', label: '完成任务', color: '#f59e0b', key: 'tasks' }
        ];

        this.cards = cardConfigs.map(config => {
            const card = new StatCard(this.container, config);
            return { ...config, card };
        });

        this.updateStats();
    }

    updateStats() {
        const stats = Storage.getStats();
        const todayKey = Utils.getTodayKey();
        const last7Days = Utils.getLast7Days();
        
        const todayCount = stats[todayKey] || 0;
        const weekCount = last7Days.reduce((sum, day) => sum + (stats[day.key] || 0), 0);
        const workMinutes = todayCount * 25;
        const tasks = Storage.getTasks().filter(t => t.completed).length;

        this.cards.forEach(({ key, card }) => {
            switch (key) {
                case 'today':
                    card.setValue(todayCount);
                    break;
                case 'minutes':
                    card.setValue(workMinutes);
                    break;
                case 'week':
                    card.setValue(weekCount);
                    break;
                case 'tasks':
                    card.setValue(tasks);
                    break;
            }
        });
    }

    destroy() {
        this.cards.forEach(({ card }) => card.destroy());
    }
}
