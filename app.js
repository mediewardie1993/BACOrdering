const STORAGE_KEYS = {
  submittedOrders: "begin-again-cafe-orders.v2",
  inventory: "begin-again-cafe-inventory.v1",
  theme: "begin-again-cafe-theme.v1",
  favorites: "begin-again-cafe-favorites.v1",
  lastOrder: "begin-again-cafe-last-order.v1",
  orderHistory: "begin-again-cafe-order-history.v1",
  loyalty: "begin-again-cafe-loyalty.v1",
  customerProfile: "begin-again-cafe-customer-profile.v1",
};

const SERVICE_RATE = 0.08;
const IMAGE_BASE = "./BAC DRINKS/";
const LOYALTY_MILESTONES = [
  { points: 5, reward: "Free add-on" },
  { points: 10, reward: "Free regular drink" },
  { points: 15, reward: "40 off" },
  { points: 20, reward: "Free premium drink or combo upgrade" },
];

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

const storage = {
  getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.error(`Failed to parse ${key}`, error);
      return fallback;
    }
  },
  setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getSubmittedOrders() { return this.getJSON(STORAGE_KEYS.submittedOrders, []); },
  saveSubmittedOrders(value) { this.setJSON(STORAGE_KEYS.submittedOrders, value); },
  getFavorites() { return this.getJSON(STORAGE_KEYS.favorites, []); },
  saveFavorites(value) { this.setJSON(STORAGE_KEYS.favorites, value); },
  getLastOrder() { return this.getJSON(STORAGE_KEYS.lastOrder, null); },
  saveLastOrder(value) { this.setJSON(STORAGE_KEYS.lastOrder, value); },
  getOrderHistory() { return this.getJSON(STORAGE_KEYS.orderHistory, []); },
  saveOrderHistory(value) { this.setJSON(STORAGE_KEYS.orderHistory, value); },
  getLoyaltyProfile() {
    return this.getJSON(STORAGE_KEYS.loyalty, { points: 0, milestonesReached: [], lastUpdated: null });
  },
  saveLoyaltyProfile(value) { this.setJSON(STORAGE_KEYS.loyalty, value); },
  getCustomerProfile() {
    return this.getJSON(STORAGE_KEYS.customerProfile, { name: "", serviceMode: "", phone: "", notes: "" });
  },
  saveCustomerProfile(value) { this.setJSON(STORAGE_KEYS.customerProfile, value); },
  getInventory() { return this.getJSON(STORAGE_KEYS.inventory, []); },
};

const state = {
  cart: [],
  search: "",
  category: "all",
  favoritesOnly: false,
  selectedSizes: Object.fromEntries(menuItems.map((item) => [item.id, item.sizes[0].id])),
  submittedOrders: storage.getSubmittedOrders(),
  favorites: new Set(storage.getFavorites()),
  lastOrder: storage.getLastOrder(),
  orderHistory: storage.getOrderHistory(),
  loyalty: storage.getLoyaltyProfile(),
  customerProfile: storage.getCustomerProfile(),
  successTimeout: null,
};

