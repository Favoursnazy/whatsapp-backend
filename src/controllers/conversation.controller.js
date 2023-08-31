import createHttpError from "http-errors";
import logger from "../configs/logger.config.js";
import {
  createConversation,
  doesConverstionExist,
  getUserConversations,
  markMessageAsDelivered,
  populatedConversation,
} from "../services/conversation.service.js";
import { findUser } from "../services/user.service.js";
import MessageModel from "../models/message.model.js";

export const openConversation = async (req, res, next) => {
  try {
    const sender_id = req.user.userId;
    const { reciever_id, isGroup, convo_id, unreadMessages } = req.body;

    if (isGroup === false) {
      //check if reciever_id is provided
      if (!reciever_id) {
        logger.error("Please provide a user id to start aconversation with");
        throw createHttpError.BadRequest("Something went wrong!");
      }

      if (convo_id !== false && unreadMessages !== 0) {
        await markMessageAsDelivered(convo_id);
      }

      //check if there is already existed chat with sender_id and reeciever_id
      const existed_conversation = await doesConverstionExist(
        sender_id,
        reciever_id,
        false
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
    } else {
      // its a group chat

      //Then check if the group exist first
      const existedGroupChat = await doesConverstionExist("", "", isGroup);
      res.status(200).json(existedGroupChat);
    }
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const conversation = await getUserConversations(user_id);

    const filter_unread_messages = await conversation.map(async (convo) => {
      const countUnreadMessages = await MessageModel.find({
        conversation: convo._id,
        status: "sent",
        sender: { $ne: user_id },
      });
      convo.unreadMessages = countUnreadMessages.length;
      return convo;
    });

    const userConversations = await Promise.all(filter_unread_messages);

    res.status(200).json(userConversations);
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  const { name, users } = req.body;

  // add current user to users
  users.push(req.user.userId);

  // check if all fields are empty
  if (!name || !users) {
    throw createHttpError.BadRequest("All Fields Are Required");
  }

  // limit of users needed to create a group
  let convoData = {
    name,
    users,
    isGroup: true,
    admin: req.user.userId,
    picture: process.env.DEFAULT_GROUP_PICTURE,
  };
  try {
    const newConvo = await createConversation(convoData);
    const populatedConvo = await populatedConversation(
      newConvo._id,
      "users admin",
      "-password"
    );
    console.log(populatedConvo);
    res.status(200).json(populatedConvo);
  } catch (error) {
    next(error);
  }
};
