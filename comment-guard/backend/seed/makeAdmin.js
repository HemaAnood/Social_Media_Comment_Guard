import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const USER_ID = "6a9f1ed66611fe1cdbf636f0"; // your test user's _id

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findById(USER_ID);
    if (!user) {
      console.log("User not found");
    } else {
      user.role = "admin";
      await user.save();
      console.log(`${user.name} (${user.email}) is now an admin`);
    }

    await mongoose.connection.close();
    process.exitCode = 0;
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
};

run();