const elements = {
  menuGrid: document.getElementById("menu-grid"),
  menuSearch: document.getElementById("menu-search"),
  categoryFilter: document.getElementById("category-filter"),
  themeToggle: document.getElementById("theme-toggle"),
  favoritesFilter: document.getElementById("favorites-filter"),
  cartEmpty: document.getElementById("cart-empty"),
  cartItems: document.getElementById("cart-items"),
  cartPanel: document.querySelector(".cart-panel"),
  subtotalValue: document.getElementById("subtotal-value"),
  serviceValue: document.getElementById("service-value"),
  totalValue: document.getElementById("total-value"),
  mobileCheckoutButton: document.getElementById("mobile-checkout-button"),
  mobileCheckoutCount: document.getElementById("mobile-checkout-count"),
  checkoutForm: document.getElementById("checkout-form"),
  customerName: document.getElementById("customer-name"),
  serviceMode: document.getElementById("service-mode"),
  customerPhone: document.getElementById("customer-phone"),
  orderNotes: document.getElementById("order-notes"),
  loyaltyPoints: document.getElementById("loyalty-points"),
  loyaltyNextReward: document.getElementById("loyalty-next-reward"),
  loyaltyProgressBar: document.getElementById("loyalty-progress-bar"),
  loyaltyProgressText: document.getElementById("loyalty-progress-text"),
  loyaltyRewards: document.getElementById("loyalty-rewards"),
  lastOrderCard: document.getElementById("last-order-card"),
  reorderLastOrder: document.getElementById("reorder-last-order"),
  mostOrderedList: document.getElementById("most-ordered-list"),
  favoritesSummary: document.getElementById("favorites-summary"),
  successToast: document.getElementById("success-toast"),
  successToastTitle: document.getElementById("success-toast-title"),
  successToastBody: document.getElementById("success-toast-body"),
  menuCardTemplate: document.getElementById("menu-card-template"),
  cartItemTemplate: document.getElementById("cart-item-template"),
};

initialize();

function initialize() {
  hydrateCategoryFilter();
  bindEvents();
  hydrateCustomerProfile();
  applySavedTheme();
  renderAll();
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

  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.favoritesFilter.addEventListener("click", toggleFavoritesFilter);
  elements.checkoutForm.addEventListener("submit", handleCheckout);
  elements.reorderLastOrder.addEventListener("click", reorderLastOrder);
  elements.mobileCheckoutButton.addEventListener("click", () => {
    elements.cartPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEYS.inventory) {
      renderMenu();
    }
  });
}

function renderAll() {
  renderMenu();
  renderCart();
  renderQuickActions();
}

function hydrateCategoryFilter() {
  const categories = [...new Set(menuItems.map((item) => item.category))];
  elements.categoryFilter.innerHTML = '<option value="all">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
}

function renderMenu() {
  elements.menuGrid.innerHTML = "";
  elements.favoritesFilter.setAttribute("aria-pressed", String(state.favoritesOnly));
  elements.favoritesFilter.textContent = state.favoritesOnly ? "Showing Favorites" : "Favorites Only";

  const visibleItems = menuItems.filter((item) => {
    const matchesCategory = state.category === "all" || item.category === state.category;
    const matchesSearch = !state.search || `${item.name} ${item.category}`.toLowerCase().includes(state.search);
    const matchesFavorites = !state.favoritesOnly || state.favorites.has(item.id);
    return matchesCategory && matchesSearch && matchesFavorites;
  });

  if (visibleItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.favoritesOnly
      ? "No favorite items match your current search and category filters."
      : "No drinks match that search.";
    elements.menuGrid.appendChild(empty);
    return;
  }

  const inventory = storage.getInventory();
  visibleItems.forEach((item) => {
    const selectedSize = getSelectedSize(item);
    const quantity = getCartQuantity(item.id, selectedSize.id);
    const inventoryItem = getInventoryEntry(inventory, item);
    const isUnavailable = inventoryItem ? !inventoryItem.available || inventoryItem.stock === 0 : false;
    const isLow = inventoryItem ? inventoryItem.stock > 0 && inventoryItem.stock <= 3 : false;
    const fragment = elements.menuCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".menu-card");
    const favoriteButton = fragment.querySelector(".favorite-toggle");
    const valueNode = fragment.querySelector(".quantity-value");

    fragment.querySelector(".menu-badge").textContent = item.category;
    fragment.querySelector(".menu-price").textContent = formatPrice(item.price + selectedSize.delta);
    fragment.querySelector(".menu-title").textContent = item.name;
    fragment.querySelector(".menu-description").textContent = state.favorites.has(item.id)
      ? "Saved to favorites for faster ordering."
      : "Quick add with size-aware ordering.";
    fragment.querySelector(".menu-meta").textContent = isUnavailable
      ? "Currently unavailable"
      : isLow
        ? `Running low: ${inventoryItem.stock} left`
        : selectedSize.delta
          ? `${selectedSize.label} adds ${formatPrice(selectedSize.delta)}`
          : "Base size selected";

    const imageName = imageMap[`${item.name}|${item.category}`];
    if (imageName) {
      fragment.querySelector(".menu-image").style.backgroundImage = `url("${encodeURI(`${IMAGE_BASE}${imageName}`)}")`;
    }

    favoriteButton.classList.toggle("is-favorite", state.favorites.has(item.id));
    favoriteButton.setAttribute("aria-pressed", String(state.favorites.has(item.id)));
    favoriteButton.textContent = state.favorites.has(item.id) ? "♥" : "♡";
    favoriteButton.addEventListener("click", () => toggleFavorite(item.id));

    const sizePickerWrap = fragment.querySelector(".size-picker-wrap");
    const sizePicker = fragment.querySelector(".size-picker");
    if (item.sizes.length <= 1) {
      sizePickerWrap.hidden = true;
    } else {
      item.sizes.forEach((size) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `size-chip${selectedSize.id === size.id ? " active" : ""}`;
        button.textContent = size.delta ? `${size.label} +${size.delta}` : size.label;
        button.disabled = isUnavailable;
        button.addEventListener("click", () => {
          state.selectedSizes[item.id] = size.id;
          renderMenu();
        });
        sizePicker.appendChild(button);
      });
    }

    valueNode.textContent = String(quantity);
    fragment.querySelector(".quantity-plus").disabled = isUnavailable;
    fragment.querySelector(".quantity-plus").addEventListener("click", () => updateCartQuantity(item, selectedSize, quantity + 1, valueNode));
    fragment.querySelector(".quantity-minus").addEventListener("click", () => updateCartQuantity(item, selectedSize, quantity - 1, valueNode));

    card.classList.toggle("is-unavailable", isUnavailable);
    elements.menuGrid.appendChild(fragment);
  });
}

