class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getColor(number);

        this.shadowRoot.innerHTML = `
            <style>
                .ball {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: white;
                    background-color: ${color};
                    box-shadow: inset -5px -5px 10px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.5);
                    text-shadow: 0 0 5px rgba(255,255,255,0.5);
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }

    getColor(number) {
        const hue = (parseInt(number) - 1) * 8;
        return `hsl(${hue}, 80%, 50%)`;
    }
}
customElements.define('lotto-ball', LottoBall);

// --- DOM Elements ---
const lottoDisplay = document.querySelector('.lotto-display');
const generateBtn = document.querySelector('.generate-btn');
const clearBtn = document.querySelector('.clear-btn');
const toggleBtn = document.querySelector('.toggle-btn');
const numberGrid = document.querySelector('.number-grid');
const tmStartBtn = document.querySelector('.tm-start-btn');
const tmStatus = document.getElementById('tm-status');
const tmWebcamContainer = document.getElementById('webcam-container');
const tmLabelContainer = document.getElementById('label-container');

// --- State ---
let selectedNumbers = new Set();

// --- Functions ---
function createNumberGrid() {
    for (let i = 1; i <= 45; i++) {
        const numberEl = document.createElement('div');
        numberEl.classList.add('grid-number');
        numberEl.textContent = i;
        numberEl.dataset.number = i;
        numberGrid.appendChild(numberEl);
    }
}

function handleGridClick(e) {
    if (e.target.classList.contains('grid-number')) {
        const number = parseInt(e.target.dataset.number);
        if (selectedNumbers.has(number)) {
            selectedNumbers.delete(number);
            e.target.classList.remove('selected');
        } else {
            if (selectedNumbers.size < 6) {
                selectedNumbers.add(number);
                e.target.classList.add('selected');
            }
        }
    }
}

function generateLottoNumbers() {
    generateBtn.disabled = true;
    clearBtn.disabled = true;
    lottoDisplay.innerHTML = '';

    const finalNumbers = new Set(selectedNumbers);

    while (finalNumbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        finalNumbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(finalNumbers).sort((a,b) => a-b);

    sortedNumbers.forEach((number, index) => {
        setTimeout(() => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            lottoDisplay.appendChild(lottoBall);
        }, index * 200);
    });
    
    setTimeout(() => {
        generateBtn.disabled = false;
        clearBtn.disabled = false;
    }, sortedNumbers.length * 200);
}

function clearAll() {
    selectedNumbers.clear();
    lottoDisplay.innerHTML = '';
    document.querySelectorAll('.grid-number.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

// --- Teachable Machine (Rock/Paper/Scissors) ---
const TM_MODEL_URL = "YOUR_TEACHABLE_MACHINE_MODEL_URL/";
let tmModel = null;
let tmWebcam = null;
let tmMaxPredictions = 0;
let tmRunning = false;

async function tmInit() {
    if (!tmStartBtn || !tmStatus || !tmWebcamContainer || !tmLabelContainer) return;
    if (tmRunning) return;
    if (TM_MODEL_URL === "YOUR_TEACHABLE_MACHINE_MODEL_URL/") {
        tmStatus.textContent = "Set your Teachable Machine model URL first.";
        return;
    }
    if (!window.tmImage) {
        tmStatus.textContent = "Teachable Machine library not loaded.";
        return;
    }
    try {
        tmRunning = true;
        tmStatus.textContent = "Loading model...";
        const modelURL = TM_MODEL_URL + "model.json";
        const metadataURL = TM_MODEL_URL + "metadata.json";
        tmModel = await window.tmImage.load(modelURL, metadataURL);
        tmMaxPredictions = tmModel.getTotalClasses();
        tmWebcam = new window.tmImage.Webcam(260, 260, true);
        tmStatus.textContent = "Requesting camera...";
        await tmWebcam.setup();
        await tmWebcam.play();
        tmWebcamContainer.innerHTML = "";
        tmWebcamContainer.appendChild(tmWebcam.canvas);
        tmLabelContainer.innerHTML = "";
        for (let i = 0; i < tmMaxPredictions; i++) {
            tmLabelContainer.appendChild(document.createElement("div"));
        }
        tmStatus.textContent = "Running...";
        window.requestAnimationFrame(tmLoop);
    } catch (error) {
        tmRunning = false;
        tmStatus.textContent = "Unable to start webcam. Check permissions.";
        console.error(error);
    }
}

async function tmLoop() {
    if (!tmRunning || !tmWebcam || !tmModel) return;
    tmWebcam.update();
    await tmPredict();
    window.requestAnimationFrame(tmLoop);
}

async function tmPredict() {
    const prediction = await tmModel.predict(tmWebcam.canvas);
    for (let i = 0; i < tmMaxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        tmLabelContainer.childNodes[i].textContent = classPrediction;
    }
}

function setTheme(theme) {
    document.body.dataset.theme = theme;
    const isLight = theme === 'light';
    toggleBtn.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    toggleBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.body.dataset.theme || 'dark';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// --- Event Listeners ---
numberGrid.addEventListener('click', handleGridClick);
generateBtn.addEventListener('click', generateLottoNumbers);
clearBtn.addEventListener('click', clearAll);
toggleBtn.addEventListener('click', toggleTheme);
if (tmStartBtn) {
    tmStartBtn.addEventListener('click', tmInit);
}

// --- Initial Load ---
createNumberGrid();
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
}
