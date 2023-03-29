
const Cart = require("../models/Cart")
const asyncHandler = require("express-async-handler")

exports.addToCart = asyncHandler(async (req, res) => {
    const { qty, productId } = req.body
    if (!qty || !productId) {
        return res.status(400).json({
            message: "All Field Required",
        })
    }
    // console.log(req.body);
    const cartItems = await Cart.findOne({ userId: req.body.userId })
    if (cartItems) {
        const index = cartItems.products.findIndex(p => p.productId.toString() === req.body.productId)
        if (index >= 0) {
            cartItems.products[index].qty = req.body.qty
        } else {
            cartItems.products.push(req.body)
        }
        const result = await Cart.findByIdAndUpdate(cartItems._id, cartItems, { new: true })
        console.log(result);
        res.json({
            message: " Cart Updated Successfully",
            // result
        })
    } else {
        const cartItem = {
            userId: req.body.userId,
            products: [req.body]
        }
        const result = await Cart.create(cartItem)
        console.log(result);
        res.json({
            message: "Product Added To Cart Successfully",
            result
        })
    }
})

exports.getCartData = asyncHandler(async (req, res) => {

    const result = await Cart.findOne({ userId: req.body.userId })
        .populate("products.productId", " -createdAt -__v -updatedAt -stock -employeeId")
        .select(" -createdAt -__v -updatedAt  -_id -userId").lean()
    // console.log("xxxxxxxx", result);
    if (!result) {
        return res.json({
            message: "Cart Is Empty",
            result: []
        })
    }
    const formatedCartItems = result.products.map(p => {
        return {
            ...p.productId,
            qty: p.qty
        }
    })

    res.json({
        message: "Product fetched from Cart Successfully",
        result: formatedCartItems
    })
})
exports.removeSingleCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const { userId } = req.body
    const result = await Cart.findOne({ userId })
    const index = result.products.findIndex(item => item.productId.toString() === productId)
    result.products.splice(index, 1)
    const x = await Cart.findByIdAndUpdate(result._id, result, { new: true })
    console.log(x);
    res.json({
        message: " selected cart item  deleted successfully",
        x
    })
})
exports.emptyCart = asyncHandler(async (req, res) => {
    const { userId } = req.body
    const result = await Cart.deleteOne({ userId })
    res.json({
        message: " all cart  deleted successfully",
        result
    })
})
exports.destroyCart = asyncHandler(async (req, res) => {
    await Cart.deleteMany()
    res.json({
        message: " all cart  deleted successfully"
    })
})