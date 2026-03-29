import UserModel from "./user-model.js";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
  const mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;

  if (!mongoDBUri) {
    throw new Error("MongoDB URI is missing from environmental variables.");
  }
  try {
    await connect(mongoDBUri);
  } catch (err) {
    console.log("Failed to connect to MongoDB");
    throw err;
  }
}

export async function createUser(username, email, password) {
  return new UserModel({ username, email, password }).save();
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [
      { username },
      { email },
    ],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function updateUserById(userId, username, email, password) {
  const updates = {};
 
  if (username !== undefined) {
    updates.username = username;
  }
 
  if (email !== undefined) {
    updates.email = email;
  }
 
  if (password !== undefined) {
    updates.password = password;
  }
 
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: updates,
    },
    { new: true },  // return the updated user
  );
}

export async function updateUserPrivilegeById(userId, role) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        role,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}
