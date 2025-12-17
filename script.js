/**
 * AI 108 MuseHub - Debugged Survival Script
 */
let aiHeroes = [];
let currentPage = 1;
const itemsPerPage = 10;

// 備份名單：確保萬一 JSON 壞掉，首頁也不會空掉
const fallbackData = [
    { "id": 1, "name": "LMSYS (龍頭模型競技場)", "url": "https://lmarena.ai/zh", "cat": "對話", "country": "US", "speed": 4 },
    { "id": 2, "name": "DuckDuckGo AI", "url": "https://duck.ai", "cat": "對話", "country": "US", "speed": 5 }
];

async function loadData() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('toolsGrid');

    try {
        const response = await fetch('data.json?v=' + Date.now());
        if (!response.ok) throw new Error('File not found');
        const rawData = await response.json();
        aiHeroes = rawData;
    } catch (error) {
        console.error("Critical Error: JSON loading failed.", error);
        aiHeroes = fallbackData; // 發生錯誤時使用備份資料
    } finally {
        // [重點] 無論成功或失敗，都強制隱藏轉圈圈
        if (loadingEl) loadingEl.style.display = 'none';
        if (gridEl) gridEl.classList.remove('hidden');
        render();
        loadContributors();
    }
}

function render() {
    const grid = document.getElementById('toolsGrid');
    if (!grid) return;
    grid.innerHTML = "";
    
    // 確保只渲染有資料的部分
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = aiHeroes.slice(start, start + itemsPerPage);

    paginated.forEach(tool => {
        const card = document.createElement('div');
        card.className = "muse-card p-7 rounded-3xl flex flex-col justify-between h-full relative overflow-hidden";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6 text-xs font-bold">
                    <span class="text-violet-400 opacity-70">${tool.cat}</span>
                    <span class="text-slate-500">${tool.country}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-4">${tool.name}</h3>
            </div>
            <div class="mt-auto">
                <a href="${tool.url}" target="_blank" class="block w-full text-center bg-violet-600 py-3 rounded-2xl text-sm font-bold text-white">探索靈感</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function loadContributors() {
    const container = document.getElementById('contributorList');
    if (container) container.innerHTML = `<span class="text-slate-500 text-xs">Community Powered</span>`;
}

loadData();