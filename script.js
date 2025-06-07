// --- CONFIG: Google Sheet API ---
const SHEET_ID = "1w6NcZ9OPhjLcZtgK98ypsxM9eV13NLT9hOf4AVe5HR4";
const API_KEY = "AIzaSyABNGnLmTXlik5fgBe_ooBI1Y5nrXKTePY";
const RANGE = "Sheet1";

let allProducts = [];
let navStructure = {};
let subcatToMaincat = {};
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
    // Parse category
    const catPath = (obj.category || "").split(">").map(s => s.trim());
    obj.mainCat = catPath[0] || "";
    obj.subCat = catPath[1] || "";
    obj.catPath = obj.category || "";
    return obj;
  });
  buildNavStructure();
  sheetReady = true;
}

function buildNavStructure() {
  navStructure = {};
  subcatToMaincat = {};
  for (const prod of allProducts) {
    if (!prod.mainCat) continue;
    if (!navStructure[prod.mainCat]) navStructure[prod.mainCat] = [];
    if (prod.subCat && !navStructure[prod.mainCat].includes(prod.subCat)) navStructure[prod.mainCat].push(prod.subCat);
    if (prod.subCat) subcatToMaincat[prod.subCat] = prod.mainCat;
  }
}

// --- MEGAMENU: always shown below navbar ---
function buildNavWithMegaMenu() {
  // Navbar (main cats + About)
  const navMenu = document.getElementById('navMenu');
  navMenu.innerHTML = '';
  const mainCats = Object.keys(navStructure);
  mainCats.forEach(mainCat => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'nav-link';
    btn.textContent = mainCat;
    btn.type = 'button';
    btn.tabIndex = 0;
    btn.setAttribute('aria-haspopup', 'false');
    btn.setAttribute('aria-expanded', 'false');
    btn.disabled = true; // Not clickable, just a label now
    li.appendChild(btn);
    navMenu.appendChild(li);
  });
  // About static link
  const aboutLi = document.createElement('li');
  aboutLi.innerHTML = `<a class="nav-link" href="#">About</a>`;
  navMenu.appendChild(aboutLi);

  // Megamenu: always visible, all main cats as columns
  const megamenu = document.getElementById('megamenu');
  megamenu.innerHTML = '';
  const row = document.createElement('div');
  row.className = "megamenu-row";
  mainCats.forEach(mainCat => {
    const col = document.createElement('div');
    col.className = "megamenu-cat-col";
    const title = document.createElement('div');
    title.className = "megamenu-title";
    title.textContent = mainCat;
    col.appendChild(title);
    const ul = document.createElement('ul');
    ul.className = "megamenu-list";
    navStructure[mainCat].forEach(sub => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'megamenu-link';
      link.href = "#";
      link.textContent = sub;
      link.onclick = (e) => {
        e.preventDefault();
        selectCategoryByPath(`${mainCat} > ${sub}`);
      };
      li.appendChild(link);
      ul.appendChild(li);
    });
    col.appendChild(ul);
    row.appendChild(col);
  });
  megamenu.appendChild(row);
}

// --- CAROUSEL (first product with image in first subcat of each maincat) ---
function buildHeroCarouselFromSheet() {
  const hero = document.getElementById("heroCarousel");
  let slides = [];
  for (const mainCat in navStructure) {
    const subCats = navStructure[mainCat];
    let found = null;
    if (subCats.length) {
      // Get first product with image in the first subcat
      const prods = allProducts.filter(p => p.mainCat === mainCat && p.subCat === subCats[0] && p.image_url);
      if (prods.length > 0) found = prods[0];
    }
    // If not found, fallback to any product with image in mainCat
    if (!found) {
      const prods = allProducts.filter(p => p.mainCat === mainCat && p.image_url);
      if (prods.length > 0) found = prods[0];
    }
    if (found) {
      slides.push({
        image: found.image_url,
        headline: found.subCat || found.mainCat,
        mainCat: found.mainCat,
        subCat: found.subCat,
        path: found.catPath,
        desc: (found.description || '').split('.').shift() + '.',
      });
    }
  }
  if (!slides.length) {
    hero.innerHTML = `<div style="color:#a00;text-align:center;padding:2em;font-size:1.2em;">No featured products</div>`;
    return;
  }
  hero.innerHTML = "";
  slides.forEach((s, i) => {
    const slide = document.createElement('div');
    slide.className = "hero-carousel-slide" + (i === 0 ? " active" : "");
    slide.innerHTML = `
      <img class="hero-carousel-image" src="${s.image}" alt="">
      <div class="hero-carousel-content">
        <div class="hero-carousel-title">${s.headline}</div>
        <div class="hero-carousel-desc">${s.desc}</div>
        <button class="hero-carousel-cta" type="button" data-path="${encodeURIComponent(s.path)}">
          Shop ${s.headline}
        </button>
      </div>
    `;
    hero.appendChild(slide);
  });
  // Dots nav
  const nav = document.createElement('div');
  nav.className = "hero-carousel-nav";
  for (let i = 0; i < slides.length; ++i) {
    const dot = document.createElement('button');
    dot.className = "hero-carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Show slide ${i + 1}`);
    dot.onclick = () => setHeroCarouselSlide(i);
    nav.appendChild(dot);
  }
  hero.appendChild(nav);

  // Attach event listeners for the CTA buttons
  hero.querySelectorAll('.hero-carousel-cta').forEach(btn => {
    btn.addEventListener('click', function () {
      const path = decodeURIComponent(this.getAttribute('data-path'));
      selectCategoryByPath(path);
      document.getElementById('categorySection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // State
  let current = 0;
  let timer = null;
  function setHeroCarouselSlide(idx) {
    const slidesEls = hero.querySelectorAll('.hero-carousel-slide');
    const dotsEls = hero.querySelectorAll('.hero-carousel-dot');
    slidesEls.forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    dotsEls.forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    current = idx;
    resetTimer();
  }
  function nextSlide() {
    setHeroCarouselSlide((current + 1) % slides.length);
  }
  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, 7000);
  }
  resetTimer();
}

// --- PRODUCT DISPLAY (category path) ---
function selectCategoryByPath(path) {
  const section = document.getElementById('categorySection');
  const title = document.getElementById('productsSectionTitle');
  const grid = document.getElementById('productsGrid');
  let filtered = allProducts.filter(p => p.category === path);
  title.textContent = path;
  grid.innerHTML = '';
  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #888;">No products found for this category.</div>`;
  } else {
    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      if (p.image_url) {
        const img = document.createElement('img');
        img.className = 'product-image';
        img.src = p.image_url;
        img.alt = p.name;
        card.appendChild(img);
      }
      const title = document.createElement('div');
      title.className = 'product-title';
      title.textContent = p.name;
      card.appendChild(title);
      const desc = document.createElement('div');
      desc.className = 'product-desc';
      desc.textContent = p.description;
      card.appendChild(desc);
      if (p.amazon_link) {
        const btn = document.createElement('a');
        btn.className = 'product-link';
        btn.href = p.amazon_link;
        btn.target = "_blank";
        btn.rel = "noopener";
        btn.textContent = "Shop on Amazon";
        card.appendChild(btn);
      }
      grid.appendChild(card);
    });
  }
  section.style.display = '';
}

// --- PAGE INIT ---
document.addEventListener('DOMContentLoaded', async function () {
  await fetchProductsFromSheet();
  buildNavWithMegaMenu();
  buildHeroCarouselFromSheet();
});