function renderCart() {
  elements.cartItems.innerHTML = "";
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  elements.mobileCheckoutCount.textContent = String(itemCount);
  elements.mobileCheckoutCount.classList.remove("bump");
  void elements.mobileCheckoutCount.offsetWidth;
  elements.mobileCheckoutCount.classList.add("bump");
  elements.cartEmpty.hidden = state.cart.length > 0;

  if (state.cart.length === 0) {
    updateTotals();
    return;
  }

  state.cart.forEach((entry) => {
    const fragment = elements.cartItemTemplate.content.cloneNode(true);
    const quantityNode = fragment.querySelector(".cart-quantity-value");
    fragment.querySelector(".cart-item-name").textContent = entry.name;
    fragment.querySelector(".cart-item-meta").textContent = `${entry.sizeLabel} | ${formatPrice(entry.unitPrice)} each`;
    fragment.querySelector(".cart-item-note").textContent = entry.note || "";
    fragment.querySelector(".cart-item-price").textContent = formatPrice(entry.totalPrice);
    fragment.querySelector(".remove-item").addEventListener("click", () => removeCartItem(entry.id));
    quantityNode.textContent = String(entry.quantity);
    fragment.querySelector(".cart-plus").addEventListener("click", () => updateCartLine(entry.id, entry.quantity + 1, quantityNode));
    fragment.querySelector(".cart-minus").addEventListener("click", () => updateCartLine(entry.id, entry.quantity - 1, quantityNode));
    elements.cartItems.appendChild(fragment);
  });

  updateTotals();
}

function renderQuickActions() {
  renderLastOrder();
  renderMostOrdered();
  renderFavoritesSummary();
  renderLoyalty();
}

