import logger from "../configs/logger.config.js";
import jwt from "jsonwebtoken";
import MessageModel from "../models/message.model.js";

export const sign = (payload, expiresIn, secret) => {
  return new Promise((reslove, reject) => {
    jwt.sign(
      payload,
      secret,
      {
        expiresIn: expiresIn,
      },
      (error, token) => {
        if (error) {
          logger.error(error);
          reject(error);
        } else {
          reslove(token);
        }
      }
    );
  });
};

export const verify = async (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, payload) => {
      if (error) {
        logger.error(error);
        reject(error);
      } else {
        resolve(payload);
      }
    });
  });
};
