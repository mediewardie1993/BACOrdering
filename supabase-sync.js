(function () {
  const SETTINGS_TABLE = "app_settings";
  const MENU_TABLE = "menu_items";
  const ORDERS_TABLE = "orders";
  const ACCOUNTS_TABLE = "loyalty_accounts";

  const hasClient = typeof window.supabase !== "undefined";
  const hasConfig = Boolean(window.BAC_SUPABASE_URL && window.BAC_SUPABASE_ANON_KEY);
  const enabled = hasClient && hasConfig;
  const client = enabled
    ? window.supabase.createClient(window.BAC_SUPABASE_URL, window.BAC_SUPABASE_ANON_KEY)
    : null;

  async function loadMenuConfig() {
    if (!client) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(MENU_TABLE)
      .select("id, name, category, price")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    return { data, error };
  }

  async function saveMenuItemPrice(item) {
    if (!client) {
      return { data: null, error: null };
    }

    const payload = {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
    };

    const { data, error } = await client
      .from(MENU_TABLE)
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    return { data, error };
  }

  async function loadFeaturedDrink() {
    if (!client) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(SETTINGS_TABLE)
      .select("value")
      .eq("key", "featured_drink")
      .maybeSingle();

    return { data: data?.value || null, error };
  }

  async function saveFeaturedDrink(featuredDrink) {
    if (!client) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(SETTINGS_TABLE)
      .upsert({ key: "featured_drink", value: featuredDrink }, { onConflict: "key" })
      .select("value")
      .single();

    return { data: data?.value || null, error };
  }

  async function loadRedeemables() {
    if (!client) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(SETTINGS_TABLE)
      .select("value")
      .eq("key", "redeemables")
      .maybeSingle();

    return { data: data?.value || null, error };
  }

  async function saveRedeemables(redeemables) {
    if (!client) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(SETTINGS_TABLE)
      .upsert({ key: "redeemables", value: redeemables }, { onConflict: "key" })
      .select("value")
      .single();

    return { data: data?.value || null, error };
  }

  async function loadOatmilkSurcharge() {
    if (!client) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(SETTINGS_TABLE)
      .select("value")
      .eq("key", "oatmilk_surcharge")
      .maybeSingle();

    return { data: Number(data?.value?.amount ?? data?.value ?? 0), error };
  }

  async function saveOatmilkSurcharge(amount) {
    if (!client) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(SETTINGS_TABLE)
      .upsert({ key: "oatmilk_surcharge", value: { amount: Number(amount || 0) } }, { onConflict: "key" })
      .select("value")
      .single();

    return { data: Number(data?.value?.amount ?? data?.value ?? 0), error };
  }

  async function loadOrders() {
    if (!client) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(ORDERS_TABLE)
      .select("id, order_number, customer_name, service_mode, customer_phone, order_notes, items, subtotal, service_fee, total, status, created_at, updated_at")
      .order("created_at", { ascending: false });

    return { data, error };
  }

  async function loadOrderById(orderId) {
    if (!client || !orderId) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(ORDERS_TABLE)
      .select("id, order_number, customer_name, service_mode, customer_phone, order_notes, items, subtotal, service_fee, total, status, created_at, updated_at")
      .eq("id", orderId)
      .maybeSingle();

    return { data, error };
  }

  async function createOrder(order) {
    if (!client) {
      return { data: null, error: null };
    }

    const payload = {
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customer.name,
      service_mode: order.customer.serviceMode,
      customer_phone: order.customer.phone || "",
      order_notes: order.customer.notes || "",
      items: order.items,
      subtotal: order.subtotal,
      service_fee: order.serviceFee,
      total: order.total,
      status: order.status || "new",
    };

    const { data, error } = await client
      .from(ORDERS_TABLE)
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    return { data, error };
  }

  async function updateOrderStatus(orderId, status) {
    if (!client || !orderId) {
      return { data: null, error: null };
    }

    const { data, error } = await client
      .from(ORDERS_TABLE)
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    return { data, error };
  }

  async function loadAccount(username) {
    if (!client || !username) {
      return { data: null, error: null };
    }

    const normalizedUsername = String(username).trim();

    let { data, error } = await client
      .from(ACCOUNTS_TABLE)
      .select("username, display_name, requires_password, password_hash, points, order_count, bonus_carry, milestones_reached, last_updated")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    if (error && /requires_password|password_hash/i.test(`${error.message || ""} ${error.details || ""}`)) {
      const fallback = await client
        .from(ACCOUNTS_TABLE)
        .select("username, display_name, points, order_count, bonus_carry, milestones_reached, last_updated")
        .ilike("username", normalizedUsername)
        .maybeSingle();

      data = fallback.data
        ? { ...fallback.data, requires_password: false, password_hash: null }
        : null;
      error = fallback.error;
    }

    return { data, error };
  }

  async function createAccount(account) {
    if (!client || !account?.username) {
      return { data: null, error: null };
    }

    const payload = {
      username: account.username,
      display_name: account.displayName || account.username,
      requires_password: account.requiresPassword !== false,
      password_hash: account.passwordHash || null,
      points: Number(account.points || 0),
      order_count: Number(account.orderCount || 0),
      bonus_carry: Number(account.bonusCarry || 0),
      milestones_reached: Array.isArray(account.milestonesReached) ? account.milestonesReached : [],
      last_updated: account.lastUpdated || new Date().toISOString(),
    };

    const { data, error } = await client
      .from(ACCOUNTS_TABLE)
      .insert(payload)
      .select()
      .single();

    return { data, error };
  }

  async function saveAccount(account) {
    if (!client || !account?.username) {
      return { data: null, error: null };
    }

    const payload = {
      username: account.username,
      display_name: account.displayName || account.username,
      requires_password: account.requiresPassword !== false,
      points: Number(account.points || 0),
      order_count: Number(account.orderCount || 0),
      bonus_carry: Number(account.bonusCarry || 0),
      milestones_reached: Array.isArray(account.milestonesReached) ? account.milestonesReached : [],
      last_updated: account.lastUpdated || new Date().toISOString(),
    };

    if (Object.prototype.hasOwnProperty.call(account, "passwordHash")) {
      payload.password_hash = account.passwordHash;
    }

    const { data, error } = await client
      .from(ACCOUNTS_TABLE)
      .upsert(payload, { onConflict: "username" })
      .select()
      .single();

    return { data, error };
  }

  window.bacSupabase = {
    enabled,
    client,
    loadMenuConfig,
    saveMenuItemPrice,
    loadFeaturedDrink,
    saveFeaturedDrink,
    loadRedeemables,
    saveRedeemables,
    loadOatmilkSurcharge,
    saveOatmilkSurcharge,
    loadOrders,
    loadOrderById,
    createOrder,
    updateOrderStatus,
    loadAccount,
    createAccount,
    saveAccount,
  };
})();
