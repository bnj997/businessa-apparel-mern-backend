const express = require('express');
const { check } = require('express-validator')

const ordersController = require('../controllers/orders-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();
router.use(checkAuth);

// router.get('/', ordersController.getAllOrders);
// router.get('/:hid', ordersController.getOrdersByHQ);
router.post('/', ordersController.createOrder);


module.exports = router;