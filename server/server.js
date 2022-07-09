require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json());
app.use("/api/auth", require("./routes/authRote"));
app.use("/api/private", require("./routes/privateRoute"));

// Error handler sjould be the last middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err}`);
  server.close(() => process.exit(1));
});
