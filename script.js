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

// --- DESKTOP MEGAMENU BUILD ---
function buildWPStyleMegaMenu() {
  const megabarMenu = document.getElementById('megabarMenu');
  megabarMenu.innerHTML = '';
  const mainCats = Object.keys(navStructure);
  mainCats.forEach(mainCat => {
    const li = document.createElement('li');
    li.className = "megabar-has-megamenu";
    const mainBtn = document.createElement('button');
    mainBtn.className = 'megabar-main-link';
    mainBtn.textContent = mainCat;
    mainBtn.type = 'button';
    mainBtn.tabIndex = 0;
    mainBtn.onclick = (e) => {
      e.preventDefault();
      selectMainCategory(mainCat);
      closeAllMegamenus();
      closeMobileMenu();
    };
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
      // Use anchor for accessibility/tabbable links
      const link = document.createElement('a');
      link.className = 'megamenu-sublink';
      link.href = "#";
      link.textContent = sub;
      link.onclick = (e) => {
        e.preventDefault();
        selectCategoryByPath(`${mainCat} > ${sub}`);
        closeAllMegamenus();
        closeMobileMenu();
      };
      li2.appendChild(link);
      ul.appendChild(li2);
    });
    col.appendChild(ul);
    row.appendChild(col);
    panel.appendChild(row);

    // Flicker prevention
    let closeTimeout;
    function openMenu() {
      clearTimeout(closeTimeout);
      closeAllMegamenus();
      li.classList.add('open');
      panel.style.display = "flex";
    }
    function closeMenu() {
      closeTimeout = setTimeout(() => {
        li.classList.remove('open');
        panel.style.display = "none";
      }, 180);
    }
    function cancelCloseMenu() { clearTimeout(closeTimeout); }
    mainBtn.addEventListener('mouseenter', openMenu);
    mainBtn.addEventListener('focus', openMenu);
    mainBtn.addEventListener('click', openMenu);
    li.addEventListener('mouseleave', closeMenu);
    li.addEventListener('mouseenter', cancelCloseMenu);
    panel.addEventListener('mouseenter', cancelCloseMenu);
    panel.addEventListener('mouseleave', closeMenu);

    megabarMenu.appendChild(li);
    li.appendChild(mainBtn);
    li.appendChild(panel);
  });

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

