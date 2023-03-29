const { registerUser, getAllUsers, editUser, getSingleUser, destroyUsers, deleteUser, getUserProfile } = require("../controllers/userController")
const { protected } = require("../middleware/auth")
const router = require("express").Router()

router
    .get("/", getAllUsers)
    .get("/profile", protected, getUserProfile)
    .post("/add", registerUser)
    .put("/profile-update/", protected, editUser)
    .delete("/delete/:id", deleteUser)
    .delete("/destroy", destroyUsers)
    .get("/:id", getSingleUser)
module.exports = router