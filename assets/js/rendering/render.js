document.addEventListener("DOMContentLoaded", () => {
  // Handle scroll behavior for header and go-top-btn
  const header = document.querySelector("[data-header]");

  const goTopBtnHTML = `
    <a href="#top" class="go-top-btn" data-go-top>
      <ion-icon name="arrow-up-outline" role="img" class="arrow-icon"></ion-icon>
    </a>
  `;
  document.body.insertAdjacentHTML("beforeend", goTopBtnHTML);

  const goTopBtn = document.querySelector(".go-top-btn");

  window.addEventListener("scroll", () => {
    if (window.scrollY >= 80) {
      header?.classList.add("active");
      goTopBtn.classList.add("active");
    } else {
      header?.classList.remove("active");
      goTopBtn.classList.remove("active");
    }
  });

  // Only render the scroll-to-checkout button if on cart page
  const isCartPage =
    window.location.pathname.includes("cart") ||
    document.body.classList.contains("cart-page") ||
    document.querySelector("#cart-items");

  if (isCartPage) {
    const scrollToCheckoutHTML = `
        <div class="tooltip">
          <a href="javascript:void(0);" class="go-down-btn" data-go-bottom>
            <ion-icon name="arrow-down-outline" role="img" class="arrow-icon"></ion-icon>
          </a>
          <span class="tooltiptext">Scroll to Checkout</span>
        </div>
      `;
    document.body.insertAdjacentHTML("beforeend", scrollToCheckoutHTML);

    // Add scroll-to-bottom behavior
    const goDownBtn = document.querySelector("[data-go-bottom]");
    goDownBtn?.addEventListener("click", () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    });
  }
});
