function getFiltros() {
  const tipoBtn = document.querySelector(".filter-btn.active");
  const [precoMin, precoMax] = (document.getElementById("filtroPreco")?.value || "todos").split("-");
  const [kmMin, kmMax] = (document.getElementById("filtroKm")?.value || "todos").split("-");
  return {
    tipo: tipoBtn ? tipoBtn.dataset.filter : "todos",
    precoMin: precoMin === "todos" ? null : Number(precoMin),
    precoMax: precoMax === undefined ? null : Number(precoMax),
    kmMin: kmMin === "todos" ? null : Number(kmMin),
    kmMax: kmMax === undefined ? null : Number(kmMax),
    marca: document.getElementById("filtroMarca")?.value || "todos",
    busca: (document.getElementById("catalogoBusca")?.value || "").trim().toLowerCase(),
    ordenar: document.getElementById("catalogoOrdenar")?.value || "relevancia",
  };
}

function ordenarLista(list, ordenar) {
  const ordenada = [...list];
  switch (ordenar) {
    case "preco-asc":
      return ordenada.sort((a, b) => (a.preco ?? Infinity) - (b.preco ?? Infinity));
    case "preco-desc":
      return ordenada.sort((a, b) => (b.preco ?? -1) - (a.preco ?? -1));
    case "km-asc":
      return ordenada.sort((a, b) => a.km - b.km);
    case "ano-desc":
      return ordenada.sort((a, b) => b.ano - a.ano);
    default:
      return ordenada;
  }
}

function aplicarFiltros() {
  const f = getFiltros();
  let list = cars.filter((car) => {
    if (f.tipo !== "todos" && car.tipo !== f.tipo) return false;
    if (f.precoMin !== null && (car.preco == null || car.preco < f.precoMin || car.preco > f.precoMax)) return false;
    if (f.kmMin !== null && (car.km < f.kmMin || car.km > f.kmMax)) return false;
    if (f.marca !== "todos" && car.marca !== f.marca) return false;
    if (f.busca && !car.modelo.toLowerCase().includes(f.busca) && !String(car.ano).includes(f.busca)) return false;
    return true;
  });
  list = ordenarLista(list, f.ordenar);
  renderCatalogo(list);
}

function popularFiltroMarca() {
  const select = document.getElementById("filtroMarca");
  if (!select) return;
  const doEstoque = new Set(cars.map((c) => c.marca));
  const marcas = [...new Set([...MARCAS_DISPONIVEIS, ...doEstoque])].sort((a, b) => a.localeCompare(b, "pt-BR"));
  marcas.forEach((marca) => {
    const option = document.createElement("option");
    option.value = marca;
    option.textContent = marca;
    select.appendChild(option);
  });
}

function renderCatalogo(list) {
  const grid = document.getElementById("catalogoGrid");
  const resultado = document.getElementById("catalogoResultado");
  if (!grid) return;

  if (resultado) {
    resultado.textContent = list.length
      ? `${list.length} veículo${list.length > 1 ? "s" : ""} encontrado${list.length > 1 ? "s" : ""}`
      : "Nenhum veículo encontrado com esses filtros.";
  }

  grid.innerHTML = list
    .map((car) => {
      const msg = encodeURIComponent(`Olá! Tenho interesse no ${car.modelo} (${car.ano}) anunciado no site.`);
      return `
      <div class="car-card" data-tipo="${car.tipo}">
        <a class="car-media" href="carro.html?id=${car.id}">
          <span class="car-badge">${car.tipo}</span>
          ${car.blindado ? '<span class="car-badge-armor">Blindado</span>' : ""}
          ${car.fotos?.length ? `<img src="${car.fotos[0]}" alt="${car.modelo}" loading="lazy">` : carIcon}
        </a>
        <div class="car-body">
          <h3><a href="carro.html?id=${car.id}">${car.modelo}</a></h3>
          <div class="car-meta">
            <span>${car.ano}</span>
            <span>${formatKm(car.km)}</span>
            ${car.blindado ? "<span>Blindado</span>" : ""}
          </div>
          <div class="car-price">${formatPreco(car.preco)}</div>
          <div class="car-actions">
            <a class="car-cta" href="carro.html?id=${car.id}">Ver detalhes</a>
            <a class="car-cta car-cta-whatsapp" href="https://wa.me/${WHATSAPP_NUMBER}?text=${msg}" target="_blank" rel="noopener">Tenho interesse</a>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      aplicarFiltros();
    });
  });

  ["filtroPreco", "filtroKm", "filtroMarca", "catalogoOrdenar"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", aplicarFiltros);
  });

  let buscaTimeout;
  document.getElementById("catalogoBusca")?.addEventListener("input", () => {
    clearTimeout(buscaTimeout);
    buscaTimeout = setTimeout(aplicarFiltros, 200);
  });

  document.getElementById("filtroLimpar")?.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    buttons[0]?.classList.add("active");
    ["filtroPreco", "filtroKm", "filtroMarca"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "todos";
    });
    const busca = document.getElementById("catalogoBusca");
    if (busca) busca.value = "";
    const ordenar = document.getElementById("catalogoOrdenar");
    if (ordenar) ordenar.value = "relevancia";
    aplicarFiltros();
  });
}

function setupAvalieForm() {
  const form = document.getElementById("avalieForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = data.get("nome");
    const telefone = data.get("telefone");
    const modelo = data.get("modelo");
    const ano = data.get("ano");
    const obs = data.get("obs");

    const lines = [
      "Olá! Gostaria de uma avaliação para meu carro:",
      `Nome: ${nome}`,
      `Telefone: ${telefone}`,
      `Modelo: ${modelo}`,
      `Ano: ${ano}`,
    ];
    if (obs) lines.push(`Observações: ${obs}`);

    const msg = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank", "noopener");
  });
}

function setupCounters() {
  const nums = document.querySelectorAll(".stat-num");
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target).toLocaleString("pt-BR");
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  nums.forEach((el) => observer.observe(el));
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", async () => {
  popularFiltroMarca();
  renderCatalogo(cars);
  setupFilters();
  setupAvalieForm();
  setupCounters();
  setupReveal();

  const sheetCars = await fetchSheetCars();
  if (sheetCars && sheetCars.length) {
    cars.length = 0;
    cars.push(...sheetCars);
    document.getElementById("filtroMarca").innerHTML = '<option value="todos">Todas as marcas</option>';
    popularFiltroMarca();
    aplicarFiltros();
  }
});
