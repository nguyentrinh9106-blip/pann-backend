// js/detail.js

const API_BASE = window.API_BASE || 'http://localhost:5000/api';
let currentProduct = null;

function getProductId(product) {
  return String(product._id || product.id);
}

function getProductPrice(product) {
  // Ưu tiên salePrice từ Backend
  if (Number.isFinite(Number(product.salePrice)) && Number(product.salePrice) > 0) {
    return Number(product.salePrice);
  }
  // Fallback cũ
  const price = Number(product.price) || Number(product.originalPrice) || 0;
  const salePercent = Number(product.salePercent) || 0;
  return price * (1 - salePercent / 100);
}

function getOriginalPrice(product) {
  return Number(product.originalPrice) || Number(product.price) || 0;
}

function getCategoryName(category) {
  return typeof category === 'object'
    ? (category?.name || 'Chưa phân loại')
    : (category || 'Chưa phân loại');
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = 'products.html';
    return;
  }

  try {
    // 1. Lấy chi tiết 1 sản phẩm
    const res = await fetch(`${API_BASE}/products/${productId}`);
    if (!res.ok) throw new Error('Không tải được sản phẩm');

    const result = await res.json();
    currentProduct = result.data || result;

    if (!currentProduct || !getProductId(currentProduct)) {
      alert('Không tìm thấy sản phẩm!');
      window.location.href = 'products.html';
      return;
    }

    renderProductDetail(currentProduct);

    // 2. Lấy sản phẩm liên quan (cùng danh mục)
    const listRes = await fetch(`${API_BASE}/products?limit=50`);
    const listResult = await listRes.json();
    const allProducts = listResult.data || [];

    renderRelatedProducts(
      allProducts,
      getCategoryName(currentProduct.category),
      getProductId(currentProduct)
    );

  } catch (error) {
    console.error('Lỗi tải chi tiết sản phẩm:', error);
    alert('Không thể tải thông tin sản phẩm!');
  }

  // Nút thêm giỏ hàng
  const addButton = document.getElementById('add-to-cart-btn');
  if (addButton) {
    addButton.addEventListener('click', () => {
      if (!currentProduct) return;
      const qty = parseInt(document.getElementById('buy-qty')?.value) || 1;
      addToCartWithQty(currentProduct, qty);
    });
  }
});

function renderProductDetail(product) {
  document.title = `${product.name} | PÀNN`;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('breadcrumb-name', product.name);
  setText('breadcrumb-cat', getCategoryName(product.category));
  setText('product-name', product.name);
  setText('product-desc', product.description || '');
  setText('product-stock', product.stock ?? 0);

  const img = document.getElementById('product-img');
  if (img) img.src = product.image || '';

  const finalPrice = getProductPrice(product);
  const originalPrice = getOriginalPrice(product);

  setText('product-price', finalPrice.toLocaleString('vi-VN') + 'đ');

  const oldPriceElement = document.getElementById('product-old-price');
  if (oldPriceElement) {
    oldPriceElement.textContent =
      finalPrice < originalPrice
        ? originalPrice.toLocaleString('vi-VN') + 'đ'
        : '';
  }

  // Rating
  const ratingEl = document.getElementById('product-rating');
  if (ratingEl) {
    const rating = Number(product.rating) || 0;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<i class="bi bi-star${i <= Math.floor(rating) ? '-fill' : ''}"></i>`;
    }
    ratingEl.innerHTML = stars;
  }

  setText('product-reviews', `(${product.reviewCount || 0} đánh giá)`);
}

function changeQty(num) {
  const input = document.getElementById('buy-qty');
  if (!input) return;
  let val = (parseInt(input.value) || 1) + num;
  if (val < 1) val = 1;
  input.value = val;
}

function addToCartWithQty(product, qty) {
  if (!product) return;

  const id = getProductId(product);
  const quantity = Math.max(1, Number(qty) || 1);

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => String(item.id) === id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: id,
      name: product.name,
      price: getProductPrice(product),
      image: product.image,
      quantity: quantity
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
}

function renderRelatedProducts(allProducts, category, currentId) {
  const container = document.getElementById('related-products');
  if (!container) return;

  const related = allProducts
    .filter(p =>
      getCategoryName(p.category) === category &&
      getProductId(p) !== currentId
    )
    .slice(0, 4);

  container.innerHTML = related.map(p => `
    <div class="col-md-3 col-6">
      <div class="card product-card h-100 border-0 shadow-sm text-center">
        <img src="${p.image || ''}"
             class="card-img-top"
             alt="${p.name}"
             onclick="location.href='detail.html?id=${getProductId(p)}'"
             style="cursor:pointer">
        <div class="card-body">
          <h6 class="fw-bold mb-2">${p.name}</h6>
          <p class="text-accent mb-0">
            ${getProductPrice(p).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>
    </div>
  `).join('');
}