
const STAR_TECH_URL = "https://www.startech.com.bd/";

const products = [
  { id: 1, name: "Laptop", category: "Laptop", icon: "💻", url: "" },
  { id: 2, name: "Gaming Accessories", category: "Gaming", icon: "🎮", url: "" },
  { id: 3, name: "Smartphone", category: "Phone", icon: "📱", url: "" },
  { id: 4, name: "Monitor", category: "Monitor", icon: "🖥️", url: "" },
  { id: 5, name: "Camera", category: "Camera", icon: "📷", url: "" },
  { id: 6, name: "Computer Accessories", category: "Accessories", icon: "🔌", url: "" },
  { id: 7, name: "Desktop PC", category: "Desktop", icon: "🖥️", url: "" },
  { id: 8, name: "Networking Device", category: "Networking", icon: "📡", url: "" }
];

const categories = [
  ["💻", "Laptop"],
  ["🖥️", "Desktop"],
  ["🎮", "Gaming"],
  ["📱", "Phone"],
  ["🖥️", "Monitor"],
  ["📷", "Camera"],
  ["🔌", "Accessories"],
  ["📡", "Networking"],
  ["📺", "TV"],
  ["🔋", "Components"]
];

let activeCategory = "All";
let savedLinks = [];

function showPage(page) {
  document.querySelectorAll(".page").forEach(element => {
    element.classList.remove("active");
  });

  const target = document.getElementById(page);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav").forEach(element => {
    element.classList.toggle("active", element.dataset.page === page);
  });

  if (page === "products") renderProducts();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderChips() {
  const container = document.getElementById("product-chips");
  if (!container) return;

  const names = ["All", ...new Set(products.map(product => product.category))];

  container.innerHTML = names.map(name => `
    <button class="chip ${name === activeCategory ? "active" : ""}"
      onclick="setCategory('${name}')">${name}</button>
  `).join("");
}

function setCategory(category) {
  activeCategory = category;
  renderChips();
  renderProducts();
  showPage("products");
}

function renderProducts() {
  const list = document.getElementById("product-list");
  if (!list) return;

  const search = (
    document.getElementById("search")?.value || ""
  ).toLowerCase();

  const filtered = products.filter(product =>
    (activeCategory === "All" || product.category === activeCategory) &&
    (product.name.toLowerCase().includes(search) ||
     product.category.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty">No matching products found.</div>';
    return;
  }

  list.innerHTML = filtered.map(product => `
    <article class="card product">
      <div class="product-art">${product.icon}</div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="muted">${product.category}</div>
        <div class="price">Price: Not verified</div>
        <div class="status unknown">● Stock status unavailable</div>
        <button class="btn" onclick="productDetails(${product.id})">
          Open Product
        </button>
        <button class="btn secondary" onclick="saveLink(${product.id})">
          🔗 Get Affiliate Link
        </button>
        <button class="btn secondary" onclick="shareProduct(${product.id})">
          Share Product
        </button>
      </div>
    </article>
  `).join("");
}

function renderCategories() {
  const container = document.getElementById("category-grid");
  if (!container) return;

  container.innerHTML = categories.map(([icon, name]) => `
    <button class="tile" onclick="setCategory('${name}')">
      <span class="emoji">${icon}</span>
      <strong>${name}</strong>
      <small>Browse category</small>
    </button>
  `).join("");
}

function productDetails(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  alert(
    product.name +
    "\n\nCategory: " + product.category +
    "\nPrice: Not verified" +
    "\nAvailability: Not verified" +
    "\n\nA verified product URL is needed for product-specific details."
  );
}

function saveLink(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  if (!product.url) {
    alert(
      "No verified affiliate link is configured for this item yet.\n\n" +
      "Add the correct tracking link from your Star Tech affiliate account first."
    );
    return;
  }

  if (!savedLinks.some(item => item.id === id)) {
    savedLinks.push(product);
  }

  renderSavedLinks();
  alert("Link saved for this session.");
}

function renderSavedLinks() {
  const container = document.getElementById("saved-links");
  if (!container) return;

  if (savedLinks.length === 0) {
    container.innerHTML = '<div class="empty">No links saved yet.</div>';
    return;
  }

  container.innerHTML = savedLinks.map(product => `
    <div class="list-item">
      <strong>${product.name}</strong>
      <div class="muted">${product.url}</div>
      <button class="btn secondary" onclick="copyLink(${product.id})">
        Copy Link
      </button>
    </div>
  `).join("");
}

async function copyLink(id) {
  const product = savedLinks.find(item => item.id === id);
  if (!product) return;

  try {
    await navigator.clipboard.writeText(product.url);
    alert("Link copied.");
  } catch {
    prompt("Copy your link:", product.url);
  }
}

function shareProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const url = product.url || STAR_TECH_URL;
  const text = product.name + " — Check Star Tech: " + url;

  if (navigator.share) {
    navigator.share({
      title: product.name,
      text: text,
      url: url
    }).catch(() => {});
  } else {
    prompt("Copy and share this text:", text);
  }
}

function shareApp() {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: "AG Affiliate Income",
      text: "Explore AG Affiliate Income",
      url: url
    }).catch(() => {});
  } else {
    prompt("Copy your Mini App URL:", url);
  }
}

function openStarTech() {
  window.open(STAR_TECH_URL, "_blank", "noopener,noreferrer");
}

function initTelegram() {
  const telegram = window.Telegram?.WebApp;
  if (!telegram) return;

  telegram.ready();
  telegram.expand();

  const user = telegram.initDataUnsafe?.user;
  if (!user) return;

  const nameElement = document.getElementById("profile-name");
  const usernameElement = document.getElementById("profile-username");
  const idElement = document.getElementById("profile-id");

  if (nameElement) {
    nameElement.textContent =
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      "Telegram User";
  }

  if (usernameElement) {
    usernameElement.textContent = user.username
      ? "@" + user.username
      : "Not set";
  }

  if (idElement) {
    idElement.textContent = user.id ? String(user.id) : "Unavailable";
  }
}

renderChips();
renderProducts();
renderCategories();
initTelegram();
