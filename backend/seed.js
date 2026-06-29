import dotenv from "dotenv";
import { connectDB } from "./db.js";
import User from "./models/User.js";
import HospitalSettings from "./models/HospitalSettings.js";
import mongoose from "mongoose";

dotenv.config();

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "kvs@hospital.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "kvs@123";

  let admin = await User.findOne({ email });
  if (admin) {
    console.log("Admin user already exists:", email);
  } else {
    admin = await User.create({
      name: "Hospital Admin",
      email,
      password,
      role: "admin",
    });
    console.log("Admin user created:", email, "/ password:", password);
  }

  let settings = await HospitalSettings.findOne();
  if (!settings) {
    settings = await HospitalSettings.create({
      hospitalName: "Your Hospital Name",
      tagline: "A single stop for all your Healthcare needs!",
      address: "Your Hospital Address",
      phone: "0000000000",
      gstNumber: "",
      termsAndConditions:
        "Subject to Maharashtra Junction.\nOur Responsibility Ceases as soon as goods leaves our Premises.\nGoods once sold will not taken back.\nDelivery Ex-Premises.",
      doctorName: "Dr. Name",
      doctorDesignation: "Consultant Physician",
      doctorRegistrationNumber: "",
    });
    console.log("Default hospital settings created");
  } else {
    console.log("Hospital settings already exist");
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
