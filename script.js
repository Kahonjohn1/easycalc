/* ==========================================================================
   EasyCalc - Multi-Product Price Calculator
   Plain JavaScript (no libraries, no frameworks)
   ========================================================================== */

/* =========================================================
   1. CONCEPT
   ---------------------------------------------------------
   products (a list of everything we sell)
      |
      |  user selects a product + types a quantity, then
      |  clicks "Add Product"
      v
   selectedProducts (the items the user chose)
      |
      |  user clicks "Calculate Total"
      v
   for...of loop adds up: price x quantity  ->  subtotal
   if subtotal > N500,000  ->  10% discount
   final total = subtotal - discount
   ========================================================= */

/* =========================================================
   2. PRODUCT DATA  (an array of objects)
   ---------------------------------------------------------
   Each object stores a `name` and a `price` in whole Naira.
   ========================================================= */
const products = [
  { name: "iPhone 15",     price: 850000,  image: "images/phone.jpg" },
  { name: "MacBook Air",   price: 1200000, image: "images/laptop.jpg" },
  { name: "AirPods Pro",   price: 350000,  image: "images/earbuds.jpg" },
  { name: "Magic Mouse",   price: 180000,  image: "images/mouse.jpg" },
  { name: "USB-C Hub",     price: 95000,   image: "images/usb-hub.jpg" }
];

/* =========================================================
   3. SELECTED PRODUCTS  (an empty array we fill up later)
   ---------------------------------------------------------
   When the user clicks "Add Product", we push() an object
   into this array. Each object looks like:
   { name: "iPhone 15", price: 850000, quantity: 3 }
   ========================================================= */
const selectedProducts = [];

/* =========================================================
   4. DOM SELECTION
   ---------------------------------------------------------
   getElementById() grabs an element from the HTML page so
   we can read from it or change it.
   ========================================================= */
const productSelect = document.getElementById("product-select");
const productPrice = document.getElementById("product-price");
const productQuantity = document.getElementById("product-quantity");
const addBtn = document.getElementById("add-btn");
const calculateBtn = document.getElementById("calculate-btn");
const clearBtn = document.getElementById("clear-btn");
const selectedSection = document.getElementById("selected-section");
const selectedProductsList = document.getElementById("selected-products-list");
const errorMessage = document.getElementById("error-message");
const subtotalValue = document.getElementById("subtotal-value");
const discountValue = document.getElementById("discount-value");
const totalResult = document.getElementById("total-result");

// Slider elements
const sliderTrack = document.getElementById("slider-track");
const sliderDots = document.getElementById("slider-dots");

// Theme toggle element
const themeToggle = document.getElementById("theme-toggle");

/* =========================================================
   5. HELPER: CURRENCY FORMATTING
   ---------------------------------------------------------
   Converts a number like 2550000 into "N2,550,000.00"
   so it is easy to read.
   ========================================================= */
function formatCurrency(amount) {
  const amountString = amount.toFixed(2); // 2550000 -> "2550000.00"
  const parts = amountString.split(".");  // ["2550000", "00"]
  const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "\u20A6" + whole + "." + parts[1];
}

/* =========================================================
   6. POPULATE THE DROPDOWN
   ---------------------------------------------------------
   Loops over `products` and adds one <option> element to
   the <select> for every product object in the array.
   ========================================================= */
function populateDropdown() {
  for (const product of products) {
    const option = document.createElement("option");
    option.value = product.name;                          // hidden value sent to JS
    option.textContent = product.name + " - " + formatCurrency(product.price); // what the user sees
    productSelect.appendChild(option);                    // put the option into the dropdown
  }
}

/* =========================================================
   7. ERROR MESSAGE
   ---------------------------------------------------------
   Shows a friendly message for 3 seconds, then hides it.
   classList.add/remove toggles the "visible" CSS class.
   ========================================================= */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("visible");

  setTimeout(function () {
    errorMessage.classList.remove("visible");
    errorMessage.textContent = "";
  }, 3000);
}

/* =========================================================
   8. WHEN THE USER PICKS A PRODUCT
   ---------------------------------------------------------
   Runs on the "change" event. Finds the chosen product in
   the `products` array and fills the price box with the
   formatted price so the user sees it immediately.
   ========================================================= */
