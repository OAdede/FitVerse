
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".recipe-card");

  cards.forEach(card => {
    const btn = card.querySelector(".expand-btn");
    btn.addEventListener("click", () => {
      const isActive = card.classList.contains("active");

      cards.forEach(c => {
        c.classList.remove("active");
        c.querySelector(".expand-btn").innerText = "Tarifi Gör";
      });

      if (!isActive) {
        card.classList.add("active");
        btn.innerText = "Tarifi Kapat";
      }
    });
  });

  const filterButtons = document.querySelectorAll(".filter-buttons button");
  const recipeCards = document.querySelectorAll(".recipe-card");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(".filter-buttons .active")?.classList.remove("active");
      button.classList.add("active");

      const filter = button.getAttribute("data-filter");
      recipeCards.forEach(card => {
        const category = card.getAttribute("data-category");
        card.style.display = (filter === "all" || category === filter) ? "flex" : "none";
      });
    });
  });
});
