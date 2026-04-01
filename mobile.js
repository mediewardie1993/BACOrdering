const STORAGE_KEYS = {
  submittedOrders: "begin-again-cafe-mobile-orders.v2",
  inventory: "begin-again-cafe-inventory.v1",
  menuConfig: "begin-again-cafe-menu-config.v1",
  featuredDrink: "begin-again-cafe-featured-drink.v1",
  theme: "begin-again-cafe-theme.v2",
  favorites: "begin-again-cafe-mobile-favorites.v1",
  lastOrder: "begin-again-cafe-mobile-last-order.v1",
  orderHistory: "begin-again-cafe-mobile-order-history.v1",
  loyalty: "begin-again-cafe-mobile-loyalty.v1",
  customerProfile: "begin-again-cafe-mobile-customer-profile.v1",
  redeemables: "begin-again-cafe-redeemables.v1",
  activeOrder: "begin-again-cafe-mobile-active-order.v1",
  accountSession: "begin-again-cafe-mobile-account-session.v1",
  oatmilkSurcharge: "begin-again-cafe-oatmilk-surcharge.v1",
};

const SERVICE_RATE = 0.08;
const IMAGE_BASE = "./BAC DRINKS/";
const LOYALTY_MILESTONES = [
  { points: 5, reward: "Free add-on" },
  { points: 10, reward: "Free regular drink" },
  { points: 15, reward: "P40 off" },
  { points: 20, reward: "Free premium drink or combo upgrade" },
];

const ACCOUNT_LEVELS = [
  {
    id: "new-user",
    name: "New User",
    minOrders: 0,
    maxOrders: 2,
    bonusRate: 0,
    benefits: ["Welcome reward", "Standard points", "Favorites + reorder access"],
  },
  {
    id: "regular",
    name: "Regular",
    minOrders: 3,
    maxOrders: 9,
    bonusRate: 0.05,
    benefits: ["5% bonus points", "Most Ordered quick reorder", "Occasional promos"],
  },
  {
    id: "silver",
    name: "Silver",
    minOrders: 10,
    maxOrders: 19,
    bonusRate: 0.1,
    benefits: ["10% bonus points", "Free drink every 10 orders", "Faster rewards unlock"],
  },
  {
    id: "gold",
    name: "Gold",
    minOrders: 20,
    maxOrders: 49,
    bonusRate: 0.15,
    benefits: ["15% bonus points", "Free size upgrade perks", "Birthday reward"],
  },
  {
    id: "platinum",
    name: "Platinum",
    minOrders: 50,
    maxOrders: Number.POSITIVE_INFINITY,
    bonusRate: 0.2,
    benefits: ["20% bonus points", "Priority perks", "Exclusive platinum rewards"],
  },
];

const DEFAULT_REDEEMABLES = [
  { id: "reward-1", title: "Free add-on", points: 5, description: "Low-cost perk for returning customers." },
  { id: "reward-2", title: "Free size upgrade", points: 10, description: "Boost value without giving away a whole drink." },
  { id: "reward-3", title: "P20 off", points: 15, description: "Small discount that protects margin." },
  { id: "reward-4", title: "Premium drink or combo upgrade", points: 20, description: "Best used for loyal regulars." },
];
const ACTIVE_ORDER_STATUSES = new Set(["new", "preparing", "ready", "issue"]);
const PASSWORDLESS_ACCOUNTS = new Set(["echanoedgin", "echanocharles"]);
const MILK_OPTIONS = [
  { id: "regular", label: "Reg Milk", delta: 0 },
  { id: "oat", label: "Oatmilk", delta: "dynamic" },
];
const CATEGORY_DEFINITIONS = [
  { id: "hot", label: "Hot" },
  { id: "cold", label: "Cold" },
  { id: "milk", label: "Milk" },
  { id: "fizz", label: "Fizz" },
  { id: "tea", label: "Tea" },
  { id: "matcha", label: "Matcha" },
  { id: "food", label: "Food", comingSoon: true },
  { id: "snacks", label: "Snacks", comingSoon: true },
  { id: "addons", label: "Addons", comingSoon: true },
];
let orderPollingHandle = null;

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
    const profile = this.getJSON(STORAGE_KEYS.loyalty, { points: 0, orderCount: 0, bonusCarry: 0, milestonesReached: [], lastUpdated: null });
    return {
      points: Number(profile.points || 0),
      orderCount: Number(profile.orderCount || 0),
      bonusCarry: Number(profile.bonusCarry || 0),
      milestonesReached: Array.isArray(profile.milestonesReached) ? profile.milestonesReached : [],
      lastUpdated: profile.lastUpdated || null,
    };
  },
  saveLoyaltyProfile(value) { this.setJSON(STORAGE_KEYS.loyalty, value); },
  getCustomerProfile() {
    return this.getJSON(STORAGE_KEYS.customerProfile, { name: "", serviceMode: "", phone: "", notes: "" });
  },
  saveCustomerProfile(value) { this.setJSON(STORAGE_KEYS.customerProfile, value); },
  getAccountSession() { return this.getJSON(STORAGE_KEYS.accountSession, null); },
  saveAccountSession(value) { this.setJSON(STORAGE_KEYS.accountSession, value); },
  clearAccountSession() { localStorage.removeItem(STORAGE_KEYS.accountSession); },
  getOatmilkSurcharge() { return Number(this.getJSON(STORAGE_KEYS.oatmilkSurcharge, 0) || 0); },
  saveOatmilkSurcharge(value) { this.setJSON(STORAGE_KEYS.oatmilkSurcharge, Math.max(0, Number(value || 0))); },
  getRedeemables() { return this.getJSON(STORAGE_KEYS.redeemables, DEFAULT_REDEEMABLES); },
  saveRedeemables(value) { this.setJSON(STORAGE_KEYS.redeemables, value); },
  getActiveOrder() { return this.getJSON(STORAGE_KEYS.activeOrder, null); },
  saveActiveOrder(value) { this.setJSON(STORAGE_KEYS.activeOrder, value); },
  clearActiveOrder() { localStorage.removeItem(STORAGE_KEYS.activeOrder); },
  getInventory() { return this.getJSON(STORAGE_KEYS.inventory, []); },
  getMenuConfig() { return this.getJSON(STORAGE_KEYS.menuConfig, []); },
  saveMenuConfig(value) { this.setJSON(STORAGE_KEYS.menuConfig, value); },
  getFeaturedDrink() { return this.getJSON(STORAGE_KEYS.featuredDrink, null); },
  saveFeaturedDrink(value) { this.setJSON(STORAGE_KEYS.featuredDrink, value); },
  clearFeaturedDrink() { localStorage.removeItem(STORAGE_KEYS.featuredDrink); },
};

