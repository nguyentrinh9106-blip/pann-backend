// js/chatbot.js - ĐÃ CÓ CHỨC NĂNG CHẶN CÂU HỎI NGOÀI LỀ

const GEMINI_API_KEY = window.GEMINI_API_KEY || "";
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwkXU7t8BOqjFa1SpnaiCOhQFBPAWRgzH0ymwUJTw-7Xv9G89g1b2uXUaX8_xDRppitRw/exec";

// Database sản phẩm
const PRODUCT_DATABASE = [
    { id: "NTT001", name: "Nước tẩy trang hoa hồng", price: 150000, skin: ["da khô", "da thường", "da nhạy cảm"] },
    { id: "SRM002", name: "Serum phục hồi da hoa cúc", price: 280000, skin: ["da nhạy cảm", "da khô", "da tổn thương"] },
    { id: "KEM003", name: "Kem dưỡng ẩm trà xanh", price: 220000, skin: ["da dầu", "da mụn", "da hỗn hợp"] },
    { id: "MAT004", name: "Mặt nạ đất sét detox", price: 120000, skin: ["da dầu", "da mụn"] },
    { id: "TON005", name: "Nước hoa hồng hoa nhài", price: 180000, skin: ["da khô", "da lão hóa"] },
    { id: "OIL006", name: "Dầu dưỡng rosehip", price: 320000, skin: ["da khô", "da lão hóa"] }
];

// Danh sách từ khóa ngoài lề (có thể mở rộng)
const OFF_TOPIC_KEYWORDS = [
    "thời tiết", "chính trị", "tổng thống", "bầu cử", "covid", "bệnh", "chữa bệnh", 
    "học hành", "tình yêu", "công việc", "giá vàng", "tiền bitcoin", "hỏi riêng", 
    "cuộc sống", "triết lý", "xã hội", "tin tức", "bóng đá"
];

