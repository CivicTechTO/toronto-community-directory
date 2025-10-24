document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".community-card");
  const allButton = document.querySelector('.filter-btn[data-filter="all"]');
  const clearButton = document.getElementById("clear-filters");
  const modeToggle = document.getElementById("filter-mode-toggle");
  const activeFiltersContainer = document.getElementById("active-filters");
  const activeFiltersList = document.querySelector(".active-filters-list");
  const resultsCount = document.getElementById("results-count");
  const categories = document.querySelectorAll(".filter-category");

  let filterMode = "OR"; // 'OR', 'AND', or 'NOT'
  const modes = ["OR", "AND", "NOT"];

  // Initialize category counts
  function updateCategoryCounts() {
    categories.forEach((category) => {
      const buttons = category.querySelectorAll(".filter-btn.tree-node");
      const activeButtons = category.querySelectorAll(
        ".filter-btn.tree-node.active"
      );
      const countSpan = category.querySelector(".category-count");

      if (activeButtons.length > 0) {
        countSpan.textContent = `(${activeButtons.length})`;
        countSpan.style.display = "inline";
        category.classList.add("has-active");
      } else {
        countSpan.style.display = "none";
        category.classList.remove("has-active");
      }
    });
  }

  // Update active filters display
  function updateActiveFilters() {
    const activeFilters = Array.from(
      document.querySelectorAll(".filter-btn.active")
    )
      .map((btn) => btn.dataset.filter)
      .filter((filter) => filter !== "all");

    if (activeFilters.length === 0) {
      activeFiltersContainer.style.display = "none";
      clearButton.style.display = "none";
    } else {
      activeFiltersContainer.style.display = "flex";
      clearButton.style.display = "inline-block";

      activeFiltersList.innerHTML = activeFilters
        .map((filter) => {
          const displayText = filter.split("/").join(" › ").replace(/-/g, " ");
          return `<span class="active-filter-tag" data-filter="${filter}">
            ${displayText}
            <button class="remove-filter" data-filter="${filter}" aria-label="Remove ${displayText}">×</button>
          </span>`;
        })
        .join("");

      // Add event listeners to remove buttons
      document.querySelectorAll(".remove-filter").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const filter = btn.dataset.filter;
          const filterBtn = document.querySelector(
            `.filter-btn[data-filter="${filter}"]`
          );
          if (filterBtn) {
            filterBtn.click();
          }
        });
      });
    }

    updateCategoryCounts();
  }

  // Update results count
  function updateResultsCount() {
    const visibleCards = Array.from(cards).filter(
      (card) => card.style.display !== "none"
    );
    const total = cards.length;
    const visible = visibleCards.length;

    if (visible === total) {
      resultsCount.textContent = `Showing all ${total} communities`;
    } else {
      resultsCount.textContent = `Showing ${visible} of ${total} communities`;
    }
  }

  // Check if a tag matches a filter (handles prefix matching)
  function tagMatchesFilter(tag, filter, filterPrefix) {
    // Exact match
    if (tag === filter) return true;

    // Prefix match (e.g., "instance-of/festival" matches "instance-of/festival/music-festival")
    if (filterPrefix && tag.startsWith(filterPrefix)) return true;

    return false;
  }

  // Update mode toggle text and apply filtering
  function updateMode() {
    if (modeToggle) {
      const modeText = {
        OR: "OR (ANY)",
        AND: "AND (ALL)",
        NOT: "NOT (NONE)",
      };

      const modeValue = modeToggle.querySelector(".mode-value");
      modeValue.textContent = modeText[filterMode];

      const nextMode = modes[(modes.indexOf(filterMode) + 1) % modes.length];
      const ariaText = {
        OR: "Switch to AND mode - show communities with all selected tags",
        AND: "Switch to NOT mode - show communities without selected tags",
        NOT: "Switch to OR mode - show communities with any selected tag",
      };

      modeToggle.setAttribute("aria-label", ariaText[filterMode]);
      modeToggle.classList.remove("mode-or", "mode-and", "mode-not");
      modeToggle.classList.add(`mode-${filterMode.toLowerCase()}`);
    }
    applyFilters();
  }

  // Apply current filters based on mode
  function applyFilters() {
    const activeFilterButtons = Array.from(
      document.querySelectorAll(".filter-btn.active")
    ).filter((btn) => btn.dataset.filter !== "all");

    const activeFilters = activeFilterButtons.map((btn) => ({
      filter: btn.dataset.filter,
      prefix: btn.dataset.filterPrefix,
    }));

    if (activeFilters.length === 0) {
      cards.forEach((card) => (card.style.display = "block"));
    } else {
      cards.forEach((card) => {
        const tags = card.dataset.tags.split(" ");
        let shouldShow = false;

        switch (filterMode) {
          case "OR":
            // Show if card has ANY of the selected tags (or their children)
            shouldShow = activeFilters.some(({ filter, prefix }) =>
              tags.some((tag) => tagMatchesFilter(tag, filter, prefix))
            );
            break;
          case "AND":
            // Show if card has ALL of the selected tags (or their children)
            shouldShow = activeFilters.every(({ filter, prefix }) =>
              tags.some((tag) => tagMatchesFilter(tag, filter, prefix))
            );
            break;
          case "NOT":
            // Show if card has NONE of the selected tags (or their children)
            shouldShow = !activeFilters.some(({ filter, prefix }) =>
              tags.some((tag) => tagMatchesFilter(tag, filter, prefix))
            );
            break;
        }

        card.style.display = shouldShow ? "block" : "none";
      });
    }

    updateResultsCount();
    updateActiveFilters();
  }

  // Clear all filters
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      filterButtons.forEach((btn) => {
        if (btn.dataset.filter !== "all") {
          btn.classList.remove("active");
        }
      });
      allButton.classList.add("active");
      cards.forEach((card) => (card.style.display = "block"));
      updateActiveFilters();
      updateResultsCount();
    });
  }

  // Mode toggle functionality
  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      const currentIndex = modes.indexOf(filterMode);
      filterMode = modes[(currentIndex + 1) % modes.length];
      updateMode();
    });
  }

  // Category toggle icons
  categories.forEach((category) => {
    const summary = category.querySelector("summary");
    const icon = summary.querySelector(".category-icon");

    category.addEventListener("toggle", () => {
      if (category.open) {
        icon.textContent = "▾";
      } else {
        icon.textContent = "▸";
      }
    });
  });

  // Filter button functionality
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      if (filter === "all") {
        // Clear all other selections and show all cards
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        cards.forEach((card) => (card.style.display = "block"));
        updateActiveFilters();
        updateResultsCount();
      } else {
        // Remove "All" selection if a specific filter is clicked
        allButton.classList.remove("active");

        // Toggle the clicked button
        button.classList.toggle("active");

        // Get all currently active filters
        const activeFilters = Array.from(
          document.querySelectorAll(".filter-btn.active")
        )
          .map((btn) => btn.dataset.filter)
          .filter((filter) => filter !== "all");

        // If no filters are active, show all cards
        if (activeFilters.length === 0) {
          allButton.classList.add("active");
          cards.forEach((card) => (card.style.display = "block"));
          updateActiveFilters();
          updateResultsCount();
        } else {
          applyFilters();
        }
      }
    });
  });

  // Initialize
  updateMode();
  updateResultsCount();
  updateCategoryCounts();
});
