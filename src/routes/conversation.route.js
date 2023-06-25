import express from "express";
import trimRequest from "trim-request";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getConversations,
  openConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, openConversation);
router.route("/").get(trimRequest.all, authMiddleware, getConversations);

export default router;
