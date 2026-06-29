import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    srNo: Number,
    productName: String,
    batchNo: String,
    mfgDate: String,
    expiryDate: String,
    hsnSac: String,
    qty: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    taxableValue: { type: Number, default: 0 },
  },
  { _id: false }
);

const hsnSummarySchema = new mongoose.Schema(
  {
    hsnSac: String,
    taxableValue: Number,
    igstPercent: Number,
    igstAmount: Number,
    total: Number,
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    invoiceDate: { type: String, required: true },

    customer: {
      name: String,
      contactPerson: String,
      address: String,
      phone: String,
      gstin: String,
      placeOfSupply: String,
    },

    items: [itemSchema],

    hsnSummary: [hsnSummarySchema],

    // Consultation fees
    consultationFee: { type: Number, default: 0 },
    consultationDoctor: { type: String, default: "" },
    consultationNotes: { type: String, default: "" },

    totalQty: { type: Number, default: 0 },
    totalTaxableValue: { type: Number, default: 0 },
    totalIgstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    amountInWords: String,
    taxAmountInWords: String,

    status: { type: String, enum: ["paid", "unpaid", "partial"], default: "unpaid" },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
