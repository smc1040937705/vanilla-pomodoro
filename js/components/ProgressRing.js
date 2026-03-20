class ProgressRing {
    constructor(container, options = {}) {
        this.container = container;
        this.size = options.size || 250;
        this.strokeWidth = options.strokeWidth || 8;
        this.color = options.color || '#ef4444';
        
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'timer-canvas';
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.centerX = this.size / 2;
        this.centerY = this.size / 2;
        this.radius = (this.size - this.strokeWidth) / 2 - 10;
    }

    draw(progress) {
        this.ctx.clearRect(0, 0, this.size, this.size);
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.stroke();
        
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (2 * Math.PI * progress);
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }

    setColor(color) {
        this.color = color;
    }

    destroy() {
        this.canvas.remove();
    }
}
