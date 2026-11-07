// js/index.js

const API_BASE = window.API_BASE || 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', async () => {
  const featuredContainer = document.getElementById('featured-products');
  const newArrivalsContainer = document.getElementById('new-products');

  try {
    const res = await fetch(`${API_BASE}/products?limit=20`);
    if (!res.ok) throw new Error('Không tải được sản phẩm');

    const result = await res.json();
    const products = (result.data || []).map(p => ({
      ...p,
      id: p._id || p.id,
      categoryName: p.category?.name || p.category || '',
      originalPrice: Number(p.originalPrice) || 0,
      salePrice: Number(p.salePrice) || Number(p.originalPrice) || 0
    }));

    // 1. Sản phẩm nổi bật
    const featured = products.filter(p => p.isFeatured).slice(0, 4);
    if (featuredContainer) {
      renderProducts(featured.length ? featured : products.slice(0, 4), featuredContainer);
    }

    // 2. Sản phẩm mới (lấy 4 sản phẩm mới nhất)
    const newItems = [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);

    if (newArrivalsContainer) {
      renderProducts(newItems, newArrivalsContainer);
    }

  } catch (err) {
    console.error('Lỗi tải dữ liệu trang chủ:', err);
  }
});

function renderProducts(list, container) {
  if (!container) return;

  container.innerHTML = list.map(product => {
    const hasDiscount = product.originalPrice > product.salePrice;
    const discountPercent = hasDiscount
      ? Math.round((1 - product.salePrice / product.originalPrice) * 100)
      : 0;

    return `
      <div class="col-6 col-md-3">
        <div class="card product-card h-100 border-0 shadow-sm">
          <div class="position-relative overflow-hidden">
            <img src="${product.image || ''}" class="card-img-top" alt="${product.name}"
                 onclick="location.href='detail.html?id=${product.id}'" style="cursor:pointer">
            ${hasDiscount ? `<span class="badge bg-danger position-absolute top-2 end-2">-${discountPercent}%</span>` : ''}
          </div>
          <div class="card-body d-flex flex-column">
            <small class="text-muted">${product.categoryName}</small>
            <h6 class="card-title fw-bold text-truncate"
                onclick="location.href='detail.html?id=${product.id}'" style="cursor:pointer">
              ${product.name}
            </h6>
            <div class="mt-auto">
              <p class="mb-2">
                <span class="fw-bold text-accent">${product.salePrice.toLocaleString('vi-VN')}đ</span>
                ${hasDiscount ? `<del class="text-muted small ms-1">${product.originalPrice.toLocaleString('vi-VN')}đ</del>` : ''}
              </p>
              <button class="btn btn-pann w-100 btn-sm"
                onclick='addToCart(${JSON.stringify({
                  productId: product.id,
                  name: product.name,
                  price: product.salePrice,
                  image: product.image,
                  quantity: 1
                })})'>
                <i class="bi bi-plus-lg"></i> Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}