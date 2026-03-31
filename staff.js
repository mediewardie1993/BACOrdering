const STAFF_STORAGE_KEY = "begin-again-cafe-staff-orders.v4";
const INVENTORY_STORAGE_KEY = "begin-again-cafe-inventory.v1";
const MENU_CONFIG_STORAGE_KEY = "begin-again-cafe-menu-config.v1";
const FEATURED_DRINK_STORAGE_KEY = "begin-again-cafe-featured-drink.v1";
const REDEEMABLES_STORAGE_KEY = "begin-again-cafe-redeemables.v1";
const THEME_STORAGE_KEY = "begin-again-cafe-staff-theme.v2";
const CUSTOMER_STORAGE_KEYS = [
  "begin-again-cafe-orders.v2",
  "begin-again-cafe-mobile-orders.v1",
];

const DEFAULT_REDEEMABLES = [
  { id: "reward-1", title: "Free add-on", points: 5, description: "Low-cost perk for returning customers." },
  { id: "reward-2", title: "Free size upgrade", points: 10, description: "Boost value without giving away a whole drink." },
  { id: "reward-3", title: "P20 off", points: 15, description: "Small discount that protects margin." },
  { id: "reward-4", title: "Premium drink or combo upgrade", points: 20, description: "Best used for loyal regulars." },
];
const ACTIVE_BOARD_STATUSES = new Set(["new", "preparing", "ready", "issue"]);
let remoteOrderPollingHandle = null;

const menuCatalog = [
  { id: "flat-white", name: "Flat White", category: "Espresso Hot", price: 105 },
  { id: "americano-hot", name: "Americano", category: "Espresso Hot", price: 85 },
  { id: "cappuccino", name: "Cappuccino", category: "Espresso Hot", price: 105 },
  { id: "cafe-latte-hot", name: "Cafe Latte", category: "Espresso Hot", price: 105 },
  { id: "dirty-spaniard-hot", name: "Dirty Spaniard", category: "Espresso Hot", price: 165 },
  { id: "creamy-vanilla-hot", name: "Creamy Vanilla", category: "Espresso Hot", price: 155 },
  { id: "mocha-ripple-hot", name: "Mocha Ripple", category: "Espresso Hot", price: 155 },
  { id: "caramel-cognac-hot", name: "Caramel Cognac", category: "Espresso Hot", price: 155 },
  { id: "americano-cold", name: "Americano", category: "Espresso Cold", price: 100 },
  { id: "cafe-latte-cold", name: "Cafe Latte", category: "Espresso Cold", price: 115 },
  { id: "creamy-vanilla-cold", name: "Creamy Vanilla", category: "Espresso Cold", price: 165 },
  { id: "mocha-ripple-cold", name: "Mocha Ripple", category: "Espresso Cold", price: 165 },
  { id: "caramel-cognac-cold", name: "Caramel Cognac", category: "Espresso Cold", price: 165 },
  { id: "pink-foam", name: "Pink Foam", category: "Espresso Cold", price: 175 },
  { id: "dirty-spaniard-cold", name: "Dirty Spaniard", category: "Espresso Cold", price: 175 },
  { id: "choco-loco", name: "Choco Loco", category: "Milk", price: 165 },
  { id: "strawberry-dream", name: "Strawberry Dream", category: "Milk", price: 165 },
  { id: "strawberry-fizz", name: "Strawberry Fizz", category: "Fizz", price: 165 },
  { id: "passion-fruit-fizz", name: "Passion Fruit Fizz", category: "Fizz", price: 165 },
  { id: "lemon-fizz", name: "Lemon Fizz", category: "Fizz", price: 155 },
  { id: "blueberry-fizz", name: "Blueberry Fizz", category: "Fizz", price: 165 },
  { id: "peach-fizz", name: "Peach Fizz", category: "Fizz", price: 165 },
  { id: "peach-mango-fizz", name: "Peach Mango Fizz", category: "Fizz", price: 165 },
  { id: "strawberry-tea", name: "Strawberry Tea", category: "Black Tea", price: 165 },
  { id: "lemon-mint-tea", name: "Lemon Mint Tea", category: "Black Tea", price: 165 },
  { id: "lemon-tea", name: "Lemon Tea", category: "Black Tea", price: 155 },
  { id: "blueberry-tea", name: "Blueberry Tea", category: "Black Tea", price: 165 },
  { id: "peach-tea", name: "Peach Tea", category: "Black Tea", price: 165 },
  { id: "matcha-blush", name: "Matcha Blush", category: "Matcha", price: 170 },
  { id: "sea-salt-matcha", name: "Sea Salt Matcha", category: "Matcha", price: 160 },
  { id: "soft-matcha", name: "Soft Matcha", category: "Matcha", price: 150 },
];

