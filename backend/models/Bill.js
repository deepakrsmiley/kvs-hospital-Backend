import mongoose from "mongoose";

const pharmItemSchema = new mongoose.Schema(
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
    igstPercent: { type: Number, default: 12 },
    taxableValue: { type: Number, default: 0 },
  },
  { _id: false }
);

const labItemSchema = new mongoose.Schema(
  {
    testName: String,
    qty: { type: Number, default: 1 },
    rate: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const ipItemSchema = new mongoose.Schema(
  {
    description: String,
    qty: { type: Number, default: 1 },
    rate: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
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

const billSchema = new mongoose.Schema(
  {
    billNo: { type: String, required: true, unique: true },
    billDate: { type: String, required: true },
    billType: {
      type: String,
      enum: ["pharmacy", "lab", "consultation", "ip"],
      default: "pharmacy",
    },

    // Patient (shared across all types)
    patient: {
      name: String,
      uhid: String,
      age: String,
      gender: String,
      phone: String,
      address: String,
      referredBy: String,
      ipNo: String,
      wardBed: String,
    },

    // Payment
    status: { type: String, enum: ["paid", "unpaid", "partial"], default: "unpaid" },
    paymentMode: { type: String, default: "cash" },
    amountPaid: { type: Number, default: 0 },

    // ── PHARMACY fields ──
    items: [pharmItemSchema],
    hsnSummary: [hsnSummarySchema],
    totalQty: { type: Number, default: 0 },
    totalTaxableValue: { type: Number, default: 0 },
    totalIgstAmount: { type: Number, default: 0 },

    // ── LAB fields ──
    labItems: [labItemSchema],

    // ── CONSULTATION fields ──
    consultationFee: { type: Number, default: 0 },
    consultationDoctor: { type: String, default: "" },
    consultationSpeciality: { type: String, default: "" },
    consultationNotes: { type: String, default: "" },
    consultationDate: { type: String, default: "" },

    // ── IP fields ──
    ipAdmitDate: { type: String, default: "" },
    ipDischargeDate: { type: String, default: "" },
    ipDiagnosis: { type: String, default: "" },
    ipAttendingDoctor: { type: String, default: "" },
    ipDepartment: { type: String, default: "" },
    ipItems: [ipItemSchema],
    ipConsultFee: { type: Number, default: 0 },
    ipPharmacyTotal: { type: Number, default: 0 },
    ipLabTotal: { type: Number, default: 0 },
    ipDiscount: { type: Number, default: 0 },
    ipAdvancePaid: { type: Number, default: 0 },

    // Computed
    grandTotal: { type: Number, default: 0 },
    amountInWords: String,
    taxAmountInWords: String,
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);