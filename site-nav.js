document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  const menu = dropdown.querySelector(".nav-dropdown-menu");

  if (!toggle || !menu) {
    return;
  }

  const closeMenu = () => {
    dropdown.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  const openMenu = () => {
    dropdown.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  };

  const clickedPortfolio = sessionStorage.getItem("portfolioClicked") === "true";
  const isPortfolioPage = window.location.pathname.endsWith("/portfolio.html");
  const isFreePage = window.location.pathname.endsWith("/free/") || window.location.pathname.endsWith("/free/index.html");

  if (clickedPortfolio && (isPortfolioPage || isFreePage)) {
    openMenu();
    sessionStorage.removeItem("portfolioClicked");
  }

  toggle.addEventListener("click", () => {
    sessionStorage.setItem("portfolioClicked", "true");
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
});
