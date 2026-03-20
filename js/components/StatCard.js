/**
 * StatCard 组件 - 统计卡片
 */
class StatCard {
    /**
     * @param {string} containerId - 容器元素ID
     */
    constructor(containerId) {
        this.containerId = containerId;

        this.stats = {
            today: 0,
            total: 0,
            streak: 0
        };

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
     * 更新统计数据
     * @param {Object} stats - 统计数据
     */
    update(stats) {
        this.stats = { ...this.stats, ...stats };
        this.render();
    }

    /**
     * 渲染统计卡片
     */
    render() {
        if (!this.container) return;

        const cards = [
            {
                value: this.stats.today,
                label: '今日番茄',
                icon: '🍅'
            },
            {
                value: this.stats.total,
                label: '累计番茄',
                icon: '📊'
            },
            {
                value: this.stats.streak,
                label: '连续天数',
                icon: '🔥'
            }
        ];

        this.container.innerHTML = cards.map(card => `
            <div class="stat-card">
                <div class="stat-value">${card.value}</div>
                <div class="stat-label">${card.icon} ${card.label}</div>
            </div>
        `).join('');
    }

    /**
     * 动画更新数值
     * @param {string} type - 统计类型 ('today' | 'total' | 'streak')
     * @param {number} newValue - 新值
     */
    animateUpdate(type, newValue) {
        const index = type === 'today' ? 0 : type === 'total' ? 1 : 2;
        const card = this.container.children[index];
        if (!card) return;

        const valueEl = card.querySelector('.stat-value');
        const oldValue = this.stats[type];
        const diff = newValue - oldValue;

        if (diff === 0) return;

        let current = oldValue;
        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / duration, 1);

            // 使用 easeOutQuart 缓动函数
            const easeT = 1 - Math.pow(1 - t, 4);
            current = Math.round(oldValue + diff * easeT);
            valueEl.textContent = current;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                this.stats[type] = newValue;
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.container.innerHTML = '';
    }
}