// --- HERO CAROUSEL (side-by-side layout) ---
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
    const btnLabel = `Browse ${s.subCat ? s.subCat : s.mainCat}`;
    const slide = document.createElement('div');
    slide.className = "hero-carousel-slide" + (i === 0 ? " active" : "");
    slide.innerHTML = `
      <img class="hero-carousel-image" src="${s.image}" alt="">
      <div class="hero-carousel-content">
        <div class="hero-carousel-title">${s.headline}</div>
        <div class="hero-carousel-desc">${s.desc}</div>
        <button class="hero-carousel-cta" type="button" data-path="${encodeURIComponent(s.path)}">
          ${btnLabel}
        </button>
      </div>
    `;
    hero.appendChild(slide);
  });
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

  hero.querySelectorAll('.hero-carousel-cta').forEach(btn => {
    btn.addEventListener('click', function () {
      const path = decodeURIComponent(this.getAttribute('data-path'));
      selectCategoryByPath(path);
      closeAllMegamenus();
      closeMobileMenu();
      document.getElementById('categorySection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

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

// --- MOBILE CATEGORY GRID HOMEPAGE (unchanged) ---
function showMobileCategoryGrid() {
  const grid = document.getElementById('mobileCategoryGrid');
  grid.innerHTML = '';
  Object.entries(navStructure).forEach(([mainCat, subCats]) => {
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
      const link = document.createElement('button');
      link.className = "category-subcat-link";
      link.type = "button";
      link.textContent = sub;
      link.onclick = () => {
        selectCategoryByPath(`${mainCat} > ${sub}`);
        document.getElementById('siteIntro').style.display = "none";
        document.getElementById('mobileCategoryGrid').style.display = "none";
        document.getElementById('tipsBlock').style.display = "none";
        document.getElementById('categorySection').style.display = "";
        window.scrollTo({top: 0, behavior: 'smooth'});
      };
      subcatsDiv.appendChild(link);
    });
    card.appendChild(subcatsDiv);
    grid.appendChild(card);
  });
}

// --- PRODUCT DISPLAY (category path) ---
function selectCategoryByPath(path) {
  document.getElementById('siteIntro').style.display = "none";
  document.getElementById('tipsBlock').style.display = "none";
  document.getElementById('mobileCategoryGrid').style.display = "none";
  document.getElementById('categorySection').style.display = "";
  const title = document.getElementById('productsSectionTitle');
  const grid = document.getElementById('productsGrid');
  title.textContent = path;
  title.style.display = 'inline-block';
  title.style.margin = "2em auto 0.5em auto";
  grid.innerHTML = '';
  let filtered = allProducts.filter(p => p.category === path);
  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #888;">No products found for this category.</div>`;
  } else {
    filtered.forEach(p => {
      grid.appendChild(makeProductCard(p));
    });
  }
}

// --- MAIN CATEGORY: Show all products under a main category (not subcat) ---
function selectMainCategory(mainCat) {
  document.getElementById('siteIntro').style.display = "none";
  document.getElementById('tipsBlock').style.display = "none";
  document.getElementById('mobileCategoryGrid').style.display = "none";
  document.getElementById('categorySection').style.display = "";
  const title = document.getElementById('productsSectionTitle');
  const grid = document.getElementById('productsGrid');
  title.textContent = mainCat;
  title.style.display = 'inline-block';
  title.style.margin = "2em auto 0.5em auto";
  grid.innerHTML = '';
  let filtered = allProducts.filter(p => p.mainCat === mainCat);
  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #888;">No products found for this category.</div>`;
  } else {
    filtered.forEach(p => {
      grid.appendChild(makeProductCard(p));
    });
  }
}

// --- PRODUCT CARD: Image left, text right, button below text
function makeProductCard(p) {
  const card = document.createElement('div');
  card.className = 'product-card';
  if (p.image_url) {
    const img = document.createElement('img');
    img.className = 'product-image';
    img.src = p.image_url;
    img.alt = p.name;
    card.appendChild(img);
  }
  const details = document.createElement('div');
  details.className = 'product-details';
  const title = document.createElement('div');
  title.className = 'product-title';
  title.textContent = p.name;
  details.appendChild(title);
  const desc = document.createElement('div');
  desc.className = 'product-desc';
  desc.textContent = (p.description || "").split('\n')[0];
  details.appendChild(desc);
  if (p.amazon_link) {
    const btn = document.createElement('a');
    btn.className = 'product-link';
    btn.href = p.amazon_link;
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.textContent = "More Details";
    details.appendChild(btn);
  }
  card.appendChild(details);
  return card;
}

// --- HOME BUTTON: Show intro/tips/grid, hide products ---
function showHome() {
  if (window.innerWidth <= 900) {
    document.getElementById('siteIntro').style.display = "";
    document.getElementById('mobileCategoryGrid').style.display = "";
    document.getElementById('tipsBlock').style.display = "";
    document.getElementById('categorySection').style.display = "none";
    showMobileCategoryGrid();
  } else {
    document.getElementById('siteIntro').style.display = "";
    document.getElementById('tipsBlock').style.display = "";
    document.getElementById('categorySection').style.display = "none";
    document.getElementById('mobileCategoryGrid').style.display = "none";
  }
  window.scrollTo({top: 0, behavior: 'smooth'});
  closeAllMegamenus();
  closeMobileMenu();
}

function closeMobileMenu() {}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async function () {
  await fetchProductsFromSheet();
  buildWPStyleMegaMenu();
  buildHeroCarouselFromSheet();
  showHome();
});

window.addEventListener('resize', function() {
  showHome();
});
