const { addToCart, getCartData, destroyCart, removeSingleCartItem, emptyCart } = require("../controllers/cartController")
const { protected } = require("../middleware/auth")

const router = require("express").Router()

router

    .get("/cart-history", protected, getCartData)
    .post("/add-to-cart", protected, addToCart)
    .delete("/cart-remove-single/:productId", protected, removeSingleCartItem)
    .delete("/empty-cart", protected, emptyCart)
    .delete("/destroy-cart", protected, destroyCart)
module.exports = router