const STORAGE_KEY = "begin-again-cafe-orders.v2";
const INVENTORY_STORAGE_KEY = "begin-again-cafe-inventory.v1";
const SERVICE_RATE = 0.08;
const IMAGE_BASE = "./BAC DRINKS/";

const standardSizes = [
  { id: "base", label: "Classic", delta: 0 },
  { id: "chapter", label: "Chapter", delta: 10 },
  { id: "novel", label: "Novel", delta: 20 },
];

const frappeSizes = [
  { id: "base", label: "Classic", delta: 0 },
  { id: "chapter", label: "Chapter", delta: 10 },
  { id: "novel", label: "Novel", delta: 20 },
  { id: "frappe", label: "Frappe", delta: 30 },
];

const menuItems = [
  { id: "flat-white", name: "Flat White", category: "Espresso Hot", price: 105, sizes: standardSizes },
  { id: "americano-hot", name: "Americano", category: "Espresso Hot", price: 85, sizes: standardSizes },
  { id: "cappuccino", name: "Cappuccino", category: "Espresso Hot", price: 105, sizes: standardSizes },
  { id: "cafe-latte-hot", name: "Cafe Latte", category: "Espresso Hot", price: 105, sizes: standardSizes },
  { id: "dirty-spaniard-hot", name: "Dirty Spaniard", category: "Espresso Hot", price: 165, sizes: standardSizes },
  { id: "creamy-vanilla-hot", name: "Creamy Vanilla", category: "Espresso Hot", price: 155, sizes: standardSizes },
  { id: "mocha-ripple-hot", name: "Mocha Ripple", category: "Espresso Hot", price: 155, sizes: standardSizes },
  { id: "caramel-cognac-hot", name: "Caramel Cognac", category: "Espresso Hot", price: 155, sizes: standardSizes },
  { id: "americano-cold", name: "Americano", category: "Espresso Cold", price: 100, sizes: standardSizes },
  { id: "cafe-latte-cold", name: "Cafe Latte", category: "Espresso Cold", price: 115, sizes: standardSizes },
  { id: "creamy-vanilla-cold", name: "Creamy Vanilla", category: "Espresso Cold", price: 165, sizes: frappeSizes },
  { id: "mocha-ripple-cold", name: "Mocha Ripple", category: "Espresso Cold", price: 165, sizes: frappeSizes },
  { id: "caramel-cognac-cold", name: "Caramel Cognac", category: "Espresso Cold", price: 165, sizes: frappeSizes },
  { id: "pink-foam", name: "Pink Foam", category: "Espresso Cold", price: 175, sizes: frappeSizes },
  { id: "dirty-spaniard-cold", name: "Dirty Spaniard", category: "Espresso Cold", price: 175, sizes: frappeSizes },
  { id: "choco-loco", name: "Choco Loco", category: "Milk", price: 165, sizes: frappeSizes },
  { id: "strawberry-dream", name: "Strawberry Dream", category: "Milk", price: 165, sizes: frappeSizes },
  { id: "strawberry-fizz", name: "Strawberry Fizz", category: "Fizz", price: 165, sizes: standardSizes },
  { id: "passion-fruit-fizz", name: "Passion Fruit Fizz", category: "Fizz", price: 165, sizes: standardSizes },
  { id: "lemon-fizz", name: "Lemon Fizz", category: "Fizz", price: 155, sizes: standardSizes },
  { id: "blueberry-fizz", name: "Blueberry Fizz", category: "Fizz", price: 165, sizes: standardSizes },
  { id: "peach-fizz", name: "Peach Fizz", category: "Fizz", price: 165, sizes: standardSizes },
  { id: "peach-mango-fizz", name: "Peach Mango Fizz", category: "Fizz", price: 165, sizes: standardSizes },
  { id: "strawberry-tea", name: "Strawberry Tea", category: "Black Tea", price: 165, sizes: standardSizes },
  { id: "lemon-mint-tea", name: "Lemon Mint Tea", category: "Black Tea", price: 165, sizes: standardSizes },
  { id: "lemon-tea", name: "Lemon Tea", category: "Black Tea", price: 155, sizes: standardSizes },
  { id: "blueberry-tea", name: "Blueberry Tea", category: "Black Tea", price: 165, sizes: standardSizes },
  { id: "peach-tea", name: "Peach Tea", category: "Black Tea", price: 165, sizes: standardSizes },
  { id: "matcha-blush", name: "Matcha Blush", category: "Matcha", price: 170, sizes: frappeSizes },
  { id: "sea-salt-matcha", name: "Sea Salt Matcha", category: "Matcha", price: 160, sizes: frappeSizes },
  { id: "soft-matcha", name: "Soft Matcha", category: "Matcha", price: 150, sizes: frappeSizes },
];