function initChatbot() {
    const chatbotHTML = `
    <div id="chatbot-wrapper" style="position: fixed; bottom: 30px; right: 30px; z-index: 99999;">
        <button id="chatbot-toggle" style="width: 65px; height: 65px; border-radius: 50%; background: #4a5d23; border: none; color: white; font-size: 28px; cursor: pointer; box-shadow: 0 5px 20px rgba(74,93,35,0.4);">
            💬
        </button>
        
        <div id="chatbot-container" style="display: none; width: 360px; height: 480px; background: white; border-radius: 20px; position: absolute; bottom: 80px; right: 0; box-shadow: 0 10px 40px rgba(0,0,0,0.25); flex-direction: column; overflow: hidden;">
            <div style="background: #4a5d23; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <strong>Trợ lý PÀNN 🌿</strong>
                <button id="chatbot-close" style="background:none; border:none; color:white; font-size:28px; cursor:pointer;">×</button>
            </div>
            
            <div id="chatbot-messages" style="flex:1; padding:15px; overflow-y:auto; background:#fdfdf0; display:flex; flex-direction:column; gap:10px;"></div>
            
            <div style="padding:12px; border-top:1px solid #eee; background:white; display:flex; gap:8px;">
                <input type="text" id="chatbot-input" placeholder="Hỏi về sản phẩm hoặc làn da..." 
                       style="flex:1; padding:12px; border:1px solid #ddd; border-radius:25px; outline:none;">
                <button id="chatbot-send" style="background:#4a5d23; color:white; border:none; width:50px; border-radius:50%; cursor:pointer;">➤</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const toggleBtn = document.getElementById('chatbot-toggle');
    const container = document.getElementById('chatbot-container');
    const closeBtn = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const messages = document.getElementById('chatbot-messages');

    toggleBtn.addEventListener('click', () => {
        container.style.display = (container.style.display === 'none' || container.style.display === '') ? 'flex' : 'none';
        if (container.style.display === 'flex') input.focus();
    });

    closeBtn.addEventListener('click', () => { container.style.display = 'none'; });

    // === HÀM GỬI TIN NHẮN CHÍNH (GIỮ NGUYÊN ĐOẠN BẠN YÊU CẦU) ===
    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;

        appendMsg('user', text);
        input.value = "";
        saveChatToGoogleSheet("Khách", text);

        const loadingDiv = appendMsg('bot', "PÀNN đang suy nghĩ... 🌿");
        const lowerText = text.toLowerCase();

        // 1. Trả lời nhanh bằng từ khóa (GIỮ NGUYÊN)
        if (lowerText.includes("xin chào") || lowerText.includes("hi") || lowerText.includes("hello")) {
            loadingDiv.innerHTML = "Xin chào bạn yêu! 🌸 PÀNN có thể tư vấn sản phẩm thuần chay phù hợp với làn da của bạn.";
            saveChatToGoogleSheet("Bot", loadingDiv.innerHTML);
            return;
        }

        // === MỚI: KIỂM TRA CÂU HỎI NGOÀI LỀ ===
        const isOffTopic = OFF_TOPIC_KEYWORDS.some(keyword => lowerText.includes(keyword));
        
        if (isOffTopic) {
            loadingDiv.innerHTML = "Dạ PÀNN chỉ chuyên tư vấn về mỹ phẩm thuần chay và chăm sóc da ạ. Bạn hỏi mình về sản phẩm hoặc làn da được không ạ? 🌿";
            saveChatToGoogleSheet("Bot", loadingDiv.innerHTML);
            return;
        }

        // 2. Trả lời về danh mục / sản phẩm
        if (lowerText.includes("danh mục") || lowerText.includes("sản phẩm") || lowerText.includes("có gì")) {
            let list = PRODUCT_DATABASE.map(p => `• ${p.name} - ${p.price.toLocaleString()}đ`).join('<br>');
            loadingDiv.innerHTML = `Danh mục sản phẩm PÀNN:<br>${list}`;
            saveChatToGoogleSheet("Bot", loadingDiv.innerHTML);
            return;
        }

        // Tìm sản phẩm cụ thể
        const product = PRODUCT_DATABASE.find(p => lowerText.includes(p.name.toLowerCase()));
        if (product) {
            loadingDiv.innerHTML = `<strong>${product.name}</strong><br>Giá: <strong>${product.price.toLocaleString()}đ</strong><br>Phù hợp da: ${product.skin.join(", ")}`;
            saveChatToGoogleSheet("Bot", loadingDiv.innerHTML);
            return;
        }

        // Tư vấn theo loại da
        if (lowerText.includes("da khô")) {
            loadingDiv.innerHTML = "Với làn da khô PÀNN khuyên dùng:<br>• Nước tẩy trang hoa hồng<br>• Dầu dưỡng rosehip 🌸";
            saveChatToGoogleSheet("Bot", loadingDiv.innerHTML);
            return;
        }
        if (lowerText.includes("da dầu") || lowerText.includes("da mụn")) {
            loadingDiv.innerHTML = "Với da dầu / da mụn:<br>• Kem dưỡng ẩm trà xanh<br>• Mặt nạ đất sét detox 💚";
            saveChatToGoogleSheet("Bot", loadingDiv.innerHTML);
            return;
        }

        // Gọi Gemini (dự phòng)
        try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const prompt = `Bạn là trợ lý PÀNN. Chỉ trả lời về mỹ phẩm và chăm sóc da. Nếu ngoài chủ đề thì khéo léo từ chối. Câu hỏi: "${text}"`;

            const response = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Bạn cho mình biết thêm về làn da để tư vấn chính xác hơn nhé! 🌿 hoặc bạn có thể để lại số điện thoại để mình tư vấn trực tiếp ạ";
            loadingDiv.innerHTML = reply.replace(/\n/g, "<br>");
            saveChatToGoogleSheet("Bot", reply);
        } catch (e) {
            loadingDiv.innerHTML = "Dạ PÀNN chỉ hỗ trợ tư vấn sản phẩm và chăm sóc da thôi ạ 💚";
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function appendMsg(role, text) {
        const div = document.createElement('div');
        div.innerHTML = text;
        div.style.cssText = role === 'user' 
            ? "align-self: flex-end; background: #4a5d23; color: white; padding: 10px 14px; border-radius: 18px 18px 4px 18px; max-width: 80%;"
            : "align-self: flex-start; background: #e8efaa; color: #333; padding: 10px 14px; border-radius: 18px 18px 18px 4px; max-width: 80%;";
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }

    async function saveChatToGoogleSheet(sender, msg) {
        try {
            await fetch(GOOGLE_SHEET_API_URL, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify({ sender, message: msg })
            });
        } catch (err) {}
    }
}

document.addEventListener('DOMContentLoaded', initChatbot);