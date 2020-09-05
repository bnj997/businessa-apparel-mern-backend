const express = require('express');
const { check } = require('express-validator')

const cartsController = require('../controllers/carts-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();
router.use(checkAuth);

router.get('/:uid', cartsController.getCartByUser);
router.patch('/:uid', cartsController.addToCart);
router.patch('/:uid/:gid', cartsController.removeFromCart);


module.exports = router;