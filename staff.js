const STAFF_STORAGE_KEY = "begin-again-cafe-staff-orders.v4";
const INVENTORY_STORAGE_KEY = "begin-again-cafe-inventory.v1";
const THEME_STORAGE_KEY = "begin-again-cafe-staff-theme.v1";
const CUSTOMER_STORAGE_KEYS = [
  "begin-again-cafe-orders.v2",
  "begin-again-cafe-mobile-orders.v1",
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
].map((item) => ({
  ...item,
  id: `${item.category}::${item.name}`,
}));

const state = {
  orders: loadStaffOrders(),
  inventory: loadInventory(),
  selectedInventoryId: null,
};

const elements = {
  importOrders: document.getElementById("import-orders"),
  seedOrders: document.getElementById("seed-orders"),
  clearOrders: document.getElementById("clear-orders"),
  themeToggle: document.getElementById("theme-toggle"),
  restockItem: document.getElementById("restock-item"),
  reduceStockItem: document.getElementById("reduce-stock-item"),
  markItemUnavailable: document.getElementById("mark-item-unavailable"),
  inventorySelection: document.getElementById("inventory-selection"),
  inventoryList: document.getElementById("inventory-list"),
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
};

if (!state.selectedInventoryId && state.inventory.length > 0) {
  state.selectedInventoryId = state.inventory[0].id;
}

bindEvents();
applySavedTheme();
render();

function bindEvents() {
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.importOrders.addEventListener("click", importCustomerOrders);
  elements.seedOrders.addEventListener("click", seedDemoOrders);
  elements.clearOrders.addEventListener("click", clearBoard);
  elements.restockItem.addEventListener("click", restockSelectedItem);
  elements.reduceStockItem.addEventListener("click", reduceSelectedItemStock);
  elements.markItemUnavailable.addEventListener("click", toggleSelectedUnavailable);
}

function render() {
  renderInventory();
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
    fragment.querySelector(".order-note").textContent = order.orderNotes
      ? `Notes: ${order.orderNotes}`
      : "";
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
      {
        label: "Start Prep",
        kind: "primary-button",
        onClick: () => updateStatus(order.id, "preparing"),
      },
      {
        label: hasUnavailableItems ? "Review Issue" : "Mark Unavailable",
        kind: "danger-button",
        onClick: () => updateStatus(order.id, "issue"),
      },
    ];
  }

  if (order.status === "preparing") {
    return [
      {
        label: "Mark Ready",
        kind: "primary-button",
        onClick: () => updateStatus(order.id, "ready"),
      },
      {
        label: "Move Back",
        kind: "secondary-button",
        onClick: () => updateStatus(order.id, "new"),
      },
      {
        label: "Mark Unavailable",
        kind: "danger-button",
        onClick: () => updateStatus(order.id, "issue"),
      },
    ];
  }

  if (order.status === "ready") {
    return [
      {
        label: "Complete / Serve",
        kind: "ghost-button",
        onClick: () => completeOrder(order.id),
      },
      {
        label: "Move Back",
        kind: "secondary-button",
        onClick: () => updateStatus(order.id, "preparing"),
      },
    ];
  }

  return [
    {
      label: "Back To New",
      kind: "secondary-button",
      onClick: () => updateStatus(order.id, "new"),
    },
    {
      label: "Cancel Order",
      kind: "danger-button",
      onClick: () => removeOrder(order.id),
    },
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

  state.inventory = state.inventory.map((item) => {
    if (item.id !== selectedItem.id) {
      return item;
    }

    return {
      ...item,
      stock: item.stock + Math.round(amount),
      available: true,
    };
  });

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
    return {
      ...item,
      stock: nextStock,
      available: nextStock > 0 && item.available,
    };
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

    if (!item.available) {
      return {
        ...item,
        available: true,
        stock: item.stock === 0 ? 1 : item.stock,
      };
    }

    return {
      ...item,
      available: false,
    };
  });

  persistInventory();
  render();
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

function updateStatus(orderId, status) {
  state.orders = state.orders.map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  persistStaffOrders();
  renderOrders();
}

function completeOrder(orderId) {
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    return;
  }

  applyOrderInventory(order);
  state.orders = state.orders.filter((entry) => entry.id !== orderId);
  persistInventory();
  persistStaffOrders();
  render();
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

function removeOrder(orderId) {
  state.orders = state.orders.filter((order) => order.id !== orderId);
  persistStaffOrders();
  renderOrders();
}

function importCustomerOrders() {
  const imported = [];

  CUSTOMER_STORAGE_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      parsed.forEach((order) => {
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

function buildMeta(order) {
  const time = new Date(order.createdAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${order.serviceMode} | ${time}${order.customerPhone ? ` | ${order.customerPhone}` : ""}`;
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

function formatPrice(value) {
  return `${Math.round(value)}`;
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const isDark = savedTheme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  elements.themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  elements.themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
}
