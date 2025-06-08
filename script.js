// --- CONFIG: Google Sheet API ---
const SHEET_ID = "1w6NcZ9OPhjLcZtgK98ypsxM9eV13NLT9hOf4AVe5HR4";
const API_KEY = "AIzaSyABNGnLmTXlik5fgBe_ooBI1Y5nrXKTePY";
const RANGE = "Sheet1";

let allProducts = [];
let navStructure = {};
let allMainCats = [];
let allSubCats = {};
let sheetReady = false;

// --- DATA LOAD ---
async function fetchProductsFromSheet() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();
  const [headers, ...rows] = data.values;
  allProducts = rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (row[i] || "").trim());
    const catPath = (obj.category || "").split(">").map(s => s.trim());
    obj.mainCat = catPath[0] || "";
    obj.subCat = catPath[1] || "";
    obj.catPath = obj.category || "";
    return obj;
  });
  buildNavStructure();
  sheetReady = true;
}

// --- NAV STRUCTURE ---
function buildNavStructure() {
  navStructure = {};
  allMainCats = [];
  allSubCats = {};
  for (const prod of allProducts) {
    if (!prod.mainCat) continue;
    if (!navStructure[prod.mainCat]) {
      navStructure[prod.mainCat] = [];
      allMainCats.push(prod.mainCat);
    }
    if (prod.subCat) {
      if (!navStructure[prod.mainCat].includes(prod.subCat)) navStructure[prod.mainCat].push(prod.subCat);
      if (!allSubCats[prod.subCat]) allSubCats[prod.subCat] = [];
      allSubCats[prod.subCat].push(prod);
    }
  }
}

// --- MAIN NAV ---
function buildMainNav() {
  const navMenu = document.getElementById("mainNavMenu");
  navMenu.innerHTML = "";
  allMainCats.forEach(mainCat => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = mainCat;
    btn.className = "main-nav-btn";
    btn.onclick = () => showSubcatTiles(mainCat);
    li.appendChild(btn);
    navMenu.appendChild(li);
  });
}

// --- SUBCATEGORY TILES (with image carousel) ---
function showSubcatTiles(mainCat, focusSubcat = null) {
  document.getElementById("subcatTilesSection").style.display = "";
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("searchResultsSection").style.display = "none";
  const subcatTiles = document.getElementById("subcatTilesSection");
  subcatTiles.innerHTML = "";
  let subcats = navStructure[mainCat] || [];
  subcats.forEach(subCat => {
    const tile = document.createElement("div");
    tile.className = "subcat-tile";
    // Get up to 5 images from products in this subcat
    let productsInSubcat = allProducts.filter(p => p.mainCat === mainCat && p.subCat === subCat && p.image_url);
    if (productsInSubcat.length === 0) productsInSubcat = allProducts.filter(p => p.mainCat === mainCat && p.image_url);
    const imgs = productsInSubcat.slice(0, 5).map(p => p.image_url);
    let carouselIndex = 0;
    // Main image
    const img = document.createElement("img");
    img.className = "tile-carousel-img";
    img.src = imgs[0] || "logo.jpg";
    img.alt = subCat;
    tile.appendChild(img);
    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "tile-overlay";
    const label = document.createElement("span");
    label.className = "tile-label";
    label.textContent = subCat;
    overlay.appendChild(label);
    tile.appendChild(overlay);
    // Carousel dots
    if (imgs.length > 1) {
      const controls = document.createElement("div");
      controls.className = "tile-carousel-controls";
      imgs.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.className = "tile-dot" + (i === 0 ? " active" : "");
        dot.onclick = (e) => {
          e.stopPropagation();
          carouselIndex = i;
          img.src = imgs[carouselIndex];
          controls.querySelectorAll(".tile-dot").forEach((d, j) => {
            d.classList.toggle("active", j === carouselIndex);
          });
        };
        controls.appendChild(dot);
      });
      tile.appendChild(controls);
      // Auto-cycle
      setInterval(() => {
        if (!document.body.contains(img)) return; // Prevent leaks
        carouselIndex = (carouselIndex + 1) % imgs.length;
        img.src = imgs[carouselIndex];
        controls.querySelectorAll(".tile-dot").forEach((d, j) => {
          d.classList.toggle("active", j === carouselIndex);
        });
      }, 3300 + Math.floor(Math.random() * 800));
    }
    tile.onclick = () => showProductsSection(mainCat, subCat);
    subcatTiles.appendChild(tile);
    if (focusSubcat && subCat === focusSubcat) tile.scrollIntoView({behavior:'smooth'});
  });
}

