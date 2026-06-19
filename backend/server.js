require("dotenv").config();
import { express } from "express";

const server = express();
const port = process.env.PORT;
const routes = require("./routes");

function handleError(error) {
  if (error) {
    console.error("WHOMP :-(", error);
    return;
  }
  console.log(`yay :-)`);
}
server.use("/", routes);
server.listen(port, handleError);

module.exports = server;