function onProductChange() {
  const selectedName = productSelect.value;
  productPrice.value = "";

  if (selectedName === "") {
    return;
  }

  for (const product of products) {
    if (product.name === selectedName) {
      productPrice.value = formatCurrency(product.price);
      break; // we found it, so stop the loop
    }
  }
}

/* =========================================================
   9. VALIDATION
   ---------------------------------------------------------
   Returns true if the quantity is a valid whole number
   greater than zero, otherwise shows an error message.
   ========================================================= */
function isValidQuantity(quantity) {
  if (quantity === "") {
    showError("Please enter a quantity.");
    return false;
  }

  const number = parseInt(quantity, 10);

  if (isNaN(number)) {
    showError("Quantity must be a valid number.");
    return false;
  }

  if (number <= 0) {
    showError("Quantity must be greater than zero.");
    return false;
  }

  return true;
}

/* =========================================================
   10. ADD PRODUCT
   ---------------------------------------------------------
   Runs when the user clicks "Add Product".
   Validates input, then push()es a new object into the
   selectedProducts array and re-draws the list.
   ========================================================= */
function addProduct() {
  const selectedName = productSelect.value;
  const quantity = productQuantity.value;

  if (selectedName === "") {
    showError("Please select a product.");
    return;
  }

  if (!isValidQuantity(quantity)) {
    return;
  }

  // Find this product's price from the products array
  let matchedPrice = 0;
  for (const product of products) {
    if (product.name === selectedName) {
      matchedPrice = product.price;
      break;
    }
  }

  // Create an object and add it to the selectedProducts array
  selectedProducts.push({
    name: selectedName,
    price: matchedPrice,
    quantity: parseInt(quantity, 10)
  });

  displaySelectedProducts();

  // Reset the inputs so the user can add another item
  productSelect.value = "";
  productPrice.value = "";
  productQuantity.value = "";
}

/* =========================================================
   11. DISPLAY SELECTED PRODUCTS
   ---------------------------------------------------------
   Clears the <ul>, then loops over selectedProducts and
   creates one <li> per item. Each <li> shows:
   ProductName x 3 - N2,550,000.00  [Remove]
   ========================================================= */
function displaySelectedProducts() {
  selectedProductsList.innerHTML = ""; // wipe out whatever was there

  if (selectedProducts.length === 0) {
    selectedSection.classList.add("hidden");
    return;
  }

  selectedSection.classList.remove("hidden");

  for (let i = 0; i < selectedProducts.length; i++) {
    const item = selectedProducts[i];
    const itemTotal = item.price * item.quantity;

    const li = document.createElement("li");
    li.className = "selected-product-item";

    const info = document.createElement("span");
    info.className = "product-item-info";
    info.textContent = item.name + " x " + item.quantity + " - " + formatCurrency(itemTotal);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "Remove";
    removeBtn.dataset.index = i;

    li.appendChild(info);
    li.appendChild(removeBtn);
    selectedProductsList.appendChild(li);
  }

  attachRemoveListeners();
}

/* =========================================================
   12. REMOVE A PRODUCT
   ---------------------------------------------------------
   Uses splice() to delete one object from the middle of
   the array (the one whose index matches the click).
   ========================================================= */
function removeProduct(index) {
  selectedProducts.splice(index, 1);
  displaySelectedProducts();
}

/* =========================================================
   13. ATTACH REMOVE BUTTONS
   ---------------------------------------------------------
   Runs after the list is drawn. Selects every .btn-remove
   button and connects its click event to removeProduct().
   ========================================================= */
function attachRemoveListeners() {
  const removeButtons = document.querySelectorAll(".btn-remove");
  for (const btn of removeButtons) {
    btn.addEventListener("click", function () {
      removeProduct(parseInt(btn.dataset.index, 10));
    });
  }
}

/* =========================================================
   14. CALCULATE TOTAL
   ---------------------------------------------------------
   1. A for...of loop walks through selectedProducts and
      adds price * quantity into `subtotal`.
   2. An if condition applies 10% discount when subtotal
      is greater than N500,000.
   3. finalTotal = subtotal - discount.
   4. The results are written back into the DOM.
   ========================================================= */
