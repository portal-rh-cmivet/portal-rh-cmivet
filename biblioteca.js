const FAVORITES_KEY = "cmivet-biblioteca-favoritos";

const categoryIcons = {
  "POPs": "🐾",
  "Manuais": "📘",
  "Formulários RH": "📄",
  "Treinamentos": "🎓",
  "Saúde Ocupacional": "💊",
  "Benefícios": "🎁",
  "Calendário RH": "📅",
  "Outros": "📁"
};

let documents = [];
let trails = [];
let selectedCategory = "";

const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
  catch { return []; }
}

function setFavorites(items) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
  setFavorites(next);
  renderDocuments();
  renderFavorites();
  showToast(next.includes(id) ? "Adicionado aos favoritos." : "Removido dos favoritos.");
}

function documentCard(item) {
  const favorites = getFavorites();
  const favored = favorites.includes(item.id);
  const openLink = item.url
    ? `<a class="btn primary link-btn" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Abrir</a>`
    : `<span class="btn ghost disabled">Em breve</span>`;
  const downloadLink = item.download && item.url
    ? `<a class="btn secondary link-btn" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Baixar</a>`
    : "";

  return `
    <article class="document-card">
      <div class="document-top">
        <div class="document-icon">${categoryIcons[item.category] || "📁"}</div>
        <button class="favorite-btn" data-favorite="${escapeHtml(item.id)}" title="Favoritar">${favored ? "⭐" : "☆"}</button>
      </div>
      <div class="badges">
        <span class="badge">${escapeHtml(item.category)}</span>
        <span class="badge">${escapeHtml(item.type)}</span>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.description)}</p>
      <div class="meta">
        <span><strong>Atualização:</strong> ${escapeHtml(item.updatedAt)}</span>
        <span><strong>Responsável:</strong> ${escapeHtml(item.owner)}</span>
      </div>
      <div class="card-actions">${openLink}${downloadLink}</div>
    </article>
  `;
}

function filteredDocuments() {
  const search = document.querySelector("#searchInput").value.trim().toLowerCase();
  const category = selectedCategory || document.querySelector("#categoryFilter").value;
  const type = document.querySelector("#typeFilter").value;

  return documents.filter(item => {
    const searchable = `${item.title} ${item.description} ${item.category} ${item.owner} ${item.type}`.toLowerCase();
    return (!search || searchable.includes(search))
      && (!category || item.category === category)
      && (!type || item.type === type);
  });
}

function renderDocuments() {
  const list = filteredDocuments();
  document.querySelector("#resultCount").textContent =
    list.length === 1 ? "1 documento encontrado" : `${list.length} documentos encontrados`;
  document.querySelector("#documentGrid").innerHTML =
    list.length ? list.map(documentCard).join("") : `<div class="empty">Nenhum documento encontrado.</div>`;

  document.querySelectorAll("[data-favorite]").forEach(button => {
    button.addEventListener("click", () => toggleFavorite(button.dataset.favorite));
  });
}

function renderFavorites() {
  const favorites = getFavorites();
  const list = documents.filter(item => favorites.includes(item.id));
  document.querySelector("#favoriteGrid").innerHTML =
    list.length ? list.map(documentCard).join("") : `<div class="empty">Nenhum documento favorito.</div>`;

  document.querySelectorAll("#favoriteGrid [data-favorite]").forEach(button => {
    button.addEventListener("click", () => toggleFavorite(button.dataset.favorite));
  });
}

function renderCategories() {
  const counts = documents.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));

  document.querySelector("#categoryCards").innerHTML = entries.map(([category, count]) => `
    <button class="category-card ${selectedCategory === category ? "active" : ""}" data-category="${escapeHtml(category)}">
      <span>${categoryIcons[category] || "📁"}</span>
      <strong>${escapeHtml(category)}</strong>
      <small>${count} ${count === 1 ? "item" : "itens"}</small>
    </button>
  `).join("");

  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = selectedCategory === button.dataset.category ? "" : button.dataset.category;
      document.querySelector("#categoryFilter").value = selectedCategory;
      renderCategories();
      renderDocuments();
    });
  });

  document.querySelector("#categoryFilter").innerHTML =
    `<option value="">Todas as categorias</option>` +
    entries.map(([category]) => `<option>${escapeHtml(category)}</option>`).join("");

  const types = [...new Set(documents.map(item => item.type))].sort();
  document.querySelector("#typeFilter").innerHTML =
    `<option value="">Todos os tipos</option>` +
    types.map(type => `<option>${escapeHtml(type)}</option>`).join("");
}

function renderTrails() {
  document.querySelector("#trailGrid").innerHTML = trails.map(item => `
    <article class="trail-card">
      <span>${escapeHtml(item.icon)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="progress"><span style="width:${Math.max(0, Math.min(100, item.progress))}%"></span></div>
      <div class="trail-footer"><span>${item.progress}% concluído</span><span>${item.modules} módulos</span></div>
    </article>
  `).join("");
}

function openView(view) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === view);
  });
  document.querySelectorAll(".menu-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  const titles = { biblioteca: "Biblioteca RH", universidade: "Universidade CMIVET", favoritos: "Meus Favoritos" };
  document.querySelector("#pageTitle").textContent = titles[view] || "Biblioteca RH";
  document.querySelector("#sidebar").classList.remove("open");
  if (view === "favoritos") renderFavorites();
}

async function loadLibrary() {
  try {
    const response = await fetch(`biblioteca.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
    const data = await response.json();
    documents = Array.isArray(data.documents) ? data.documents : [];
    trails = Array.isArray(data.trails) ? data.trails : [];
    renderCategories();
    renderDocuments();
    renderFavorites();
    renderTrails();
    document.querySelector("#libraryStatus").textContent = `${documents.length} documentos`;
    document.querySelector("#libraryStatus").className = "library-status online";
  } catch (error) {
    console.error(error);
    document.querySelector("#documentGrid").innerHTML = `<div class="empty">Não foi possível carregar a biblioteca.</div>`;
    document.querySelector("#libraryStatus").textContent = "Biblioteca indisponível";
    document.querySelector("#libraryStatus").className = "library-status offline";
  }
}

document.querySelector("#searchInput").addEventListener("input", renderDocuments);
document.querySelector("#categoryFilter").addEventListener("change", event => {
  selectedCategory = event.target.value;
  renderCategories();
  renderDocuments();
});
document.querySelector("#typeFilter").addEventListener("change", renderDocuments);
document.querySelector("#clearFilters").addEventListener("click", () => {
  selectedCategory = "";
  document.querySelector("#searchInput").value = "";
  document.querySelector("#categoryFilter").value = "";
  document.querySelector("#typeFilter").value = "";
  renderCategories();
  renderDocuments();
});

document.querySelectorAll(".menu-item").forEach(button => {
  button.addEventListener("click", () => openView(button.dataset.view));
});
document.querySelector("#mobileMenu").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("open");
});

loadLibrary();