// --- PRODUCTS SECTION (with tabs if multiple subcats) ---
function showProductsSection(mainCat, subCat) {
  document.getElementById("subcatTilesSection").scrollIntoView({behavior:'smooth'});
  document.getElementById("productsSection").style.display = "";
  document.getElementById("searchResultsSection").style.display = "none";
  document.getElementById("subcatTilesSection").style.display = "none";
  document.getElementById("productsSectionTitle").textContent = `${mainCat} — ${subCat}`;
  let seoText = "";
  if (mainCat === "Camp Kitchen" && subCat === "Grills & Accessories") {
    seoText = "Discover our range of grills and accessories for perfect outdoor cooking, from compact BBQs to versatile grill tools. Everything you need for an unforgettable campfire meal!";
  }
  document.getElementById("categorySEOText").textContent = seoText;
  // Tabs
  const tabs = document.getElementById("productsTabs");
  tabs.innerHTML = "";
  let subcats = navStructure[mainCat] || [];
  subcats.forEach(sc => {
    const tab = document.createElement("button");
    tab.textContent = sc;
    tab.className = (sc === subCat) ? "active" : "";
    tab.onclick = () => showProductsSection(mainCat, sc);
    tabs.appendChild(tab);
  });
  // Products
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  const filtered = allProducts.filter(p => p.mainCat === mainCat && p.subCat === subCat);
  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #888;">No products found for this category.</div>`;
  } else {
    filtered.forEach(p => {
      grid.appendChild(makeProductCard(p));
    });
  }
  setTimeout(() => {
    document.getElementById("productsSection").scrollIntoView({behavior:'smooth'});
  }, 80);
}

// --- PRODUCT CARD RENDERING (with HTML description) ---
function makeProductCard(p) {
  const card = document.createElement("div");
  card.className = "product-card";
  if (p.image_url) {
    const img = document.createElement("img");
    img.className = "product-image";
    img.src = p.image_url;
    img.alt = p.name;
    card.appendChild(img);
  }
  if (/new/i.test(p.name)) {
    const badge = document.createElement("span");
    badge.className = "product-badge";
    badge.textContent = "NEW";
    card.appendChild(badge);
  }
  const details = document.createElement("div");
  details.className = "product-details";
  const title = document.createElement("div");
  title.className = "product-title";
  title.textContent = p.name;
  details.appendChild(title);
  const desc = document.createElement("div");
  desc.className = "product-desc";
  // Use innerHTML so you can use <b>, <i>, <br> in the description cell in the sheet
  desc.innerHTML = (p.description || "");
  details.appendChild(desc);
  if (p.amazon_link) {
    const btn = document.createElement("a");
    btn.className = "product-link";
    btn.href = p.amazon_link;
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.textContent = "More Details";
    details.appendChild(btn);
  }
  card.appendChild(details);
  return card;
}

// --- SEARCH FUNCTIONALITY ---
function searchProducts(query) {
  query = query.trim().toLowerCase();
  if (!query) return;
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("subcatTilesSection").style.display = "none";
  document.getElementById("searchResultsSection").style.display = "";
  const resultsGrid = document.getElementById("searchResultsGrid");
  resultsGrid.innerHTML = "";
  const results = allProducts.filter(p =>
    (p.name && p.name.toLowerCase().includes(query)) ||
    (p.description && p.description.toLowerCase().includes(query)) ||
    (p.mainCat && p.mainCat.toLowerCase().includes(query)) ||
    (p.subCat && p.subCat.toLowerCase().includes(query))
  );
  if (!results.length) {
    resultsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #888;">No products found for "${query}".</div>`;
  } else {
    results.forEach(p => {
      resultsGrid.appendChild(makeProductCard(p));
    });
  }
}

// --- SEARCH BAR EVENTS ---
document.addEventListener('DOMContentLoaded', async function () {
  await fetchProductsFromSheet();
  buildNavStructure();
  buildMainNav();
  if (allMainCats.length) showSubcatTiles(allMainCats[0]);
  document.getElementById("searchForm").onsubmit = function(e) {
    e.preventDefault();
    const q = document.getElementById("searchInput").value;
    if (q) searchProducts(q);
  };
  // Click logo returns to tiles
  const logo = document.querySelector('.banner-logo-main');
  if (logo) logo.onclick = () => showSubcatTiles(allMainCats[0]);
});
