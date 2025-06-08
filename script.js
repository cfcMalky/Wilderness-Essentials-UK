// --- CONFIG: Google Sheet API ---
const SHEET_ID = "1w6NcZ9OPhjLcZtgK98ypsxM9eV13NLT9hOf4AVe5HR4";
const API_KEY = "AIzaSyABNGnLmTXlik5fgBe_ooBI1Y5nrXKTePY";
const RANGE = "Sheet1";

// --- SEO INTROS FOR CATEGORIES ---
const seoIntros = {
  "Camp Kitchen > Grills & Accessories": `
    <p>Elevate your outdoor dining with our exceptional selection of camping grills and accessories. Whether you’re a seasoned adventurer or new to camping, our range of portable grills, BBQs, and essential accessories ensures you can enjoy delicious, freshly grilled meals wherever your journey takes you. Our products are designed with convenience and durability in mind, making outdoor cooking effortless and enjoyable.</p>
    <p>From compact, foldable grills to high-performance accessories like tongs, grill mats, and cleaning brushes, we offer everything you need to transform your campsite into a gourmet kitchen. Our grills are engineered for fast setup and even heat distribution, while our accessories ensure safe, clean, and efficient cooking. Lightweight and easy to transport, this gear is perfect for picnics, hiking trips, and family camping adventures.</p>
    <p>Invest in quality camping grills and accessories to maximize your outdoor experience. Enjoy mouthwatering meals, create lasting memories around the campfire, and discover why great food is a highlight of every camping trip. Shop now for top-rated camp kitchen essentials that will make every meal an adventure.</p>
  `,
  "Camp Kitchen > Stoves & Accessories": `
    <p>Prepare hot, satisfying meals anywhere with our top-rated camping stoves and accessories. Our collection features lightweight, efficient stoves that are easy to set up and operate, offering reliable performance in any weather condition. From solo hiking trips to group expeditions, you’ll find the perfect stove to suit your outdoor cooking needs.</p>
    <p>Pair your stove with our curated range of accessories, including windshields, fuel canisters, igniters, and cookware adapters. These essential add-ons enhance safety and convenience, ensuring quick boiling times and effortless meal prep. Our gear is built for rugged use, ensuring you can count on it trip after trip.</p>
    <p>Experience the freedom to cook your favorite dishes in the great outdoors. Our stoves and accessories are compact for easy packing, yet powerful enough to handle any recipe. Enjoy fresh coffee at sunrise or a hearty dinner after a long day—explore our camp kitchen range to upgrade your outdoor culinary adventures.</p>
  `,
  "Safety & Survival > First Aid Kits": `
    <p>Safety comes first on every camping adventure, and our comprehensive first aid kits are designed to provide peace of mind in the wild. Packed with medical essentials to treat cuts, scrapes, burns, and minor injuries, our kits are a must-have for campers, hikers, and outdoor enthusiasts of all skill levels. Don’t let unexpected incidents spoil your trip—be prepared for anything.</p>
    <p>Our first aid kits are compact, lightweight, and organized for quick access in emergencies. Each kit includes bandages, antiseptics, medical tools, and easy-to-follow instructions, ensuring you have the resources to respond swiftly and effectively. Whether you’re camping with family or exploring solo, our kits are an essential part of your safety gear.</p>
    <p>Investing in a quality first aid kit means you’re ready for life’s little surprises on the trail. Protect yourself and your companions, and enjoy the great outdoors with confidence. Browse our selection to find the right first aid kit for your next adventure.</p>
  `,
  "Sleeping Gear > Air Beds": `
    <p>Experience home-like comfort in the wild with our superior range of camping air beds. Designed for durability and support, our air beds provide a restful night’s sleep, even on rugged ground. Easy to inflate and deflate, these beds are the perfect choice for campers who value convenience and a good night’s rest.</p>
    <p>Our air beds are crafted from tough, puncture-resistant materials and feature advanced air retention technology to prevent leaks and sagging. Choose from single or double sizes, raised or low-profile designs, to suit your tent and sleeping preferences. Many models come with built-in pumps or compact foot pumps for effortless setup.</p>
    <p>Upgrade your sleep system and wake up refreshed for every day’s adventure. Lightweight and portable, our air beds pack down small, making them ideal for car camping, festivals, or family trips. Enjoy the luxury of a comfortable bed wherever your travels take you.</p>
  `,
  "Tents > Dome Tents": `
    <p>Discover the versatility and convenience of dome tents—an essential for campers seeking quick setup and reliable shelter. Our collection of dome tents offers stability, weather resistance, and spacious interiors, making them the go-to choice for solo adventurers, couples, and families alike. The classic dome shape ensures excellent wind resistance and efficient water runoff, keeping you dry and comfortable.</p>
    <p>Our dome tents feature intuitive pole systems, lightweight materials, and ample ventilation for a comfortable camping experience in any season. With a variety of sizes and configurations, you can find the perfect tent for everything from weekend getaways to extended expeditions. Easy to pitch and pack away, these tents are ideal for both beginners and experienced campers.</p>
    <p>Enjoy peace of mind with tents designed for real-world adventures. Explore our selection of dome tents to find models with vestibules, multiple doors, and smart storage solutions to keep your gear organized. Start your next journey with a tent you can trust, wherever you roam.</p>
  `,
  "Tents > Tunnel Tents": `
    <p>Maximize space and comfort on your next camping trip with our innovative tunnel tents. Known for their elongated, tunnel-like structure, these tents provide generous living areas and headroom—perfect for families and groups. The aerodynamic design ensures stability in wind while creating a roomy, open interior for sleeping, relaxing, and storing gear.</p>
    <p>Tunnel tents in our range are easy to pitch with color-coded poles and clear instructions, allowing you to set up camp quickly and effortlessly. Large porches and multiple entrances offer flexibility and convenience, while high-quality materials provide reliable weather protection. Ventilation panels and mesh doors keep conditions fresh and bug-free.</p>
    <p>Whether you’re planning a festival weekend or a wilderness expedition, tunnel tents deliver comfort and practicality. Explore our collection to find spacious, reliable shelters that make every outdoor adventure more enjoyable. Embrace the outdoors with a tent that feels like home—no matter where you pitch it.</p>
  `
};

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
