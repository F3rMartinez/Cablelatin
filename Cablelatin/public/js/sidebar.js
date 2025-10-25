// Submenús desplegables
document.querySelectorAll(".has-submenu").forEach((item) => {
  const header = item.querySelector(".submenu-header");
  header.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

// Botón para colapsar/expandir sidebar
const toggleBtn = document.getElementById("sidebar-toggle-internal");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
  });
}