const defaultInventory = [
  { name: "Flat White", category: "Espresso Hot", stock: 12, available: true },
  { name: "Americano", category: "Espresso Hot", stock: 12, available: true },
  { name: "Cappuccino", category: "Espresso Hot", stock: 10, available: true },
  { name: "Cafe Latte", category: "Espresso Hot", stock: 12, available: true },
  { name: "Dirty Spaniard", category: "Espresso Hot", stock: 8, available: true },
  { name: "Creamy Vanilla", category: "Espresso Hot", stock: 7, available: true },
  { name: "Mocha Ripple", category: "Espresso Hot", stock: 7, available: true },
  { name: "Caramel Cognac", category: "Espresso Hot", stock: 6, available: true },
  { name: "Americano", category: "Espresso Cold", stock: 10, available: true },
  { name: "Cafe Latte", category: "Espresso Cold", stock: 10, available: true },
  { name: "Creamy Vanilla", category: "Espresso Cold", stock: 6, available: true },
  { name: "Mocha Ripple", category: "Espresso Cold", stock: 6, available: true },
  { name: "Caramel Cognac", category: "Espresso Cold", stock: 6, available: true },
  { name: "Pink Foam", category: "Espresso Cold", stock: 5, available: true },
  { name: "Dirty Spaniard", category: "Espresso Cold", stock: 5, available: true },
  { name: "Choco Loco", category: "Milk", stock: 7, available: true },
  { name: "Strawberry Dream", category: "Milk", stock: 6, available: true },
  { name: "Strawberry Fizz", category: "Fizz", stock: 7, available: true },
  { name: "Passion Fruit Fizz", category: "Fizz", stock: 7, available: true },
  { name: "Lemon Fizz", category: "Fizz", stock: 7, available: true },
  { name: "Blueberry Fizz", category: "Fizz", stock: 7, available: true },
  { name: "Peach Fizz", category: "Fizz", stock: 7, available: true },
  { name: "Peach Mango Fizz", category: "Fizz", stock: 7, available: true },
  { name: "Strawberry Tea", category: "Black Tea", stock: 8, available: true },
  { name: "Lemon Mint Tea", category: "Black Tea", stock: 8, available: true },
  { name: "Lemon Tea", category: "Black Tea", stock: 8, available: true },
  { name: "Blueberry Tea", category: "Black Tea", stock: 8, available: true },
  { name: "Peach Tea", category: "Black Tea", stock: 8, available: true },
  { name: "Matcha Blush", category: "Matcha", stock: 6, available: true },
  { name: "Sea Salt Matcha", category: "Matcha", stock: 6, available: true },
  { name: "Soft Matcha", category: "Matcha", stock: 6, available: true },
].map((item) => ({ ...item, id: `${item.category}::${item.name}` }));

const state = {
  orders: loadStaffOrders(),
  inventory: loadInventory(),
  menuConfig: loadMenuConfig(),
  featuredDrink: loadFeaturedDrink(),
  redeemables: loadRedeemables(),
  selectedInventoryId: null,
  selectedMenuId: null,
  pendingFeaturedAsset: "",
  pendingFeaturedAssetType: "image",
};

const elements = {
  importOrders: document.getElementById("import-orders"),
  seedOrders: document.getElementById("seed-orders"),
  clearOrders: document.getElementById("clear-orders"),
  themeSelect: document.getElementById("theme-select"),
  restockItem: document.getElementById("restock-item"),
  reduceStockItem: document.getElementById("reduce-stock-item"),
  markItemUnavailable: document.getElementById("mark-item-unavailable"),
  inventorySelection: document.getElementById("inventory-selection"),
  inventoryList: document.getElementById("inventory-list"),
  saveMenuPrice: document.getElementById("save-menu-price"),
  resetMenuPrice: document.getElementById("reset-menu-price"),
  menuSelection: document.getElementById("menu-selection"),
  menuPriceInput: document.getElementById("menu-price-input"),
  menuList: document.getElementById("menu-list"),
  featuredItemSelect: document.getElementById("featured-item-select"),
  featuredTitleInput: document.getElementById("featured-title-input"),
  featuredCopyInput: document.getElementById("featured-copy-input"),
  featuredMediaInput: document.getElementById("featured-media-input"),
  featuredDiscountInput: document.getElementById("featured-discount-input"),
  featuredPreview: document.getElementById("featured-preview"),
  featuredSaveStatus: document.getElementById("featured-save-status"),
  saveFeaturedDrink: document.getElementById("save-featured-drink"),
  clearFeaturedDrink: document.getElementById("clear-featured-drink"),
  redeemablesList: document.getElementById("redeemables-list"),
  saveRedeemables: document.getElementById("save-redeemables"),
  redeemablesSaveStatus: document.getElementById("redeemables-save-status"),
  statNew: document.getElementById("stat-new"),
  statPreparing: document.getElementById("stat-preparing"),
  statReady: document.getElementById("stat-ready"),
  statTotal: document.getElementById("stat-total"),
  countNew: document.getElementById("count-new"),
  countPreparing: document.getElementById("count-preparing"),
  countReady: document.getElementById("count-ready"),
  countIssue: document.getElementById("count-issue"),
  ordersNew: document.getElementById("orders-new"),
  ordersPreparing: document.getElementById("orders-preparing"),
  ordersReady: document.getElementById("orders-ready"),
  ordersIssue: document.getElementById("orders-issue"),
  orderCardTemplate: document.getElementById("order-card-template"),
  inventoryRowTemplate: document.getElementById("inventory-row-template"),
  menuRowTemplate: document.getElementById("menu-row-template"),
};