function renderLastOrder() {
  if (!state.lastOrder) {
    elements.lastOrderCard.textContent = "No previous order yet.";
    elements.reorderLastOrder.disabled = true;
    return;
  }

  const itemSummary = state.lastOrder.items.map((item) => `${item.quantity}x ${item.name}`).join(", ");
  elements.lastOrderCard.innerHTML = `
    <strong>${state.lastOrder.customer.name || "Guest"}</strong>
    <span>${formatPrice(state.lastOrder.total)} | ${new Date(state.lastOrder.createdAt).toLocaleString()}</span>
    <span>${itemSummary}</span>
  `;
  elements.reorderLastOrder.disabled = false;
}

function renderMostOrdered() {
  const topItems = getMostOrderedItems();
  if (topItems.length === 0) {
    elements.mostOrderedList.textContent = "Your top drinks will appear here.";
    return;
  }

  elements.mostOrderedList.innerHTML = "";
  topItems.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-pill";
    button.textContent = `${entry.name} (${entry.count})`;
    button.addEventListener("click", () => {
      const item = findMenuItem(entry.itemId);
      if (!item) return;
      updateCartQuantity(item, getSelectedSize(item), getCartQuantity(item.id, getSelectedSize(item).id) + 1);
    });
    elements.mostOrderedList.appendChild(button);
  });
}

function renderFavoritesSummary() {
  const favoriteItems = menuItems.filter((item) => state.favorites.has(item.id));
  if (favoriteItems.length === 0) {
    elements.favoritesSummary.textContent = "No favorites saved yet.";
    return;
  }

  elements.favoritesSummary.innerHTML = "";
  favoriteItems.slice(0, 5).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-pill";
    button.textContent = item.name;
    button.addEventListener("click", () => {
      state.category = "all";
      elements.categoryFilter.value = "all";
      state.search = item.name.toLowerCase();
      elements.menuSearch.value = item.name;
      renderMenu();
    });
    elements.favoritesSummary.appendChild(button);
  });
}

function renderLoyalty() {
  const nextMilestone = LOYALTY_MILESTONES.find((entry) => entry.points > state.loyalty.points) || LOYALTY_MILESTONES.at(-1);
  const previousMilestone = [...LOYALTY_MILESTONES].reverse().find((entry) => entry.points <= state.loyalty.points);
  const start = previousMilestone?.points || 0;
  const end = nextMilestone?.points || start || 1;
  const progress = Math.min(100, ((state.loyalty.points - start) / Math.max(1, end - start)) * 100);

  elements.loyaltyPoints.textContent = String(state.loyalty.points);
  elements.loyaltyNextReward.textContent = nextMilestone
    ? `Next reward: ${nextMilestone.reward}`
    : "All milestones unlocked";
  elements.loyaltyProgressBar.style.width = `${progress}%`;
  elements.loyaltyProgressText.textContent = nextMilestone
    ? `${state.loyalty.points} / ${nextMilestone.points} points`
    : `${state.loyalty.points} points total`;

  elements.loyaltyRewards.innerHTML = "";
  LOYALTY_MILESTONES.forEach((entry) => {
    const chip = document.createElement("span");
    chip.className = "reward-chip";
    chip.textContent = `${entry.points}: ${entry.reward}`;
    if (state.loyalty.points >= entry.points) {
      chip.style.background = "color-mix(in srgb, var(--accent) 18%, white 82%)";
    }
    elements.loyaltyRewards.appendChild(chip);
  });
}

function updateCartQuantity(item, size, nextQuantity, animateNode) {
  const safeQuantity = Math.max(0, nextQuantity);
  const lineId = buildLineId(item.id, size.id);
  const existing = state.cart.find((entry) => entry.id === lineId);

  if (safeQuantity === 0) {
    state.cart = state.cart.filter((entry) => entry.id !== lineId);
  } else if (existing) {
    existing.quantity = safeQuantity;
    existing.unitPrice = item.price + size.delta;
    existing.totalPrice = existing.quantity * existing.unitPrice;
    existing.price = existing.unitPrice;
  } else {
    state.cart.push({
      id: lineId,
      itemId: item.id,
      name: item.name,
      category: item.category,
      price: item.price + size.delta,
      quantity: safeQuantity,
      sizeId: size.id,
      size: size.label,
      sizeLabel: size.label,
      note: null,
      unitPrice: item.price + size.delta,
      totalPrice: safeQuantity * (item.price + size.delta),
    });
  }

  pulseNode(animateNode);
  renderMenu();
  renderCart();
}

