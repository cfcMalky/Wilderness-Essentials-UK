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
// Now, subcat links open their own category page in /products/
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
    };
    const panel = document.createElement('div');
    panel.className = 'megamenu-panel';
    const row = document.createElement('div');
    row.className = "megamenu-row";
    const col = document.createElement('div');
    col.className = "megamenu-cat-col";
    const ul = document.createElement('ul');
    ul.className = "megamenu-list";
    navStructure[mainCat].forEach(sub => {
      const li2 = document.createElement('li');
      const fileName = `${mainCat.toLowerCase().replace(/\s+/g, '-')}-${sub.toLowerCase().replace(/\s+/g, '-')}.html`;
      const link = document.createElement('a');
      link.className = 'megamenu-sublink';
      link.href = `products/${fileName}`;
      link.textContent = sub;
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
      window.location.href = logoLink.getAttribute("href");
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

// --- HERO CAROUSEL (only on index.html) ---
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
        <a class="hero-carousel-cta" href="products/${s.mainCat.toLowerCase().replace(/\s+/g, '-')}-${s.subCat.toLowerCase().replace(/\s+/g, '-')}.html">
          ${btnLabel}
        </a>
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

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async function () {
  await fetchProductsFromSheet();
  buildWPStyleMegaMenu();
  // Only run carousel code if on index.html (has heroCarousel)
  if (document.getElementById('heroCarousel')) {
    buildHeroCarouselFromSheet();
  }
});
