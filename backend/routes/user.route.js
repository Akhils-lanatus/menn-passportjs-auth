import express from "express";
const router = express.Router();
import {
  UserRegister,
  VerifyUserEmail,
} from "../controllers/user.controller.js";

//USER-REGISTER || POST
router.post("/register", UserRegister);

//VERIFY-EMAIL || POST
router.post("/verify-email", VerifyUserEmail);

export default router;