function calculateTotal() {
  if (selectedProducts.length === 0) {
    showError("Please add at least one product before calculating.");
    return;
  }

  // -- Subtotal using a for...of loop --
  let subtotal = 0;
  for (const product of selectedProducts) {
    subtotal += product.price * product.quantity;
  }

  // -- Discount --
  let discount = 0;
  if (subtotal > 500000) {
    discount = subtotal * 0.10;
  }

  // -- Final total --
  const finalTotal = subtotal - discount;

  // -- Update the page --
  subtotalValue.textContent = formatCurrency(subtotal);
  discountValue.textContent = formatCurrency(discount);
  totalResult.textContent = formatCurrency(finalTotal);
}

/* =========================================================
   15. CLEAR EVERYTHING
   ---------------------------------------------------------
   Empties the selectedProducts array, hides the list, and
   resets all the totals back to N0.00.
   ========================================================= */
function clearAll() {
  selectedProducts.length = 0;            // empty the array
  displaySelectedProducts();              // hides the list + clears the <ul>

  subtotalValue.textContent = formatCurrency(0);
  discountValue.textContent = formatCurrency(0);
  totalResult.textContent = formatCurrency(0);

  productSelect.value = "";
  productPrice.value = "";
  productQuantity.value = "";
}

/* =========================================================
   15b. PRODUCT IMAGE SLIDER  (auto-changing slideshow)
   ---------------------------------------------------------
   currentIndex remembers which picture is on screen right
   now. Every tick, showSlide() runs a for loop over ALL
   the slides and slides each one sideways, so only the
   slide at currentIndex sits in the centre of the box.
   ========================================================= */
let currentIndex = 0;

function buildSlider() {
  for (let i = 0; i < products.length; i++) {
    // One slide wrapper per product
    const slide = document.createElement("div");
    slide.className = "slider-slide";

    const img = document.createElement("img");
    img.src = products[i].image;
    img.alt = products[i].name;

    const caption = document.createElement("div");
    caption.className = "slider-caption";
    caption.textContent = products[i].name;

    slide.appendChild(img);
    slide.appendChild(caption);
    sliderTrack.appendChild(slide);

    // One clickable dot per product
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", "Show " + products[i].name);
    dot.addEventListener("click", function () {
      currentIndex = i;
      showSlide(currentIndex);
    });
    sliderDots.appendChild(dot);
  }
}

function showSlide(target) {
  const slides = sliderTrack.children;
  const dots = sliderDots.children;

  // Loop over every image and move it by one full width per
  // step. i===target ends up at 0% (centre screen), the next
  // one at +100% (off to the right), the previous at -100%.
  for (let i = 0; i < slides.length; i++) {
    const offset = (i - target) * 100;
    slides[i].style.transform = "translateX(" + offset + "%)";
  }

  // Loop over every dot and highlight the active one
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.toggle("active", i === target);
  }
}

function autoPlaySlider() {
  // Move to the next image. The % wraps back to 0 after
  // the last one, so the loop restarts automatically.
  currentIndex = (currentIndex + 1) % products.length;
  showSlide(currentIndex);
}

// Change the picture every 3 seconds.
setInterval(autoPlaySlider, 3000);

/* =========================================================
    16. LIGHT / DARK MODE TOGGLE
    ---------------------------------------------------------
    Applies the "dark-mode" class to <body>. The colours for
    both themes live in style.css CSS variables, so switching
    the class is all we need to change the whole page.
    The choice is saved with localStorage so it survives a
    page refresh.
    ========================================================= */
const themeStorageKey = "easycalc-theme";

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

themeToggle.addEventListener("click", function () {
  const isDark = document.body.classList.contains("dark-mode");
  const nextTheme = isDark ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(themeStorageKey, nextTheme);
});

// Restore the saved theme as soon as the page loads
(function initTheme() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  if (savedTheme === "dark") {
    applyTheme("dark");
  }
})();

/* =========================================================
    17. EVENT LISTENERS
    ---------------------------------------------------------
    Each addEventListener() tells the browser: when this
    event happens on this element, run this function.
    ========================================================= */
productSelect.addEventListener("change", onProductChange);
addBtn.addEventListener("click", addProduct);
calculateBtn.addEventListener("click", calculateTotal);
clearBtn.addEventListener("click", clearAll);

/* =========================================================
    18. INITIALIZE THE PAGE
    ---------------------------------------------------------
    Runs as soon as script.js loads: fills the dropdown so
    it is ready for the user.
    ========================================================= */
populateDropdown();
buildSlider();
showSlide(0);