import { verifyAccessToken } from "../auth/jwt.js";

export function checkAuth(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      userID: decoded.userID,
      email: decoded.email,
    },
  });
}
