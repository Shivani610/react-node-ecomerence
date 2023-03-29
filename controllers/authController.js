const User = require("./../models/User")
const Employee = require("./../models/Employee")

const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Cart = require("../models/Cart")

const { OAuth2Client } = require("google-auth-library")
const { sendEmail } = require("../utils/email")
exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(401).json({
            message: "All feilds required"
        })
    }
    const result = await User.findOne({ email }).lean()
    if (!result) {
        return res.status(401).json({
            message: "email is not registered with us "
        })
    }
    if (!result.active) {
        return res.status(401).json({
            message: "your account is blocked by server "
        })
    }
    const verify = await bcrypt.compare(password, result.password)
    if (!verify) {
        return res.status(401).json({
            message: "email or password wrong "
        })
    }
    const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "1d" })
    // const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "15m" })


    res.cookie("user", token, {
        // httpOnly: true,
        // secure: true,
        // maxAge: 1000 * 60 * 15
    })
    const cart = await Cart.find({ userId: result._id })
    res.json({
        message: "Login Success",
        result: {
            name: result.name,
            email: result.email,
            // id: result._id,
            // admin: result.isAdmin,
            // ...result,
            cart,
            token
        }
    })
})
// exports.loginEmolpyee = asyncHandler(async (req, res) => {
//     const { email, password } = req.body
//     if (!email || !password) {
//         return res.status(401).json({
//             message: "All feilds required"
//         })
//     }
//     const result = await Employee.findOne({ email })
//     if (!result) {
//         return res.status(401).json({
//             message: "email is not registered with us "
//         })
//     }
//     const verify = await bcrypt.compare(password, result.password)
//     if (!verify) {
//         return res.status(401).json({
//             message: "email or password wrong "
//         })
//     }
//     if (!result.active) {
//         return res.status(401).json({
//             message: "Account Is Blocked. Get in touch with admin"
//         })
//     }
//     const token = jwt.sign({ id: result._id }, process.env.JWT_KEY)
//     // const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "15m" })
//     res.json({
//         message: "Login Success",
//         result: {
//             name: result.name,
//             email: result.email,
//             id: result._id,
//             // ...result,
//             token
//         }
//     })
// })
exports.loginEmolpyee = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(401).json({
            message: "All feilds required"
        })
    }
    const result = await Employee.findOne({ email })
    // console.log(result, "eelre");
    if (!result) {
        return res.status(401).json({
            message: "email is not registered with us "
        })
    }
    const verify = await bcrypt.compare(password, result.password)
    if (!verify) {
        return res.status(401).json({
            message: "email or password wrong "
        })
    }
    const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "1d" })
    // res.cookie("token", token, {
    //     maxAge: 1000,
    //     httpOnly: true,
    //     // secure:true
    // })
    if (result.role === "admin") {
        return res.json({
            message: "Login Success",
            result: {
                name: result.name,
                email: result.email,
                id: result._id,
                token
            }
        })
    } else {
        res.json({
            message: "u are not admin "
        })
    }
    if (!result.active) {
        return res.status(401).json({
            message: "Account Is Blocked. Get in touch with admin"
        })
    }
    // const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "15m" })

})

exports.continueWithGoogle = asyncHandler(async (req, res) => {
    const { tokenId } = req.body
    if (!tokenId) {
        return res.status(400).json({
            message: "Provide Token Id"
        })
    }
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const { payload: { name, email, picture } } = await googleClient.verifyIdToken({
        idToken: tokenId
    })


    const result = await User.findOne({ email }).lean()

    if (result) {
        if (!result.active) {
            return res.status(401).json({
                message: "Your account is bloked by server."
            })
        }
        //login
        const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "1d" })
        const cart = await Cart.find({ userId: result._id })
        res.json({
            message: "Login Success",
            result: {
                ...result,
                cart,
                token
            }
        })
    } else {
        const password = await bcrypt.hash(Date.now().toString(), 10)
        const user = {
            name,
            email,
            password
        }

        const result = await User.create(user).lean()
        const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "1d" })
        res.json({
            message: "user Login Success",
            result: {
                ...result,
                cart: [],
                token
            }
        })
    }





})
exports.forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    const result = await User.findOne({ email })
    // console.log(email);
    // console.log(result);
    if (result) {
        sendEmail({
            sendTo: email,
            sub: `Reset Password`,
            msg: `http://localhost:3000/reset-password/${result._id}`
        })
        res.json({
            message: "Login Success",

        })
    }
    return res.status(401).json({
        message: "failed",

    })

})
exports.resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body
    const { id } = req.params
    const result = await User.findOne({ _id: id })
    const hashPass = await bcrypt.hash(password, 10)
    if (result) {
        const updatedUser = await User.findByIdAndUpdate(result._id, { password: hashPass })
        return res.json({
            message: "reset Success",
            updatedUser
        })
    }
    return result.status(401).json({
        message: "failed",

    })

})