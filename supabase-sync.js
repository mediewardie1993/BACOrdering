(function () {
  const SETTINGS_TABLE = "app_settings";
  const MENU_TABLE = "menu_items";
  const ORDERS_TABLE = "orders";

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

  window.bacSupabase = {
    enabled,
    client,
    loadMenuConfig,
    saveMenuItemPrice,
    loadFeaturedDrink,
    saveFeaturedDrink,
    loadRedeemables,
    saveRedeemables,
    loadOrders,
    loadOrderById,
    createOrder,
    updateOrderStatus,
  };
})();
