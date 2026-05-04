import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import chatRoute from "./routes/chatRoute";
import groupRoute from "./routes/groupRoute";
import cors from "cors";

dotenv.config();

const app = express();

// ✅ PORT FIX
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS FIX (handles both local + deployed frontend)
app.use(cors({
  origin: "https://streamifychatyyyy.netlify.app",
  credentials: true,
}));

// ✅ Test route (so "/" doesn’t break)
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/group", groupRoute);

// ✅ Start server AFTER DB connects
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server is running on Port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// ✅ Optional: crash debugging (very useful in production)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});