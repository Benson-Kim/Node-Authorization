exports.getPrivateData = (req, res, next) => {
  res.status(200).json({
    succss: true,
    message: "You got access to protected data",
  });
};
