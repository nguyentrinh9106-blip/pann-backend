// Lấy giỏ hàng tổng từ localStorage (nếu chưa có thì là mảng rỗng)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ==========================================
// 🛠️ HÀM TĂNG GIẢM SỐ LƯỢNG THÔNG MINH (BỔ SUNG)
// ==========================================
function updateQuantity(index, change) {
    if (cart[index]) {
        // Tăng hoặc giảm số lượng
        cart[index].quantity += change;
        
        // Nếu giảm xuống bằng 0, hỏi khách xem có muốn xóa không
        if (cart[index].quantity <= 0) {
            let confirmDelete = confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không yêu ơi? 🌿");
            if (confirmDelete) {
                cart.splice(index, 1);
            } else {
                cart[index].quantity = 1; // Giữ tối thiểu là 1
            }
        }
        
        // Cập nhật lại vào bộ nhớ LocalStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Vẽ lại giao diện giỏ hàng mới
        renderCart();
        
        // Tự động tính toán lại tổng tiền dựa trên các checkbox đang được tích chọn
        calculateTotal();
    }
}

// ==========================================
// ⚙️ HÀM TỰ ĐỘNG TÍNH TỔNG TIỀN THEO CHECKBOX
// ==========================================
function calculateTotal() {
    let temporaryTotal = 0;
    const checkboxes = document.querySelectorAll('.product-checkbox');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const index = checkbox.getAttribute('data-index');
            const product = cart[index];
            if (product) {
                temporaryTotal += product.price * product.quantity;
            }
        }
    });
    
    const totalPreview = document.getElementById('cart-total-preview');
    if (totalPreview) {
        totalPreview.innerText = `${temporaryTotal.toLocaleString()}đ`;
    }
}

// ==========================================
// 🖥️ HÀM HIỂN THỊ GIỎ HÀNG (RENDER CART)
// ==========================================
function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    // 1. Trường hợp giỏ hàng trống
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <p class="text-muted mb-4">Giỏ hàng của bạn đang trống. Hãy quay lại cửa hàng để chọn sản phẩm nhé! 🌿</p>
                <a href="index.html" class="btn btn-success px-4 py-2 fw-bold text-white shadow-sm" style="border-radius: 8px;">
                    Quay lại mua sắm ngay
                </a>
            </div>
        `;
        if (document.getElementById('cart-total-preview')) {
            document.getElementById('cart-total-preview').innerText = "0đ";
        }
        return;
    }

    // 2. Khởi tạo nội dung có nút "Tiếp tục mua sắm"
    let htmlContent = `
        <div class="mb-3 text-start">
            <a href="products.html" class="text-success fw-semibold text-decoration-none d-inline-flex align-items-center gap-1" style="font-size: 0.95rem;">
                <span style="font-size: 1.1rem;">←</span> Tiếp tục mua sắm 
            </a>
        </div>
    `;
    
    // Lặp qua từng sản phẩm trong giỏ hàng để dựng giao diện
    cart.forEach((item, index) => {
        const productImage = item.image || 'images/products/default.jpg'; 

        htmlContent += `
            <div class="cart-item d-flex align-items-center justify-content-between p-3 mb-3 border rounded-3 bg-white shadow-sm position-relative">
                
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <input type="checkbox" class="form-check-input product-checkbox" data-index="${index}" style="width: 20px; height: 20px; cursor: pointer;">
                    </div>
                    
                    <div class="me-3" style="width: 50px; height: 50px; min-width: 50px;">
                        <img src="${productImage}" alt="${item.name}" class="img-fluid rounded border" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    
                    <div>
                        <h6 class="fw-bold text-dark mb-1">${item.name}</h6>
                        <span class="text-muted small">${item.price.toLocaleString()}đ</span>
                    </div>
                </div>
                
                <div class="d-flex align-items-center text-end" style="min-width: 160px; justify-content: flex-end;">
                    <div class="quantity-control" style="display: flex; align-items: center; gap: 5px; margin-right: 15px;">
                        <button class="btn-qty-minus" data-index="${index}" style="width: 25px; height: 25px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold;">-</button>
                        
                        <input type="text" value="${item.quantity}" readonly style="width: 35px; height: 25px; text-align: center; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; background-color: #f9f9f9;">
                        
                        <button class="btn-qty-plus" data-index="${index}" style="width: 25px; height: 25px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold;">+</button>
                    </div>

                    <button onclick="removeFromCart(${index})" class="btn btn-link text-danger p-1 text-decoration-none" title="Xóa sản phẩm" style="font-size: 1.2rem; line-height: 1;">
                        🗑️
                    </button>
                </div>

            </div>
        `;
    });

    container.innerHTML = htmlContent;

    // Gắn sự kiện Click xử lý nút TĂNG (+)
    document.querySelectorAll('.btn-qty-plus').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.getAttribute('data-index'));
            updateQuantity(index, 1);
        });
    });

    // Gắn sự kiện Click xử lý nút GIẢM (-)
    document.querySelectorAll('.btn-qty-minus').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.getAttribute('data-index'));
            updateQuantity(index, -1);
        });
    });
    
    // Mỗi lần vẽ lại giỏ hàng, mặc định đặt lại tổng tiền tạm tính về 0đ (khách tích đến đâu tiền nhảy đến đó)
    if (document.getElementById('cart-total-preview')) {
        document.getElementById('cart-total-preview').innerText = "0đ";
    }
}

// Hàm xóa sản phẩm khỏi giỏ (Giữ nguyên logic của bạn nhưng thêm render lại tổng tiền)
function removeFromCart(index) {
    let confirmDelete = confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng? 🌿");
    if (confirmDelete) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        calculateTotal();
    }
}

// Lắng nghe sự kiện đổi trạng thái Checkbox tích chọn mua hàng
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('product-checkbox')) {
        calculateTotal();
    }
});

// Khởi chạy hệ thống khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.onclick = function() {
            const checkboxes = document.querySelectorAll('.product-checkbox');
            let selectedCart = [];

            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const index = checkbox.getAttribute('data-index');
                    selectedCart.push(cart[index]);
                }
            });

            if (selectedCart.length === 0) {
                alert("Dạ, PÀNN xin lỗi! Bạn cần tích chọn ít nhất một sản phẩm để tiến hành thanh toán nhé ạ! 🌸");
                return;
            }

            localStorage.setItem('selected_cart', JSON.stringify(selectedCart));
            window.location.href = "checkout.html";
        };
    }
});