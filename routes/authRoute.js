const { loginUser, loginEmolpyee, continueWithGoogle, forgetPassword, resetPassword } = require("../controllers/authController")
const { loginLimiter } = require("../middleware/limiter")

const router = require("express").Router()


router.post("/user/login", loginLimiter, loginUser)
router.post("/user/login-with-google", loginLimiter, continueWithGoogle)
router.post("/employee/login", loginLimiter, loginEmolpyee)
router.post("/user/forget-password", forgetPassword)
router.put("/user/reset-password/:id", resetPassword)

module.exports = router