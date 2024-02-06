import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { httpStatus } from "../helpers/httpStatus.js";
import "dotenv/config";

export const register = async (req, res) => {
  const findUser = await User.findOne({ email: req.body.email });
  if (findUser)
    return res
      .status(httpStatus.codeBadRequest)
      .send({ status: httpStatus.FAIL, message: "User already exists" });
  try {
    const { name, email, password, phone, street, zip, city, country } =
      req.body;
    const hash = await bcrypt.hash(req.body.password, 10);
    if (!name || !email || !password || !street || !zip || !city || !country) {
      return res
        .status(httpStatus.codeBadRequest)
        .send({ status: httpStatus.FAIL, message: "All fields are required" });
    }
    const user = new User({
      name,
      email,
      password: hash,
      phone,
      isAdmin: req.body.isAdmin,
      street,
      apartment: req.body.apartment,
      zip,
      city,
      country,
    });

    await user.save();
    const response = {
      status: httpStatus.SUCCESS,
      message: "User created successfully",
      data: {
        name: user.name,
        email: user.email,
      },
    };
    res.status(httpStatus.codeCreated).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .send({ status: httpStatus.FAIL, message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(httpStatus.codeBadRequest)
        .send({ status: httpStatus.FAIL, message: "User not already exists" });

    const passwordIsMatch = await bcrypt.compare(password, user.password);
    if (!passwordIsMatch)
      return res.status(httpStatus.codeBadRequest).json({
        status: httpStatus.FAIL,
        message: "Invalid email or password",
      });
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );
    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,

      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      // secure: true,
    });
    const response = {
      status: httpStatus.SUCCESS,
      message: "User login successfully",
      data: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    };
    return res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const checkLogedIn = (req, res) => {
  return res.status(httpStatus.codeSuccess).json({
    status: httpStatus.SUCCESS,
    message: "Logedin successfully",
    user: req.isAdmin,
    userId: req.userId,
  });
};

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.send("ok");
};
