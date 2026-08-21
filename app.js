/**
 * ==========================================================================
 * Calculator Pro v1.8.6 (Build 204) Redstone 4.0 Bordeaux Titanium Ultra
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
    fontScale: parseInt(localStorage.getItem('calc_font_scale') || '100'), // 85..150 (%)
    currentWallpaper: localStorage.getItem('calc_wallpaper') || 'burgundy',
    wallpaperBlur: parseInt(localStorage.getItem('calc_wp_blur') || '12'),
    wallpaperOverlay: parseInt(localStorage.getItem('calc_wp_overlay') || '60'),
    customWallpaperUrl: localStorage.getItem('calc_custom_wp') || '',
    particlesEnabled: localStorage.getItem('calc_particles') !== 'off',
    particleSpeedMode: localStorage.getItem('calc_part_mode') || 'standard', // 'standard', 'aurora', 'starlight', 'warp'
    history: JSON.parse(localStorage.getItem('calc_history') || '[]'),
    tapeEntries: JSON.parse(localStorage.getItem('calc_tape') || '[]'),
    bookmarks: JSON.parse(localStorage.getItem('calc_bookmarks') || '[{"id":1,"title":"Швидкість світла c","val":"299792458","tag":"Фізика"},{"id":2,"title":"Золотий перетин φ","val":"1.618033988","tag":"Геометрія"}]'),
    operationsCount: 0,
    sessionSeconds: 0,
    bracketDepth: 0,
    precisionMode: localStorage.getItem('calc_precision') || 'auto', // 'auto', '0', '2', '4', '6', '8', '10', '12'
    thousandSeparator: localStorage.getItem('calc_separator') || 'space', // 'space', 'comma', 'none'
    glassIntensity: localStorage.getItem('calc_glass') || 'heavy',
    activeGraphFunc: 'sin',
    activeDateTab: 'diff',
    activeTriangleMode: 'sss', // 'sss', 'sas', 'asa'
    activeConstantsCat: 'all',
    activeMathRefTab: 'trig',
    trigAngleDeg: 45,
    vectorResults: { dot: '26.00', cross: '(-18, 2, 5)', lenU: '7.000', lenV: '4.583', angle: '35.8° (0.62 rad)', dist: '4.243' },
    complexResults: { add: '4 + 6i', sub: '2 + 2i', mul: '-5 + 10i', div: '2.2 - 0.4i', mod1: '5.000', arg1: '53.13° (0.93 rad)' },
    triangleResults: { area: '14.697', perim: '18.00' },
    loanResults: { monthly: '17205.12', total: '619384.32' },
    matrixSize: 2,
    matrixDetVal: '10',
    bitmaskValue: 42,
    quadRoots: { x1: '3', x2: '2' },
    statMeanVal: '0',
    gcdVal: '12',
    lcmVal: '720',
    funcSingleRes: '16',
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

// База 40+ фундаментальних наукових та математичних констант
const EXTENDED_CONSTANTS = [
    // 1. Фундаментальні
    { sym: 'c', name: 'Швидкість світла у вакуумі', val: '299792458', unit: 'м/с', cat: 'fundamental' },
    { sym: 'G', name: 'Гравітаційна стала Ньютона', val: '6.67430e-11', unit: 'м³/(кг·с²)', cat: 'fundamental' },
    { sym: 'h', name: 'Стала Планка', val: '6.62607015e-34', unit: 'Дж·с', cat: 'fundamental' },
    { sym: 'ħ', name: 'Зведена стала Планка (h/2π)', val: '1.054571817e-34', unit: 'Дж·с', cat: 'fundamental' },
    { sym: 'k_B', name: 'Стала Больцмана', val: '1.380649e-23', unit: 'Дж/К', cat: 'fundamental' },
    { sym: 'N_A', name: 'Число Авогадро', val: '6.02214076e23', unit: 'моль⁻¹', cat: 'fundamental' },
    { sym: 'R', name: 'Універсальна газова стала', val: '8.314462618', unit: 'Дж/(моль·К)', cat: 'fundamental' },
    { sym: 'σ', name: 'Стала Стефана-Больцмана', val: '5.670374419e-8', unit: 'Вт/(м²·К⁴)', cat: 'fundamental' },

    // 2. Електромагнетизм
    { sym: 'e', name: 'Елементарний електричний заряд', val: '1.602176634e-19', unit: 'Кл', cat: 'em' },
    { sym: 'ε₀', name: 'Електрична стала (діелектрична)', val: '8.8541878128e-12', unit: 'Ф/м', cat: 'em' },
    { sym: 'μ₀', name: 'Магнітна стала (проникність)', val: '1.25663706212e-6', unit: 'Гн/м', cat: 'em' },
    { sym: 'α', name: 'Стала тонкої структури', val: '0.0072973525693', unit: '—', cat: 'em' },
    { sym: 'F', name: 'Стала Фарадея', val: '96485.33212', unit: 'Кл/моль', cat: 'em' },
    { sym: 'Z₀', name: 'Хвильовий опір вакууму', val: '376.730313668', unit: 'Ом', cat: 'em' },

    // 3. Атом & Кванти
    { sym: 'm_e', name: 'Маса спокою електрона', val: '9.1093837015e-31', unit: 'кг', cat: 'atomic' },
    { sym: 'm_p', name: 'Маса спокою протона', val: '1.67262192369e-27', unit: 'кг', cat: 'atomic' },
    { sym: 'm_n', name: 'Маса спокою нейтрона', val: '1.67492749804e-27', unit: 'кг', cat: 'atomic' },
    { sym: 'u', name: 'Атомна одиниця маси (а.о.м.)', val: '1.66053906660e-27', unit: 'кг', cat: 'atomic' },
    { sym: 'R_∞', name: 'Стала Рідберга', val: '10973731.568160', unit: 'м⁻¹', cat: 'atomic' },
    { sym: 'a₀', name: 'Боровський радіус', val: '5.29177210903e-11', unit: 'м', cat: 'atomic' },
    { sym: 'μ_B', name: 'Магнетон Бора', val: '9.2740100783e-24', unit: 'Дж/Тл', cat: 'atomic' },
    { sym: 'μ_N', name: 'Ядерний магнетон', val: '5.0507837461e-27', unit: 'Дж/Тл', cat: 'atomic' },

    // 4. Астрофізика & Гео
    { sym: 'g', name: 'Стандартне прискорення вільного падіння', val: '9.80665', unit: 'м/с²', cat: 'astro' },
    { sym: 'M_⊕', name: 'Маса планети Земля', val: '5.9722e24', unit: 'кг', cat: 'astro' },
    { sym: 'R_⊕', name: 'Середній радіус Землі', val: '6371000', unit: 'м', cat: 'astro' },
    { sym: 'M_☉', name: 'Маса Сонця', val: '1.98847e30', unit: 'кг', cat: 'astro' },
    { sym: 'R_☉', name: 'Радіус Сонця', val: '6.957e8', unit: 'м', cat: 'astro' },
    { sym: 'AU', name: 'Астрономічна одиниця', val: '149597870700', unit: 'м', cat: 'astro' },
    { sym: 'ly', name: 'Світловий рік', val: '9.4607304725808e15', unit: 'м', cat: 'astro' },
    { sym: 'pc', name: 'Парсек', val: '3.08567758149137e16', unit: 'м', cat: 'astro' },
    { sym: 'atm', name: 'Стандартний атмосферний тиск', val: '101325', unit: 'Па', cat: 'astro' },

    // 5. Математичні
    { sym: 'π', name: 'Число Пі (Архімеда)', val: '3.141592653589793', unit: '—', cat: 'math' },
    { sym: 'e', name: 'Число Ейлера (основа ln)', val: '2.718281828459045', unit: '—', cat: 'math' },
    { sym: 'φ', name: 'Золотий перетин (Фібоначчі)', val: '1.618033988749895', unit: '—', cat: 'math' },
    { sym: '√2', name: 'Головна діагональ (Піфагор)', val: '1.414213562373095', unit: '—', cat: 'math' },
    { sym: '√3', name: 'Кубічна просторова діагональ', val: '1.732050807568877', unit: '—', cat: 'math' },
    { sym: 'ln(2)', name: 'Натуральний логарифм двійки', val: '0.693147180559945', unit: '—', cat: 'math' },
    { sym: 'ln(10)', name: 'Модуль десяткового переходу', val: '2.302585092994046', unit: '—', cat: 'math' },
    { sym: 'γ', name: 'Стала Ейлера-Маскероні', val: '0.577215664901532', unit: '—', cat: 'math' }
];

// Інтерактивна база формул математичного довідника
const MATH_REFERENCE_DATA = {
    trig: [
        { title: 'Основна тригонометрична тотожність', formula: 'sin²(x) + cos²(x) = 1' },
        { title: 'Означення тангенса', formula: 'tan(x) = sin(x) / cos(x)' },
        { title: 'Означення котангенса', formula: 'cot(x) = cos(x) / sin(x) = 1 / tan(x)' },
        { title: 'Зв\'язок тангенса та косинуса', formula: '1 + tan²(x) = 1 / cos²(x)' },
        { title: 'Синус подвійного кута', formula: 'sin(2x) = 2 · sin(x) · cos(x)' },
        { title: 'Косинус подвійного кута', formula: 'cos(2x) = cos²(x) - sin²(x) = 2cos²(x) - 1' },
        { title: 'Тангенс подвійного кута', formula: 'tan(2x) = 2tan(x) / (1 - tan²(x))' },
        { title: 'Синус суми кутів', formula: 'sin(α ± β) = sin(α)cos(β) ± cos(α)sin(β)' },
        { title: 'Косинус суми кутів', formula: 'cos(α ± β) = cos(α)cos(β) ∓ sin(α)sin(β)' },
        { title: 'Формула Ейлера', formula: 'e^(i·x) = cos(x) + i · sin(x)' }
    ],
    algebra: [
        { title: 'Квадрат суми', formula: '(a + b)² = a² + 2ab + b²' },
        { title: 'Квадрат різниці', formula: '(a - b)² = a² - 2ab + b²' },
        { title: 'Різниця квадратів', formula: 'a² - b² = (a - b)(a + b)' },
        { title: 'Куб суми', formula: '(a + b)³ = a³ + 3a²b + 3ab² + b³' },
        { title: 'Сума кубів', formula: 'a³ + b³ = (a + b)(a² - ab + b²)' },
        { title: 'Різниця кубів', formula: 'a³ - b³ = (a - b)(a² + ab + b²)' },
        { title: 'Добуток степенів', formula: 'aⁿ · aᵐ = a^(n + m)' },
        { title: 'Частка степенів', formula: 'aⁿ / aᵐ = a^(n - m)' },
        { title: 'Логарифм добутку', formula: 'log_a(x · y) = log_a(x) + log_a(y)' },
        { title: 'Логарифм степеня', formula: 'log_a(x^k) = k · log_a(x)' }
    ],
    calculus: [
        { title: 'Похідна степеневої функції', formula: '(xⁿ)\' = n · x^(n - 1)' },
        { title: 'Похідна синуса', formula: '(sin x)\' = cos x' },
        { title: 'Похідна косинуса', formula: '(cos x)\' = -sin x' },
        { title: 'Похідна тангенса', formula: '(tan x)\' = 1 / cos²(x)' },
        { title: 'Похідна експоненти eˣ', formula: '(eˣ)\' = eˣ' },
        { title: 'Похідна ln(x)', formula: '(ln x)\' = 1 / x' },
        { title: 'Похідна добутку (u · v)', formula: '(u · v)\' = u\'v + uv\'' },
        { title: 'Похідна частки (u / v)', formula: '(u / v)\' = (u\'v - uv\') / v²' },
        { title: 'Перша чудова границя', formula: 'lim(x→0) [sin(x) / x] = 1' },
        { title: 'Друга чудова границя (e)', formula: 'lim(n→∞) (1 + 1/n)ⁿ = e ≈ 2.71828' }
    ],
    geometry: [
        { title: 'Теорема Піфагора', formula: 'c² = a² + b² (c = √(a² + b²))' },
        { title: 'Площа круга', formula: 'S = π · r²' },
        { title: 'Довжина кола', formula: 'C = 2 · π · r = π · d' },
        { title: 'Площа трикутника (Герон)', formula: 'S = √(p(p - a)(p - b)(p - c)), p = P/2' },
        { title: 'Теорема косинусів', formula: 'c² = a² + b² - 2ab · cos(γ)' },
        { title: 'Теорема синусів', formula: 'a / sin(α) = b / sin(β) = c / sin(γ) = 2R' },
        { title: 'Об\'єм кулі (сфери)', formula: 'V = (4/3) · π · r³' },
        { title: 'Площа поверхні сфери', formula: 'S = 4 · π · r²' },
        { title: 'Об\'єм циліндра', formula: 'V = π · r² · h' },
        { title: 'Об\'єм конуса', formula: 'V = (1/3) · π · r² · h' }
    ]
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
            try { navigator.vibrate(ms); } catch (e) { }
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
        } catch (e) { }
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
        } catch (e) { }
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
        } catch (e) { }
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
// Повноекранний Режим (Fullscreen Toggle)
// ==========================================================================
function toggleFullScreen() {
    audio.playAction();
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            showToast('Повноекранний режим активовано (Esc для виходу)', '⛶');
        }).catch(() => {
            showToast('Повноекранний режим не підтримується браузером', '⚠️');
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            showToast('Вихід з повноекранного режиму', '🪟');
        }
    }
}

// ==========================================================================
// Динамічний Canvas з Інтерактивними Частинками (Particle Dynamics)
// ==========================================================================
let particles = [];
let animFrameId = null;
let mousePos = { x: -1000, y: -1000, active: false };

window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    mousePos.active = true;
});

window.addEventListener('mouseleave', () => {
    mousePos.active = false;
});

function initParticlesCanvas() {
    const canvas = dom.bgParticlesCanvas;
    if (!canvas || !state.particlesEnabled) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 26000);

    let speedMult = 1.0;
    if (state.particleSpeedMode === 'aurora') speedMult = 0.5;
    if (state.particleSpeedMode === 'starlight') speedMult = 0.8;
    if (state.particleSpeedMode === 'warp') speedMult = 2.4;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5 * speedMult,
            vy: (Math.random() - 0.5) * 0.5 * speedMult,
            radius: Math.random() * 2.2 + 1,
            color: Math.random() > 0.4 ? 'rgba(192, 38, 211, ' : (Math.random() > 0.5 ? 'rgba(245, 158, 11, ' : 'rgba(255, 0, 85, ')
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

            // Інтерактивне тяжіння до миші
            if (mousePos.active) {
                const dx = mousePos.x - p.x;
                const dy = mousePos.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140 && dist > 10) {
                    p.x += (dx / dist) * 0.6;
                    p.y += (dy / dist) * 0.6;
                }
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '0.75)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 115) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(192, 38, 211, ${0.35 * (1 - dist / 115)})`;
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

function setParticleSpeedMode(mode) {
    state.particleSpeedMode = mode;
    localStorage.setItem('calc_part_mode', mode);
    document.querySelectorAll('.particle-preset-btn').forEach(b => {
        b.classList.toggle('active', b.id === `part-btn-${mode}`);
    });
    initParticlesCanvas();
    const names = { standard: 'Стандарт (Calm)', aurora: 'Aurora Flow', starlight: 'Starlight', warp: 'Warp Speed' };
    showToast(`Динаміка частинок: ${names[mode]}`, '✨');
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
// Хвильова Ripple-Анімація при кліках на кнопки
// ==========================================================================
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.buttons button, .footer-btn, .conv-tab, .sidebar-nav button');
    if (!btn) return;

    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('btn-ripple-wave');

    const ripple = btn.getElementsByClassName('btn-ripple-wave')[0];
    if (ripple) ripple.remove();

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 550);
});

// ==========================================================================
// 1. НОВЕ v1.8.4: Інтерактивне Тригонометричне Коло (Unit Circle Visualizer)
// ==========================================================================
function updateTrigCircle(angleVal) {
    state.trigAngleDeg = parseFloat(angleVal) || 0;
    const slider = document.getElementById('trig-angle-slider');
    if (slider) slider.value = state.trigAngleDeg;

    const rad = state.trigAngleDeg * (Math.PI / 180);
    const sinVal = Math.sin(rad);
    const cosVal = Math.cos(rad);
    const tanVal = Math.abs(cosVal) > 0.0001 ? sinVal / cosVal : (sinVal > 0 ? Infinity : -Infinity);

    // Оновлення текстових міток
    const angleLabel = document.getElementById('trig-angle-val');
    const sinEl = document.getElementById('trig-res-sin');
    const cosEl = document.getElementById('trig-res-cos');
    const tanEl = document.getElementById('trig-res-tan');
    const quadEl = document.getElementById('trig-res-quad');

    const piFraction = (state.trigAngleDeg / 180).toFixed(2);
    if (angleLabel) angleLabel.innerText = `${state.trigAngleDeg}° (${piFraction}π rad)`;
    if (sinEl) sinEl.innerText = sinVal.toFixed(4);
    if (cosEl) cosEl.innerText = cosVal.toFixed(4);
    if (tanEl) tanEl.innerText = isFinite(tanVal) ? tanVal.toFixed(4) : '±∞ (розрив)';

    let quadText = 'I Чверть (+, +)';
    if (state.trigAngleDeg > 90 && state.trigAngleDeg <= 180) quadText = 'II Чверть (−, +)';
    else if (state.trigAngleDeg > 180 && state.trigAngleDeg <= 270) quadText = 'III Чверть (−, −)';
    else if (state.trigAngleDeg > 270 && state.trigAngleDeg <= 360) quadText = 'IV Чверть (+, −)';
    if (quadEl) quadEl.innerText = quadText;

    drawTrigUnitCircleCanvas(state.trigAngleDeg, sinVal, cosVal);
}

function setTrigAngle(deg) {
    audio.playAction();
    updateTrigCircle(deg);
}

function drawTrigUnitCircleCanvas(deg, sinVal, cosVal) {
    const canvas = document.getElementById('trig-unit-circle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = 95; // Радіус кола

    ctx.clearRect(0, 0, w, h);

    // 1. Сітка та осі
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();

    // 2. Одиничне коло
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Точка на колі
    const px = cx + cosVal * r;
    const py = cy - sinVal * r; // Інверсія Y у Canvas

    // 4. Проекція Косинуса (на осі X)
    ctx.strokeStyle = '#f59e0b'; // Gold
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    // 5. Проекція Синуса (вертикаль)
    ctx.strokeStyle = '#c026d3'; // Magenta
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // 6. Радіус-вектор гіпотенузи
    ctx.strokeStyle = '#38bdf8'; // Cyan
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // 7. Сектор кута
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 26, 0, -deg * (Math.PI / 180), true);
    ctx.closePath();
    ctx.fill();

    // 8. Маркер точки на колі
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(px, py, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Підписи осей
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('1', cx + r + 2, cy - 4);
    ctx.fillText('-1', cx - r - 12, cy - 4);
    ctx.fillText('1 (sin)', cx + 4, cy - r - 4);
    ctx.fillText('(cos)', w - 28, cy - 4);
}

function insertTrigSinToCalc() {
    audio.playAction();
    const rad = state.trigAngleDeg * (Math.PI / 180);
    const val = formatResult(Math.sin(rad));
    state.currentInput = val;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('trig-circle-modal');
    showToast(`sin(${state.trigAngleDeg}°) = ${val} вставлено`, '⭕');
}

function insertTrigCosToCalc() {
    audio.playAction();
    const rad = state.trigAngleDeg * (Math.PI / 180);
    const val = formatResult(Math.cos(rad));
    state.currentInput = val;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('trig-circle-modal');
    showToast(`cos(${state.trigAngleDeg}°) = ${val} вставлено`, '⭕');
}

// ==========================================================================
// 2. НОВЕ v1.8.4: Розширена База Наукових Констант (40+)
// ==========================================================================
function renderExtendedConstants(filterText = '', category = state.activeConstantsCat) {
    const list = document.getElementById('constants-extended-list');
    if (!list) return;

    const q = filterText.trim().toLowerCase();
    const items = EXTENDED_CONSTANTS.filter(c => {
        const matchesCat = category === 'all' || c.cat === category;
        const matchesQ = !q || c.name.toLowerCase().includes(q) || c.sym.toLowerCase().includes(q) || c.val.includes(q);
        return matchesCat && matchesQ;
    });

    if (items.length === 0) {
        list.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:var(--text-muted); padding:20px;">Констант не знайдено за вашим запитом.</div>';
        return;
    }

    list.innerHTML = '';
    items.forEach(c => {
        const card = document.createElement('div');
        card.className = 'const-ext-card';
        card.innerHTML = `
            <div class="const-ext-sym">${c.sym}</div>
            <div class="const-ext-info">
                <strong>${c.name}</strong>
                <span>${c.val} ${c.unit !== '—' ? c.unit : ''}</span>
            </div>
            <button class="btn-secondary" style="padding:4px 8px; font-size:0.75rem;" title="Вставити в калькулятор">📥</button>
        `;
        card.onclick = () => {
            insertExtConstant(c.val, c.sym);
        };
        list.appendChild(card);
    });
}

function filterExtendedConstants(val) {
    renderExtendedConstants(val, state.activeConstantsCat);
}

function switchConstantsCategory(cat) {
    state.activeConstantsCat = cat;
    document.querySelectorAll('.constants-tabs-row .conv-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-ccat') === cat);
    });
    const inp = document.getElementById('const-search-inp');
    renderExtendedConstants(inp ? inp.value : '', cat);
}

function insertExtConstant(val, sym) {
    audio.playAction();
    state.currentInput = val;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('constants-search-modal');
    showToast(`Константу ${sym} (${val}) вставлено`, '⚛️');
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
            dom.display.style.fontSize = '2.1rem';
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

    // Перевірка на багатосимвольні математичні токени
    const mathTokens = [
        'asin(', 'acos(', 'atan(', 'asinh(', 'acosh(', 'atanh(',
        'sinh(', 'cosh(', 'tanh(', 'sin(', 'cos(', 'tan(',
        'log10(', 'log2(', 'log(', 'ln(', 'sqrt(', 'cbrt(',
        '10^(', 'e^(', 'abs('
    ];
    for (const token of mathTokens) {
        if (state.currentInput.endsWith(token)) {
            state.currentInput = state.currentInput.slice(0, -token.length);
            if (state.currentInput === '') state.currentInput = '0';
            updateDisplay();
            return;
        }
    }

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
        addTapeEntry(`${func}(${current}${unit})`, formatted, 'Тригонометрія');
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
            addTapeEntry(`asin(${current})`, `${formatted}${unit}`, 'Арксинус');
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
            addTapeEntry(`acos(${current})`, `${formatted}${unit}`, 'Арккосинус');
            state.currentInput = formatted;
        } else if (func === 'tan') {
            let rad = Math.atan(current);
            result = radiansToAngle(rad);
            let formatted = formatResult(result);
            addToHistory(`atan(${current})`, `${formatted}${unit}`);
            addTapeEntry(`atan(${current})`, `${formatted}${unit}`, 'Арктангенс');
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
// Фізико-Математичний Формулатор
// ==========================================================================
function solvePhysicsFormula(type) {
    if (type === 'ek') {
        const m = parseFloat(document.getElementById('f-ek-m').value) || 0;
        const v = parseFloat(document.getElementById('f-ek-v').value) || 0;
        const ek = 0.5 * m * (v * v);
        const el = document.getElementById('f-ek-res');
        if (el) el.innerText = `${formatResult(ek)} Дж`;
    } else if (type === 'ohm') {
        const u = parseFloat(document.getElementById('f-ohm-u').value) || 0;
        const r = parseFloat(document.getElementById('f-ohm-r').value) || 1;
        const i = r !== 0 ? u / r : 0;
        const p = u * i;
        const el = document.getElementById('f-ohm-res');
        if (el) el.innerText = `${formatResult(i)} А (${formatResult(p)} Вт)`;
    } else if (type === 'fall') {
        const t = parseFloat(document.getElementById('f-fall-t').value) || 0;
        const g = parseFloat(document.getElementById('f-fall-g').value) || 9.806;
        const h = 0.5 * g * (t * t);
        const v = g * t;
        const el = document.getElementById('f-fall-res');
        if (el) el.innerText = `${formatResult(h)} м (${formatResult(v)} м/с)`;
    } else if (type === 'rho') {
        const m = parseFloat(document.getElementById('f-rho-m').value) || 0;
        const v = parseFloat(document.getElementById('f-rho-v').value) || 1;
        const rho = v !== 0 ? m / v : 0;
        const el = document.getElementById('f-rho-res');
        if (el) el.innerText = `${formatResult(rho)} кг/м³`;
    } else if (type === 'grav') {
        const m1 = parseFloat(document.getElementById('f-grav-m1').value) || 0;
        const m2 = parseFloat(document.getElementById('f-grav-m2').value) || 0;
        const G = 6.6743e-11;
        const r = 6371000;
        const f = (G * m1 * m2) / (r * r);
        const el = document.getElementById('f-grav-res');
        if (el) el.innerText = `${formatResult(f)} Н`;
    } else if (type === 'gas') {
        const n = parseFloat(document.getElementById('f-gas-n').value) || 1;
        const t = parseFloat(document.getElementById('f-gas-t').value) || 293.15;
        const R = 8.314;
        const V = 0.0224;
        const p = (n * R * t) / V;
        const el = document.getElementById('f-gas-res');
        if (el) el.innerText = `${formatResult(p)} Па`;
    }
}

function insertFormulaValToCalc(resId) {
    audio.playAction();
    const el = document.getElementById(resId);
    if (el) {
        const raw = el.innerText.split(' ')[0].replace(/[^\d.-]/g, '');
        if (raw) {
            state.currentInput = raw;
            state.shouldResetDisplay = true;
            updateDisplay();
            closeModal('formula-solver-modal');
            showToast(`Значення ${raw} вставлено`, '⚡');
        }
    }
}

// ==========================================================================
// Геометричний Розв'язувач Трикутників
// ==========================================================================
function switchTriangleMode(mode) {
    state.activeTriangleMode = mode;
    document.querySelectorAll('[data-ttab]').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-ttab') === mode);
    });

    const l1 = document.getElementById('tri-lbl-1');
    const l2 = document.getElementById('tri-lbl-2');
    const l3 = document.getElementById('tri-lbl-3');
    const i1 = document.getElementById('tri-val-1');
    const i2 = document.getElementById('tri-val-2');
    const i3 = document.getElementById('tri-val-3');

    if (mode === 'sss') {
        if (l1) l1.innerText = 'Сторона a:';
        if (l2) l2.innerText = 'Сторона b:';
        if (l3) l3.innerText = 'Сторона c:';
        if (i1) i1.value = '5';
        if (i2) i2.value = '6';
        if (i3) i3.value = '7';
    } else if (mode === 'sas') {
        if (l1) l1.innerText = 'Сторона a:';
        if (l2) l2.innerText = 'Сторона b:';
        if (l3) l3.innerText = 'Кут γ між ними (градуси):';
        if (i1) i1.value = '5';
        if (i2) i2.value = '6';
        if (i3) i3.value = '60';
    } else if (mode === 'asa') {
        if (l1) l1.innerText = 'Сторона a:';
        if (l2) l2.innerText = 'Кут β (градуси):';
        if (l3) l3.innerText = 'Кут γ (градуси):';
        if (i1) i1.value = '6';
        if (i2) i2.value = '50';
        if (i3) i3.value = '70';
    }
    solveTriangleGeometry();
}

function solveTriangleGeometry() {
    let v1 = parseFloat(document.getElementById('tri-val-1').value) || 0;
    let v2 = parseFloat(document.getElementById('tri-val-2').value) || 0;
    let v3 = parseFloat(document.getElementById('tri-val-3').value) || 0;

    let a = 0, b = 0, c = 0;
    let alpha = 0, beta = 0, gamma = 0;

    const areaEl = document.getElementById('tri-res-area');
    const perimEl = document.getElementById('tri-res-perim');
    const anglesEl = document.getElementById('tri-res-angles');
    const radiiEl = document.getElementById('tri-res-radii');
    const badgeEl = document.getElementById('tri-type-badge');

    if (state.activeTriangleMode === 'sss') {
        a = v1; b = v2; c = v3;
        if (a + b <= c || a + c <= b || b + c <= a || a <= 0 || b <= 0 || c <= 0) {
            if (badgeEl) badgeEl.innerText = 'Трикутник з такими сторонами не існує!';
            if (areaEl) areaEl.innerText = '—';
            if (perimEl) perimEl.innerText = '—';
            return;
        }
        const cosA = (b * b + c * c - a * a) / (2 * b * c);
        const cosB = (a * a + c * c - b * b) / (2 * a * c);
        const cosC = (a * a + b * b - c * c) / (2 * a * b);
        alpha = Math.acos(Math.max(-1, Math.min(1, cosA))) * (180 / Math.PI);
        beta = Math.acos(Math.max(-1, Math.min(1, cosB))) * (180 / Math.PI);
        gamma = Math.acos(Math.max(-1, Math.min(1, cosC))) * (180 / Math.PI);
    } else if (state.activeTriangleMode === 'sas') {
        a = v1; b = v2; gamma = v3;
        if (gamma <= 0 || gamma >= 180 || a <= 0 || b <= 0) {
            if (badgeEl) badgeEl.innerText = 'Некоректний кут або сторони';
            return;
        }
        const radG = gamma * (Math.PI / 180);
        c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(radG));
        const cosA = (b * b + c * c - a * a) / (2 * b * c);
        alpha = Math.acos(Math.max(-1, Math.min(1, cosA))) * (180 / Math.PI);
        beta = 180 - alpha - gamma;
    } else if (state.activeTriangleMode === 'asa') {
        a = v1; beta = v2; gamma = v3;
        alpha = 180 - beta - gamma;
        if (alpha <= 0 || beta <= 0 || gamma <= 0 || a <= 0) {
            if (badgeEl) badgeEl.innerText = 'Сума кутів перевищує 180°';
            return;
        }
        const radA = alpha * (Math.PI / 180);
        const radB = beta * (Math.PI / 180);
        const radG = gamma * (Math.PI / 180);
        b = a * (Math.sin(radB) / Math.sin(radA));
        c = a * (Math.sin(radG) / Math.sin(radA));
    }

    const perim = a + b + c;
    const s = perim / 2;
    const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
    const rIn = area > 0 ? area / s : 0;
    const rOut = area > 0 ? (a * b * c) / (4 * area) : 0;

    state.triangleResults.area = formatResult(area);
    state.triangleResults.perim = formatResult(perim);

    if (areaEl) areaEl.innerText = state.triangleResults.area;
    if (perimEl) perimEl.innerText = state.triangleResults.perim;
    if (anglesEl) anglesEl.innerText = `${alpha.toFixed(1)}° / ${beta.toFixed(1)}° / ${gamma.toFixed(1)}°`;
    if (radiiEl) radiiEl.innerText = `r = ${rIn.toFixed(2)} | R = ${rOut.toFixed(2)}`;

    let typeStr = '';
    if (Math.abs(a - b) < 0.01 && Math.abs(b - c) < 0.01) typeStr = 'Рівносторонній';
    else if (Math.abs(a - b) < 0.01 || Math.abs(b - c) < 0.01 || Math.abs(a - c) < 0.01) typeStr = 'Рівнобедрений';
    else typeStr = 'Різносторонній';

    const maxAngle = Math.max(alpha, beta, gamma);
    if (Math.abs(maxAngle - 90) < 0.1) typeStr += ', Прямокутний';
    else if (maxAngle > 90) typeStr += ', Тупокутний';
    else typeStr += ', Гострокутний';

    if (badgeEl) badgeEl.innerText = typeStr;
}

function insertTriangleAreaToCalc() {
    audio.playAction();
    state.currentInput = state.triangleResults.area;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('triangle-solver-modal');
    showToast(`Площу S = ${state.triangleResults.area} вставлено`, '📐');
}

function insertTrianglePerimToCalc() {
    audio.playAction();
    state.currentInput = state.triangleResults.perim;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('triangle-solver-modal');
    showToast(`Периметр P = ${state.triangleResults.perim} вставлено`, '📐');
}

// ==========================================================================
// Іпотечний та Кредитний Калькулятор
// ==========================================================================
function calculateLoanAmortization() {
    const P = parseFloat(document.getElementById('loan-amount').value) || 0;
    const annualRate = parseFloat(document.getElementById('loan-rate').value) || 0;
    const n = parseInt(document.getElementById('loan-term').value, 10) || 1;
    const type = document.getElementById('loan-type').value;

    const monthlyEl = document.getElementById('loan-monthly-val');
    const interestEl = document.getElementById('loan-interest-val');
    const totalEl = document.getElementById('loan-total-val');
    const pctEl = document.getElementById('loan-pct-val');
    const tbody = document.getElementById('loan-table-tbody');

    if (P <= 0 || n <= 0) return;

    const r = annualRate / 100 / 12;
    let monthlyPay = 0;
    let totalPaid = 0;
    let totalInterest = 0;

    if (tbody) tbody.innerHTML = '';

    if (type === 'annuity') {
        if (r > 0) {
            monthlyPay = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        } else {
            monthlyPay = P / n;
        }
        totalPaid = monthlyPay * n;
        totalInterest = totalPaid - P;

        let balance = P;
        const previewLimit = Math.min(n, 24);
        for (let m = 1; m <= previewLimit; m++) {
            const interest = balance * r;
            const principal = monthlyPay - interest;
            balance = Math.max(0, balance - principal);

            if (tbody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="text-align:center;">${m}</td>
                    <td>${monthlyPay.toFixed(2)}</td>
                    <td>${principal.toFixed(2)}</td>
                    <td>${interest.toFixed(2)}</td>
                    <td>${balance.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            }
        }
    } else {
        const principalFixed = P / n;
        let balance = P;
        let firstMonthPay = 0;

        for (let m = 1; m <= n; m++) {
            const interest = balance * r;
            const pay = principalFixed + interest;
            if (m === 1) firstMonthPay = pay;
            totalPaid += pay;
            balance = Math.max(0, balance - principalFixed);

            if (tbody && m <= 24) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="text-align:center;">${m}</td>
                    <td>${pay.toFixed(2)}</td>
                    <td>${principalFixed.toFixed(2)}</td>
                    <td>${interest.toFixed(2)}</td>
                    <td>${balance.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            }
        }
        totalInterest = totalPaid - P;
        monthlyPay = firstMonthPay;
    }

    state.loanResults.monthly = monthlyPay.toFixed(2);
    state.loanResults.total = totalPaid.toFixed(2);

    if (monthlyEl) monthlyEl.innerText = `${monthlyPay.toFixed(2)} ₴${type === 'diff' ? ' (1-й міс.)' : ''}`;
    if (interestEl) interestEl.innerText = `${totalInterest.toFixed(2)} ₴`;
    if (totalEl) totalEl.innerText = `${totalPaid.toFixed(2)} ₴`;
    if (pctEl) pctEl.innerText = `+${((totalInterest / P) * 100).toFixed(2)}%`;
}

function insertLoanMonthlyToCalc() {
    audio.playAction();
    state.currentInput = state.loanResults.monthly;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('loan-calc-modal');
    showToast(`Платіж ${state.loanResults.monthly} ₴ вставлено`, '🏦');
}

function insertLoanTotalToCalc() {
    audio.playAction();
    state.currentInput = state.loanResults.total;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('loan-calc-modal');
    showToast(`Загальну вартість ${state.loanResults.total} ₴ вставлено`, '🏦');
}

// ==========================================================================
// Блокнот Обраних Виразів (Bookmarks)
// ==========================================================================
function renderBookmarks() {
    const container = document.getElementById('bookmarks-list-box');
    if (!container) return;

    if (state.bookmarks.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">Блокнот порожній. Додайте важливі числа або формули.</div>';
        return;
    }

    container.innerHTML = '';
    state.bookmarks.forEach((bm, idx) => {
        const card = document.createElement('div');
        card.className = 'bookmark-card';
        card.innerHTML = `
            <div style="flex-grow:1;">
                <span class="bookmark-tag-chip">${bm.tag || 'Збережено'}</span>
                <div style="font-weight:700; color:var(--text-primary); font-size:0.9rem;">${bm.title}</div>
                <div style="font-family:'JetBrains Mono', monospace; color:var(--accent-operator); font-size:0.95rem; font-weight:800;">${bm.val}</div>
            </div>
            <div class="bookmark-actions">
                <button class="btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="insertBookmarkVal('${bm.val}')" title="Вставити в калькулятор">📥 Вставити</button>
                <button class="btn-secondary btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteBookmark(${bm.id})">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function addCurrentAsBookmark() {
    const titleInp = document.getElementById('bm-title-input');
    const valInp = document.getElementById('bm-val-input');
    const title = titleInp ? titleInp.value.trim() || 'Користувацький запис' : 'Запис';
    const val = (valInp && valInp.value.trim()) ? valInp.value.trim() : state.currentInput;

    audio.playAction();
    state.bookmarks.unshift({
        id: Date.now(),
        title,
        val,
        tag: 'Мій запис'
    });
    localStorage.setItem('calc_bookmarks', JSON.stringify(state.bookmarks));
    if (titleInp) titleInp.value = '';
    if (valInp) valInp.value = '';
    renderBookmarks();
    showToast(`Запис "${title}" додано до блокнота`, '🔖');
}

function insertBookmarkVal(val) {
    audio.playAction();
    state.currentInput = val.toString();
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('bookmarks-modal');
    showToast(`Значення ${val} вставлено`, '📥');
}

function deleteBookmark(id) {
    audio.playAction();
    state.bookmarks = state.bookmarks.filter(b => b.id !== id);
    localStorage.setItem('calc_bookmarks', JSON.stringify(state.bookmarks));
    renderBookmarks();
    showToast('Запис видалено', '🗑️');
}

function clearAllBookmarks() {
    audio.playAction();
    state.bookmarks = [];
    localStorage.removeItem('calc_bookmarks');
    renderBookmarks();
    showToast('Блокнот очищено', '🧹');
}

// ==========================================================================
// 3-Канальний Живий HSL Мікшер
// ==========================================================================
let mixerHue = 340;
let mixerSat = 80;
let mixerDark = 8;

function updateLiveHueMixer(val) {
    mixerHue = parseInt(val);
    const label = document.getElementById('hue-accent-val');
    if (label) label.innerText = `${val}°`;
    applyLiveHslMixer();
}

function updateLiveSatMixer(val) {
    mixerSat = parseInt(val);
    const label = document.getElementById('sat-accent-val');
    if (label) label.innerText = `${val}%`;
    applyLiveHslMixer();
}

function updateLiveDarkMixer(val) {
    mixerDark = parseInt(val);
    const label = document.getElementById('dark-bg-val');
    if (label) label.innerText = `${val}%`;
    applyLiveHslMixer();
}

function applyLiveHslMixer() {
    const accent = `hsl(${mixerHue}, ${mixerSat}%, 45%)`;
    const glow = `hsl(${mixerHue}, ${mixerSat}%, 60%)`;
    const bg = `hsl(${mixerHue}, ${Math.max(10, mixerSat - 40)}%, ${mixerDark}%)`;

    document.documentElement.style.setProperty('--accent-operator', accent);
    document.documentElement.style.setProperty('--accent-equals', glow);
    document.documentElement.style.setProperty('--bg-body', bg);
    document.documentElement.style.setProperty('--badge-bg', `hsla(${mixerHue}, ${mixerSat}%, 50%, 0.18)`);
    document.documentElement.style.setProperty('--badge-border', `hsla(${mixerHue}, ${mixerSat}%, 50%, 0.45)`);
}

function applyColorHarmony(preset) {
    audio.playAction();
    const hSlider = document.getElementById('slider-accent-hue');
    const sSlider = document.getElementById('slider-accent-sat');
    const dSlider = document.getElementById('slider-bg-dark');

    if (preset === 'wine_gold') {
        mixerHue = 345; mixerSat = 85; mixerDark = 6;
        document.documentElement.style.setProperty('--accent-operator', '#8b1538');
        document.documentElement.style.setProperty('--accent-equals', '#f59e0b');
        document.documentElement.style.setProperty('--bg-body', '#0d0205');
    } else if (preset === 'ruby_cyber') {
        mixerHue = 350; mixerSat = 100; mixerDark = 4;
        document.documentElement.style.setProperty('--accent-operator', '#ff0055');
        document.documentElement.style.setProperty('--accent-equals', '#ff00a0');
        document.documentElement.style.setProperty('--bg-body', '#060003');
    } else if (preset === 'blood_moon') {
        mixerHue = 0; mixerSat = 90; mixerDark = 5;
        document.documentElement.style.setProperty('--accent-operator', '#dc2626');
        document.documentElement.style.setProperty('--accent-equals', '#ea580c');
        document.documentElement.style.setProperty('--bg-body', '#0c0203');
    } else if (preset === 'cosmic_amethyst') {
        mixerHue = 290; mixerSat = 85; mixerDark = 6;
        document.documentElement.style.setProperty('--accent-operator', '#c026d3');
        document.documentElement.style.setProperty('--accent-equals', '#e11d48');
        document.documentElement.style.setProperty('--bg-body', '#0e010e');
    } else if (preset === 'emerald_wine') {
        mixerHue = 160; mixerSat = 80; mixerDark = 5;
        document.documentElement.style.setProperty('--accent-operator', '#10b981');
        document.documentElement.style.setProperty('--accent-equals', '#8b1538');
        document.documentElement.style.setProperty('--bg-body', '#02120e');
    }

    if (hSlider) hSlider.value = mixerHue;
    if (sSlider) sSlider.value = mixerSat;
    if (dSlider) dSlider.value = mixerDark;
    const hL = document.getElementById('hue-accent-val');
    const sL = document.getElementById('sat-accent-val');
    const dL = document.getElementById('dark-bg-val');
    if (hL) hL.innerText = `${mixerHue}°`;
    if (sL) sL.innerText = `${mixerSat}%`;
    if (dL) dL.innerText = `${mixerDark}%`;

    showToast(`Гармонію ${preset} застосовано`, '🎨');
}

// ==========================================================================
// Розрахункова Стрічка (Paper Tape Roll)
// ==========================================================================
function addTapeEntry(equation, result, note = '') {
    const entry = {
        id: Date.now() + Math.random(),
        equation,
        result,
        note,
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };
    state.tapeEntries.unshift(entry);
    if (state.tapeEntries.length > 50) state.tapeEntries.pop();
    localStorage.setItem('calc_tape', JSON.stringify(state.tapeEntries));
    renderTapeRoll();
}

function renderTapeRoll() {
    const container = document.getElementById('tape-lines-list');
    const totalEl = document.getElementById('tape-grand-total');
    if (!container) return;

    if (state.tapeEntries.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#9ca3af; padding:16px;">Стрічка чиста. Виконайте розрахунки.</div>';
        if (totalEl) totalEl.innerText = '0.00';
        return;
    }

    container.innerHTML = '';
    let grandSum = 0;

    state.tapeEntries.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'tape-line-item';
        const parsed = parseFloat(item.result) || 0;
        grandSum += parsed;

        row.innerHTML = `
            <div style="flex-grow:1;">
                <div class="tape-line-eq">${item.equation} = <strong>${item.result}</strong></div>
                <small style="color:#6b7280; font-size:0.72rem;">[${item.time}]</small>
            </div>
            <input type="text" class="tape-line-note-input" placeholder="Додати нотатку..." value="${item.note || ''}" onchange="updateTapeNote(${idx}, this.value)">
            <button class="btn-secondary" style="padding:2px 6px; font-size:0.75rem;" onclick="insertTapeValToCalc('${item.result}')" title="Вставити в калькулятор">📥</button>
        `;
        container.appendChild(row);
    });

    if (totalEl) totalEl.innerText = grandSum.toFixed(2);
}

function updateTapeNote(idx, val) {
    if (state.tapeEntries[idx]) {
        state.tapeEntries[idx].note = val;
        localStorage.setItem('calc_tape', JSON.stringify(state.tapeEntries));
    }
}

function insertTapeValToCalc(val) {
    audio.playAction();
    state.currentInput = val.toString();
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('tape-modal');
    showToast(`Значення ${val} вставлено`, '📥');
}

function addCustomTapeEntry() {
    audio.playAction();
    const val = state.currentInput || '0';
    addTapeEntry(`Введення`, val, 'Ручний запис');
    showToast('Рядок додано до стрічки', '📜');
}

function printTapeRoll() {
    audio.playAction();
    window.print();
}

function copyTapeAsText() {
    audio.playAction();
    let text = `=== РОЗРАХУНКОВИЙ ЧЕК PRO v1.8.4 ===\nДата: ${new Date().toLocaleString('uk-UA')}\n------------------------------------\n`;
    let sum = 0;
    state.tapeEntries.forEach((it, i) => {
        text += `${i + 1}. ${it.equation} = ${it.result} ${it.note ? '(' + it.note + ')' : ''}\n`;
        sum += parseFloat(it.result) || 0;
    });
    text += `------------------------------------\nЗАГАЛЬНИЙ ПІДСУМОК: ${sum.toFixed(2)}\n`;
    navigator.clipboard.writeText(text);
    showToast('Розрахунковий чек скопійовано', '📋');
}

function clearTapeRoll() {
    audio.playAction();
    state.tapeEntries = [];
    localStorage.removeItem('calc_tape');
    renderTapeRoll();
    showToast('Розрахункову стрічку очищено', '🗑️');
}

// ==========================================================================
// НСД, НСК та Прості Множники
// ==========================================================================
function solvePrimeFactorization() {
    const numInput = document.getElementById('prime-num-input');
    if (!numInput) return;
    let n = Math.abs(parseInt(numInput.value, 10)) || 0;

    const factorResEl = document.getElementById('prime-factor-res');
    const isPrimeBadge = document.getElementById('prime-is-prime-badge');
    const countEl = document.getElementById('divisors-count');
    const chipsList = document.getElementById('divisors-chips-list');

    if (n <= 0) {
        if (factorResEl) factorResEl.innerText = 'Введіть число > 0';
        return;
    }
    if (n === 1) {
        if (factorResEl) factorResEl.innerText = '1 (не є ні простим, ні складеним)';
        if (isPrimeBadge) isPrimeBadge.innerText = 'Одиничне число';
        if (countEl) countEl.innerText = '1';
        if (chipsList) chipsList.innerHTML = '<span class="div-chip">1</span>';
        return;
    }

    let temp = n;
    const factors = {};
    for (let d = 2; d * d <= temp; d++) {
        while (temp % d === 0) {
            factors[d] = (factors[d] || 0) + 1;
            temp /= d;
        }
    }
    if (temp > 1) {
        factors[temp] = (factors[temp] || 0) + 1;
    }

    const factorParts = [];
    const supMap = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    for (let prime in factors) {
        const pwr = factors[prime];
        if (pwr === 1) {
            factorParts.push(prime);
        } else {
            const pwrStr = pwr.toString().split('').map(c => supMap[c] || c).join('');
            factorParts.push(`${prime}${pwrStr}`);
        }
    }

    if (factorResEl) factorResEl.innerText = factorParts.join(' × ');

    const isPrime = Object.keys(factors).length === 1 && factors[Object.keys(factors)[0]] === 1;
    if (isPrimeBadge) {
        isPrimeBadge.innerText = isPrime ? '⭐ Просте число' : 'Складене число';
        isPrimeBadge.style.color = isPrime ? 'var(--accent-equals)' : 'var(--accent-operator)';
    }

    const divisors = [];
    for (let i = 1; i * i <= n; i++) {
        if (n % i === 0) {
            divisors.push(i);
            if (i * i !== n) divisors.push(n / i);
        }
    }
    divisors.sort((a, b) => a - b);

    if (countEl) countEl.innerText = divisors.length;
    if (chipsList) {
        chipsList.innerHTML = '';
        divisors.forEach(d => {
            const chip = document.createElement('span');
            chip.className = 'div-chip';
            chip.innerText = d;
            chip.title = 'Клікніть, щоб вставити в калькулятор';
            chip.onclick = () => {
                insertTapeValToCalc(d);
                closeModal('prime-gcd-modal');
            };
            chipsList.appendChild(chip);
        });
    }
}

function setPrimeFromCalc() {
    audio.playAction();
    const num = Math.abs(parseInt(state.currentInput, 10)) || 100;
    const inp = document.getElementById('prime-num-input');
    if (inp) {
        inp.value = num;
        solvePrimeFactorization();
    }
}

function solveGcdLcm() {
    let a = Math.abs(parseInt(document.getElementById('gcd-num-a').value, 10)) || 0;
    let b = Math.abs(parseInt(document.getElementById('gcd-num-b').value, 10)) || 0;

    const gcdEl = document.getElementById('gcd-val-res');
    const lcmEl = document.getElementById('lcm-val-res');
    const stepsEl = document.getElementById('euclid-steps-count');

    if (a === 0 || b === 0) {
        const gcd = a || b;
        state.gcdVal = gcd.toString();
        state.lcmVal = '0';
        if (gcdEl) gcdEl.innerText = gcd;
        if (lcmEl) lcmEl.innerText = '0';
        if (stepsEl) stepsEl.innerText = '1 крок';
        return;
    }

    let origA = a, origB = b;
    let steps = 0;
    while (b !== 0) {
        steps++;
        let t = b;
        b = a % b;
        a = t;
    }
    const gcd = a;
    const lcm = (origA * origB) / gcd;

    state.gcdVal = gcd.toString();
    state.lcmVal = lcm.toString();

    if (gcdEl) gcdEl.innerText = gcd;
    if (lcmEl) lcmEl.innerText = lcm;
    if (stepsEl) stepsEl.innerText = `${steps} кроки за алгоритмом Евкліда`;
}

function insertGcdToCalc() {
    audio.playAction();
    state.currentInput = state.gcdVal;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('prime-gcd-modal');
    showToast(`НСД = ${state.gcdVal} вставлено`, '🔢');
}

function insertLcmToCalc() {
    audio.playAction();
    state.currentInput = state.lcmVal;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('prime-gcd-modal');
    showToast(`НСК = ${state.lcmVal} вставлено`, '🔢');
}

// ==========================================================================
// Порівняння Цін за Одиницю
// ==========================================================================
function calculateUnitDeal() {
    const pA = parseFloat(document.getElementById('deal-a-price').value) || 0;
    const qA = parseFloat(document.getElementById('deal-a-qty').value) || 1;
    const uA = document.getElementById('deal-a-unit').value;

    const pB = parseFloat(document.getElementById('deal-b-price').value) || 0;
    const qB = parseFloat(document.getElementById('deal-b-qty').value) || 1;
    const uB = document.getElementById('deal-b-unit').value;

    const factorMap = { g: 0.001, kg: 1.0, ml: 0.001, l: 1.0, pcs: 1.0 };
    const normA = qA * (factorMap[uA] || 1.0);
    const normB = qB * (factorMap[uB] || 1.0);

    const unitPriceA = normA > 0 ? (pA / normA) : 0;
    const unitPriceB = normB > 0 ? (pB / normB) : 0;

    const resAEl = document.getElementById('deal-a-unit-price');
    const resBEl = document.getElementById('deal-b-unit-price');
    const cardA = document.getElementById('deal-card-a');
    const cardB = document.getElementById('deal-card-b');
    const winText = document.getElementById('deal-winner-text');
    const saveDetail = document.getElementById('deal-savings-detail');

    if (resAEl) resAEl.innerText = `${unitPriceA.toFixed(2)} ₴`;
    if (resBEl) resBEl.innerText = `${unitPriceB.toFixed(2)} ₴`;

    if (cardA) cardA.classList.remove('winner');
    if (cardB) cardB.classList.remove('winner');

    if (unitPriceA <= 0 || unitPriceB <= 0) {
        if (winText) winText.innerText = 'Введіть коректні ціни та об\'єми';
        return;
    }

    if (Math.abs(unitPriceA - unitPriceB) < 0.01) {
        if (winText) winText.innerText = 'Обидва варіанти однаково вигідні!';
        if (saveDetail) saveDetail.innerText = 'Ціна за 1 одиницю повністю ідентична.';
    } else if (unitPriceA < unitPriceB) {
        if (cardA) cardA.classList.add('winner');
        const diff = unitPriceB - unitPriceA;
        const pct = ((unitPriceB - unitPriceA) / unitPriceB) * 100;
        if (winText) winText.innerText = `Товар А вигідніший на ${pct.toFixed(2)}%!`;
        if (saveDetail) saveDetail.innerText = `Економія становить ${diff.toFixed(2)} ₴ на кожній базовій одиниці (1 кг/л/од).`;
    } else {
        if (cardB) cardB.classList.add('winner');
        const diff = unitPriceA - unitPriceB;
        const pct = ((unitPriceA - unitPriceB) / unitPriceA) * 100;
        if (winText) winText.innerText = `Товар B вигідніший на ${pct.toFixed(2)}%!`;
        if (saveDetail) saveDetail.innerText = `Економія становить ${diff.toFixed(2)} ₴ на кожній базовій одиниці (1 кг/л/од).`;
    }
}

// ==========================================================================
// Обчислювач Функцій f(x)
// ==========================================================================
function parseAndEvalFormula(expr, xVal) {
    try {
        let clean = expr.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/\^/g, '**')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/abs/g, 'Math.abs')
            .replace(/ln/g, 'Math.log')
            .replace(/pi/g, 'Math.PI')
            .replace(/e/g, 'Math.E');

        clean = clean.replace(/\bx\b/g, `(${xVal})`);
        clean = clean.replace(/(\d)\(/g, '$1*(');

        const res = Function(`'use strict'; return (${clean})`)();
        return isNaN(res) || !isFinite(res) ? 'Помилка' : res;
    } catch (e) {
        return 'Помилка';
    }
}

function evaluateCustomFunc() {
    const expr = document.getElementById('func-expr-input').value;
    const xVal = parseFloat(document.getElementById('func-single-x').value) || 0;
    const resEl = document.getElementById('func-single-res');

    const res = parseAndEvalFormula(expr, xVal);
    state.funcSingleRes = typeof res === 'number' ? formatResult(res) : 'Помилка';
    if (resEl) resEl.innerText = state.funcSingleRes;

    buildFuncTable();
}

function buildFuncTable() {
    const expr = document.getElementById('func-expr-input').value;
    const start = parseFloat(document.getElementById('func-range-start').value) || -3;
    const end = parseFloat(document.getElementById('func-range-end').value) || 3;
    const step = parseFloat(document.getElementById('func-range-step').value) || 1;
    const tbody = document.getElementById('func-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const safeStep = Math.max(0.01, Math.abs(step));
    const safeEnd = Math.min(start + (safeStep * 50), end);

    for (let x = start; x <= safeEnd + 0.0001; x += safeStep) {
        const val = parseAndEvalFormula(expr, x);
        const tr = document.createElement('tr');
        const formattedVal = typeof val === 'number' ? formatResult(val) : val;
        tr.innerHTML = `
            <td><strong>${parseFloat(x.toFixed(4))}</strong></td>
            <td style="color:var(--accent-operator); font-weight:700;">${formattedVal}</td>
            <td><button class="btn-secondary" style="padding:2px 6px; font-size:0.75rem;" onclick="insertTableValToCalc('${formattedVal}')">Вставити</button></td>
        `;
        tbody.appendChild(tr);
    }
}

function insertFuncResToCalc() {
    audio.playAction();
    state.currentInput = state.funcSingleRes;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('func-eval-modal');
    showToast(`Значення f(x) = ${state.funcSingleRes} вставлено`, '📈');
}

function insertTableValToCalc(val) {
    if (val !== 'Помилка') {
        audio.playAction();
        state.currentInput = val.toString();
        state.shouldResetDisplay = true;
        updateDisplay();
        closeModal('func-eval-modal');
        showToast(`Значення ${val} вставлено`, '📥');
    }
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
// Інтерактивний Бітовий Інспектор
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
// Головний розрахунок (Calculate) + Результатне Світіння
// ==========================================================================
function calculate(saveToHistory = true) {
    // Авто-балансування відкритих дужок перед обчисленням
    if (state.bracketDepth > 0) {
        state.currentInput += ')'.repeat(state.bracketDepth);
        state.bracketDepth = 0;
    }

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
        const eqStr = `${prev} ${opSymbol} ${current}`;
        addToHistory(eqStr, resultStr);
        addTapeEntry(eqStr, resultStr, 'Розрахунок');
    }

    state.operationsCount++;
    state.currentInput = resultStr;
    state.operator = undefined;
    state.shouldResetDisplay = true;
    updateDisplay();

    // Ефект неонового підсвічування дисплея
    if (dom.display) {
        dom.display.classList.add('display-result-glow');
        setTimeout(() => dom.display.classList.remove('display-result-glow'), 600);
    }
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
    state.fontScale = 100;
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
    const setFontScaleEl = document.getElementById('setting-font-scale');
    if (setFontScaleEl) setFontScaleEl.value = '100';

    setFontScale(100, true);
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
// Шрифти & Масштабування (Typography & Font Scale Controller)
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

    showToast(`Встановлено шрифт: ${fontNames[fontClass]}`, '🔤');
}

function setFontScale(scale, isSilent = false) {
    const s = parseInt(scale, 10) || 100;
    state.fontScale = s;
    localStorage.setItem('calc_font_scale', s);

    // Встановлення глобальної CSS змінної масштабу
    document.documentElement.style.setProperty('--font-scale', (s / 100).toString());

    // Оновлення елементів інтерфейсу Студії Шрифтів
    const slider = document.getElementById('font-scale-slider');
    const displayVal = document.getElementById('font-scale-display-val');
    const previewText = document.getElementById('font-scale-preview-text');
    if (slider) slider.value = s;
    if (displayVal) displayVal.innerText = `${s}%`;
    if (previewText) previewText.style.fontSize = `calc(1rem * ${s / 100})`;

    // Оновлення активного стану кнопок-пресетів
    document.querySelectorAll('.font-scale-preset-btn').forEach(btn => {
        const btnScale = parseInt(btn.getAttribute('data-scale'), 10);
        btn.classList.toggle('active', btnScale === s);
    });

    // Оновлення бейджа на дисплеї калькулятора
    const scaleBadge = document.getElementById('font-scale-badge');
    if (scaleBadge) {
        scaleBadge.innerText = `🔠 ${s}%`;
        scaleBadge.title = `Масштаб шрифтів: ${s}% (клік для циклічної зміни: 90% → 100% → 115% → 130% → 145%)`;
    }

    // Оновлення селектора у Центрі Налаштувань
    const settingSelect = document.getElementById('setting-font-scale');
    if (settingSelect) settingSelect.value = s.toString();

    if (!isSilent) {
        audio.playClick(620);
        showToast(`Масштаб шрифту встановлено: ${s}%`, '🔠');
    }
}

function cycleFontScale() {
    const presets = [90, 100, 115, 130, 145];
    let currentIndex = presets.indexOf(state.fontScale);
    let nextIndex = 0;
    if (currentIndex !== -1 && currentIndex < presets.length - 1) {
        nextIndex = currentIndex + 1;
    } else if (currentIndex === -1) {
        nextIndex = 1;
    } else {
        nextIndex = 0;
    }
    setFontScale(presets[nextIndex]);
}

// ==========================================================================
// Теми та Кольори (28 Themes)
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
        titanium_ruby: 'Titanium Ruby Master',
        crimson_supernova: 'Crimson Supernova Cosmic',
        cyberpunk_neon: 'Cyberpunk Neon Bordeaux',
        emerald_platinum: 'Emerald Platinum',
        amethyst_crimson: 'Amethyst Crimson Royal',
        cyber_ruby: 'Cyber Ruby Neon',
        golden_bordeaux: 'Golden Bordeaux Imperial',
        midnight_sapphire: 'Midnight Sapphire Velvet',
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
// Wallpaper Studio (12 HD Шпалер)
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
        titanium_ruby: 'Titanium Ruby Laser',
        crimson_supernova: 'Crimson Supernova Cosmic',
        cyberpunk_bordeaux: 'Cyberpunk Bordeaux City',
        amethyst_crystal: 'Аметистовий Кристал',
        cyber_matrix_red: 'Бордова Кібер-Сітка',
        aurora_ruby: 'Рубінове Полярне Сяйво',
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

    if (state.currentWallpaper === 'titanium_ruby') {
        dom.bgWallpaper.style.backgroundImage = "url('images/titanium_ruby.jpg')";
    } else if (state.currentWallpaper === 'crimson_supernova') {
        dom.bgWallpaper.style.backgroundImage = "url('images/crimson_supernova.jpg')";
    } else if (state.currentWallpaper === 'cyberpunk_bordeaux') {
        dom.bgWallpaper.style.backgroundImage = "url('images/cyberpunk_bordeaux.jpg')";
    } else if (state.currentWallpaper === 'amethyst_crystal') {
        dom.bgWallpaper.style.backgroundImage = "url('images/amethyst_crystal.jpg')";
    } else if (state.currentWallpaper === 'cyber_matrix_red') {
        dom.bgWallpaper.style.backgroundImage = "url('images/cyber_matrix_red.jpg')";
    } else if (state.currentWallpaper === 'aurora_ruby') {
        dom.bgWallpaper.style.backgroundImage = "url('images/aurora_ruby.jpg')";
    } else if (state.currentWallpaper === 'burgundy') {
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

// ==========================================================================
// НОВЕ v1.8.5: 3D Векторний Калькулятор (3D Vector Math)
// ==========================================================================
function solveVectorMath() {
    const ux = parseFloat(document.getElementById('vec-u-x')?.value) || 0;
    const uy = parseFloat(document.getElementById('vec-u-y')?.value) || 0;
    const uz = parseFloat(document.getElementById('vec-u-z')?.value) || 0;

    const vx = parseFloat(document.getElementById('vec-v-x')?.value) || 0;
    const vy = parseFloat(document.getElementById('vec-v-y')?.value) || 0;
    const vz = parseFloat(document.getElementById('vec-v-z')?.value) || 0;

    // 1. Скалярний добуток (Dot product)
    const dot = (ux * vx) + (uy * vy) + (uz * vz);

    // 2. Векторний добуток (Cross product)
    const cx = (uy * vz) - (uz * vy);
    const cy = (uz * vx) - (ux * vz);
    const cz = (ux * vy) - (uy * vx);

    // 3. Модулі (Довжини)
    const lenU = Math.sqrt(ux * ux + uy * uy + uz * uz);
    const lenV = Math.sqrt(vx * vx + vy * vy + vz * vz);

    // 4. Кут між векторами
    let angleDeg = 0;
    let angleRad = 0;
    if (lenU > 0 && lenV > 0) {
        const cosTheta = Math.max(-1, Math.min(1, dot / (lenU * lenV)));
        angleRad = Math.acos(cosTheta);
        angleDeg = angleRad * (180 / Math.PI);
    }

    // 5. Евклідова відстань
    const dist = Math.sqrt((vx - ux) ** 2 + (vy - uy) ** 2 + (vz - uz) ** 2);

    state.vectorResults = {
        dot: dot.toFixed(2),
        cross: `(${cx.toFixed(1)}, ${cy.toFixed(1)}, ${cz.toFixed(1)})`,
        lenU: lenU.toFixed(3),
        lenV: lenV.toFixed(3),
        angle: `${angleDeg.toFixed(1)}° (${angleRad.toFixed(2)} rad)`,
        dist: dist.toFixed(3)
    };

    const dEl = document.getElementById('vec-res-dot');
    const cEl = document.getElementById('vec-res-cross');
    const uEl = document.getElementById('vec-res-len-u');
    const vEl = document.getElementById('vec-res-len-v');
    const aEl = document.getElementById('vec-res-angle');
    const distEl = document.getElementById('vec-res-dist');

    if (dEl) dEl.innerText = state.vectorResults.dot;
    if (cEl) cEl.innerText = state.vectorResults.cross;
    if (uEl) uEl.innerText = state.vectorResults.lenU;
    if (vEl) vEl.innerText = state.vectorResults.lenV;
    if (aEl) aEl.innerText = state.vectorResults.angle;
    if (distEl) distEl.innerText = state.vectorResults.dist;
}

function insertVectorDotToCalc() {
    audio.playAction();
    state.currentInput = state.vectorResults.dot;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('vector-calc-modal');
    showToast(`Скалярний добуток u·v = ${state.vectorResults.dot} вставлено`, '📐');
}

function insertVectorMagUToCalc() {
    audio.playAction();
    state.currentInput = state.vectorResults.lenU;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('vector-calc-modal');
    showToast(`Модуль |u| = ${state.vectorResults.lenU} вставлено`, '📐');
}

// ==========================================================================
// НОВЕ v1.8.5: Комплексні Числа ℂ (Complex Numbers)
// ==========================================================================
function solveComplexMath() {
    const a = parseFloat(document.getElementById('cplx-a')?.value) || 0;
    const b = parseFloat(document.getElementById('cplx-b')?.value) || 0;
    const c = parseFloat(document.getElementById('cplx-c')?.value) || 0;
    const d = parseFloat(document.getElementById('cplx-d')?.value) || 0;

    // Сума (a+c) + (b+d)i
    const sumR = a + c;
    const sumI = b + d;

    // Різниця (a-c) + (b-d)i
    const diffR = a - c;
    const diffI = b - d;

    // Добуток (ac - bd) + (ad + bc)i
    const mulR = (a * c) - (b * d);
    const mulI = (a * d) + (b * c);

    // Частка
    const denom = (c * c) + (d * d);
    let divR = 0, divI = 0;
    if (denom !== 0) {
        divR = ((a * c) + (b * d)) / denom;
        divI = ((b * c) - (a * d)) / denom;
    }

    // Модуль |z1|
    const mod1 = Math.sqrt(a * a + b * b);

    // Аргумент arg(z1)
    const arg1Rad = Math.atan2(b, a);
    const arg1Deg = arg1Rad * (180 / Math.PI);

    const fmtCplx = (r, i) => {
        const sign = i >= 0 ? '+' : '-';
        return `${r.toFixed(2)} ${sign} ${Math.abs(i).toFixed(2)}i`;
    };

    state.complexResults = {
        add: fmtCplx(sumR, sumI),
        sub: fmtCplx(diffR, diffI),
        mul: fmtCplx(mulR, mulI),
        div: denom !== 0 ? fmtCplx(divR, divI) : 'Ділення на 0',
        mod1: mod1.toFixed(3),
        arg1: `${arg1Deg.toFixed(1)}° (${arg1Rad.toFixed(2)} rad)`
    };

    const addEl = document.getElementById('cplx-res-add');
    const subEl = document.getElementById('cplx-res-sub');
    const mulEl = document.getElementById('cplx-res-mul');
    const divEl = document.getElementById('cplx-res-div');
    const modEl = document.getElementById('cplx-res-mod1');
    const argEl = document.getElementById('cplx-res-arg1');

    if (addEl) addEl.innerText = state.complexResults.add;
    if (subEl) subEl.innerText = state.complexResults.sub;
    if (mulEl) mulEl.innerText = state.complexResults.mul;
    if (divEl) divEl.innerText = state.complexResults.div;
    if (modEl) modEl.innerText = state.complexResults.mod1;
    if (argEl) argEl.innerText = state.complexResults.arg1;
}

function insertComplexModToCalc() {
    audio.playAction();
    state.currentInput = state.complexResults.mod1;
    state.shouldResetDisplay = true;
    updateDisplay();
    closeModal('complex-calc-modal');
    showToast(`Модуль |z₁| = ${state.complexResults.mod1} вставлено`, '⚛️');
}

// ==========================================================================
// НОВЕ v1.8.5: Інтерактивний Математичний Довідник Формул
// ==========================================================================
function switchMathRefTab(tabKey) {
    audio.playClick(600);
    state.activeMathRefTab = tabKey;
    document.querySelectorAll('[data-rtab]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-rtab') === tabKey);
    });
    renderMathRefList();
}

function renderMathRefList() {
    const container = document.getElementById('math-ref-container');
    if (!container) return;

    const list = MATH_REFERENCE_DATA[state.activeMathRefTab] || [];
    container.innerHTML = '';

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'math-ref-item';
        card.innerHTML = `
            <div>
                <div class="math-ref-title">${item.title}</div>
                <div class="math-ref-formula">${item.formula}</div>
            </div>
            <button class="btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="copyFormulaText('${item.formula.replace(/'/g, "\\'")}')">📋 Копіювати</button>
        `;
        container.appendChild(card);
    });
}

function copyFormulaText(formula) {
    audio.playAction();
    navigator.clipboard.writeText(formula).then(() => {
        showToast(`Формулу скопійовано: ${formula}`, '📋');
    });
}

// ==========================================================================
// НОВЕ v1.8.5: Мобільна навігація (Mobile Sidebar Drawer)
// ==========================================================================
function toggleMobileSidebar() {
    audio.playClick(650);
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
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
    reader.onload = function (e) {
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
            else if (uFrom === 'F') c = (val - 32) * (5 / 9);
            else if (uFrom === 'K') c = val - 273.15;

            let res;
            if (uTo === 'C') res = c;
            else if (uTo === 'F') res = (c * (9 / 5)) + 32;
            else if (uTo === 'K') res = c + 273.15;
            toInput.value = parseFloat(res.toFixed(6)).toString();
        } else {
            const val = parseFloat(toInput.value) || 0;
            let c;
            if (uTo === 'C') c = val;
            else if (uTo === 'F') c = (val - 32) * (5 / 9);
            else if (uTo === 'K') c = val - 273.15;

            let res;
            if (uFrom === 'C') res = c;
            else if (uFrom === 'F') res = (c * (9 / 5)) + 32;
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
    } catch (e) { }
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
            application: "Calculator Pro v1.8.5 (Build 190) Redstone 3.5 Bordeaux Titanium Edition",
            exportedAt: new Date().toISOString(),
            author: "MaxNT Official, 2026",
            totalRecords: state.history.length,
            records: state.history
        }, null, 2);
    } else {
        content = `====================================================\n`;
        content += `  КАЛЬКУЛЯТОР PRO v1.8.5 (Build 190) Redstone 3.5 Bordeaux - ІСТОРІЯ\n`;
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
    a.download = `Calculator_History_v1.8.5_${dateStr}.${fileExt}`;
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
        if (modalId === 'vector-calc-modal') {
            solveVectorMath();
        }
        if (modalId === 'complex-calc-modal') {
            solveComplexMath();
        }
        if (modalId === 'math-ref-modal') {
            renderMathRefList();
        }
        if (modalId === 'trig-circle-modal') {
            setTimeout(() => updateTrigCircle(state.trigAngleDeg), 50);
        }
        if (modalId === 'constants-search-modal') {
            renderExtendedConstants();
        }
        if (modalId === 'formula-solver-modal') {
            solvePhysicsFormula('ek');
            solvePhysicsFormula('ohm');
            solvePhysicsFormula('fall');
            solvePhysicsFormula('rho');
            solvePhysicsFormula('grav');
            solvePhysicsFormula('gas');
        }
        if (modalId === 'triangle-solver-modal') {
            solveTriangleGeometry();
        }
        if (modalId === 'loan-calc-modal') {
            calculateLoanAmortization();
        }
        if (modalId === 'bookmarks-modal') {
            renderBookmarks();
        }
        if (modalId === 'history-modal') {
            if (dom.historySearch) dom.historySearch.value = '';
            renderHistory();
        }
        if (modalId === 'tape-modal') {
            renderTapeRoll();
        }
        if (modalId === 'prime-gcd-modal') {
            solvePrimeFactorization();
            solveGcdLcm();
        }
        if (modalId === 'deal-calc-modal') {
            calculateUnitDeal();
        }
        if (modalId === 'func-eval-modal') {
            evaluateCustomFunc();
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
            renderBitmaskGrid();
        }
        if (modalId === 'percent-modal') {
            calcPercent1();
            calcPercent2();
            calcPercent3();
        }
        if (modalId === 'currency-modal') {
            runCurrencyConversion('from');
        }
        if (modalId === 'font-modal') {
            setFontScale(state.fontScale, true);
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
            const sFScale = document.getElementById('setting-font-scale');
            if (vSlider) vSlider.value = Math.round(state.soundVolume * 100);
            if (vVal) vVal.innerText = `${Math.round(state.soundVolume * 100)}%`;
            if (sProf) sProf.value = state.soundProfile;
            if (sSep) sSep.value = state.thousandSeparator;
            if (sPrec) sPrec.value = state.precisionMode;
            if (sAng) sAng.value = state.angleMode;
            if (sGlass) sGlass.value = state.glassIntensity;
            if (sPart) sPart.value = state.particlesEnabled ? 'on' : 'off';
            if (sFScale) sFScale.value = state.fontScale.toString();
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
    // Command Palette (Ctrl+K / ⌘K)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'k' || event.key === 'K' || event.key === 'л' || event.key === 'Л')) {
        event.preventDefault();
        openCommandPalette();
        return;
    }

    // Довідник клавіш (F1 або ?)
    if (event.key === 'F1' || (event.key === '?' && document.activeElement.tagName !== 'INPUT')) {
        event.preventDefault();
        openModal('shortcuts-modal');
        return;
    }

    // Навігація всередині відкритого Command Palette
    const paletteModal = document.getElementById('command-palette-modal');
    if (paletteModal && paletteModal.classList.contains('active')) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (filteredCommandItems.length > 0) {
                selectedCommandIndex = (selectedCommandIndex + 1) % filteredCommandItems.length;
                selectCommandIndex(selectedCommandIndex);
                scrollSelectedCommandIntoView();
            }
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (filteredCommandItems.length > 0) {
                selectedCommandIndex = (selectedCommandIndex - 1 + filteredCommandItems.length) % filteredCommandItems.length;
                selectCommandIndex(selectedCommandIndex);
                scrollSelectedCommandIntoView();
            }
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            if (filteredCommandItems.length > 0) {
                executeCommandPaletteItem(selectedCommandIndex);
            }
            return;
        }
    }

    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            return;
        }
        clearDisplay();
        return;
    }

    if (event.key === 'F11') {
        event.preventDefault();
        toggleFullScreen();
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
        if (!event.ctrlKey && !event.metaKey && document.activeElement.tagName !== 'INPUT') {
            toggleSecondMode();
            return;
        }
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'в' || event.key === 'В') {
        if (!event.ctrlKey && !event.metaKey && document.activeElement.tagName !== 'INPUT') {
            toggleAngleMode();
            return;
        }
    }
    if (event.key === 'v' || event.key === 'V' || event.key === 'м' || event.key === 'М') {
        if (!event.ctrlKey && !event.metaKey && document.activeElement.tagName !== 'INPUT') {
            speakCurrentResult();
            return;
        }
    }
    if (event.key === 'h' || event.key === 'H' || event.key === 'р' || event.key === 'Р') {
        if (!event.ctrlKey && !event.metaKey && document.activeElement.tagName !== 'INPUT') {
            openModal('history-modal');
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
        }).catch(() => { });
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
// 20. Command Palette Engine (Ctrl+K / ⌘K)
// ==========================================================================
let commandPaletteItems = [
    // Інструменти
    { id: 'vector', title: '3D Векторний калькулятор', desc: 'Скалярний, векторний добуток, кут, модулі', icon: '📐', cat: 'Інструменти', action: () => openModal('vector-calc-modal') },
    { id: 'complex', title: 'Комплексні числа ℂ', desc: 'Дії з комплексними числами a + bi, модуль, аргумент', icon: '⚛️', cat: 'Інструменти', action: () => openModal('complex-calc-modal') },
    { id: 'math-ref', title: 'Математичний довідник', desc: 'Формули тригонометрії, алгебри, похідних', icon: '📖', cat: 'Довідка', action: () => openModal('math-ref-modal') },
    { id: 'trig-circle', title: 'Тригонометричне коло', desc: 'Одиничне коло, sin, cos, tan, радіани', icon: '⭕', cat: 'Інструменти', action: () => openModal('trig-circle-modal') },
    { id: 'constants', title: 'База констант 40+', desc: 'Фундаментальні фізичні та математичні константи', icon: '⚛️', cat: 'База даних', action: () => openModal('constants-search-modal') },
    { id: 'formulas', title: 'Фізичний формулатор', desc: 'Закон Ома, кінетична енергія, гравітація, гази', icon: '⚡', cat: 'Інструменти', action: () => openModal('formula-solver-modal') },
    { id: 'triangles', title: 'Розв\'язувач трикутників 2D', desc: 'Сторони, кути, площа, периметр (SSS, SAS, ASA)', icon: '📐', cat: 'Геометрія', action: () => openModal('triangle-solver-modal') },
    { id: 'quad', title: 'Квадратні рівняння', desc: 'ax² + bx + c = 0, дискримінант D, корені x₁, x₂', icon: '📐', cat: 'Алгебра', action: () => openModal('quadratic-modal') },
    { id: 'matrix', title: 'Матриці 2x2 та 3x3', desc: 'Детермінант, додавання, множення, транспонування', icon: '🧮', cat: 'Алгебра', action: () => openModal('matrix-modal') },
    { id: 'prime-gcd', title: 'НСД / НСК / Прості множники', desc: 'Розклад на множники та дільники чисел', icon: '🔢', cat: 'Алгебра', action: () => openModal('prime-gcd-modal') },
    { id: 'func-eval', title: 'Обчислювач функцій f(x)', desc: 'Таблиця значень функції на діапазоні', icon: '📈', cat: 'Алгебра', action: () => openModal('func-eval-modal') },
    { id: 'graph', title: '2D Графік функцій', desc: 'Візуалізація sin(x), cos(x), x², x³', icon: '📈', cat: 'Графіка', action: () => openModal('graph-modal') },
    { id: 'stats', title: 'Статистичний аналіз', desc: 'Середнє, медіана, дисперсія, розмах', icon: '📊', cat: 'Статистика', action: () => openModal('stats-modal') },
    { id: 'percent', title: 'Відсотки Pro & Маржа', desc: 'Знижки, націнки, ПДВ, приріст', icon: '📊', cat: 'Фінанси', action: () => openModal('percent-modal') },
    { id: 'loan', title: 'Кредит & Іпотека', desc: 'Ануїтетний графік виплат та переплата', icon: '🏦', cat: 'Фінанси', action: () => openModal('loan-calc-modal') },
    { id: 'currency', title: 'Конвертер валют & Крипта', desc: 'UAH, USD, EUR, GBP, BTC, ETH, SOL', icon: '💱', cat: 'Фінанси', action: () => openModal('currency-modal') },
    { id: 'deal', title: 'Порівняння вигідності цін', desc: 'Ціна за 1 кг / 1 л для розумних покупок', icon: '⚖️', cat: 'Фінанси', action: () => openModal('deal-calc-modal') },
    { id: 'finance', title: 'Чайові, податки, знижки', desc: 'Розрахунок чеку на компанію', icon: '💰', cat: 'Фінанси', action: () => openModal('finance-modal') },
    { id: 'converter', title: 'Конвертер величин', desc: 'Довжина, маса, температура, швидкість, час', icon: '🔄', cat: 'Конвертери', action: () => openModal('converter-modal') },
    { id: 'programmer', title: 'Програмістський режим', desc: 'HEX, DEC, OCT, BIN конвертер та бітові операції', icon: '💻', cat: 'Програмування', action: () => openModal('programmer-modal') },
    { id: 'bitmask', title: 'Бітовий інспектор 64-bit', desc: 'Візуальні прапорці бітів та маски', icon: '👾', cat: 'Програмування', action: () => openModal('bitmask-modal') },
    { id: 'memory', title: 'Матриця пам\'яті M1–M4', desc: 'Слоти збереження та відновлення чисел', icon: '🗄️', cat: 'Пам\'ять', action: () => openModal('memory-modal') },
    { id: 'bookmarks', title: 'Блокнот виразів', desc: 'Збереження важливих формул та результатів', icon: '🔖', cat: 'Пам\'ять', action: () => openModal('bookmarks-modal') },
    { id: 'tape', title: 'Стрічка розрахунків (Чек)', desc: 'Історія дій з можливістю додавання нотаток', icon: '📜', cat: 'Пам\'ять', action: () => openModal('tape-modal') },
    { id: 'date', title: 'Калькулятор дат & часу', desc: 'Різниця між датами, додавання днів', icon: '📅', cat: 'Утиліти', action: () => openModal('date-modal') },
    { id: 'rng', title: 'Генератор чисел & Кубики', desc: 'Випадкові числа, кидок d6/d20, монета', icon: '🎲', cat: 'Утиліти', action: () => openModal('rng-modal') },
    { id: 'history', title: 'Історія розрахунків', desc: 'Перегляд та експорт журналу операцій', icon: '🕒', cat: 'Історія', action: () => openModal('history-modal') },
    { id: 'settings', title: 'Центр налаштувань', desc: 'Точність, звук, розділювачі, скло', icon: '⚙️', cat: 'Система', action: () => openModal('settings-modal') },
    { id: 'advisor', title: 'Математичний порадник', desc: 'Довідка щодо заборонених математичних дій', icon: '🧠', cat: 'Довідка', action: () => openModal('advisor-modal') },
    { id: 'shortcuts', title: 'Гарячі клавіші (F1 / ?)', desc: 'Список всіх клавіатурних скорочень', icon: '⌨️', cat: 'Довідка', action: () => openModal('shortcuts-modal') },
    { id: 'about', title: 'Про Calculator Pro', desc: 'Інформація про реліз v1.8.6 та автора', icon: 'ℹ️', cat: 'Система', action: () => openModal('about-modal') },

    // Стилі та дизайн
    { id: 'theme-bordeaux', title: 'Тема: Bordeaux Luxury', desc: 'Флагманська бордова палітра Redstone 4.0', icon: '🍷', cat: 'Теми', action: () => setTheme('bordeaux_luxury') },
    { id: 'theme-titanium-ruby', title: 'Тема: Titanium Ruby Master', desc: 'Темний титан з рубіновим неоном', icon: '💎', cat: 'Теми', action: () => setTheme('titanium_ruby_master') },
    { id: 'theme-crimson', title: 'Тема: Crimson Supernova', desc: 'Яскравий малиново-червоний градієнт', icon: '✨', cat: 'Теми', action: () => setTheme('crimson_supernova') },
    { id: 'theme-cyberpunk', title: 'Тема: Cyberpunk Neon Bordeaux', desc: 'Неоновий кіберпанк бордо', icon: '🌆', cat: 'Теми', action: () => setTheme('cyberpunk_neon') },
    { id: 'theme-emerald', title: 'Тема: Emerald Platinum', desc: 'Смарагдовий з платиновими акцентами', icon: '❇️', cat: 'Теми', action: () => setTheme('emerald_platinum') },
    { id: 'theme-midnight', title: 'Тема: Midnight OLED', desc: 'Глибокий чорний OLED для заощадження енергії', icon: '🌑', cat: 'Теми', action: () => setTheme('midnight_oled') },
    { id: 'theme-matrix', title: 'Тема: Cyber Matrix', desc: 'Зелений кібер-стиль Matrix', icon: '🟩', cat: 'Теми', action: () => setTheme('matrix_cyber') },

    // Шпалери
    { id: 'wp-titanium-ruby', title: 'Шпалери: Titanium Ruby', desc: 'HD Титаново-рубіновий кристал', icon: '🖼️', cat: 'Шпалери', action: () => setWallpaper('titanium_ruby') },
    { id: 'wp-crimson', title: 'Шпалери: Crimson Supernova', desc: 'HD Космічна малинова наднова', icon: '🖼️', cat: 'Шпалери', action: () => setWallpaper('crimson_supernova') },
    { id: 'wp-cyberpunk', title: 'Шпалери: Cyberpunk Bordeaux', desc: 'HD Неонове нічне місто бордо', icon: '🖼️', cat: 'Шпалери', action: () => setWallpaper('cyberpunk_bordeaux') },
    { id: 'wp-burgundy', title: 'Шпалери: Burgundy Velvet', desc: 'HD Бордовий шовковий оксамит', icon: '🖼️', cat: 'Шпалери', action: () => setWallpaper('burgundy') },
    { id: 'wp-particles', title: 'Шпалери: Неоновий пил', desc: 'Динамічні частинки Aurora', icon: '✨', cat: 'Шпалери', action: () => setWallpaper('particles') },

    // Дії
    { id: 'act-voice', title: 'Озвучити результат голосом', desc: 'Синтез мови для поточного числа', icon: '🗣️', cat: 'Дії', action: () => speakCurrentResult() },
    { id: 'act-copy', title: 'Скопіювати число в буфер', desc: 'Ctrl + C', icon: '📋', cat: 'Дії', action: () => copyToClipboard() },
    { id: 'act-fullscreen', title: 'Повноекранний режим', desc: 'F11 / Focus Mode', icon: '⛶', cat: 'Дії', action: () => toggleFullScreen() },
    { id: 'act-clear', title: 'Очистити все', desc: 'Скинути дисплей калькулятора (C)', icon: '🗑️', cat: 'Дії', action: () => clearDisplay() }
];

let selectedCommandIndex = 0;
let filteredCommandItems = [];

function openCommandPalette() {
    audio.playAction();
    openModal('command-palette-modal');
    const input = document.getElementById('command-search-input');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 80);
    }
    filterCommandPalette('');
}

function filterCommandPalette(query) {
    const listEl = document.getElementById('command-results-list');
    if (!listEl) return;

    const q = (query || '').toLowerCase().trim();
    filteredCommandItems = commandPaletteItems.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.cat.toLowerCase().includes(q)
    );

    selectedCommandIndex = 0;
    renderCommandPaletteList();
}

function renderCommandPaletteList() {
    const listEl = document.getElementById('command-results-list');
    if (!listEl) return;

    if (filteredCommandItems.length === 0) {
        listEl.innerHTML = `
            <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.88rem;">
                🔍 Нічого не знайдено за вашим запитом.<br>
                <small style="opacity:0.7;">Спробуйте: "вектор", "тема", "графік", "шрифт"</small>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filteredCommandItems.map((item, idx) => `
        <div class="command-item ${idx === selectedCommandIndex ? 'selected' : ''}" onclick="executeCommandPaletteItem(${idx})" onmouseenter="selectCommandIndex(${idx})">
            <span class="command-item-icon">${item.icon}</span>
            <div class="command-item-info">
                <div class="command-item-title">${item.title}</div>
                <div class="command-item-desc">${item.desc}</div>
            </div>
            <span class="command-item-category">${item.cat}</span>
        </div>
    `).join('');
}

function selectCommandIndex(idx) {
    selectedCommandIndex = idx;
    const items = document.querySelectorAll('.command-item');
    items.forEach((el, i) => {
        el.classList.toggle('selected', i === idx);
    });
}

function scrollSelectedCommandIntoView() {
    const items = document.querySelectorAll('.command-item');
    if (items[selectedCommandIndex]) {
        items[selectedCommandIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function executeCommandPaletteItem(idx) {
    const item = filteredCommandItems[idx];
    if (item && item.action) {
        closeModal('command-palette-modal');
        setTimeout(() => item.action(), 120);
    }
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

    // Масштаб шрифту (Font Scale)
    setFontScale(state.fontScale, true);

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
    renderTapeRoll();
    renderBookmarks();
    updateMemorySlotsUI();

    // Запуск фонових частинок Canvas
    if (state.particlesEnabled) {
        initParticlesCanvas();
    }

    // Безпечне розблокування AudioContext при першому натисканні
    window.addEventListener('pointerdown', () => {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => { });
        }
    }, { once: true });

    console.log('%c 🛡️ Calculator Pro v1.8.6 (Build 204) Redstone 4.0 Bordeaux Titanium Ultra Loaded %c',
        'background: linear-gradient(90deg, #e11d48, #8b1538, #f43f5e); color: #fff; font-weight: bold; font-size: 13px; padding: 6px 14px; border-radius: 8px;',
        '');
});
