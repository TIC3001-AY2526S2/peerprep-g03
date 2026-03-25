import jwt from "jsonwebtoken";
import { findUserById as _findUserById } from "../model/repository.js";

export function verifyAccessToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication failed - no auth header" });
  }

  // request auth header: `Authorization: Bearer + <access_token>`
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Authentication failed - jwt.verify failed" });
    }

    // load latest user info from DB
    const dbUser = await _findUserById(user.sub);
    
    if (!dbUser) {
      return res.status(401).json({ message: "Authentication failed - not a dbUser" });
    }

    req.user = { id: dbUser.id, username: dbUser.username, email: dbUser.email, role: dbUser.role };
    next();
  });
}

export function verifyIsAdmin(req, res, next) {
  if (req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized to access this resource" });
  }
}

export function verifyIsOwnerOrAdmin(req, res, next) {
  if (req.user.role === "admin" || req.user.role === "owner") {
    return next();
  }

  const userIdFromReqParams = req.params.id;
  const userIdFromToken = req.user.id;
  if (userIdFromReqParams === userIdFromToken) {
    return next();
  }

  return res.status(403).json({ message: "Not authorized to access this resource" });
}
