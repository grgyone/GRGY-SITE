(function () {
  const SUPABASE_URL = 'https://nqthqdqeraewodcxdags.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_9O0DIjJnI8PEgqx4Bj257w_ARo7aAkP';
  const PLACEHOLDER_IMAGE = 'images/store-placeholder.svg';
  const formatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  });

  function formatPrice(value) {
    const amount = Number(value) || 0;
    return formatter.format(amount);
  }

  function getImageUrl(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    return record.image_url || record.url || record.src || null;
  }

function isProductActive(product) {
  if (!product || typeof product !== 'object') {
    return false;
  }

  if (typeof product.is_active === 'boolean') {
    return product.is_active;
  }

  if (typeof product.active === 'boolean') {
    return product.active;
  }

  return true;
}

  function normalizeProduct(product, images) {
    const gallery = Array.isArray(images)
      ? images
          .map(function (image) {
            return {
              id: image.id,
              product_id: image.product_id,
              image_url: getImageUrl(image) || PLACEHOLDER_IMAGE,
              sort_order: Number(image.sort_order) || 0
            };
          })
          .sort(function (left, right) {
            return left.sort_order - right.sort_order;
          })
      : [];

    return {
      id: product.id,
      slug: product.slug || '',
      name: product.name || product.title || 'Untitled',
      description: product.description || '',
      price_rub: Number(product.price_rub) || 0,
      active: isProductActive(product),
      images: gallery,
      primaryImage: gallery[0] ? gallery[0].image_url : PLACEHOLDER_IMAGE
    };
  }

  function groupImagesByProduct(images) {
    return (images || []).reduce(function (accumulator, image) {
      const key = image.product_id;
      if (!accumulator[key]) {
        accumulator[key] = [];
      }

      accumulator[key].push(image);
      return accumulator;
    }, {});
  }

  async function fetchProductImages(productIds) {
    if (!productIds.length) {
      return [];
    }

    const response = await window.GRGY_SUPABASE
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    if (response.error) {
      console.warn('Unable to load product images, falling back to placeholders.', response.error);
      return [];
    }

    return response.data || [];
  }

  async function fetchCatalog() {
    const response = await window.GRGY_SUPABASE.from('products').select('*').order('id', { ascending: true });

    if (response.error) {
      throw response.error;
    }

    const products = (response.data || []).filter(isProductActive);
    const images = await fetchProductImages(
      products
        .map(function (product) {
          return product.id;
        })
        .filter(Boolean)
    );
    const imageMap = groupImagesByProduct(images);

    return products.map(function (product) {
      return normalizeProduct(product, imageMap[product.id]);
    });
  }

  async function fetchProductBySlug(slug) {
    const response = await window.GRGY_SUPABASE.from('products').select('*').eq('slug', slug).limit(1);

    if (response.error) {
      throw response.error;
    }

    const product = (response.data || [])[0];
    if (!product || !isProductActive(product)) {
      return null;
    }

    const images = await fetchProductImages([product.id]);
    return normalizeProduct(product, images);
  }

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase client library is not available.');
    return;
  }

  window.GRGY_SUPABASE = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.GRGY_STORE_API = {
    fetchCatalog: fetchCatalog,
    fetchProductBySlug: fetchProductBySlug,
    formatPrice: formatPrice,
    placeholderImage: PLACEHOLDER_IMAGE
  };
})();
