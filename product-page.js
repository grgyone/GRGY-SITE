document.addEventListener('DOMContentLoaded', async function () {
  const status = document.getElementById('product-status');
  const page = document.getElementById('product-page');

  if (!window.GRGY_STORE_API) {
    return;
  }

  function setStatus(message, type) {
    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.state = type || 'info';
    status.hidden = false;
  }

  function hideStatus() {
    if (status) {
      status.hidden = true;
    }
  }

  function getSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
  }

  const slug = getSlug();
  if (!slug || !page) {
    setStatus('Product not found.', 'error');
    return;
  }

  const imageElement = document.getElementById('product-image');
  const titleElement = document.getElementById('product-title');
  const priceElement = document.getElementById('product-price');
  const descriptionElement = document.getElementById('product-description');
  const addButton = document.getElementById('add-to-cart');
  const addStatus = document.getElementById('add-status');
  const previousButton = document.getElementById('gallery-prev');
  const nextButton = document.getElementById('gallery-next');
  const thumbnails = document.getElementById('product-thumbnails');

  let galleryImages = [];
  let activeIndex = 0;
  let currentProduct = null;

  function setAddStatus(message) {
    if (!addStatus) {
      return;
    }

    addStatus.textContent = message;
  }

  function updateGallery() {
    if (!galleryImages.length || !imageElement) {
      return;
    }

    const activeImage = galleryImages[activeIndex];
    imageElement.src = activeImage;
    imageElement.alt = currentProduct ? currentProduct.name : '';

    if (thumbnails) {
      thumbnails.querySelectorAll('button').forEach(function (button, index) {
        button.classList.toggle('is-active', index === activeIndex);
      });
    }
  }

  function goToImage(nextIndex) {
    if (!galleryImages.length) {
      return;
    }

    activeIndex = (nextIndex + galleryImages.length) % galleryImages.length;
    updateGallery();
  }

  function renderThumbnails() {
    if (!thumbnails) {
      return;
    }

    thumbnails.innerHTML = '';

    if (galleryImages.length <= 1) {
      thumbnails.hidden = true;
      if (previousButton) {
        previousButton.hidden = true;
      }
      if (nextButton) {
        nextButton.hidden = true;
      }
      return;
    }

    thumbnails.hidden = false;
    galleryImages.forEach(function (imageUrl, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'product-thumbnail';
      button.setAttribute('aria-label', 'View image ' + (index + 1));
      const thumbnailImage = document.createElement('img');
      thumbnailImage.src = imageUrl;
      thumbnailImage.alt = '';
      thumbnailImage.addEventListener('error', function () {
        thumbnailImage.src = window.GRGY_STORE_API.placeholderImage;
      });
      button.appendChild(thumbnailImage);
      button.addEventListener('click', function () {
        goToImage(index);
      });
      thumbnails.appendChild(button);
    });
  }

  function renderProduct(product) {
    currentProduct = product;
    galleryImages = (product.images || []).map(function (image) {
      return image.image_url;
    });

    if (!galleryImages.length) {
      galleryImages = [window.GRGY_STORE_API.placeholderImage];
    }

    activeIndex = 0;

    document.title = product.name + ' - Grgy Sukhanov';
    titleElement.textContent = product.name;
    priceElement.textContent = window.GRGY_STORE_API.formatPrice(product.price_rub);
    descriptionElement.textContent = product.description || '';
    descriptionElement.hidden = !product.description;
    imageElement.addEventListener('error', function () {
      imageElement.src = window.GRGY_STORE_API.placeholderImage;
    });

    renderThumbnails();
    updateGallery();
    page.hidden = false;
    hideStatus();
  }

  try {
    const product = await window.GRGY_STORE_API.fetchProductBySlug(slug);

    if (!product) {
      setStatus('Product not found.', 'error');
      return;
    }

    renderProduct(product);
  } catch (error) {
    console.error(error);
    setStatus('Unable to load this product right now.', 'error');
    return;
  }

  if (previousButton) {
    previousButton.addEventListener('click', function () {
      goToImage(activeIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      goToImage(activeIndex + 1);
    });
  }

  if (addButton) {
    addButton.addEventListener('click', function () {
      if (!currentProduct) {
        return;
      }

      window.GRGY_CART.addItem({
        product_id: currentProduct.id,
        slug: currentProduct.slug,
        name: currentProduct.name,
        price_rub: currentProduct.price_rub,
        image_url: galleryImages[activeIndex] || currentProduct.primaryImage,
        quantity: 1
      });
      setAddStatus('Добавлено в корзину.');
      window.setTimeout(function () {
        setAddStatus('');
      }, 1800);
    });
  }
});
