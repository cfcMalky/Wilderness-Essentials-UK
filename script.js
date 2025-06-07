// Navigation data
const categories = [
  {
    name: "Camp Kitchen", subcategories: [
      { name: "Stove Accessories", id: "stove-accessories" },
      { name: "Cookware", id: "cookware" },
      { name: "Utensils", id: "utensils" }
    ]
  },
  {
    name: "Sleeping Gear", subcategories: [
      { name: "Air Beds", id: "air-beds" },
      { name: "Sleeping Bags", id: "sleeping-bags" }
    ]
  },
  {
    name: "Tents", subcategories: [
      { name: "Dome Tents", id: "dome-tents" },
      { name: "Tunnel Tents", id: "tunnel-tents" }
    ]
  }
];

// Build dropdown navigation
function buildNav() {
  const navMenu = document.getElementById('navMenu');
  navMenu.innerHTML = '';
  categories.forEach(cat => {
    const li = document.createElement('li');
    if (cat.subcategories && cat.subcategories.length > 0) {
      const btn = document.createElement('button');
      btn.className = 'nav-link';
      btn.textContent = cat.name;
      btn.tabIndex = 0;
      const dropdown = document.createElement('div');
      dropdown.className = 'nav-dropdown';
      cat.subcategories.forEach(sub => {
        const subLink = document.createElement('a');
        subLink.href = '#';
        subLink.textContent = sub.name;
        subLink.tabIndex = 0;
        subLink.onclick = (e) => {
          e.preventDefault();
          alert(`Navigate to: ${cat.name} > ${sub.name}`);
          // Your code here: update main content, load products, etc.
        };
        dropdown.appendChild(subLink);
      });
      li.appendChild(btn);
      li.appendChild(dropdown);
    } else {
      const link = document.createElement('a');
      link.className = 'nav-link';
      link.href = '#';
      link.textContent = cat.name;
      li.appendChild(link);
    }
    navMenu.appendChild(li);
  });
  // Add About as a static link
  const aboutLi = document.createElement('li');
  aboutLi.innerHTML = `<a class="nav-link" href="#">About</a>`;
  navMenu.appendChild(aboutLi);
}
buildNav();

// Example carousel data
const carouselSlides = [
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
    title: "Dome Tents",
    desc: "Explore our top-rated dome tents, perfect for all UK conditions and campsites."
  },
  {
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=700&q=80",
    title: "Air Beds",
    desc: "Rest easy with our selection of comfortable, reliable air beds for any adventure."
  },
  {
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80",
    title: "Cookware",
    desc: "Cook up a storm with the best outdoor cookware, tried and tested by campers."
  }
];

function buildHeroCarousel() {
  const hero = document.getElementById("heroCarousel");
  if (!carouselSlides.length) {
    hero.innerHTML = `<div style="color:#a00;text-align:center;padding:2em;font-size:1.2em;">No featured products</div>`;
    return;
  }
  hero.innerHTML = "";
  carouselSlides.forEach((s, i) => {
    const slide = document.createElement('div');
    slide.className = "hero-carousel-slide" + (i===0 ? " active" : "");
    slide.innerHTML = `
      <img class="hero-carousel-image" src="${s.image}" alt="">
      <div class="hero-carousel-content">
        <div class="hero-carousel-title">${s.title}</div>
        <div class="hero-carousel-desc">${s.desc}</div>
      </div>
    `;
    hero.appendChild(slide);
  });
  // Dots nav
  const nav = document.createElement('div');
  nav.className = "hero-carousel-nav";
  for (let i=0; i<carouselSlides.length; ++i) {
    const dot = document.createElement('button');
    dot.className = "hero-carousel-dot" + (i===0 ? " active" : "");
    dot.setAttribute("aria-label", `Show slide ${i+1}`);
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
    setHeroCarouselSlide((current+1)%carouselSlides.length);
  }
  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, 5000);
  }
  resetTimer();
}
buildHeroCarousel();
