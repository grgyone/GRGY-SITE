(function () {
  const CART_KEY = 'ngt_store_cart';
  const PLACEHOLDER_IMAGE = 'images/store-placeholder.svg';

  function safeParseCart(rawValue) {
    if (!rawValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function normalizeItem(item) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const productId = Number(item.product_id);
    if (!productId) {
      return null;
    }

    return {
      product_id: productId,
      slug: item.slug || '',
      name: item.name || 'Untitled',
      price_rub: Number(item.price_rub) || 0,
      image_url: item.image_url || PLACEHOLDER_IMAGE,
      quantity: Math.max(1, Number(item.quantity) || 1)
    };
  }

  function getCartItems() {
    return safeParseCart(localStorage.getItem(CART_KEY))
      .map(normalizeItem)
      .filter(Boolean);
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
    window.dispatchEvent(
      new CustomEvent('grgy:cart-changed', {
        detail: {
          items: items,
          count: getCartCount(items)
        }
      })
    );
  }

  function saveCart(items) {
    const normalized = items
      .map(normalizeItem)
      .filter(Boolean);

    if (!normalized.length) {
      localStorage.removeItem(CART_KEY);
      updateCartBadge();
      window.dispatchEvent(
        new CustomEvent('grgy:cart-changed', {
          detail: {
            items: [],
            count: 0
          }
        })
      );
      return [];
    }

    writeCart(normalized);
    return normalized;
  }

  function getCartCount(items) {
    return (items || getCartItems()).reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  }

  function getCartTotal(items) {
    return (items || getCartItems()).reduce(function (sum, item) {
      return sum + item.price_rub * item.quantity;
    }, 0);
  }

  function addItem(item) {
    const items = getCartItems();
    const normalized = normalizeItem(item);
    if (!normalized) {
      return items;
    }

    const existing = items.find(function (cartItem) {
      return cartItem.product_id === normalized.product_id;
    });

    if (existing) {
      existing.quantity += normalized.quantity;
    } else {
      items.push(normalized);
    }

    return saveCart(items);
  }

  function updateQuantity(productId, quantity) {
    const nextQuantity = Number(quantity) || 0;
    const items = getCartItems()
      .map(function (item) {
        if (item.product_id !== Number(productId)) {
          return item;
        }

        return Object.assign({}, item, { quantity: nextQuantity });
      })
      .filter(function (item) {
        return item.quantity > 0;
      });

    return saveCart(items);
  }

  function removeItem(productId) {
    return updateQuantity(productId, 0);
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    window.dispatchEvent(
      new CustomEvent('grgy:cart-changed', {
        detail: {
          items: [],
          count: 0
        }
      })
    );
  }

  function updateCartBadge() {
    const count = getCartCount();
    document.querySelectorAll('.cart-link').forEach(function (link) {
      link.hidden = count === 0;
    });

    document.querySelectorAll('.cart-badge').forEach(function (badge) {
      if (count > 0) {
        badge.textContent = String(count);
        badge.style.display = 'inline-flex';
      } else {
        badge.textContent = '';
        badge.style.display = 'none';
      }
    });
  }

  window.addEventListener('storage', function (event) {
    if (event.key === CART_KEY) {
      updateCartBadge();
    }
  });

  document.addEventListener('DOMContentLoaded', updateCartBadge);

  window.GRGY_CART = {
    key: CART_KEY,
    getItems: getCartItems,
    getCount: getCartCount,
    getTotal: getCartTotal,
    addItem: addItem,
    updateQuantity: updateQuantity,
    removeItem: removeItem,
    clear: clearCart,
    updateBadge: updateCartBadge
  };
})();
