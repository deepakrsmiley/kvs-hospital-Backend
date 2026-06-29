import mongoose from "mongoose";

const hospitalSettingsSchema = new mongoose.Schema(
  {
    hospitalName: { type: String, default: "" },
    tagline: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    sealUrl: { type: String, default: "" },
    doctorSignatureUrl: { type: String, default: "" },
    adImageUrl: { type: String, default: "" }, // top-right advertisement / product banner
    bankDetails: {
      name: { type: String, default: "" },
      branch: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifsc: { type: String, default: "" },
      upiId: { type: String, default: "" },
      qrCodeUrl: { type: String, default: "" },
    },
    termsAndConditions: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    doctorDesignation: { type: String, default: "" },
    doctorRegistrationNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("HospitalSettings", hospitalSettingsSchema);
