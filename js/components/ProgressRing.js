/**
 * ProgressRing 组件 - Canvas圆环进度条
 */
class ProgressRing {
    /**
     * @param {string} canvasId - Canvas元素ID
     * @param {Object} options - 配置选项
     */
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;

        // 默认配置
        this.options = {
            strokeWidth: 8,
            bgColor: '#e5e7eb',
            workColor: '#ef4444',
            breakColor: '#22c55e',
            longBreakColor: '#3b82f6',
            ...options
        };

        this.currentProgress = 0;
        this.currentMode = 'work';
        this.animationId = null;

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.size = this.canvas.width;
        this.center = this.size / 2;
        this.radius = (this.size - 20) / 2;
    }

    /**
     * 绘制圆环
     * @param {number} progress - 进度 (0-1)
     * @param {string} mode - 当前模式 ('work' | 'break' | 'longBreak')
     */
    draw(progress, mode = 'work') {
        if (!this.canvas || !this.ctx) return;

        this.currentProgress = progress;
        this.currentMode = mode;

        const { ctx, center, radius } = this;
        const { strokeWidth, bgColor } = this.options;

        // 清空画布
        ctx.clearRect(0, 0, this.size, this.size);

        // 绘制背景圆环
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 计算颜色
        let color = this.options.workColor;
        if (mode === 'break') color = this.options.breakColor;
        if (mode === 'longBreak') color = this.options.longBreakColor;

        // 绘制进度圆环
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * progress);

        ctx.beginPath();
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 绘制发光效果
        if (progress > 0) {
            ctx.beginPath();
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.strokeStyle = color + '40';
            ctx.lineWidth = strokeWidth + 4;
            ctx.stroke();
        }
    }

    /**
     * 动画过渡到指定进度
     * @param {number} targetProgress - 目标进度
     * @param {string} mode - 当前模式
     * @param {number} duration - 动画时长（毫秒）
     */
    animateTo(targetProgress, mode = 'work', duration = 300) {
        const startProgress = this.currentProgress;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / duration, 1);

            // 使用 easeOutCubic 缓动函数
            const easeT = 1 - Math.pow(1 - t, 3);
            const currentProgress = startProgress + (targetProgress - startProgress) * easeT;

            this.draw(currentProgress, mode);

            if (t < 1) {
                this.animationId = requestAnimationFrame(animate);
            }
        };

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.animationId = requestAnimationFrame(animate);
    }

    /**
     * 设置进度（无动画）
     * @param {number} progress - 进度 (0-1)
     * @param {string} mode - 当前模式
     */
    setProgress(progress, mode = 'work') {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.draw(progress, mode);
    }

    /**
     * 完成动画 - 圆环填满并闪烁
     */
    playCompleteAnimation() {
        const { ctx, center, radius, size } = this;
        const { strokeWidth } = this.options;
        let color = this.options.workColor;
        if (this.currentMode === 'break') color = this.options.breakColor;
        if (this.currentMode === 'longBreak') color = this.options.longBreakColor;

        let frame = 0;
        const totalFrames = 30;

        const animate = () => {
            frame++;
            const progress = frame / totalFrames;

            // 清空画布
            ctx.clearRect(0, 0, size, size);

            // 绘制背景圆环
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.options.bgColor;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 绘制闪烁效果
            const alpha = Math.sin(progress * Math.PI);
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth + alpha * 4;
            ctx.stroke();

            // 绘制主圆环
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();

            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            } else {
                this.draw(1, this.currentMode);
            }
        };

        animate();
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
