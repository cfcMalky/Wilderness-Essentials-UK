const SHEET_ID = "1w6NcZ9OPhjLcZtgK98ypsxM9eV13NLT9hOf4AVe5HR4";
const API_KEY = "AIzaSyABNGnLmTXlik5fgBe_ooBI1Y5nrXKTePY";
const RANGE = "Sheet1";
let allProducts = [];
let categoryMap = {};
let currentMainCat = '';
let currentSubCat = '';

async function fetchProducts() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.values) {
            throw new Error(data.error ? data.error.message : 'No data returned');
        }

        const [headers, ...rows] = data.values;
        allProducts = rows.map(row => {
            const p = {};
            headers.forEach((h, i) => p[h] = row[i] || "");
            let [main, sub] = (p.category || '').split('>').map(x => x.trim());
            p.mainCat = main || '';
            p.subCat = sub || '';
            return p;
        });
        buildCategoryMap();
        populateMainCatDropdown();
        renderProducts();
    } catch (err) {
        document.getElementById('productsGrid').innerHTML = `<div style="color:red;text-align:center;">Failed to load products: ${err.message}</div>`;
        console.error(err);
    }

function buildCategoryMap() {
    categoryMap = {};
    allProducts.forEach(p => {
        if (!p.mainCat) return;
        if (!categoryMap[p.mainCat]) categoryMap[p.mainCat] = new Set();
        if (p.subCat) categoryMap[p.mainCat].add(p.subCat);
    });
    // Convert sets to arrays
    for (let main in categoryMap) {
        categoryMap[main] = Array.from(categoryMap[main]);
    }
}

function populateMainCatDropdown() {
    const mainCatBtn = document.getElementById('mainCatBtn');
    const mainCatDropdown = document.getElementById('mainCatDropdown');
    // Main button shows current or first
    const mainCategories = Object.keys(categoryMap);
    currentMainCat = currentMainCat || mainCategories[0];
    mainCatBtn.textContent = currentMainCat + ' ▼';
    // Build subcategory buttons
    mainCatDropdown.innerHTML = '';
    (categoryMap[currentMainCat] || []).forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'category-btn subcat-btn';
        btn.textContent = sub;
        btn.onclick = () => {
            currentSubCat = sub;
            renderProducts();
        };
        mainCatDropdown.appendChild(btn);
    });
    // Set first subcat if not set
    if (!currentSubCat || !categoryMap[currentMainCat].includes(currentSubCat)) {
        currentSubCat = categoryMap[currentMainCat][0];
    }
}

function setupDropdownNav() {
    const mainCatBtn = document.getElementById('mainCatBtn');
    const mainCatDropdown = document.getElementById('mainCatDropdown');
    mainCatBtn.addEventListener('click', () => {
        mainCatDropdown.style.display = mainCatDropdown.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
        if (!mainCatBtn.contains(e.target) && !mainCatDropdown.contains(e.target)) {
            mainCatDropdown.style.display = 'none';
        }
    });
    // Dynamically populate main categories
    mainCatBtn.onclick = () => {
        // Build main category dropdown
        const mainCategories = Object.keys(categoryMap);
        const menu = document.createElement('div');
        menu.style.position = 'absolute';
        menu.style.top = '110%';
        menu.style.left = '0';
        menu.style.background = '#fff';
        menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        menu.style.borderRadius = '8px';
        menu.style.zIndex = 21;
        menu.innerHTML = '';
        mainCategories.forEach(main => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = main;
            btn.onclick = (ev) => {
                currentMainCat = main;
                mainCatBtn.textContent = main + ' ▼';
                mainCatDropdown.style.display = 'block';
                populateMainCatDropdown();
                renderProducts();
                menu.remove();
                ev.stopPropagation();
            };
            menu.appendChild(btn);
        });
        mainCatBtn.parentNode.appendChild(menu);
        document.addEventListener('click', () => menu.remove(), { once: true });
    };
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    let filtered = allProducts.filter(p =>
        p.mainCat === currentMainCat && p.subCat === currentSubCat
    );
    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img class="product-image" src="${p.image_url || 'https://via.placeholder.com/300x220?text=No+Image'}" alt="${p.name}">
            <div class="product-info">
                <div class="product-title">${p.name}</div>
                <div class="product-desc">${p.description || ''}</div>
                <a class="more-info-btn" href="${p.amazon_link}" target="_blank" rel="noopener">More Info</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// On page load
fetchProducts();
setupDropdownNav();
