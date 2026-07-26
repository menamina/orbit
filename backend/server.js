require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const routes = require("./router/routes");

const server = express();
const port = process.env.PORT;

function handleError(error) {
  if (error) {
    console.error("WHOMP :-(", error);
    return;
  }
  console.log(`yay :-)`);
}

server.use(express.json());
server.use(cookieParser());
server.use("/", routes);

server.listen(port, handleError);

module.exports = server;
