// --- CONFIG: Google Sheet API ---
const SHEET_ID = "1w6NcZ9OPhjLcZtgK98ypsxM9eV13NLT9hOf4AVe5HR4";
const API_KEY = "AIzaSyABNGnLmTXlik5fgBe_ooBI1Y5nrXKTePY";
const RANGE = "Sheet1";

// --- SEO INTROS FOR CATEGORIES (CURATED/NOT SOLD) ---
const seoIntros = {
  "Camp Kitchen > Grills & Accessories": `
    <p>Looking for the perfect grill for your next camping adventure? We’ve done the research for you! Our curated selection of best-selling camping grills and essential accessories brings together the highest-rated options from across the web, so you can cook up delicious meals wherever you pitch your tent. We highlight portable BBQs, versatile grill tools, and innovative accessories designed for convenience and durability in the great outdoors.</p>
    <p>Our goal is to make your outdoor cooking experience effortless and enjoyable. We feature products that are easy to transport, quick to set up, and built to last—sourced from trusted brands and the latest customer favorites. Whether you’re grilling for a group or preparing a solo feast, you’ll find gear that meets every camper’s needs. Explore compact, foldable grills, top-reviewed utensils, and cleaning solutions that keep your campsite tidy.</p>
    <p>Browse our recommendations to discover the most popular camping grills and accessories on the market today. We don’t sell directly—instead, we connect you with the best deals and reputable sellers, making it simple to upgrade your camp kitchen with confidence. Let us help you make every meal a highlight of your outdoor experience!</p>
  `,
  "Camp Kitchen > Stoves & Accessories": `
    <p>If you want reliable meal prep in the wild, start with our collection of best-selling camping stoves and must-have accessories. We’ve gathered the internet’s highest-rated portable stoves and essential add-ons, so you can find the perfect combination for your next adventure. From ultralight backpacking stoves to family-sized models, we showcase what real campers are buying and loving right now.</p>
    <p>Find stoves that boil fast, pack small, and perform in all weather, plus accessories like windshields, fuel canisters, and cookware adapters that make outdoor cooking safer and easier. Every product featured here is selected for its popularity, positive reviews, and proven performance in the field. Our guides help you compare features and choose the right gear for your style of camping.</p>
    <p>We’re not a shop—we’re your shortcut to the top-rated camp stoves and accessories available online. Click through to trusted retailers or marketplaces to get the best prices and fast delivery for your chosen products. Make your next campsite meal a success with the gear that fellow campers recommend most!</p>
  `,
  "Safety & Survival > First Aid Kits": `
    <p>Stay safe and prepared on your outdoor adventures with our roundup of the best-selling camping first aid kits. We research and recommend only the most trusted, highly rated kits—so you can easily compare options and select the right one for your needs. Our curated picks cover everything from compact travel kits for day hikes to comprehensive sets for extended expeditions.</p>
    <p>We feature first aid kits that are designed for the challenges of camping and hiking: lightweight, weather-resistant, and packed with the essentials to treat cuts, scrapes, burns, and more. Each kit we recommend has stood out for its real-world performance and positive customer feedback. Quick-access compartments, clear labeling, and included instructions make them easy to use when it matters most.</p>
    <p>Please note, we don’t sell these kits directly. Instead, we link you to reputable online sellers and retailers, so you can purchase with confidence and get the best deals available. Check out our top picks and make sure you’re ready for life’s little surprises on the trail!</p>
  `,
  "Sleeping Gear > Air Beds": `
    <p>Enjoy a comfortable night’s sleep wherever you roam with the best-selling camping air beds, handpicked by our team. We search the web for the most popular, top-rated air beds suited to camping, festivals, and family adventures. Our selection highlights products praised for their durability, comfort, and ease of use—so you can rest easy under the stars.</p>
    <p>Our curated air beds include a range of styles and sizes, from lightweight single mats for backpackers to queen-sized models perfect for group trips. We focus on air beds that are easy to inflate and deflate, made from puncture-resistant materials, and designed for reliable support on any terrain. User reviews and expert opinions guide every recommendation.</p>
    <p>We don’t sell air beds ourselves. Instead, we connect you with the best options and trusted online retailers, making it simple to find the right product and the best price. Browse our recommendations, compare features, and upgrade your camping sleep setup with confidence.</p>
  `,
  "Tents > Dome Tents": `
    <p>Searching for a reliable dome tent for your next camping trip? We’ve gathered the top-selling and most-loved dome tents from across the internet, so you can easily find the right shelter for your style of adventure. Our curated collection spotlights tents known for their stability, quick setup, and comfort—backed by hundreds of positive reviews and real-world field tests.</p>
    <p>Dome tents are a favorite among campers for their wind resistance and efficient interior space. We feature a variety of sizes and designs, from solo models to roomy family tents, all chosen for their user-friendly features and excellent value. Each tent in our roundup is a proven performer, trusted by outdoor enthusiasts and first-time campers alike.</p>
    <p>We don’t sell tents directly. Instead, we guide you to reputable sources where you can purchase with confidence. Use our expert recommendations to find the best deals on dome tents that will keep you dry and comfortable, wherever your journey leads.</p>
  `,
  "Tents > Tunnel Tents": `
    <p>Looking for extra space and comfort on your camping adventures? Our handpicked selection of best-selling tunnel tents showcases the most popular models for families and groups. Tunnel tents offer generous headroom, spacious interiors, and reliable protection from the elements—making them ideal for everything from festivals to wilderness getaways.</p>
    <p>We highlight tunnel tents that are praised by campers for their easy setup, stability in wind, and smart features like multiple entrances and large vestibules. Our recommendations are based on customer satisfaction, expert reviews, and real-world use, so you can be sure each tent on our list delivers on quality and performance.</p>
    <p>While we don’t sell tunnel tents ourselves, we help you find them at trusted online retailers and marketplaces. Explore our top picks, compare features, and get inspired for your next group adventure with a tent that offers room to relax, unwind, and enjoy the great outdoors.</p>
  `
};

