/**
 * ==========================================================================
 * Calculator Pro v1.5 (Build 100) RTM - Main Application Logic
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
    soundProfile: localStorage.getItem('calc_sound_profile') || 'classic', // 'classic', 'tactile', 'retro', 'scifi', 'off'
    isSecondMode: false, // 2nd (Shift) шар функцій
    currentTheme: localStorage.getItem('calc_theme') || 'dark',
    currentWallpaper: localStorage.getItem('calc_wallpaper') || 'default',
    wallpaperBlur: parseInt(localStorage.getItem('calc_wp_blur') || '12'),
    wallpaperOverlay: parseInt(localStorage.getItem('calc_wp_overlay') || '60'),
    customWallpaperUrl: localStorage.getItem('calc_custom_wp') || '',
    history: JSON.parse(localStorage.getItem('calc_history') || '[]'),
    operationsCount: 0,
    bracketDepth: 0
};

// Елементи інтерфейсу (DOM Elements)
const dom = {
    display: document.getElementById('display'),
    historyLine: document.getElementById('history-line'),
    formulaPreview: document.getElementById('formula-preview'),
    historyList: document.getElementById('history-list'),
    historySearch: document.getElementById('history-search'),
    modeBadge: document.getElementById('mode-badge'),
    secondaryBadge: document.getElementById('secondary-badge'),
    memoryBadge: document.getElementById('memory-badge'),
    audioBadge: document.getElementById('audio-badge'),
    footerAudioBtn: document.getElementById('footer-audio-btn'),
    sidebarSoundStatus: document.getElementById('sidebar-sound-status'),
    opsCounter: document.getElementById('ops-counter'),
    toastContainer: document.getElementById('toast-container'),
    bgWallpaper: document.getElementById('bg-wallpaper'),
    bgOverlay: document.getElementById('bg-overlay'),
    btn2nd: document.getElementById('btn-2nd'),
    // Динамічні кнопки 2nd
    btnSin: document.getElementById('btn-sin'),
    btnCos: document.getElementById('btn-cos'),
    btnTan: document.getElementById('btn-tan'),
    btnSinh: document.getElementById('btn-sinh'),
    btnLn: document.getElementById('btn-ln'),
    btnLog: document.getElementById('btn-log'),
    btnSqr: document.getElementById('btn-sqr'),
    btnSqrt: document.getElementById('btn-sqrt'),
    btnPow: document.getElementById('btn-pow')
};

// ==========================================================================
// Аудіо рушій на базі Web Audio API (4 профілі синтезу) + Haptics
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

    triggerHaptic(ms = 12) {
        if (navigator.vibrate) {
            try { navigator.vibrate(ms); } catch (e) {}
        }
    }

    playClick(freq = 600, duration = 0.04) {
        if (state.soundProfile === 'off') return;
        this.triggerHaptic(8);
        try {
            this.init();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            switch (state.soundProfile) {
                case 'tactile':
                    // Механічний перемикач (Низький тактильний клац)
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
                    break;
                case 'retro':
                    // 8-бітний чіптюн (Square wave)
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq * 1.5, now);
                    osc.frequency.setValueAtTime(freq * 0.9, now + 0.02);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    break;
                case 'scifi':
                    // Футуристичний дзвін кристалу
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq * 2.2, now);
                    osc.frequency.exponentialRampToValueAtTime(freq * 1.1, now + 0.06);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                    break;
                case 'classic':
                default:
                    // Класичний синусоїдальний клік
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now);
                    osc.frequency.exponentialRampToValueAtTime(150, now + duration);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
                    break;
            }

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + Math.max(duration, 0.06));
        } catch (e) {}
    }

    playAction() {
        this.playClick(850, 0.06);
    }

    playEquals() {
        if (state.soundProfile === 'off') return;
        this.triggerHaptic(18);
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = state.soundProfile === 'retro' ? 'square' : 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

            gain.gain.setValueAtTime(0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    playError() {
        if (state.soundProfile === 'off') return;
        this.triggerHaptic([30, 40, 30]);
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.setValueAtTime(140, now + 0.08);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) {}
    }
}

const audio = new SoundEngine();

// ==========================================================================
// Оновлення дисплея та індикаторів
// ==========================================================================
function updateDisplay() {
    if (dom.display) {
        // Автоматичне підлаштування розміру шрифту при довгих числах
        const len = state.currentInput.length;
        if (len > 16) {
            dom.display.style.fontSize = '1.35rem';
        } else if (len > 11) {
            dom.display.style.fontSize = '1.75rem';
        } else {
            dom.display.style.fontSize = '2.2rem';
        }
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
        dom.modeBadge.title = `Кутовий режим: ${state.angleMode === 'DEG' ? 'Градуси' : 'Радіани'} (натисніть, щоб змінити)`;
    }

    // Індикатор 2nd (Shift)
    if (dom.secondaryBadge) {
        dom.secondaryBadge.classList.toggle('active', state.isSecondMode);
    }
    if (dom.btn2nd) {
        dom.btn2nd.classList.toggle('active', state.isSecondMode);
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

    // Лічильник операцій
    if (dom.opsCounter) {
        dom.opsCounter.innerText = state.operationsCount;
    }

    // Оновлення підписів кнопок 2nd
    updateSecondaryButtonsUI();
}

function updateSecondaryButtonsUI() {
    if (state.isSecondMode) {
        if (dom.btnSin) { dom.btnSin.innerText = 'sin⁻¹'; dom.btnSin.title = 'Арксинус (asin)'; }
        if (dom.btnCos) { dom.btnCos.innerText = 'cos⁻¹'; dom.btnCos.title = 'Арккосинус (acos)'; }
        if (dom.btnTan) { dom.btnTan.innerText = 'tan⁻¹'; dom.btnTan.title = 'Арктангенс (atan)'; }
        if (dom.btnSinh) { dom.btnSinh.innerText = 'cosh'; dom.btnSinh.title = 'Гіперболічний косинус (cosh)'; }
        if (dom.btnLn) { dom.btnLn.innerText = 'log₂'; dom.btnLn.title = 'Двійковий логарифм (log2)'; }
        if (dom.btnLog) { dom.btnLog.innerText = '10ˣ'; dom.btnLog.title = '10 у степені x'; }
        if (dom.btnSqr) { dom.btnSqr.innerText = 'x³'; dom.btnSqr.title = 'Куб числа (x³)'; }
        if (dom.btnSqrt) { dom.btnSqrt.innerText = '∛x'; dom.btnSqrt.title = 'Кубічний корінь (∛x)'; }
        if (dom.btnPow) { dom.btnPow.innerText = 'eˣ'; dom.btnPow.title = 'Експонента eˣ'; }
    } else {
        if (dom.btnSin) { dom.btnSin.innerText = 'sin'; dom.btnSin.title = 'Синус'; }
        if (dom.btnCos) { dom.btnCos.innerText = 'cos'; dom.btnCos.title = 'Косинус'; }
        if (dom.btnTan) { dom.btnTan.innerText = 'tan'; dom.btnTan.title = 'Тангенс'; }
        if (dom.btnSinh) { dom.btnSinh.innerText = 'sinh'; dom.btnSinh.title = 'Гіперболічний синус'; }
        if (dom.btnLn) { dom.btnLn.innerText = 'ln'; dom.btnLn.title = 'Натуральний логарифм (ln)'; }
        if (dom.btnLog) { dom.btnLog.innerText = 'log'; dom.btnLog.title = 'Десятковий логарифм (log10)'; }
        if (dom.btnSqr) { dom.btnSqr.innerText = 'x²'; dom.btnSqr.title = 'Квадрат (x²)'; }
        if (dom.btnSqrt) { dom.btnSqrt.innerText = '√'; dom.btnSqrt.title = 'Квадратний корінь (√)'; }
        if (dom.btnPow) { dom.btnPow.innerText = 'xⁿ'; dom.btnPow.title = 'Степінь (xⁿ)'; }
    }
}

function updateAudioUI() {
    const isMuted = state.soundProfile === 'off';
    const profileNames = {
        classic: 'Classic',
        tactile: 'Tactile',
        retro: '8-Bit',
        scifi: 'Sci-Fi',
        off: 'Вимк.'
    };
    const pName = profileNames[state.soundProfile] || 'Classic';

    if (dom.audioBadge) {
        dom.audioBadge.innerText = isMuted ? '🔇' : '🔊';
        dom.audioBadge.title = `Звук: ${pName} (клікніть для зміни)`;
    }
    if (dom.footerAudioBtn) {
        dom.footerAudioBtn.innerHTML = `<span>${isMuted ? '🔇' : '🔊'}</span> ${pName}`;
    }
    if (dom.sidebarSoundStatus) {
        dom.sidebarSoundStatus.innerText = `🔔 ${pName}`;
    }
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

// Перемикання 2nd (Shift) режиму
function toggleSecondMode() {
    state.isSecondMode = !state.isSecondMode;
    audio.playAction();
    updateDisplay();
    showToast(state.isSecondMode ? 'Режим додаткових функцій 2nd увімкнено' : 'Стандартні функції', '⚡');
}

// Циклічна зміна звукового профілю
function cycleSoundProfile() {
    const profiles = ['classic', 'tactile', 'retro', 'scifi', 'off'];
    const currentIdx = profiles.indexOf(state.soundProfile);
    state.soundProfile = profiles[(currentIdx + 1) % profiles.length];
    localStorage.setItem('calc_sound_profile', state.soundProfile);
    audio.playAction();
    updateAudioUI();
    const profileNamesUA = {
        classic: 'Класичний Poly Sine',
        tactile: 'Тактильний перемикач',
        retro: '8-біт Аркада',
        scifi: 'Футуристичний кристал',
        off: 'Звук вимкнено'
    };
    showToast(`Звуковий профіль: ${profileNamesUA[state.soundProfile]}`, state.soundProfile === 'off' ? '🔇' : '🔊');
}

function toggleSound() {
    cycleSoundProfile();
}

// Повернення на головну
function goHome() {
    audio.playAction();
    clearDisplay();
    state.memoryValue = 0;
    state.isSecondMode = false;
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

// Додавання дужок
function appendBracket(bracket) {
    audio.playAction();
    if (bracket === '(') {
        if (state.currentInput === '0' || state.shouldResetDisplay) {
            state.currentInput = '(';
            state.shouldResetDisplay = false;
        } else {
            state.currentInput += '(';
        }
        state.bracketDepth++;
    } else if (bracket === ')') {
        if (state.bracketDepth > 0) {
            state.currentInput += ')';
            state.bracketDepth--;
        }
    }
    updateDisplay();
}

// Додавання математичного оператора (+, -, *, /, ^, mod)
function appendOperator(op) {
    audio.playAction();
    if (isNaN(parseFloat(state.currentInput)) && !state.currentInput.includes(')')) return;
    if (state.operator !== undefined && !state.shouldResetDisplay) {
        calculate(false);
    }
    state.operator = op;
    state.previousInput = state.currentInput;
    state.shouldResetDisplay = true;
    updateDisplay();
}

// ==========================================================================
// Розширені наукові функції (v1.5 RTM)
// ==========================================================================

// Обробка тригонометрії (sin / asin, cos / acos, tan / atan)
function handleTrigOrSecondary(func) {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (isNaN(current)) return;

    let result;
    const isDeg = state.angleMode === 'DEG';
    const toRad = deg => deg * (Math.PI / 180);
    const toDeg = rad => rad * (180 / Math.PI);

    if (!state.isSecondMode) {
        // Прямі тригонометричні функції
        let radians = isDeg ? toRad(current) : current;
        if (func === 'sin') result = Math.sin(radians);
        else if (func === 'cos') result = Math.cos(radians);
        else if (func === 'tan') {
            if (isDeg && Math.abs(current % 180) === 90) {
                audio.playError();
                state.currentInput = 'Помилка (tan 90°)';
                updateDisplay();
                return;
            }
            result = Math.tan(radians);
        }
        result = Math.round(result * 1000000000) / 1000000000;
        let formatted = formatResult(result);
        const unit = isDeg ? '°' : ' rad';
        addToHistory(`${func}(${current}${unit})`, formatted);
        state.currentInput = formatted;
    } else {
        // Зворотні тригонометричні функції (asin, acos, atan)
        if (func === 'sin') {
            if (current < -1 || current > 1) {
                audio.playError();
                state.currentInput = 'Помилка (|x| > 1)';
                updateDisplay();
                return;
            }
            let rad = Math.asin(current);
            result = isDeg ? toDeg(rad) : rad;
            let formatted = formatResult(result);
            addToHistory(`asin(${current})`, `${formatted}${isDeg ? '°' : ' rad'}`);
            state.currentInput = formatted;
        } else if (func === 'cos') {
            if (current < -1 || current > 1) {
                audio.playError();
                state.currentInput = 'Помилка (|x| > 1)';
                updateDisplay();
                return;
            }
            let rad = Math.acos(current);
            result = isDeg ? toDeg(rad) : rad;
            let formatted = formatResult(result);
            addToHistory(`acos(${current})`, `${formatted}${isDeg ? '°' : ' rad'}`);
            state.currentInput = formatted;
        } else if (func === 'tan') {
            let rad = Math.atan(current);
            result = isDeg ? toDeg(rad) : rad;
            let formatted = formatResult(result);
            addToHistory(`atan(${current})`, `${formatted}${isDeg ? '°' : ' rad'}`);
            state.currentInput = formatted;
        }
    }

    state.shouldResetDisplay = true;
    updateDisplay();
}

// Гіперболічні функції (sinh / cosh)
function handleHyperbolicOrSecondary(func) {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (isNaN(current)) return;

    let result;
    if (!state.isSecondMode) {
        result = Math.sinh(current);
        let formatted = formatResult(result);
        addToHistory(`sinh(${current})`, formatted);
        state.currentInput = formatted;
    } else {
        result = Math.cosh(current);
        let formatted = formatResult(result);
        addToHistory(`cosh(${current})`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// ln або log2
function handleLnOrLog2() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (current <= 0 || isNaN(current)) {
        audio.playError();
        state.currentInput = 'Помилка (x <= 0)';
    } else {
        let result = !state.isSecondMode ? Math.log(current) : Math.log2(current);
        let formatted = formatResult(result);
        addToHistory(!state.isSecondMode ? `ln(${current})` : `log2(${current})`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// log10 або 10^x
function handleLogOr10x() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (!state.isSecondMode) {
        if (current <= 0 || isNaN(current)) {
            audio.playError();
            state.currentInput = 'Помилка (log <= 0)';
        } else {
            let result = Math.log10(current);
            let formatted = formatResult(result);
            addToHistory(`log10(${current})`, formatted);
            state.currentInput = formatted;
        }
    } else {
        if (isNaN(current)) return;
        let result = Math.pow(10, current);
        let formatted = formatResult(result);
        addToHistory(`10^(${current})`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Квадрат x² або Куб x³
function handleSquareOrCube() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (isNaN(current)) return;
    let result = !state.isSecondMode ? Math.pow(current, 2) : Math.pow(current, 3);
    let formatted = formatResult(result);
    addToHistory(!state.isSecondMode ? `sqr(${current})` : `cube(${current})`, formatted);
    state.currentInput = formatted;
    state.shouldResetDisplay = true;
    updateDisplay();
}

// Корінь √ або Кубічний корінь ∛
function handleSqrtOrCbrt() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (!state.isSecondMode) {
        if (current < 0 || isNaN(current)) {
            audio.playError();
            state.currentInput = 'Помилка (√ < 0)';
        } else {
            let result = Math.sqrt(current);
            let formatted = formatResult(result);
            addToHistory(`√(${current})`, formatted);
            state.currentInput = formatted;
        }
    } else {
        if (isNaN(current)) return;
        let result = Math.cbrt(current);
        let formatted = formatResult(result);
        addToHistory(`∛(${current})`, formatted);
        state.currentInput = formatted;
    }
    state.shouldResetDisplay = true;
    updateDisplay();
}

// xⁿ або eˣ
function handlePowerOrExp() {
    if (!state.isSecondMode) {
        appendOperator('^');
    } else {
        audio.playAction();
        const current = parseFloat(state.currentInput);
        if (isNaN(current)) return;
        let result = Math.exp(current);
        let formatted = formatResult(result);
        addToHistory(`e^(${current})`, formatted);
        state.currentInput = formatted;
        state.shouldResetDisplay = true;
        updateDisplay();
    }
}

// Модуль (|x|)
function calculateAbs() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (isNaN(current)) return;
    let result = Math.abs(current);
    let formatted = formatResult(result);
    addToHistory(`|${current}|`, formatted);
    state.currentInput = formatted;
    state.shouldResetDisplay = true;
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

// Зміна знаку (+/-)
function toggleSign() {
    audio.playClick(550);
    if (state.currentInput === '0' || isNaN(parseFloat(state.currentInput))) return;
    state.currentInput = (parseFloat(state.currentInput) * -1).toString();
    updateDisplay();
}

// Константи
function insertPi() {
    audio.playAction();
    if (state.shouldResetDisplay) {
        state.currentInput = '';
        state.shouldResetDisplay = false;
    }
    state.currentInput = Math.PI.toFixed(10).replace(/\.?0+$/, '');
    updateDisplay();
}

function insertEuler() {
    audio.playAction();
    if (state.shouldResetDisplay) {
        state.currentInput = '';
        state.shouldResetDisplay = false;
    }
    state.currentInput = Math.E.toFixed(10).replace(/\.?0+$/, '');
    updateDisplay();
}

function insertConstantVal(val, name) {
    audio.playAction();
    state.currentInput = val;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('constants-modal');
    showToast(`Константу ${name} вставлено`, '⚛️');
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

    state.operationsCount++;
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
// Історія розрахунків та Мультиформатний Експорт
// ==========================================================================
function addToHistory(equation, result) {
    const item = {
        equation,
        result,
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    state.history.unshift(item);
    if (state.history.length > 80) state.history.pop();
    localStorage.setItem('calc_history', JSON.stringify(state.history));
    renderHistory();
}

function renderHistory(items = state.history) {
    if (!dom.historyList) return;
    if (items.length === 0) {
        dom.historyList.innerHTML = '<li style="text-align:center; color: var(--text-muted); padding: 20px;">Історія порожня</li>';
        return;
    }

    dom.historyList.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.title = 'Натисніть, щоб підставити результат у калькулятор';
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

function filterHistory(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
        renderHistory();
        return;
    }
    const filtered = state.history.filter(item => 
        item.equation.toLowerCase().includes(q) || 
        item.result.toLowerCase().includes(q)
    );
    renderHistory(filtered);
}

function clearHistory() {
    audio.playAction();
    state.history = [];
    localStorage.removeItem('calc_history');
    renderHistory();
    showToast('Історію очищено', '🗑️');
}

// Експорт історії у форматах TXT, CSV, JSON
function exportHistoryFormat(format) {
    audio.playAction();
    if (state.history.length === 0) {
        showToast('Історія порожня для експорту', '⚠️');
        return;
    }

    let content = '';
    let mimeType = 'text/plain;charset=utf-8';
    let fileExt = 'txt';
    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
        mimeType = 'text/csv;charset=utf-8';
        fileExt = 'csv';
        content = "Час,Вираз,Результат\n";
        state.history.forEach(item => {
            content += `"${item.time || ''}","${item.equation}","${item.result}"\n`;
        });
    } else if (format === 'json') {
        mimeType = 'application/json;charset=utf-8';
        fileExt = 'json';
        content = JSON.stringify({
            application: "Calculator Pro v1.5 (Build 100) RTM",
            exportedAt: new Date().toISOString(),
            author: "MaxNT Official, 2026",
            totalRecords: state.history.length,
            records: state.history
        }, null, 2);
    } else {
        // TXT
        content = `====================================================\n`;
        content += `  КАЛЬКУЛЯТОР PRO v1.5 (Build 100) RTM - ІСТОРІЯ\n`;
        content += `  Дата експорту: ${new Date().toLocaleString('uk-UA')}\n`;
        content += `  Автор: MaxNT Official, 2026\n`;
        content += `====================================================\n\n`;

        state.history.forEach((item, index) => {
            content += `[${item.time || '00:00'}] ${index + 1}. ${item.equation} = ${item.result}\n`;
        });
        content += `\nВсього операцій: ${state.history.length}\n`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Calculator_History_${dateStr}.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    closeModal('export-modal');
    showToast(`Історію експортовано у формат .${fileExt}`, '📥');
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
            }, 500);
        }
    }).catch(() => {
        showToast('Не вдалося скопіювати', '❌');
    });
}

// ==========================================================================
// Тост-сповіщення (Toast Helper)
// ==========================================================================
function showToast(message, icon = 'ℹ️') {
    if (!dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2400);
}

// ==========================================================================
// Теми та Wallpaper Studio
// ==========================================================================
function setTheme(themeName) {
    audio.playAction();
    document.body.setAttribute('data-theme', themeName);
    state.currentTheme = themeName;
    localStorage.setItem('calc_theme', themeName);
    
    document.querySelectorAll('.theme-card').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });

    closeModal('theme-modal');
    showToast(`Встановлено тему: ${getThemeNameUA(themeName)}`, '🎨');
}

function getThemeNameUA(theme) {
    const names = {
        light: 'Світла (Clean Porcelain)',
        neon: 'Неонова (Cyberpunk Glow)',
        purple: 'Фіолетова (Midnight Purple)',
        emerald: 'Смарагдова (Emerald Forest)',
        sunset: 'Захід Сонця (Sunset Aura)',
        ocean: 'Океанічна (Nordic Ocean)',
        coffee: 'Кавова (Mocha Latte)',
        sakura: 'Сакура (Sakura Bloom)',
        glass: 'Морозне Скло (Frost Glass)',
        dark: 'Темна (Dark Charcoal)'
    };
    return names[theme] || 'Темна (Dark Charcoal)';
}

function setWallpaper(wpName) {
    audio.playAction();
    state.currentWallpaper = wpName;
    localStorage.setItem('calc_wallpaper', wpName);

    document.querySelectorAll('.wallpaper-card').forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-wp') === wpName);
    });

    applyWallpaperToDom();
    showToast(`Шпалери: ${getWallpaperNameUA(wpName)}`, '🖼️');
}

function getWallpaperNameUA(wp) {
    const map = {
        cyber: 'Кіберсітка',
        sunset: 'Захід Сонця',
        emerald: 'Смарагдова Небула',
        stars: 'Космічні Зорі',
        grid: 'Blueprint Креслення',
        default: 'Динамічний градієнт'
    };
    return map[wp] || 'Кастомні шпалери';
}

function applyWallpaperToDom() {
    if (!dom.bgWallpaper || !dom.bgOverlay) return;

    dom.bgWallpaper.className = 'bg-wallpaper-layer';

    if (state.currentWallpaper === 'cyber') {
        dom.bgWallpaper.style.backgroundImage = "url('images/cyber.jpg')";
    } else if (state.currentWallpaper === 'sunset') {
        dom.bgWallpaper.style.backgroundImage = "url('images/sunset.jpg')";
    } else if (state.currentWallpaper === 'emerald') {
        dom.bgWallpaper.style.backgroundImage = "url('images/emerald.jpg')";
    } else if (state.currentWallpaper === 'stars') {
        dom.bgWallpaper.style.backgroundImage = 'none';
        dom.bgWallpaper.classList.add('wp-stars');
    } else if (state.currentWallpaper === 'grid') {
        dom.bgWallpaper.style.backgroundImage = 'none';
        dom.bgWallpaper.classList.add('wp-grid');
    } else if (state.currentWallpaper === 'custom' && state.customWallpaperUrl) {
        dom.bgWallpaper.style.backgroundImage = `url('${state.customWallpaperUrl}')`;
    } else {
        dom.bgWallpaper.style.backgroundImage = 'none';
    }

    dom.bgWallpaper.style.filter = `blur(${state.wallpaperBlur}px)`;
    dom.bgOverlay.style.backgroundColor = `rgba(0, 0, 0, ${state.wallpaperOverlay / 100})`;
}

function adjustWallpaperBlur(val) {
    state.wallpaperBlur = parseInt(val);
    localStorage.setItem('calc_wp_blur', val);
    const label = document.getElementById('wp-blur-val');
    if (label) label.innerText = `${val}px`;
    applyWallpaperToDom();
}

function adjustWallpaperOverlay(val) {
    state.wallpaperOverlay = parseInt(val);
    localStorage.setItem('calc_wp_overlay', val);
    const label = document.getElementById('wp-opacity-val');
    if (label) label.innerText = `${val}%`;
    applyWallpaperToDom();
}

function handleWallpaperUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        state.customWallpaperUrl = e.target.result;
        state.currentWallpaper = 'custom';
        localStorage.setItem('calc_custom_wp', state.customWallpaperUrl);
        localStorage.setItem('calc_wallpaper', 'custom');
        applyWallpaperToDom();
        showToast('Власне фонове зображення завантажено', '🖼️');
    };
    reader.readAsDataURL(file);
}

function applyWallpaperUrl() {
    const input = document.getElementById('wallpaper-url-input');
    if (!input || !input.value.trim()) return;

    state.customWallpaperUrl = input.value.trim();
    state.currentWallpaper = 'custom';
    localStorage.setItem('calc_custom_wp', state.customWallpaperUrl);
    localStorage.setItem('calc_wallpaper', 'custom');
    applyWallpaperToDom();
    showToast('Шпалери за посиланням встановлено', '🌐');
}

function resetWallpaper() {
    setWallpaper('default');
    adjustWallpaperBlur(12);
    adjustWallpaperOverlay(60);
    const bSlider = document.getElementById('wp-blur-slider');
    const oSlider = document.getElementById('wp-opacity-slider');
    if (bSlider) bSlider.value = 12;
    if (oSlider) oSlider.value = 60;
    showToast('Фон скинуто до початкового', '🧹');
}

// ==========================================================================
// Універсальний Конвертер Величин (v1.5)
// ==========================================================================
const convUnits = {
    length: {
        units: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'],
        names: { m: 'Метри (m)', km: 'Кілометри (km)', cm: 'Сантиметри (cm)', mm: 'Міліметри (mm)', mi: 'Милі (mi)', yd: 'Ярди (yd)', ft: 'Фути (ft)', in: 'Дюйми (in)' },
        toBase: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 }
    },
    weight: {
        units: ['kg', 'g', 'mg', 'lb', 'oz', 'ton'],
        names: { kg: 'Кілограми (kg)', g: 'Грами (g)', mg: 'Міліграми (mg)', lb: 'Фунти (lb)', oz: 'Унції (oz)', ton: 'Метричні тонни' },
        toBase: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.0283495, ton: 1000 }
    },
    temp: {
        units: ['C', 'F', 'K'],
        names: { C: 'Цельсій (°C)', F: 'Фаренгейт (°F)', K: 'Кельвін (K)' }
    },
    data: {
        units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
        names: { B: 'Байти (B)', KB: 'Кілобайти (KB)', MB: 'Мегабайти (MB)', GB: 'Гігабайти (GB)', TB: 'Терабайти (TB)', PB: 'Петабайти (PB)' },
        toBase: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, PB: 1125899906842624 }
    },
    speed: {
        units: ['kmh', 'ms', 'mph', 'knot'],
        names: { kmh: 'км/год (km/h)', ms: 'м/с (m/s)', mph: 'миль/год (mph)', knot: 'Вузли (knot)' },
        toBase: { kmh: 1, ms: 3.6, mph: 1.609344, knot: 1.852 }
    },
    time: {
        units: ['s', 'min', 'hr', 'day', 'week', 'yr'],
        names: { s: 'Секунди (s)', min: 'Хвилини (min)', hr: 'Години (hr)', day: 'Дні (day)', week: 'Тижні (week)', yr: 'Роки (yr)' },
        toBase: { s: 1, min: 60, hr: 3600, day: 86400, week: 604800, yr: 31536000 }
    }
};

let currentConvCat = 'length';

function switchConverterCategory(cat) {
    currentConvCat = cat;
    document.querySelectorAll('.conv-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-cat') === cat);
    });

    const fromSel = document.getElementById('conv-from-unit');
    const toSel = document.getElementById('conv-to-unit');
    if (!fromSel || !toSel) return;

    fromSel.innerHTML = '';
    toSel.innerHTML = '';

    const catData = convUnits[cat];
    catData.units.forEach((u, i) => {
        const o1 = document.createElement('option');
        o1.value = u;
        o1.innerText = catData.names[u];
        fromSel.appendChild(o1);

        const o2 = document.createElement('option');
        o2.value = u;
        o2.innerText = catData.names[u];
        toSel.appendChild(o2);
    });

    if (catData.units.length > 1) {
        toSel.selectedIndex = 1;
    }

    runConversion('from');
}

function runConversion(direction = 'from') {
    const fromSel = document.getElementById('conv-from-unit');
    const toSel = document.getElementById('conv-to-unit');
    const fromInput = document.getElementById('conv-from-val');
    const toInput = document.getElementById('conv-to-val');
    if (!fromSel || !toSel || !fromInput || !toInput) return;

    const uFrom = fromSel.value;
    const uTo = toSel.value;
    const catData = convUnits[currentConvCat];

    if (currentConvCat === 'temp') {
        // Температурні формули
        if (direction === 'from') {
            const val = parseFloat(fromInput.value) || 0;
            let c;
            if (uFrom === 'C') c = val;
            else if (uFrom === 'F') c = (val - 32) * (5/9);
            else if (uFrom === 'K') c = val - 273.15;

            let res;
            if (uTo === 'C') res = c;
            else if (uTo === 'F') res = (c * (9/5)) + 32;
            else if (uTo === 'K') res = c + 273.15;
            toInput.value = parseFloat(res.toFixed(6)).toString();
        } else {
            const val = parseFloat(toInput.value) || 0;
            let c;
            if (uTo === 'C') c = val;
            else if (uTo === 'F') c = (val - 32) * (5/9);
            else if (uTo === 'K') c = val - 273.15;

            let res;
            if (uFrom === 'C') res = c;
            else if (uFrom === 'F') res = (c * (9/5)) + 32;
            else if (uFrom === 'K') res = c + 273.15;
            fromInput.value = parseFloat(res.toFixed(6)).toString();
        }
    } else {
        // Лінійні коефіцієнти
        const toBase = catData.toBase;
        if (direction === 'from') {
            const val = parseFloat(fromInput.value) || 0;
            const inBase = val * toBase[uFrom];
            const result = inBase / toBase[uTo];
            toInput.value = parseFloat(result.toFixed(8)).toString();
        } else {
            const val = parseFloat(toInput.value) || 0;
            const inBase = val * toBase[uTo];
            const result = inBase / toBase[uFrom];
            fromInput.value = parseFloat(result.toFixed(8)).toString();
        }
    }
}

function swapConverterUnits() {
    audio.playAction();
    const fromSel = document.getElementById('conv-from-unit');
    const toSel = document.getElementById('conv-to-unit');
    if (!fromSel || !toSel) return;
    const temp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = temp;
    runConversion('from');
}

function insertConvertedToCalc() {
    audio.playAction();
    const toInput = document.getElementById('conv-to-val');
    if (toInput && toInput.value) {
        state.currentInput = toInput.value;
        state.shouldResetDisplay = true;
        updateDisplay();
        closeModal('converter-modal');
        showToast(`Значення ${toInput.value} вставлено`, '📥');
    }
}

function copyConvertedVal() {
    const toInput = document.getElementById('conv-to-val');
    if (toInput && toInput.value) {
        audio.playAction();
        navigator.clipboard.writeText(toInput.value);
        showToast(`Скопійовано: ${toInput.value}`, '📋');
    }
}

// ==========================================================================
// Програмістський Режим (Programmer Base Sync)
// ==========================================================================
function syncProgrammerBase(sourceBase, value) {
    const val = value.trim();
    if (!val) {
        document.getElementById('prog-dec').value = '';
        document.getElementById('prog-hex').value = '';
        document.getElementById('prog-oct').value = '';
        document.getElementById('prog-bin').value = '';
        return;
    }

    let num = 0;
    try {
        if (sourceBase === 'DEC') num = parseInt(val, 10);
        else if (sourceBase === 'HEX') num = parseInt(val, 16);
        else if (sourceBase === 'OCT') num = parseInt(val, 8);
        else if (sourceBase === 'BIN') num = parseInt(val, 2);

        if (isNaN(num)) return;

        if (sourceBase !== 'DEC') document.getElementById('prog-dec').value = num.toString(10);
        if (sourceBase !== 'HEX') document.getElementById('prog-hex').value = num.toString(16).toUpperCase();
        if (sourceBase !== 'OCT') document.getElementById('prog-oct').value = num.toString(8);
        if (sourceBase !== 'BIN') document.getElementById('prog-bin').value = num.toString(2);
    } catch (e) {}
}

function progBitwise(op) {
    audio.playAction();
    const decInput = document.getElementById('prog-dec');
    let num = parseInt(decInput.value, 10) || 0;
    let res = num;

    if (op === 'NOT') res = ~num;
    else if (op === 'SHL') res = num << 1;
    else if (op === 'SHR') res = num >> 1;

    syncProgrammerBase('DEC', res.toString(10));
    decInput.value = res.toString(10);
    showToast(`Побітова дія ${op}: ${res}`, '💻');
}

function insertProgValToCalc() {
    audio.playAction();
    const decInput = document.getElementById('prog-dec');
    if (decInput && decInput.value) {
        state.currentInput = decInput.value;
        state.shouldResetDisplay = true;
        updateDisplay();
        closeModal('programmer-modal');
        showToast(`Значення ${decInput.value} вставлено`, '📥');
    }
}

// ==========================================================================
// Керування модальними вікнами
// ==========================================================================
function openModal(modalId) {
    audio.playClick(700);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        if (modalId === 'history-modal') {
            if (dom.historySearch) dom.historySearch.value = '';
            renderHistory();
        }
        if (modalId === 'converter-modal') {
            switchConverterCategory(currentConvCat);
        }
        if (modalId === 'programmer-modal') {
            const currentNum = parseInt(state.currentInput, 10) || 0;
            const decEl = document.getElementById('prog-dec');
            if (decEl) {
                decEl.value = currentNum.toString(10);
                syncProgrammerBase('DEC', decEl.value);
            }
        }
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
    if (event.key === '(' || event.key === ')') {
        appendBracket(event.key);
        triggerKeyEffect(event.key);
        return;
    }

    // Швидкі клавіші
    if (event.key === 's' || event.key === 'S' || event.key === 'і' || event.key === 'І') {
        if (!event.ctrlKey && !event.metaKey) {
            toggleSecondMode();
            return;
        }
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'в' || event.key === 'В') {
        if (!event.ctrlKey && !event.metaKey) {
            toggleAngleMode();
            return;
        }
    }

    // Вставка з буфера (Ctrl+V)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'v' || event.key === 'V')) {
        navigator.clipboard.readText().then(text => {
            const clean = text.trim().replace(',', '.');
            if (!isNaN(parseFloat(clean))) {
                state.currentInput = clean;
                state.shouldResetDisplay = true;
                updateDisplay();
                showToast(`Вставлено: ${clean}`, '📋');
            }
        }).catch(() => {});
        return;
    }

    // Копіювання (Ctrl+C)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'C')) {
        copyToClipboard();
        return;
    }
});

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
        document.querySelectorAll('.theme-card').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === state.currentTheme);
        });
    }

    // Застосування шпалер
    applyWallpaperToDom();

    // Слайдери шпалер
    const bSlider = document.getElementById('wp-blur-slider');
    const oSlider = document.getElementById('wp-opacity-slider');
    const bLabel = document.getElementById('wp-blur-val');
    const oLabel = document.getElementById('wp-opacity-val');
    if (bSlider) bSlider.value = state.wallpaperBlur;
    if (oSlider) oSlider.value = state.wallpaperOverlay;
    if (bLabel) bLabel.innerText = `${state.wallpaperBlur}px`;
    if (oLabel) oLabel.innerText = `${state.wallpaperOverlay}%`;

    // Оновлення дисплею
    updateDisplay();
    renderHistory();

    console.log('%c 🧮 Calculator Pro v1.5 (Build 100) RTM Loaded Successfully %c', 
        'background: linear-gradient(90deg, #14b8a6, #38bdf8); color: #042f2e; font-weight: bold; font-size: 12px; padding: 6px 12px; border-radius: 6px;', 
        '');
});
