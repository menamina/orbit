import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import routes from "./router/routes.js";

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

export default server;