function updateCartLine(lineId, nextQuantity, animateNode) {
  const line = state.cart.find((entry) => entry.id === lineId);
  if (!line) {
    return;
  }

  const item = findMenuItem(line.itemId);
  if (!item) {
    removeCartItem(lineId);
    return;
  }

  const size = item.sizes.find((entry) => entry.id === line.sizeId) || item.sizes[0];
  updateCartQuantity(item, size, nextQuantity, animateNode);
}

function removeCartItem(lineId) {
  state.cart = state.cart.filter((entry) => entry.id !== lineId);
  renderMenu();
  renderCart();
}

function updateTotals() {
  const totals = getCartTotals();
  elements.subtotalValue.textContent = formatPrice(totals.subtotal);
  elements.serviceValue.textContent = formatPrice(totals.serviceFee);
  elements.totalValue.textContent = formatPrice(totals.total);
}

function getCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const serviceFee = Math.round(subtotal * SERVICE_RATE);
  return {
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
  };
}

function handleCheckout(event) {
  event.preventDefault();

  if (state.cart.length === 0) {
    window.alert("Add at least one drink before placing the order.");
    return;
  }

  const customer = {
    name: elements.customerName.value.trim(),
    serviceMode: elements.serviceMode.value.trim(),
    phone: elements.customerPhone.value.trim(),
    notes: elements.orderNotes.value.trim(),
  };

  if (!customer.name || !customer.serviceMode) {
    window.alert("Please complete the required checkout fields.");
    return;
  }

  const totals = getCartTotals();
  const order = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    customer,
    customerName: customer.name,
    serviceMode: customer.serviceMode,
    customerPhone: customer.phone,
    orderNotes: customer.notes,
    items: state.cart.map((item) => ({
      id: item.id,
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      price: item.unitPrice,
      quantity: item.quantity,
      size: item.sizeLabel,
      sizeLabel: item.sizeLabel,
      note: item.note,
    })),
    subtotal: totals.subtotal,
    serviceFee: totals.serviceFee,
    service: totals.serviceFee,
    total: totals.total,
  };

  state.submittedOrders.unshift({
    id: order.id,
    customerName: order.customer.name,
    serviceMode: order.customer.serviceMode,
    customerPhone: order.customer.phone,
    orderNotes: order.customer.notes,
    items: order.items,
    subtotal: order.subtotal,
    service: order.serviceFee,
    total: order.total,
    createdAt: order.createdAt,
  });
  storage.saveSubmittedOrders(state.submittedOrders);

  state.lastOrder = order;
  storage.saveLastOrder(order);

  state.orderHistory.unshift({
    id: order.id,
    createdAt: order.createdAt,
    items: order.items,
    total: order.total,
  });
  storage.saveOrderHistory(state.orderHistory);

  state.loyalty = createUpdatedLoyaltyProfile(state.loyalty, 1);
  storage.saveLoyaltyProfile(state.loyalty);

  state.customerProfile = { ...customer };
  storage.saveCustomerProfile(state.customerProfile);

  state.cart = [];
  elements.checkoutForm.reset();
  hydrateCustomerProfile();
  renderAll();
  showSuccessToast(order);
}

function createUpdatedLoyaltyProfile(currentProfile, earnedPoints) {
  const points = (currentProfile?.points || 0) + earnedPoints;
  return {
    points,
    milestonesReached: LOYALTY_MILESTONES.filter((entry) => points >= entry.points).map((entry) => entry.points),
    lastUpdated: new Date().toISOString(),
  };
}

