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
      // Optionally, you could link to a main category page here
      // window.location.href = `products/${mainCat.toLowerCase().replace(/\s+/g, '-')}.html`;
    };
    const panel = document.createElement('div');
    panel.className = 'megamenu-panel';
    const row = document.createElement('div');
    row.className = "megamenu-row";
    const col = document.createElement('div');
    col.className = "megamenu-cat-col";
    // Main cat title removed from dropdown here
    const ul = document.createElement('ul');
    ul.className = "megamenu-list";
    navStructure[mainCat].forEach(sub => {
      const li2 = document.createElement('li');
      // Subcat page URL
      const fileName = `${mainCat.toLowerCase().replace(/\s+/g, '-')}-${sub.toLowerCase().replace(/\s+/g, '-')}.html`;
      const link = document.createElement('a');
      link.className = 'megamenu-sublink';
      link.href = `products/${fileName}`;
      link.textContent = sub;
      // No JS click handler: allow default link navigation
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
      window.location.href = 'index.html';
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

// --- (Category/Product grid rendering removed; only nav is needed for index.html) ---

document.addEventListener('DOMContentLoaded', async function () {
  await fetchProductsFromSheet();
  buildWPStyleMegaMenu();
});
