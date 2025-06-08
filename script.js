// --- CONFIG: Google Sheet API ---
// Replace these values with your actual sheet and API key
const SHEET_ID = "YOUR_SHEET_ID";
const API_KEY = "YOUR_API_KEY";
const RANGE = "Sheet1";

// --- SEO INTROS FOR CATEGORIES (CURATED/NOT SOLD) ---
const seoIntros = {
  // Example: "Tents > Backpacking": "Backpacking tents are lightweight, packable, and designed to keep you dry in the British outdoors.",
  // Populate as needed for your shop.
};

let allProducts = [];
let navStructure = {};
let allMainCats = [];
let allSubCats = {};
let sheetReady = false;

// --- GUIDE NAV & LOADING ---
const guidesArr = [
  {
    file: "camping-checklist.html",
    title: "The Ultimate Camping Checklist for Beginners (UK Edition)",
    desc: "All the essentials you need for a safe, comfortable, and enjoyable trip—plus smart extras for British conditions."
  },
  {
    file: "choosing-tent.html",
    title: "How to Choose the Right Tent for UK Weather",
    desc: "How to pick a tent that keeps you dry and comfortable, whatever the British weather throws at you."
  },
  {
    file: "campfire-safety.html",
    title: "Campfire Safety & Leave No Trace Principles",
    desc: "Enjoy your campfire responsibly—laws, safety, and protecting nature while camping in the UK."
  },
  {
    file: "camp-cooking.html",
    title: "Backpacking Food Ideas & Camp Cooking Tips",
    desc: "Meal planning, lightweight food, and cooking strategies for wild campers and backpackers."
  },
  {
    file: "survival-gear.html",
    title: "Essential Survival Gear for UK Adventures",
    desc: "What to pack in your survival kit for safety and peace of mind on any adventure."
  },
  {
    file: "family-camping.html",
    title: "Family Camping: Tips for a Fun and Safe Trip with Kids",
    desc: "How to plan, what to pack, and making camping with children enjoyable and stress-free."
  },
  {
    file: "staying-dry.html",
    title: "Staying Dry: Clothing & Layering for Wet British Weather",
    desc: "The best clothing systems for staying comfortable in unpredictable UK weather."
  },
  {
    file: "wild-camping-uk.html",
    title: "Wild Camping in the UK: Law, Ethics, and Best Spots",
    desc: "Where you can wild camp legally, best practices, and top locations for a true wilderness experience."
  },
  {
    file: "sleeping-bags-mats.html",
    title: "Choosing and Using Sleeping Bags & Mats for UK Camping",
    desc: "How to pick sleeping bags and mats for British conditions, for restful sleep outdoors."
  }
];

// --- DATA LOAD ---
async function fetchProductsFromSheet() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const data = await resp.json();
    const [headers, ...rows] = data.values || [];
    allProducts = (rows || []).map(row => {
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
    buildMainNav();
    if (allMainCats.length) showSubcatTiles(allMainCats[0]);
  } catch (e) {
    console.error("Product data fetch failed:", e);
    // Optionally show user-friendly error
  }
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
  // Remove all except the Guides button (which is statically in HTML)
  if (!navMenu) return;
  Array.from(navMenu.querySelectorAll("li"))
    .filter(li => !li.querySelector("#guidesNavBtn"))
    .forEach(li => li.remove());

  allMainCats.forEach(mainCat => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = mainCat;
    btn.className = "main-nav-btn";
    btn.onclick = () => {
      showSubcatTiles(mainCat);
      hideGuidesSections();
    };
    li.appendChild(btn);
    // Insert before Guides
    const guidesLi = navMenu.querySelector("li > #guidesNavBtn")?.parentElement;
    navMenu.insertBefore(li, guidesLi || null);
  });
}

