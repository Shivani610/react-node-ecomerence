
const asyncHandler = require("express-async-handler")
const { productUpload } = require("../utils/upload")
const Product = require("./../models/Product")
const jwt = require("jsonwebtoken")
const path = require("path")
const fs = require("fs").promises


exports.addProduct = asyncHandler(async (req, res) => {

    // console.log(req.files);
    productUpload(req, res, async err => {
        const { id } = jwt.verify(req.headers.authorization, process.env.JWT_KEY)
        req.body.employeeId = id
        const { name, brand, category, desc, price, stock, employeeId } = req.body
        if (!name || !brand || !category || !desc || !price || !stock || !employeeId) {
            return res.status(400).json({
                message: "All feilds required"
            })
        }
        if (err) {
            return res.status(400).json({
                message: "multer error" + err
            })
        }
        const fileNames = []
        for (let i = 0; i < req.files.length; i++) {
            // assets/images/products
            fileNames.push(`assets/images/products/${req.files[i].filename}`)
        }
        const result = await Product.create({
            ...req.body,
            image: fileNames
        })
        // console.log({
        //     ...req.body,
        //     image: fileNames
        // })
        res.json({
            message: "product added successfully",
            result
        })
    })
})

exports.getAllProducts = asyncHandler(async (req, res) => {
    const result = await Product.find({ publish: true }).select("-employeeId -createdAt -__v -updatedAt")
    if (!result) {
        return res.status(400).json({
            message: "invalid Product id"
        })
    }
    // console.log(result, "res")
    res.json({
        message: " All product fetched success",
        result: {
            data: result,
            count: result.length
        }
    })
})
exports.getsingleProducts = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const result = await Product.findById(productId).select("-employeeId -createdAt -__v -updatedAt")
    if (!result) {
        return res.status(400).json({
            message: "invalid product id"
        })
    }
    res.json({
        message: `producr with id ${productId}  fetched successfully`,
        result


    })
})

exports.deleteProducts = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const result = await Product.findOne({ _id: productId })
    if (!result) {
        return res.status(400).json({
            message: "invalid product id"
        })
    }
    await Product.findByIdAndDelete(productId)
    res.json({
        message: " product deleted successfully"
    })
})
exports.destroyProduct = asyncHandler(async (req, res) => {
    await Product.deleteMany()
    // await fs.unlink(path.join(__dirname, "..", "public"))
    res.json({
        message: " all product  deleted successfully"
    })
})

exports.updateProductData = asyncHandler(async (req, res) => {

    const { productId } = req.params
    const singleProduct = await Product.findById(productId)
    if (!singleProduct) {
        return res.status(400).json({
            message: "invalid user Id"
        })
    }

    productUpload(req, res, async err => {
        if (err) {
            return res.status(400).json({
                message: "multor err" + err
            })
        }

        let filenames = []
        for (let i = 0; i < req.files.length; i++) {
            filenames.push(`assets/images/products/${req.files[i].filename}`)
        }
        if (filenames.length > 0) {
            for (let i = 0; i < singleProduct.image.length; i++) {
                await fs.unlink(path.join(__dirname, "..", "public", singleProduct.image[i]))
            }
        } else {
            filenames = singleProduct.image
        }
        const result = await Product.findByIdAndUpdate(productId, {
            ...req.body,
            image: filenames
        }, { new: true })
        return res.json({
            message: "product image update successfully",
            result
        })
    })
})

// exports.updateProductImages = asyncHandler(async (req, res) => {
//     const { productId } = req.params
//     const singleProduct = await Product.findById(productId)
//     if (!singleProduct) {
//         return res.status(400).json({
//             message: "invalid Product id"
//         })
//     }
//     productUpload(req, res, async err => {
//         if (err) {
//            return res.status(400).json({
//                 message: "Multer Error" + err
//             })
//         }
//         for (let i = 0; i < singleProduct.image.length; i++) {

//             await fs.unlink(path.join(__dirname, "..", "public", singleProduct.image[i]));
//         }
//         // singleProduct.image.forEach(item => {
//         //     fs.unlinkSync(path.join(__dirname, "..", "public", item));
//         // })
//         const fileNames = []
//         for (let i = 0; i < req.files.length; i++) {
//             // assets/images/products
//             fileNames.push(`assets/images/products/${req.files[i].filename}`)
//         }
//         const result = await Product.findByIdAndUpdate(productId, { image: fileNames }, { new: true })
//     })
//     res.json({ message: "OK" })
// })
// exports.updateProductImages = asyncHandler(async (req, res) => {
//     const { productId } = req.params
//     // console.log(req.files, "files");
//     const singleProduct = await Product.findById(productId)
//     // console.log(singleProduct, "singleProduct");
//     if (!singleProduct) {
//         return res.status(400).json({
//             message: "Invalid Product Id"
//         })
//     }

//     productUpload(req, res, async err => {
//         if (err) {
//             console.log(err);
//             return res.status(400).json({

//                 message: "Multer Error " + err
//             })
//         }


//         let fileNames = []
//         for (let i = 0; i < req.files.length; i++) {
//             fileNames.push(`assets/images/products/${req.files[i].filename}`)
//         }
//         if (fileNames.length > 0) {
//             for (let i = 0; i < singleProduct.image.length; i++) {
//                 await fs.unlink(path.join(__dirname, "..", "public", singleProduct.image[i]))
//             }
//         } else {
//             fileNames = singleProduct.image
//         }


//         const result = await Product.findByIdAndUpdate(productId, {
//             ...req.body,
//             image: fileNames
//         }, { new: true })

//         res.json({
//             message: "ok",
//             result
//         })


//     })


// })