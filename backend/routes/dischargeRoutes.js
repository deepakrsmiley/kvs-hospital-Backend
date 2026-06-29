import express from "express";
import DischargeSummary from "../models/DischargeSummary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

// GET /api/discharge-summaries?search=&page=&limit=
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const query = search
      ? {
          $or: [
            { patientName: { $regex: search, $options: "i" } },
            { mrn: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await DischargeSummary.countDocuments(query);
    const summaries = await DischargeSummary.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ summaries, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/discharge-summaries/:id
router.get("/:id", async (req, res) => {
  try {
    const summary = await DischargeSummary.findById(req.params.id);
    if (!summary) return res.status(404).json({ message: "Discharge summary not found" });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/discharge-summaries
router.post("/", async (req, res) => {
  try {
    const summary = await DischargeSummary.create(req.body);
    res.status(201).json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/discharge-summaries/:id
router.put("/:id", async (req, res) => {
  try {
    const summary = await DischargeSummary.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!summary) return res.status(404).json({ message: "Discharge summary not found" });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/discharge-summaries/:id
router.delete("/:id", async (req, res) => {
  try {
    const summary = await DischargeSummary.findByIdAndDelete(req.params.id);
    if (!summary) return res.status(404).json({ message: "Discharge summary not found" });
    res.json({ message: "Discharge summary deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
