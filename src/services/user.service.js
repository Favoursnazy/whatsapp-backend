import createHttpError from "http-errors";
import { UserModel } from "../models/index.js";

export const findUser = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) throw createHttpError.BadRequest("Please Login Again.");

  return user;
};

export const searchUsers = async (keyword, userId) => {
  const users = await UserModel.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
  }).find({
    _id: { $ne: userId },
  });
  return users;
};

export const getAllUserService = async (userId) => {
  const users = await UserModel.find({
    _id: { $ne: userId },
  });

  const usersGroupedByIntialLetters = {};
  users.forEach((user) => {
    const initialLetter = user.name.charAt(0).toUpperCase();
    if (!usersGroupedByIntialLetters[initialLetter]) {
      usersGroupedByIntialLetters[initialLetter] = [];
    }
    usersGroupedByIntialLetters[initialLetter].push(user);
  });

  return usersGroupedByIntialLetters;
};
