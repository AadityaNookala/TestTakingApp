const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const usersData = require("../models/userModel.js");

exports.login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      throw new Error("No username or password");
    }
    const user = await usersData.findOne({ userName }).select("+password");
    if (!user) throw new Error("User does not exist. Please sign up.");
    const correctPassword = await user.correctPassword(password, user.password);
    if (!correctPassword) {
      throw new Error("Incorrect username or password. Please try again!");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_FOR_TESTS, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.cookie("jwt", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    res.status(200).json({
      status: "success",
      message: "Successfully logged in",
      isAdmin: user.role === "admin",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw new Error("You are not logged in. Please log in and try again!");
    }
    const userId = jwt.verify(token, process.env.JWT_SECRET_FOR_TESTS).id;
    const user = await usersData.findById(userId);
    if (!user) throw new Error("The user no longer exists.");
    if (req.query.userName !== user.userName)
      throw new Error("Wrong user. Please login correctly");
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role))
        throw new Error("You do not have permission to perform this action");
      next();
    } catch (err) {
      res.status(401).json({
        status: "fail",
        message: err.message,
      });
    }
  };
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("jwt", { path: "/" });
    res.status(200).json({
      status: "success",
      message: "Successfully logged out",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
