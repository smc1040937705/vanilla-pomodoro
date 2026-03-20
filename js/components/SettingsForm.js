/**
 * SettingsForm 组件 - 设置表单
 */
class SettingsForm {
    /**
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            onSave: null,
            ...options
        };

        this.settings = {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15
        };

        this.errors = {};

        this.init();
    }

    /**
     * 获取DOM元素
     */
    _getElements() {
        // 获取表单元素
        this.inputs = {
            workDuration: document.getElementById('workDuration'),
            breakDuration: document.getElementById('breakDuration'),
            longBreakDuration: document.getElementById('longBreakDuration')
        };

        this.errorElements = {
            workDuration: document.getElementById('workDurationError'),
            breakDuration: document.getElementById('breakDurationError'),
            longBreakDuration: document.getElementById('longBreakDurationError')
        };

        this.saveBtn = document.getElementById('saveSettings');
    }

    /**
     * 初始化
     */
    init() {
        this._getElements();
        this._bindEvents();
        this._bindInputValidation();
    }

    /**
     * 绑定事件
     */
    _bindEvents() {
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.save();
            });
        }
    }

    /**
     * 绑定输入验证
     */
    _bindInputValidation() {
        Object.keys(this.inputs).forEach(key => {
            const input = this.inputs[key];
            if (!input) return;

            input.addEventListener('input', () => {
                this._validateField(key, input.value);
            });

            input.addEventListener('blur', () => {
                this._validateField(key, input.value);
            });
        });
    }

    /**
     * 验证单个字段
     * @param {string} field - 字段名
     * @param {string} value - 字段值
     */
    _validateField(field, value) {
        const numValue = parseInt(value, 10);
        let error = '';

        if (isNaN(numValue)) {
            error = '请输入有效数字';
        } else {
            switch (field) {
                case 'workDuration':
                    if (numValue < 1 || numValue > 60) {
                        error = '专注时长必须在 1-60 分钟之间';
                    }
                    break;
                case 'breakDuration':
                    if (numValue < 1 || numValue > 30) {
                        error = '短休息时长必须在 1-30 分钟之间';
                    }
                    break;
                case 'longBreakDuration':
                    if (numValue < 1 || numValue > 60) {
                        error = '长休息时长必须在 1-60 分钟之间';
                    }
                    break;
            }
        }

        this.errors[field] = error;
        this._showFieldError(field, error);

        // 验证长休息和短休息的关系
        this._validateBreakDuration();

        return !error;
    }

    /**
     * 验证休息时长关系
     */
    _validateBreakDuration() {
        const breakDuration = parseInt(this.inputs.breakDuration.value, 10);
        const longBreakDuration = parseInt(this.inputs.longBreakDuration.value, 10);

        if (!isNaN(breakDuration) && !isNaN(longBreakDuration) && longBreakDuration < breakDuration) {
            this.errors.longBreakDuration = '长休息时长不能短于短休息时长';
            this._showFieldError('longBreakDuration', this.errors.longBreakDuration);
            return false;
        } else if (this.errors.longBreakDuration === '长休息时长不能短于短休息时长') {
            delete this.errors.longBreakDuration;
            this._showFieldError('longBreakDuration', '');
        }
        return true;
    }

    /**
     * 显示字段错误
     * @param {string} field - 字段名
     * @param {string} error - 错误信息
     */
    _showFieldError(field, error) {
        const input = this.inputs[field];
        const errorEl = this.errorElements[field];

        if (input) {
            if (error) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        }

        if (errorEl) {
            errorEl.textContent = error;
        }
    }

    /**
     * 验证所有字段
     * @returns {boolean}
     */
    validate() {
        let isValid = true;

        Object.keys(this.inputs).forEach(key => {
            const input = this.inputs[key];
            if (input) {
                const valid = this._validateField(key, input.value);
                if (!valid) isValid = false;
            }
        });

        // 验证休息时长关系
        if (!this._validateBreakDuration()) {
            isValid = false;
        }

        return isValid;
    }

    /**
     * 保存设置
     */
    save() {
        if (!this.validate()) {
            Utils.showNotification('请检查输入是否正确', 'error');
            return false;
        }

        this.settings = {
            workDuration: parseInt(this.inputs.workDuration.value, 10),
            breakDuration: parseInt(this.inputs.breakDuration.value, 10),
            longBreakDuration: parseInt(this.inputs.longBreakDuration.value, 10)
        };

        // 保存到 localStorage
        Storage.saveSettings(this.settings);

        // 通知回调
        if (this.options.onSave) {
            this.options.onSave(this.settings);
        }

        Utils.showNotification('设置已保存', 'success');
        return true;
    }

    /**
     * 加载设置
     * @param {Object} settings - 设置对象
     */
    load(settings) {
        this.settings = { ...this.settings, ...settings };

        if (this.inputs.workDuration) {
            this.inputs.workDuration.value = this.settings.workDuration;
        }
        if (this.inputs.breakDuration) {
            this.inputs.breakDuration.value = this.settings.breakDuration;
        }
        if (this.inputs.longBreakDuration) {
            this.inputs.longBreakDuration.value = this.settings.longBreakDuration;
        }

        // 清除错误
        Object.keys(this.errors).forEach(key => {
            this.errors[key] = '';
            this._showFieldError(key, '');
        });
    }

    /**
     * 获取当前设置
     * @returns {Object}
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 重置为默认值
     */
    reset() {
        this.load({
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15
        });
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 清理事件监听
        Object.keys(this.inputs).forEach(key => {
            const input = this.inputs[key];
            if (input) {
                input.replaceWith(input.cloneNode(true));
            }
        });

        if (this.saveBtn) {
            this.saveBtn.replaceWith(this.saveBtn.cloneNode(true));
        }
    }
}
