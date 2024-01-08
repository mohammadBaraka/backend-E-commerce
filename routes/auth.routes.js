import express from "express";
import {
  checkLogedIn,
  login,
  logout,
  register,
} from "../controller/auth.controller.js";
import { jwtVerify } from "../helpers/jwtVerivy.js";

const router = express.Router();
router.route("/token").get(jwtVerify, checkLogedIn);
router.route("/register").post(register);
router.route("/logout").post(logout);
router.route("/login").post(login);
export default router;
