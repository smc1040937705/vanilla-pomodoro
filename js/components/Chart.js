/**
 * Chart 组件 - Canvas折线图
 */
class Chart {
    /**
     * @param {string} canvasId - Canvas元素ID
     * @param {Object} options - 配置选项
     */
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;

        // 默认配置
        this.options = {
            lineColor: '#ef4444',
            fillColor: 'rgba(239, 68, 68, 0.1)',
            gridColor: '#e5e7eb',
            textColor: '#6b7280',
            lineWidth: 3,
            pointRadius: 5,
            fontSize: 12,
            padding: { top: 30, right: 20, bottom: 40, left: 40 },
            ...options
        };

        this.data = [];

        this.init();

        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * 初始化
     */
    init() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // 设置canvas实际尺寸
        this.resize();
    }

    /**
     * 调整canvas尺寸
     */
    resize() {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.width = rect.width;
        this.height = rect.height;

        const ctx = this.ctx;
        ctx.scale(dpr, dpr);
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        if (!this.canvas) return;
        this.resize();
        this.draw();
    }

    /**
     * 设置数据
     * @param {Array} data - 数据数组 [{ date, count, weekDay }]
     */
    setData(data) {
        this.data = data;
        this.draw();
    }

    /**
     * 绘制图表
     */
    draw() {
        if (!this.canvas || !this.ctx) return;

        const { ctx, width, height } = this;
        const { padding, lineColor, fillColor, gridColor, textColor, lineWidth, pointRadius, fontSize } = this.options;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        if (this.data.length === 0) return;

        // 计算绘图区域
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // 计算数据范围
        const maxCount = Math.max(...this.data.map(d => d.count), 1);
        const minCount = 0;

        // 辅助函数：坐标转换
        const getX = (index) => padding.left + (index / (this.data.length - 1)) * chartWidth;
        const getY = (count) => padding.top + chartHeight - ((count - minCount) / (maxCount - minCount)) * chartHeight;

        // 绘制网格线
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // 水平网格线
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Y轴标签
            ctx.fillStyle = textColor;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const value = Math.round(maxCount - (maxCount / gridLines) * i);
            ctx.fillText(value.toString(), padding.left - 8, y);
        }

        ctx.setLineDash([]);

        // 绘制X轴标签
        this.data.forEach((item, index) => {
            const x = getX(index);
            ctx.fillStyle = textColor;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(item.weekDay, x, height - padding.bottom + 8);
        });

        // 绘制填充区域
        ctx.beginPath();
        ctx.moveTo(getX(0), padding.top + chartHeight);
        this.data.forEach((item, index) => {
            const x = getX(index);
            const y = getY(item.count);
            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                // 使用贝塞尔曲线使线条更平滑
                const prevX = getX(index - 1);
                const prevY = getY(this.data[index - 1].count);
                const cpX = (prevX + x) / 2;
                ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
            }
        });
        ctx.lineTo(getX(this.data.length - 1), padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();

        // 绘制折线
        ctx.beginPath();
        this.data.forEach((item, index) => {
            const x = getX(index);
            const y = getY(item.count);
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevX = getX(index - 1);
                const prevY = getY(this.data[index - 1].count);
                const cpX = (prevX + x) / 2;
                ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
            }
        });
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // 绘制数据点
        this.data.forEach((item, index) => {
            const x = getX(index);
            const y = getY(item.count);

            // 外圈
            ctx.beginPath();
            ctx.arc(x, y, pointRadius + 2, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();

            // 内圈
            ctx.beginPath();
            ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
            ctx.fillStyle = lineColor;
            ctx.fill();

            // 数值标签
            if (item.count > 0) {
                ctx.fillStyle = textColor;
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(item.count.toString(), x, y - pointRadius - 4);
            }
        });
    }

    /**
     * 动画绘制图表
     * @param {Array} data - 数据数组
     * @param {number} duration - 动画时长（毫秒）
     */
    animateDraw(data, duration = 800) {
        const startTime = performance.now();
        const targetData = data;
        const startData = this.data.length > 0 ? this.data : targetData.map(d => ({ ...d, count: 0 }));

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / duration, 1);

            // 使用 easeOutCubic 缓动函数
            const easeT = 1 - Math.pow(1 - t, 3);

            // 插值计算当前数据
            this.data = targetData.map((target, index) => {
                const start = startData[index] || { count: 0 };
                return {
                    ...target,
                    count: Math.round(start.count + (target.count - start.count) * easeT)
                };
            });

            this.draw();

            if (t < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * 销毁组件
     */
    destroy() {
        window.removeEventListener('resize', this.handleResize.bind(this));
    }
}
