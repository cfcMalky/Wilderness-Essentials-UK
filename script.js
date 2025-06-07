// ...fetchProductsFromSheet and buildNavStructure as before...

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

// ...rest of your code (carousel, selectCategoryByPath, etc)...
document.addEventListener('DOMContentLoaded', async function () {
  await fetchProductsFromSheet();
  buildNavWithMegaMenu();
  buildHeroCarouselFromSheet();
});
