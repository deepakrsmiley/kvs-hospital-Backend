import express from "express";
import Bill from "../models/Bill.js";
import { protect } from "../middleware/authMiddleware.js";
import { numberToWordsINR } from "../utils/numberToWords.js";

const router = express.Router();
router.use(protect);

// ── Compute totals per bill type ─────────────────────────────────────────────
function computePharmacy(items) {
  let totalQty = 0, totalTaxableValue = 0;
  const computedItems = items.map((item, idx) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discountPercent = Number(item.discountPercent) || 0;
    const gross = qty * rate;
    const discountAmt = (gross * discountPercent) / 100;
    const taxableValue = Math.round((gross - discountAmt) * 100) / 100;
    totalQty += qty;
    totalTaxableValue += taxableValue;
    return { ...item, srNo: idx + 1, taxableValue };
  });

  const hsnMap = {};
  computedItems.forEach((item) => {
    const key = item.hsnSac || "N/A";
    if (!hsnMap[key]) hsnMap[key] = { hsnSac: key, taxableValue: 0, igstPercent: Number(item.igstPercent) || 12 };
    hsnMap[key].taxableValue += item.taxableValue;
  });

  const hsnSummary = Object.values(hsnMap).map((h) => {
    const igstAmount = Math.round((h.taxableValue * h.igstPercent) / 100 * 100) / 100;
    return { hsnSac: h.hsnSac, taxableValue: Math.round(h.taxableValue * 100) / 100, igstPercent: h.igstPercent, igstAmount, total: igstAmount };
  });

  const totalIgstAmount = Math.round(hsnSummary.reduce((s, h) => s + h.igstAmount, 0) * 100) / 100;
  const grandTotal = Math.round((totalTaxableValue + totalIgstAmount) * 100) / 100;

  return {
    computedItems, hsnSummary,
    totalQty,
    totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
    totalIgstAmount,
    grandTotal,
  };
}

function computeLab(labItems) {
  let grandTotal = 0;
  const computed = labItems.map((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const disc = (Number(item.discountPercent) || 0);
    const gross = qty * rate;
    const amount = Math.round((gross - (gross * disc / 100)) * 100) / 100;
    grandTotal += amount;
    return { ...item, amount };
  });
  return { computedLabItems: computed, grandTotal: Math.round(grandTotal * 100) / 100 };
}

function computeIP(ipItems, ipConsultFee, ipPharmacyTotal, ipLabTotal, ipDiscount, ipAdvancePaid) {
  let chargesTotal = 0;
  const computed = ipItems.map((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const disc = Number(item.discountPercent) || 0;
    const gross = qty * rate;
    const amount = Math.round((gross - (gross * disc / 100)) * 100) / 100;
    chargesTotal += amount;
    return { ...item, amount };
  });
  const grandTotal = Math.max(0, Math.round(
    (chargesTotal + Number(ipConsultFee || 0) + Number(ipPharmacyTotal || 0) + Number(ipLabTotal || 0)
      - Number(ipDiscount || 0) - Number(ipAdvancePaid || 0)) * 100) / 100);
  return { computedIPItems: computed, grandTotal };
}

// GET /api/bills?search=&page=&billType=
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20, billType } = req.query;
    const query = {};
    if (billType) query.billType = billType;
    if (search) {
      query.$or = [
        { billNo: { $regex: search, $options: "i" } },
        { "patient.name": { $regex: search, $options: "i" } },
        { "patient.phone": { $regex: search, $options: "i" } },
        { "patient.uhid": { $regex: search, $options: "i" } },
      ];
    }
    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ bills, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bills/next-number
router.get("/next-number", async (req, res) => {
  try {
    const last = await Bill.findOne().sort({ createdAt: -1 });
    let next = 1;
    if (last && last.billNo) {
      const num = parseInt(last.billNo.replace(/\D/g, ""), 10);
      if (!isNaN(num)) next = num + 1;
    }
    res.json({ billNo: String(next) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bills/:id
router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bills
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const { billType = "pharmacy" } = body;
    let extra = {};

    if (billType === "pharmacy") {
      const { computedItems, hsnSummary, totalQty, totalTaxableValue, totalIgstAmount, grandTotal } = computePharmacy(body.items || []);
      extra = { items: computedItems, hsnSummary, totalQty, totalTaxableValue, totalIgstAmount, grandTotal, amountInWords: numberToWordsINR(grandTotal), taxAmountInWords: numberToWordsINR(totalIgstAmount) };
    } else if (billType === "lab") {
      const { computedLabItems, grandTotal } = computeLab(body.labItems || []);
      extra = { labItems: computedLabItems, grandTotal, amountInWords: numberToWordsINR(grandTotal) };
    } else if (billType === "consultation") {
      const grandTotal = Number(body.consultationFee || 0);
      extra = { grandTotal, amountInWords: numberToWordsINR(grandTotal) };
    } else if (billType === "ip") {
      const { computedIPItems, grandTotal } = computeIP(body.ipItems || [], body.ipConsultFee, body.ipPharmacyTotal, body.ipLabTotal, body.ipDiscount, body.ipAdvancePaid);
      extra = { ipItems: computedIPItems, grandTotal, amountInWords: numberToWordsINR(grandTotal) };
    }

    const bill = await Bill.create({ ...body, ...extra });
    res.status(201).json(bill);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Bill number already exists" });
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bills/:id
router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    const { billType = "pharmacy" } = body;
    let extra = {};

    if (billType === "pharmacy") {
      const { computedItems, hsnSummary, totalQty, totalTaxableValue, totalIgstAmount, grandTotal } = computePharmacy(body.items || []);
      extra = { items: computedItems, hsnSummary, totalQty, totalTaxableValue, totalIgstAmount, grandTotal, amountInWords: numberToWordsINR(grandTotal), taxAmountInWords: numberToWordsINR(totalIgstAmount) };
    } else if (billType === "lab") {
      const { computedLabItems, grandTotal } = computeLab(body.labItems || []);
      extra = { labItems: computedLabItems, grandTotal, amountInWords: numberToWordsINR(grandTotal) };
    } else if (billType === "consultation") {
      const grandTotal = Number(body.consultationFee || 0);
      extra = { grandTotal, amountInWords: numberToWordsINR(grandTotal) };
    } else if (billType === "ip") {
      const { computedIPItems, grandTotal } = computeIP(body.ipItems || [], body.ipConsultFee, body.ipPharmacyTotal, body.ipLabTotal, body.ipDiscount, body.ipAdvancePaid);
      extra = { ipItems: computedIPItems, grandTotal, amountInWords: numberToWordsINR(grandTotal) };
    }

    const bill = await Bill.findByIdAndUpdate(req.params.id, { ...body, ...extra }, { new: true });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bills/:id
router.delete("/:id", async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json({ message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;