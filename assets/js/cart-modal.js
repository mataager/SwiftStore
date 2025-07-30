function addToCart() {
  const title = document.getElementById("productTitle").innerText;
  const brandName = document.getElementById("BrandName").innerText;
  const productPrice = document.getElementById("productPrice").innerText;
  const productSize = document.getElementById("product-Size").innerText;
  const productColor = document.getElementById(
    "product-selected-color"
  ).innerText;
  const productID = document.getElementById("productID").innerText;

  // Get the reference to the img element
  const productImage = document.getElementById("productImage");

  // Get the src attribute value
  const srcValue = productImage.getAttribute("src");

  const newItem = {
    id: productID,
    brand: brandName,
    title: title,
    productSize: productSize,
    productColor: productColor,
    price: productPrice,
    photourl: srcValue,
    quantity: 1, // Initialize quantity
  };

  // Retrieve cart from local storage or initialize it as an empty array
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if an item with the same ID, size, and color already exists
  const existingItem = cart.find(
    (item) =>
      item.id === newItem.id &&
      item.productSize === newItem.productSize &&
      item.productColor === newItem.productColor
  );

  if (existingItem) {
    // If the item exists, increase its quantity
    existingItem.quantity += 1;
  } else {
    // If the item doesn't exist, add it as a new item
    cart.push(newItem);
  }

  // Store the updated cart back to local storage
  localStorage.setItem("cart", JSON.stringify(cart));

  Swal.fire({
    html: `
     <p class="swal-success-message">
      The item was added to cart successfully
    </p>
    <div class="swal-product-container">
      <img src="${productImage.getAttribute("src")}" class="swal-product-image">
      <div class="swal-product-content">
        <p class="swal-product-title">${title}</p>
        <div class="swal-button-group">
          <button id="continueBtn" class="swal-continue-btn">
            Continue Shopping
          </button>
          <button id="cartBtn" class="swal-cart-btn">
            View Cart
          </button>
        </div>
      </div>
    </div>
  `,
    icon: "success",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "#fff",
    width: "400px",
    padding: "1rem",
    customClass: {
      popup: "custom-swal-toast",
      container: "swal-container",
    },
    didOpen: () => {
      document
        .getElementById("continueBtn")
        .addEventListener("click", () => Swal.close());
      document.getElementById("cartBtn").addEventListener("click", () => {
        window.location.href = "./Cart.html";
      });
    },
  });
  updateCartCount();
}
function openCartModal(productId) {
  // Create preloader overlay if it doesn't exist
  let preloader = document.getElementById("preloader-overlay");
  if (!preloader) {
    preloader = document.createElement("div");
    preloader.id = "preloader-overlay";
    preloader.className = "preloader-overlay";
    preloader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(preloader);
  }

  preloader.classList.remove("hidden");
  document.body.classList.add("modal-open");

  // Start timer for minimum 1 second
  const minLoadTime = 1000;
  const startTime = Date.now();
  fetch(`${url}/Stores/${uid}/Products/${productId}.json`)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((product) => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);

      setTimeout(() => {
        // Fade out preloader
        preloader.classList.add("hidden");

        // Prepare modal
        const modal = document.querySelector(".modal");
        const modalContent = document.querySelector(".modal-content");

        // Set modal position and styles
        modal.style.display = "block";
        document.body.style.overflow = "hidden";

        // Rest of your product rendering code...
        const saleAmount = product["sale-amount"];
        const originalPrice = product["Product-Price"];
        const cut = product["matager-Cut"];

        // function calculateSalePrice(originalPrice, saleAmount) {
        //   return originalPrice * (1 - saleAmount / 100);
        // }

        let salePrice = originalPrice;
        mainPrice = calculateSalePrice(originalPrice, saleAmount);
        if (saleAmount) {
          salePrice = calculateSalePrice(originalPrice, saleAmount);
        }

        modalContent.productDetails = product; // Store product details in the modal content

        // Check and set default image source if necessary
        setDefaultImageSource(product);

        // Render product content
        modalContent.innerHTML = `
   <!-- Modal Header -->
  <div class="flex justify-content-space-between width-available modal-header">
    <!-- View Product Button -->
    <div class="flex center flex-end" onclick="productDetails('${productId}')">
      <button type="button" class="modalbtnL" id="perv4Button" aria-label="View Product Details" 
              onmouseenter="showHeaderTooltip('View Product Details')"
              onmouseleave="hideHeaderTooltip()">
        <i class="bi bi-box-arrow-in-down-right"></i>
      </button>
    </div>
    
    <!-- Centered Tooltip Container -->
    <div class="header-tooltip-container" id="headerTooltip"></div>
    
    <!-- Close Button -->
    <div class="flex center flex-end" onclick="closeModal()">
      <button type="button" class="modalbtnR" id="perv4Button" aria-label="Close Modal"
              onmouseenter="showHeaderTooltip('Close Modal')"
              onmouseleave="hideHeaderTooltip()">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  </div>

  <!-- Modal Body (wraps all other content) -->
  <div class="modal-body">
    <h5 class="m-5 BrandName-p pointer" id="BrandName" onclick="brand('${
      product["Brand-Name"]
    }')">
      ${product["Brand-Name"]}
    </h5>
    <div id="productTitlearea">
      <h2 class="m-5 pointer title hidden" onclick="productDetails('${productId}')" id="productTitle">
        ${product["product-title"]}
      </h2>
    </div>

    <!-- Price Section -->
    <div class="price-animation-modal-container" id="pricecontainer">
      ${
        saleAmount
          ? `<del class="pre-sale-animation">${originalPrice} EGP</del>`
          : ""
      }
      <p class="card-price-animation" id="productPrice">${mainPrice} EGP</p>
    </div>

    <!-- Product Image -->
    <div style="width:200px">
      <div class="hidden outofstockmessagebannermodal" id="outofstockmessagebanner">out of stock</div>
      <img id="productImage" class="m-5 product-image radius-5 width-available active" src="${
        product["product-photo"]
      }" alt="Product Image">
    </div>

    <!-- Size Selection -->
    <div class="m-5 hidden">
      <h3 class="m-5 flex pb-7 center align-items size-cart-area">
        Size: <p id="product-Size"></p>
      </h3>
      <div id="size-hint-text" style="display: none; font-size: 16px; color: #333; margin-top: 10px;"></div>
    </div>
    <ul class="mt-5 flex center flex-wrap size-buttons-area">
      ${Object.keys(product.sizes)
        .map(
          (size) => `
        <div class="size-radio m-5" onclick="SizeRef('${size}')">
          <label class="radio-input_option">
            <span class="size-value">${size}</span>
          </label>
        </div>
      `
        )
        .join("")}
    </ul>

    <!-- Color Selection -->
    <div class="relative colors-circels-area">
      <div id="color-hint-text"></div>
      <ul id="product-colors" class="color-options m-5 flex-wrap width-80 mb-10 hidden"></ul>
      <div class="color-text-area">
        <label class="" for="product-color">
          <p id="product-selected-color"></p>
          <div id="hint" class="hint-text hidden"></div>
        </label>
        <h5 id="stockContainer" class="hidden">
          <p class="stockMessage-p" id="stockMessage"></p>
        </h5>
      </div>
      <div class="m-5 flex align-items hidden">
        SKU:<p id="productID">${productId}</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div id="BuyNowButton" matagercut="${cut}" onclick="handleBuyNowClick()" class="Buyitnow2">
      Buy Now <i class="bi bi-lightning"></i>
    </div>
    <div class="flex center flex-direction-column align-items" id="buybuttonsarea">
      <div class="m-5">
        <button id="addToCartButton" onclick="addToCart()" class="Add-to-Cart2" disabled>
          Add to Cart <i class="bi bi-exclamation-lg"></i>
        </button>
      </div>
    </div>
  </div> <!-- End of modal-body -->
`;
        setupPricemodalAnimations();
        // After rendering the modal content:
        setTimeout(() => {
          // Get all size options
          const sizeRadios = modalContent.querySelectorAll(".size-radio");

          if (sizeRadios.length > 0) {
            // Get the first size
            const firstSize =
              sizeRadios[0].querySelector(".size-value").textContent;

            // Trigger click on first size
            sizeRadios[0].click();

            // Wait for colors to load then select first color
            setTimeout(() => {
              const colorOptions =
                modalContent.querySelectorAll(".color-option");

              if (colorOptions.length > 0) {
                // Get the first color
                const firstColor =
                  colorOptions[0].getAttribute("data-color-name");

                // Trigger click on first color
                colorOptions[0].click();
              }
            }, 50);
          }
          modal.classList.add("show");

          // Initialize animations after everything is rendered
          initModalAnimations();
        }, 50);

        // Close handler
        modal.addEventListener("click", function (event) {
          if (!modalContent.contains(event.target)) {
            closeModal();
          }
        });
      }, remainingTime);
    })
    .catch((error) => {
      console.error("Error:", error);
      setTimeout(() => {
        preloader.classList.add("hidden");
      }, minLoadTime);
    });
}
function closeModal() {
  const modal = document.querySelector(".modal");
  modal.classList.remove("show");

  setTimeout(() => {
    document.body.style.overflow = "auto";
    document.body.classList.remove("modal-open");
  }, 400); // Match transition duration
}
function colorRef(color) {
  const modalContent = document.querySelector(".modal-content");
  const product = modalContent.productDetails;
  const size = document.getElementById("product-Size").innerText;
  const choosedColor = document.getElementById("product-selected-color");
  const buyNowButton = document.getElementById("BuyNowButton");

  // Get the clicked color element and its wrapper
  const clickedColorOption = document.querySelector(
    `.color-option[data-color-name="${color}"]`
  );
  const clickedColorWrapper = clickedColorOption.closest(".colorOptionwrapper");

  // Remove selected class from all color wrappers
  document.querySelectorAll(".colorOptionwrapper").forEach((wrapper) => {
    wrapper.classList.remove("colorOptionwrapper-selected");
  });

  // Add selected class to clicked wrapper
  clickedColorWrapper.classList.add("colorOptionwrapper-selected");

  choosedColor.innerText = color;

  // Update the images for the selected color
  if (product.sizes[size] && product.sizes[size][color]) {
    const colorDetails = product.sizes[size][color];
    document.getElementById("productImage").src = colorDetails.img1;
  }

  if (clickedColorOption) {
    const qty = clickedColorOption.getAttribute("data-qty");
    // Update Buy Now button with quantity data
    buyNowButton.setAttribute("data-qty", qty);
    checkStockStatus(qty);
  }

  updateAddToCartButtonState();
}
function SizeRef(size) {
  const modalContent = document.querySelector(".modal-content");
  const product = modalContent.productDetails;
  const choosedSize = document.getElementById("product-Size");
  const choosedColor = document.getElementById("product-selected-color");

  // Clear the color when size changes
  choosedColor.innerText = "";
  choosedSize.innerText = size;

  // Also clear any selected color wrappers
  document.querySelectorAll(".colorOptionwrapper").forEach((wrapper) => {
    wrapper.classList.remove("colorOptionwrapper-selected");
  });

  // Update size buttons' styles
  const sizeButtons = document.querySelectorAll(".size-radio");
  sizeButtons.forEach((button) => {
    button.style.backgroundColor =
      button.textContent.trim() === size ? "var(--vipcolorop05)" : "";
    button.style.color = button.textContent.trim() === size ? "#fff" : "#000";
  });

  // Display available colors for the selected size
  const colorsForSize = product.sizes[size];
  const colorList = modalContent.querySelector("#product-colors");
  colorList.innerHTML = Object.keys(colorsForSize)
    .map((color) => {
      const qty = colorsForSize[color]["qty"];
      return `
      <div class="colorOptionwrapper" onclick="colorRef('${color}')">
          <div class="color-option"
               data-color-name="${color}"
               data-qty="${qty}"
               style="background-color: ${colorsForSize[color]["color-value"]}">
          </div>
      </div>`;
    })
    .join("");
  colorList.classList.remove("hidden");

  updateAddToCartButtonState();
}

