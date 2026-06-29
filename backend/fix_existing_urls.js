import mongoose from "mongoose";
import dotenv from "dotenv";
import HospitalSettings from "./models/HospitalSettings.js";

dotenv.config();

// ⚠️ CHANGE THIS to your real backend domain (no trailing slash)
const BACKEND_URL = "http://localhost:5000";

const fields = ["logoUrl", "sealUrl", "doctorSignatureUrl", "adImageUrl"];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const settings = await HospitalSettings.findOne();
  if (!settings) {
    console.log("No settings document found.");
    process.exit(0);
  }

  fields.forEach((f) => {
    if (settings[f] && settings[f].startsWith("/uploads/")) {
      settings[f] = BACKEND_URL + settings[f];
    }
  });

  if (settings.bankDetails?.qrCodeUrl?.startsWith("/uploads/")) {
    settings.bankDetails.qrCodeUrl = BACKEND_URL + settings.bankDetails.qrCodeUrl;
  }

  await settings.save();
  console.log("Updated settings:", settings);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});