const state = {
  cart: [],
  submittedOrders: storage.getSubmittedOrders(),
  search: "",
  category: "all",
  favoritesOnly: false,
  quickPanel: "loyalty",
  quickDrawerOpen: false,
  favorites: new Set(storage.getFavorites()),
  selectedSizes: Object.fromEntries(menuItems.map((item) => [item.id, item.sizes[0].id])),
  selectedMilks: Object.fromEntries(menuItems.filter((item) => item.category === "Milk").map((item) => [item.id, MILK_OPTIONS[0].id])),
  lastOrder: storage.getLastOrder(),
  orderHistory: storage.getOrderHistory(),
  loyalty: storage.getLoyaltyProfile(),
  customerProfile: storage.getCustomerProfile(),
  account: storage.getAccountSession(),
  accountPanel: "login",
  redeemables: storage.getRedeemables(),
  activeOrder: storage.getActiveOrder(),
  lastCompletedOrder: null,
};

const elements = {
  accountStatus: document.getElementById("account-status"),
  accountAction: document.getElementById("account-action"),
  memberStrip: document.getElementById("member-strip"),
  memberStripTier: document.getElementById("member-strip-tier"),
  memberStripCopy: document.getElementById("member-strip-copy"),
  accountDialog: document.getElementById("account-dialog"),
  accountClose: document.getElementById("account-close"),
  accountFeedback: document.getElementById("account-feedback"),
  accountLogout: document.getElementById("account-logout"),
  accountTabs: Array.from(document.querySelectorAll(".account-tab")),
  accountPanels: Array.from(document.querySelectorAll(".account-panel")),
  accountLoginUsername: document.getElementById("account-login-username"),
  accountLoginPassword: document.getElementById("account-login-password"),
  accountSignupUsername: document.getElementById("account-signup-username"),
  accountSignupDisplay: document.getElementById("account-signup-display"),
  accountSignupPassword: document.getElementById("account-signup-password"),
  accountLoginSubmit: document.getElementById("account-login-submit"),
  accountSignupSubmit: document.getElementById("account-signup-submit"),
  featuredBanner: document.getElementById("featured-banner"),
  activeOrderBanner: document.getElementById("active-order-banner"),
  activeOrderTitle: document.getElementById("active-order-title"),
  activeOrderCopy: document.getElementById("active-order-copy"),
  favoritesFilter: document.getElementById("favorites-filter"),
  categoryNav: document.getElementById("category-nav"),
  menuScroll: document.getElementById("menu-scroll"),
  menuSections: document.getElementById("menu-sections"),
  menuSearch: document.getElementById("menu-search"),
  categoryFilter: document.getElementById("category-filter"),
  themeSelect: document.getElementById("theme-select"),
  openCart: document.getElementById("open-cart"),
  fabCount: document.getElementById("fab-count"),
  cartSheet: document.getElementById("cart-sheet"),
  closeCart: document.getElementById("close-cart"),
  cartEmpty: document.getElementById("cart-empty"),
  cartItems: document.getElementById("cart-items"),
  subtotalValue: document.getElementById("subtotal-value"),
  serviceValue: document.getElementById("service-value"),
  totalValue: document.getElementById("total-value"),
  customerName: document.getElementById("customer-name"),
  serviceMode: document.getElementById("service-mode"),
  customerPhone: document.getElementById("customer-phone"),
  orderNotes: document.getElementById("order-notes"),
  placeOrder: document.getElementById("place-order"),
  successScreen: document.getElementById("success-screen"),
  successEstimate: document.getElementById("success-estimate"),
  successOrderNumber: document.getElementById("success-order-number"),
  successTotal: document.getElementById("success-total"),
  trackAnotherOrder: document.getElementById("track-another-order"),
  loyaltyPoints: document.getElementById("loyalty-points"),
  loyaltyNextReward: document.getElementById("loyalty-next-reward"),
  loyaltyProgressBar: document.getElementById("loyalty-progress-bar"),
  loyaltyProgressText: document.getElementById("loyalty-progress-text"),
  loyaltyLevelBadge: document.getElementById("loyalty-level-badge"),
  loyaltyOrdersCount: document.getElementById("loyalty-orders-count"),
  loyaltyBenefits: document.getElementById("loyalty-benefits"),
  lastOrderCard: document.getElementById("last-order-card"),
  reorderLastOrder: document.getElementById("reorder-last-order"),
  mostOrderedList: document.getElementById("most-ordered-list"),
  favoritesSummary: document.getElementById("favorites-summary"),
  quickDrawerToggle: document.getElementById("quick-drawer-toggle"),
  quickDrawerLabel: document.getElementById("quick-drawer-label"),
  quickDrawerBody: document.getElementById("quick-drawer-body"),
  redeemablesSummary: document.getElementById("redeemables-summary"),
  quickTabs: Array.from(document.querySelectorAll(".quick-tab")),
  quickPanels: Array.from(document.querySelectorAll(".quick-panel")),
  menuCardTemplate: document.getElementById("menu-card-template"),
  categorySectionTemplate: document.getElementById("category-section-template"),
  cartItemTemplate: document.getElementById("cart-item-template"),
};

initialize();

function initialize() {
  hydrateCategoryFilter();
  bindEvents();
  hydrateCustomerProfile();
  applySavedTheme();
  renderAll();
  hydrateRemoteConfig();
  hydrateRemoteAccount();
  startOrderPolling();
}

function bindEvents() {
  elements.accountAction.addEventListener("click", openAccountDialog);
  elements.accountClose.addEventListener("click", closeAccountDialog);
  elements.accountLogout.addEventListener("click", handleAccountLogout);
  elements.accountLoginSubmit.addEventListener("click", handleAccountLogin);
  elements.accountSignupSubmit.addEventListener("click", handleAccountSignup);
  elements.accountTabs.forEach((tab) => {
    tab.addEventListener("click", () => setAccountPanel(tab.dataset.accountPanel));
  });
  elements.menuSearch.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderMenu();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderMenu();
  });

  elements.themeSelect.addEventListener("change", handleThemeChange);
  elements.favoritesFilter.addEventListener("click", toggleFavoritesFilter);
  elements.quickDrawerToggle.addEventListener("click", toggleQuickDrawer);
  elements.quickTabs.forEach((tab) => {
    tab.addEventListener("click", () => setQuickPanel(tab.dataset.panel));
  });

  window.addEventListener("storage", (event) => {
    if ([STORAGE_KEYS.inventory, STORAGE_KEYS.menuConfig, STORAGE_KEYS.featuredDrink, STORAGE_KEYS.redeemables, STORAGE_KEYS.activeOrder, STORAGE_KEYS.oatmilkSurcharge].includes(event.key)) {
      hydrateCategoryFilter();
      state.redeemables = storage.getRedeemables();
      state.activeOrder = storage.getActiveOrder();
      renderAll();
    }
  });

  elements.openCart.addEventListener("click", () => elements.cartSheet.showModal());
  elements.closeCart.addEventListener("click", () => elements.cartSheet.close());
  elements.placeOrder.addEventListener("click", handleCheckout);
  elements.trackAnotherOrder.addEventListener("click", dismissSuccessScreen);
  elements.menuScroll.addEventListener("scroll", handleScrollSpy);
  elements.reorderLastOrder.addEventListener("click", reorderLastOrder);
}

