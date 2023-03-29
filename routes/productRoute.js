const { addProduct, getAllProducts, deleteProducts, destroyProduct, getsingleProducts, updateProductImages, updateProductData } = require("../controllers/productController")
const { adminProtected } = require("../middleware/auth")

const router = require("express").Router()

router
    .get("/", getAllProducts)
    .post("/add-product", adminProtected, addProduct)
    // .get("/single/:productId", getsingleProducts)
    .get("/single/:productId", getsingleProducts)
    .delete("/delete/:productId", deleteProducts)
    .delete("/destroy", destroyProduct)
    // .delete("/add-product", adminProtected, addProduct)
    .put("/update-product/:productId", updateProductData)
// .put("/update-product-image/:productId", updateProductImages)

module.exports = router