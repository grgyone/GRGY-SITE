document.addEventListener('DOMContentLoaded', function () {
  const list = document.getElementById('cart-list');
  const emptyState = document.getElementById('cart-empty');
  const totalElement = document.getElementById('cart-grand-total');
  const form = document.getElementById('checkout-form');
  const result = document.getElementById('checkout-result');
  const submitButton = document.getElementById('checkout-button');

  if (!list || !emptyState || !totalElement || !form || !result || !submitButton) {
    return;
  }

  function setResult(message, type) {
    result.textContent = message;
    result.dataset.state = type || 'info';
  }

  function getItems() {
    return window.GRGY_CART.getItems();
  }

  function renderCart() {
    const items = getItems();
    list.innerHTML = '';

    if (!items.length) {
      emptyState.style.display = 'block';
      totalElement.textContent = window.GRGY_STORE_API.formatPrice(0);
      submitButton.disabled = true;
      return;
    }

    emptyState.style.display = 'none';
    submitButton.disabled = false;

    items.forEach(function (item) {
      const row = document.createElement('article');
      row.className = 'cart-item-row';

      const image = document.createElement('img');
      image.className = 'cart-thumb';
      image.src = item.image_url || window.GRGY_STORE_API.placeholderImage;
      image.alt = item.name;
      image.addEventListener('error', function () {
        image.src = window.GRGY_STORE_API.placeholderImage;
      });

      const info = document.createElement('div');
      info.className = 'cart-item-info';

      const titleLink = document.createElement('a');
      titleLink.className = 'cart-item-title';
      titleLink.href = 'product.html?slug=' + encodeURIComponent(item.slug || '');
      titleLink.textContent = item.name;

      const meta = document.createElement('p');
      meta.className = 'cart-item-meta';
      meta.textContent = window.GRGY_STORE_API.formatPrice(item.price_rub);

      info.appendChild(titleLink);
      info.appendChild(meta);

      const qtyControls = document.createElement('div');
      qtyControls.className = 'qty-controls';
      qtyControls.setAttribute('aria-label', 'Quantity controls for ' + item.name);
      qtyControls.innerHTML =
        '<button type="button" data-action="decrease" data-id="' +
        item.product_id +
        '">-</button>' +
        '<span>' +
        item.quantity +
        '</span>' +
        '<button type="button" data-action="increase" data-id="' +
        item.product_id +
        '">+</button>';

      const lineTotal = document.createElement('p');
      lineTotal.className = 'cart-item-total';
      lineTotal.textContent = window.GRGY_STORE_API.formatPrice(item.price_rub * item.quantity);

      const removeButton = document.createElement('button');
      removeButton.className = 'remove-btn';
      removeButton.type = 'button';
      removeButton.dataset.action = 'remove';
      removeButton.dataset.id = String(item.product_id);
      removeButton.textContent = 'Удалить';

      row.appendChild(image);
      row.appendChild(info);
      row.appendChild(qtyControls);
      row.appendChild(lineTotal);
      row.appendChild(removeButton);
      list.appendChild(row);
    });

    totalElement.textContent = window.GRGY_STORE_API.formatPrice(window.GRGY_CART.getTotal(items));
  }

  async function submitOrder(event) {
    event.preventDefault();
    setResult('', 'info');

    const items = getItems();
    if (!items.length) {
      setResult('Корзина пуста.', 'error');
      return;
    }

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const contact = String(formData.get('contact') || '').trim();
    const comment = String(formData.get('comment') || '').trim();

    if (!email) {
      setResult('Укажите email.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    try {
      const payload = {
        email: email,
        contact: contact,
        comment: comment,
        items: items.map(function (item) {
          return {
            product_id: item.product_id,
            quantity: item.quantity
          };
        })
      };

      const functionUrl =
        'https://nqthqdqeraewodcxdags.supabase.co/functions/v1/create-order';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'sb_publishable_9O0DIjJnI8PEgqx4Bj257w_ARo7aAkP',
          Authorization: 'Bearer sb_publishable_9O0DIjJnI8PEgqx4Bj257w_ARo7aAkP'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось оформить заказ.');
      }

      const orderNumber =
        data.order_number ||
        data.orderNumber ||
        data.number ||
        (data.order && (data.order.order_number || data.order.number)) ||
        data.id;

      window.GRGY_CART.clear();
      form.reset();
      renderCart();

      setResult(
        orderNumber
          ? 'Заказ оформлен. Номер: ' + orderNumber
          : 'Заказ успешно оформлен.',
        'success'
      );
    } catch (error) {
      console.error(error);
      setResult(error.message || 'Не удалось оформить заказ.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Сделать заказ';
      renderCart();
    }
  }

  list.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const productId = Number(button.dataset.id);
    const item = getItems().find(function (cartItem) {
      return cartItem.product_id === productId;
    });

    if (!item) {
      return;
    }

    if (button.dataset.action === 'increase') {
      window.GRGY_CART.updateQuantity(productId, item.quantity + 1);
    }

    if (button.dataset.action === 'decrease') {
      window.GRGY_CART.updateQuantity(productId, item.quantity - 1);
    }

    if (button.dataset.action === 'remove') {
      window.GRGY_CART.removeItem(productId);
    }

    renderCart();
  });

  form.addEventListener('submit', submitOrder);
  window.addEventListener('grgy:cart-changed', renderCart);
  renderCart();
});