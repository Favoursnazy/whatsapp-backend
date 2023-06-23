import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
export default async (req, res, next) => {
  if (!req.headers["authorization"])
    return next(createHttpError.Unauthorized());

  const bearerToken = req.headers["authorization"];
  const token = bearerToken.split(" ")[1];
  jwt.sign(token.process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
    if (error) {
      return next(createHttpError.Unauthorized());
    }
    req.user = payload;
    next();
  });
};
