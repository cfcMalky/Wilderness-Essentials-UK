// ...Your category/product/search logic as before...

// -- Guides Library data --
const guidesArr = [
  {
    file: "camping-checklist.html",
    title: "The Ultimate Camping Checklist for Beginners (UK Edition)",
    desc: "All the essentials you need for a safe, comfortable, and enjoyable trip—plus smart extras for British conditions."
  },
  {
    file: "choosing-tent.html",
    title: "How to Choose the Right Tent for UK Weather",
    desc: "How to pick a tent that keeps you dry and comfortable, whatever the British weather throws at you."
  },
  {
    file: "campfire-safety.html",
    title: "Campfire Safety & Leave No Trace Principles",
    desc: "Enjoy your campfire responsibly—laws, safety, and protecting nature while camping in the UK."
  },
  {
    file: "camp-cooking.html",
    title: "Backpacking Food Ideas & Camp Cooking Tips",
    desc: "Meal planning, lightweight food, and cooking strategies for wild campers and backpackers."
  },
  {
    file: "survival-gear.html",
    title: "Essential Survival Gear for UK Adventures",
    desc: "What to pack in your survival kit for safety and peace of mind on any adventure."
  },
  {
    file: "family-camping.html",
    title: "Family Camping: Tips for a Fun and Safe Trip with Kids",
    desc: "How to plan, what to pack, and making camping with children enjoyable and stress-free."
  },
  {
    file: "staying-dry.html",
    title: "Staying Dry: Clothing & Layering for Wet British Weather",
    desc: "The best clothing systems for staying comfortable in unpredictable UK weather."
  },
  {
    file: "wild-camping-uk.html",
    title: "Wild Camping in the UK: Law, Ethics, and Best Spots",
    desc: "Where you can wild camp legally, best practices, and top locations for a true wilderness experience."
  },
  {
    file: "sleeping-bags-mats.html",
    title: "Choosing and Using Sleeping Bags & Mats for UK Camping",
    desc: "How to pick sleeping bags and mats for British conditions, for restful sleep outdoors."
  }
];

// Show Guides Library Section
function showGuidesLibrary() {
  // Hide everything else
  document.getElementById("frontpageSEO").style.display = "none";
  document.getElementById("guideSection").style.display = "none";
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("subcatTilesSection").style.display = "none";
  document.getElementById("searchResultsSection").style.display = "none";

  // Show library
  const section = document.getElementById("guidesLibrarySection");
  section.style.display = "";
  const guidesList = document.getElementById("guidesList");
  guidesList.innerHTML = "";
  guidesArr.forEach(guide => {
    const card = document.createElement("div");
    card.style = "margin-bottom:1.6em; padding:1em 1.1em; background:#f6f5ee; border-radius:8px; box-shadow:0 2px 10px #0001;";
    const title = document.createElement("a");
    title.href = "#";
    title.textContent = guide.title;
    title.style = "font-size:1.14em;font-weight:700;color:#355f2e;text-decoration:underline;display:block;margin-bottom:0.5em;";
    title.onclick = (e) => {
      e.preventDefault();
      loadGuide(guide);
    };
    card.appendChild(title);
    const desc = document.createElement("div");
    desc.textContent = guide.desc;
    card.appendChild(desc);
    guidesList.appendChild(card);
  });
}

// Load a single guide
async function loadGuide(guide) {
  document.getElementById("guidesLibrarySection").style.display = "none";
  document.getElementById("guideSection").style.display = "block";
  document.getElementById("guideSection").innerHTML = `<div style="padding:2.2em 0;text-align:center;color:#888;">Loading guide...</div>`;
  try {
    const resp = await fetch(`guides/${guide.file}`);
    if (!resp.ok) throw new Error("404");
    const html = await resp.text();
    document.getElementById("guideSection").innerHTML = `<article>${html}</article>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    document.getElementById("guideSection").innerHTML = `<div style="padding:2.2em 0;text-align:center;color:#c00;">Unable to load guide.</div>`;
  }
}

// Attach to nav
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("guidesNavBtn").onclick = function() {
    showGuidesLibrary();
  };
  // ...your other setup code (logo click, search, etc)...
});