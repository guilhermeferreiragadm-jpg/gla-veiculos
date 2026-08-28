function getStoreStatus(now = new Date()) {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const OPEN_WEEKDAY = 9 * 60;
  const CLOSE_WEEKDAY = 17 * 60 + 30;
  const OPEN_SAT = 9 * 60;
  const CLOSE_SAT = 12 * 60;
  const isWeekday = day >= 1 && day <= 5;
  const isSaturday = day === 6;

  if (isWeekday && minutes >= OPEN_WEEKDAY && minutes < CLOSE_WEEKDAY) {
    return { open: true, message: "Fecha às 17h30" };
  }
  if (isSaturday && minutes >= OPEN_SAT && minutes < CLOSE_SAT) {
    return { open: true, message: "Fecha às 12h" };
  }
  if (isWeekday && minutes < OPEN_WEEKDAY) return { open: false, message: "Abre hoje às 9h" };
  if (isSaturday && minutes < OPEN_SAT) return { open: false, message: "Abre hoje às 9h" };
  if (day === 5 && minutes >= CLOSE_WEEKDAY) return { open: false, message: "Abre sábado às 9h" };
  if (isWeekday && minutes >= CLOSE_WEEKDAY) return { open: false, message: "Abre amanhã às 9h" };
  if (isSaturday && minutes >= CLOSE_SAT) return { open: false, message: "Abre segunda às 9h" };
  return { open: false, message: "Abre segunda às 9h" };
}

function setupStoreStatus() {
  const badges = document.querySelectorAll("[data-store-status]");
  if (!badges.length) return;
  const status = getStoreStatus();
  badges.forEach((badge) => {
    badge.classList.toggle("status-open", status.open);
    badge.classList.toggle("status-closed", !status.open);
    const label = badge.querySelector(".status-label");
    const detail = badge.querySelector(".status-detail");
    if (label) label.textContent = status.open ? "Aberto agora" : "Fechado agora";
    if (detail) detail.textContent = status.message;
  });
}

function setupCookieConsent() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;
  const accepted = localStorage.getItem("gla_cookie_consent");
  if (accepted === "accepted") return;

  banner.classList.add("visible");
  document.getElementById("cookieAccept")?.addEventListener("click", () => {
    localStorage.setItem("gla_cookie_consent", "accepted");
    banner.classList.remove("visible");
  });
}

function setupNavToggle() {
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("navToggle");
  if (!toggle || !header) return;
  toggle.addEventListener("click", () => header.classList.toggle("nav-open"));
  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => header.classList.remove("nav-open"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupStoreStatus();
  setupCookieConsent();
  setupNavToggle();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
