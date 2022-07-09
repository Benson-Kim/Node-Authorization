const { exec } = require("../config/db");
const ErrorResponse = require("../utils/errorResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const usernameExists = await exec("PROC_CheckUsername", {
      username,
    });
    const emailExists = await exec("PROC_CheckEmail", {
      email,
    });

    if (usernameExists.recordset.length > 0) {
      return next(new ErrorResponse("Try a different username", 401));
    }
    if (emailExists.recordset.length > 0) {
      return next(
        new ErrorResponse("The email is already registred. try to log in", 401)
      );
    }

    const hashPass = await bcrypt.hash(password, 8);

    await exec("CreateUser", {
      username,
      email,
      password: hashPass,
    });
    sendToken(email, 201, res);
    // return res.status(201).json({
    //   status: 201,
    //   success: true,
    //   message: `A user has been registered successfully`,
    //   token: "3hh84848",
    // });
  } catch (error) {
    return next(error);
  }
};
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse("Please enter email and password", 400));
  }
  try {
    let user;
    const emailExists = await exec("PROC_CheckEmail", {
      email,
    });
    if (emailExists.recordset <= 0) {
      return next(new ErrorResponse("Invalid credentials", 404));
    }

    user = emailExists.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 404));
    }
    // return res.status(200).json({
    //   status: 200,
    //   success: true,
    //   message: `logged in successfully`,
    //   token: "2qiwow2992",
    // });
    sendToken(email, 200, res);
  } catch (error) {
    return next(error);
  }
};
exports.forgotPassword = (req, res, next) => {
  res.send("Forgot password route");
};
exports.resetPassword = (req, res, next) => {
  res.send("Reset password route");
};

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  res.status(statusCode).json({ success: true, token });
};