if (!state.selectedInventoryId && state.inventory.length > 0) {
  state.selectedInventoryId = state.inventory[0].id;
}

if (!state.selectedMenuId && state.menuConfig.length > 0) {
  state.selectedMenuId = state.menuConfig[0].id;
}

state.pendingFeaturedAsset = state.featuredDrink?.mediaUrl || "";
state.pendingFeaturedAssetType = state.featuredDrink?.mediaType || "image";

bindEvents();
applySavedTheme();
render();
hydrateRemoteConfig();
startRemoteOrderPolling();

function bindEvents() {
  elements.themeSelect.addEventListener("change", handleThemeChange);
  elements.importOrders.addEventListener("click", importCustomerOrders);
  elements.seedOrders.addEventListener("click", seedDemoOrders);
  elements.clearOrders.addEventListener("click", clearBoard);
  elements.restockItem.addEventListener("click", restockSelectedItem);
  elements.reduceStockItem.addEventListener("click", reduceSelectedItemStock);
  elements.markItemUnavailable.addEventListener("click", toggleSelectedUnavailable);
  elements.saveMenuPrice.addEventListener("click", saveSelectedMenuPrice);
  elements.resetMenuPrice.addEventListener("click", resetSelectedMenuPrice);
  elements.featuredItemSelect.addEventListener("change", handleFeaturedSelectionChange);
  elements.featuredMediaInput.addEventListener("change", handleFeaturedMediaInput);
  elements.saveFeaturedDrink.addEventListener("click", saveFeaturedDrinkConfig);
  elements.clearFeaturedDrink.addEventListener("click", clearFeaturedDrinkConfig);
  elements.saveRedeemables.addEventListener("click", saveRedeemablesConfig);
}

function render() {
  renderInventory();
  renderMenuManager();
  renderFeaturedEditor();
  renderRedeemablesEditor();
  renderOrders();
}

function renderInventory() {
  elements.inventoryList.innerHTML = "";
  const selectedItem = getSelectedInventoryItem();
  elements.inventorySelection.textContent = selectedItem
    ? `Selected: ${selectedItem.name} (${selectedItem.category})`
    : "No item selected";

  state.inventory.forEach((item) => {
    const fragment = elements.inventoryRowTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".inventory-row");
    const status = getInventoryStatus(item);
    row.classList.toggle("selected", item.id === state.selectedInventoryId);
    row.addEventListener("click", () => {
      state.selectedInventoryId = item.id;
      renderInventory();
    });
    fragment.querySelector(".inventory-category").textContent = item.category;
    fragment.querySelector(".inventory-name").textContent = item.name;
    fragment.querySelector(".inventory-stock").textContent = String(item.stock);
    const statusNode = fragment.querySelector(".inventory-status");
    statusNode.textContent = status.label;
    statusNode.classList.toggle("low", status.kind === "low");
    statusNode.classList.toggle("out", status.kind === "out");
    elements.inventoryList.appendChild(fragment);
  });
}

function renderMenuManager() {
  elements.menuList.innerHTML = "";
  const selectedItem = getSelectedMenuItem();
  elements.menuSelection.textContent = selectedItem
    ? `Selected: ${selectedItem.name} (${selectedItem.category})`
    : "No menu item selected";
  elements.menuPriceInput.value = selectedItem ? String(selectedItem.price) : "";

  state.menuConfig.forEach((item) => {
    const fragment = elements.menuRowTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".menu-row");
    const isCustom = item.price !== item.defaultPrice;
    row.classList.toggle("selected", item.id === state.selectedMenuId);
    row.addEventListener("click", () => {
      state.selectedMenuId = item.id;
      renderMenuManager();
    });
    fragment.querySelector(".inventory-category").textContent = item.category;
    fragment.querySelector(".inventory-name").textContent = item.name;
    fragment.querySelector(".inventory-stock").textContent = formatPrice(item.price);
    fragment.querySelector(".inventory-status").textContent = isCustom ? `Custom ${formatPrice(item.defaultPrice)}` : "Base";
    elements.menuList.appendChild(fragment);
  });
}

function renderFeaturedEditor() {
  hydrateFeaturedSelect();
  const selectedMenuItem = getSelectedMenuItem();
  const featured = state.featuredDrink;
  elements.featuredTitleInput.value = featured?.title || selectedMenuItem?.name || "";
  elements.featuredCopyInput.value = featured?.copy || "";
  elements.featuredDiscountInput.value = featured?.discount ? String(featured.discount) : "";
  elements.featuredSaveStatus.textContent = featured
    ? `Featured saved: ${featured.title || selectedMenuItem?.name || "Drink"}`
    : "Featured drink not saved yet.";
  renderFeaturedPreview();
}

