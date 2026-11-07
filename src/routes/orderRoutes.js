const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  updateOrderToPaid,
  updateOrderToDelivered
} = require('../controllers/orderController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

// User đã đăng nhập
router.post('/', createOrder);
router.get('/myorders', protect, getMyOrders);

// Admin
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/pay', protect, adminOnly, updateOrderToPaid);
router.put('/:id/deliver', protect, adminOnly, updateOrderToDelivered);

module.exports = router;