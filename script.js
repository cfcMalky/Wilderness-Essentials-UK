// --- CONFIG: Google Sheet API ---
const SHEET_ID = "1w6NcZ9OPhjLcZtgK98ypsxM9eV13NLT9hOf4AVe5HR4";
const API_KEY = "AIzaSyABNGnLmTXlik5fgBe_ooBI1Y5nrXKTePY";
const RANGE = "Sheet1";

let allProducts = [];
let navStructure = {};
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

// --- NAV STRUCTURE ---
function buildNavStructure() {
  navStructure = {};
  for (const prod of allProducts) {
    if (!prod.mainCat) continue;
    if (!navStructure[prod.mainCat]) navStructure[prod.mainCat] = [];
    if (prod.subCat && !navStructure[prod.mainCat].includes(prod.subCat)) navStructure[prod.mainCat].push(prod.subCat);
  }
}

// --- SUBCAT TO PAGE FILENAME ---
function subcatPathToPage(mainCat, subCat) {
  const filename = `${mainCat} ${subCat}`.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return `${filename}.html`;
}

// --- DESKTOP MEGAMENU BUILD (for desktop only, hidden on mobile) ---
function buildWPStyleMegaMenu() {
  const megabarMenu = document.getElementById('megabarMenu');
  megabarMenu.innerHTML = '';

  // Main categories ONLY
  const mainCats = Object.keys(navStructure);
  mainCats.forEach((mainCat, idx) => {
    const li = document.createElement('li');
    li.className = "megabar-has-megamenu";
    // Main nav link
    const btn = document.createElement('button');
    btn.className = 'megabar-link';
    btn.textContent = mainCat;
    btn.type = 'button';
    btn.tabIndex = 0;

    // Megamenu panel (hidden on mobile, for desktop only)
    const panel = document.createElement('div');
    panel.className = 'megamenu-panel';
    const row = document.createElement('div');
    row.className = "megamenu-row";
    const col = document.createElement('div');
    col.className = "megamenu-cat-col";
    const title = document.createElement('div');
    title.className = "megamenu-title";
    title.textContent = mainCat;
    col.appendChild(title);
    const ul = document.createElement('ul');
    ul.className = "megamenu-list";
    navStructure[mainCat].forEach(sub => {
      const li2 = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'megamenu-sublink';
      link.href = subcatPathToPage(mainCat, sub);
      link.textContent = sub;
      // No onclick: browser will follow link
      li2.appendChild(link);
      ul.appendChild(li2);
    });
    col.appendChild(ul);
    row.appendChild(col);
    panel.appendChild(row);

    // Only one open at a time logic (desktop only)
    function openMenu() {
      closeAllMegamenus();
      li.classList.add('open');
      panel.style.display = "flex";
    }
    function closeMenu() {
      li.classList.remove('open');
      panel.style.display = "none";
    }
    btn.addEventListener('mouseenter', openMenu);
    btn.addEventListener('focus', openMenu);
    btn.addEventListener('click', openMenu);
    li.addEventListener('mouseleave', closeMenu);

    megabarMenu.appendChild(li);
    li.appendChild(btn);
    li.appendChild(panel);
  });

  // Center logo click acts as home button
  const logoLink = document.getElementById('homeLogoLink');
  if (logoLink) {
    logoLink.onclick = (e) => {
      e.preventDefault();
      showHome();
      closeAllMegamenus();
      closeMobileMenu();
    };
  }
}

function closeAllMegamenus() {
  document.querySelectorAll('.megabar-has-megamenu').forEach(li => {
    li.classList.remove('open');
    let panel = li.querySelector('.megamenu-panel');
    if (panel) panel.style.display = "none";
  });
}

