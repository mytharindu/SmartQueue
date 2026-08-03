import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined");
    }

    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
     console.error("MongoDB connection failed:");
  console.error(error);
  process.exit(1);
    if (error instanceof Error) {
      console.error("MongoDB connection failed:", error.message);
    }
    process.exit(1);
  }
};

export default connectDB;