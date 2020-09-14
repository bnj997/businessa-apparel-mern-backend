const express = require('express');
const { check } = require('express-validator')

const orderLinesController = require('../controllers/order-lines-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();
router.use(checkAuth);

// router.get('/:oid', orderLinesController.getOrderlinesByOrder);
router.post('/:oid', orderLinesController.createOrderline);


module.exports = router;