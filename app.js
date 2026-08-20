/**
 * ==========================================================================
 * Calculator Pro v1.4 (Build 72) - Main Application Logic
 * Author: MaxNT Official, 2026
 * ==========================================================================
 */

// Стан застосунку (Application State)
const state = {
    currentInput: '0',
    previousInput: '',
    operator: undefined,
    shouldResetDisplay: false,
    memoryValue: 0,
    angleMode: localStorage.getItem('calc_angle_mode') || 'DEG', // 'DEG' або 'RAD'
    soundEnabled: localStorage.getItem('calc_sound') !== 'false', // true за замовчуванням
    currentTheme: localStorage.getItem('calc_theme') || 'dark',
    history: JSON.parse(localStorage.getItem('calc_history') || '[]')
};

// Елементи інтерфейсу (DOM Elements)
const dom = {
    display: document.getElementById('display'),
    historyLine: document.getElementById('history-line'),
    historyList: document.getElementById('history-list'),
    modeBadge: document.getElementById('mode-badge'),
    memoryBadge: document.getElementById('memory-badge'),
    audioBadge: document.getElementById('audio-badge'),
    footerAudioBtn: document.getElementById('footer-audio-btn'),
    toastContainer: document.getElementById('toast-container')
};

// ==========================================================================
// Аудіо рушій на базі Web Audio API (без сторонніх файлів)
// ==========================================================================
class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick(freq = 600, duration = 0.04) {
        if (!state.soundEnabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + duration);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio feedback failed:', e);
        }
    }

    playAction() {
        this.playClick(850, 0.06);
    }

    playEquals() {
        if (!state.soundEnabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch (e) {}
    }

    playError() {
        if (!state.soundEnabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, this.ctx.currentTime);
            osc.frequency.setValueAtTime(140, this.ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch (e) {}
    }
}

const audio = new SoundEngine();

// ==========================================================================
// Оновлення дисплея та індикаторів
// ==========================================================================
function updateDisplay() {
    if (dom.display) {
        dom.display.innerText = state.currentInput;
    }

    if (dom.historyLine) {
        if (state.operator != null) {
            let opSymbol = state.operator;
            if (opSymbol === '*') opSymbol = '×';
            if (opSymbol === '/') opSymbol = '÷';
            if (opSymbol === '^') opSymbol = '^';
            if (opSymbol === 'mod') opSymbol = 'mod';
            dom.historyLine.innerText = `${state.previousInput} ${opSymbol}`;
        } else {
            dom.historyLine.innerText = '';
        }
    }

    // Індикатор кутового режиму (DEG / RAD)
    if (dom.modeBadge) {
        dom.modeBadge.innerText = state.angleMode;
        dom.modeBadge.title = `Режим: ${state.angleMode === 'DEG' ? 'Градуси' : 'Радіани'} (натисніть, щоб змінити)`;
    }

    // Індикатор пам'яті [M]
    if (dom.memoryBadge) {
        if (state.memoryValue !== 0) {
            dom.memoryBadge.classList.add('active');
            dom.memoryBadge.innerText = `M (${formatResult(state.memoryValue)})`;
        } else {
            dom.memoryBadge.classList.remove('active');
        }
    }

    // Індикатор звуку
    updateAudioUI();
}

function updateAudioUI() {
    const icon = state.soundEnabled ? '🔊' : '🔇';
    if (dom.audioBadge) dom.audioBadge.innerText = icon;
    if (dom.footerAudioBtn) dom.footerAudioBtn.innerHTML = `<span>${icon}</span> Звук: ${state.soundEnabled ? 'Увімк.' : 'Вимк.'}`;
}

// ==========================================================================
// Перемикачі та системні функції
// ==========================================================================

// Перемикання DEG / RAD
function toggleAngleMode() {
    state.angleMode = state.angleMode === 'DEG' ? 'RAD' : 'DEG';
    localStorage.setItem('calc_angle_mode', state.angleMode);
    audio.playAction();
    updateDisplay();
    showToast(`Кутовий режим: ${state.angleMode === 'DEG' ? 'Градуси (DEG)' : 'Радіани (RAD)'}`, '📐');
}

// Перемикання звуку
function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('calc_sound', state.soundEnabled);
    if (state.soundEnabled) audio.playAction();
    updateAudioUI();
    showToast(state.soundEnabled ? 'Звукові ефекти увімкнено' : 'Звукові ефекти вимкнено', state.soundEnabled ? '🔊' : '🔇');
}

