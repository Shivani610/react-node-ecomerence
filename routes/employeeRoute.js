const { registerEmployee, getAllEmployees, getSingleEmployees, updateEmployees, deleteEmployees, destroyEmployees, employeeProfile, adminGetAllProducts, adminGetAllUsers, adminUserStatus, adminStat } = require("../controllers/employeeController")
const { adminProtected } = require("../middleware/auth")
const router = require("express").Router()

router
    .get("/", getAllEmployees)
    .get("/detail/:employeeId", getSingleEmployees)
    .get("/admin-products", adminGetAllProducts)
    // .get("/profile", adminProtected, employeeProfile)
    .post("/register", registerEmployee)
    .put("/update/:employeeId", updateEmployees)
    .delete("/delete/:employeeId", deleteEmployees)
    .delete("/destroy", destroyEmployees)


    .get("/users", adminGetAllUsers)
    .get("/stat", adminStat)
    .put("/users/status/:userId", adminUserStatus)
module.exports = router