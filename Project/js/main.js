// project/js/main.js

// Hàm thêm sản phẩm vào giỏ hàng

function addToCart(productOrId, qty = 1) {
  let product = null;

  // Trường hợp 1: truyền vào object sản phẩm (từ products.js / index.js)
  if (typeof productOrId === 'object' && productOrId !== null) {
    product = {
      id: productOrId.productId || productOrId._id || productOrId.id,
      name: productOrId.name,
      price: Number(productOrId.price) || Number(productOrId.salePrice) || 0,
      image: productOrId.image || '',
      quantity: Number(qty) || Number(productOrId.quantity) || 1
    };
  }
  // Trường hợp 2: truyền vào id (chuỗi / số)
  else {
    const id = String(productOrId);
    // Nếu trang có allProducts thì tìm
    if (typeof allProducts !== 'undefined' && Array.isArray(allProducts)) {
      const found = allProducts.find(p => String(p._id || p.id) === id);
      if (found) {
        product = {
          id: found._id || found.id,
          name: found.name,
          price: Number(found.salePrice) || Number(found.price) || 0,
          image: found.image || '',
          quantity: Number(qty) || 1
        };
      }
    }
  }

  if (!product || !product.id) {
    alert('Không tìm thấy sản phẩm!');
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => String(item.id) === String(product.id));

  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
}


// Hàm sao chép voucher
function copyVoucher(code) {
    navigator.clipboard.writeText(code);
    alert("Đã sao chép mã giảm giá: " + code);
}