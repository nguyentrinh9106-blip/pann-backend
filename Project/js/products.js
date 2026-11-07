// js/products.js

let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products?limit=100`);
    if (!res.ok) throw new Error('Không thể tải sản phẩm');

    const result = await res.json();
    console.log('Dữ liệu từ MongoDB:', result);

    const products = result.data || [];

    allProducts = products.map(p => ({
      ...p,
      id: p._id,
      categoryName: p.category?.name || 'Chưa phân loại',
      originalPrice: Number(p.originalPrice) || 0,
      salePrice: Number(p.salePrice) || Number(p.originalPrice) || 0
    }));

    initCategories(allProducts);
    renderProducts(allProducts);
    initEvents();

  } catch (err) {
    console.error('Lỗi tải sản phẩm:', err);
    const grid = document.getElementById('product-grid');
    if (grid) {
      grid.innerHTML = '<div class="col-12 text-center text-danger">Không tải được sản phẩm. Kiểm tra Backend đã chạy chưa.</div>';
    }
  }
}

function initCategories(products) {
  const categories = ['all', ...new Set(products.map(p => p.categoryName))];
  const container = document.getElementById('category-filters');
  if (!container) return;

  let html = `
    <div class="form-check mb-2">
      <input class="form-check-input" type="radio" name="category" value="all" id="cat-all" checked>
      <label class="form-check-label" for="cat-all">Tất cả sản phẩm</label>
    </div>
  `;

  categories.forEach((cat, index) => {
    if (cat !== 'all') {
      html += `
        <div class="form-check mb-2">
          <input class="form-check-input" type="radio" name="category" value="${cat}" id="cat-${index}">
          <label class="form-check-label" for="cat-${index}">${cat}</label>
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  const countLabel = document.getElementById('product-count');
  const noResults = document.getElementById('no-results');

  if (!grid) return;
  if (countLabel) countLabel.textContent = products.length;

  if (products.length === 0) {
    grid.innerHTML = '';
    if (noResults) noResults.classList.remove('d-none');
    return;
  }

  if (noResults) noResults.classList.add('d-none');

  grid.innerHTML = products.map(p => {
    const hasDiscount = p.originalPrice > p.salePrice;
    const discountPercent = hasDiscount
      ? Math.round((1 - p.salePrice / p.originalPrice) * 100)
      : 0;

    return `
      <div class="col-md-4 col-6 mb-4">
        <div class="card product-card h-100 border-0 shadow-sm position-relative">
          <div class="overflow-hidden">
            <img src="${p.image || ''}"
                 class="card-img-top"
                 alt="${p.name}"
                 onclick="location.href='detail.html?id=${p.id}'"
                 style="cursor:pointer; height:220px; object-fit:cover">
          </div>

          ${hasDiscount ? `<span class="badge bg-danger position-absolute top-0 start-0 m-3">-${discountPercent}%</span>` : ''}

          <div class="card-body d-flex flex-column text-center">
            <small class="text-muted text-uppercase">${p.categoryName}</small>
            <h6 class="card-title fw-bold mt-2" onclick="location.href='detail.html?id=${p.id}'" style="cursor:pointer">
              ${p.name}
            </h6>

            <div class="mt-auto">
              <p class="mb-3">
                <span class="text-accent fw-bold">${p.salePrice.toLocaleString('vi-VN')}đ</span>
                ${hasDiscount ? `<del class="text-muted small ms-2">${p.originalPrice.toLocaleString('vi-VN')}đ</del>` : ''}
              </p>

              <button class="btn btn-pann w-100 btn-sm"
                onclick='addToCart(${JSON.stringify({
                  productId: p.id,
                  name: p.name,
                  price: p.salePrice,
                  image: p.image,
                  quantity: 1
                })})'>
                <i class="bi bi-cart-plus me-2"></i> THÊM VÀO GIỎ
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initEvents() {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const filterContainer = document.getElementById('category-filters');
  const resetBtn = document.getElementById('reset-filter');

  const handleFilter = () => {
    let filtered = [...allProducts];

    const keyword = (searchInput?.value || '').toLowerCase();
    if (keyword) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(keyword));
    }

    const selectedCat = document.querySelector('input[name="category"]:checked')?.value;
    if (selectedCat && selectedCat !== 'all') {
      filtered = filtered.filter(p => p.categoryName === selectedCat);
    }

    if (sortSelect?.value === 'low-to-high') {
      filtered.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortSelect?.value === 'high-to-low') {
      filtered.sort((a, b) => b.salePrice - a.salePrice);
    }

    renderProducts(filtered);
  };

  if (searchInput) searchInput.addEventListener('input', handleFilter);
  if (sortSelect) sortSelect.addEventListener('change', handleFilter);
  if (filterContainer) filterContainer.addEventListener('change', handleFilter);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'default';
      const allRadio = document.getElementById('cat-all');
      if (allRadio) allRadio.checked = true;
      renderProducts(allProducts);
    });
  }
}