import express from "express";
import trimRequest from "trim-request";
import authMiddleWare from "../middlewares/authMiddleware.js";
import { sendMessage, getMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleWare, sendMessage);
router.route("/:convo_id").get(trimRequest.all, authMiddleWare, getMessage);

export default router;
