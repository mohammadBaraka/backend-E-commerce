import User from "../models/users.js";
import mongoose from "mongoose";
import { httpStatus } from "../helpers/httpStatus.js";
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users)
      res.status(httpStatus.codeNotFound).json({ message: "Users not found" });

    res.status(httpStatus.codeSuccess).json(users);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.cdeIntervar, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(httpStatus.codeBadRequest).send("Invalid User Id");
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      res.status(httpStatus.codeNotFound).json({ message: "User not found" });
    res.status(httpStatus.codeSuccess).json(user);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.cdeIntervar, message: err.message });
  }
};
