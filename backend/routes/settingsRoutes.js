import express from "express";
import HospitalSettings from "../models/HospitalSettings.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET /api/settings
router.get("/", async (req, res) => {
  try {
    let settings = await HospitalSettings.findOne();
    if (!settings) {
      settings = await HospitalSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/settings
router.put("/", protect, async (req, res) => {
  try {
    let settings = await HospitalSettings.findOne();
    if (!settings) {
      settings = new HospitalSettings();
    }

    // Merge bankDetails instead of overwriting it, so qrCodeUrl (and other
    // fields not present in the form) are never wiped out when saving
    // Hospital Details.
    const { bankDetails, ...rest } = req.body;
    Object.assign(settings, rest);

    if (bankDetails) {
      settings.bankDetails = { ...settings.bankDetails.toObject(), ...bankDetails };
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settings/upload/:field  -> logoUrl | sealUrl | doctorSignatureUrl | adImageUrl | qrCodeUrl
router.post("/upload/:field", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const field = req.params.field;

    // Convert uploaded file (in memory) to a base64 data URI — works on Vercel serverless, no disk needed
    const base64 = req.file.buffer.toString("base64");
    const fileUrl = `data:${req.file.mimetype};base64,${base64}`;

    let settings = await HospitalSettings.findOne();
    if (!settings) settings = new HospitalSettings();

    const validFields = ["logoUrl", "sealUrl", "doctorSignatureUrl", "adImageUrl"];
    if (validFields.includes(field)) {
      settings[field] = fileUrl;
    } else if (field === "qrCodeUrl") {
      settings.bankDetails.qrCodeUrl = fileUrl;
    } else {
      return res.status(400).json({ message: "Invalid field" });
    }

    await settings.save();
    res.json({ url: fileUrl, settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;