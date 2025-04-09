// async function addfavouriteproduct(key) {
//   const url = `https://matager-f1f00-default-rtdb.firebaseio.com/Stores/${uid}/Products/${key}.json`;
//   // Create or show preloader overlay
//   let preloader = document.getElementById("preloader-overlay");
//   if (!preloader) {
//     preloader = document.createElement("div");
//     preloader.id = "preloader-overlay";
//     preloader.className = "preloader-overlay";
//     preloader.innerHTML = '<div class="spinner"></div>';
//     document.body.appendChild(preloader);
//   }

//   preloader.classList.remove("hidden");
//   document.body.classList.add("modal-open");

//   // Start timer for minimum 1 second
//   const minLoadTime = 1000;
//   const startTime = Date.now();
//   try {
//     // Fetch product details
//     const response = await fetch(url);
//     const product = await response.json();

//     if (!product) {
//       alert("Product not found!");
//       return;
//     }

//     // Calculate remaining time to ensure minimum 1 second loading
//     const elapsedTime = Date.now() - startTime;
//     const remainingTime = Math.max(0, minLoadTime - elapsedTime);

//     await new Promise((resolve) => setTimeout(resolve, remainingTime));

//     // Hide preloader
//     preloader.classList.add("hidden");
//     document.body.classList.remove("modal-open");

//     // Select the modal and its content container
//     const modal = document.getElementById("modal-fav");
//     const modalContent = document.getElementById("modal-fav-content");

//     // Clear any existing content in the modal
//     modalContent.innerHTML = "";

//     // Add content to the modal
//     modalContent.innerHTML = `
//       <div class="modal-header">
//         <button style="color: black;background: none;border-radius: 0px 8px 0px 8px;margin: 0;" type="button" class="Add-to-Cart" onclick="productDetails('${key}')">
//           <i class="bi bi-box-arrow-in-down-right"></i>
//         </button>
//         <button type="button" class="Add-to-Cart" style="color: black;background: none;border-radius: 0px 8px 0px 8px;margin: 0;" id="closeModal">
//           <i class="bi bi-x-lg"></i>
//         </button>
//       </div>
//       <form class="m-30" id="productForm">
//         <div id="image-preview" class="fav-image-preview">
//           <img width="200px" class="radius-5" src="" alt="Selected Product Image" id="productImage">
//         </div>
//         <label class="fav-modal-label" for="size">Size:</label>
//         <select class="swal2-input black-font" id="size" name="size" required>
//           ${Object.keys(product.sizes)
//             .map((size) => `<option value="${size}">${size}</option>`)
//             .join("")}
//         </select>
//         <br>
//         <label class="fav-modal-label" for="color">Color:</label>
//         <select class="swal2-input black-font" id="color" name="color" required></select>
//         <br>
//       </form>
//       <div class="flex center align-items width-available flex-direction-column">
//         <button id="addToFavBtn" class="add-to-fav-btn flex align-items" type="submit">
//           <span class="button-text">Add to favourite</span>
//           <ion-icon name="heart-outline" role="img" class="md hydrated ml-5" aria-label="heart-outline"></ion-icon>
//           <div class="preloader-sm hidden"></div>
//         </button>
//       </div>
//     `;
//     // Show modal
//     modal.style.display = "flex";
//     modal.classList.add("show");
//     document.body.style.overflow = "hidden";

//     // DOM elements
//     const sizeSelect = modalContent.querySelector("#size");
//     const colorSelect = modalContent.querySelector("#color");
//     const productImage = modalContent.querySelector("#productImage");
//     const addToFavBtn = modalContent.querySelector("#addToFavBtn");
//     const preloader = addToFavBtn.querySelector(".preloader-sm");
//     const buttonText = addToFavBtn.querySelector(".button-text");

//     // Update image based on size and color
//     const updateImage = () => {
//       const selectedSize = sizeSelect.value;
//       const selectedColor = colorSelect.value;

//       if (
//         product.sizes[selectedSize] &&
//         product.sizes[selectedSize][selectedColor]
//       ) {
//         productImage.src = product.sizes[selectedSize][selectedColor].img1;
//       }
//     };

//     // Populate color dropdown on size change
//     sizeSelect.addEventListener("change", () => {
//       const selectedSize = sizeSelect.value;
//       colorSelect.innerHTML = ""; // Clear previous colors