// function SizeRef(size) {
//   const modalContent = document.querySelector(".modal-content");
//   const product = modalContent.productDetails;
//   const choosedSize = document.getElementById("product-Size");
//   const choosedColor = document.getElementById("product-selected-color");

//   // Clear the color when size changes
//   choosedColor.innerText = "";
//   choosedSize.innerText = size;

//   // Also clear any selected color wrappers
//   document.querySelectorAll(".colorOptionwrapper").forEach((wrapper) => {
//     wrapper.classList.remove("colorOptionwrapper-selected");
//   });

//   // Get all available sizes and sort them
//   const availableSizes = Object.keys(product.sizes);
//   const sortedSizes = sortSizes(availableSizes);

//   // Update size buttons' styles and reorder them
//   const sizesContainer = document.querySelector(".size-buttons-area");
//   sizesContainer.innerHTML = ""; // Clear existing buttons

//   sortedSizes.forEach((sortedSize) => {
//     const sizeDiv = document.createElement("div");
//     sizeDiv.className = "size-radio m-5";

//     // Use event delegation instead of direct onclick
//     sizeDiv.addEventListener("click", (e) => {
//       e.stopPropagation(); // Prevent event bubbling that might close the modal
//       SizeRef(sortedSize);
//     });

//     const label = document.createElement("label");
//     label.className = "radio-input_option";

