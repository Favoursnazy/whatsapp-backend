import express from "express";
import trimRequest from "trim-request";
import authMiddleWare from "../middlewares/authMiddleware.js";
import { getAllUsers, searchUser } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/").get(trimRequest.all, authMiddleWare, searchUser);
router.route("/allusers").get(trimRequest.all, authMiddleWare, getAllUsers);

export default router;