//       if (product.sizes[selectedSize]) {
//         Object.keys(product.sizes[selectedSize]).forEach((color) => {
//           const colorOption = document.createElement("option");
//           colorOption.value = color;
//           colorOption.textContent = color;
//           colorSelect.appendChild(colorOption);
//         });
//       }
//       colorSelect.dispatchEvent(new Event("change"));
//     });

//     // Update image on color change
//     colorSelect.addEventListener("change", updateImage);

//     // Trigger size change to populate colors and image
//     sizeSelect.dispatchEvent(new Event("change"));

//     // Show modal
//     modal.style.display = "flex";
//     modal.classList.add("show");
//     document.body.style.overflow = "hidden";

//     // Close modal functionality
//     const closeModalButton = modalContent.querySelector("#closeModal");
//     closeModalButton.onclick = () => {
//       modal.style.display = "none";
//       document.body.style.overflow = "auto";
//     };

//     // Handle outside click to close modal
//     modal.addEventListener("click", (e) => {
//       if (e.target === modal) {
//         modal.style.display = "none";
//         modal.classList.remove("flex");
//         document.body.style.overflow = "auto";
//       }
//     });

//     // Submit favorite item
//     addToFavBtn.onclick = async (e) => {
//       e.preventDefault();

//       const selectedSize = sizeSelect.value;
//       const selectedColor = colorSelect.value;

//       // Get authenticated user's ID and token
//       const user = firebase.auth().currentUser;

//       if (!user) {
//         // Show SweetAlert if user is not authenticated
//         Swal.fire({
//           icon: "warning",
//           title: "Sign In Required",
//           text: "You must sign in to add this item to favorite",
//           showCancelButton: true,
//           confirmButtonText: "Go to Account",
//           cancelButtonText: "Cancel",
//           reverseButtons: true,
//         }).then((result) => {
//           if (result.isConfirmed) {
//             window.location.href = "./account.html"; // Redirect to the account page
//           }
//         });
//         return;
//       }

//       const idToken = await user.getIdToken();
//       const userId = user.uid;

//       const favoriteData = {
//         productid: key,
//         title: product["product-title"],
//         size: selectedSize,
//         color: selectedColor,
//         photo: product.sizes[selectedSize][selectedColor].img1,
//       };

//       // Post favorite product data to Firebase Realtime Database
//       const favUrl = `https://matager-f1f00-default-rtdb.firebaseio.com/users/${userId}/favouriteitems/${uid}.json?auth=${idToken}`;

//       try {
//         // Show preloader and disable button
//         preloader.classList.remove("hidden");
//         buttonText.classList.add("hidden");

//         const response = await fetch(favUrl, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(favoriteData),
//         });

//         if (response.ok) {
//           // Show success SweetAlert
//           Swal.fire({
//             icon: "success",
//             title: "Added to Favourites!",
//             text: "The product has been added to your favourites.",
//             confirmButtonText: "OK",
//           }).then(() => {
//             modal.style.display = "none"; // Close modal
//             document.body.style.overflow = "auto";
//           });
//         } else {
//           Swal.fire({
//             icon: "error",
//             title: "Failed",
//             text: "Failed to add the product to favourites. Please try again later.",
//           });
//         }
//       } catch (error) {
//         console.error("Error posting to favourites:", error);
//       } finally {
//         // Hide preloader and enable button
//         preloader.classList.add("hidden");
//         buttonText.classList.remove("hidden");
//       }
//     };
//   } catch (error) {
//     console.error("Error fetching product:", error);
//   }
// }