//     const span = document.createElement("span");
//     span.className = "size-value";
//     span.textContent = sortedSize;

//     label.appendChild(span);
//     sizeDiv.appendChild(label);

//     // Style the selected size
//     if (sortedSize === size) {
//       sizeDiv.style.backgroundColor = "#333";
//       span.style.color = "#fff";
//     }

//     sizesContainer.appendChild(sizeDiv);
//   });

//   // Display available colors for the selected size
//   const colorsForSize = product.sizes[size];
//   const colorList = modalContent.querySelector("#product-colors");
//   colorList.innerHTML = Object.keys(colorsForSize)
//     .map((color) => {
//       const qty = colorsForSize[color]["qty"];
//       return `
//       <div class="colorOptionwrapper" onclick="colorRef('${color}')">
//           <div class="color-option"
//                data-color-name="${color}"
//                data-qty="${qty}"
//                style="background-color: ${colorsForSize[color]["color-value"]}">
//           </div>
//       </div>`;
//     })
//     .join("");
//   colorList.classList.remove("hidden");

//   updateAddToCartButtonState();
// }
// // Helper function to sort sizes intelligently
// function sortSizes(sizes) {
//   // Define the standard order for letter sizes
//   const sizeOrder = [
//     "XXS",
//     "XS",
//     "S",
//     "M",
//     "L",
//     "XL",
//     "XXL",
//     "XXXL",
//     "XXXXL",
//   ].map((size) => size.toUpperCase());

