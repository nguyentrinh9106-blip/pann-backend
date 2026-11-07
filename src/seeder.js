require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB Atlas.');

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    // ====================== 1. TẠO TÀI KHOẢN ======================
    console.log('👥 Đang tạo tài khoản mẫu...');

    await User.create({
      name: 'Quản Trị Viên PÀNN',
      email: 'admin@pann.vn',
      password: 'AdminPassword123@',
      phone: '0388145357',
      role: 'admin'
    });

    await User.create({
      name: 'Khách Hàng Mẫu',
      email: 'khachhang@gmail.com',
      password: 'KhachPassword123@',
      phone: '0987654321',
      role: 'customer'
    });

    console.log('✅ Tài khoản:');
    console.log(' 👑 Admin: admin@pann.vn / AdminPassword123@');
    console.log(' 👤 Customer: khachhang@gmail.com / KhachPassword123@');

    // ====================== 2. TẠO DANH MỤC ======================
    const categories = await Category.insertMany([
      {
        name: 'Chăm sóc da mặt',
        slug: 'cham-soc-da-mat',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500'
      },
      {
        name: 'Chăm sóc tóc',
        slug: 'cham-soc-toc',
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500'
      },
      {
        name: 'Chăm sóc cơ thể',
        slug: 'cham-soc-co-the',
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500'
      },
      {
        name: 'Dưỡng môi',
        slug: 'duong-moi',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f2103256?w=500'
      }
    ]);

    const catMat = categories[0]._id;      // Chăm sóc da mặt
    const catToc = categories[1]._id;      // Chăm sóc tóc
    const catCoThe = categories[2]._id;    // Chăm sóc cơ thể
    const catMoi = categories[3]._id;      // Dưỡng môi

    // ====================== 3. TẠO SẢN PHẨM ======================
    await Product.insertMany([
      // ===== CHĂM SÓC DA MẶT =====
      {
        name: 'Gel rửa mặt tràm trà',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 185000,
        salePrice: 166500,
        stock: 60,
        image: 'images/tram-tra-cica.jpg',
        description: 'Làm sạch sâu bụi bẩn và dầu thừa, hỗ trợ giảm mụn hiệu quả.',
        rating: 4.8,
        isFeatured: false
      },
      {
        name: 'Nước hoa hồng Cocoon',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 175000,
        salePrice: 175000,
        stock: 45,
        image: 'images/Nước hoa hồng Cocoon.jpg',
        description: 'Cân bằng độ pH, làm mềm da và se khít lỗ chân lông.',
        rating: 4.5,
        isFeatured: true
      },
      {
        name: 'Mặt nạ nghệ Hưng Yên',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 325000,
        salePrice: 260000,
        stock: 75,
        image: 'images/Kem dưỡng nghệ Hưng Yên.jpg',
        description: 'Chiết xuất từ nghệ Hưng Yên giúp da sáng mịn và mờ thâm.',
        rating: 4.9,
        isFeatured: true
      },
      {
        name: 'Kem dưỡng ẩm hoa hồng',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 385000,
        salePrice: 327250,
        stock: 40,
        image: 'images/Kem dưỡng ẩm hoa hồng.jpg',
        description: 'Dưỡng ẩm sâu suốt 24h, cho làn da căng mọng.',
        rating: 4.6,
        isFeatured: true
      },
      {
        name: 'Serum bí đao',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 445000,
        salePrice: 400500,
        stock: 30,
        image: 'images/Serum bí đao.jpeg',
        description: 'Kiểm soát dầu thừa và hỗ trợ giảm mụn ẩn.',
        rating: 4.9,
        isFeatured: true
      },
      {
        name: 'Tẩy trang bí đao',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 275000,
        salePrice: 242000,
        stock: 65,
        image: 'images/Tẩy trang bí đao.jpg',
        description: 'Làm sạch sâu cho da dầu mụn mà không gây khô da.',
        rating: 4.8,
        isFeatured: true
      },
      {
        name: 'Mặt nạ bí đao',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 145000,
        salePrice: 145000,
        stock: 100,
        image: 'images/Mặt nạ bí đao.jpg',
        description: 'Làm mát da, giảm sưng viêm và làm dịu các nốt mụn.',
        rating: 4.7,
        isFeatured: false
      },
      {
        name: 'Kem dưỡng nghệ Hưng Yên',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 420000,
        salePrice: 378000,
        stock: 40,
        image: 'images/Kem dưỡng nghệ Hưng Yên.jpg',
        description: 'Cải thiện làn da không đều màu, làm mờ vết thâm.',
        rating: 4.6,
        isFeatured: false
      },
      {
        name: 'Serum sa pô chê phục hồi',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 520000,
        salePrice: 494000,
        stock: 25,
        image: 'images/Serum sa pô chê phục hồi.webp',
        description: 'Phục hồi hàng rào bảo vệ da, chống lão hóa.',
        rating: 4.9,
        isFeatured: true
      },
      {
        name: 'Sữa rửa mặt hoa hồng',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 195000,
        salePrice: 195000,
        stock: 85,
        image: 'images/Sữa rửa mặt hoa hồng.jpg',
        description: 'Làm sạch nhẹ nhàng, phù hợp cho da nhạy cảm.',
        rating: 4.7,
        isFeatured: false
      },
      {
        name: 'Mặt nạ hoa hồng',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 165000,
        salePrice: 165000,
        stock: 110,
        image: 'images/Mặt nạ hoa hồng.jpg',
        description: 'Cấp ẩm tức thì và làm dịu da cháy nắng.',
        rating: 4.6,
        isFeatured: false
      },
      {
        name: 'Kem chống nắng bí đao',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 395000,
        salePrice: 316000,
        stock: 50,
        image: 'images/Kem chống nắng bí đao.jpg',
        description: 'Chống nắng phổ rộng, không gây bóng nhờn.',
        rating: 4.9,
        isFeatured: true
      },
      {
        name: 'Xịt khoáng hoa hồng',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 120000,
        salePrice: 114000,
        stock: 120,
        image: 'images/Xịt khoáng hoa hồng.webp',
        description: 'Duy trì độ ẩm và giữ lớp nền trang điểm lâu trôi.',
        rating: 4.5,
        isFeatured: false
      },
      {
        name: 'Sáp tẩy trang hoa hồng',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 285000,
        salePrice: 242250,
        stock: 35,
        image: 'images/Sáp tẩy trang hoa hồng.jpg',
        description: 'Dạng sáp tan chảy thành dầu giúp sạch sâu lỗ lông.',
        rating: 4.9,
        isFeatured: true
      },
      {
        name: 'Nước tẩy trang bí đao 500ml',
        category: catMat,
        brand: 'PÀNN',
        originalPrice: 345000,
        salePrice: 310500,
        stock: 100,
        image: 'images/Nước tẩy trang bí đao 500ml.jpg',
        description: 'Size lớn tiết kiệm, chuyên dùng cho da dầu mụn.',
        rating: 4.8,
        isFeatured: false
      },

      // ===== CHĂM SÓC TÓC =====
      {
        name: 'Tinh dầu bưởi dưỡng tóc',
        category: catToc,
        brand: 'PÀNN',
        originalPrice: 165000,
        salePrice: 140250,
        stock: 120,
        image: 'images/Tinh dầu bưởi dưỡng tóc.jpg',
        description: 'Tinh dầu vỏ bưởi nguyên chất giúp giảm rụng và kích thích mọc tóc.',
        rating: 4.8,
        isFeatured: true
      },
      {
        name: 'Dầu gội bưởi không sulfate',
        category: catToc,
        brand: 'PÀNN',
        originalPrice: 245000,
        salePrice: 232750,
        stock: 90,
        image: 'images/Dầu gội bưởi không sulfate.jpg',
        description: 'Làm sạch tóc nhẹ nhàng, ngăn ngừa gãy rụng từ gốc.',
        rating: 4.7,
        isFeatured: false
      },
      {
        name: 'Dầu xả bưởi phục hồi',
        category: catToc,
        brand: 'PÀNN',
        originalPrice: 225000,
        salePrice: 213750,
        stock: 70,
        image: 'images/Dầu xả bưởi phục hồi.png',
        description: 'Giúp tóc mềm mượt, dễ chải và giảm xơ rối.',
        rating: 4.5,
        isFeatured: false
      },
      {
        name: 'Nước dưỡng tóc tinh dầu bưởi',
        category: catToc,
        brand: 'PÀNN',
        originalPrice: 95000,
        salePrice: 95000,
        stock: 150,
        image: 'images/Nước dưỡng tóc tinh dầu bưởi.jpg',
        description: 'Dạng xịt tiện lợi, giúp bảo vệ tóc khỏi tia UV.',
        rating: 4.7,
        isFeatured: false
      },
      {
        name: 'Dầu gội bồ kết & sả',
        category: catToc,
        brand: 'PÀNN',
        originalPrice: 215000,
        salePrice: 193500,
        stock: 60,
        image: 'images/Dầu gội bồ kết & sả.jpg',
        description: 'Sản phẩm truyền thống giúp tóc đen mượt tự nhiên.',
        rating: 4.8,
        isFeatured: false
      },
      {
        name: 'Dầu gội bưởi phiên bản mới',
        category: catToc,
        brand: 'PÀNN',
        originalPrice: 265000,
        salePrice: 251750,
        stock: 80,
        image: 'images/Dầu gội bưởi phiên bản mới.webp',
        description: 'Công thức cải tiến giúp mọc tóc nhanh hơn.',
        rating: 4.7,
        isFeatured: false
      },

      // ===== CHĂM SÓC CƠ THỂ =====
      {
        name: 'Tẩy tế bào chết cà phê Đắk Lắk',
        category: catCoThe,
        brand: 'PÀNN',
        originalPrice: 125000,
        salePrice: 125000,
        stock: 100,
        image: 'images/tẩy tbc.jpg',
        description: 'Hạt cà phê Đắk Lắk xay nhuyễn hòa quyện trong bơ ca cao giúp làm sạch da chết cơ thể.',
        rating: 4.9,
        isFeatured: true
      },
      {
        name: 'Sữa tắm khuynh diệp & bạc hà',
        category: catCoThe,
        brand: 'PÀNN',
        originalPrice: 195000,
        salePrice: 195000,
        stock: 55,
        image: 'images/Sữa tắm khuynh diệp & bạc hà.jpg',
        description: 'Mang lại cảm giác sảng khoái và thư giãn sau ngày dài.',
        rating: 4.8,
        isFeatured: false
      },
      {
        name: 'Bơ dưỡng thể hạt ca cao',
        category: catCoThe,
        brand: 'PÀNN',
        originalPrice: 215000,
        salePrice: 204250,
        stock: 50,
        image: 'images/Bơ dưỡng thể hạt ca cao.jpg',
        description: 'Cung cấp độ ẩm cực cao cho làn da khô ráp.',
        rating: 4.8,
        isFeatured: false
      },
      {
        name: 'Gel tắm hoa hồng',
        category: catCoThe,
        brand: 'PÀNN',
        originalPrice: 225000,
        salePrice: 202500,
        stock: 40,
        image: 'images/Gel tắm hoa hồng.jpg',
        description: 'Hương thơm dịu nhẹ từ hoa hồng hữu cơ.',
        rating: 4.8,
        isFeatured: false
      },
      {
        name: 'Nước rửa tay khuynh diệp',
        category: catCoThe,
        brand: 'PÀNN',
        originalPrice: 85000,
        salePrice: 85000,
        stock: 200,
        image: 'images/Nước rửa tay khuynh diệp.jpg',
        description: 'Kháng khuẩn tự nhiên và mềm mại cho da tay.',
        rating: 4.6,
        isFeatured: false
      },

      // ===== DƯỠNG MÔI =====
      {
        name: 'Son dưỡng dầu dừa Bến Tre',
        category: catMoi,
        brand: 'PÀNN',
        originalPrice: 35000,
        salePrice: 35000,
        stock: 200,
        image: 'images/son dưỡng.webp',
        description: 'Dầu dừa Bến Tre kết hợp với bơ hạt mỡ giúp đôi môi mềm mượt.',
        rating: 4.6,
        isFeatured: false
      },
      {
        name: 'Scrub môi cà phê',
        category: catMoi,
        brand: 'PÀNN',
        originalPrice: 75000,
        salePrice: 67500,
        stock: 90,
        image: 'images/Scrub môi cà phê.jpg',
        description: 'Lấy đi tế bào chết giúp môi hồng hào tự nhiên.',
        rating: 4.8,
        isFeatured: true
      },
      {
        name: 'Dưỡng môi sáp ong',
        category: catMoi,
        brand: 'PÀNN',
        originalPrice: 45000,
        salePrice: 45000,
        stock: 300,
        image: 'images/Dưỡng môi sáp ong.jpg',
        description: 'Khóa ẩm và bảo vệ môi khỏi nứt nẻ.',
        rating: 4.7,
        isFeatured: false
      }
    ]);

    console.log('🎉 Nạp dữ liệu PÀNN Mỹ phẩm thuần chay hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seeder:', error);
    process.exit(1);
  }
};

seedData();