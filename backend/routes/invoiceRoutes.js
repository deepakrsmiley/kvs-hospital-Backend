import express from "express";
import Invoice from "../models/Invoice.js";
import { protect } from "../middleware/authMiddleware.js";
import { numberToWordsINR } from "../utils/numberToWords.js";

const router = express.Router();
router.use(protect);

function computeTotals(items, consultationFee = 0) {
  let totalQty = 0;
  let totalTaxableValue = 0;

  const computedItems = items.map((item, idx) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discountPercent = Number(item.discountPercent) || 0;
    const gross = qty * rate;
    const discountAmt = (gross * discountPercent) / 100;
    const taxableValue = Math.round((gross - discountAmt + Number.EPSILON) * 100) / 100;

    totalQty += qty;
    totalTaxableValue += taxableValue;

    return { ...item, srNo: idx + 1, taxableValue };
  });

  // group by HSN/SAC for tax summary
  const hsnMap = {};
  computedItems.forEach((item) => {
    const key = item.hsnSac || "N/A";
    if (!hsnMap[key]) {
      hsnMap[key] = { hsnSac: key, taxableValue: 0, igstPercent: item.igstPercent || 12 };
    }
    hsnMap[key].taxableValue += item.taxableValue;
  });

  const hsnSummary = Object.values(hsnMap).map((h) => {
    const igstAmount = Math.round(((h.taxableValue * h.igstPercent) / 100 + Number.EPSILON) * 100) / 100;
    return {
      hsnSac: h.hsnSac,
      taxableValue: Math.round((h.taxableValue + Number.EPSILON) * 100) / 100,
      igstPercent: h.igstPercent,
      igstAmount,
      total: Math.round((igstAmount + Number.EPSILON) * 100) / 100,
    };
  });

  const totalIgstAmount = Math.round(
    (hsnSummary.reduce((sum, h) => sum + h.igstAmount, 0) + Number.EPSILON) * 100
  ) / 100;

  const consultFee = Math.round((Number(consultationFee) || 0) * 100) / 100;
  const grandTotal = Math.round((totalTaxableValue + totalIgstAmount + consultFee + Number.EPSILON) * 100) / 100;

  return {
    computedItems,
    hsnSummary,
    totalQty,
    totalTaxableValue: Math.round((totalTaxableValue + Number.EPSILON) * 100) / 100,
    totalIgstAmount,
    grandTotal,
  };
}

// GET /api/invoices?search=&page=&limit=
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const query = search
      ? {
          $or: [
            { invoiceNo: { $regex: search, $options: "i" } },
            { "customer.name": { $regex: search, $options: "i" } },
            { "customer.phone": { $regex: search, $options: "i" } },
            { "customer.gstin": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/invoices/next-number
router.get("/next-number", async (req, res) => {
  try {
    const last = await Invoice.findOne().sort({ createdAt: -1 });
    let next = 1;
    if (last && last.invoiceNo) {
      const num = parseInt(last.invoiceNo.replace(/\D/g, ""), 10);
      if (!isNaN(num)) next = num + 1;
    }
    res.json({ invoiceNo: String(next) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/invoices/:id
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/invoices
router.post("/", async (req, res) => {
  try {
    const { items, consultationFee, consultationDoctor, consultationNotes, ...rest } = req.body;
    const { computedItems, hsnSummary, totalQty, totalTaxableValue, totalIgstAmount, grandTotal } =
      computeTotals(items || [], consultationFee);

    const invoice = await Invoice.create({
      ...rest,
      items: computedItems,
      hsnSummary,
      totalQty,
      totalTaxableValue,
      totalIgstAmount,
      grandTotal,
      consultationFee: Number(consultationFee) || 0,
      consultationDoctor: consultationDoctor || "",
      consultationNotes: consultationNotes || "",
      amountInWords: numberToWordsINR(grandTotal),
      taxAmountInWords: numberToWordsINR(totalIgstAmount),
    });

    res.status(201).json(invoice);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Invoice number already exists" });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/invoices/:id
router.put("/:id", async (req, res) => {
  try {
    const { items, consultationFee, consultationDoctor, consultationNotes, ...rest } = req.body;
    const { computedItems, hsnSummary, totalQty, totalTaxableValue, totalIgstAmount, grandTotal } =
      computeTotals(items || [], consultationFee);

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        items: computedItems,
        hsnSummary,
        totalQty,
        totalTaxableValue,
        totalIgstAmount,
        grandTotal,
        consultationFee: Number(consultationFee) || 0,
        consultationDoctor: consultationDoctor || "",
        consultationNotes: consultationNotes || "",
        amountInWords: numberToWordsINR(grandTotal),
        taxAmountInWords: numberToWordsINR(totalIgstAmount),
      },
      { new: true }
    );

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/invoices/:id
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
