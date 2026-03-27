import bcrypt from "bcrypt";
import { findUserByEmail as _findUserByEmail } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";
import { signAccessToken } from "@peerprep/auth";

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isAuthenticated = await bcrypt.compare(password, user.password);
      if (!isAuthenticated) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = signAccessToken(user, { expiresIn: "1d" });

      return res.status(200).json(
        { 
          message: "User logged in", 
          data: 
            { 
              accessToken,
              ...formatUserResponse(user)
            }
        }
      );
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export async function handleVerifyToken(req, res) {
  try {
    const verifiedUser = req.user;
    return res.status(200).json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