let allProducts = [];
let navStructure = {};
let allMainCats = [];
let allSubCats = {};
let sheetReady = false;

// --- GUIDE NAV & LOADING ---
let guidesList = [];
let currentGuide = null;

// Load guides manifest
async function loadGuidesManifest() {
  try {
    const resp = await fetch('guides/guides.json');
    guidesList = await resp.json();
  } catch (e) {
    guidesList = [];
  }
}

// Add "Guides" with dropdown to nav
function addGuidesToNav() {
  const navMenu = document.getElementById("mainNavMenu");
  // Remove old Guides dropdown if exists
  const old = navMenu.querySelector('.guides-dropdown');
  if (old) old.remove();

  // Make dropdown
  const li = document.createElement("li");
  li.className = "guides-dropdown";
  const btn = document.createElement("button");
  btn.textContent = "Guides";
  btn.className = "guides-dropdown-btn";
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');

  const dropdown = document.createElement("div");
  dropdown.className = "guides-dropdown-content";
  guidesList.forEach(guide => {
    const b = document.createElement("button");
    b.textContent = guide.title || guide.file;
    b.onclick = (e) => {
      e.preventDefault();
      openGuide(guide);
      closeGuidesDropdown();
    };
    dropdown.appendChild(b);
  });

  btn.onclick = (e) => {
    e.stopPropagation();
    const open = !li.classList.contains('open');
    closeAllDropdowns();
    if (open) {
      li.classList.add('open');
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      li.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  };

  li.appendChild(btn);
  li.appendChild(dropdown);
  navMenu.appendChild(li);

  // Close dropdown on outside click
  document.addEventListener('click', closeGuidesDropdown);
}

function closeGuidesDropdown() {
  document.querySelectorAll('.guides-dropdown').forEach(dd => {
    dd.classList.remove('open');
    dd.querySelector('.guides-dropdown-btn').classList.remove('active');
    dd.querySelector('.guides-dropdown-btn').setAttribute('aria-expanded', 'false');
  });
}
function closeAllDropdowns() {
  closeGuidesDropdown();
}

// --- GUIDE LOAD & DISPLAY ---
async function openGuide(guide) {
  // Hide other content
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("subcatTilesSection").style.display = "none";
  document.getElementById("searchResultsSection").style.display = "none";

  // Load guide HTML
  const guideSection = document.getElementById('guideSection');
  guideSection.style.display = "block";
  guideSection.innerHTML = `<div style="padding:2.2em 0;text-align:center;color:#888;">Loading guide...</div>`;
  try {
    const resp = await fetch(`guides/${guide.file}`);
    if (!resp.ok) throw new Error("404");
    const html = await resp.text();
    guideSection.innerHTML = `<article>${html}</article>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    guideSection.innerHTML = `<div style="padding:2.2em 0;text-align:center;color:#c00;">Unable to load guide.</div>`;
  }
  currentGuide = guide;
}

// Allow "closing" guide (e.g. if you want to add a close/back button in guideSection)
function closeGuideSection() {
  document.getElementById('guideSection').style.display = "none";
  // Optionally show subcat tiles or products again
  if (allMainCats.length) showSubcatTiles(allMainCats[0]);
}

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
  // Remove all except guides dropdown
  navMenu.querySelectorAll("li:not(.guides-dropdown)").forEach(e => e.remove());
  allMainCats.forEach(mainCat => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = mainCat;
    btn.className = "main-nav-btn";
    btn.onclick = () => {
      closeGuideSection();
      showSubcatTiles(mainCat);
    };
    li.appendChild(btn);
    navMenu.insertBefore(li, navMenu.querySelector('.guides-dropdown') || null);
  });
}

// --- SUBCATEGORY TILES (with image carousel) ---
function showSubcatTiles(mainCat, focusSubcat = null) {
  closeGuideSection();
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
  closeGuideSection();
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

// --- PRODUCT CARD: LIST STYLE, IMAGE LEFT, CONTENT RIGHT ---
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
  // Optional badge (e.g. NEW)
  if (/new/i.test(p.name)) {
    const badge = document.createElement("span");
    badge.className = "product-badge";
    badge.textContent = "NEW";
    card.appendChild(badge);
  }
  // Product details (right)
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
  closeGuideSection();
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

// --- HEADER COLLAPSE ON SCROLL, ANIMATED ---
function handleHeaderCollapse() {
  const header = document.querySelector('.banner-header');
  if (!header) return;
  const collapseAt = 80; // px from top before collapsing
  if (window.scrollY > collapseAt) {
    header.classList.add('collapsed');
  } else {
    header.classList.remove('collapsed');
  }
}

window.addEventListener('scroll', handleHeaderCollapse);
window.addEventListener('resize', handleHeaderCollapse);

// --- MAIN ENTRYPOINT: now loads guides, then categories ---
async function setupWithGuides() {
  await loadGuidesManifest();
  await fetchProductsFromSheet();
  buildNavStructure();
  buildMainNav();
  addGuidesToNav();
  if (allMainCats.length) showSubcatTiles(allMainCats[0]);
}

document.addEventListener('DOMContentLoaded', function () {
  setupWithGuides();
  document.getElementById("searchForm").onsubmit = function(e) {
    e.preventDefault();
    const q = document.getElementById("searchInput").value;
    if (q) searchProducts(q);
  };
  // Click logo returns to tiles
  const logo = document.querySelector('.banner-logo-main');
  if (logo) logo.onclick = () => {
    closeGuideSection();
    showSubcatTiles(allMainCats[0]);
  };
});
