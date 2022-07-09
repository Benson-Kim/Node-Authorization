const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const { exec } = require("../config/db");

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorResponse("Access denied, no token provided", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new ErrorResponse("Access denied, invalid token"));
    }
    const user = await exec("PROC_CheckEmail", {
      email: decoded.email,
    });
    if (!user) {
      return next(
        new ErrorResponse("Access denied, no user with this email", 404)
      );
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return next(new ErrorResponse("Not authorized to access this route"));
  }
};
