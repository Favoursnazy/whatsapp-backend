import express from "express";
import trimRequest from "trim-request";
import authMiddleWare from "../middlewares/authMiddleware.js";
import { searchUser } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/").get(trimRequest.all, authMiddleWare, searchUser);

export default router;
