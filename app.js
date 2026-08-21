/**
 * ==========================================================================
 * Calculator Pro v1.8 (Build 179) Redstone 3 Bordeaux - Master Application Logic
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
    memorySlots: JSON.parse(localStorage.getItem('calc_mem_slots') || '[0, 0, 0, 0]'),
    angleMode: localStorage.getItem('calc_angle_mode') || 'DEG', // 'DEG', 'RAD', 'GRAD'
    soundProfile: localStorage.getItem('calc_sound_profile') || 'classic', // 'classic', 'tactile', 'retro', 'scifi', 'off'
    soundVolume: parseFloat(localStorage.getItem('calc_sound_vol') || '0.8'),
    isSecondMode: false, // 2nd (Shift) шар функцій
    currentTheme: localStorage.getItem('calc_theme') || 'bordeaux_luxury',
    currentFont: localStorage.getItem('calc_font') || 'font-inter',
    currentWallpaper: localStorage.getItem('calc_wallpaper') || 'burgundy',
    wallpaperBlur: parseInt(localStorage.getItem('calc_wp_blur') || '12'),
    wallpaperOverlay: parseInt(localStorage.getItem('calc_wp_overlay') || '60'),
    customWallpaperUrl: localStorage.getItem('calc_custom_wp') || '',
    particlesEnabled: localStorage.getItem('calc_particles') !== 'off',
    history: JSON.parse(localStorage.getItem('calc_history') || '[]'),
    operationsCount: 0,
    sessionSeconds: 0,
    bracketDepth: 0,
    precisionMode: localStorage.getItem('calc_precision') || 'auto', // 'auto', '0', '2', '4', '6', '8', '10', '12'
    thousandSeparator: localStorage.getItem('calc_separator') || 'space', // 'space', 'comma', 'none'
    glassIntensity: localStorage.getItem('calc_glass') || 'heavy',
    activeGraphFunc: 'sin',
    activeDateTab: 'diff',
    matrixSize: 2,
    matrixDetVal: '10',
    bitmaskValue: 42,
    quadRoots: { x1: '3', x2: '2' },
    statMeanVal: '0',
    currencyRates: {
        UAH: 1.0,
        USD: 41.5,
        EUR: 44.8,
        GBP: 52.4,
        PLN: 10.4,
        BTC: 3942500.0,
        ETH: 132800.0,
        SOL: 7885.0
    }
};

// Елементи інтерфейсу (DOM Elements)
const dom = {
    display: document.getElementById('display'),
    historyLine: document.getElementById('history-line'),
    precisionTag: document.getElementById('precision-tag'),
    separatorTag: document.getElementById('separator-tag'),
    historyList: document.getElementById('history-list'),
    historySearch: document.getElementById('history-search'),
    modeBadge: document.getElementById('mode-badge'),
    secondaryBadge: document.getElementById('secondary-badge'),
    memoryBadge: document.getElementById('memory-badge'),
    speechBadge: document.getElementById('speech-badge'),
    audioBadge: document.getElementById('audio-badge'),
    sidebarSoundStatus: document.getElementById('sidebar-sound-status'),
    currentFontChip: document.getElementById('current-font-chip'),
    opsCounter: document.getElementById('ops-counter'),
    timerVal: document.getElementById('timer-val'),
    toastContainer: document.getElementById('toast-container'),
    bgWallpaper: document.getElementById('bg-wallpaper'),
    bgParticlesCanvas: document.getElementById('bg-particles-canvas'),
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
// Аудіо рушій на базі Web Audio API з регулюванням гучності + Haptics
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
        if (state.soundProfile === 'off' || state.soundVolume <= 0) return;
        this.triggerHaptic(8);
        try {
            this.init();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const masterVol = state.soundVolume;

            switch (state.soundProfile) {
                case 'tactile':
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);
                    gain.gain.setValueAtTime(0.2 * masterVol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
                    break;
                case 'retro':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq * 1.5, now);
                    osc.frequency.setValueAtTime(freq * 0.9, now + 0.02);
                    gain.gain.setValueAtTime(0.08 * masterVol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    break;
                case 'scifi':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq * 2.2, now);
                    osc.frequency.exponentialRampToValueAtTime(freq * 1.1, now + 0.06);
                    gain.gain.setValueAtTime(0.12 * masterVol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                    break;
                case 'classic':
                default:
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now);
                    osc.frequency.exponentialRampToValueAtTime(150, now + duration);
                    gain.gain.setValueAtTime(0.12 * masterVol, now);
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
        if (state.soundProfile === 'off' || state.soundVolume <= 0) return;
        this.triggerHaptic(18);
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const masterVol = state.soundVolume;

            osc.type = state.soundProfile === 'retro' ? 'square' : 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

            gain.gain.setValueAtTime(0.16 * masterVol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    playError() {
        if (state.soundProfile === 'off' || state.soundVolume <= 0) return;
        this.triggerHaptic([30, 40, 30]);
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const masterVol = state.soundVolume;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.setValueAtTime(140, now + 0.08);

            gain.gain.setValueAtTime(0.2 * masterVol, now);
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
// Сесійний Таймер
// ==========================================================================
setInterval(() => {
    state.sessionSeconds++;
    if (dom.timerVal) {
        const mins = Math.floor(state.sessionSeconds / 60).toString().padStart(2, '0');
        const secs = (state.sessionSeconds % 60).toString().padStart(2, '0');
        dom.timerVal.innerText = `${mins}:${secs}`;
    }
}, 1000);

// ==========================================================================
// Живі Бордові Частинки на Canvas (Particle Constellation System)
// ==========================================================================
let particles = [];
let animFrameId = null;

function initParticlesCanvas() {
    const canvas = dom.bgParticlesCanvas;
    if (!canvas || !state.particlesEnabled) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 28000);
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            color: Math.random() > 0.4 ? 'rgba(139, 21, 56, ' : 'rgba(245, 158, 11, '
        });
    }

    function render() {
        if (!state.particlesEnabled) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '0.7)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(139, 21, 56, ${0.35 * (1 - dist / 110)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        animFrameId = requestAnimationFrame(render);
    }

    if (animFrameId) cancelAnimationFrame(animFrameId);
    render();
}

window.addEventListener('resize', () => {
    if (dom.bgParticlesCanvas && state.particlesEnabled) {
        dom.bgParticlesCanvas.width = window.innerWidth;
        dom.bgParticlesCanvas.height = window.innerHeight;
    }
});

function toggleParticlesSetting(val) {
    state.particlesEnabled = val === 'on';
    localStorage.setItem('calc_particles', val);
    if (state.particlesEnabled) {
        initParticlesCanvas();
        showToast('Живі частинки увімкнено', '✨');
    } else {
        if (dom.bgParticlesCanvas) {
            const ctx = dom.bgParticlesCanvas.getContext('2d');
            ctx.clearRect(0, 0, dom.bgParticlesCanvas.width, dom.bgParticlesCanvas.height);
        }
        showToast('Фонові частинки вимкнено', '⏸️');
    }
}

// ==========================================================================
// Форматування чисел з розділювачами розрядів
// ==========================================================================
function formatDisplayString(rawVal) {
    if (!rawVal || isNaN(parseFloat(rawVal)) || rawVal.includes('(') || rawVal.includes('Помилка')) {
        return rawVal;
    }
    if (state.thousandSeparator === 'none') {
        return rawVal;
    }

    const parts = rawVal.split('.');
    const isNegative = parts[0].startsWith('-');
    let integerPart = isNegative ? parts[0].slice(1) : parts[0];
    const sep = state.thousandSeparator === 'comma' ? ',' : ' ';

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);

    let res = (isNegative ? '-' : '') + integerPart;
    if (parts.length > 1) {
        res += '.' + parts[1];
    }
    return res;
}

function cycleSeparatorFormat() {
    audio.playAction();
    const formats = ['space', 'comma', 'none'];
    const idx = formats.indexOf(state.thousandSeparator);
    state.thousandSeparator = formats[(idx + 1) % formats.length];
    localStorage.setItem('calc_separator', state.thousandSeparator);
    updateDisplay();
    const names = { space: 'Пробіл (1 000 000)', comma: 'Кома (1,000,000)', none: 'Без розділювача' };
    showToast(`Формат тисяч: ${names[state.thousandSeparator]}`, '🔢');
}

// ==========================================================================
// Розумний Математичний Порадник
// ==========================================================================
function triggerMathAdvisor(errorType, contextVal = {}) {
    audio.playError();

    const diagIcon = document.getElementById('error-diag-icon');
    const diagTitle = document.getElementById('error-diag-title');
    const diagRule = document.getElementById('error-diag-rule');
    const diagExpl = document.getElementById('error-diag-explanation');
    const diagRemedy = document.getElementById('error-diag-remedy');
    const actionsContainer = document.getElementById('error-actions-container');

    if (!actionsContainer) return;
    actionsContainer.innerHTML = '';

    let title = 'Заборонена математична дія!';
    let icon = '⚠️';
    let rule = '';
    let explanation = '';
    let remedy = '';
    let quickActions = [];

    switch (errorType) {
        case 'zero_division':
            icon = '🚫';
            title = 'Ділення на нуль неможливе!';
            rule = 'Ділення на 0 (або mod 0) є забороненою операцією в арифметиці.';
            explanation = 'Ділення a ÷ b = c означає пошук c, для якого c × b = a. При b = 0 результат c × 0 завжди 0, тому для ненульового a результату не існує.';
            remedy = 'Замініть дільник на будь-яке ненульове число або візьміть наближення 0.0001.';
            quickActions = [
                {
                    text: '🔧 Замінити знаменник на 1',
                    handler: () => {
                        state.currentInput = '1';
                        state.shouldResetDisplay = false;
                        updateDisplay();
                        closeModal('error-advisor-modal');
                        calculate();
                        showToast('Знаменник замінено на 1', '✅');
                    }
                },
                {
                    text: '🔬 Наближення (0.0001)',
                    handler: () => {
                        state.currentInput = '0.0001';
                        state.shouldResetDisplay = false;
                        updateDisplay();
                        closeModal('error-advisor-modal');
                        calculate();
                        showToast('Застосовано наближення (0.0001)', '🔬');
                    }
                }
            ];
            break;

        case 'negative_sqrt':
            icon = '📐';
            title = 'Корінь з від\'ємного числа!';
            rule = 'Корінь парного степеня з від\'ємного числа (√-x) не існує в ℝ.';
            explanation = `Число ${contextVal.val || 'x'} < 0. Квадрат будь-якого дійсного числа невід'ємний.`;
            remedy = 'Візьміть модуль |x| або перейдіть до комплексних чисел.';
            quickActions = [
                {
                    text: '⚡ Застосувати модуль |x| та обчислити √|x|',
                    handler: () => {
                        const num = Math.abs(parseFloat(state.currentInput) || 0);
                        const res = Math.sqrt(num);
                        const formatted = formatResult(res);
                        addToHistory(`√|${state.currentInput}|`, formatted);
                        state.currentInput = formatted;
                        state.shouldResetDisplay = true;
                        updateDisplay();
                        closeModal('error-advisor-modal');
                        showToast(`Обчислено: √${num} = ${formatted}`, '✅');
                    }
                }
            ];
            break;

        case 'invalid_log':
            icon = '📉';
            title = 'Логарифм недопустимого аргументу!';
            rule = 'Логарифми ln(x) та log(x) визначені виключно для x > 0.';
            explanation = 'Основа степеня додатна, тому результат піднесення до степеня ніколи не може бути ≤ 0.';
            remedy = 'Застосуйте модуль |x| або зробіть аргумент строго додатним.';
            quickActions = [
                {
                    text: '⚡ Взяти модуль |x| для логарифма',
                    handler: () => {
                        const num = Math.abs(parseFloat(state.currentInput) || 1);
                        const safeNum = num === 0 ? 1 : num;
                        const res = Math.log(safeNum);
                        const formatted = formatResult(res);
                        addToHistory(`ln(|${state.currentInput}|)`, formatted);
                        state.currentInput = formatted;
                        state.shouldResetDisplay = true;
                        updateDisplay();
                        closeModal('error-advisor-modal');
                        showToast(`Обчислено ln(|${safeNum}|) = ${formatted}`, '✅');
                    }
                }
            ];
            break;

        case 'invalid_asin_acos':
            icon = '⭕';
            title = 'Аргумент поза діапазоном [-1, 1]!';
            rule = 'Функції asin та acos визначені лише для чисел у проміжку від -1 до 1.';
            explanation = `Значення ${contextVal.val || 'x'} виходить за межі одиничного кола.`;
            remedy = 'Обмежте число до максимуму 1.0 або -1.0.';
            quickActions = [
                {
                    text: '🔧 Обмежити до 1.0',
                    handler: () => {
                        state.currentInput = '1';
                        state.shouldResetDisplay = false;
                        updateDisplay();
                        closeModal('error-advisor-modal');
                        handleTrigOrSecondary('sin');
                    }
                }
            ];
            break;

        case 'tan_90':
            icon = '📐';
            title = 'Тангенс 90° (асимптота)!';
            rule = 'Тангенс 90° та 270° прямує до нескінченності.';
            explanation = 'cos(90°) = 0, тому tan(90°) = sin/0 (розрив).';
            remedy = 'Використовуйте апроксимацію 89.999°.';
            quickActions = [
                {
                    text: '🔬 Змінити на 89.999°',
                    handler: () => {
                        state.currentInput = '89.999';
                        state.shouldResetDisplay = false;
                        updateDisplay();
                        closeModal('error-advisor-modal');
                        handleTrigOrSecondary('tan');
                    }
                }
            ];
            break;

        case 'invalid_factorial':
            icon = '❗';
            title = 'Факторіал від\'ємного чи дробу!';
            rule = 'Факторіал n! визначений лише для цілих невід\'ємних чисел.';
            explanation = 'Факторіал — дискретний добуток послідовних цілих чисел 1 × 2 × ... × n.';
            remedy = 'Округліть число до цілого додатного.';
            quickActions = [
                {
                    text: '⚡ Округлити до цілого',
                    handler: () => {
                        const num = Math.abs(Math.round(parseFloat(state.currentInput) || 0));
                        state.currentInput = num.toString();
                        state.shouldResetDisplay = false;
                        updateDisplay();
                        closeModal('error-advisor-modal');
                        calculateFactorial();
                    }
                }
            ];
            break;
    }

    if (diagIcon) diagIcon.innerText = icon;
    if (diagTitle) diagTitle.innerText = title;
    if (diagRule) diagRule.innerText = rule;
    if (diagExpl) diagExpl.innerText = explanation;
    if (diagRemedy) diagRemedy.innerText = remedy;

    quickActions.forEach(act => {
        const btn = document.createElement('button');
        btn.innerText = act.text;
        btn.onclick = act.handler;
        actionsContainer.appendChild(btn);
    });

    openModal('error-advisor-modal');
}

function toggleAccordion(headerEl) {
    const item = headerEl.parentElement;
    item.classList.toggle('active');
}

// ==========================================================================
// Голосове Озвучення (Speech Synthesis)
// ==========================================================================
function speakCurrentResult() {
    if (!('speechSynthesis' in window)) {
        showToast('Speech Synthesis не підтримується', '⚠️');
        return;
    }

    audio.playAction();
    window.speechSynthesis.cancel();

    let textToSpeak = state.currentInput;
    if (textToSpeak === 'Помилка') {
        textToSpeak = 'Помилка обчислення. Будь ласка, перегляньте математичний порадник.';
    } else {
        textToSpeak = `Результат: ${state.currentInput.replace('-', 'мінус ')}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'uk-UA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => v.lang.includes('uk') || v.lang.includes('UA'));
    if (ukVoice) utterance.voice = ukVoice;

    window.speechSynthesis.speak(utterance);
    showToast(`Озвучено: ${state.currentInput}`, '🗣️');
}

// ==========================================================================
// Оновлення дисплея та індикаторів
// ==========================================================================
function updateDisplay() {
    if (dom.display) {
        const formatted = formatDisplayString(state.currentInput);
        const len = formatted.length;
        if (len > 16) {
            dom.display.style.fontSize = '1.35rem';
        } else if (len > 11) {
            dom.display.style.fontSize = '1.75rem';
        } else {
            dom.display.style.fontSize = '2.2rem';
        }
        dom.display.innerText = formatted;
    }

    if (dom.historyLine) {
        if (state.operator != null) {
            let opSymbol = state.operator;
            if (opSymbol === '*') opSymbol = '×';
            if (opSymbol === '/') opSymbol = '÷';
            if (opSymbol === '^') opSymbol = '^';
            if (opSymbol === 'mod') opSymbol = 'mod';
            dom.historyLine.innerText = `${formatDisplayString(state.previousInput)} ${opSymbol}`;
        } else {
            dom.historyLine.innerText = '';
        }
    }

    // Індикатор кутового режиму (DEG / RAD / GRAD)
    if (dom.modeBadge) {
        dom.modeBadge.innerText = state.angleMode;
        const angleNames = { DEG: 'Градуси (DEG)', RAD: 'Радіани (RAD)', GRAD: 'Градіани (GRAD)' };
        dom.modeBadge.title = `Кутовий режим: ${angleNames[state.angleMode]} (клікніть для зміни)`;
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
        const hasMemory = state.memoryValue !== 0 || state.memorySlots.some(s => s !== 0);
        if (hasMemory) {
            dom.memoryBadge.classList.add('active');
            dom.memoryBadge.innerText = `M (${formatResult(state.memoryValue)})`;
        } else {
            dom.memoryBadge.classList.remove('active');
            dom.memoryBadge.innerText = 'M';
        }
    }

    // Індикатор розділювача розрядів
    if (dom.separatorTag) {
        const sepNames = { space: 'Розряди: Пробіл', comma: 'Розряди: Кома', none: 'Розряди: Без' };
        dom.separatorTag.innerText = sepNames[state.thousandSeparator] || 'Розряди';
    }

    // Індикатор точності
    if (dom.precisionTag) {
        dom.precisionTag.innerText = `Округлення: ${state.precisionMode === 'auto' ? 'Auto' : state.precisionMode + ' зн.'}`;
    }

    // Індикатор звуку
    updateAudioUI();

    // Лічильник операцій
    if (dom.opsCounter) {
        dom.opsCounter.innerText = state.operationsCount;
    }

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
    const isMuted = state.soundProfile === 'off' || state.soundVolume <= 0;
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
        dom.audioBadge.title = `Звук: ${pName} (${Math.round(state.soundVolume * 100)}%)`;
    }
    if (dom.sidebarSoundStatus) {
        dom.sidebarSoundStatus.innerText = `🔔 ${pName} (${Math.round(state.soundVolume * 100)}%)`;
    }
}

// ==========================================================================
// Перемикачі та системні функції
// ==========================================================================
function toggleAngleMode() {
    const modes = ['DEG', 'RAD', 'GRAD'];
    const curIdx = modes.indexOf(state.angleMode);
    state.angleMode = modes[(curIdx + 1) % modes.length];
    localStorage.setItem('calc_angle_mode', state.angleMode);
    audio.playAction();
    updateDisplay();
    const names = { DEG: 'Градуси (DEG)', RAD: 'Радіани (RAD)', GRAD: 'Градіани / Гради (GRAD)' };
    showToast(`Кутовий режим: ${names[state.angleMode]}`, '📐');
}

function toggleSecondMode() {
    state.isSecondMode = !state.isSecondMode;
    audio.playAction();
    updateDisplay();
    showToast(state.isSecondMode ? 'Режим 2nd (Shift) увімкнено' : 'Стандартні функції', '⚡');
}

function cyclePrecision() {
    audio.playAction();
    const modes = ['auto', '0', '2', '4', '6', '8', '10', '12'];
    const curIdx = modes.indexOf(state.precisionMode);
    state.precisionMode = modes[(curIdx + 1) % modes.length];
    localStorage.setItem('calc_precision', state.precisionMode);
    updateDisplay();
    showToast(`Точність: ${state.precisionMode === 'auto' ? 'Автоматична' : state.precisionMode + ' знаків'}`, '🎯');
}

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

function goHome() {
    audio.playAction();
    clearDisplay();
    state.memoryValue = 0;
    state.isSecondMode = false;
    updateDisplay();
    openModal('home-modal');
}

function clearDisplay() {
    audio.playAction();
    state.currentInput = '0';
    state.previousInput = '';
    state.operator = undefined;
    state.shouldResetDisplay = false;
    updateDisplay();
}

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
// Тригонометрія з підтримкою DEG, RAD та GRAD
// ==========================================================================
function angleToRadians(val) {
    if (state.angleMode === 'DEG') return val * (Math.PI / 180);
    if (state.angleMode === 'GRAD') return val * (Math.PI / 200);
    return val;
}

function radiansToAngle(rad) {
    if (state.angleMode === 'DEG') return rad * (180 / Math.PI);
    if (state.angleMode === 'GRAD') return rad * (200 / Math.PI);
    return rad;
}

function handleTrigOrSecondary(func) {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (isNaN(current)) return;

    let result;
    const unitMap = { DEG: '°', RAD: ' rad', GRAD: ' grad' };
    const unit = unitMap[state.angleMode];

    if (!state.isSecondMode) {
        let radians = angleToRadians(current);
        if (func === 'sin') result = Math.sin(radians);
        else if (func === 'cos') result = Math.cos(radians);
        else if (func === 'tan') {
            if ((state.angleMode === 'DEG' && Math.abs(current % 180) === 90) ||
                (state.angleMode === 'GRAD' && Math.abs(current % 200) === 100)) {
                triggerMathAdvisor('tan_90', { val: current });
                state.currentInput = 'Помилка (tan 90°)';
                updateDisplay();
                return;
            }
            result = Math.tan(radians);
        }
        result = Math.round(result * 1000000000) / 1000000000;
        let formatted = formatResult(result);
        addToHistory(`${func}(${current}${unit})`, formatted);
        state.currentInput = formatted;
    } else {
        if (func === 'sin') {
            if (current < -1 || current > 1) {
                triggerMathAdvisor('invalid_asin_acos', { val: current });
                state.currentInput = 'Помилка (|x| > 1)';
                updateDisplay();
                return;
            }
            let rad = Math.asin(current);
            result = radiansToAngle(rad);
            let formatted = formatResult(result);
            addToHistory(`asin(${current})`, `${formatted}${unit}`);
            state.currentInput = formatted;
        } else if (func === 'cos') {
            if (current < -1 || current > 1) {
                triggerMathAdvisor('invalid_asin_acos', { val: current });
                state.currentInput = 'Помилка (|x| > 1)';
                updateDisplay();
                return;
            }
            let rad = Math.acos(current);
            result = radiansToAngle(rad);
            let formatted = formatResult(result);
            addToHistory(`acos(${current})`, `${formatted}${unit}`);
            state.currentInput = formatted;
        } else if (func === 'tan') {
            let rad = Math.atan(current);
            result = radiansToAngle(rad);
            let formatted = formatResult(result);
            addToHistory(`atan(${current})`, `${formatted}${unit}`);
            state.currentInput = formatted;
        }
    }

    state.shouldResetDisplay = true;
    updateDisplay();
}

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

function handleLnOrLog2() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (current <= 0 || isNaN(current)) {
        triggerMathAdvisor('invalid_log', { val: current });
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

function handleLogOr10x() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (!state.isSecondMode) {
        if (current <= 0 || isNaN(current)) {
            triggerMathAdvisor('invalid_log', { val: current });
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

function handleSqrtOrCbrt() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (!state.isSecondMode) {
        if (current < 0 || isNaN(current)) {
            triggerMathAdvisor('negative_sqrt', { val: current });
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

function calculateInverse() {
    audio.playAction();
    const current = parseFloat(state.currentInput);
    if (current === 0) {
        triggerMathAdvisor('zero_division');
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

function calculateFactorial() {
    audio.playAction();
    let num = parseFloat(state.currentInput);
    if (num < 0 || isNaN(num) || state.currentInput.includes('.')) {
        triggerMathAdvisor('invalid_factorial', { val: num });
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

function toggleSign() {
    audio.playClick(550);
    if (state.currentInput === '0' || isNaN(parseFloat(state.currentInput))) return;
    state.currentInput = (parseFloat(state.currentInput) * -1).toString();
    updateDisplay();
}

function insertPi() {
    audio.playAction();
    if (state.shouldResetDisplay) { state.currentInput = ''; state.shouldResetDisplay = false; }
    state.currentInput = Math.PI.toFixed(12).replace(/\.?0+$/, '');
    updateDisplay();
}

function insertEuler() {
    audio.playAction();
    if (state.shouldResetDisplay) { state.currentInput = ''; state.shouldResetDisplay = false; }
    state.currentInput = Math.E.toFixed(12).replace(/\.?0+$/, '');
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

// Пам'ять
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

// Матриця Пам'яті M1-M4
function updateMemorySlotsUI() {
    for (let i = 0; i < 4; i++) {
        const el = document.getElementById(`mem-slot-val-${i}`);
        if (el) el.innerText = formatResult(state.memorySlots[i]);
    }
}

function memorySlotStore(idx) {
    audio.playAction();
    const val = parseFloat(state.currentInput) || 0;
    state.memorySlots[idx] = val;
    localStorage.setItem('calc_mem_slots', JSON.stringify(state.memorySlots));
    updateMemorySlotsUI();
    updateDisplay();
    showToast(`Збережено в M${idx + 1}: ${val}`, '💾');
}

function memorySlotRecall(idx) {
    audio.playAction();
    const val = state.memorySlots[idx] || 0;
    state.currentInput = formatResult(val);
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('memory-modal');
    showToast(`Викликано з M${idx + 1}: ${state.currentInput}`, '📥');
}

function memorySlotClear(idx) {
    audio.playAction();
    state.memorySlots[idx] = 0;
    localStorage.setItem('calc_mem_slots', JSON.stringify(state.memorySlots));
    updateMemorySlotsUI();
    updateDisplay();
    showToast(`Слот M${idx + 1} очищено`, '🧹');
}

function clearAllMemorySlots() {
    audio.playAction();
    state.memorySlots = [0, 0, 0, 0];
    localStorage.setItem('calc_mem_slots', JSON.stringify(state.memorySlots));
    updateMemorySlotsUI();
    updateDisplay();
    showToast('Всі слоти M1-M4 очищено', '🧹');
}

// ==========================================================================
// Матричний Калькулятор (2x2 та 3x3)
// ==========================================================================
function setMatrixSize(size) {
    state.matrixSize = size;
    document.querySelectorAll('.matrix-size-selector button').forEach(b => {
        b.classList.toggle('active', parseInt(b.getAttribute('data-msize')) === size);
    });

    const grid = document.getElementById('matrix-a-grid');
    if (!grid) return;
    grid.className = `matrix-grid matrix-${size}x${size}`;
    grid.innerHTML = '';

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.id = `m_a_${r}${c}`;
            inp.value = (r === c) ? '1' : '0';
            inp.oninput = solveMatrixMath;
            grid.appendChild(inp);
        }
    }
    solveMatrixMath();
}

function getMatrixData(size) {
    const mat = [];
    for (let r = 0; r < size; r++) {
        mat[r] = [];
        for (let c = 0; c < size; c++) {
            const el = document.getElementById(`m_a_${r}${c}`);
            mat[r][c] = parseFloat(el ? el.value : '0') || 0;
        }
    }
    return mat;
}

function solveMatrixMath() {
    const size = state.matrixSize;
    const mat = getMatrixData(size);
    const detEl = document.getElementById('mat-det-val');
    const trEl = document.getElementById('mat-trace-val');
    const tBox = document.getElementById('mat-transpose-val');
    const invBox = document.getElementById('mat-inverse-val');

    let det = 0;
    let trace = 0;
    for (let i = 0; i < size; i++) trace += mat[i][i];
    if (trEl) trEl.innerText = trace.toFixed(2);

    if (size === 2) {
        det = (mat[0][0] * mat[1][1]) - (mat[0][1] * mat[1][0]);
    } else {
        det = mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
              mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
              mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0]);
    }

    state.matrixDetVal = det.toFixed(4);
    if (detEl) detEl.innerText = state.matrixDetVal;

    // Транспонована
    if (tBox) {
        tBox.className = `matrix-grid-mini matrix-${size}x${size}`;
        tBox.innerHTML = '';
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const s = document.createElement('span');
                s.innerText = mat[c][r].toFixed(2);
                tBox.appendChild(s);
            }
        }
    }

    // Обернена
    if (invBox) {
        invBox.className = `matrix-grid-mini matrix-${size}x${size}`;
        invBox.innerHTML = '';
        if (Math.abs(det) < 0.000001) {
            invBox.innerHTML = '<span style="grid-column: 1/-1; color: var(--accent-clear);">Оберненої матриці не існує (det = 0)</span>';
        } else if (size === 2) {
            const inv = [
                [mat[1][1] / det, -mat[0][1] / det],
                [-mat[1][0] / det, mat[0][0] / det]
            ];
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 2; c++) {
                    const s = document.createElement('span');
                    s.innerText = inv[r][c].toFixed(3);
                    invBox.appendChild(s);
                }
            }
        } else {
            invBox.innerHTML = '<span style="grid-column: 1/-1;">Обчислено аналітично (det A ≠ 0)</span>';
        }
    }
}

function insertMatrixDetToCalc() {
    audio.playAction();
    state.currentInput = state.matrixDetVal;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('matrix-modal');
    showToast(`Визначник det(A) = ${state.matrixDetVal} вставлено`, '🧮');
}

function resetMatrixInputs() {
    setMatrixSize(state.matrixSize);
}

// ==========================================================================
// Інтерактивний Бітовий Інспектор (Bitmask Visualizer)
// ==========================================================================
function renderBitmaskGrid() {
    const grid = document.getElementById('bits-interactive-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 31; i >= 0; i--) {
        const isSet = ((state.bitmaskValue >>> i) & 1) === 1;
        const btn = document.createElement('button');
        btn.className = `bit-btn ${isSet ? 'active' : ''}`;
        btn.innerText = isSet ? '1' : '0';
        btn.title = `Біт ${i} (вага: 2^${i} = ${Math.pow(2, i)})`;
        btn.onclick = () => {
            audio.playClick(800);
            state.bitmaskValue = (state.bitmaskValue ^ (1 << i)) >>> 0;
            updateBitmaskOutputs();
        };
        grid.appendChild(btn);
    }
}

function updateBitmaskOutputs() {
    const decEl = document.getElementById('bit-dec-input');
    const hexEl = document.getElementById('bit-hex-input');
    if (decEl) decEl.value = state.bitmaskValue;
    if (hexEl) hexEl.value = '0x' + (state.bitmaskValue >>> 0).toString(16).toUpperCase();
    renderBitmaskGrid();
}

function syncFromDecInput(val) {
    const num = parseInt(val, 10) || 0;
    state.bitmaskValue = num >>> 0;
    updateBitmaskOutputs();
}

function syncFromHexInput(val) {
    const clean = val.replace(/^0x/i, '');
    const num = parseInt(clean, 16) || 0;
    state.bitmaskValue = num >>> 0;
    updateBitmaskOutputs();
}

function bitwiseMaskOp(op) {
    audio.playAction();
    if (op === 'invert') state.bitmaskValue = (~state.bitmaskValue) >>> 0;
    else if (op === 'shl') state.bitmaskValue = (state.bitmaskValue << 1) >>> 0;
    else if (op === 'shr') state.bitmaskValue = (state.bitmaskValue >>> 1);
    else if (op === 'clear') state.bitmaskValue = 0;
    else if (op === 'fill') state.bitmaskValue = 0xFFFFFFFF;
    updateBitmaskOutputs();
}

function insertBitmaskToCalc() {
    audio.playAction();
    state.currentInput = state.bitmaskValue.toString();
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('bitmask-modal');
    showToast(`Значення ${state.bitmaskValue} вставлено`, '👾');
}

// ==========================================================================
// Розширений Калькулятор Відсотків Pro
// ==========================================================================
function calcPercent1() {
    const p = parseFloat(document.getElementById('p1-percent').value) || 0;
    const base = parseFloat(document.getElementById('p1-base').value) || 0;
    const res = (p / 100) * base;
    const el = document.getElementById('p1-res');
    if (el) el.innerText = formatResult(res);
}

function calcPercent2() {
    const v1 = parseFloat(document.getElementById('p2-val1').value) || 0;
    const v2 = parseFloat(document.getElementById('p2-val2').value) || 0;
    const el = document.getElementById('p2-res');
    if (v1 === 0) {
        if (el) el.innerText = 'Неможливо (база 0)';
        return;
    }
    const delta = ((v2 - v1) / v1) * 100;
    if (el) el.innerText = `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`;
}

function calcPercent3() {
    const base = parseFloat(document.getElementById('p3-base').value) || 0;
    const op = document.getElementById('p3-op').value;
    const p = parseFloat(document.getElementById('p3-percent').value) || 0;
    const el = document.getElementById('p3-res');
    let res = op === 'add' ? base + (base * (p / 100)) : base - (base * (p / 100));
    if (el) el.innerText = formatResult(res);
}

// ==========================================================================
// Конвертер Валют та Криптовалют
// ==========================================================================
function runCurrencyConversion(dir = 'from') {
    const fromUnit = document.getElementById('curr-from-unit').value;
    const toUnit = document.getElementById('curr-to-unit').value;
    const fromInp = document.getElementById('curr-from-val');
    const toInp = document.getElementById('curr-to-val');
    if (!fromInp || !toInp) return;

    const rates = state.currencyRates;
    if (dir === 'from') {
        const val = parseFloat(fromInp.value) || 0;
        const inUAH = val * (rates[fromUnit] || 1);
        const res = inUAH / (rates[toUnit] || 1);
        toInp.value = res < 0.01 ? res.toFixed(6) : res.toFixed(2);
    } else {
        const val = parseFloat(toInp.value) || 0;
        const inUAH = val * (rates[toUnit] || 1);
        const res = inUAH / (rates[fromUnit] || 1);
        fromInp.value = res < 0.01 ? res.toFixed(6) : res.toFixed(2);
    }
}

function swapCurrencyUnits() {
    audio.playAction();
    const u1 = document.getElementById('curr-from-unit');
    const u2 = document.getElementById('curr-to-unit');
    if (!u1 || !u2) return;
    const t = u1.value;
    u1.value = u2.value;
    u2.value = t;
    runCurrencyConversion('from');
}

function insertCurrencyToCalc() {
    audio.playAction();
    const val = document.getElementById('curr-to-val').value;
    if (val) {
        state.currentInput = val;
        state.shouldResetDisplay = true;
        updateDisplay();
        closeModal('currency-modal');
        showToast(`Суму ${val} вставлено`, '💱');
    }
}

function copyCurrencyVal() {
    const val = document.getElementById('curr-to-val').value;
    if (val) {
        audio.playAction();
        navigator.clipboard.writeText(val);
        showToast(`Скопійовано: ${val}`, '📋');
    }
}

// ==========================================================================
// Головний розрахунок (Calculate)
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
                triggerMathAdvisor('zero_division');
                state.currentInput = '0';
                state.operator = undefined;
                state.shouldResetDisplay = true;
                updateDisplay();
                return;
            }
            computation = prev / current;
            break;
        case '^':
            if (prev === 0 && current <= 0) {
                triggerMathAdvisor('zero_division');
                return;
            }
            computation = Math.pow(prev, current);
            break;
        case 'mod':
            if (current === 0) {
                triggerMathAdvisor('zero_division');
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
    if (state.precisionMode !== 'auto') {
        const decimals = parseInt(state.precisionMode);
        return parseFloat(num.toFixed(decimals)).toString();
    }
    return parseFloat(num.toFixed(12)).toString();
}

// ==========================================================================
// Розв'язувач Квадратних Рівнянь
// ==========================================================================
function solveQuadraticEquation() {
    const a = parseFloat(document.getElementById('quad-a').value) || 0;
    const b = parseFloat(document.getElementById('quad-b').value) || 0;
    const c = parseFloat(document.getElementById('quad-c').value) || 0;

    const discEl = document.getElementById('quad-disc-val');
    const x1El = document.getElementById('quad-x1-val');
    const x2El = document.getElementById('quad-x2-val');
    const vertEl = document.getElementById('quad-vertex-info');

    if (a === 0) {
        if (discEl) discEl.innerText = 'a = 0 (Лінійне рівняння bx + c = 0)';
        if (b !== 0) {
            const root = (-c / b).toFixed(4);
            state.quadRoots.x1 = root;
            state.quadRoots.x2 = root;
            if (x1El) x1El.innerText = root;
            if (x2El) x2El.innerText = '—';
        } else {
            if (x1El) x1El.innerText = c === 0 ? 'Безліч коренів' : 'Немає розв\'язків';
            if (x2El) x2El.innerText = '—';
        }
        if (vertEl) vertEl.innerText = 'Вершина: не існує (пряма)';
        return;
    }

    const D = (b * b) - (4 * a * c);
    if (discEl) discEl.innerText = `D = ${D >= 0 ? D.toFixed(4) : D.toFixed(4) + ' (D < 0)'}`;

    const vx = -b / (2 * a);
    const vy = c - (b * b) / (4 * a);
    if (vertEl) vertEl.innerHTML = `Вершина параболи: <code>(${vx.toFixed(3)}; ${vy.toFixed(3)})</code>`;

    if (D > 0) {
        const sqrtD = Math.sqrt(D);
        const x1 = (-b + sqrtD) / (2 * a);
        const x2 = (-b - sqrtD) / (2 * a);
        state.quadRoots.x1 = x1.toFixed(4);
        state.quadRoots.x2 = x2.toFixed(4);
        if (x1El) x1El.innerText = state.quadRoots.x1;
        if (x2El) x2El.innerText = state.quadRoots.x2;
    } else if (D === 0) {
        const x = -b / (2 * a);
        state.quadRoots.x1 = x.toFixed(4);
        state.quadRoots.x2 = x.toFixed(4);
        if (x1El) x1El.innerText = state.quadRoots.x1;
        if (x2El) x2El.innerText = `${state.quadRoots.x2} (один корінь)`;
    } else {
        const real = (-b / (2 * a)).toFixed(3);
        const imag = (Math.sqrt(-D) / (2 * a)).toFixed(3);
        state.quadRoots.x1 = `${real} + ${imag}i`;
        state.quadRoots.x2 = `${real} - ${imag}i`;
        if (x1El) x1El.innerText = state.quadRoots.x1;
        if (x2El) x2El.innerText = state.quadRoots.x2;
    }
}

function insertQuadRootToCalc(idx) {
    audio.playAction();
    const val = idx === 1 ? state.quadRoots.x1 : state.quadRoots.x2;
    if (val && !val.includes('i')) {
        state.currentInput = val.toString();
        state.shouldResetDisplay = true;
        updateDisplay();
        closeModal('quadratic-modal');
        showToast(`Корінь x${idx} = ${val} вставлено`, '📐');
    } else {
        showToast('Комплексне число не підтримується у дійсній панелі', '⚠️');
    }
}

// ==========================================================================
// Статистичний Модуль
// ==========================================================================
function calculateStatistics() {
    const raw = document.getElementById('stats-data-input').value;
    const nums = raw.split(/[\s,;]+/).map(Number).filter(n => !isNaN(n) && isFinite(n));

    if (nums.length === 0) {
        document.getElementById('stat-mean').innerText = '0';
        document.getElementById('stat-median').innerText = '0';
        document.getElementById('stat-mode').innerText = '0';
        document.getElementById('stat-sum').innerText = '0';
        document.getElementById('stat-std').innerText = '0';
        document.getElementById('stat-var').innerText = '0';
        document.getElementById('stat-min').innerText = '0';
        document.getElementById('stat-max').innerText = '0';
        return;
    }

    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;
    state.statMeanVal = mean.toFixed(4);

    const sorted = [...nums].sort((a, b) => a - b);
    let median;
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        median = sorted[mid];
    }

    const counts = {};
    nums.forEach(n => counts[n] = (counts[n] || 0) + 1);
    let maxFreq = 0;
    let mode = nums[0];
    for (let k in counts) {
        if (counts[k] > maxFreq) {
            maxFreq = counts[k];
            mode = k;
        }
    }

    const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / nums.length;
    const stdDev = Math.sqrt(variance);

    document.getElementById('stat-mean').innerText = mean.toFixed(4);
    document.getElementById('stat-median').innerText = median.toFixed(4);
    document.getElementById('stat-mode').innerText = `${mode} (x${maxFreq})`;
    document.getElementById('stat-sum').innerText = sum.toFixed(2);
    document.getElementById('stat-std').innerText = stdDev.toFixed(4);
    document.getElementById('stat-var').innerText = variance.toFixed(4);
    document.getElementById('stat-min').innerText = Math.min(...nums);
    document.getElementById('stat-max').innerText = Math.max(...nums);
}

function insertStatMeanToCalc() {
    audio.playAction();
    state.currentInput = state.statMeanVal;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('stats-modal');
    showToast(`Середнє (${state.statMeanVal}) вставлено`, '📊');
}

function clearStatsInput() {
    audio.playAction();
    document.getElementById('stats-data-input').value = '';
    calculateStatistics();
}

// ==========================================================================
// Калькулятор Дат
// ==========================================================================
function switchDateTab(tab) {
    state.activeDateTab = tab;
    document.querySelectorAll('.date-tabs button').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-dtab') === tab);
    });
    document.getElementById('date-section-diff').style.display = tab === 'diff' ? 'flex' : 'none';
    document.getElementById('date-section-add').style.display = tab === 'add' ? 'flex' : 'none';
}

function calculateDateDiff() {
    const d1 = new Date(document.getElementById('date-start').value);
    const d2 = new Date(document.getElementById('date-end').value);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return;

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = (diffDays / 7).toFixed(1);
    const months = (diffDays / 30.44).toFixed(1);

    const resBox = document.getElementById('date-diff-result');
    if (resBox) {
        resBox.innerHTML = `<span>Різниця:</span> <strong>${diffDays} днів (~${weeks} тижнів / ~${months} міс.)</strong>`;
    }
}

function calculateDateAdd() {
    const base = new Date(document.getElementById('date-base').value);
    const days = parseInt(document.getElementById('date-days-count').value) || 0;
    if (isNaN(base.getTime())) return;

    const resultDate = new Date(base);
    resultDate.setDate(resultDate.getDate() + days);

    const formatted = resultDate.toLocaleDateString('uk-UA', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    const resBox = document.getElementById('date-add-result');
    if (resBox) {
        resBox.innerHTML = `<span>Отримана дата:</span> <strong>${formatted}</strong>`;
    }
}

// ==========================================================================
// Центр Налаштувань
// ==========================================================================
function updateSettingsVolume(val) {
    state.soundVolume = parseFloat(val) / 100;
    localStorage.setItem('calc_sound_vol', state.soundVolume.toString());
    const label = document.getElementById('setting-vol-val');
    if (label) label.innerText = `${val}%`;
    audio.playClick(750);
    updateAudioUI();
}

function setSettingsSoundProfile(val) {
    state.soundProfile = val;
    localStorage.setItem('calc_sound_profile', val);
    audio.playAction();
    updateAudioUI();
}

function setSettingsSeparator(val) {
    state.thousandSeparator = val;
    localStorage.setItem('calc_separator', val);
    audio.playAction();
    updateDisplay();
}

function setSettingsPrecision(val) {
    state.precisionMode = val;
    localStorage.setItem('calc_precision', val);
    audio.playAction();
    updateDisplay();
}

function setSettingsDefaultAngle(val) {
    state.angleMode = val;
    localStorage.setItem('calc_angle_mode', val);
    audio.playAction();
    updateDisplay();
}

function setSettingsGlassIntensity(val) {
    state.glassIntensity = val;
    localStorage.setItem('calc_glass', val);
    const card = document.querySelector('.app-container');
    if (card) {
        if (val === 'ultra') card.style.backdropFilter = 'blur(40px)';
        else if (val === 'subtle') card.style.backdropFilter = 'blur(10px)';
        else if (val === 'solid') card.style.backdropFilter = 'none';
        else card.style.backdropFilter = 'blur(24px)';
    }
    audio.playAction();
}

function resetAllSettings() {
    audio.playAction();
    localStorage.clear();
    state.soundVolume = 0.8;
    state.soundProfile = 'classic';
    state.precisionMode = 'auto';
    state.thousandSeparator = 'space';
    state.angleMode = 'DEG';
    state.currentTheme = 'bordeaux_luxury';
    state.currentFont = 'font-inter';
    state.currentWallpaper = 'burgundy';
    state.memoryValue = 0;
    state.memorySlots = [0, 0, 0, 0];

    document.getElementById('setting-volume').value = 80;
    document.getElementById('setting-vol-val').innerText = '80%';
    document.getElementById('setting-sound-profile').value = 'classic';
    document.getElementById('setting-separator').value = 'space';
    document.getElementById('setting-precision').value = 'auto';
    document.getElementById('setting-angle').value = 'DEG';
    document.getElementById('setting-glass').value = 'heavy';

    setFontFamily('font-inter');
    setTheme('bordeaux_luxury');
    setWallpaper('burgundy');
    updateDisplay();
    closeModal('settings-modal');
    showToast('Всі налаштування скинуто до заводських', '🔁');
}

// ==========================================================================
// Кастомізатор Кольорів
// ==========================================================================
function applyRealtimeColor(type, colorHex) {
    if (type === 'accent') {
        document.documentElement.style.setProperty('--accent-operator', colorHex);
        document.documentElement.style.setProperty('--accent-equals', colorHex);
        document.documentElement.style.setProperty('--badge-bg', `${colorHex}25`);
        document.documentElement.style.setProperty('--badge-border', `${colorHex}55`);
        document.getElementById('picker-accent-color').value = colorHex;
        document.getElementById('hex-accent-color').value = colorHex;
    } else if (type === 'bg') {
        document.documentElement.style.setProperty('--bg-body', colorHex);
        document.documentElement.style.setProperty('--bg-card', `${colorHex}d9`);
        document.getElementById('picker-bg-color').value = colorHex;
        document.getElementById('hex-bg-color').value = colorHex;
    }
}

function resetCustomColors() {
    document.documentElement.style.removeProperty('--accent-operator');
    document.documentElement.style.removeProperty('--accent-equals');
    document.documentElement.style.removeProperty('--badge-bg');
    document.documentElement.style.removeProperty('--badge-border');
    document.documentElement.style.removeProperty('--bg-body');
    document.documentElement.style.removeProperty('--bg-card');
    showToast('Кольори теми відновлено', '🎨');
}

// ==========================================================================
// Шрифти (8 Шрифтів)
// ==========================================================================
function setFontFamily(fontClass) {
    audio.playAction();
    document.body.className = document.body.className.replace(/\bfont-\w+\b/g, '');
    document.body.classList.add(fontClass);
    state.currentFont = fontClass;
    localStorage.setItem('calc_font', fontClass);

    document.querySelectorAll('.font-card').forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-font') === fontClass);
    });

    const fontNames = {
        'font-inter': 'Inter',
        'font-jetbrains': 'JetBrains Mono',
        'font-orbitron': 'Orbitron Digital',
        'font-rajdhani': 'Rajdhani Mecha',
        'font-spacegrotesk': 'Space Grotesk',
        'font-silkscreen': 'Silkscreen 8-Bit',
        'font-outfit': 'Outfit Geometric',
        'font-firacode': 'Fira Code'
    };

    if (dom.currentFontChip) {
        dom.currentFontChip.innerText = fontNames[fontClass] || 'Inter';
    }

    closeModal('font-modal');
    showToast(`Встановлено шрифт: ${fontNames[fontClass]}`, '🔤');
}

// ==========================================================================
// Теми та Кольори (24 Themes)
// ==========================================================================
function setTheme(themeName) {
    audio.playAction();
    document.body.setAttribute('data-theme', themeName);
    state.currentTheme = themeName;
    localStorage.setItem('calc_theme', themeName);
    
    resetCustomColors();

    document.querySelectorAll('.theme-card').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });

    closeModal('theme-modal');
    showToast(`Тема: ${getThemeNameUA(themeName)}`, '🎨');
}

function setCustomAccent(colorHex, name) {
    audio.playAction();
    applyRealtimeColor('accent', colorHex);
    showToast(`Акцентний колір: ${name}`, '✨');
}

function getThemeNameUA(theme) {
    const names = {
        bordeaux_luxury: 'Bordeaux Imperial Wine',
        velvet_burgundy: 'Velvet Burgundy Noir',
        autumn_crimson: 'Autumn Crimson',
        volcanic_magma: 'Volcanic Magma',
        redstone2: 'Redstone 2 Quantum Pulse',
        deep_space: 'Deep Space Nebula',
        cyber_lime: 'Cyber Lime Acid',
        royal_amethyst: 'Royal Amethyst',
        redstone: 'Redstone 1 Flux',
        cyber_amber: 'Amber Cyber',
        nordic_frost: 'Nordic Glacier',
        vintage_retro: '80s Synthwave',
        matrix_terminal: 'Matrix Terminal',
        obsidian_gold: 'Obsidian Royal Gold',
        light: 'Clean Porcelain',
        neon: 'Cyberpunk Glow',
        purple: 'Midnight Purple',
        emerald: 'Emerald Forest',
        sunset: 'Sunset Aura',
        ocean: 'Nordic Ocean',
        coffee: 'Mocha Latte',
        sakura: 'Sakura Bloom',
        glass: 'Frost Glassmorphism',
        dark: 'Dark Charcoal'
    };
    return names[theme] || 'Bordeaux Imperial';
}

// ==========================================================================
// Wallpaper Studio
// ==========================================================================
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
        burgundy: 'Bordeaux Velvet',
        nebula_wine: 'Wine Nebula Space',
        cyber_redstone3: 'Redstone 3 Cybernet',
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

    if (state.currentWallpaper === 'burgundy') {
        dom.bgWallpaper.style.backgroundImage = "url('images/burgundy.jpg')";
    } else if (state.currentWallpaper === 'nebula_wine') {
        dom.bgWallpaper.style.backgroundImage = "url('images/nebula_wine.jpg')";
    } else if (state.currentWallpaper === 'cyber_redstone3') {
        dom.bgWallpaper.style.backgroundImage = "url('images/cyber_redstone3.jpg')";
    } else if (state.currentWallpaper === 'cyber') {
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
        showToast('Власне зображення встановлено', '🖼️');
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
    showToast('Шпалери за URL встановлено', '🌐');
}

function resetWallpaper() {
    setWallpaper('burgundy');
    adjustWallpaperBlur(12);
    adjustWallpaperOverlay(60);
    const bSlider = document.getElementById('wp-blur-slider');
    const oSlider = document.getElementById('wp-opacity-slider');
    if (bSlider) bSlider.value = 12;
    if (oSlider) oSlider.value = 60;
    showToast('Фон скинуто до початкового', '🧹');
}

// ==========================================================================
// 2D Графік Функцій
// ==========================================================================
function plotFunction(funcName) {
    state.activeGraphFunc = funcName;
    audio.playAction();
    const canvas = document.getElementById('function-canvas');
    const label = document.getElementById('graph-current-func');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const names = {
        sin: 'y = sin(x)',
        cos: 'y = cos(x)',
        tan: 'y = tan(x)',
        sqr: 'y = x²',
        cube: 'y = x³',
        sqrt: 'y = √x',
        ln: 'y = ln(x)',
        inv: 'y = 1/x'
    };
    if (label) label.innerHTML = `Функція: <strong>${names[funcName] || funcName}</strong>`;

    // Сітка
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const cx = w / 2;
    const cy = h / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;

    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-operator') || '#8b1538';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const scaleX = 25;
    const scaleY = 25;
    let isDrawing = false;

    for (let px = 0; px < w; px++) {
        const x = (px - cx) / scaleX;
        let y;

        switch (funcName) {
            case 'sin': y = Math.sin(x); break;
            case 'cos': y = Math.cos(x); break;
            case 'tan': y = Math.tan(x); if (Math.abs(y) > 8) { isDrawing = false; continue; } break;
            case 'sqr': y = Math.pow(x, 2); break;
            case 'cube': y = Math.pow(x, 3); break;
            case 'sqrt': if (x < 0) { isDrawing = false; continue; } y = Math.sqrt(x); break;
            case 'ln': if (x <= 0) { isDrawing = false; continue; } y = Math.log(x); break;
            case 'inv': if (Math.abs(x) < 0.08) { isDrawing = false; continue; } y = 1 / x; break;
        }

        const py = cy - y * scaleY;
        if (py < 0 || py > h) {
            isDrawing = false;
            continue;
        }

        if (!isDrawing) {
            ctx.moveTo(px, py);
            isDrawing = true;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}

function resetGraphZoom() {
    plotFunction(state.activeGraphFunc);
}

// ==========================================================================
// Фінансовий Калькулятор
// ==========================================================================
function calculateFinance() {
    const amount = parseFloat(document.getElementById('fin-amount').value) || 0;
    const discount = parseFloat(document.getElementById('fin-discount').value) || 0;
    const tax = parseFloat(document.getElementById('fin-tax').value) || 0;
    const tip = parseFloat(document.getElementById('fin-tip').value) || 0;

    const discounted = amount - (amount * (discount / 100));
    const taxVal = discounted * (tax / 100);
    const tipVal = discounted * (tip / 100);
    const total = discounted + taxVal + tipVal;

    document.getElementById('fin-discounted-val').innerText = `${discounted.toFixed(2)} ₴`;
    document.getElementById('fin-tax-val').innerText = `+ ${taxVal.toFixed(2)} ₴`;
    document.getElementById('fin-tip-val').innerText = `+ ${tipVal.toFixed(2)} ₴`;
    document.getElementById('fin-total-val').innerText = `${total.toFixed(2)} ₴`;
}

function insertFinanceToCalc() {
    audio.playAction();
    const amount = parseFloat(document.getElementById('fin-amount').value) || 0;
    const discount = parseFloat(document.getElementById('fin-discount').value) || 0;
    const tax = parseFloat(document.getElementById('fin-tax').value) || 0;
    const tip = parseFloat(document.getElementById('fin-tip').value) || 0;
    const discounted = amount - (amount * (discount / 100));
    const total = (discounted + discounted * (tax / 100) + discounted * (tip / 100)).toFixed(2);

    state.currentInput = total.toString();
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('finance-modal');
    showToast(`Суму ${total} ₴ вставлено`, '💰');
}

function copyFinanceTotal() {
    const totalEl = document.getElementById('fin-total-val');
    if (totalEl) {
        audio.playAction();
        navigator.clipboard.writeText(totalEl.innerText);
        showToast(`Скопійовано: ${totalEl.innerText}`, '📋');
    }
}

// ==========================================================================
// RNG & Кубики
// ==========================================================================
function generateRandomNumber() {
    audio.playAction();
    const min = parseInt(document.getElementById('rng-min').value) || 1;
    const max = parseInt(document.getElementById('rng-max').value) || 100;
    if (min >= max) {
        showToast('Min має бути меншим за Max', '⚠️');
        return;
    }
    const res = Math.floor(Math.random() * (max - min + 1)) + min;
    const el = document.getElementById('rng-result');
    if (el) el.innerText = res;
    showToast(`Згенеровано: ${res}`, '🎲');
}

function rollDice(sides) {
    audio.playAction();
    const res = Math.floor(Math.random() * sides) + 1;
    const el = document.getElementById('rng-result');
    if (el) el.innerText = `d${sides}: ${res}`;
    showToast(`Кидок d${sides}: ${res}`, '🎲');
}

function flipCoin() {
    audio.playAction();
    const res = Math.random() < 0.5 ? '🪙 Орел' : '🪙 Решка';
    const el = document.getElementById('rng-result');
    if (el) el.innerText = res;
    showToast(`Результат: ${res}`, '🪙');
}

function insertRngToCalc() {
    audio.playAction();
    const el = document.getElementById('rng-result');
    if (el) {
        const num = el.innerText.replace(/[^\d]/g, '');
        if (num) {
            state.currentInput = num;
            state.shouldResetDisplay = true;
            updateDisplay();
            closeModal('rng-modal');
            showToast(`Значення ${num} вставлено`, '📥');
        }
    }
}

// ==========================================================================
// Універсальний Конвертер Величин
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
    catData.units.forEach((u) => {
        const o1 = document.createElement('option');
        o1.value = u;
        o1.innerText = catData.names[u];
        fromSel.appendChild(o1);

        const o2 = document.createElement('option');
        o2.value = u;
        o2.innerText = catData.names[u];
        toSel.appendChild(o2);
    });

    if (catData.units.length > 1) toSel.selectedIndex = 1;
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
// Програмістські Системи Числення
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
// Історія та Експорт
// ==========================================================================
function addToHistory(equation, result) {
    const item = {
        equation,
        result,
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    state.history.unshift(item);
    if (state.history.length > 100) state.history.pop();
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
            <div class="calc-res">${formatDisplayString(item.result)}</div>
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
    if (!q) { renderHistory(); return; }
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
            application: "Calculator Pro v1.8 (Build 179) Redstone 3 Bordeaux",
            exportedAt: new Date().toISOString(),
            author: "MaxNT Official, 2026",
            totalRecords: state.history.length,
            records: state.history
        }, null, 2);
    } else {
        content = `====================================================\n`;
        content += `  КАЛЬКУЛЯТОР PRO v1.8 (Build 179) Redstone 3 Bordeaux - ІСТОРІЯ\n`;
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
    a.download = `Calculator_History_v1.8_${dateStr}.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    closeModal('export-modal');
    showToast(`Історію експортовано у формат .${fileExt}`, '📥');
}

function copyToClipboard() {
    if (isNaN(parseFloat(state.currentInput))) return;
    audio.playAction();
    navigator.clipboard.writeText(state.currentInput).then(() => {
        showToast(`Скопійовано: ${state.currentInput}`, '📋');
        if (dom.display) {
            const originalColor = dom.display.style.color;
            dom.display.style.color = "var(--accent-operator)";
            setTimeout(() => { dom.display.style.color = originalColor; }, 500);
        }
    }).catch(() => {
        showToast('Не вдалося скопіювати', '❌');
    });
}

function showToast(message, icon = 'ℹ️') {
    if (!dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 2400);
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
        if (modalId === 'graph-modal') {
            setTimeout(() => plotFunction(state.activeGraphFunc), 50);
        }
        if (modalId === 'finance-modal') {
            calculateFinance();
        }
        if (modalId === 'quadratic-modal') {
            solveQuadraticEquation();
        }
        if (modalId === 'stats-modal') {
            calculateStatistics();
        }
        if (modalId === 'date-modal') {
            const today = new Date().toISOString().slice(0, 10);
            const dStart = document.getElementById('date-start');
            const dEnd = document.getElementById('date-end');
            const dBase = document.getElementById('date-base');
            if (dStart && !dStart.value) dStart.value = today;
            if (dEnd && !dEnd.value) dEnd.value = today;
            if (dBase && !dBase.value) dBase.value = today;
            calculateDateDiff();
            calculateDateAdd();
        }
        if (modalId === 'memory-modal') {
            updateMemorySlotsUI();
        }
        if (modalId === 'matrix-modal') {
            solveMatrixMath();
        }
        if (modalId === 'bitmask-modal') {
            updateBitmaskOutputs();
        }
        if (modalId === 'percent-modal') {
            calcPercent1();
            calcPercent2();
            calcPercent3();
        }
        if (modalId === 'currency-modal') {
            runCurrencyConversion('from');
        }
        if (modalId === 'settings-modal') {
            const vSlider = document.getElementById('setting-volume');
            const vVal = document.getElementById('setting-vol-val');
            const sProf = document.getElementById('setting-sound-profile');
            const sSep = document.getElementById('setting-separator');
            const sPrec = document.getElementById('setting-precision');
            const sAng = document.getElementById('setting-angle');
            const sGlass = document.getElementById('setting-glass');
            const sPart = document.getElementById('setting-particles');
            if (vSlider) vSlider.value = Math.round(state.soundVolume * 100);
            if (vVal) vVal.innerText = `${Math.round(state.soundVolume * 100)}%`;
            if (sProf) sProf.value = state.soundProfile;
            if (sSep) sSep.value = state.thousandSeparator;
            if (sPrec) sPrec.value = state.precisionMode;
            if (sAng) sAng.value = state.angleMode;
            if (sGlass) sGlass.value = state.glassIntensity;
            if (sPart) sPart.value = state.particlesEnabled ? 'on' : 'off';
        }
    }
}

function closeModal(modalId) {
    audio.playClick(450);
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

window.onclick = function (event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
};

// ==========================================================================
// Клавіатурна навігація
// ==========================================================================
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            return;
        }
        clearDisplay();
        return;
    }

    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
        triggerKeyEffect(event.key);
        return;
    }

    if (event.key === '.' || event.key === ',') {
        appendNumber('.');
        triggerKeyEffect('.');
        return;
    }

    if (event.key === '=' || event.key === 'Enter') {
        event.preventDefault();
        calculate();
        triggerKeyEffect('=');
        return;
    }

    if (event.key === 'Backspace') {
        backspace();
        triggerKeyEffect('⌫');
        return;
    }

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
    if (event.key === 'v' || event.key === 'V' || event.key === 'м' || event.key === 'М') {
        if (!event.ctrlKey && !event.metaKey) {
            speakCurrentResult();
            return;
        }
    }

    if ((event.ctrlKey || event.metaKey) && (event.key === 'v' || event.key === 'V')) {
        navigator.clipboard.readText().then(text => {
            const clean = text.trim().replace(',', '.').replace(/\s/g, '');
            if (!isNaN(parseFloat(clean))) {
                state.currentInput = clean;
                state.shouldResetDisplay = true;
                updateDisplay();
                showToast(`Вставлено: ${clean}`, '📋');
            }
        }).catch(() => {});
        return;
    }

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
// Ініціалізація (DOM Ready)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Тема
    if (state.currentTheme) {
        document.body.setAttribute('data-theme', state.currentTheme);
        document.querySelectorAll('.theme-card').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === state.currentTheme);
        });
    }

    // Шрифт
    if (state.currentFont) {
        document.body.className = document.body.className.replace(/\bfont-\w+\b/g, '');
        document.body.classList.add(state.currentFont);
        document.querySelectorAll('.font-card').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-font') === state.currentFont);
        });
        const fontNames = {
            'font-inter': 'Inter',
            'font-jetbrains': 'JetBrains Mono',
            'font-orbitron': 'Orbitron Digital',
            'font-rajdhani': 'Rajdhani Mecha',
            'font-spacegrotesk': 'Space Grotesk',
            'font-silkscreen': 'Silkscreen 8-Bit',
            'font-outfit': 'Outfit Geometric',
            'font-firacode': 'Fira Code'
        };
        if (dom.currentFontChip) dom.currentFontChip.innerText = fontNames[state.currentFont] || 'Inter';
    }

    // Застосування шпалер
    applyWallpaperToDom();

    // Слайдери
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
    updateMemorySlotsUI();

    // Запуск фонових частинок Canvas
    if (state.particlesEnabled) {
        initParticlesCanvas();
    }

    console.log('%c 🍷 Calculator Pro v1.8 (Build 179) Redstone 3 Bordeaux Edition Loaded Successfully %c', 
        'background: linear-gradient(90deg, #8b1538, #f59e0b); color: #fff; font-weight: bold; font-size: 13px; padding: 6px 14px; border-radius: 8px;', 
        '');
});