function renderRedeemablesEditor() {
  elements.redeemablesList.innerHTML = "";
  state.redeemables.forEach((reward) => {
    const row = document.createElement("div");
    row.className = "redeemable-row";
    row.innerHTML = `
      <label class="panel-field">
        <span>Prize</span>
        <input type="text" value="${escapeAttribute(reward.title)}" data-redeem-field="title" data-redeem-id="${reward.id}" />
      </label>
      <label class="panel-field">
        <span>Points Needed</span>
        <input type="number" min="0" step="1" value="${reward.points}" data-redeem-field="points" data-redeem-id="${reward.id}" />
      </label>
      <label class="panel-field">
        <span>Description</span>
        <input type="text" value="${escapeAttribute(reward.description || "")}" data-redeem-field="description" data-redeem-id="${reward.id}" />
      </label>
    `;
    elements.redeemablesList.appendChild(row);
  });

  elements.redeemablesList.querySelectorAll("[data-redeem-field]").forEach((input) => {
    input.addEventListener("input", handleRedeemableInput);
  });

  elements.redeemablesSaveStatus.textContent = "Edit prizes and save when ready.";
}

function hydrateFeaturedSelect() {
  const selectedValue = state.featuredDrink?.itemId || state.selectedMenuId || state.menuConfig[0]?.id || "";
  elements.featuredItemSelect.innerHTML = "";
  state.menuConfig.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} (${item.category})`;
    elements.featuredItemSelect.appendChild(option);
  });
  elements.featuredItemSelect.value = selectedValue;
}

function renderFeaturedPreview() {
  const featuredItem = getFeaturedMenuItem();
  const title = elements.featuredTitleInput.value.trim() || featuredItem?.name || "Featured drink";
  const copy = elements.featuredCopyInput.value.trim() || "Highlight your current favorite for customers.";
  const mediaUrl = state.pendingFeaturedAsset || state.featuredDrink?.mediaUrl || "";
  const mediaType = state.pendingFeaturedAssetType || state.featuredDrink?.mediaType || "image";
  const discount = Math.max(0, Number(elements.featuredDiscountInput.value || state.featuredDrink?.discount || 0));
  const finalPrice = Math.max(0, (featuredItem?.price || 0) - discount);

  if (!featuredItem) {
    elements.featuredPreview.innerHTML = "<p class='order-meta'>No featured image selected.</p>";
    return;
  }

  elements.featuredPreview.innerHTML = `
    ${mediaUrl ? renderFeaturedMediaPreview(mediaUrl, mediaType, title) : "<p class='order-meta'>No featured media selected.</p>"}
    <p class="order-ticket">Featured</p>
    <h3>${title}</h3>
    <p class="order-meta">${featuredItem.name} | ${discount > 0 ? `${formatPrice(featuredItem.price)} -> ${formatPrice(finalPrice)}` : formatPrice(featuredItem.price)}</p>
    <p class="order-note">${copy}</p>
  `;
}

function renderOrders() {
  const grouped = {
    new: state.orders.filter((order) => order.status === "new"),
    preparing: state.orders.filter((order) => order.status === "preparing"),
    ready: state.orders.filter((order) => order.status === "ready"),
    issue: state.orders.filter((order) => order.status === "issue"),
  };

  renderColumn(elements.ordersNew, grouped.new);
  renderColumn(elements.ordersPreparing, grouped.preparing);
  renderColumn(elements.ordersReady, grouped.ready);
  renderColumn(elements.ordersIssue, grouped.issue);

  elements.countNew.textContent = String(grouped.new.length);
  elements.countPreparing.textContent = String(grouped.preparing.length);
  elements.countReady.textContent = String(grouped.ready.length);
  elements.countIssue.textContent = String(grouped.issue.length);
  elements.statNew.textContent = String(grouped.new.length);
  elements.statPreparing.textContent = String(grouped.preparing.length);
  elements.statReady.textContent = String(grouped.ready.length);
  elements.statTotal.textContent = String(state.orders.length);
}

function renderColumn(container, orders) {
  container.innerHTML = "";

  if (orders.length === 0) {
    const empty = document.createElement("div");
    empty.className = "order-card";
    empty.innerHTML = "<p class='order-meta'>No orders in this column right now.</p>";
    container.appendChild(empty);
    return;
  }

  orders.forEach((order) => {
    const fragment = elements.orderCardTemplate.content.cloneNode(true);
    const unavailableItems = getUnavailableItems(order);
    fragment.querySelector(".order-ticket").textContent = order.ticketNumber;
    fragment.querySelector(".order-name").textContent = order.customerName || "Guest";
    fragment.querySelector(".order-total").textContent = formatPrice(order.total);
    fragment.querySelector(".order-meta").textContent = buildMeta(order);
    fragment.querySelector(".order-note").textContent = order.orderNotes ? `Notes: ${order.orderNotes}` : "";
    fragment.querySelector(".order-alert").textContent = unavailableItems.length > 0
      ? `Unavailable: ${unavailableItems.join(", ")}`
      : "";

    const itemsContainer = fragment.querySelector(".order-items");
    order.items.forEach((item) => {
      const line = document.createElement("div");
      line.className = "order-line";
      const inventoryItem = findInventoryForOrderItem(item);
      const stateLabel = inventoryItem && (!inventoryItem.available || inventoryItem.stock === 0)
        ? " | unavailable"
        : inventoryItem && inventoryItem.stock <= 3
          ? " | low stock"
          : "";
      line.textContent = `${item.quantity}x ${item.name}${item.sizeLabel ? ` | ${item.sizeLabel}` : ""}${stateLabel}`;
      itemsContainer.appendChild(line);
    });

    const actions = fragment.querySelector(".order-actions");
    getActions(order, unavailableItems.length > 0).forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action.kind;
      button.textContent = action.label;
      button.addEventListener("click", action.onClick);
      actions.appendChild(button);
    });

    container.appendChild(fragment);
  });
}

function getActions(order, hasUnavailableItems) {
  if (order.status === "new") {
    return [
      { label: "Start Prep", kind: "primary-button", onClick: () => updateStatus(order.id, "preparing") },
      { label: hasUnavailableItems ? "Review Issue" : "Mark Unavailable", kind: "danger-button", onClick: () => updateStatus(order.id, "issue") },
    ];
  }

  if (order.status === "preparing") {
    return [
      { label: "Mark Ready", kind: "primary-button", onClick: () => updateStatus(order.id, "ready") },
      { label: "Move Back", kind: "secondary-button", onClick: () => updateStatus(order.id, "new") },
      { label: "Mark Unavailable", kind: "danger-button", onClick: () => updateStatus(order.id, "issue") },
    ];
  }

  if (order.status === "ready") {
    return [
      { label: "Complete / Serve", kind: "ghost-button", onClick: () => completeOrder(order.id) },
      { label: "Move Back", kind: "secondary-button", onClick: () => updateStatus(order.id, "preparing") },
    ];
  }

  return [
    { label: "Back To New", kind: "secondary-button", onClick: () => updateStatus(order.id, "new") },
    { label: "Cancel Order", kind: "danger-button", onClick: () => removeOrder(order.id) },
  ];
}

function restockSelectedItem() {
  const selectedItem = getSelectedInventoryItem();
  if (!selectedItem) {
    return;
  }

  const input = window.prompt(`How many units do you want to add to ${selectedItem.name}?`, "5");
  if (input === null) {
    return;
  }

  const amount = Number(input);
  if (!Number.isFinite(amount) || amount <= 0) {
    window.alert("Please enter a valid restock number greater than 0.");
    return;
  }

  state.inventory = state.inventory.map((item) =>
    item.id === selectedItem.id ? { ...item, stock: item.stock + Math.round(amount), available: true } : item,
  );

  persistInventory();
  render();
}

function reduceSelectedItemStock() {
  const selectedItem = getSelectedInventoryItem();
  if (!selectedItem) {
    return;
  }

  const input = window.prompt(`How many units do you want to deduct from ${selectedItem.name}?`, "1");
  if (input === null) {
    return;
  }

  const amount = Number(input);
  if (!Number.isFinite(amount) || amount <= 0) {
    window.alert("Please enter a valid deduction number greater than 0.");
    return;
  }

  state.inventory = state.inventory.map((item) => {
    if (item.id !== selectedItem.id) {
      return item;
    }

    const nextStock = Math.max(0, item.stock - Math.round(amount));
    return { ...item, stock: nextStock, available: nextStock > 0 && item.available };
  });

  persistInventory();
  render();
}

function toggleSelectedUnavailable() {
  const selectedItem = getSelectedInventoryItem();
  if (!selectedItem) {
    return;
  }

  state.inventory = state.inventory.map((item) => {
    if (item.id !== selectedItem.id) {
      return item;
    }

    return item.available
      ? { ...item, available: false }
      : { ...item, available: true, stock: item.stock === 0 ? 1 : item.stock };
  });

  persistInventory();
  render();
}

function saveSelectedMenuPrice() {
  const selectedItem = getSelectedMenuItem();
  const nextPrice = Number(elements.menuPriceInput.value);
  if (!selectedItem || !Number.isFinite(nextPrice) || nextPrice < 0) {
    window.alert("Enter a valid price.");
    return;
  }

  state.menuConfig = state.menuConfig.map((item) =>
    item.id === selectedItem.id ? { ...item, price: Math.round(nextPrice) } : item,
  );
  persistMenuConfig();
  syncMenuItemPrice(state.menuConfig.find((item) => item.id === selectedItem.id));
  renderMenuManager();
  renderFeaturedEditor();
}

function resetSelectedMenuPrice() {
  const selectedItem = getSelectedMenuItem();
  if (!selectedItem) {
    return;
  }

  state.menuConfig = state.menuConfig.map((item) =>
    item.id === selectedItem.id ? { ...item, price: item.defaultPrice } : item,
  );
  persistMenuConfig();
  syncMenuItemPrice(state.menuConfig.find((item) => item.id === selectedItem.id));
  renderMenuManager();
  renderFeaturedEditor();
}

function handleFeaturedSelectionChange() {
  state.selectedMenuId = elements.featuredItemSelect.value;
  renderMenuManager();
  renderFeaturedPreview();
}

function handleFeaturedMediaInput(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    state.pendingFeaturedAsset = String(reader.result || "");
    state.pendingFeaturedAssetType = file.type.startsWith("video/") ? "video" : "image";
    renderFeaturedPreview();
  };
  reader.readAsDataURL(file);
}

function handleRedeemableInput(event) {
  const rewardId = event.target.dataset.redeemId;
  const field = event.target.dataset.redeemField;
  state.redeemables = state.redeemables.map((reward) => {
    if (reward.id !== rewardId) {
      return reward;
    }
    return {
      ...reward,
      [field]: field === "points" ? Math.max(0, Math.round(Number(event.target.value || 0))) : event.target.value,
    };
  });
}

function saveFeaturedDrinkConfig() {
  const menuItem = getFeaturedMenuItem();
  const mediaUrl = state.pendingFeaturedAsset || state.featuredDrink?.mediaUrl || "";
  const discount = Math.max(0, Math.round(Number(elements.featuredDiscountInput.value || 0)));
  if (!menuItem || !mediaUrl) {
    window.alert("Choose a menu item and upload an image first.");
    return;
  }

  state.featuredDrink = {
    itemId: menuItem.id,
    title: elements.featuredTitleInput.value.trim() || menuItem.name,
    copy: elements.featuredCopyInput.value.trim(),
    discount,
    mediaUrl,
    mediaType: state.pendingFeaturedAssetType || state.featuredDrink?.mediaType || "image",
    updatedAt: new Date().toISOString(),
  };
  persistFeaturedDrink();
  syncFeaturedDrink(state.featuredDrink);
  elements.featuredSaveStatus.textContent = `Successfully saved: ${state.featuredDrink.title}`;
  renderFeaturedEditor();
}

function clearFeaturedDrinkConfig() {
  state.featuredDrink = null;
  state.pendingFeaturedAsset = "";
  state.pendingFeaturedAssetType = "image";
  elements.featuredMediaInput.value = "";
  elements.featuredTitleInput.value = "";
  elements.featuredCopyInput.value = "";
  elements.featuredDiscountInput.value = "";
  elements.featuredSaveStatus.textContent = "Featured drink cleared.";
  localStorage.removeItem(FEATURED_DRINK_STORAGE_KEY);
  renderFeaturedEditor();
}

function saveRedeemablesConfig() {
  state.redeemables = state.redeemables.map((reward) => ({
    ...reward,
    title: reward.title.trim() || "Reward",
    points: Math.max(0, Math.round(Number(reward.points || 0))),
    description: (reward.description || "").trim(),
  })).sort((left, right) => left.points - right.points);

  persistRedeemables();
  syncRedeemables(state.redeemables);
  renderRedeemablesEditor();
  elements.redeemablesSaveStatus.textContent = "Successfully saved redeemables.";
}

function getInventoryStatus(item) {
  if (!item.available || item.stock === 0) {
    return { label: "Unavailable", kind: "out" };
  }

  if (item.stock <= 3) {
    return { label: "Running Low", kind: "out" };
  }

  return { label: "Available", kind: "ok" };
}

async function updateStatus(orderId, status) {
  state.orders = state.orders.map((order) => (order.id === orderId ? { ...order, status } : order));
  persistStaffOrders();
  renderOrders();
  await syncOrderStatus(orderId, status);
}

async function completeOrder(orderId) {
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    return;
  }

  applyOrderInventory(order);
  persistInventory();
  state.orders = state.orders.filter((entry) => entry.id !== orderId);
  persistStaffOrders();
  render();
  await syncOrderStatus(orderId, "completed");
}

function applyOrderInventory(order) {
  const nextInventory = [...state.inventory];
  order.items.forEach((orderItem) => {
    const inventoryIndex = nextInventory.findIndex((item) => item.name === orderItem.name);
    if (inventoryIndex === -1) {
      return;
    }

    const inventoryItem = nextInventory[inventoryIndex];
    const nextStock = Math.max(0, inventoryItem.stock - Number(orderItem.quantity || 0));
    nextInventory[inventoryIndex] = {
      ...inventoryItem,
      stock: nextStock,
      available: nextStock > 0 && inventoryItem.available,
    };

    if (nextStock === 0) {
      nextInventory[inventoryIndex].available = false;
    }
  });
  state.inventory = nextInventory;
}

async function removeOrder(orderId) {
  state.orders = state.orders.filter((order) => order.id !== orderId);
  persistStaffOrders();
  renderOrders();
  await syncOrderStatus(orderId, "cancelled");
}

function importCustomerOrders() {
  const imported = [];

  CUSTOMER_STORAGE_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return;
    }

    try {
      JSON.parse(raw).forEach((order) => {
        const normalized = normalizeImportedOrder(order);
        if (!state.orders.some((existing) => existing.id === normalized.id)) {
          imported.push(normalized);
        }
      });
    } catch (error) {
      console.error(`Failed to import from ${key}`, error);
    }
  });

  if (imported.length === 0) {
    window.alert("No new customer orders found in local storage.");
    return;
  }

  state.orders = [...imported, ...state.orders];
  persistStaffOrders();
  renderOrders();
}

function normalizeImportedOrder(order) {
  const unavailableItems = getUnavailableItems(order);
  return {
    id: order.id || crypto.randomUUID(),
    ticketNumber: order.ticketNumber || `BA-${String(state.orders.length + 1).padStart(3, "0")}`,
    customerName: order.customerName || "Guest",
    serviceMode: order.serviceMode || "Pickup",
    customerPhone: order.customerPhone || "",
    orderNotes: order.orderNotes || "",
    total: Number(order.total || 0),
    items: Array.isArray(order.items) ? order.items : [],
    createdAt: order.createdAt || new Date().toISOString(),
    status: unavailableItems.length > 0 ? "issue" : order.status || "new",
  };
}

function seedDemoOrders() {
  const demo = [
    {
      id: crypto.randomUUID(),
      ticketNumber: "BA-401",
      customerName: "Ava",
      serviceMode: "Table 2",
      customerPhone: "",
      orderNotes: "Serve after meal.",
      total: 320,
      createdAt: new Date().toISOString(),
      status: "new",
      items: [
        { name: "Strawberry Dream", quantity: 1, sizeLabel: "Novel" },
        { name: "Flat White", quantity: 1, sizeLabel: "Classic" },
      ],
    },
    {
      id: crypto.randomUUID(),
      ticketNumber: "BA-402",
      customerName: "Liam",
      serviceMode: "Pickup",
      customerPhone: "+65 8111 2233",
      orderNotes: "",
      total: 175,
      createdAt: new Date().toISOString(),
      status: "issue",
      items: [{ name: "Pink Foam", quantity: 1, sizeLabel: "Classic" }],
    },
  ];

  state.orders = [...demo, ...state.orders];
  persistStaffOrders();
  renderOrders();
}

function clearBoard() {
  state.orders = [];
  persistStaffOrders();
  renderOrders();
}

function getUnavailableItems(order) {
  return (order.items || [])
    .filter((item) => {
      const inventoryItem = findInventoryForOrderItem(item);
      return inventoryItem && (!inventoryItem.available || inventoryItem.stock === 0);
    })
    .map((item) => item.name);
}

function findInventoryForOrderItem(orderItem) {
  return state.inventory.find((item) => item.name === orderItem.name);
}

function getSelectedInventoryItem() {
  return state.inventory.find((item) => item.id === state.selectedInventoryId) || null;
}

function getSelectedMenuItem() {
  return state.menuConfig.find((item) => item.id === state.selectedMenuId) || null;
}

function getFeaturedMenuItem() {
  const featuredId = elements.featuredItemSelect.value || state.featuredDrink?.itemId;
  return state.menuConfig.find((item) => item.id === featuredId) || null;
}

function buildMeta(order) {
  const time = new Date(order.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${order.serviceMode} | ${time}${order.customerPhone ? ` | ${order.customerPhone}` : ""}`;
}

