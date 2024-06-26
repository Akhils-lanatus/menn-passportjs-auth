import express from "express";
import passport from "passport";
import { accessTokenAutoRefresh } from "../middlewares/setAuthAndAutoRefreshToken.js";
const router = express.Router();
import {
  UserRegister,
  VerifyUserEmail,
  UserLogin,
  GetNewAccessToken,
  UserProfile,
  UserLogout,
  ChangeUserPassword,
  SendUserPasswordResetEmail,
  ResetUserPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
//USER-REGISTER || POST
router.post("/register", upload.single("avatar"), UserRegister);

//VERIFY-EMAIL || POST
router.post("/verify-email", VerifyUserEmail);

//USER-LOGIN || POST
router.post("/login", UserLogin);

//REFRESH_TOKEN || POST
router.post("/refresh-token", GetNewAccessToken);

//PASSWORD-RESET-LINK || POST
router.post("/reset-password-link", SendUserPasswordResetEmail);

//PASSWORD-RESET|| POST
router.post("/reset-password/:id/:token", ResetUserPassword);

//PROTECTED-ROUTES

//REFRESH_TOKEN || GET
router.get(
  "/profile",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  UserProfile
);

router.post(
  "/logout",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  UserLogout
);

router.post(
  "/change-password",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  ChangeUserPassword
);

export default router;
