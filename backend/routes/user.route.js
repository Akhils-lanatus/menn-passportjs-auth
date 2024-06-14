import express from "express";
const router = express.Router();
import passport from "passport";
import {
  UserRegister,
  VerifyUserEmail,
  UserLogin,
  GetNewAccessToken,
  UserProfile,
} from "../controllers/user.controller.js";

//USER-REGISTER || POST
router.post("/register", UserRegister);

//VERIFY-EMAIL || POST
router.post("/verify-email", VerifyUserEmail);

//USER-LOGIN || POST
router.post("/login", UserLogin);

//REFRESH_TOKEN || POST
router.post("/refresh-token", GetNewAccessToken);

//REFRESH_TOKEN || GET
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  UserProfile
);
export default router;
