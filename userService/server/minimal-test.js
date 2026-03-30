import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.DB_CLOUD_URI;

try {
  console.log("URI loaded:", Boolean(uri));
  await mongoose.connect(uri);
  console.log("Connected");
} catch (err) {
  console.error("Connect failed");
  console.error(err);
}