async function addfavouriteproduct(key) {
  const url = `https://matager-f1f00-default-rtdb.firebaseio.com/Stores/${uid}/Products/${key}.json`;

  // Create or show preloader overlay
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

  try {
    // Fetch product details
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const product = await response.json();

    if (!product) {
      throw new Error("Product not found!");
    }

    // Calculate remaining time to ensure minimum 1 second loading
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadTime - elapsedTime);

    // Wait for remaining time
    await new Promise((resolve) => setTimeout(resolve, remainingTime));

    // Select modal elements before hiding preloader
    // const modal = document.getElementById("modal-fav");
    // const modalContent = document.getElementById("modal-fav-content");
    const modal = document.querySelector(".modal");
    const modalContent = document.querySelector(".modal-content");

    // Hide preloader first
    preloader.classList.add("hidden");

    // Then populate and show modal
    modalContent.innerHTML = `
      <div class="modal-header">
        <button type="button" class="Add-to-Cart mCbtn" onclick="productDetails('${key}')">
          <i class="bi bi-box-arrow-in-down-right"></i>
        </button>
        <button type="button" class="Add-to-Cart mCbtn" id="closeModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <form class="m-30" id="productForm">
        <div id="image-preview" class="fav-image-preview">
          <img width="200px" class="radius-5" src="" alt="Selected Product Image" id="productImage">
        </div>
        <label class="fav-modal-label" for="size">Size:</label>
        <select class="swal2-input black-font" id="size" name="size" required>
          ${Object.keys(product.sizes)
            .map((size) => `<option value="${size}">${size}</option>`)
            .join("")}
        </select>
        <br>
        <label class="fav-modal-label" for="color">Color:</label>
        <select class="swal2-input black-font" id="color" name="color" required></select>
        <br>
      </form>
      <div class="flex center align-items width-available flex-direction-column">
        <button id="addToFavBtn" class="add-to-fav-btn flex align-items" type="submit">
          <span class="button-text">Add to favourite</span>
          <ion-icon name="heart-outline" role="img" class="md hydrated ml-5" aria-label="heart-outline"></ion-icon>
          <div class="preloader-sm hidden"></div>
        </button>
      </div>
    `;

    // Show modal after preloader is hidden
    setTimeout(() => {
      modal.style.display = "block";
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }, 10); // Small delay to ensure preloader is gone

    // Rest of your modal setup code...
    const sizeSelect = modalContent.querySelector("#size");
    const colorSelect = modalContent.querySelector("#color");
    const productImage = modalContent.querySelector("#productImage");
    const addToFavBtn = modalContent.querySelector("#addToFavBtn");
    const btnPreloader = addToFavBtn.querySelector(".preloader-sm");
    const buttonText = addToFavBtn.querySelector(".button-text");

    // Update image function
    const updateImage = () => {
      const selectedSize = sizeSelect.value;
      const selectedColor = colorSelect.value;
      if (product.sizes[selectedSize]?.[selectedColor]?.img1) {
        productImage.src = product.sizes[selectedSize][selectedColor].img1;
      }
    };

    // Initialize color dropdown
    sizeSelect.addEventListener("change", () => {
      const selectedSize = sizeSelect.value;
      colorSelect.innerHTML = "";
      if (product.sizes[selectedSize]) {
        Object.keys(product.sizes[selectedSize]).forEach((color) => {
          colorSelect.innerHTML += `<option value="${color}">${color}</option>`;
        });
        updateImage();
      }
    });

    // Trigger initial setup
    sizeSelect.dispatchEvent(new Event("change"));

    // Close modal handlers
    modalContent.querySelector("#closeModal").onclick = () => {
      modal.classList.remove("show");
      document.body.style.overflow = "auto";
    };

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });

    // Add to favorites handler
    addToFavBtn.onclick = async (e) => {
      e.preventDefault();
      const user = firebase.auth().currentUser;

      if (!user) {
        Swal.fire({
          icon: "warning",
          title: "Sign In Required",
          text: "You must sign in to add favorites",
          showCancelButton: true,
          confirmButtonText: "Go to Account",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) window.location.href = "./account.html";
        });
        return;
      }

      try {
        btnPreloader.classList.remove("hidden");
        buttonText.classList.add("hidden");

        const idToken = await user.getIdToken();
        const response = await fetch(
          `https://matager-f1f00-default-rtdb.firebaseio.com/users/${user.uid}/favouriteitems/${uid}.json?auth=${idToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productid: key,
              title: product["product-title"],
              size: sizeSelect.value,
              color: colorSelect.value,
              photo: productImage.src,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to add favorite");

        Swal.fire({
          icon: "success",
          title: "Added to Favorites!",
          showConfirmButton: false,
          timer: 1500,
        });
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      } finally {
        btnPreloader.classList.add("hidden");
        buttonText.classList.remove("hidden");
      }
    };
  } catch (error) {
    console.error("Error:", error);
    preloader.classList.add("hidden");
    document.body.classList.remove("modal-open");
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to load product",
    });
  }
}
