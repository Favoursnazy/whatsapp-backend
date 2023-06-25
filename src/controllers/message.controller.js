import logger from "../configs/logger.config.js";
import { updateLastestMessage } from "../services/conversation.service.js";
import {
  createMessage,
  getConversationMessages,
  populatedMessage,
} from "../services/message.service.js";

export const sendMessage = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const { message, convo_id, files } = req.body;
    if (!convo_id || (!message && !files)) {
      logger.error("Please provide a conversation id and a messge body");
      return res.sendStatus(400);
    }
    const msgData = {
      sender: user_id,
      message,
      conversation: convo_id,
      files: files || [],
    };

    let newMessage = await createMessage(msgData);
    let populateMessage = await populatedMessage(newMessage._id);
    await updateLastestMessage(convo_id, newMessage);
    res.json(populateMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessage = async (req, res, next) => {
  try {
    const { convo_id } = req.params;
    if (!convo_id) {
      logger.error("Please add a conversation id in params");
      res.sendStatus(400);
    }
    const message = await getConversationMessages(convo_id);

    return res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};