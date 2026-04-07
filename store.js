document.addEventListener('DOMContentLoaded', async function () {
  const grid = document.getElementById('store-grid');
  const status = document.getElementById('store-status');

  if (!grid || !status || !window.GRGY_STORE_API) {
    return;
  }

  function setStatus(message, type) {
    status.textContent = message;
    status.dataset.state = type || 'info';
    status.hidden = false;
  }

  function hideStatus() {
    status.hidden = true;
    status.textContent = '';
  }

  function productLink(slug) {
    return 'product.html?slug=' + encodeURIComponent(slug || '');
  }

  function buildCard(product) {
    const article = document.createElement('article');
    article.className = 'product-card';

    const imageLink = document.createElement('a');
    imageLink.href = productLink(product.slug);
    imageLink.className = 'product-image-link';

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.primaryImage || window.GRGY_STORE_API.placeholderImage;
    image.alt = product.name;
    image.loading = 'lazy';
    image.addEventListener('error', function () {
      image.src = window.GRGY_STORE_API.placeholderImage;
    });

    const title = document.createElement('a');
    title.href = productLink(product.slug);
    title.className = 'product-title';
    title.textContent = product.name;

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = window.GRGY_STORE_API.formatPrice(product.price_rub);

    imageLink.appendChild(image);
    article.appendChild(imageLink);
    article.appendChild(title);
    article.appendChild(price);
    return article;
  }

  hideStatus();

  try {
    const products = await window.GRGY_STORE_API.fetchCatalog();
    grid.innerHTML = '';

    if (!products.length) {
      setStatus('', 'empty');
      return;
    }

    products.forEach(function (product) {
      grid.appendChild(buildCard(product));
    });

    hideStatus();
  } catch (error) {
    console.error(error);
    setStatus('Не удалось загрузить каталог.', 'error');
  }
});