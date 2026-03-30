import jwt from "jsonwebtoken";

export function signAccessToken(user, options = {}) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, secret, {
    expiresIn: options.expiresIn || "1h",
  });
}