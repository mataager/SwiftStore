document.addEventListener("DOMContentLoaded", function () {
  const filterBtn = document.getElementById("filterBtn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("closeBtn");
  const seeSelectionBtn = document.getElementById("seeSelection");
  const clearFiltersBtn = document.querySelector(".clear-btn");
  const sortOptions = document.querySelectorAll(".sort-options button");
  const genderOptions = document.querySelectorAll(".gender-options button");
  const sizeOptions = document.querySelectorAll(".size-options button");
  const footwearOptions = document.querySelectorAll(".footwear-options button");
  const brandsOptions = document.querySelectorAll(".brands-options button");
  const colorOptions = document.querySelectorAll(".color-circle");
  const productList = document.querySelector(".product-list");

  let selectedFilters = {
    sort: "New Arrival",
    gender: "",
    sizes: [],
    footwearSizes: [],
    brands: [],
    colors: [],
  };

  // Add transition for smooth animation
  sidebar.style.transition = "left 0.3s ease-in-out";

  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  const detectedCategory = getUrlParameter("category");

  function hideOtherGenderOptions() {
    if (detectedCategory) {
      const category = detectedCategory.toLowerCase();
      genderOptions.forEach((option) => {
        const genderText = option.innerText.toLowerCase();
        if (genderText !== category) {
          option.style.display = "none";
        } else {
          option.style.display = "block";
          option.classList.add("active-selection");
          selectedFilters.gender = genderText;
        }
      });
    }
  }

  hideOtherGenderOptions();

  filterBtn.addEventListener("click", () => {
    sidebar.style.left = "0";
    // Add overlay when sidebar opens
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = "999";
    overlay.style.transition = "opacity 0.3s ease";
    overlay.style.opacity = "0";
    document.body.appendChild(overlay);

    // Fade in overlay
    setTimeout(() => {
      overlay.style.opacity = "1";
    }, 10);

    // Close sidebar when clicking outside
    overlay.addEventListener("click", () => {
      closeSidebar();
    });
  });

  function closeSidebar() {
    sidebar.style.left = "-350px";
    const overlay = document.querySelector(".sidebar-overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
  }

  closeBtn.addEventListener("click", closeSidebar);

  sortOptions.forEach((option) => {
    option.addEventListener("click", () => {
      sortOptions.forEach((btn) => btn.classList.remove("active-selection"));
      option.classList.add("active-selection");
      selectedFilters.sort = option.innerText;
      updateProductDisplay();
      updateActiveFiltersBar();
    });
  });

  genderOptions.forEach((option) => {
    option.addEventListener("click", () => {
      genderOptions.forEach((btn) => btn.classList.remove("active-selection"));
      option.classList.add("active-selection");
      selectedFilters.gender = option.innerText;
    });
  });

  sizeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      option.classList.toggle("active-selection");
      const size = option.innerText;
      if (option.classList.contains("active-selection")) {
        selectedFilters.sizes.push(size);
      } else {
        selectedFilters.sizes = selectedFilters.sizes.filter((s) => s !== size);
      }
    });
  });

  footwearOptions.forEach((option) => {
    option.addEventListener("click", () => {
      option.classList.toggle("active-selection");
      const footwearSize = option.innerText;
      if (option.classList.contains("active-selection")) {
        selectedFilters.footwearSizes.push(footwearSize);
      } else {
        selectedFilters.footwearSizes = selectedFilters.footwearSizes.filter(
          (size) => size !== footwearSize
        );
      }
    });
  });

  brandsOptions.forEach((option) => {
    option.addEventListener("click", () => {
      option.classList.toggle("active-selection");
      const brand = option.innerText;
      if (option.classList.contains("active-selection")) {
        selectedFilters.brands.push(brand);
      } else {
        selectedFilters.brands = selectedFilters.brands.filter(
          (b) => b !== brand
        );
      }
    });
  });

  colorOptions.forEach((option) => {
    option.addEventListener("click", () => {
      option.classList.toggle("selected-color");
      const color = option.getAttribute("data-color-name");
      if (option.classList.contains("selected-color")) {
        selectedFilters.colors.push(color);
      } else {
        selectedFilters.colors = selectedFilters.colors.filter(
          (c) => c !== color
        );
      }
    });
  });

  seeSelectionBtn.addEventListener("click", () => {
    closeSidebar();
    updateProductDisplay();
    updateActiveFiltersBar();

    const filtersAreaBar = document.querySelector(".filters-area-bar");
    const activeFiltersContainer = document.getElementById(
      "active-filters-container"
    );

    if (activeFiltersContainer.children.length > 0) {
      filtersAreaBar.classList.add("expanded");
    } else {
      filtersAreaBar.classList.remove("expanded");
    }
  });

  clearFiltersBtn.addEventListener("click", () => {
    clearFilters();
  });

  function clearFilters() {
    selectedFilters = {
      sort: "New Arrival",
      gender: "",
      sizes: [],
      footwearSizes: [],
      brands: [],
      colors: [],
    };

    sortOptions.forEach((btn) => btn.classList.remove("active-selection"));
    sortOptions[0].classList.add("active-selection");

    genderOptions.forEach((btn) => btn.classList.remove("active-selection"));
    sizeOptions.forEach((btn) => btn.classList.remove("active-selection"));
    footwearOptions.forEach((btn) => btn.classList.remove("active-selection"));
    brandsOptions.forEach((btn) => btn.classList.remove("active-selection"));
    colorOptions.forEach((circle) => circle.classList.remove("selected-color"));

    updateProductDisplay();
    updateActiveFiltersBar();
  }

  function updateProductDisplay() {
    const products = document.querySelectorAll(".product-item");
    let visibleCount = 0;

    products.forEach((product) => {
      let isVisible = true;

      const category = product
        .querySelector("[data-category]")
        ?.getAttribute("data-category");
      const sizes =
        product
          .querySelector("[data-sizes]")
          ?.getAttribute("data-sizes")
          ?.split(",") || [];
      const brand = product
        .querySelector("[data-brand]")
        ?.getAttribute("data-brand");
      const productColors = Array.from(
        product.querySelectorAll(".color-option2")
      ).map((el) => el.getAttribute("data-color-name").toLowerCase());

      // Filter by gender
      if (
        selectedFilters.gender &&
        category !== selectedFilters.gender.toLowerCase()
      ) {
        isVisible = false;
      }

      // Filter by sizes
      const matchesClothingSize =
        selectedFilters.sizes.length > 0 &&
        selectedFilters.sizes.some((size) =>
          sizes.includes(size.toLowerCase())
        );

      const matchesFootwearSize =
        selectedFilters.footwearSizes.length > 0 &&
        selectedFilters.footwearSizes.some((size) =>
          sizes.includes(size.toLowerCase())
        );

      if (
        (selectedFilters.sizes.length > 0 ||
          selectedFilters.footwearSizes.length > 0) &&
        !(matchesClothingSize || matchesFootwearSize)
      ) {
        isVisible = false;
      }

      // Filter by brand
      if (
        selectedFilters.brands.length > 0 &&
        (!brand || !selectedFilters.brands.includes(brand))
      ) {
        isVisible = false;
      }

      // Filter by color
      if (
        selectedFilters.colors.length > 0 &&
        !selectedFilters.colors.some((color) => productColors.includes(color))
      ) {
        isVisible = false;
      }

      product.style.display = isVisible ? "block" : "none";
      if (isVisible) visibleCount++;
    });

    // Show "no products" message if no products match filters
    const noProductsMessage = document.getElementById("no-products-message");
    if (!noProductsMessage) {
      const messageDiv = document.createElement("div");
      messageDiv.id = "no-products-message";
      messageDiv.className = "no-products-message-blur-bg hidden";
      messageDiv.innerHTML = `
        <div class="no-products-content">
          <i class="bi bi-exclamation-octagon-fill"></i>
          <p class="no-products-text">NO PRODUCTS FOUND</p>
          <p  class="no-products-subtext">  We couldn't find any products matching your filters. 
    Try adjusting or removing filters to see more items.</p>
        </div>
      `;
      productList.parentNode.insertBefore(messageDiv, productList);
    }

    if (visibleCount === 0) {
      document.getElementById("no-products-message").classList.remove("hidden");
    } else {
      document.getElementById("no-products-message").classList.add("hidden");
    }

    sortProducts();
  }

  function sortProducts() {
    const productsArray = Array.from(
      document.querySelectorAll(".product-item")
    );

    productsArray.sort((a, b) => {
      // Safely get prices with fallback to 0 if elements not found
      const priceElementA = a.querySelector(".card-price-animation");
      const priceElementB = b.querySelector(".card-price-animation");

      const priceA = priceElementA
        ? parseFloat(priceElementA.innerText.replace(" EGP", "").trim()) || 0
        : 0;
      const priceB = priceElementB
        ? parseFloat(priceElementB.innerText.replace(" EGP", "").trim()) || 0
        : 0;

      // Safely get dates with fallback to current date if not found
      const dateA = new Date(a.getAttribute("data-upload-date") || Date.now());
      const dateB = new Date(b.getAttribute("data-upload-date") || Date.now());

      switch (selectedFilters.sort) {
        case "Price low to high":
          return priceA - priceB;
        case "Price high to low":
          return priceB - priceA;
        case "New Arrival":
          return dateB - dateA;
        default:
          return 0;
      }
    });

    // Clear and re-add products
    while (productList.firstChild) {
      productList.removeChild(productList.firstChild);
    }
    productsArray.forEach((product) => productList.appendChild(product));
  }

  function updateActiveFiltersBar() {
    const activeFiltersContainer = document.getElementById(
      "active-filters-container"
    );
    if (!activeFiltersContainer) return;

    activeFiltersContainer.innerHTML = "";

    if (selectedFilters.sort && selectedFilters.sort !== "Price low to high") {
      const sortChip = createFilterChip(selectedFilters.sort, "sort");
      activeFiltersContainer.appendChild(sortChip);
    }

    if (selectedFilters.gender) {
      const genderChip = createFilterChip(selectedFilters.gender, "gender");
      activeFiltersContainer.appendChild(genderChip);
    }

    selectedFilters.sizes.forEach((size) => {
      const sizeChip = createFilterChip(size, "size");
      activeFiltersContainer.appendChild(sizeChip);
    });

    selectedFilters.footwearSizes.forEach((size) => {
      const fwChip = createFilterChip(size, "footwearSize");
      activeFiltersContainer.appendChild(fwChip);
    });

    selectedFilters.brands.forEach((brand) => {
      const brandChip = createFilterChip(brand, "brand");
      activeFiltersContainer.appendChild(brandChip);
    });

    selectedFilters.colors.forEach((color) => {
      const colorChip = createFilterChip(color, "color");
      activeFiltersContainer.appendChild(colorChip);
    });
  }

  function createFilterChip(label, type) {
    const chip = document.createElement("div");
    chip.className = "active-filter-chip";
    chip.dataset.type = type;
    chip.dataset.value = label;

    chip.innerHTML = `
      ${label}
      <span class="remove-filter-icon"><i class="bi bi-x"></i></span>
    `;

    chip.querySelector(".remove-filter-icon").addEventListener("click", () => {
      removeFilter(type, label);
    });

    return chip;
  }

  function removeFilter(type, value) {
    switch (type) {
      case "sort":
        selectedFilters.sort = "Price low to high";
        sortOptions.forEach((btn) => {
          btn.classList.remove("active-selection");
          if (btn.innerText === "Price low to high")
            btn.classList.add("active-selection");
        });
        break;
      case "gender":
        selectedFilters.gender = "";
        genderOptions.forEach((btn) =>
          btn.classList.remove("active-selection")
        );
        break;
      case "size":
        selectedFilters.sizes = selectedFilters.sizes.filter(
          (s) => s !== value
        );
        sizeOptions.forEach((btn) => {
          if (btn.innerText === value) btn.classList.remove("active-selection");
        });
        break;
      case "footwearSize":
        selectedFilters.footwearSizes = selectedFilters.footwearSizes.filter(
          (s) => s !== value
        );
        footwearOptions.forEach((btn) => {
          if (btn.innerText === value) btn.classList.remove("active-selection");
        });
        break;
      case "brand":
        selectedFilters.brands = selectedFilters.brands.filter(
          (b) => b !== value
        );
        brandsOptions.forEach((btn) => {
          if (btn.innerText === value) btn.classList.remove("active-selection");
        });
        break;
      case "color":
        selectedFilters.colors = selectedFilters.colors.filter(
          (c) => c !== value
        );
        colorOptions.forEach((circle) => {
          if (circle.getAttribute("data-color-name") === value) {
            circle.classList.remove("selected-color");
          }
        });
        break;
    }

    updateProductDisplay();
    updateActiveFiltersBar();

    // Check if there are no filters left
    const filtersAreaBar = document.querySelector(".filters-area-bar");
    const activeFiltersContainer = document.getElementById(
      "active-filters-container"
    );

    if (activeFiltersContainer.children.length === 0) {
      filtersAreaBar.classList.remove("expanded");
    }
  }

  updateProductDisplay();
  updateActiveFiltersBar();
});