function normalizeRemoteOrder(order) {
  const normalized = {
    id: order.id,
    ticketNumber: order.order_number || `BA-${String(state.orders.length + 1).padStart(3, "0")}`,
    customerName: order.customer_name || "Guest",
    serviceMode: order.service_mode || "Pickup",
    customerPhone: order.customer_phone || "",
    orderNotes: order.order_notes || "",
    total: Number(order.total || 0),
    subtotal: Number(order.subtotal || 0),
    service: Number(order.service_fee || 0),
    items: Array.isArray(order.items) ? order.items : [],
    createdAt: order.created_at || new Date().toISOString(),
    status: order.status || "new",
  };
  const unavailableItems = getUnavailableItems(normalized);
  return unavailableItems.length > 0 && normalized.status === "new"
    ? { ...normalized, status: "issue" }
    : normalized;
}

async function hydrateRemoteOrders() {
  if (!window.bacSupabase?.enabled) {
    return;
  }

  const { data, error } = await window.bacSupabase.loadOrders();
  if (error) {
    console.error("Failed to load remote orders", error);
    return;
  }

  if (!Array.isArray(data)) {
    return;
  }

  state.orders = data
    .map(normalizeRemoteOrder)
    .filter((order) => ACTIVE_BOARD_STATUSES.has(order.status));
  persistStaffOrders();
  renderOrders();
}