//   // Check if sizes are letter sizes (like S, M, L)
//   const hasLetterSizes = sizes.some((size) => {
//     const upperSize = size.toUpperCase();
//     return sizeOrder.includes(upperSize) || /^[A-Za-z]+$/.test(size); // Check if it's alphabetic
//   });

//   if (hasLetterSizes) {
//     return sizes.sort((a, b) => {
//       const aUpper = a.toUpperCase();
//       const bUpper = b.toUpperCase();

//       // Get indices in the standard order
//       const aIndex = sizeOrder.indexOf(aUpper);
//       const bIndex = sizeOrder.indexOf(bUpper);

//       // If both are in the standard order, sort by that
//       if (aIndex !== -1 && bIndex !== -1) {
//         return aIndex - bIndex;
//       }

//       // If only one is in standard order, it comes first
//       if (aIndex !== -1) return -1;
//       if (bIndex !== -1) return 1;

//       // If neither is in standard order, sort alphabetically
//       return aUpper.localeCompare(bUpper);
//     });
//   }

//   // For numeric sizes, sort numerically
//   return sizes.sort((a, b) => {
//     const numA = parseFloat(a);
//     const numB = parseFloat(b);

//     // If both are numbers, sort numerically
//     if (!isNaN(numA) && !isNaN(numB)) {
//       return numA - numB;
//     }

