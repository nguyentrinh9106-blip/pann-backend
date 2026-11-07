// js/checkout.js
// Thanh toán VietQR + lưu đơn hàng MongoDB + bắt buộc đăng nhập

const BANK_CONFIG = {
  bankId: "vietcombank",
  accountNo: "1050921205",
  accountName: "NGUYEN LE PHUONG TRINH"
};

let cart = JSON.parse(localStorage.getItem('selected_cart')) || [];
let orderTotalAmount = 0;
let allProductCodesString = "";
let isSubmitting = false;

// ====================== HELPER ======================
function removeVietnameseTones(str) {
  if (!str) return "KHACH";
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return str
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase();
}

function getCartProductId(item) {
  return String(item.productId || item._id || item.id);
}

function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('pann_token') ||
    localStorage.getItem('pann_admin_token') ||
    ""
  );
}

// ====================== RENDER ======================
function renderCheckout() {
  const productContainer = document.getElementById('checkout-products');
  const totalPriceElement = document.getElementById('checkout-total-price');

  orderTotalAmount = 0;

  if (cart.length === 0) {
    if (productContainer) {
      productContainer.innerHTML = "<p class='text-muted'>Giỏ hàng trống!</p>";
    }
    if (totalPriceElement) {
      totalPriceElement.textContent = "0đ";
    }
    return;
  }

  let htmlContent = "";
  const productCodesArray = [];

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const itemTotal = price * quantity;

    orderTotalAmount += itemTotal;

    htmlContent += `
      <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
        <span>${item.name} × ${quantity}</span>
        <span class="fw-bold">${itemTotal.toLocaleString('vi-VN')}đ</span>
      </div>
    `;

    productCodesArray.push(getCartProductId(item));
  });

  if (productContainer) productContainer.innerHTML = htmlContent;
  if (totalPriceElement) {
    totalPriceElement.textContent = orderTotalAmount.toLocaleString('vi-VN') + "đ";
  }

  allProductCodesString = productCodesArray.join("_");
  updateQRAndContent();
}

// ====================== VIETQR ======================
function updateQRAndContent() {
  const qrImage = document.getElementById('payment-qr');
  const codeDisplay = document.getElementById('order-code-display');
  const nameInput = document.getElementById('cus-name');

  const customerName = nameInput?.value.trim() || "KHACH";
  const customerNameClean = removeVietnameseTones(customerName).replace(/\s+/g, '');
  const finalMemo = `${customerNameClean} ${allProductCodesString}`.trim();

  if (codeDisplay) codeDisplay.innerText = finalMemo;

  if (qrImage) {
    const memoEncoded = encodeURIComponent(finalMemo);
    const accNameEncoded = encodeURIComponent(BANK_CONFIG.accountName);

    const qrUrl =
      `https://img.vietqr.io/image/` +
      `${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.jpg` +
      `?amount=${orderTotalAmount}` +
      `&addInfo=${memoEncoded}` +
      `&accountName=${accNameEncoded}`;

    qrImage.src = qrUrl;
    qrImage.alt = "Mã QR Thanh Toán PÀNN";
  }
}

// ====================== CẬP NHẬT GIỎ ======================
function removePurchasedItemsFromCart(purchasedItems) {
  const mainCart = JSON.parse(localStorage.getItem('cart')) || [];

  purchasedItems.forEach(purchasedItem => {
    const purchasedId = getCartProductId(purchasedItem);
    const purchasedQuantity = Number(purchasedItem.quantity) || 0;

    const index = mainCart.findIndex(item =>
      getCartProductId(item) === purchasedId
    );

    if (index !== -1) {
      const currentQuantity = Number(mainCart[index].quantity) || 0;
      const remainingQuantity = currentQuantity - purchasedQuantity;

      if (remainingQuantity <= 0) {
        mainCart.splice(index, 1);
      } else {
        mainCart[index].quantity = remainingQuantity;
      }
    }
  });

  localStorage.setItem('cart', JSON.stringify(mainCart));
  localStorage.removeItem('selected_cart');

  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

// ====================== ĐẶT HÀNG ======================
async function handleOrderSubmission(e) {
  if (e) e.preventDefault();
  if (isSubmitting) return;

  if (cart.length === 0) {
    alert("Giỏ hàng đang trống!");
    return;
  }

  // Kiểm tra đăng nhập
  const token = getToken();
  if (!token) {
    alert("Bạn cần đăng nhập trước khi đặt hàng!");
    window.location.href = "account.html";
    return;
  }

  const nameInput = document.getElementById('cus-name');
  const phoneInput = document.getElementById('cus-phone');
  const emailInput = document.getElementById('cus-email');
  const addressInput = document.getElementById('cus-address');
  const noteInput = document.getElementById('cus-note');

  const items = cart.map(item => ({
    productId: getCartProductId(item),
    quantity: Number(item.quantity) || 1
  }));

  const orderData = {
    customerName: nameInput?.value.trim() || "",
    customerPhone: phoneInput?.value.trim() || "",
    customerEmail: emailInput?.value.trim() || "",
    shippingAddress: addressInput?.value.trim() || "",
    paymentMethod: "VIETQR",
    items: items,
    shippingFee: 0,
    note: noteInput?.value.trim() || ""
  };

  if (
    !orderData.customerName ||
    !orderData.customerPhone ||
    !orderData.customerEmail ||
    !orderData.shippingAddress
  ) {
    alert("Vui lòng nhập đầy đủ thông tin khách hàng!");
    return;
  }

  const submitButton = document.getElementById('btn-submit-order');
  isSubmitting = true;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "ĐANG XỬ LÝ...";
  }

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể lưu đơn hàng");
    }

    // Chỉ xóa giỏ sau khi Backend lưu thành công
    removePurchasedItemsFromCart(cart);

    alert(
      "Đặt hàng thành công!\n" +
      "Mã đơn hàng: " + result.data.orderCode +
      "\nCảm ơn bạn đã mua hàng tại PÀNN!"
    );

    window.location.href = "index.html";

  } catch (error) {
    console.error("Lỗi đặt hàng:", error);
    alert("Đặt hàng thất bại: " + error.message);
  } finally {
    isSubmitting = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "XÁC NHẬN ĐẶT HÀNG";
    }
  }
}

// ====================== KHỞI TẠO ======================
document.addEventListener('DOMContentLoaded', () => {
  renderCheckout();

  const nameInput = document.getElementById('cus-name');
  if (nameInput) {
    nameInput.addEventListener('input', updateQRAndContent);
  }

  const submitButton = document.getElementById('btn-submit-order');
  if (submitButton) {
    submitButton.addEventListener('click', handleOrderSubmission);
  }
});