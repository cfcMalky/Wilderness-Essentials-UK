const SHEET_ID = "1w6NcZ9OPhjLcZtgK98ypsxM9eV13NLT9hOf4AVe5HR4";
const API_KEY = "YOUR_API_KEY_HERE"; // <-- Insert your Google API key here!
const RANGE = "Sheet1"; // Change if your sheet/tab is named differently

async function fetchProducts() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  // The first row is headers
  const [headers, ...rows] = data.values;
  const products = rows.map(row => {
    const product = {};
    headers.forEach((header, i) => {
      product[header] = row[i] || "";
    });
    // Convert description to array if it's semicolon or newline separated
    product.description = product.description.includes(";")
      ? product.description.split(";").map(s => s.trim())
      : [product.description];
    return product;
  });

  return products;
}

async function renderProducts(category = null) {
  const products = await fetchProducts();
  const container = document.getElementById("products");
  container.innerHTML = "";

  const filtered = category
    ? products.filter(p => p.category === category)
    : products;

  filtered.forEach(product => {
    container.innerHTML += `
      <div class="product">
        <h2>${product.name}</h2>
        <img src="${product.image_url}" alt="${product.name}" style="max-width:300px;">
        <ul>
          ${product.description.map(d => `<li>${d}</li>`).join("")}
        </ul>
        <a href="${product.amazon_link}" target="_blank">Buy on Amazon</a>
      </div>
    `;
  });
}

async function populateCategoryDropdown() {
  const products = await fetchProducts();
  const dropdown = document.getElementById("categoryDropdown");
  const categories = [...new Set(products.map(p => p.category))];
  dropdown.innerHTML = `<option value="">All</option>` +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  dropdown.onchange = () => renderProducts(dropdown.value);
}

window.onload = async () => {
  await populateCategoryDropdown();
  await renderProducts();
};