const Category = require('../models/Category');
// [GET] /api/categories - Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
 try {
 const categories = await Category.find().sort({ createdAt: -1 });
 res.status(200).json({
 success: true,
 message: 'Lấy danh sách danh mục thành công',
 total: categories.length,
 data: categories
 });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
};
// [POST] /api/categories - Tạo danh mục mới
exports.createCategory = async (req, res) => {
 try {
 const { name, description, image } = req.body;
 if (!name) {
 return res.status(400).json({ success: false, message: 'Vui lòng nhập tên danh mục!'
});
 }
 const slug = name.toLowerCase().replace(/\s+/g, '-');
 const category = await Category.create({ name, slug, description, image });
 res.status(201).json({
 success: true,
 message: 'Tạo danh mục mới thành công',
 data: category
 });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
};
// [DELETE] /api/categories/:id - Xóa danh mục
exports.deleteCategory = async (req, res) => {
 try {
 const category = await Category.findByIdAndDelete(req.params.id);
 if (!category) {
 return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục để xóa!' });
 }
 res.status(200).json({
 success: true,
 message: 'Đã xóa danh mục thành công',
 data: category
 });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
};

// [PUT] /api/categories/:id - Cập nhật danh mục
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục!'
            });
        }

        if (name !== undefined) {
            if (typeof name !== 'string' || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên danh mục không hợp lệ!'
                });
            }

            category.name = name.trim();
            category.slug = name.trim()
                .toLowerCase()
                .replace(/\s+/g, '-');
        }

        if (description !== undefined) {
            category.description = description;
        }

        if (image !== undefined) {
            category.image = image;
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công!',
            data: category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