function startRemoteOrderPolling() {
  if (remoteOrderPollingHandle) {
    clearInterval(remoteOrderPollingHandle);
    remoteOrderPollingHandle = null;
  }

  if (!window.bacSupabase?.enabled) {
    return;
  }

  void hydrateRemoteOrders();
  remoteOrderPollingHandle = window.setInterval(() => {
    void hydrateRemoteOrders();
  }, 5000);
}

function loadStaffOrders() {
  const raw = localStorage.getItem(STAFF_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load staff orders", error);
    return [];
  }
}

function persistStaffOrders() {
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(state.orders));
}

function loadInventory() {
  const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!raw) {
    return defaultInventory;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load inventory", error);
    return defaultInventory;
  }
}

function persistInventory() {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state.inventory));
}

function loadMenuConfig() {
  const raw = localStorage.getItem(MENU_CONFIG_STORAGE_KEY);
  if (!raw) {
    return menuCatalog.map((item) => ({ ...item, defaultPrice: item.price }));
  }

  try {
    const parsed = JSON.parse(raw);
    return menuCatalog.map((item) => {
      const saved = parsed.find((entry) => entry.id === item.id);
      return { ...item, defaultPrice: item.price, price: saved?.price ?? item.price };
    });
  } catch (error) {
    console.error("Failed to load menu config", error);
    return menuCatalog.map((item) => ({ ...item, defaultPrice: item.price }));
  }
}