function hydrateCustomerProfile() {
  elements.customerName.value = state.customerProfile.name || "";
  elements.serviceMode.value = state.customerProfile.serviceMode || "";
  elements.customerPhone.value = state.customerProfile.phone || "";
  elements.orderNotes.value = state.customerProfile.notes || "";
}

function renderAccountBar() {
  const label = state.account?.displayName || state.account?.username || "guest";
  elements.accountStatus.textContent = `Logged in as ${label}`;
  elements.accountAction.textContent = state.account ? "Account" : "Sign up";
  elements.accountLogout.textContent = state.account ? "Log out" : "Continue as guest";
  elements.accountFeedback.textContent = state.account
    ? `Points are now tied to ${label}.`
    : "Sign up or log in to start earning points.";

  const isSignedIn = Boolean(state.account);
  elements.memberStrip.classList.toggle("hidden", !isSignedIn);
  if (!isSignedIn) {
    return;
  }

  const level = getAccountLevel(state.loyalty.orderCount);
  elements.memberStripTier.textContent = level.name;
  elements.memberStripCopy.textContent = `${state.loyalty.points} pts | ${state.loyalty.orderCount} order${state.loyalty.orderCount === 1 ? "" : "s"}`;
}

function setAccountPanel(panelName) {
  state.accountPanel = panelName;
  elements.accountTabs.forEach((tab) => {
    const isActive = tab.dataset.accountPanel === panelName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  elements.accountPanels.forEach((panel) => {
    const isActive = panel.dataset.accountPanel === panelName;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

function openAccountDialog() {
  setAccountPanel(state.account ? "login" : "signup");
  elements.accountLoginPassword.value = "";
  elements.accountSignupPassword.value = "";
  elements.accountFeedback.textContent = state.account
    ? `Logged in as ${state.account.displayName || state.account.username}.`
    : "Create an account or log in to start earning points.";
  elements.accountDialog.showModal();
}

function closeAccountDialog() {
  elements.accountDialog.close();
}

function applyAccountProfile(account) {
  if (!account) {
    state.account = null;
    state.loyalty = { points: 0, orderCount: 0, bonusCarry: 0, milestonesReached: [], lastUpdated: null };
    storage.clearAccountSession();
    renderAll();
    return;
  }

  state.account = {
    username: account.username,
    displayName: account.display_name || account.displayName || account.username,
    requiresPassword: account.requires_password !== false,
  };
  storage.saveAccountSession(state.account);
  state.loyalty = {
    points: Number(account.points || 0),
    orderCount: Number(account.order_count || account.orderCount || 0),
    bonusCarry: Number(account.bonus_carry || account.bonusCarry || 0),
    milestonesReached: Array.isArray(account.milestones_reached)
      ? account.milestones_reached
      : Array.isArray(account.milestonesReached)
        ? account.milestonesReached
        : [],
    lastUpdated: account.last_updated || account.lastUpdated || null,
  };
  storage.saveLoyaltyProfile(state.loyalty);
  if (!elements.customerName.value.trim()) {
    elements.customerName.value = state.account.displayName;
  }
  renderAll();
}

async function hydrateRemoteAccount() {
  if (!state.account?.username || !window.bacSupabase?.enabled) {
    return;
  }

  const { data, error } = await window.bacSupabase.loadAccount(state.account.username);
  if (error || !data) {
    console.error("Failed to hydrate account", error);
    return;
  }

  applyAccountProfile(data);
}

async function handleAccountLogin() {
  const username = elements.accountLoginUsername.value.trim();
  const password = elements.accountLoginPassword.value;
  if (!username) {
    elements.accountFeedback.textContent = "Enter a username first.";
    return;
  }

  if (!window.bacSupabase?.enabled) {
    elements.accountFeedback.textContent = "Supabase is not connected yet.";
    return;
  }

  const { data, error } = await window.bacSupabase.loadAccount(username);
  if (error || !data) {
    console.error("Failed to log in account", error);
    elements.accountFeedback.textContent = error?.message
      ? `Login failed: ${error.message}`
      : "Account not found yet. If this is a seeded account, rerun the latest Supabase SQL first.";
    return;
  }

  const needsPassword = data.requires_password !== false && !PASSWORDLESS_ACCOUNTS.has(String(data.username || "").toLowerCase());
  if (needsPassword) {
    if (!password) {
      elements.accountFeedback.textContent = "Enter your password to continue.";
      return;
    }
    const passwordHash = await hashPassword(password);
    if (passwordHash !== data.password_hash) {
      elements.accountFeedback.textContent = "Incorrect password.";
      return;
    }
  }

  applyAccountProfile(data);
  elements.accountFeedback.textContent = `Welcome back, ${state.account.displayName}.`;
  closeAccountDialog();
}

async function handleAccountSignup() {
  const username = elements.accountSignupUsername.value.trim();
  const displayName = elements.accountSignupDisplay.value.trim() || username;
  const password = elements.accountSignupPassword.value;
  if (!username) {
    elements.accountFeedback.textContent = "Choose a username first.";
    return;
  }

  if (!password || password.length < 4) {
    elements.accountFeedback.textContent = "Please create a password with at least 4 characters.";
    return;
  }

  if (!window.bacSupabase?.enabled) {
    elements.accountFeedback.textContent = "Supabase is not connected yet.";
    return;
  }

  const nextAccount = {
    username,
    displayName,
    requiresPassword: true,
    passwordHash: await hashPassword(password),
    points: 0,
    orderCount: 0,
    bonusCarry: 0,
    milestonesReached: [],
    lastUpdated: new Date().toISOString(),
  };

  const { data, error } = await window.bacSupabase.createAccount(nextAccount);
  if (error) {
    console.error("Failed to create account", error);
    elements.accountFeedback.textContent = error.message?.includes("duplicate")
      ? "That username already exists. Try logging in instead."
      : "Could not create the account right now.";
    return;
  }

  applyAccountProfile(data);
  elements.accountFeedback.textContent = `Account created for ${state.account.displayName}.`;
  closeAccountDialog();
}

function handleAccountLogout() {
  applyAccountProfile(null);
  elements.accountFeedback.textContent = "You are browsing as guest.";
  closeAccountDialog();
}

async function hashPassword(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hydrateCategoryFilter() {
  const currentValue = elements.categoryFilter.value || "all";
  elements.categoryFilter.innerHTML = '<option value="all">All drinks</option>';
  CATEGORY_DEFINITIONS.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.label;
    elements.categoryFilter.appendChild(option);
  });
  elements.categoryFilter.value = CATEGORY_DEFINITIONS.some((category) => category.id === currentValue) || currentValue === "all" ? currentValue : "all";
}

function renderAll() {
  renderAccountBar();
  renderFeaturedBanner();
  renderActiveOrderBanner();
  renderQuickActions();
  renderMenu();
  renderCart();
}

function renderActiveOrderBanner() {
  const activeOrder = state.activeOrder;
  const isLocked = hasPendingOrder();
  elements.activeOrderBanner.classList.toggle("hidden", !activeOrder);
  elements.activeOrderBanner.classList.toggle("is-locked", isLocked);

  if (!activeOrder) {
    return;
  }

  const statusLabel = formatOrderStatus(activeOrder.status);
  elements.activeOrderTitle.textContent = `${activeOrder.orderNumber || "BAC Order"} | ${statusLabel}`;
  elements.activeOrderCopy.textContent = isLocked
    ? "This order is still being processed. New orders are temporarily disabled until it is completed."
    : "Your previous order is already completed. You can place a new order anytime.";
}

function renderQuickActions() {
  renderQuickDrawer();
  renderQuickTabs();
  renderLoyalty();
  renderLastOrder();
  renderMostOrdered();
  renderFavoritesSummary();
  renderRedeemables();
}

function renderQuickDrawer() {
  elements.quickDrawerToggle.setAttribute("aria-expanded", String(state.quickDrawerOpen));
  elements.quickDrawerLabel.textContent = state.quickDrawerOpen ? "Close" : "Open";
  elements.quickDrawerBody.hidden = false;
  elements.quickDrawerBody.classList.toggle("is-open", state.quickDrawerOpen);
}

function renderQuickTabs() {
  elements.quickTabs.forEach((tab) => {
    const isActive = tab.dataset.panel === state.quickPanel;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  elements.quickPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === state.quickPanel;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

function renderMenu() {
  elements.menuSections.innerHTML = "";
  elements.categoryNav.innerHTML = "";
  elements.favoritesFilter.setAttribute("aria-pressed", String(state.favoritesOnly));
  elements.favoritesFilter.textContent = state.favoritesOnly ? "Showing Favorites" : "Favorites Only";

  const inventory = storage.getInventory();
  const effectiveMenuItems = getEffectiveMenuItems();
  const featured = storage.getFeaturedDrink();
  const visibleItems = effectiveMenuItems.filter((item) => {
    const matchesCategory = state.category === "all" || getCategoryDefinitionByRaw(item.category).id === state.category;
    const haystack = `${item.name} ${item.category}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesFavorites = !state.favoritesOnly || state.favorites.has(item.id);
    return matchesCategory && matchesSearch && matchesFavorites;
  });

  if (visibleItems.length === 0 && state.category === "all") {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.favoritesOnly
      ? "No favorite items match your current search."
      : "No drinks match that search.";
    elements.menuSections.appendChild(empty);
    return;
  }

  const targetCategories = state.category === "all"
    ? CATEGORY_DEFINITIONS
    : CATEGORY_DEFINITIONS.filter((category) => category.id === state.category);

  targetCategories.forEach((category, index) => {
    const items = visibleItems.filter((item) => getCategoryDefinitionByRaw(item.category).id === category.id);
    const sectionId = slugify(category.id);
    const sectionFragment = elements.categorySectionTemplate.content.cloneNode(true);
    const section = sectionFragment.querySelector(".menu-section");
    section.id = sectionId;
    section.querySelector(".section-kicker").textContent = `Category ${index + 1}`;
    section.querySelector(".section-title").textContent = category.label;
    const sectionItems = section.querySelector(".section-items");

    if (items.length > 0) {
      items.forEach((item) => {
        sectionItems.appendChild(buildMenuCard(applyFeaturedPricing(item, featured), inventory));
      });
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = category.comingSoon
        ? `${category.label} coming soon.`
        : state.search || state.favoritesOnly
          ? `No ${category.label.toLowerCase()} items match this filter right now.`
          : `No ${category.label.toLowerCase()} items available right now.`;
      sectionItems.appendChild(empty);
    }

    elements.menuSections.appendChild(sectionFragment);

    const navButton = document.createElement("button");
    navButton.type = "button";
    navButton.className = `category-link${index === 0 ? " active" : ""}`;
    navButton.textContent = category.label;
    navButton.dataset.target = sectionId;
    navButton.addEventListener("click", () => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveCategoryLink(sectionId);
    });
    elements.categoryNav.appendChild(navButton);
  });
}

function buildMenuCard(item, inventory) {
  const fragment = elements.menuCardTemplate.content.cloneNode(true);
  const selectedSize = getSelectedSize(item);
  const selectedMilk = getSelectedMilk(item);
  const quantity = getCartQuantity(item.id, selectedSize.id, selectedMilk?.id || null);
  const price = getUnitPrice(item, selectedSize, selectedMilk);
  const inventoryItem = getInventoryEntry(inventory, item);
  const isUnavailable = inventoryItem ? !inventoryItem.available || inventoryItem.stock === 0 : false;
  const isLow = inventoryItem ? inventoryItem.stock <= 3 && inventoryItem.stock > 0 : false;
  const isOrderLocked = hasPendingOrder();
  const favoriteButton = fragment.querySelector(".favorite-toggle");

  fragment.querySelector(".drink-category").textContent = item.category;
  fragment.querySelector(".drink-name").textContent = item.name;
  fragment.querySelector(".drink-price").textContent = formatPrice(price);
  fragment.querySelector(".drink-meta").textContent = isUnavailable
    ? "Currently unavailable"
    : isLow
      ? `Running low: ${inventoryItem.stock} left`
      : state.favorites.has(item.id)
        ? "Saved to favorites for quick ordering."
        : (selectedSize.delta || selectedMilk?.id === "oat")
          ? `${selectedSize.label}${selectedMilk?.id === "oat" ? ` | Oatmilk +${formatPrice(getMilkDelta("oat"))}` : ""}${selectedSize.delta ? ` adds ${formatPrice(selectedSize.delta)}` : ""}`
          : "Ready to add";

  const imageName = imageMap[`${item.name}|${item.category}`];
  if (imageName) {
    fragment.querySelector(".drink-image").style.backgroundImage = `url("${encodeURI(`${IMAGE_BASE}${imageName}`)}")`;
  }

  favoriteButton.classList.toggle("is-favorite", state.favorites.has(item.id));
  favoriteButton.setAttribute("aria-pressed", String(state.favorites.has(item.id)));
  favoriteButton.textContent = state.favorites.has(item.id) ? "\u2665" : "\u2661";
  favoriteButton.addEventListener("click", () => toggleFavorite(item.id));

  const sizePickerWrap = fragment.querySelector(".size-picker-wrap");
  const sizePicker = fragment.querySelector(".size-picker");
  if (item.sizes.length <= 1) {
    sizePickerWrap.hidden = true;
  } else {
    item.sizes.forEach((size) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `size-chip${size.id === selectedSize.id ? " active" : ""}`;
      chip.textContent = size.delta ? `${size.label} +${size.delta}` : size.label;
      chip.disabled = isUnavailable;
      chip.addEventListener("click", () => {
        state.selectedSizes[item.id] = size.id;
        renderMenu();
      });
      sizePicker.appendChild(chip);
    });
  }

  const milkPickerWrap = fragment.querySelector(".milk-picker-wrap");
  const milkPicker = fragment.querySelector(".milk-picker");
  if (!requiresMilkChoice(item)) {
    milkPickerWrap.hidden = true;
  } else {
    milkPickerWrap.hidden = false;
    MILK_OPTIONS.forEach((milk) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `size-chip${milk.id === selectedMilk.id ? " active" : ""}`;
      chip.textContent = milk.delta === "dynamic"
        ? `${milk.label} +${formatPrice(getMilkDelta(milk.id))}`
        : milk.label;
      chip.disabled = isUnavailable;
      chip.addEventListener("click", () => {
        state.selectedMilks[item.id] = milk.id;
        renderMenu();
      });
      milkPicker.appendChild(chip);
    });
  }

  const stepValue = fragment.querySelector(".step-value");
  const plusButton = fragment.querySelector(".plus-button");
  const minusButton = fragment.querySelector(".minus-button");
  stepValue.textContent = String(quantity);
  if (isUnavailable) {
    stepValue.textContent = "Sold out";
  }

  plusButton.disabled = isUnavailable || isOrderLocked;
  minusButton.disabled = isOrderLocked;
  plusButton.addEventListener("click", () => updateCartQuantity(item, selectedSize, selectedMilk, quantity + 1, stepValue));
  minusButton.addEventListener("click", () => updateCartQuantity(item, selectedSize, selectedMilk, quantity - 1, stepValue));
  return fragment;
}

function renderFeaturedBanner() {
  const featured = storage.getFeaturedDrink();
  const menuItem = featured ? applyFeaturedPricing(getEffectiveMenuItems().find((item) => item.id === featured.itemId), featured) : null;

  if (!featured || !menuItem) {
    elements.featuredBanner.innerHTML = `
      <p class="eyebrow">Featured Drink</p>
      <strong>Staff can publish today's spotlight here.</strong>
      <p>Once a featured drink is saved from the staff app, it will appear in the app automatically.</p>
    `;
    return;
  }

  elements.featuredBanner.innerHTML = `
    ${featured.mediaUrl ? renderFeaturedMedia(featured) : ""}
    <p class="eyebrow">Featured Drink</p>
    <strong>${featured.title || menuItem.name}</strong>
    <p>${featured.copy || menuItem.name}</p>
    <p class="featured-price">${menuItem.name} | ${formatFeaturedPrice(menuItem, featured)}</p>
  `;
}

function renderCart() {
  elements.cartItems.innerHTML = "";
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const isOrderLocked = hasPendingOrder();
  elements.fabCount.textContent = String(itemCount);
  pulseNode(elements.fabCount);
  elements.openCart.disabled = isOrderLocked && itemCount === 0;
  elements.placeOrder.disabled = isOrderLocked;
  elements.cartEmpty.hidden = state.cart.length > 0;

  if (state.cart.length === 0) {
    updateTotals();
    if (isOrderLocked) {
      elements.cartEmpty.hidden = false;
      elements.cartEmpty.textContent = "You already have an order in process.";
    } else {
      elements.cartEmpty.textContent = "Add drinks to start your order.";
    }
    return;
  }

  state.cart.forEach((entry) => {
    const fragment = elements.cartItemTemplate.content.cloneNode(true);
    const quantityNode = fragment.querySelector(".cart-quantity-value");
    fragment.querySelector(".cart-item-name").textContent = entry.name;
    fragment.querySelector(".cart-item-meta").textContent = `${entry.sizeLabel}${entry.milkLabel ? ` | ${entry.milkLabel}` : ""} | ${formatPrice(entry.unitPrice)} each`;
    fragment.querySelector(".cart-item-price").textContent = formatPrice(entry.totalPrice);
    quantityNode.textContent = String(entry.quantity);
    fragment.querySelector(".mini-plus").disabled = isOrderLocked;
    fragment.querySelector(".mini-minus").disabled = isOrderLocked;
    fragment.querySelector(".mini-remove").disabled = isOrderLocked;
    fragment.querySelector(".mini-plus").addEventListener("click", () => updateCartLine(entry.id, entry.quantity + 1, quantityNode));
    fragment.querySelector(".mini-minus").addEventListener("click", () => updateCartLine(entry.id, entry.quantity - 1, quantityNode));
    fragment.querySelector(".mini-remove").addEventListener("click", () => removeCartItem(entry.id));
    elements.cartItems.appendChild(fragment);
  });

  updateTotals();
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
      if (!item) {
        return;
      }
      const size = getSelectedSize(item);
      updateCartQuantity(item, size, getSelectedMilk(item), getCartQuantity(item.id, size.id, getSelectedMilk(item)?.id || null) + 1);
    });
    elements.mostOrderedList.appendChild(button);
  });
}

function renderFavoritesSummary() {
  const favoriteItems = getEffectiveMenuItems().filter((item) => state.favorites.has(item.id));
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
  if (!state.account) {
    elements.loyaltyPoints.textContent = "0";
    elements.loyaltyNextReward.textContent = "Sign up to start earning points";
    elements.loyaltyProgressBar.style.width = "0%";
    elements.loyaltyProgressText.textContent = "Guest mode does not collect points yet.";
    elements.loyaltyLevelBadge.textContent = "Guest";
    elements.loyaltyOrdersCount.textContent = "No account";
    elements.loyaltyBenefits.innerHTML = "<span class='reward-chip'>Create an account to unlock rewards.</span>";
    return;
  }

  const level = getAccountLevel(state.loyalty.orderCount);
  const nextLevel = getNextAccountLevel(state.loyalty.orderCount);
  const previousOrderStart = level.minOrders;
  const nextOrderTarget = nextLevel ? nextLevel.minOrders : level.maxOrders;
  const progress = nextLevel
    ? Math.min(100, ((state.loyalty.orderCount - previousOrderStart) / Math.max(1, nextOrderTarget - previousOrderStart)) * 100)
    : 100;

  elements.loyaltyPoints.textContent = String(state.loyalty.points);
  elements.loyaltyNextReward.textContent = nextLevel
    ? `Next level: ${nextLevel.name} at ${nextLevel.minOrders} orders`
    : "Top tier unlocked";
  elements.loyaltyProgressBar.style.width = `${progress}%`;
  elements.loyaltyProgressText.textContent = nextLevel
    ? `${state.loyalty.orderCount} / ${nextLevel.minOrders} orders`
    : `${state.loyalty.orderCount} orders total`;
  elements.loyaltyLevelBadge.textContent = level.name;
  elements.loyaltyOrdersCount.textContent = `${state.loyalty.orderCount} order${state.loyalty.orderCount === 1 ? "" : "s"}`;
  elements.loyaltyBenefits.innerHTML = "";
  level.benefits.forEach((benefit) => {
    const chip = document.createElement("span");
    chip.className = "reward-chip is-earned";
    chip.textContent = benefit;
    elements.loyaltyBenefits.appendChild(chip);
  });
}

function renderRedeemables() {
  if (!state.account) {
    elements.redeemablesSummary.innerHTML = "<div class='reward-card'><p class='quick-copy'>Log in or sign up to redeem BAC rewards.</p></div>";
    return;
  }

  const rewards = getRewardCatalog();
  if (rewards.length === 0) {
    elements.redeemablesSummary.textContent = "No redeemable prizes yet.";
    return;
  }

  elements.redeemablesSummary.innerHTML = "";
  rewards.forEach((reward) => {
    const card = document.createElement("div");
    const isAvailable = state.loyalty.points >= reward.points;
    card.className = `reward-card${isAvailable ? " is-available" : ""}`;
    card.innerHTML = `
      <div class="reward-card-top">
        <strong>${reward.title}</strong>
        <span class="reward-points">${reward.points} pts</span>
      </div>
      ${reward.description ? `<p class="quick-copy">${reward.description}</p>` : ""}
      <span class="reward-status">${isAvailable ? "Ready to redeem at the counter" : `${Math.max(0, reward.points - state.loyalty.points)} more points needed`}</span>
    `;
    elements.redeemablesSummary.appendChild(card);
  });
}

function updateCartQuantity(item, size, milk, nextQuantity, animateNode) {
  const inventory = storage.getInventory();
  const inventoryItem = getInventoryEntry(inventory, item);
  if (nextQuantity > 0 && inventoryItem && (!inventoryItem.available || inventoryItem.stock === 0)) {
    return;
  }

  const safeQuantity = Math.max(0, nextQuantity);
  const lineId = buildLineId(item.id, size.id, milk?.id || null);
  const existing = state.cart.find((entry) => entry.id === lineId);
  const unitPrice = getUnitPrice(item, size, milk);

  if (safeQuantity === 0) {
    state.cart = state.cart.filter((entry) => entry.id !== lineId);
  } else if (existing) {
    existing.quantity = safeQuantity;
    existing.price = unitPrice;
    existing.unitPrice = unitPrice;
    existing.totalPrice = existing.quantity * unitPrice;
  } else {
    state.cart.push({
      id: lineId,
      itemId: item.id,
      name: item.name,
      category: item.category,
      price: unitPrice,
      quantity: safeQuantity,
      sizeId: size.id,
      size: size.label,
      sizeLabel: size.label,
      milkId: milk?.id || null,
      milkLabel: milk?.label || null,
      note: null,
      unitPrice,
      totalPrice: safeQuantity * unitPrice,
    });
  }

  pulseNode(animateNode);
  renderMenu();
  renderCart();
}

function updateCartLine(lineId, nextQuantity, animateNode) {
  const entry = state.cart.find((item) => item.id === lineId);
  if (!entry) {
    return;
  }

  const item = findMenuItem(entry.itemId);
  if (!item) {
    removeCartItem(lineId);
    return;
  }

  const featured = storage.getFeaturedDrink();
  const effectiveItem = applyFeaturedPricing(getEffectiveMenuItems().find((candidate) => candidate.id === item.id), featured) || item;
  const size = effectiveItem.sizes.find((candidate) => candidate.id === entry.sizeId) || effectiveItem.sizes[0];
  const milk = getMilkOption(entry.milkId, effectiveItem);
  updateCartQuantity(effectiveItem, size, milk, nextQuantity, animateNode);
}

function removeCartItem(lineId) {
  state.cart = state.cart.filter((item) => item.id !== lineId);
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

async function handleCheckout(event) {
  event.preventDefault();

  if (state.cart.length === 0) {
    window.alert("Add at least one drink before placing the order.");
    return;
  }

  if (hasPendingOrder()) {
    window.alert("You already have an order in process. Please wait for it to be completed first.");
    return;
  }

  const customer = {
    name: elements.customerName.value.trim(),
    serviceMode: elements.serviceMode.value.trim(),
    phone: elements.customerPhone.value.trim(),
    notes: elements.orderNotes.value.trim(),
  };

  if (!customer.name || !customer.serviceMode) {
    window.alert("Please enter your name and table or pickup details.");
    return;
  }

  const totals = getCartTotals();
  const orderNumber = `BAC-${String(state.submittedOrders.length + 1).padStart(3, "0")}`;
  const estimateMinutes = estimatePreparationTime(state.cart);
  const order = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    customer,
    orderNumber,
    status: "new",
    items: state.cart.map((item) => ({
      id: item.id,
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      price: item.unitPrice,
      quantity: item.quantity,
      size: item.sizeLabel,
      sizeLabel: item.sizeLabel,
      milkType: item.milkLabel,
      note: item.note,
    })),
    subtotal: totals.subtotal,
    serviceFee: totals.serviceFee,
    total: totals.total,
  };

  if (window.bacSupabase?.enabled) {
    const { error } = await window.bacSupabase.createOrder(order);
    if (error) {
      console.error("Failed to create remote order", error);
      const detail = [error.message, error.details, error.hint].filter(Boolean).join(" | ");
      window.alert(
        detail
          ? `We could not send your order right now. ${detail}`
          : "We could not send your order right now. Please check that the Supabase orders table has been created, then try again.",
      );
      return;
    }
  }

  state.submittedOrders.unshift({
    id: order.id,
    orderNumber,
    customerName: customer.name,
    serviceMode: customer.serviceMode,
    customerPhone: customer.phone,
    orderNotes: customer.notes,
    items: order.items,
    subtotal: order.subtotal,
    service: order.serviceFee,
    total: order.total,
    createdAt: order.createdAt,
    status: order.status,
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

  let loyaltyResult = {
    pointsEarned: 0,
    points: state.loyalty.points,
    orderCount: state.loyalty.orderCount,
    bonusCarry: state.loyalty.bonusCarry,
    milestonesReached: state.loyalty.milestonesReached,
    lastUpdated: state.loyalty.lastUpdated,
  };

  if (state.account) {
    loyaltyResult = createUpdatedLoyaltyProfile(state.loyalty, 1);
    state.loyalty = {
      points: loyaltyResult.points,
      orderCount: loyaltyResult.orderCount,
      bonusCarry: loyaltyResult.bonusCarry,
      milestonesReached: loyaltyResult.milestonesReached,
      lastUpdated: loyaltyResult.lastUpdated,
    };
    storage.saveLoyaltyProfile(state.loyalty);

    if (window.bacSupabase?.enabled) {
      const { error } = await window.bacSupabase.saveAccount({
        username: state.account.username,
        displayName: state.account.displayName,
        requiresPassword: state.account.requiresPassword,
        points: state.loyalty.points,
        orderCount: state.loyalty.orderCount,
        bonusCarry: state.loyalty.bonusCarry,
        milestonesReached: state.loyalty.milestonesReached,
        lastUpdated: state.loyalty.lastUpdated,
      });
      if (error) {
        console.error("Failed to save account loyalty", error);
      }
    }
  }

  state.customerProfile = { ...customer };
  storage.saveCustomerProfile(state.customerProfile);
  state.activeOrder = {
    id: order.id,
    orderNumber,
    status: order.status,
    createdAt: order.createdAt,
  };
  storage.saveActiveOrder(state.activeOrder);

  state.lastCompletedOrder = {
    orderNumber,
    total: order.total,
    estimateMinutes,
    customerName: customer.name,
    pointsEarned: loyaltyResult.pointsEarned,
    currentPoints: state.loyalty.points,
    levelName: state.account ? getAccountLevel(state.loyalty.orderCount).name : "Guest",
  };

  state.cart = [];
  elements.cartSheet.close();
  renderAll();
  startOrderPolling();
  showSuccessScreen();
}

function createUpdatedLoyaltyProfile(currentProfile, earnedPoints) {
  const currentOrders = Number(currentProfile?.orderCount || 0);
  const nextOrderCount = currentOrders + earnedPoints;
  const level = getAccountLevel(nextOrderCount);
  const bonusCarry = Number(currentProfile?.bonusCarry || 0) + level.bonusRate * earnedPoints;
  const bonusPoints = Math.floor(bonusCarry + 1e-9);
  const pointsEarned = earnedPoints + bonusPoints;
  const points = Number(currentProfile?.points || 0) + pointsEarned;
  const rewards = getRewardCatalog();
  return {
    pointsEarned,
    points,
    orderCount: nextOrderCount,
    bonusCarry: bonusCarry - bonusPoints,
    milestonesReached: rewards.filter((entry) => points >= entry.points).map((entry) => entry.points),
    lastUpdated: new Date().toISOString(),
  };
}

function reorderLastOrder() {
  if (!state.lastOrder) {
    return;
  }

  const featured = storage.getFeaturedDrink();
  const rebuiltCart = [];
  state.lastOrder.items.forEach((savedItem) => {
    const item = findMenuItem(savedItem.itemId);
    if (!item) {
      return;
    }
    const effectiveItem = applyFeaturedPricing(getEffectiveMenuItems().find((candidate) => candidate.id === item.id), featured) || item;
    const size = effectiveItem.sizes.find((entry) => entry.label === savedItem.sizeLabel || entry.id === savedItem.size) || effectiveItem.sizes[0];
    const milk = getMilkOption(savedItem.milkType === "Oatmilk" ? "oat" : savedItem.milkId, effectiveItem);
    rebuiltCart.push({
      id: buildLineId(effectiveItem.id, size.id, milk?.id || null),
      itemId: effectiveItem.id,
      name: effectiveItem.name,
      category: effectiveItem.category,
      price: getUnitPrice(effectiveItem, size, milk),
      quantity: savedItem.quantity,
      sizeId: size.id,
      size: size.label,
      sizeLabel: size.label,
      milkId: milk?.id || null,
      milkLabel: milk?.label || null,
      note: savedItem.note || null,
      unitPrice: getUnitPrice(effectiveItem, size, milk),
      totalPrice: savedItem.quantity * getUnitPrice(effectiveItem, size, milk),
    });
    state.selectedSizes[effectiveItem.id] = size.id;
    if (milk) {
      state.selectedMilks[effectiveItem.id] = milk.id;
    }
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

function setQuickPanel(panelName) {
  state.quickPanel = panelName;
  renderQuickTabs();
}

function toggleQuickDrawer() {
  state.quickDrawerOpen = !state.quickDrawerOpen;
  renderQuickDrawer();
}

function hasPendingOrder() {
  return Boolean(state.activeOrder && ACTIVE_ORDER_STATUSES.has(state.activeOrder.status));
}

function formatOrderStatus(status) {
  switch (status) {
    case "new":
      return "Queued";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready";
    case "issue":
      return "Needs Review";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Processing";
  }
}

function startOrderPolling() {
  if (orderPollingHandle) {
    clearInterval(orderPollingHandle);
    orderPollingHandle = null;
  }

  if (!state.activeOrder?.id || !window.bacSupabase?.enabled) {
    return;
  }

  void refreshActiveOrderStatus();
  orderPollingHandle = window.setInterval(() => {
    void refreshActiveOrderStatus();
  }, 5000);
}

async function refreshActiveOrderStatus() {
  if (!state.activeOrder?.id || !window.bacSupabase?.enabled) {
    return;
  }

  const { data, error } = await window.bacSupabase.loadOrderById(state.activeOrder.id);
  if (error) {
    console.error("Failed to refresh active order", error);
    return;
  }

  if (!data) {
    return;
  }

  state.activeOrder = {
    id: data.id,
    orderNumber: data.order_number,
    status: data.status,
    createdAt: data.created_at,
  };

  if (ACTIVE_ORDER_STATUSES.has(data.status)) {
    storage.saveActiveOrder(state.activeOrder);
  } else {
    storage.clearActiveOrder();
    state.activeOrder = null;
    if (orderPollingHandle) {
      clearInterval(orderPollingHandle);
      orderPollingHandle = null;
    }
  }

  renderAll();
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

function handleScrollSpy() {
  const sections = Array.from(elements.menuSections.querySelectorAll(".menu-section"));
  if (sections.length === 0) {
    return;
  }

  let closestSection = sections[0];
  let closestDistance = Number.POSITIVE_INFINITY;
  sections.forEach((section) => {
    const distance = Math.abs(section.getBoundingClientRect().top - 20);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSection = section;
    }
  });

  setActiveCategoryLink(closestSection.id);
}

function getSelectedSize(item) {
  const selectedId = state.selectedSizes[item.id];
  return item.sizes.find((size) => size.id === selectedId) || item.sizes[0];
}

function requiresMilkChoice(item) {
  return item.category === "Milk";
}

function getMilkDelta(milkId) {
  return milkId === "oat" ? storage.getOatmilkSurcharge() : 0;
}

function getSelectedMilk(item) {
  if (!requiresMilkChoice(item)) {
    return null;
  }
  const selectedId = state.selectedMilks[item.id] || MILK_OPTIONS[0].id;
  return MILK_OPTIONS.find((milk) => milk.id === selectedId) || MILK_OPTIONS[0];
}

function getMilkOption(milkId, item) {
  if (!requiresMilkChoice(item)) {
    return null;
  }
  return MILK_OPTIONS.find((milk) => milk.id === milkId) || MILK_OPTIONS[0];
}

function getUnitPrice(item, size, milk) {
  return item.price + size.delta + (milk ? getMilkDelta(milk.id) : 0);
}

function groupByCategory(items) {
  const grouped = new Map();
  items.forEach((item) => {
    const category = getCategoryDefinitionByRaw(item.category);
    if (!grouped.has(category.id)) {
      grouped.set(category.id, { category, items: [] });
    }
    grouped.get(category.id).items.push(item);
  });
  return CATEGORY_DEFINITIONS
    .map((category) => grouped.get(category.id))
    .filter(Boolean)
    .map((entry) => [entry.category.label, entry.items]);
}

function shortCategoryLabel(category) {
  return getCategoryDefinitionByRaw(category).label;
}

function getCategoryDefinitionByRaw(rawCategory) {
  const categoryId = {
    "Espresso Hot": "hot",
    "Espresso Cold": "cold",
    Milk: "milk",
    Fizz: "fizz",
    "Black Tea": "tea",
    Matcha: "matcha",
    Food: "food",
    Snacks: "snacks",
    Addons: "addons",
  }[rawCategory] || "hot";

  return CATEGORY_DEFINITIONS.find((category) => category.id === categoryId) || CATEGORY_DEFINITIONS[0];
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function setActiveCategoryLink(targetId) {
  Array.from(elements.categoryNav.querySelectorAll(".category-link")).forEach((button) => {
    button.classList.toggle("active", button.dataset.target === targetId);
  });
}

function getCartQuantity(itemId, sizeId, milkId = null) {
  return state.cart
    .filter((entry) => entry.itemId === itemId && entry.sizeId === sizeId && (entry.milkId || null) === milkId)
    .reduce((sum, entry) => sum + entry.quantity, 0);
}

function getEffectiveMenuItems() {
  const menuConfigMap = new Map(storage.getMenuConfig().map((item) => [item.id, item.price]));
  return menuItems.map((item) => ({
    ...item,
    price: menuConfigMap.get(item.id) ?? item.price,
  }));
}

function applyFeaturedPricing(item, featured) {
  if (!item || !featured || featured.itemId !== item.id) {
    return item;
  }

  const discount = Math.max(0, Number(featured.discount || 0));
  return {
    ...item,
    originalPrice: item.price,
    price: Math.max(0, item.price - discount),
    featuredDiscount: discount,
  };
}

function formatFeaturedPrice(item, featured) {
  if (!item || !featured || !featured.discount) {
    return formatPrice(item?.price || 0);
  }

  return `<span class="featured-price-original">${formatPrice(item.originalPrice || item.price + featured.discount)}</span><span class="featured-price-discount">${formatPrice(item.price)}</span>`;
}

function renderFeaturedMedia(featured) {
  const title = featured.title || "Featured drink";
  if (featured.mediaType === "video") {
    return `<video class="featured-media" src="${featured.mediaUrl}" autoplay muted loop playsinline controls preload="metadata" aria-label="${title}"></video>`;
  }
  return `<img class="featured-media" src="${featured.mediaUrl}" alt="${title}" />`;
}

async function hydrateRemoteConfig() {
  if (!window.bacSupabase?.enabled) {
    return;
  }

  const [
    { data: remoteMenu, error: menuError },
    { data: remoteFeatured, error: featuredError },
    { data: remoteRedeemables, error: redeemablesError },
    { data: remoteOatmilk, error: oatmilkError },
  ] = await Promise.all([
    window.bacSupabase.loadMenuConfig(),
    window.bacSupabase.loadFeaturedDrink(),
    window.bacSupabase.loadRedeemables ? window.bacSupabase.loadRedeemables() : Promise.resolve({ data: null, error: null }),
    window.bacSupabase.loadOatmilkSurcharge ? window.bacSupabase.loadOatmilkSurcharge() : Promise.resolve({ data: null, error: null }),
  ]);

  if (!menuError && Array.isArray(remoteMenu) && remoteMenu.length > 0) {
    storage.saveMenuConfig(remoteMenu);
  }

  if (!featuredError) {
    if (remoteFeatured) {
      storage.saveFeaturedDrink(remoteFeatured);
    } else {
      storage.clearFeaturedDrink();
    }
  }

  if (!redeemablesError && Array.isArray(remoteRedeemables) && remoteRedeemables.length > 0) {
    storage.saveRedeemables(remoteRedeemables);
    state.redeemables = remoteRedeemables;
  }

  if (!oatmilkError && remoteOatmilk !== null && remoteOatmilk !== undefined) {
    storage.saveOatmilkSurcharge(remoteOatmilk);
  }

  hydrateCategoryFilter();
  renderAll();
}

function getRewardCatalog() {
  return [...(state.redeemables?.length ? state.redeemables : DEFAULT_REDEEMABLES)].sort((left, right) => left.points - right.points);
}

function getAccountLevel(orderCount) {
  return ACCOUNT_LEVELS.find((level) => orderCount >= level.minOrders && orderCount <= level.maxOrders) || ACCOUNT_LEVELS[0];
}

function getNextAccountLevel(orderCount) {
  return ACCOUNT_LEVELS.find((level) => level.minOrders > orderCount) || null;
}

function getInventoryEntry(inventory, item) {
  return inventory.find((entry) => entry.name === item.name && entry.category === item.category)
    || inventory.find((entry) => entry.name === item.name);
}

function findMenuItem(itemId) {
  return getEffectiveMenuItems().find((item) => item.id === itemId) || null;
}

function buildLineId(itemId, sizeId, milkId = null) {
  return `${itemId}::${sizeId}::${milkId || "nomilk"}`;
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

function estimatePreparationTime(cart) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return Math.max(8, 6 + itemCount * 3);
}

function showSuccessScreen() {
  if (!state.lastCompletedOrder) {
    return;
  }

  const nextLevel = getNextAccountLevel(state.loyalty.orderCount);
  elements.successEstimate.innerHTML = state.account
    ? `
      Estimated time: ${state.lastCompletedOrder.estimateMinutes} minutes<br />
      +${state.lastCompletedOrder.pointsEarned} point${state.lastCompletedOrder.pointsEarned === 1 ? "" : "s"} earned. You are now ${state.lastCompletedOrder.levelName}${nextLevel ? `. Next level at ${nextLevel.minOrders} orders.` : "."}
    `
    : `
      Estimated time: ${state.lastCompletedOrder.estimateMinutes} minutes<br />
      Order as a guest was placed successfully. Sign up next time to start earning points.
    `;
  elements.successOrderNumber.textContent = state.lastCompletedOrder.orderNumber;
  elements.successTotal.textContent = formatPrice(state.lastCompletedOrder.total);
  elements.successScreen.classList.remove("hidden");
}

function dismissSuccessScreen() {
  elements.successScreen.classList.add("hidden");
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "classic";
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
  localStorage.setItem(STORAGE_KEYS.theme, event.target.value);
  applySavedTheme();
}
