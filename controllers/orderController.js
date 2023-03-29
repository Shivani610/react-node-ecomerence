const Product = require("../models/Product")
const User = require("../models/User")
const Order = require("../models/Order")
const asyncHandler = require("express-async-handler")
const Cart = require("../models/Cart")
const Razorpay = require("razorpay")
const { v4: uuid } = require("uuid")
const crypto = require("crypto")
const { sendEmail } = require("../utils/email")
const { orderRecipt } = require("../utils/emailTempletes")
const { format } = require("date-fns")

exports.placeOrder = asyncHandler(async (req, res) => {
    const { userId, type } = req.body
    if (!type) {
        return res.status(400).json({
            message: "please provide type"
        })
    }
    let productArray
    if (type === "buynow") {
        productArray = [{
            productId: req.body.productId,
            qty: req.body.qty
        }]

    } else {
        const cartItems = await Cart.findOne({ userId })
        await Cart.deleteOne({ userId })
        productArray = cartItems.products

    }
    const result = await Order.create({
        userId,
        products: productArray,
        paymentMode: "cod"
    })

    res.json({
        message: "order Placed Successfully",
        result
    })
})
exports.getUserOrders = asyncHandler(async (req, res) => {
    const result = await Order
        .find({ userId: req.body.userId })
        // .populate("userId")                  // used to get all information about specific userId
        .populate({
            path: "products",
            populate: {
                path: "productId",
                model: "product"
            }
        })
        .select(" -createdAt -__v -updatedAt")
    // console.log(result);
    res.json({
        message: "user order feched Successfully",
        count: result.length,
        result
    })
})
exports.userCancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const result = await Order.findByIdAndUpdate(orderId, { orderStatus: "cancel" })
    res.json({
        message: "order canceled Successfully",
        result
    })
})
exports.destroyOrders = asyncHandler(async (req, res) => {
    await Order.deleteMany()
    res.json({
        message: " all Orders  deleted successfully"
    })
})
exports.orderPayment = asyncHandler(async (req, res) => {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET
    })
    instance.orders.create({
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: uuid()
    }, (err, order) => {
        if (err) {
            return res.status(400).json({
                message: "Order Fail" + err
            })
        }
        res.json({
            message: "Payment Initiated",
            order
        })
    })
})
exports.verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const key = `${razorpay_order_id}|${razorpay_payment_id}`

    const expectedSignature = crypto
        .createHmac("sha256", `${process.env.RAZORPAY_SECRET}`)
        .update(key.toString())
        .digest('hex')

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
            message: "Invalid Payment, Signiture mismatch"
        })
    }
    const { userId, type } = req.body
    const user = await User.findOne({ _id: userId })
    let cartItems, result, productDetails, formatedCartItems, total
    if (type === "cart") {
        cartItems = await Cart.findOne({ userId })


        productDetails = await Cart.findOne({ userId: req.body.userId })
            .populate("products.productId", " -createdAt -__v -updatedAt -stock -employeeId")
            .select(" -createdAt -__v -updatedAt  -_id -userId").lean()
        formatedCartItems = productDetails.products.map(p => {
            return {
                ...p.productId,
                qty: p.qty
            }
        })
        // console.log(formatedCartItems, "formatedCartItems")

        total = formatedCartItems.reduce((sum, rate) => sum + rate.price * rate.qty, 0)


        await Cart.deleteOne({ userId })

    } else if (type === "buynow") {
        cartItems = {
            products: [{
                productId: req.body.productId,
                qty: req.body.qty
            }]
        }
        const p = await Product.findOne({ _id: req.body.productId })
        total = p.price * req.body.qty
        formatedCartItems = [{
            name: p.name,
            price: p.price,
            qty: req.body.qty
        }]
    }

    result = await Order.create({
        userId,
        products: cartItems.products,
        paymentMode: "online",
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentSignature: razorpay_signature
    })
    sendEmail({
        sendTo: user.email,
        sub: "Order Placed Successfully",
        htmlMsg: orderRecipt({
            userName: user.name,
            date: format(Date.now(), "dd-MM-yyyy"),
            orderId: result.id,
            products: formatedCartItems,
            total

        }),
        msg: `
    Thank You for Your Order \n
    Order Id : ${result._id} \n
    Payment Status : Paid \n
    Payment Mode : online \n
    Payment Id:${result.paymentId}
    `
    })
    res.json({
        message: "payment success"
    })

})