function persistMenuConfig() {
  localStorage.setItem(MENU_CONFIG_STORAGE_KEY, JSON.stringify(state.menuConfig));
}

function loadFeaturedDrink() {
  const raw = localStorage.getItem(FEATURED_DRINK_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load featured drink", error);
    return null;
  }
}

function loadRedeemables() {
  const raw = localStorage.getItem(REDEEMABLES_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_REDEEMABLES;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REDEEMABLES;
  } catch (error) {
    console.error("Failed to load redeemables", error);
    return DEFAULT_REDEEMABLES;
  }
}

function persistFeaturedDrink() {
  if (!state.featuredDrink) {
    return;
  }

  localStorage.setItem(FEATURED_DRINK_STORAGE_KEY, JSON.stringify(state.featuredDrink));
}

function persistRedeemables() {
  localStorage.setItem(REDEEMABLES_STORAGE_KEY, JSON.stringify(state.redeemables));
}

function formatPrice(value) {
  return `${Math.round(value)}`;
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "classic";
  document.body.classList.remove("dark-mode");
  delete document.body.dataset.theme;
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  } else if (savedTheme !== "classic") {
    document.body.dataset.theme = savedTheme;
  }
  elements.themeSelect.value = savedTheme;
}

function handleThemeChange(event) {
  localStorage.setItem(THEME_STORAGE_KEY, event.target.value);
  applySavedTheme();
}