// Повернення на головну
function goHome() {
    audio.playAction();
    clearDisplay();
    state.memoryValue = 0;
    updateDisplay();
    openModal('home-modal');
}

// Повне очищення (C)
function clearDisplay() {
    audio.playAction();
    state.currentInput = '0';
    state.previousInput = '';
    state.operator = undefined;
    state.shouldResetDisplay = false;
    updateDisplay();
}

// Видалення останнього символу (Backspace)
function backspace() {
    audio.playClick(500);
    if (state.shouldResetDisplay) return;
    if (
        state.currentInput.length === 1 ||
        (state.currentInput.length === 2 && state.currentInput.startsWith('-')) ||
        isNaN(parseFloat(state.currentInput))
    ) {
        state.currentInput = '0';
    } else {
        state.currentInput = state.currentInput.slice(0, -1);
    }
    updateDisplay();
}

// Додавання цифри або десяткової крапки
function appendNumber(number) {
    audio.playClick(650);
    if (isNaN(parseFloat(state.currentInput)) && state.currentInput !== '.') {
        clearDisplay();
    }
    if (state.shouldResetDisplay) {
        state.currentInput = '';
        state.shouldResetDisplay = false;
    }
    if (state.currentInput === '0' && number !== '.') {
        state.currentInput = number;
    } else {
        if (number === '.' && state.currentInput.includes('.')) return;
        state.currentInput += number;
    }
    updateDisplay();
}

// Додавання математичного оператора (+, -, *, /, ^, mod)
function appendOperator(op) {
    audio.playAction();
    if (isNaN(parseFloat(state.currentInput))) return;
    if (state.operator !== undefined && !state.shouldResetDisplay) {
        calculate(false);
    }
    state.operator = op;
    state.previousInput = state.currentInput;
    state.shouldResetDisplay = true;
    updateDisplay();
}

// ==========================================================================
// Розширені математичні та наукові функції (v1.4)
// ==========================================================================

