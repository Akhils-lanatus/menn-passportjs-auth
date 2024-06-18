import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import UserRoute from "./routes/user.route.js";
import "./config/passport-jwt-strategy.js";
import "./config/google-strategy.js";
import passport from "passport";
import { generateUserCookies } from "./utils/generateCookies.js";
const app = express();

app.use(cors({ origin: process.env.FRONTEND_HOST, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
connectDB();

app.use("/api/v1/user", UserRoute);

app.get(
  "/api/v1/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

app.get(
  "/api/v1/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_HOST}`,
  }),
  (req, res) => {
    const { user, accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      req.user;
    generateUserCookies(
      res,
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    );

    // Successful authentication, redirect home.
    res.redirect(`${process.env.FRONTEND_HOST}/user/dashboard`);
  }
);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running at port :: ${port}`);
});