// --- SUBCATEGORY TILES (with image carousel) ---
function showSubcatTiles(mainCat, focusSubcat = null) {
  hideGuidesSections();
  document.getElementById("frontpageSEO").style.display = "none";
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
      setInterval(() => {
        if (!document.body.contains(img)) return;
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

// --- PRODUCTS SECTION ---
function showProductsSection(mainCat, subCat) {
  hideGuidesSections();
  document.getElementById("frontpageSEO").style.display = "none";
  document.getElementById("subcatTilesSection").scrollIntoView({behavior:'smooth'});
  document.getElementById("productsSection").style.display = "";
  document.getElementById("searchResultsSection").style.display = "none";
  document.getElementById("subcatTilesSection").style.display = "none";
  document.getElementById("productsSectionTitle").textContent = `${mainCat} — ${subCat}`;
  // --- SEO INTRO ---
  const catKey = `${mainCat} > ${subCat}`;
  const seoHtml = seoIntros[catKey] || "";
  document.getElementById("categorySEOText").innerHTML = seoHtml;
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

// --- PRODUCT CARD ---
function makeProductCard(p) {
  const card = document.createElement("div");
  card.className = "product-card";
  // Product image (left)
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
  hideGuidesSections();
  query = (query || "").trim().toLowerCase();
  if (!query) return;
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("subcatTilesSection").style.display = "none";
  document.getElementById("searchResultsSection").style.display = "";
  document.getElementById("frontpageSEO").style.display = "none";
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

// --- GUIDES LIBRARY SECTION ---
function showGuidesLibrary() {
  // Hide everything else
  document.getElementById("frontpageSEO").style.display = "none";
  document.getElementById("guideSection").style.display = "none";
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("subcatTilesSection").style.display = "none";
  document.getElementById("searchResultsSection").style.display = "none";
  document.getElementById("guidesLibrarySection").style.display = "";
  const guidesList = document.getElementById("guidesList");
  guidesList.innerHTML = "";
  guidesArr.forEach(guide => {
    const card = document.createElement("div");
    card.style = "margin-bottom:1.6em; padding:1em 1.1em; background:#f6f5ee; border-radius:8px; box-shadow:0 2px 10px #0001;";
    const title = document.createElement("a");
    title.href = "#";
    title.textContent = guide.title;
    title.style = "font-size:1.14em;font-weight:700;color:#355f2e;text-decoration:underline;display:block;margin-bottom:0.5em;";
    title.onclick = (e) => {
      e.preventDefault();
      loadGuide(guide);
    };
    card.appendChild(title);
    const desc = document.createElement("div");
    desc.textContent = guide.desc;
    card.appendChild(desc);
    guidesList.appendChild(card);
  });
}

function hideGuidesSections() {
  document.getElementById("guideSection").style.display = "none";
  document.getElementById("guidesLibrarySection").style.display = "none";
}

// Load a single guide
async function loadGuide(guide) {
  document.getElementById("guidesLibrarySection").style.display = "none";
  const guideSection = document.getElementById('guideSection');
  guideSection.style.display = "block";
  guideSection.innerHTML = `<div style="padding:2.2em 0;text-align:center;color:#888;">Loading guide...</div>`;
  try {
    const resp = await fetch(`guides/${guide.file}`);
    if (!resp.ok) throw new Error("404");
    const html = await resp.text();
    guideSection.innerHTML = `<section class="guide-container">${html}</section>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    guideSection.innerHTML = `<div style="padding:2.2em 0;text-align:center;color:#c00;">Unable to load guide.</div>`;
  }
}

// --- HEADER COLLAPSE ON SCROLL ---
function handleHeaderCollapse() {
  const header = document.querySelector('.banner-header');
  if (!header) return;
  const collapseAt = 80;
  if (window.scrollY > collapseAt) {
    header.classList.add('collapsed');
  } else {
    header.classList.remove('collapsed');
  }
}

window.addEventListener('scroll', handleHeaderCollapse);
window.addEventListener('resize', handleHeaderCollapse);

// --- MAIN ENTRYPOINT ---
document.addEventListener('DOMContentLoaded', function () {
  // Fetch products (categories) from sheet
  fetchProductsFromSheet();
  // Attach Guides nav
  document.getElementById("guidesNavBtn").onclick = function() {
    showGuidesLibrary();
  };
  // Attach search
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.onsubmit = function(e) {
      e.preventDefault();
      const q = document.getElementById("searchInput").value;
      if (q) searchProducts(q);
    };
  }
  // Click logo returns to tiles or home
  const logo = document.querySelector('.banner-logo-main');
  if (logo) logo.onclick = () => {
    hideGuidesSections();
    if (allMainCats.length) {
      showSubcatTiles(allMainCats[0]);
    }
    document.getElementById("frontpageSEO").style.display = "";
  };
  // Show home page initially
  document.getElementById("frontpageSEO").style.display = "";
});
