const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSn6cnKpX6dmPuZHwrCpp-GFR93URJeD9qUm2YeCs25Sd09VgQrrv_ysTCTlAR84eIKSscMdpp8s2kN/pub?gid=0&single=true&output=csv';

let allProducts = [];

// Robust CSV parser for quoted fields
function parseCSV(text) {
  const rows = [];
  let row = [], inQuotes = false, field = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') { field += '"'; i++; }
    else if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (field || row.length) { row.push(field); rows.push(row); }
      row = []; field = '';
      if (char === '\r' && next === '\n') i++;
    } else { field += char; }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Fetch products from Google Sheet CSV
function fetchProductsFromSheet(callback) {
  fetch(SHEET_CSV_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = parseCSV(csv);
      const headers = rows[0].map(h => h.trim().toLowerCase());
      allProducts = rows.slice(1).map(row =>
        headers.reduce((obj, h, i) => { obj[h] = row[i] ? row[i].trim() : ''; return obj; }, {})
      );
      if (callback) callback();
    });
}

// Show products for a given category
function showProductsSection(categoryName) {
  const products = allProducts.filter(p =>
    p.category && p.category.toLowerCase().includes(categoryName.toLowerCase())
  );

  const subcats = [...new Set(products.map(p => p.subcategory).filter(Boolean))];

  let subcatNavHtml = `<div class="subcat-nav"><button class="active" data-subcat="">All</button>`;
  subcats.forEach(subcat => {
    subcatNavHtml += `<button data-subcat="${subcat}">${subcat}</button>`;
  });
  subcatNavHtml += `</div>`;

  const grid = document.getElementById('productsGrid');
  grid.innerHTML = subcatNavHtml + `<div id="productCards"></div>`;

  function renderGrid(subcat = '') {
    const filtered = subcat ? products.filter(p => p.subcategory === subcat) : products;
    document.getElementById('productCards').innerHTML = filtered.map(item => `
      <div class="product-card">
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}">` : ''}
        <h3>${item.name || 'No Name'}</h3>
        <p>${item.description || ''}</p>
        ${item.amazon_link ? `<a href="${item.amazon_link}" target="_blank">More Details</a>` : ''}
      </div>
    `).join('') || '<p>No products found in this subcategory.</p>';
  }

  renderGrid();

  grid.querySelector('.subcat-nav').addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
      [...grid.querySelectorAll('.subcat-nav button')].forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      renderGrid(e.target.dataset.subcat);
    }
  });
}