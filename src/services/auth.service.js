import createHttpError from "http-errors";
import validator from "validator";
import { UserModel } from "../models/index.js";
import bcrypt from "bcrypt";

//Env Variables
const { DEAFULT_PICTURE, DEFAULT_STATUS } = process.env;

export const createUser = async (userData) => {
  const { name, email, password, picture, status } = userData;

  //check if fields are empty
  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Please fill all fields");
  }

  //check name length
  if (
    !validator.isLength(name, {
      min: 2,
      max: 16,
    })
  ) {
    throw createHttpError.BadRequest(
      "Please make your sure your name is between 2 and 16 character."
    );
  }

  //check status length
  if (status && status.length > 64) {
    throw createHttpError.BadRequest(
      "Please make sure your status is less thsn 64 characters"
    );
  }

  //check if email is valid
  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("Please provide a valid email");
  }

  //if user already exist
  const checkIfEmailExist = await UserModel.findOne({ email });
  if (checkIfEmailExist) {
    throw createHttpError.BadRequest("Email Already exist with an account.");
  }

  //check password length
  if (
    !validator.isLength(password, {
      min: 6,
      max: 128,
    })
  ) {
    throw createHttpError.BadRequest(
      "Please make sure your password is between 6 and 128 characters"
    );
  }

  //adding the user to our mongodb database after passing the validation

  const user = await new UserModel({
    name,
    email,
    password,
    picture: picture || DEAFULT_PICTURE,
    status: status || DEFAULT_STATUS,
  }).save();

  return user;
};

export const signUser = async (email, password) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();

  //check if email/user exists
  if (!user) throw createHttpError.NotFound("Invalid Credentials.");

  //Caompare password
  let passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) throw createHttpError.NotFound("Invalid Credentials.");

  return user;
};