async function hydrateRemoteConfig() {
  if (!window.bacSupabase?.enabled) {
    return;
  }

  const [
    { data: remoteMenu, error: menuError },
    { data: remoteFeatured, error: featuredError },
    { data: remoteRedeemables, error: redeemablesError },
  ] = await Promise.all([
    window.bacSupabase.loadMenuConfig(),
    window.bacSupabase.loadFeaturedDrink(),
    window.bacSupabase.loadRedeemables ? window.bacSupabase.loadRedeemables() : Promise.resolve({ data: null, error: null }),
  ]);

  if (!menuError && Array.isArray(remoteMenu) && remoteMenu.length > 0) {
    state.menuConfig = state.menuConfig.map((item) => {
      const remoteItem = remoteMenu.find((entry) => entry.id === item.id);
      return remoteItem ? { ...item, price: remoteItem.price } : item;
    });
    persistMenuConfig();
  }

  if (!featuredError && remoteFeatured) {
    state.featuredDrink = remoteFeatured;
    state.pendingFeaturedAsset = remoteFeatured.mediaUrl || "";
    state.pendingFeaturedAssetType = remoteFeatured.mediaType || "image";
    persistFeaturedDrink();
  }

  if (!redeemablesError && Array.isArray(remoteRedeemables) && remoteRedeemables.length > 0) {
    state.redeemables = remoteRedeemables;
    persistRedeemables();
  }

  renderMenuManager();
  renderFeaturedEditor();
  renderRedeemablesEditor();
  await hydrateRemoteOrders();
}

async function syncMenuItemPrice(menuItem) {
  if (!window.bacSupabase?.enabled || !menuItem) {
    return;
  }

  const { error } = await window.bacSupabase.saveMenuItemPrice(menuItem);
  if (error) {
    console.error("Failed to sync menu item price", error);
    elements.menuSelection.textContent = `Saved locally only: ${menuItem.name}`;
  }
}

async function syncFeaturedDrink(featuredDrink) {
  if (!window.bacSupabase?.enabled || !featuredDrink) {
    return;
  }

  const { error } = await window.bacSupabase.saveFeaturedDrink(featuredDrink);
  if (error) {
    console.error("Failed to sync featured drink", error);
    elements.featuredSaveStatus.textContent = "Featured saved locally only.";
  }
}

async function syncRedeemables(redeemables) {
  if (!window.bacSupabase?.enabled || !redeemables) {
    return;
  }

  const { error } = await window.bacSupabase.saveRedeemables(redeemables);
  if (error) {
    console.error("Failed to sync redeemables", error);
    elements.redeemablesSaveStatus.textContent = "Redeemables saved locally only.";
  }
}

async function syncOrderStatus(orderId, status) {
  if (!window.bacSupabase?.enabled || !orderId) {
    return;
  }

  const { error } = await window.bacSupabase.updateOrderStatus(orderId, status);
  if (error) {
    console.error("Failed to sync order status", error);
    return;
  }

  if (!ACTIVE_BOARD_STATUSES.has(status)) {
    state.orders = state.orders.filter((order) => order.id !== orderId);
    persistStaffOrders();
    renderOrders();
  }
}

function renderFeaturedMediaPreview(mediaUrl, mediaType, title) {
  if (mediaType === "video") {
    return `<video src="${mediaUrl}" autoplay muted loop playsinline controls></video>`;
  }

  return `<img src="${mediaUrl}" alt="${title}">`;
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
