const express = require("express")
require("dotenv").config({ path: "./.env" })
const cors = require("cors")
const mongoose = require("mongoose")
// const 

const connectDB = require("./config/db")
const { log, logEvent } = require("./middleware/logger")
const { format } = require("date-fns")
const { errorHandler } = require("./middleware/error")
const { path } = require("path")
connectDB()
const app = express()
const cookieParser = require("cookie-parser")
const { adminProtected } = require("./middleware/auth")
app.use(express.json())
app.use(express.static("public"))
// app.use(express.static(path.join(__dirname, "public")))
app.use(log)
app.use(cookieParser())

app.use(cors({
    credentials: true,
    origin: (o, cb) => {
        const allowed = [
            "http://localhost:3000",
            // "http://localhost:5000",
            "http://localhost:5173",
            "https://www.google.com",
            // "https://www.google.com/"
        ]
        if (allowed.indexOf(o) !== -1 || !o) {
            cb(null, true)
        } else {
            cb("blocked by cors")
        }
    }
}))
app.use("/cart", require("./routes/cartRoute"))
app.use("/order", require("./routes/orderRoute"))
app.use("/user", require("./routes/userRoute"))
app.use("/employee", adminProtected, require("./routes/employeeRoute"))
app.use("/auth", require("./routes/authRoute"))
app.use("/products", require("./routes/productRoute"))
app.use("*", (req, res) => {
    res.status(400).json({
        message: "404:resourse you are lokking for is not available"
    })
})
app.use(errorHandler)
const PORT = process.env.PORT || 5000

mongoose.connection.once("open", () => {
    app.listen(PORT, console.log(`SEVER RUNNING http://localhost:${PORT} `))
    console.log("mongo connected");
})

mongoose.connection.on("error", err => {
    const msg = `${format(new Date(), "dd-MM-yyyy \t HH:mm:ss")}\t${err.code}\t${err.name}`
    logEvent({
        fileName: "mongo.log",
        message: msg
    })
})