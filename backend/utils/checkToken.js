import { verifyAccessToken } from "../auth/jwt.js";

export function checkAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ authenticated: false });
  }

  next();
}
