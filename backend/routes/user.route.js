import express from "express";
const router = express.Router();
import { UserRegister } from "../controllers/user.controller.js";

//USER-REGISTER || POST
router.post("/register", UserRegister);

export default router;
