import createHttpError from "http-errors";
import logger from "../configs/logger.config.js";
import {
  getAllUserService,
  searchUsers as searchUserService,
} from "../services/user.service.js";

export const searchUser = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search) {
      logger.error("plaese add a search string first!");
      throw createHttpError.BadRequest("Oops.. Something went wrong");
    }
    const users = await searchUserService(search, req.user.userId);
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  const userId = req.user.userId;
  const users = await getAllUserService(userId);

  res.status(200).json(users);
};
