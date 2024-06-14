import express from "express";
const router = express.Router();
import {
  UserRegister,
  VerifyUserEmail,
  UserLogin,
  GetNewAccessToken,
} from "../controllers/user.controller.js";

//USER-REGISTER || POST
router.post("/register", UserRegister);

//VERIFY-EMAIL || POST
router.post("/verify-email", VerifyUserEmail);

//USER-LOGIN || POST
router.post("/login", UserLogin);

//REFRESh_TOKEN || POST
router.post("/refresh-token", GetNewAccessToken);
export default router;
