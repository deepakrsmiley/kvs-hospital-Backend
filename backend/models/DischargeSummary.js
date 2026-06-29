import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
  },
  { _id: false }
);

const dischargeSummarySchema = new mongoose.Schema(
  {
    // Section 1
    patientName: { type: String, required: true },
    dateOfBirth: String,
    age: String,
    gender: String,
    mrn: { type: String, required: true },
    admissionDate: String,
    dischargeDate: String,
    clinicalIntroduction: String, // auto-generated paragraph, editable

    // Section 2
    clinicalCourse: String, // large free text

    // Section 3
    medications: [medicationSchema],

    // Section 4
    followUp: {
      followUpDoctor: String,
      reviewDate: String,
      continuingMedications: String,
      referralInfo: String,
      futureCareInstructions: String,
    },

    // Section 5
    patientEducation: String, // large free text

    // Section 6
    dischargeCondition: String,
    prognosis: String,
    recoveryAdvice: String,

    // Footer
    doctorName: String,
    doctorDesignation: String,
    doctorRegistrationNumber: String,
  },
  { timestamps: true }
);

export default mongoose.model("DischargeSummary", dischargeSummarySchema);
