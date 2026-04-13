import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Collaboration service connected to MongoDB");
  } catch (error) {
    console.error("Collaboration service MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
