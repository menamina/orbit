import { verifyAccessToken } from "./jwt.js";
import prisma from "../prisma/client.js";

export async function checkAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "You must log in to access this feature" });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(403).json({ accessTokenExpired: true });
  }

  // Check if user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userID },
  });

  if (!user) {
    return res.status(401).json({ error: "User account not found" });
  }

  req.user = {
    userID: decoded.userID,
    email: decoded.email,
    username: decoded.username,
    name: decoded.name,
  };

  next();
}
