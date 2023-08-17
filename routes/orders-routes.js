const express = require("express");
const ordersController = require("../controllers/orders-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.post("/enquiry", ordersController.sendEnquiry);
router.use(checkAuth);
router.post("/makeorder/:oid", ordersController.sendOrder);
router.get("/user/:uid", ordersController.getOrdersByUser);
router.get("/:oid", ordersController.getOrderByID);
router.delete("/:oid", ordersController.deleteOrder);
router.get("/", ordersController.getOrders);
router.post("/", ordersController.createOrder);

module.exports = router;
