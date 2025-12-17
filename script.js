let aiHeroes = [];
let currentPage = 1;
const itemsPerPage = 10;

// 蒙格生存機制：預載核心資料 (萬一 JSON 壞掉，這幾個仍能運作)
const fallbackData = [
    { "id": 1, "name": "TAIDE (國科會)", "url": "https://taide.tw", "cat": "台灣專區", "country": "TW", "speed": 5 },
    { "id": 2, "name": "DuckDuckGo AI", "url": "https://duck.ai", "cat": "對話", "country": "US", "speed": 5 },
    { "id": 3, "name": "LMSYS Arena", "url": "https://chat.lmsys.org", "cat": "對話", "country": "US", "speed": 4 }
];

const flags = { "TW": "🇹🇼", "US": "🇺🇸", "CN": "🇨🇳", "FR": "🇫🇷", "DE": "🇩🇪", "JP": "🇯🇵", "UK": "🇬🇧", "CA": "🇨🇦", "AU": "🇦🇺", "SG": "🇸🇬", "AT": "🇦🇹", "IL": "🇮🇱", "GE": "🇬🇪", "IN": "🇮🇳", "LU": "🇱🇺", "IT": "🇮🇹", "RU": "🇷🇺" };

// 生存機制：安全過濾
function validateData(data) {
    return data.filter(item => {
        const isSafe = !item.url.includes("bit.ly") && !item.url.includes("t.co");
        return isSafe && item.name && item.url;
    });
}

async function loadData() {
    try {
        const response = await fetch('data.json?v=' + Date.now());
        if (!response.ok) throw new Error('Network error');
        const rawData = await response.json();
        aiHeroes = validateData(rawData);
    } catch (error) {
        console.warn("Using fallback data due to load error.");
        aiHeroes = fallbackData;
    } finally {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('toolsGrid').classList.remove('hidden');
        render();
        loadContributors(); // 異步載入貢獻者
    }
}

// 模擬 GitHub Contributors 載入 (實作時可換成 GitHub API)
function loadContributors() {
    const contributors = [
        { name: "You", avatar: "https://github.com/identicons/user.png" },
        { name: "Gemini", avatar: "https://www.gstatic.com/lamda/images/favicon_v2_196x196.png" }
    ];
    const container = document.getElementById('contributorList');
    container.innerHTML = contributors.map(c => 
        `<img src="${c.avatar}" title="${c.name}" class="contributor-dot" />`
    ).join('') + `<a href="https://github.com/你的帳號/ai-108-musehub" target="_blank" class="text-xs text-violet-400 hover:underline">+ 加入維護</a>`;
}

function renderSignal(level) {
    let html = '<div class="flex items-end h-3 gap-[1px]">';
    for(let i=1; i<=5; i++) {
        html += `<div class="signal-bar ${i <= level ? 'signal-on' : ''}" style="height: ${i*20}%"></div>`;
    }
    return html + '</div>';
}

function report(type, name) {
    const url = `https://github.com/你的帳號/ai-108-musehub/issues/new?title=[${type}] ${name}`;
    window.open(url, '_blank');
}

function render() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cat = document.getElementById('catFilter').value;
    const filtered = aiHeroes.filter(t => (t.name.toLowerCase().includes(search)) && (cat === "" || t.cat === cat));
    const grid = document.getElementById('toolsGrid');
    grid.innerHTML = "";
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    paginated.forEach(tool => {
        const card = document.createElement('div');
        card.className = "muse-card p-7 rounded-3xl flex flex-col justify-between h-full relative";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <span class="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[9px] font-black tracking-wider border border-violet-500/20">${tool.cat}</span>
                    <span class="text-xl" title="${tool.country}">${flags[tool.country] || tool.country}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2 leading-tight">${tool.name}</h3>
                <div class="flex items-center gap-3 mt-5">${renderSignal(tool.speed)} <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Connect</span></div>
            </div>
            <div class="mt-10">
                <a href="${tool.url}" target="_blank" class="block w-full text-center bg-gradient-to-r from-violet-600 to-indigo-600 py-3 rounded-2xl text-sm font-bold text-white mb-4 shadow-lg shadow-violet-900/30 transition hover:opacity-90">探索靈感</a>
                <div class="flex justify-between gap-1">
                    <button onclick="report('慢', '${tool.name}')" class="flex-1 text-[9px] bg-slate-800/50 text-slate-500 py-2 rounded-xl hover:text-yellow-400 transition">慢</button>
                    <button onclick="report('斷', '${tool.name}')" class="flex-1 text-[9px] bg-slate-800/50 text-slate-500 py-2 rounded-xl hover:text-red-400 transition">斷</button>
                    <button onclick="report('卡', '${tool.name}')" class="flex-1 text-[9px] bg-slate-800/50 text-slate-500 py-2 rounded-xl hover:text-orange-400 transition">卡</button>
                </div>
            </div>`;
        grid.appendChild(card);
    });
    renderPagination(filtered.length);
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

document.getElementById('searchInput').addEventListener('input', () => { currentPage = 1; render(); });
document.getElementById('catFilter').addEventListener('change', () => { currentPage = 1; render(); });
loadData();