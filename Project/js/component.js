// project/js/component.js

/**
 * Hàm load file HTML vào một ID element cụ thể
 */
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("Không thể tải thành phần: " + filePath);
        const content = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
            
            // Nếu load header, cập nhật ngay số lượng giỏ hàng
            if (elementId === 'header-placeholder') {
                updateCartBadge();
            }
        }
    } catch (error) {
        console.error("Lỗi component:", error);
    }
}

/**
 * Cập nhật số lượng hiển thị trên icon giỏ hàng từ localStorage
 */
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalItems;
    }
}

// Tự động kích hoạt khi trang web load
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('header-placeholder', 'components/header.html');
    await checkAdminAccess();

    loadComponent('footer-placeholder', 'components/footer.html');
    loadComponent('chatbot-placeholder', 'components/chatbot.html');
});
// Trong file js/component.js
function loadChatbot() {
    fetch('chatbot.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('chatbot-placeholder').innerHTML = data;
            // Sau khi load HTML xong mới load script xử lý
            const script = document.createElement('script');
            script.src = 'js/chatbot.js';
            document.body.appendChild(script);
        });
}

// Gọi hàm này cùng với loadHeader, loadFooter
loadChatbot();
// Hàm cập nhật con số trên icon giỏ hàng
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    
    if (cartCountElement) {
        // Cách 1: Tổng số loại sản phẩm (Ví dụ: mua 2 son, 1 phấn -> hiện số 2)
        // const totalItems = cart.length; 

        // Cách 2: Tổng số lượng chi tiết (Ví dụ: mua 2 son, 1 phấn -> hiện số 3)
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        cartCountElement.innerText = totalItems;
        
        // Ẩn số 0 nếu giỏ hàng trống (tùy chọn)
        if (totalItems === 0) {
            cartCountElement.style.display = 'none';
        } else {
            cartCountElement.style.display = 'block';
        }
    }
}

// Gọi hàm này ngay khi trang web vừa tải xong
document.addEventListener('DOMContentLoaded', updateCartBadge);
async function checkAdminAccess() {
    const adminLink = document.getElementById('admin-link');

    if (!adminLink) return;

    const token = localStorage.getItem('pann_admin_token');

    // Không có token Admin → ẩn nút
    if (!token) {
        adminLink.style.display = 'none';
        return;
    }

    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            adminLink.style.display = 'none';
            return;
        }

        const result = await response.json();
        const user = result.data || result.user;

        if (user?.role === 'admin') {
            adminLink.style.display = 'inline-flex';
        } else {
            adminLink.style.display = 'none';
        }

    } catch (error) {
        adminLink.style.display = 'none';
    }
}