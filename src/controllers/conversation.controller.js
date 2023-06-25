import createHttpError from "http-errors";
import logger from "../configs/logger.config.js";
import {
  createConversation,
  doesConverstionExist,
  getUserConversations,
  populatedConversation,
} from "../services/conversation.service.js";
import { findUser } from "../services/user.service.js";

export const openConversation = async (req, res, next) => {
  try {
    const sender_id = req.user.userId;
    const { reciever_id } = req.body;

    //check if reciever_id is provided
    if (!reciever_id) {
      logger.error("Please provide a user id to start aconversation with");
      throw createHttpError.BadRequest("Something went wrong!");
    }

    //check if there is already existed chat with sender_id and reeciever_id
    const existed_conversation = await doesConverstionExist(
      sender_id,
      reciever_id
    );
    if (existed_conversation) {
      return res.json(existed_conversation);
    } else {
      let reciever_user = await findUser(reciever_id);

      let convoData = {
        name: reciever_user.name,
        isGroup: false,
        users: [sender_id, reciever_id],
      };
      const newConvo = await createConversation(convoData);
      const populatedConvo = await populatedConversation(
        newConvo._id,
        "users",
        "-password"
      );
      res.status(200).json(populatedConvo);
    }
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const conversations = await getUserConversations(user_id);
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};
