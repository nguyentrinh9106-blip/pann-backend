
const express = require('express');
const router = express.Router();

const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const { protect, adminOnly } =
    require('../middlewares/authMiddleware');

// Mọi người đều được xem danh mục
router.get('/', getCategories);

// Chỉ Admin được thêm, sửa, xóa
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