//     // If one is a number and one isn't, numbers come first
//     if (!isNaN(numA)) return -1;
//     if (!isNaN(numB)) return 1;

//     // If neither is a number, sort alphabetically
//     return a.localeCompare(b);
//   });
// }

function updateAddToCartButtonState() {
  const size = document.getElementById("product-Size").innerText.trim(); // Get the selected size
  const color = document
    .getElementById("product-selected-color")
    .innerText.trim(); // Get the selected color
  const addToCartButton = document.getElementById("addToCartButton");
  const buynowButton = document.getElementById("BuyNowButton");
  const sizeHintTextElement = document.getElementById("size-hint-text");
  const colorHintTextElement = document.getElementById("color-hint-text");

  addToCartButton.classList.add("flex", "align-items", "gap-5");
  // Handle size hint
  if (!size) {
    if (sizeHintTextElement) {
      sizeHintTextElement.innerText = "Must choose a size!";
      sizeHintTextElement.style.display = "block";
      sizeHintTextElement.classList.add("rolling-animation");

      // Add underline animation
    }

    // Disable "Add to Cart" button
    addToCartButton.disabled = true;
    addToCartButton.style.opacity = 0.5;
    addToCartButton.innerHTML =
      'Add to Cart <i class="bi bi-exclamation-lg"></i>';
    addToCartButton.onclick = null;
    return;
  }

  // Hide size hint if size is selected
  if (sizeHintTextElement) {
    sizeHintTextElement.style.display = "none";
    sizeHintTextElement.classList.remove("rolling-animation");
    sizeHintTextElement.innerHTML = ""; // Clear dynamically added underline
  }

  // Handle color hint
  if (!color) {
    if (colorHintTextElement) {
      colorHintTextElement.innerText = "Must choose a color!";
      colorHintTextElement.style.display = "block";
      colorHintTextElement.classList.add("rolling-animation");

      // Add underline animation
    }

    // Disable "Add to Cart" button
    addToCartButton.disabled = true;
    buynowButton.disabled = true;
    addToCartButton.classList.add("opcacity05");
    buynowButton.classList.add("opcacity05");
    addToCartButton.innerHTML =
      'Add to Cart <i class="bi bi-exclamation-lg"></i>';
    addToCartButton.onclick = null;
    buynowButton.onclick = null;
    return;
  }

  // Hide color hint if color is selected
  if (colorHintTextElement) {
    colorHintTextElement.style.display = "none";
    colorHintTextElement.classList.remove("rolling-animation");
    colorHintTextElement.innerHTML = ""; // Clear dynamically added underline
  }

  // Enable "Add to Cart" button when both size and color are selected
  addToCartButton.disabled = false;
  buynowButton.disabled = false;
  addToCartButton.classList.remove("opcacity05");
  buynowButton.classList.remove("opcacity05");
  addToCartButton.innerHTML =
    'Add to Cart <ion-icon name="cart-outline" role="img" class="md hydrated" aria-label="cart outline"></ion-icon>';
  addToCartButton.onclick = addToCart;
  buynowButton.onclick = handleBuyNowClick;
}
