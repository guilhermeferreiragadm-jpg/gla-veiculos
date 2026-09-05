import { fetchSheetCars } from "./fetch-sheet.js";

function getCarIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderCarDetail(car) {
  document.getElementById("pageTitle").textContent = `${car.modelo} ${car.ano} | GLA Veículos`;
  document.getElementById("pageDescription").setAttribute(
    "content",
    `${car.modelo}, ${car.ano}, ${formatKm(car.km)}, por ${formatPreco(car.preco)}. Disponível na GLA Veículos, Campinas-SP.`
  );

  const msg = encodeURIComponent(`Olá! Tenho interesse no ${car.modelo} (${car.ano}) anunciado no site.`);
  const opcionaisHtml = car.opcionais.map((item) => `<li><span class="check">✓</span> ${item}</li>`).join("");
  const fotos = car.fotos?.length ? car.fotos : null;
  const thumbsHtml = fotos && fotos.length > 1
    ? `<div class="carro-thumbs">${fotos.map((foto, i) => `<button type="button" class="carro-thumb${i === 0 ? " active" : ""}" data-foto="${foto}"><img src="${foto}" alt="${car.modelo} - foto ${i + 1}"></button>`).join("")}</div>`
    : "";

  const conteudo = document.getElementById("carroConteudo");
  conteudo.innerHTML = `
    <div class="carro-galeria">
      <div class="carro-foto-principal">
        ${car.blindado ? '<span class="car-badge-armor">Blindado</span>' : ""}
        ${fotos ? `<img src="${fotos[0]}" alt="${car.modelo}" id="carroFotoPrincipal">` : carIcon}
      </div>
      ${thumbsHtml}
    </div>
    <div class="carro-info">
      <span class="car-badge car-badge-static">${car.tipo}</span>
      <h1>${car.modelo}</h1>
      <div class="carro-price">${formatPreco(car.preco)}</div>

      <div class="carro-specs">
        <div class="spec"><span>Ano</span><strong>${car.ano}</strong></div>
        <div class="spec"><span>Quilometragem</span><strong>${formatKm(car.km)}</strong></div>
        <div class="spec"><span>Câmbio</span><strong>${car.cambio}</strong></div>
        <div class="spec"><span>Combustível</span><strong>${car.combustivel}</strong></div>
        <div class="spec"><span>Cor</span><strong>${car.cor}</strong></div>
        <div class="spec"><span>Portas</span><strong>${car.portas}</strong></div>
        <div class="spec"><span>Blindagem</span><strong>${car.blindado ? "Sim" : "Não"}</strong></div>
        <div class="spec"><span>Marca</span><strong>${car.marca}</strong></div>
      </div>

      <p class="carro-descricao">${car.descricao}</p>

      <div class="carro-opcionais">
        <h2>Opcionais</h2>
        <ul class="sobre-list">${opcionaisHtml}</ul>
      </div>

      <div class="carro-actions">
        <a class="btn btn-primary" href="https://wa.me/${WHATSAPP_NUMBER}?text=${msg}" target="_blank" rel="noopener">Tenho interesse — falar no WhatsApp</a>
        <button type="button" class="btn btn-outline-dark" id="btnCompartilhar">Compartilhar</button>
      </div>
      <p class="compartilhar-feedback" id="compartilharFeedback" aria-live="polite"></p>
    </div>
  `;

  const jsonLd = document.createElement("script");
  jsonLd.type = "application/ld+json";
  jsonLd.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.modelo,
    brand: car.marca,
    vehicleModelDate: String(car.ano),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.km, unitCode: "KMT" },
    fuelType: car.combustivel,
    vehicleTransmission: car.cambio,
    color: car.cor,
    offers: {
      "@type": "Offer",
      ...(car.preco != null ? { price: car.preco, priceCurrency: "BRL" } : {}),
      availability: "https://schema.org/InStock",
    },
  });
  document.head.appendChild(jsonLd);

  document.getElementById("btnCompartilhar")?.addEventListener("click", () => shareCar(car));

  document.querySelectorAll(".carro-thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("carroFotoPrincipal").src = btn.dataset.foto;
      document.querySelectorAll(".carro-thumb").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

async function shareCar(car) {
  const feedback = document.getElementById("compartilharFeedback");
  const shareData = {
    title: `${car.modelo} | GLA Veículos`,
    text: `Confira o ${car.modelo} (${car.ano}) na GLA Veículos`,
    url: window.location.href,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
    if (feedback) feedback.textContent = "Link copiado para a área de transferência!";
  } catch (err) {
    if (err?.name !== "AbortError" && feedback) {
      feedback.textContent = "Não foi possível compartilhar. Copie o link da página.";
    }
  }
}

function renderRelacionados(carAtual) {
  const relacionados = cars.filter((c) => c.id !== carAtual.id && c.tipo === carAtual.tipo).slice(0, 3);
  const lista = relacionados.length ? relacionados : cars.filter((c) => c.id !== carAtual.id).slice(0, 3);
  if (!lista.length) return;

  const grid = document.getElementById("relacionadosGrid");
  grid.innerHTML = lista
    .map((car) => {
      const msg = encodeURIComponent(`Olá! Tenho interesse no ${car.modelo} (${car.ano}) anunciado no site.`);
      return `
      <div class="car-card">
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

  document.getElementById("relacionadosSection").hidden = false;
}

document.addEventListener("DOMContentLoaded", async () => {
  const sheetCars = await fetchSheetCars();
  if (sheetCars && sheetCars.length) {
    cars.length = 0;
    cars.push(...sheetCars);
  }

  const car = getCarById(getCarIdFromUrl());
  if (!car) {
    document.getElementById("carroConteudo").remove();
    document.getElementById("carroNaoEncontrado").hidden = false;
    return;
  }
  renderCarDetail(car);
  renderRelacionados(car);
});