function reorderLastOrder() {
  if (!state.lastOrder) {
    return;
  }

  const rebuiltCart = [];
  state.lastOrder.items.forEach((savedItem) => {
    const item = findMenuItem(savedItem.itemId);
    if (!item) {
      return;
    }
    const size = item.sizes.find((entry) => entry.label === savedItem.sizeLabel || entry.id === savedItem.size) || item.sizes[0];
    rebuiltCart.push({
      id: buildLineId(item.id, size.id),
      itemId: item.id,
      name: item.name,
      category: item.category,
      price: item.price + size.delta,
      quantity: savedItem.quantity,
      sizeId: size.id,
      size: size.label,
      sizeLabel: size.label,
      note: savedItem.note || null,
      unitPrice: item.price + size.delta,
      totalPrice: savedItem.quantity * (item.price + size.delta),
    });
    state.selectedSizes[item.id] = size.id;
  });

  state.cart = rebuiltCart;
  renderAll();
}

function toggleFavorite(itemId) {
  if (state.favorites.has(itemId)) {
    state.favorites.delete(itemId);
  } else {
    state.favorites.add(itemId);
  }

  storage.saveFavorites([...state.favorites]);
  renderMenu();
  renderFavoritesSummary();
}

function toggleFavoritesFilter() {
  state.favoritesOnly = !state.favoritesOnly;
  renderMenu();
}

function getMostOrderedItems() {
  const counts = new Map();
  state.orderHistory.forEach((order) => {
    (order.items || []).forEach((item) => {
      counts.set(item.itemId, (counts.get(item.itemId) || 0) + Number(item.quantity || 0));
    });
  });

  return Array.from(counts.entries())
    .map(([itemId, count]) => {
      const item = findMenuItem(itemId);
      return item ? { itemId, count, name: item.name } : null;
    })
    .filter(Boolean)
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

function hydrateCustomerProfile() {
  elements.customerName.value = state.customerProfile.name || "";
  elements.serviceMode.value = state.customerProfile.serviceMode || "";
  elements.customerPhone.value = state.customerProfile.phone || "";
  elements.orderNotes.value = state.customerProfile.notes || "";
}

function showSuccessToast(order) {
  const nextMilestone = LOYALTY_MILESTONES.find((entry) => entry.points > state.loyalty.points);
  elements.successToastTitle.textContent = `${order.customer.name}, order placed!`;
  elements.successToastBody.textContent = `Total ${formatPrice(order.total)}. +1 point earned. You now have ${state.loyalty.points} point${state.loyalty.points === 1 ? "" : "s"}${nextMilestone ? `. Next reward at ${nextMilestone.points}.` : "."}`;
  elements.successToast.classList.remove("hidden");
  clearTimeout(state.successTimeout);
  state.successTimeout = window.setTimeout(() => {
    elements.successToast.classList.add("hidden");
  }, 3200);
}

function getSelectedSize(item) {
  return item.sizes.find((entry) => entry.id === state.selectedSizes[item.id]) || item.sizes[0];
}

function getCartQuantity(itemId, sizeId) {
  return state.cart
    .filter((entry) => entry.itemId === itemId && entry.sizeId === sizeId)
    .reduce((sum, entry) => sum + entry.quantity, 0);
}

function getInventoryEntry(inventory, item) {
  return inventory.find((entry) => entry.name === item.name && entry.category === item.category)
    || inventory.find((entry) => entry.name === item.name);
}

function findMenuItem(itemId) {
  return menuItems.find((item) => item.id === itemId) || null;
}

function buildLineId(itemId, sizeId) {
  return `${itemId}::${sizeId}`;
}

function pulseNode(node) {
  if (!node) {
    return;
  }
  node.classList.remove("bump");
  void node.offsetWidth;
  node.classList.add("bump");
}

function formatPrice(value) {
  return `${Math.round(value)}`;
}

function applySavedTheme() {
  const isDark = localStorage.getItem(STORAGE_KEYS.theme) === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  elements.themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
}

function toggleTheme() {
  const isDark = !document.body.classList.contains("dark-mode");
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? "dark" : "light");
  applySavedTheme();
}
