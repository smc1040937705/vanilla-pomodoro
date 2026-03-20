class SettingsForm {
    constructor(container, options = {}) {
        this.container = container;
        this.settings = options.settings || Storage.getSettings();
        this.onSave = options.onSave || (() => {});
        this.onClose = options.onClose || (() => {});
        
        this.errors = {};
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="modal-header">
                <h2>⚙️ 设置</h2>
                <button class="modal-close" id="modal-close">&times;</button>
            </div>
            <form id="settings-form-element">
                <div class="form-group">
                    <label for="workDuration">工作时长（分钟）</label>
                    <input type="number" id="workDuration" 
                           value="${this.settings.workDuration / 60000}" 
                           min="1" max="120">
                    <div class="error-message" id="workDuration-error">请输入1-120之间的数字</div>
                </div>
                <div class="form-group">
                    <label for="shortRestDuration">短休息时长（分钟）</label>
                    <input type="number" id="shortRestDuration" 
                           value="${this.settings.shortRestDuration / 60000}" 
                           min="1" max="30">
                    <div class="error-message" id="shortRestDuration-error">请输入1-30之间的数字</div>
                </div>
                <div class="form-group">
                    <label for="longRestDuration">长休息时长（分钟）</label>
                    <input type="number" id="longRestDuration" 
                           value="${this.settings.longRestDuration / 60000}" 
                           min="1" max="60">
                    <div class="error-message" id="longRestDuration-error">请输入1-60之间的数字</div>
                </div>
                <div class="form-group">
                    <label for="longRestInterval">长休息间隔（番茄数）</label>
                    <input type="number" id="longRestInterval" 
                           value="${this.settings.longRestInterval}" 
                           min="1" max="10">
                    <div class="error-message" id="longRestInterval-error">请输入1-10之间的数字</div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-btn">取消</button>
                    <button type="submit" class="btn btn-primary">保存</button>
                </div>
            </form>
        `;

        this.form = this.container.querySelector('#settings-form-element');
        this.closeBtn = this.container.querySelector('#modal-close');
        this.cancelBtn = this.container.querySelector('#cancel-btn');
        this.inputs = {
            workDuration: this.container.querySelector('#workDuration'),
            shortRestDuration: this.container.querySelector('#shortRestDuration'),
            longRestDuration: this.container.querySelector('#longRestDuration'),
            longRestInterval: this.container.querySelector('#longRestInterval')
        };
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.closeBtn.addEventListener('click', () => this.onClose());
        this.cancelBtn.addEventListener('click', () => this.onClose());

        Object.keys(this.inputs).forEach(key => {
            this.inputs[key].addEventListener('input', () => {
                this.validateField(key);
            });
        });
    }

    validateField(key) {
        const input = this.inputs[key];
        const value = parseInt(input.value);
        const errorElement = this.container.querySelector(`#${key}-error`);
        let isValid = true;
        let errorMessage = '';

        const ranges = {
            workDuration: { min: 1, max: 120, message: '请输入1-120之间的数字' },
            shortRestDuration: { min: 1, max: 30, message: '请输入1-30之间的数字' },
            longRestDuration: { min: 1, max: 60, message: '请输入1-60之间的数字' },
            longRestInterval: { min: 1, max: 10, message: '请输入1-10之间的数字' }
        };

        const range = ranges[key];
        
        if (isNaN(value) || value < range.min || value > range.max) {
            isValid = false;
            errorMessage = range.message;
        }

        if (isValid) {
            input.classList.remove('error');
            errorElement.classList.remove('show');
            delete this.errors[key];
        } else {
            input.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
            this.errors[key] = true;
        }

        return isValid;
    }

    validateCrossRules() {
        let isValid = true;
        const workDuration = parseInt(this.inputs.workDuration.value);
        const shortRestDuration = parseInt(this.inputs.shortRestDuration.value);
        const longRestDuration = parseInt(this.inputs.longRestDuration.value);

        const shortRestError = this.container.querySelector('#shortRestDuration-error');
        const longRestError = this.container.querySelector('#longRestDuration-error');

        if (shortRestDuration > workDuration) {
            isValid = false;
            this.inputs.shortRestDuration.classList.add('error');
            shortRestError.textContent = '短休息时长不能超过工作时长';
            shortRestError.classList.add('show');
            this.errors['shortRestDuration'] = true;
        }

        if (longRestDuration < shortRestDuration) {
            isValid = false;
            this.inputs.longRestDuration.classList.add('error');
            longRestError.textContent = '长休息时长不能少于短休息时长';
            longRestError.classList.add('show');
            this.errors['longRestDuration'] = true;
        }

        return isValid;
    }

    validate() {
        let isValid = true;
        Object.keys(this.inputs).forEach(key => {
            if (!this.validateField(key)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            isValid = this.validateCrossRules();
        }
        
        return isValid;
    }

    handleSubmit() {
        if (!this.validate()) {
            return;
        }

        const newSettings = {
            workDuration: parseInt(this.inputs.workDuration.value) * 60000,
            shortRestDuration: parseInt(this.inputs.shortRestDuration.value) * 60000,
            longRestDuration: parseInt(this.inputs.longRestDuration.value) * 60000,
            longRestInterval: parseInt(this.inputs.longRestInterval.value)
        };

        Storage.saveSettings(newSettings);
        this.onSave(newSettings);
        this.onClose();
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
