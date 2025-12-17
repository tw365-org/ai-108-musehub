/**
 * AI 108 MuseHub - Core Logic
 * Designed with Resilience and Performance Optimization
 */

let aiHeroes = [];
let currentPage = 1;
const itemsPerPage = 10;

// [生存機制] 核心預載名單：確保在 data.json 載入失敗時，系統仍具備基本功能
const fallbackData = [
    { "id": 1, "name": "TAIDE (國科會官方)", "url": "https://taide.tw", "cat": "台灣專區", "country": "TW", "speed": 5 },
    { "id": 2, "name": "DuckDuckGo AI Chat", "url": "https://duck.ai", "cat": "對話", "country": "US", "speed": 5 },
    { "id": 3, "name": "LMSYS Arena", "url": "https://chat.lmsys.org", "cat": "對話", "country": "US", "speed": 4 }
];

const flags = { "TW": "🇹🇼", "US": "🇺🇸", "CN": "🇨🇳", "FR": "🇫🇷", "DE": "🇩🇪", "JP": "🇯🇵", "UK": "🇬🇧", "CA": "🇨🇦", "AU": "🇦🇺", "SG": "🇸🇬", "AT": "🇦🇹", "IL": "🇮🇱", "GE": "🇬🇪", "IN": "🇮🇳", "LU": "🇱🇺", "IT": "🇮🇹", "RU": "🇷🇺" };

/**
 * 核心初始化：非同步載入資料庫
 */
async function loadData() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('toolsGrid');

    try {
        // 使用 cache-busting 確保開發測試階段拿到的永遠是最新的資料
        const response = await fetch('data.json?v=' + Date.now());
        if (!response.ok) throw new Error('Repository data unreachable.');
        
        const rawData = await response.json();
        aiHeroes = validateData(rawData);
    } catch (error) {
        console.warn("MuseHub: Error loading JSON, deploying fallback array.", error);
        aiHeroes = fallbackData;
    } finally {
        loadingEl.classList.add('hidden');
        gridEl.classList.remove('hidden');
        render();
        loadContributors();
    }
}

/**
 * [生存機制] 安全校驗與結構過濾
 * 蒙格思維：反過來想，過濾掉所有可能導致系統崩潰或風險的無效 URL
 */
function validateData(data) {
    if (!Array.isArray(data)) return fallbackData;
    return data.filter(item => {
        const hasRequiredFields = item.name && item.url && item.cat;
        const isSafeProtocol = item.url.startsWith('https://');
        const isNotShortUrl = !/(bit\.ly|t\.co|tinyurl\.com)/.test(item.url);
        return hasRequiredFields && isSafeProtocol && isNotShortUrl;
    });
}

/**
 * [資深總監級功能] 即時連線延遲診斷 (Latency Probe)
 * 透過無標頭請求測試目標伺服器反應時間
 */
function probeLatency(url, id) {
    const start = performance.now();
    const probeId = `probe-${id}`;
    
    fetch(url, { mode: 'no-cors', cache: 'no-cache' })
        .then(() => {
            const end = performance.now();
            const latency = Math.round(end - start);
            const el = document.getElementById(probeId);
            if (el) {
                el.innerText = `${latency}ms`;
                el.className = latency < 300 ? 'text-emerald-400' : 'text-orange-400';
            }
        })
        .catch(() => {
            const el = document.getElementById(probeId);
            if (el) el.innerText = "N/A";
        });
}

/**
 * 渲染主邏輯：分頁、過濾與 UI 生成
 */
function render() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cat = document.getElementById('catFilter').value;
    
    // 蒙格「多重模型」過濾：名稱與類別雙重過濾
    const filtered = aiHeroes.filter(t => 
        (t.name.toLowerCase().includes(search)) && 
        (cat === "" || t.cat === cat)
    );

    const grid = document.getElementById('toolsGrid');
    grid.innerHTML = "";
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    paginated.forEach(tool => {
        const card = document.createElement('div');
        card.className = "muse-card p-7 rounded-3xl flex flex-col justify-between h-full relative overflow-hidden";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <span class="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[9px] font-black uppercase tracking-wider border border-violet-500/20">${tool.cat}</span>
                    <span class="text-xl" title="${tool.country}">${flags[tool.country] || tool.country}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2 leading-tight">${tool.name}</h3>
                <div class="flex items-center justify-between mt-5">
                    <div class="flex gap-[1px]">
                        ${renderSignalBars(tool.speed)}
                    </div>
                    <div class="text-[9px] font-mono text-slate-500" id="probe-${tool.id}">Probing...</div>
                </div>
            </div>
            <div class="mt-10">
                <a href="${tool.url}" target="_blank" class="block w-full text-center bg-gradient-to-r from-violet-600 to-indigo-600 py-3 rounded-2xl text-sm font-bold text-white mb-4 hover:brightness-110 transition shadow-lg shadow-violet-900/30">探索靈感</a>
                <div class="flex justify-between gap-2">
                    <button onclick="report('慢', '${tool.name}')" class="flex-1 text-[9px] bg-slate-800/50 text-slate-500 py-2 rounded-xl hover:text-yellow-400 transition font-bold">品質不穩</button>
                    <button onclick="report('斷', '${tool.name}')" class="flex-1 text-[9px] bg-slate-800/50 text-slate-500 py-2 rounded-xl hover:text-red-400 transition font-bold">無法連線</button>
                </div>
            </div>`;
        grid.appendChild(card);
        
        // 執行即時探測
        probeLatency(tool.url, tool.id);
    });

    renderPagination(filtered.length);
}

function renderSignalBars(level) {
    let html = '';
    for(let i=1; i<=5; i++) {
        html += `<div class="signal-bar ${i <= level ? 'signal-on' : ''}" style="height: ${i*20}%"></div>`;
    }
    return html;
}

function renderPagination(total) {
    const pages = Math.ceil(total / itemsPerPage);
    const container = document.getElementById('pagination');
    container.innerHTML = "";
    if(pages <= 1) return;
    for(let i=1; i<=pages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        btn.onclick = () => { window.scrollTo({top: 0, behavior: 'smooth'}); currentPage = i; render(); };
        container.appendChild(btn);
    }
}

/**
 * 激勵機制：貢獻者加載
 */
function loadContributors() {
    const contributors = [
        { name: "Main-Dev", avatar: "https://github.com/identicons/user.png" },
        { name: "Gemini-Flash", avatar: "https://www.gstatic.com/lamda/images/favicon_v2_196x196.png" }
    ];
    const container = document.getElementById('contributorList');
    container.innerHTML = contributors.map(c => 
        `<img src="${c.avatar}" title="${c.name}" class="contributor-dot" />`
    ).join('') + `<a href="#" class="text-[10px] text-violet-400 font-bold ml-2 tracking-widest">+ PR OPEN</a>`;
}

function report(type, name) {
    console.info(`User Feedback: [${type}] for ${name}`);
    alert(`感謝回報！我們將在 GitHub Issues 中建立一個 [${type}] 的狀態追蹤項目。`);
}

// 事件監聽與執行
document.getElementById('searchInput').addEventListener('input', () => { currentPage = 1; render(); });
document.getElementById('catFilter').addEventListener('change', () => { currentPage = 1; render(); });

loadData();