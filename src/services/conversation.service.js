import createHttpError from "http-errors";
import { ConversationModel, UserModel } from "../models/index.js";

export const doesConverstionExist = async (sender_id, reciever_id, isGroup) => {
  if (isGroup === false) {
    let convos = await ConversationModel.find({
      isGroup: false,
      $and: [
        { users: { $elemMatch: { $eq: sender_id } } },
        { users: { $elemMatch: { $eq: reciever_id } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (!convos)
      throw createHttpError.BadRequest("Oops... Something went wrong");

    //populate message model
    convos = await UserModel.populate(convos, {
      path: "latestMessage.sender",
      select: "name email picture status",
    });

    return convos[0];
  } else {
    // its a group, so we do the check
    let convo = await ConversationModel.findById(isGroup)
      .populate("users admin", "-password")
      .populate("latestMessage");

    if (!convo)
      throw createHttpError.BadRequest("Oops... Something went wrong");

    //populate message model
    convo = await UserModel.populate(convo, {
      path: "latestMessage.sender",
      select: "name email picture status",
    });

    return convo;
  }
};

export const createConversation = async (data) => {
  const newConvo = await ConversationModel.create(data);
  if (!newConvo)
    throw createHttpError.BadRequest("Oops... Something went wrong");

  return newConvo;
};

export const populatedConversation = async (
  id,
  fieldsToPopulate,
  fieldsToRemove
) => {
  const populatedConvo = await ConversationModel.findOne({
    _id: id,
  }).populate(fieldsToPopulate, fieldsToRemove);

  if (!populatedConvo)
    throw createHttpError.BadRequest("Oops... Something went wrong");

  return populatedConvo;
};

export const getUserConversations = async (userId) => {
  let conversation;
  await ConversationModel.find({
    users: { $elemMatch: { $eq: userId } },
  })
    .populate("users", "-password")
    .populate("admin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await UserModel.populate(results, {
        path: "latestMessage.sender",
        select: "name, email, picture status",
      });
      conversation = results;
    })
    .catch((error) => {
      throw createHttpError.BadRequest("Opps... Something went wrong");
    });

  return conversation;
};

export const updateLastestMessage = async (convo_id, msg) => {
  const updatedConvo = await ConversationModel.findByIdAndUpdate(convo_id, {
    latestMessage: msg,
  });

  if (!updatedConvo)
    throw createHttpError.BadRequest("Oops... Something went wrong");

  return updatedConvo;
};
