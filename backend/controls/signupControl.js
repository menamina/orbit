const prisma = require("../prisma/client");
import { passwordGenie } from "../utils/passwordUtil";

async function usernameInUse(req, res) {
  try {
    const { username } = req.body;
    const inUse = await prisma.user.findUnique({ where: { username } });
    if (!inUse) {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ message: "Username in use" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function emailInUse(req, res) {
  try {
    const { email } = req.body;
    const inUse = await prisma.user.findUnique({ where: { email } });
    if (!inUse) {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ message: "Email in use" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function signup(req, res) {
  try {
    const { name, username, email, password } = req.body;
    const saltedHash = passwordGenie(password);
    const user = prisma.user.create({
      data: {
        name,
        username,
        email,
        profile: {
          create: saltedHash,
        },
      },
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}
