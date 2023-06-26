import express from "express";
import authRouter from "./auth.route.js";
import conversationRoute from "./conversation.route.js";
import messageRoute from "./message.route.js";
import usersRoute from "./user.route.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/conversation", conversationRoute);
router.use("/message", messageRoute);
router.use("/users", usersRoute);

export default router;
