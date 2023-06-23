import { sign, verify } from "../utils/token.util.js";

export const generateToken = async (payload, expireIn, secret) => {
  let token = await sign(payload, expireIn, secret);
  return token;
};

export const verifyToken = async (token, secret) => {
  let check = await verify(token, secret);
  return check;
};