// --- HERO CAROUSEL (desktop only, hidden on mobile) ---
function buildHeroCarouselFromSheet() {
  const hero = document.getElementById("heroCarousel");
  if (!hero) return;
  if (window.innerWidth <= 900) {
    hero.style.display = "none";
    return;
  } else {
    hero.style.display = "";
  }
  let slides = [];
  for (const mainCat in navStructure) {
    const subCats = navStructure[mainCat];
    let found = null;
    if (subCats.length) {
      const prods = allProducts.filter(p => p.mainCat === mainCat && p.subCat === subCats[0] && p.image_url);
      if (prods.length > 0) found = prods[0];
    }
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
    // Button text: "Browse [Subcategory]" or fallback to "Browse [Main Category]"
    const btnLabel = `Browse ${s.subCat ? s.subCat : s.mainCat}`;
    const slide = document.createElement('div');
    slide.className = "hero-carousel-slide" + (i === 0 ? " active" : "");
    slide.innerHTML = `
      <img class="hero-carousel-image" src="${s.image}" alt="">
      <div class="hero-carousel-content">
        <div class="hero-carousel-title">${s.headline}</div>
        <div class="hero-carousel-desc">${s.desc}</div>
        <a class="hero-carousel-cta" href="${subcatPathToPage(s.mainCat, s.subCat)}">
          ${btnLabel}
        </a>
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

// --- MOBILE CATEGORY GRID HOMEPAGE ---
function showMobileCategoryGrid() {
  const grid = document.getElementById('mobileCategoryGrid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.entries(navStructure).forEach(([mainCat, subCats]) => {
    // Find first product with image in this mainCat
    let prodImg = '';
    for (const p of allProducts) {
      if (p.mainCat === mainCat && p.image_url) {
        prodImg = p.image_url;
        break;
      }
    }
    const card = document.createElement('div');
    card.className = "category-card";
    if (prodImg) {
      const img = document.createElement('img');
      img.className = "category-image";
      img.src = prodImg;
      img.alt = mainCat;
      card.appendChild(img);
    }
    const title = document.createElement('div');
    title.className = "category-title";
    title.textContent = mainCat;
    card.appendChild(title);

    const subcatsDiv = document.createElement('div');
    subcatsDiv.className = "category-subcats";
    subCats.forEach(sub => {
      const link = document.createElement('a');
      link.className = "category-subcat-link";
      link.href = subcatPathToPage(mainCat, sub);
      link.textContent = sub;
      // No onclick: browser will follow link
      subcatsDiv.appendChild(link);
    });
    card.appendChild(subcatsDiv);
    grid.appendChild(card);
  });
}

// --- PRODUCT DISPLAY (category path) ---
function selectCategoryByPath(path) {
  document.getElementById('siteIntro') && (document.getElementById('siteIntro').style.display = "none");
  document.getElementById('tipsBlock') && (document.getElementById('tipsBlock').style.display = "none");
  document.getElementById('mobileCategoryGrid') && (document.getElementById('mobileCategoryGrid').style.display = "none");
  document.getElementById('categorySection') && (document.getElementById('categorySection').style.display = "");
  const title = document.getElementById('productsSectionTitle');
  const grid = document.getElementById('productsGrid');
  let filtered = allProducts.filter(p => p.category === path);
  if (title) title.textContent = path;
  if (grid) {
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
        desc.textContent = p.description || "";
        card.appendChild(desc);
        if (p.amazon_link) {
          const btn = document.createElement('a');
          btn.className = 'product-link';
          btn.href = p.amazon_link;
          btn.target = "_blank";
          btn.rel = "noopener";
          btn.textContent = "More Details";
          card.appendChild(btn);
        }
        grid.appendChild(card);
      });
    }
  }
}

// --- HOME BUTTON: Show intro/tips/grid, hide products ---
function showHome() {
  if (window.innerWidth <= 900) {
    document.getElementById('siteIntro') && (document.getElementById('siteIntro').style.display = "");
    document.getElementById('mobileCategoryGrid') && (document.getElementById('mobileCategoryGrid').style.display = "");
    document.getElementById('tipsBlock') && (document.getElementById('tipsBlock').style.display = "");
    document.getElementById('categorySection') && (document.getElementById('categorySection').style.display = "none");
    showMobileCategoryGrid();
  } else {
    document.getElementById('siteIntro') && (document.getElementById('siteIntro').style.display = "");
    document.getElementById('tipsBlock') && (document.getElementById('tipsBlock').style.display = "");
    document.getElementById('categorySection') && (document.getElementById('categorySection').style.display = "none");
    document.getElementById('mobileCategoryGrid') && (document.getElementById('mobileCategoryGrid').style.display = "none");
  }
  window.scrollTo({top: 0, behavior: 'smooth'});
  closeAllMegamenus();
  closeMobileMenu();
}

// --- MOBILE NAV SETUP (present for compatibility, but not shown on mobile grid version) ---
function closeMobileMenu() {
  // No-op: nav is hidden on mobile grid
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async function () {
  await fetchProductsFromSheet();
  buildWPStyleMegaMenu();
  buildHeroCarouselFromSheet();
  if (window.innerWidth <= 900) {
    showHome();
  } else {
    showHome();
  }

  // If this page is a subcategory static page, show the correct products
  if (window.__STATIC_SUBCATEGORY_PATH) {
    selectCategoryByPath(window.__STATIC_SUBCATEGORY_PATH);
  }
});

// Optional: support resizing (switch between mobile grid and desktop nav)
window.addEventListener('resize', function() {
  if (window.innerWidth <= 900) {
    showHome();
  } else {
    showHome();
  }
});