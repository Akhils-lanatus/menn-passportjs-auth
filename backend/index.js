import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import UserRoute from "./routes/user.route.js";
import "./config/passport-jwt-strategy.js";
const app = express();

app.use(cors({ origin: process.env.FRONTEND_HOST, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.use("/api/v1/user", UserRoute);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running at port :: ${port}`);
});
