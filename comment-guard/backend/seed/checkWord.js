import mongoose from "mongoose";
import dotenv from "dotenv";
import OffensiveWord from "../models/OffensiveWord.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const found = await OffensiveWord.findOne({ word: "useless" });
  console.log("Found:", found);
  await mongoose.connection.close();
  process.exitCode = 0;
};

run();