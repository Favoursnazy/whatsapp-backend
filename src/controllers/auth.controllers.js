import createHttpError from "http-errors";
import { createUser, signUser } from "../services/auth.service.js";
import { generateToken, verifyToken } from "../services/token.service.js";
import { findUser } from "../services/user.service.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await signUser(email, password);
    //generating access_token for user
    const access_token = await generateToken(
      { userId: user._id },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    //generating refresh token
    const refresh_token = await generateToken(
      { userId: user._id },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    //storing our refresh token
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/api/v1/auth/refreshtoken",
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    });

    //sending the user back to client
    return res.json({
      message: "login success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        picture: user.picture,
        token: access_token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, picture, status } = req.body;
    const newUser = await createUser({
      name,
      email,
      password,
      picture,
      status,
    });

    //generating access_token for user
    const access_token = await generateToken(
      { userId: newUser._id },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    //generating refresh token
    const refresh_token = await generateToken(
      { userId: newUser._id },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    //storing our refresh token
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/api/v1/auth/refreshtoken",
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    });

    //sending the user back to client
    return res.json({
      message: "register success",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        status: newUser.status,
        picture: newUser.picture,
        token: access_token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req, res, next) => {
  try {
    res.clearCookie("refreshtoken", { path: "/api/v1/auth/refreshtoken" });
    res.json({
      message: "logged out!",
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refreshtoken;
    if (!refresh_token) throw createHttpError.Unauthorized("Please Login.");
    const check = await verifyToken(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await findUser(check.userId);

    //generating access_token for user
    const access_token = await generateToken(
      { userId: user._id },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    //sending the user back to client
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        picture: user.picture,
        token: access_token,
      },
    });
  } catch (error) {
    next(error);
  }
};
