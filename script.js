/**
 * AI 108 MuseHub - Survival Script v1.1
 */
let aiHeroes = [];
let currentPage = 1;
const itemsPerPage = 10;

async function loadData() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('toolsGrid');

    try {
        const response = await fetch('data.json?v=' + Date.now());
        if (!response.ok) throw new Error('Data load failed');
        aiHeroes = await response.json();
    } catch (error) {
        console.error("Critical: Fallback data used.", error);
        aiHeroes = [{ "id": 1, "name": "LMSYS (鏡像)", "url": "https://lmarena.ai/zh", "cat": "對話", "country": "US", "speed": 4 }];
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
        if (gridEl) gridEl.classList.remove('hidden');
        render();
    }
}

function render() {
    const grid = document.getElementById('toolsGrid');
    if (!grid) return;
    grid.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = aiHeroes.slice(start, start + itemsPerPage);

    paginated.forEach(tool => {
        const card = document.createElement('div');
        card.className = "muse-card p-7 rounded-3xl flex flex-col justify-between h-full border border-slate-800 bg-slate-900/40";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6 text-[10px] font-bold text-violet-400">
                    <span>${tool.cat}</span>
                    <span class="text-slate-500">${tool.country}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-4 leading-tight">${tool.name}</h3>
            </div>
            <div class="mt-auto">
                <a href="${tool.url}" target="_blank" class="block w-full text-center bg-violet-600 hover:bg-violet-500 py-3 rounded-2xl text-sm font-bold text-white transition">探索靈感</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// [修正重點] 加入元素存在檢查，防止 image_a11da7.jpg 中的錯誤
const sInput = document.getElementById('searchInput');
const cFilter = document.getElementById('catFilter');

if (sInput) sInput.addEventListener('input', () => { currentPage = 1; render(); });
if (cFilter) cFilter.addEventListener('change', () => { currentPage = 1; render(); });

loadData();