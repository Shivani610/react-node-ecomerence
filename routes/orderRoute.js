const { placeOrder, getUserOrders, userCancelOrder, destroyOrders, orderPayment, verifyPayment, paymentFailOrder } = require("../controllers/orderController")
const { protected } = require("../middleware/auth")


const router = require("express").Router()

router
    .post("/order-place", protected, placeOrder)
    .get("/order-history", protected, getUserOrders)
    .put("/order-cancel/:orderId", protected, userCancelOrder)
    .delete("/order-destroy", destroyOrders)
    .post("/payment", orderPayment)
    .post("/payment/verify", protected, verifyPayment)

module.exports = router