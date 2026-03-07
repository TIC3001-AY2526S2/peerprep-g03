import mongoose from "mongoose"; 

const connectDB = async () => { 
  try { 
    console.log(process.env.MONGODB_URI); 
    await mongoose.connect(process.env.MONGODB_URI); 
    console.log("Connected to MongoDB"); 
  } catch (error) { 
    console.error("MongoDB connection failed:", error.message); 
    process.exit(1); 
  } 
}; 

export default connectDB;