// Тригонометричні функції (sin, cos, tan) з підтримкою DEG / RAD
function calculateTrig(func) {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (isNaN(current)) return;

    let radians = current;
    if (state.angleMode === 'DEG') {
        radians = current * (Math.PI / 180);
    }

    let result;
    if (func === 'sin') {
        result = Math.sin(radians);
    } else if (func === 'cos') {
        result = Math.cos(radians);
    } else if (func === 'tan') {
        if (state.angleMode === 'DEG' && Math.abs(current % 180) === 90) {
            audio.playError();
            state.currentInput = 'Помилка (tan 90°)';
            updateDisplay();
            return;
        }
        result = Math.tan(radians);
    }

    // Усунення похибок floating point (наприклад, sin(180°) = 0)
    result = Math.round(result * 1000000000) / 1000000000;
    
    let formatted = formatResult(result);
    const unitSymbol = state.angleMode === 'DEG' ? '°' : ' rad';
    addToHistory(`${func}(${current}${unitSymbol})`, formatted);
    state.currentInput = formatted;
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Десятковий логарифм (log10)
function calculateLog() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (current <= 0 || isNaN(current)) {
        audio.playError();
        state.currentInput = 'Помилка (log <= 0)';
    } else {
        let result = Math.log10(current);
        let formatted = formatResult(result);
        addToHistory(`log(${current})`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Натуральний логарифм (ln / log e) - НОВЕ v1.4
function calculateLn() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (current <= 0 || isNaN(current)) {
        audio.playError();
        state.currentInput = 'Помилка (ln <= 0)';
    } else {
        let result = Math.log(current);
        let formatted = formatResult(result);
        addToHistory(`ln(${current})`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Квадратний корінь (√)
function calculateSquareRoot() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (current < 0 || isNaN(current)) {
        audio.playError();
        state.currentInput = 'Помилка (√ < 0)';
    } else {
        let result = Math.sqrt(current);
        let formatted = formatResult(result);
        addToHistory(`√(${current})`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Квадрат числа (x²) - НОВЕ v1.4
function calculateSquare() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (isNaN(current)) return;
    let result = Math.pow(current, 2);
    let formatted = formatResult(result);
    addToHistory(`sqr(${current})`, formatted);
    state.currentInput = formatted;
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Відсоток (%) - НОВЕ v1.4
function calculatePercent() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (isNaN(current)) return;

    let result;
    if (state.operator && state.previousInput) {
        const prev = parseFloat(state.previousInput);
        if (state.operator === '+' || state.operator === '-') {
            result = (prev * current) / 100;
        } else {
            result = current / 100;
        }
    } else {
        result = current / 100;
    }

    let formatted = formatResult(result);
    state.currentInput = formatted;
    updateDisplay();
}

// Обернене число (1/x)
function calculateInverse() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (current === 0) {
        audio.playError();
        openModal('zero-modal');
        state.currentInput = '0';
    } else if (!isNaN(current)) {
        let result = 1 / current;
        let formatted = formatResult(result);
        addToHistory(`1/(${current})`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Факторіал (x!)
function calculateFactorial() {
    audio.playAction();
    let num = parseInt(state.currentInput);
    if (num < 0 || isNaN(num) || state.currentInput.includes('.')) {
        audio.playError();
        state.currentInput = 'Помилка';
    } else if (num === 0 || num === 1) {
        addToHistory(`${num}!`, '1');
        state.currentInput = '1';
    } else if (num > 170) {
        audio.playError();
        state.currentInput = 'Помилка (Дуже велике)';
    } else {
        let res = 1;
        for (let i = 1; i <= num; i++) {
            res *= i;
        }
        let formatted = res.toString();
        addToHistory(`${num}!`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Зміна знаку (+/-)
function toggleSign() {
    audio.playClick(550);
    if (state.currentInput === '0' || isNaN(parseFloat(state.currentInput))) return;
    state.currentInput = (parseFloat(state.currentInput) * -1).toString();
    updateDisplay();
}

// Вставка константи Пі (π)
function insertPi() {
    audio.playAction();
    if (state.shouldResetDisplay) {
        state.currentInput = '';
        state.shouldResetDisplay = false;
    }
    state.currentInput = Math.PI.toFixed(8).replace(/\.?0+$/, '');
    updateDisplay();
}

// Вставка константи Ейлера (e) - НОВЕ v1.4
function insertEuler() {
    audio.playAction();
    if (state.shouldResetDisplay) {
        state.currentInput = '';
        state.shouldResetDisplay = false;
    }
    state.currentInput = Math.E.toFixed(8).replace(/\.?0+$/, '');
    updateDisplay();
}

// ==========================================================================
// Пам'ять калькулятора (MC, MR, M+, M-)
// ==========================================================================
function memoryClear() {
    audio.playAction();
    state.memoryValue = 0;
    updateDisplay();
    showToast("Пам'ять очищено", '🧹');
}

function memoryRecall() {
    audio.playAction();
    state.currentInput = formatResult(state.memoryValue);
    state.shouldResetDisplay = true;
    updateDisplay();
    showToast(`Викликано з пам'яті: ${state.currentInput}`, '📥');
}

function memoryAdd() {
    audio.playAction();
    state.memoryValue += parseFloat(state.currentInput) || 0;
    state.shouldResetDisplay = true;
    updateDisplay();
    showToast(`Додано до пам'яті (M = ${formatResult(state.memoryValue)})`, '➕');
}

function memorySubtract() {
    audio.playAction();
    state.memoryValue -= parseFloat(state.currentInput) || 0;
    state.shouldResetDisplay = true;
    updateDisplay();
    showToast(`Віднято від пам'яті (M = ${formatResult(state.memoryValue)})`, '➖');
}

// ==========================================================================
// Головний розрахунок (Calculate / Equals)
// ==========================================================================
function calculate(saveToHistory = true) {
    let computation;
    const prev = parseFloat(state.previousInput);
    const current = parseFloat(state.currentInput);

    if (isNaN(prev) || isNaN(current) || state.operator === undefined) return;

    switch (state.operator) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '*':
            computation = prev * current;
            break;
        case '/':
            if (current === 0) {
                audio.playError();
                openModal('zero-modal');
                state.currentInput = '0';
                state.operator = undefined;
                state.shouldResetDisplay = true;
                updateDisplay();
                return;
            }
            computation = prev / current;
            break;
        case '^':
            computation = Math.pow(prev, current);
            break;
        case 'mod':
            if (current === 0) {
                audio.playError();
                openModal('zero-modal');
                return;
            }
            computation = prev % current;
            break;
        default:
            return;
    }

    audio.playEquals();
    let resultStr = formatResult(computation);

    if (saveToHistory) {
        let opSymbol = state.operator;
        if (opSymbol === '*') opSymbol = '×';
        if (opSymbol === '/') opSymbol = '÷';
        addToHistory(`${prev} ${opSymbol} ${current}`, resultStr);
    }

    state.currentInput = resultStr;
    state.operator = undefined;
    state.shouldResetDisplay = true;
    updateDisplay();
}

function formatResult(num) {
    if (isNaN(num) || !isFinite(num)) return 'Помилка';
    return parseFloat(num.toFixed(10)).toString();
}

// ==========================================================================
// Історія розрахунків та Експорт
// ==========================================================================
function addToHistory(equation, result) {
    const item = {
        equation,
        result,
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    state.history.unshift(item);
    if (state.history.length > 50) state.history.pop();
    localStorage.setItem('calc_history', JSON.stringify(state.history));
    renderHistory();
}

function renderHistory() {
    if (!dom.historyList) return;
    if (state.history.length === 0) {
        dom.historyList.innerHTML = '<li style="text-align:center; color: var(--text-muted); padding: 20px;">Історія порожня</li>';
        return;
    }

    dom.historyList.innerHTML = '';
    state.history.forEach(item => {
        const li = document.createElement('li');
        li.title = 'Натисніть, щоб підставити результат';
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="calc-eq">${item.equation} =</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">${item.time || ''}</span>
            </div>
            <div class="calc-res">${item.result}</div>
        `;
        li.onclick = () => {
            audio.playClick();
            state.currentInput = item.result;
            state.shouldResetDisplay = true;
            updateDisplay();
            closeModal('history-modal');
            showToast(`Значення ${item.result} підставлено`, '📋');
        };
        dom.historyList.appendChild(li);
    });
}

function clearHistory() {
    audio.playAction();
    state.history = [];
    localStorage.removeItem('calc_history');
    renderHistory();
    showToast('Історію очищено', '🗑️');
}

// Експорт історії у .txt файл (НОВЕ v1.4)
function exportHistory() {
    audio.playAction();
    if (state.history.length === 0) {
        showToast('Історія порожня для експорту', '⚠️');
        return;
    }

    let content = `====================================================\n`;
    content += `  КАЛЬКУЛЯТОР PRO v1.4 (Build 72) - ІСТОРІЯ ОБЧИСЛЕНЬ\n`;
    content += `  Дата експорту: ${new Date().toLocaleString('uk-UA')}\n`;
    content += `  Автор: MaxNT Official, 2026\n`;
    content += `====================================================\n\n`;

    state.history.forEach((item, index) => {
        content += `[${item.time || '00:00'}] ${index + 1}. ${item.equation} = ${item.result}\n`;
    });

    content += `\n====================================================\n`;
    content += `Всього обчислень: ${state.history.length}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Calculator_History_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Історію збережено у файл .txt', '📥');
}

// ==========================================================================
// Копіювання в буфер обміну
// ==========================================================================
function copyToClipboard() {
    if (isNaN(parseFloat(state.currentInput))) return;
    audio.playAction();
    navigator.clipboard.writeText(state.currentInput).then(() => {
        showToast(`Скопійовано: ${state.currentInput}`, '📋');
        if (dom.display) {
            const originalColor = dom.display.style.color;
            dom.display.style.color = "var(--accent-operator)";
            setTimeout(() => {
                dom.display.style.color = originalColor;
            }, 600);
        }
    }).catch(() => {
        showToast('Не вдалося скопіювати', '❌');
    });
}

// ==========================================================================
// Тост-сповіщення (Toast Notification Helper)
// ==========================================================================
function showToast(message, icon = 'ℹ️') {
    if (!dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2500);
}

// ==========================================================================
// Теми та Модальні вікна
// ==========================================================================
function setTheme(themeName) {
    audio.playAction();
    document.body.setAttribute('data-theme', themeName);
    state.currentTheme = themeName;
    localStorage.setItem('calc_theme', themeName);
    
    // Оновлюємо активний стан у модальному вікні тем
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });

    closeModal('theme-modal');
    showToast(`Встановлено тему: ${getThemeNameUA(themeName)}`, '🎨');
}

function getThemeNameUA(theme) {
    switch (theme) {
        case 'light': return 'Світла (Clean Porcelain)';
        case 'neon': return 'Неонова (Cyberpunk)';
        case 'purple': return 'Фіолетова (Midnight Purple)';
        case 'emerald': return 'Смарагдова (Emerald Forest)';
        default: return 'Темна (Dark Charcoal)';
    }
}

function openModal(modalId) {
    audio.playClick(700);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        if (modalId === 'history-modal') renderHistory();
    }
}

function closeModal(modalId) {
    audio.playClick(450);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Закриття модальних вікон по кліку на бекдроп
window.onclick = function (event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
};

// ==========================================================================
// Клавіатурна навігація (Keyboard Support & Visual Press)
// ==========================================================================
document.addEventListener('keydown', (event) => {
    // Якщо відкрите модальне вікно, закриваємо по Escape
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            return;
        }
        clearDisplay();
        return;
    }

    // Числа 0-9
    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
        triggerKeyEffect(event.key);
        return;
    }

    // Крапка / Кома
    if (event.key === '.' || event.key === ',') {
        appendNumber('.');
        triggerKeyEffect('.');
        return;
    }

    // Обчислення (= або Enter)
    if (event.key === '=' || event.key === 'Enter') {
        event.preventDefault();
        calculate();
        triggerKeyEffect('=');
        return;
    }

    // Стерти символ (Backspace)
    if (event.key === 'Backspace') {
        backspace();
        triggerKeyEffect('⌫');
        return;
    }

    // Операції
    if (event.key === '+' || event.key === '-') {
        appendOperator(event.key);
        triggerKeyEffect(event.key === '-' ? '−' : '+');
        return;
    }
    if (event.key === '*' || event.key === 'x' || event.key === 'X') {
        appendOperator('*');
        triggerKeyEffect('×');
        return;
    }
    if (event.key === '/') {
        event.preventDefault();
        appendOperator('/');
        triggerKeyEffect('÷');
        return;
    }
    if (event.key === '^') {
        appendOperator('^');
        triggerKeyEffect('xⁿ');
        return;
    }
    if (event.key === '%') {
        calculatePercent();
        triggerKeyEffect('%');
        return;
    }
    if (event.key === '!') {
        calculateFactorial();
        triggerKeyEffect('x!');
        return;
    }

    // Копіювання (Ctrl+C або Cmd+C)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'C')) {
        copyToClipboard();
        return;
    }
});

// Візуальний ефект натискання кнопки на екрані
function triggerKeyEffect(label) {
    const buttons = document.querySelectorAll('.buttons button');
    buttons.forEach(btn => {
        if (btn.innerText.trim() === label || btn.getAttribute('data-key') === label) {
            btn.classList.add('is-pressed');
            setTimeout(() => btn.classList.remove('is-pressed'), 140);
        }
    });
}

// ==========================================================================
// Ініціалізація при завантаженні (DOM Ready)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Встановлення збереженої теми
    if (state.currentTheme) {
        document.body.setAttribute('data-theme', state.currentTheme);
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === state.currentTheme);
        });
    }

    // Оновлення дисплею
    updateDisplay();
    renderHistory();

    console.log('%c Calculator Pro v1.4 (Build 72) Loaded Successfully %c', 
        'background: #14b8a6; color: #042f2e; font-weight: bold; padding: 4px 8px; border-radius: 4px;', 
        '');
});
