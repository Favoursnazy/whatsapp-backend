import createHttpError from "http-errors";
import { MessageModel } from "../models/index.js";

export const createMessage = async (data) => {
  let newMessage = await MessageModel.create(data);

  if (!newMessage)
    throw createHttpError.BadRequest("Oops... Something went wrong");

  return newMessage;
};

export const populatedMessage = async (id) => {
  let message = await MessageModel.findById(id)
    .populate({
      path: "sender",
      select: "name, picture",
      model: "UserModel",
    })
    .populate({
      path: "conversation",
      select: "name isGroup users",
      model: "ConversationModel",
      populate: {
        path: "users",
        select: "name email picture status",
        model: "UserModel",
      },
    });
  if (!message)
    throw createHttpError.BadRequest("Oops... Something went wrong");

  return message;
};

export const getConversationMessages = async (convo_id) => {
  const messages = await MessageModel.find({ conversation: convo_id })
    .populate("sender", "name picture email status")
    .populate("conversation");

  if (!messages) throw createHttpError("Oops... Something went wrong ");

  return messages;
};
