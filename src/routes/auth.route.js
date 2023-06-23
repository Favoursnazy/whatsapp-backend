import express from "express";
import {
  logOut,
  login,
  refreshToken,
  register,
} from "../controllers/auth.controllers.js";
import trimRequest from "trim-request";

const router = express.Router();

router.route("/login").post(trimRequest.all, login);
router.route("/register").post(trimRequest.all, register);
router.route("/logout").post(trimRequest.all, logOut);
router.route("/refreshtoken").post(trimRequest.all, refreshToken);

export default router;
