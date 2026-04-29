import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./lib/db"
import cookieParser from "cookie-parser"
import authRoute from "./routes/authRoute"
import userRoute from "./routes/userRoute"
import chatRoute from "./routes/chatRoute"
import groupRoute from "./routes/groupRoute"
import cors from "cors"

dotenv.config()

const PORT = process.env.PORT

const app = express()

app.use(express.json()); // 👈 Fixes the undefined req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/chat", chatRoute)
app.use("/api/group", groupRoute)

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`)
    connectDB()
})