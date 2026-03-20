class Chart {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = options.data || [];
        this.labels = options.labels || [];
        this.color = options.color || '#ef4444';
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', Utils.debounce(() => this.resize(), 200));
        this.draw();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = 200 * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = '200px';
        
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = 200;
        
        this.draw();
    }

    setData(data, labels) {
        this.data = data;
        this.labels = labels || this.labels;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (this.data.length === 0) return;

        const padding = { top: 20, right: 20, bottom: 40, left: 10 };
        const chartWidth = this.width - padding.left - padding.right;
        const chartHeight = this.height - padding.top - padding.bottom;
        
        const maxValue = Math.max(...this.data, 1);
        const stepX = chartWidth / (this.data.length - 1 || 1);
        const stepY = chartHeight / maxValue;

        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= maxValue; i++) {
            const y = padding.top + (maxValue - i) * stepY;
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left, y);
            this.ctx.lineTo(this.width - padding.right, y);
            this.ctx.stroke();
        }

        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();

        this.data.forEach((value, index) => {
            const x = padding.left + index * stepX;
            const y = padding.top + (maxValue - value) * stepY;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();

        this.ctx.fillStyle = this.color;
        this.data.forEach((value, index) => {
            const x = padding.left + index * stepX;
            const y = padding.top + (maxValue - value) * stepY;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        this.ctx.textAlign = 'center';
        
        this.labels.forEach((label, index) => {
            const x = padding.left + index * stepX;
            const y = this.height - 10;
            this.ctx.fillText(label, x, y);
        });
    }

    destroy() {
        window.removeEventListener('resize', this.resize);
    }
}

class TrendChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.chart = null;
        this.init();
    }

    init() {
        this.chart = new Chart(this.canvas, {
            color: '#ef4444'
        });
        this.update();
    }

    update() {
        const stats = Storage.getStats();
        const last7Days = Utils.getLast7Days();
        
        const data = last7Days.map(day => stats[day.key] || 0);
        const labels = last7Days.map(day => day.label);
        
        this.chart.setData(data, labels);
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}
