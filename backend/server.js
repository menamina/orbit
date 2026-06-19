require("dotenv").config();
import { express } from "express";

const server = express();
const port = process.env.PORT;
const router = require("./routes");