const imageMap = {
  "Americano|Espresso Hot": "americano.png",
  "Americano|Espresso Cold": "americano.png",
  "Blueberry Tea|Black Tea": "blueberry tea.png",
  "Cappuccino|Espresso Hot": "capuccino_cafe latte_creamy vanilla.png",
  "Cafe Latte|Espresso Hot": "capuccino_cafe latte_creamy vanilla.png",
  "Cafe Latte|Espresso Cold": "capuccino_cafe latte_creamy vanilla.png",
  "Caramel Cognac|Espresso Hot": "caramel cognac.png",
  "Caramel Cognac|Espresso Cold": "caramel cognac.png",
  "Choco Loco|Milk": "choco loco.png",
  "Creamy Vanilla|Espresso Hot": "creamy vanilla.png",
  "Creamy Vanilla|Espresso Cold": "creamy vanilla.png",
  "Dirty Spaniard|Espresso Hot": "drity spaniard.png",
  "Dirty Spaniard|Espresso Cold": "drity spaniard.png",
  "Flat White|Espresso Hot": "capuccino_cafe latte_creamy vanilla.png",
  "Lemon Mint Tea|Black Tea": "lemon mint tea.png",
  "Mocha Ripple|Espresso Hot": "mocha ripple.png",
  "Mocha Ripple|Espresso Cold": "mocha ripple.png",
  "Peach Tea|Black Tea": "peach tea.png",
  "Pink Foam|Espresso Cold": "pink foam.png",
  "Strawberry Dream|Milk": "strawberry dream.png",
  "Strawberry Tea|Black Tea": "strawberry tea.png",
  "Strawberry Fizz|Fizz": "fizz series.png",
  "Passion Fruit Fizz|Fizz": "fizz series.png",
  "Lemon Fizz|Fizz": "fizz series.png",
  "Blueberry Fizz|Fizz": "fizz series.png",
  "Peach Fizz|Fizz": "fizz series.png",
  "Peach Mango Fizz|Fizz": "fizz series.png",
};

const state = {
  cart: [],
  submittedOrders: loadOrders(),
  search: "",
  category: "all",
  selectedSizes: Object.fromEntries(menuItems.map((item) => [item.id, item.sizes[0].id])),
};

const elements = {
  featuredBanner: document.getElementById("featured-banner"),
  menuGrid: document.getElementById("menu-grid"),
  menuSearch: document.getElementById("menu-search"),
  categoryFilter: document.getElementById("category-filter"),
  cartEmpty: document.getElementById("cart-empty"),
  cartItems: document.getElementById("cart-items"),
  subtotalValue: document.getElementById("subtotal-value"),
  serviceValue: document.getElementById("service-value"),
  totalValue: document.getElementById("total-value"),
  checkoutForm: document.getElementById("checkout-form"),
  menuCardTemplate: document.getElementById("menu-card-template"),
  cartItemTemplate: document.getElementById("cart-item-template"),
};

initialize();

function initialize() {
  hydrateCategoryFilter();
  bindEvents();
  render();
}

function bindEvents() {
  elements.menuSearch.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderMenu();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderMenu();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === INVENTORY_STORAGE_KEY) {
      renderMenu();
    }
  });

  elements.checkoutForm.addEventListener("submit", handleCheckout);
}

