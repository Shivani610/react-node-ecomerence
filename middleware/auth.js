const jwt = require("jsonwebtoken")
const Employee = require("./../models/Employee")
const asyncHandler = require("express-async-handler")
const User = require("../models/User")
exports.adminProtected = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization
    // const token = req.cookies.token
    if (!token) {
        return res.status(401).json({
            message: "Please Provide Token"
        })
    }
    // const [, tk] = token.split(" ")
    // console.log(tk, "tk");
    const { id } = jwt.verify(token, process.env.JWT_KEY)
    const result = await Employee.findById(id)
    if (!result) {
        return res.status(401).json({
            message: "con not find user"
        })
    }
    if (result.role !== "admin") {
        return res.status(401).json({

            message: " Admin Only Route,Please grt in touch with admin "
        })
    }
    req.body.employeeId = id
    next()
})
exports.protected = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization
    // console.log("xxxxxx", req.cookies);
    if (!token) {
        return res.status(401).json({
            message: "Please Provide Token"
        })
    }
    const [, tk] = token.split(" ")
    // const { id } = jwt.verify(token, process.env.JWT_KEY)
    const { id } = jwt.verify(tk, process.env.JWT_KEY)
    if (!id) {
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
    const result = await User.findById(id)
    if (!result.active) {
        return res.status(401).json({
            message: "Account is blocked by server"
        })
    }
    req.body.userId = id
    next()
})