// Capa de datos: intenta Supabase, luego JSON local, luego fallback embebido
(function(){
  const allowDemoProducts = () => {
    if (typeof window.AURA_ALLOW_DEMO_PRODUCTS !== 'undefined') return Boolean(window.AURA_ALLOW_DEMO_PRODUCTS);
    return window.location.protocol === 'file:'; // solo cuando abren directamente el html sin servidor/php
  };
  window.allowDemoProducts = allowDemoProducts;

  async function fetchFromPhp(params={}){
    const qp = new URLSearchParams();
    if (params.gender) qp.set('gender', params.gender);
    if (params.search) qp.set('search', params.search);
    if (params.limit) qp.set('limit', params.limit);
    const res = await fetch('api/products.php?' + qp.toString());
    if (!res.ok) throw new Error('php-fetch-failed');
    return await res.json();
  }

  async function fetchFromSupabase(params={}){
    const cfg = (window.SUPABASE||{});
    if (!cfg.URL || !cfg.ANON_KEY) throw new Error('supabase-config-missing');
    const qp = [];
    qp.push('select=id,slug,title,price_cents,gender,product_images(url,is_primary)');
    qp.push('order=created_at.desc');
    if (params.gender) qp.push(`gender=eq.${encodeURIComponent(params.gender)}`);
    if (params.search) qp.push(`title=ilike.*${encodeURIComponent(params.search)}*`);
    const url = `${cfg.URL}/rest/v1/products?${qp.join('&')}`;
    const res = await fetch(url, { headers: { apikey: cfg.ANON_KEY, Authorization: `Bearer ${cfg.ANON_KEY}` }});
    if (!res.ok) throw new Error('supabase-fetch-failed');
    const rows = await res.json();
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      price: r.price_cents || 0,
      gender: r.gender,
      image: (r.product_images && (r.product_images.find(i=>i.is_primary)?.url || r.product_images[0]?.url)) || '',
    }));
  }

  async function fetchFromJson(params={}){
    const res = await fetch('assets/data/products.json');
    const items = await res.json();
    let list = items.slice();
    if (params.gender) list = list.filter(p=>p.gender===params.gender);
    if (params.search){ const q=params.search.toLowerCase(); list = list.filter(p=>p.title.toLowerCase().includes(q)); }
    return list;
  }

  async function fetchProducts(params={}){
    let lastError = null;
    // 1) PHP API
    try { return await fetchFromPhp(params); } catch(e) { lastError = e; }
    // 2) Supabase (opcional)
    try { return await fetchFromSupabase(params); } catch(e) { lastError = e; }
    if (allowDemoProducts()) {
      try { const json = await fetchFromJson(params); if (json && json.length) return json; } catch(e) { lastError = e; }
      let items = (window.PRODUCTS_FALLBACK||[]);
      if (params.gender) items = items.filter(p=>p.gender===params.gender);
      if (params.search){ const q=params.search.toLowerCase(); items = items.filter(p=>p.title.toLowerCase().includes(q)); }
      console.warn('Usando productos de demo porque la API no respondi��', lastError);
      return items;
    }
    throw lastError || new Error('products-unavailable');
  }

  window.fetchProducts = fetchProducts;
})();

