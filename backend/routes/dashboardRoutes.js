import express from "express";
import Invoice from "../models/Invoice.js";
import DischargeSummary from "../models/DischargeSummary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const totalBills = await Invoice.countDocuments();
    const totalDischargeSummaries = await DischargeSummary.countDocuments();

    const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(5);
    const recentSummaries = await DischargeSummary.find().sort({ createdAt: -1 }).limit(5);

    const revenueAgg = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalBills,
      totalDischargeSummaries,
      totalRevenue,
      recentInvoices,
      recentSummaries,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