function hydrateCategoryFilter() {
  const categories = [...new Set(menuItems.map((item) => item.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
}

function render() {
  renderFeaturedBanner();
  renderMenu();
  renderCart();
}

function renderFeaturedBanner() {
  elements.featuredBanner.innerHTML = `
    <p class="section-kicker">Customer Ordering</p>
    <strong>Choose your drink, pick a size, then tap + or -.</strong>
    <p>Items marked unavailable from the staff side will automatically stop accepting orders here.</p>
  `;
}

function renderMenu() {
  elements.menuGrid.innerHTML = "";
  const inventory = loadInventoryMap();
  const visibleItems = menuItems.filter((item) => {
    const matchesCategory = state.category === "all" || item.category === state.category;
    const haystack = `${item.name} ${item.category}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    return matchesCategory && matchesSearch;
  });

  if (visibleItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No drinks match that search.";
    elements.menuGrid.appendChild(empty);
    return;
  }

  visibleItems.forEach((item) => {
    const inventoryItem = getInventoryEntry(inventory, item);
    const isUnavailable = inventoryItem ? !inventoryItem.available || inventoryItem.stock === 0 : false;
    const isLow = inventoryItem ? inventoryItem.stock <= 3 && inventoryItem.stock > 0 : false;
    const fragment = elements.menuCardTemplate.content.cloneNode(true);
    const selectedSize = getSelectedSize(item);
    const quantity = getCartQuantity(item.id, selectedSize.id);
    const cardPrice = item.price + selectedSize.delta;

    fragment.querySelector(".menu-badge").textContent = item.category;
    fragment.querySelector(".menu-price").textContent = formatPrice(cardPrice);
    fragment.querySelector(".menu-title").textContent = item.name;
    const imageName = imageMap[`${item.name}|${item.category}`];
    if (imageName) {
      fragment.querySelector(".menu-image").style.backgroundImage = `url("${encodeURI(`${IMAGE_BASE}${imageName}`)}")`;
    }
    fragment.querySelector(".menu-description").textContent = isUnavailable
      ? "Currently unavailable."
      : "Fixed menu pricing for quick ordering.";
    fragment.querySelector(".menu-meta").textContent = isUnavailable
      ? "Sold out"
      : isLow
        ? `Running low: ${inventoryItem.stock} left`
        : selectedSize.delta
          ? `${selectedSize.label} adds ${formatPrice(selectedSize.delta)}`
          : "Base size selected";

    const sizePickerWrap = fragment.querySelector(".size-picker-wrap");
    const sizePicker = fragment.querySelector(".size-picker");
    if (item.sizes.length <= 1) {
      sizePickerWrap.hidden = true;
    } else {
      item.sizes.forEach((size) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `size-chip${size.id === selectedSize.id ? " active" : ""}`;
        button.textContent = size.delta ? `${size.label} +${size.delta}` : size.label;
        button.disabled = isUnavailable;
        button.addEventListener("click", () => {
          state.selectedSizes[item.id] = size.id;
          renderMenu();
        });
        sizePicker.appendChild(button);
      });
    }

    const plusButton = fragment.querySelector(".quantity-plus");
    const minusButton = fragment.querySelector(".quantity-minus");
    fragment.querySelector(".quantity-value").textContent = String(quantity);
    plusButton.disabled = isUnavailable;
    plusButton.addEventListener("click", () => changeQuantity(item, selectedSize, 1));
    minusButton.addEventListener("click", () => changeQuantity(item, selectedSize, -1));

    elements.menuGrid.appendChild(fragment);
  });
}

function changeQuantity(item, size, delta) {
  const inventory = loadInventoryMap();
  const inventoryItem = getInventoryEntry(inventory, item);
  if (delta > 0 && inventoryItem && (!inventoryItem.available || inventoryItem.stock === 0)) {
    return;
  }

  const cartItem = state.cart.find((entry) => entry.itemId === item.id && entry.sizeId === size.id);

  if (delta > 0) {
    if (cartItem) {
      cartItem.quantity += 1;
      cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice;
    } else {
      state.cart.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        name: item.name,
        sizeId: size.id,
        sizeLabel: size.label,
        quantity: 1,
        unitPrice: item.price + size.delta,
        totalPrice: item.price + size.delta,
      });
    }
  }

  if (delta < 0 && cartItem) {
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice;
    } else {
      state.cart = state.cart.filter((entry) => entry.id !== cartItem.id);
    }
  }

  renderMenu();
  renderCart();
}

function renderCart() {
  elements.cartItems.innerHTML = "";
  const isEmpty = state.cart.length === 0;
  elements.cartEmpty.hidden = !isEmpty;

  if (isEmpty) {
    updateCartTotals();
    return;
  }

  state.cart.forEach((entry) => {
    const fragment = elements.cartItemTemplate.content.cloneNode(true);
    fragment.querySelector(".cart-item-name").textContent = `${entry.quantity}x ${entry.name}`;
    fragment.querySelector(".cart-item-meta").textContent = `${entry.sizeLabel} | ${formatPrice(entry.unitPrice)} each`;
    fragment.querySelector(".cart-item-note").textContent = "";
    fragment.querySelector(".cart-item-price").textContent = formatPrice(entry.totalPrice);
    fragment.querySelector(".remove-item").textContent = "-1";
    fragment.querySelector(".remove-item").addEventListener("click", () => changeCartLine(entry.id, -1));
    elements.cartItems.appendChild(fragment);
  });

  updateCartTotals();
}

function changeCartLine(cartId, delta) {
  const entry = state.cart.find((item) => item.id === cartId);
  if (!entry) {
    return;
  }

  if (delta < 0) {
    if (entry.quantity > 1) {
      entry.quantity -= 1;
      entry.totalPrice = entry.quantity * entry.unitPrice;
    } else {
      state.cart = state.cart.filter((item) => item.id !== cartId);
    }
  }

  renderMenu();
  renderCart();
}

function updateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const service = Math.round(subtotal * SERVICE_RATE);
  const total = subtotal + service;

  elements.subtotalValue.textContent = formatPrice(subtotal);
  elements.serviceValue.textContent = formatPrice(service);
  elements.totalValue.textContent = formatPrice(total);
}

function handleCheckout(event) {
  event.preventDefault();

  if (state.cart.length === 0) {
    window.alert("Add at least one drink before placing the order.");
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const service = Math.round(subtotal * SERVICE_RATE);
  const total = subtotal + service;
  const formData = new FormData(elements.checkoutForm);

  state.submittedOrders.unshift({
    id: crypto.randomUUID(),
    customerName: String(formData.get("customerName")).trim(),
    serviceMode: String(formData.get("serviceMode")).trim(),
    customerPhone: String(formData.get("customerPhone")).trim(),
    orderNotes: String(formData.get("orderNotes")).trim(),
    items: state.cart.map((item) => ({ ...item })),
    subtotal,
    service,
    total,
    createdAt: new Date().toISOString(),
  });

  persistOrders();
  state.cart = [];
  elements.checkoutForm.reset();
  render();
  window.alert("Order placed.");
}

function getSelectedSize(item) {
  const selectedId = state.selectedSizes[item.id];
  return item.sizes.find((size) => size.id === selectedId) || item.sizes[0];
}

function getCartQuantity(itemId, sizeId) {
  return state.cart
    .filter((entry) => entry.itemId === itemId && entry.sizeId === sizeId)
    .reduce((sum, entry) => sum + entry.quantity, 0);
}

function loadOrders() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load saved orders", error);
    return [];
  }
}

function persistOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.submittedOrders));
}

function loadInventoryMap() {
  const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load inventory map", error);
    return [];
  }
}

function getInventoryEntry(inventory, item) {
  return inventory.find((entry) => entry.name === item.name && entry.category === item.category)
    || inventory.find((entry) => entry.name === item.name);
}

function formatPrice(value) {
  return `${Math.round(value)}`;
}
