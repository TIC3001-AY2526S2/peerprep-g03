import { extractBearerToken } from "../utils/extractBearerToken.js";
import { verifyAccessToken } from "../jwt/verifyAccessToken.js";

export function authenticateToken(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Missing bearer token" });
  }

  try {
    const decoded = verifyAccessToken(token);
    
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}