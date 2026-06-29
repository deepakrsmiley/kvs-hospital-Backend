import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";

// ─── Lab tests master list ───────────────────────────────────────────────────
const LAB_TESTS = [
  // Haematology
  { group: "Haematology", name: "Complete Blood Count (CBC)", rate: 200 },
  { group: "Haematology", name: "Haemoglobin (Hb)", rate: 80 },
  { group: "Haematology", name: "ESR (Erythrocyte Sedimentation Rate)", rate: 80 },
  { group: "Haematology", name: "Peripheral Blood Smear", rate: 150 },
  { group: "Haematology", name: "Platelet Count", rate: 100 },
  { group: "Haematology", name: "WBC Differential Count", rate: 100 },
  { group: "Haematology", name: "Reticulocyte Count", rate: 120 },
  { group: "Haematology", name: "Packed Cell Volume (PCV / Haematocrit)", rate: 80 },
  { group: "Haematology", name: "Blood Group & Rh Typing", rate: 150 },
  { group: "Haematology", name: "Coagulation Profile (PT, APTT, INR)", rate: 350 },
  { group: "Haematology", name: "D-Dimer", rate: 600 },
  { group: "Haematology", name: "Fibrinogen", rate: 400 },

  // Biochemistry
  { group: "Biochemistry", name: "Fasting Blood Glucose (FBS)", rate: 80 },
  { group: "Biochemistry", name: "Post Prandial Blood Glucose (PPBS)", rate: 80 },
  { group: "Biochemistry", name: "Random Blood Glucose (RBS)", rate: 60 },
  { group: "Biochemistry", name: "HbA1c (Glycated Haemoglobin)", rate: 350 },
  { group: "Biochemistry", name: "Lipid Profile", rate: 400 },
  { group: "Biochemistry", name: "Total Cholesterol", rate: 120 },
  { group: "Biochemistry", name: "Triglycerides", rate: 120 },
  { group: "Biochemistry", name: "HDL Cholesterol", rate: 120 },
  { group: "Biochemistry", name: "LDL Cholesterol", rate: 120 },
  { group: "Biochemistry", name: "VLDL Cholesterol", rate: 100 },
  { group: "Biochemistry", name: "Liver Function Test (LFT)", rate: 500 },
  { group: "Biochemistry", name: "SGOT (AST)", rate: 120 },
  { group: "Biochemistry", name: "SGPT (ALT)", rate: 120 },
  { group: "Biochemistry", name: "Alkaline Phosphatase (ALP)", rate: 120 },
  { group: "Biochemistry", name: "GGT (Gamma GT)", rate: 150 },
  { group: "Biochemistry", name: "Total Bilirubin", rate: 120 },
  { group: "Biochemistry", name: "Direct & Indirect Bilirubin", rate: 150 },
  { group: "Biochemistry", name: "Total Protein & Albumin", rate: 150 },
  { group: "Biochemistry", name: "Kidney Function Test (KFT/RFT)", rate: 450 },
  { group: "Biochemistry", name: "Serum Creatinine", rate: 120 },
  { group: "Biochemistry", name: "Blood Urea Nitrogen (BUN)", rate: 120 },
  { group: "Biochemistry", name: "Uric Acid", rate: 120 },
  { group: "Biochemistry", name: "eGFR", rate: 100 },
  { group: "Biochemistry", name: "Serum Electrolytes (Na, K, Cl)", rate: 300 },
  { group: "Biochemistry", name: "Serum Sodium (Na)", rate: 120 },
  { group: "Biochemistry", name: "Serum Potassium (K)", rate: 120 },
  { group: "Biochemistry", name: "Serum Chloride (Cl)", rate: 120 },
  { group: "Biochemistry", name: "Serum Calcium", rate: 120 },
  { group: "Biochemistry", name: "Serum Phosphorus", rate: 120 },
  { group: "Biochemistry", name: "Serum Magnesium", rate: 150 },
  { group: "Biochemistry", name: "Serum Iron & TIBC", rate: 300 },
  { group: "Biochemistry", name: "Serum Ferritin", rate: 400 },
  { group: "Biochemistry", name: "Serum B12 (Cobalamin)", rate: 500 },
  { group: "Biochemistry", name: "Serum Folic Acid", rate: 450 },
  { group: "Biochemistry", name: "Serum Vitamin D (25-OH)", rate: 800 },
  { group: "Biochemistry", name: "Amylase", rate: 200 },
  { group: "Biochemistry", name: "Lipase", rate: 250 },
  { group: "Biochemistry", name: "CRP (C-Reactive Protein)", rate: 300 },
  { group: "Biochemistry", name: "hs-CRP (High Sensitivity CRP)", rate: 450 },
  { group: "Biochemistry", name: "Procalcitonin (PCT)", rate: 800 },

  // Thyroid
  { group: "Thyroid", name: "TSH (Thyroid Stimulating Hormone)", rate: 300 },
  { group: "Thyroid", name: "T3 (Triiodothyronine)", rate: 250 },
  { group: "Thyroid", name: "T4 (Thyroxine)", rate: 250 },
  { group: "Thyroid", name: "Thyroid Profile (T3, T4, TSH)", rate: 600 },
  { group: "Thyroid", name: "Anti-TPO Antibodies", rate: 600 },
  { group: "Thyroid", name: "Anti-Thyroglobulin Antibodies", rate: 600 },

  // Hormones
  { group: "Hormones", name: "Prolactin", rate: 400 },
  { group: "Hormones", name: "FSH (Follicle Stimulating Hormone)", rate: 400 },
  { group: "Hormones", name: "LH (Luteinizing Hormone)", rate: 400 },
  { group: "Hormones", name: "Testosterone (Total)", rate: 500 },
  { group: "Hormones", name: "Oestradiol (E2)", rate: 500 },
  { group: "Hormones", name: "Progesterone", rate: 500 },
  { group: "Hormones", name: "DHEA-S", rate: 500 },
  { group: "Hormones", name: "Cortisol (Morning)", rate: 500 },
  { group: "Hormones", name: "Insulin Fasting", rate: 400 },
  { group: "Hormones", name: "HOMA-IR", rate: 150 },
  { group: "Hormones", name: "Beta-HCG (Pregnancy Test)", rate: 350 },

  // Cardiac Markers
  { group: "Cardiac Markers", name: "Troponin I (Rapid)", rate: 600 },
  { group: "Cardiac Markers", name: "Troponin T (hsTnT)", rate: 800 },
  { group: "Cardiac Markers", name: "CK-MB", rate: 400 },
  { group: "Cardiac Markers", name: "CPK (Creatine Phosphokinase)", rate: 300 },
  { group: "Cardiac Markers", name: "NT-proBNP", rate: 1200 },
  { group: "Cardiac Markers", name: "Homocysteine", rate: 700 },
  { group: "Cardiac Markers", name: "Lp(a) – Lipoprotein(a)", rate: 700 },

  // Urine
  { group: "Urine", name: "Urine Routine & Microscopy", rate: 100 },
  { group: "Urine", name: "Urine Culture & Sensitivity", rate: 400 },
  { group: "Urine", name: "Urine Pregnancy Test (UPT)", rate: 100 },
  { group: "Urine", name: "Urine Albumin (Spot)", rate: 100 },
  { group: "Urine", name: "Urine Creatinine", rate: 120 },
  { group: "Urine", name: "Microalbuminuria (Spot)", rate: 300 },
  { group: "Urine", name: "24-Hour Urine Protein", rate: 200 },
  { group: "Urine", name: "Urine Bilirubin & Urobilinogen", rate: 100 },

  // Stool
  { group: "Stool", name: "Stool Routine & Microscopy", rate: 100 },
  { group: "Stool", name: "Stool Occult Blood", rate: 150 },
  { group: "Stool", name: "Stool Culture", rate: 350 },
  { group: "Stool", name: "H. Pylori Stool Antigen", rate: 400 },

  // Microbiology / Serology
  { group: "Microbiology / Serology", name: "Blood Culture & Sensitivity", rate: 600 },
  { group: "Microbiology / Serology", name: "Sputum Culture & Sensitivity", rate: 500 },
  { group: "Microbiology / Serology", name: "Wound Swab Culture", rate: 450 },
  { group: "Microbiology / Serology", name: "WIDAL Test", rate: 200 },
  { group: "Microbiology / Serology", name: "Dengue NS1 Antigen", rate: 450 },
  { group: "Microbiology / Serology", name: "Dengue IgG & IgM", rate: 450 },
  { group: "Microbiology / Serology", name: "Malaria Antigen (Rapid)", rate: 250 },
  { group: "Microbiology / Serology", name: "Malaria Smear (MP)", rate: 150 },
  { group: "Microbiology / Serology", name: "Typhidot (IgG & IgM)", rate: 350 },
  { group: "Microbiology / Serology", name: "Leptospira IgM (ELISA)", rate: 500 },
  { group: "Microbiology / Serology", name: "Scrub Typhus IgM", rate: 500 },
  { group: "Microbiology / Serology", name: "Chikungunya IgM", rate: 500 },
  { group: "Microbiology / Serology", name: "HIV 1 & 2 (ELISA)", rate: 250 },
  { group: "Microbiology / Serology", name: "HBsAg (Hepatitis B)", rate: 200 },
  { group: "Microbiology / Serology", name: "Anti-HCV (Hepatitis C)", rate: 300 },
  { group: "Microbiology / Serology", name: "VDRL (Syphilis)", rate: 150 },
  { group: "Microbiology / Serology", name: "TPHA (Syphilis Confirmation)", rate: 300 },
  { group: "Microbiology / Serology", name: "RA Factor", rate: 200 },
  { group: "Microbiology / Serology", name: "ASO Titre", rate: 250 },
  { group: "Microbiology / Serology", name: "ANA (Anti-Nuclear Antibody)", rate: 600 },
  { group: "Microbiology / Serology", name: "Anti-dsDNA", rate: 700 },
  { group: "Microbiology / Serology", name: "COVID-19 Antigen (Rapid)", rate: 350 },
  { group: "Microbiology / Serology", name: "COVID-19 RT-PCR", rate: 900 },

  // Tumour Markers
  { group: "Tumour Markers", name: "PSA (Prostate Specific Antigen)", rate: 600 },
  { group: "Tumour Markers", name: "CEA (Carcinoembryonic Antigen)", rate: 700 },
  { group: "Tumour Markers", name: "AFP (Alpha-Fetoprotein)", rate: 700 },
  { group: "Tumour Markers", name: "CA 19-9", rate: 800 },
  { group: "Tumour Markers", name: "CA 125", rate: 800 },
  { group: "Tumour Markers", name: "CA 15-3", rate: 800 },

  // Other
  { group: "Other", name: "Semen Analysis", rate: 400 },
  { group: "Other", name: "Synovial Fluid Analysis", rate: 500 },
  { group: "Other", name: "CSF Analysis", rate: 600 },
  { group: "Other", name: "Pleural Fluid Analysis", rate: 500 },
];

const LAB_GROUPS = [...new Set(LAB_TESTS.map((t) => t.group))];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const emptyPharmacyItem = () => ({
  productName: "", batchNo: "", mfgDate: "", expiryDate: "",
  hsnSac: "", qty: 1, mrp: 0, rate: 0, discountPercent: 0, igstPercent: 12,
});

const emptyLabItem = () => ({
  testName: "", qty: 1, rate: 0, discountPercent: 0,
});

const emptyIPItem = () => ({
  description: "", qty: 1, rate: 0, discountPercent: 0,
});

const IP_CHARGE_TYPES = [
  // Room / Accommodation
  "General Ward Charges",
  "Semi-Private Room Charges",
  "Private Room Charges",
  "Deluxe Room Charges",
  "Suite Room Charges",
  "ICU Charges",
  "NICU Charges",
  "PICU Charges",
  "HDU (High Dependency Unit) Charges",
  "Isolation Room Charges",

  // Doctor / Consultant
  "Consultant Visit Charges",
  "Specialist Consultation Charges",
  "Surgeon Charges",
  "Anaesthetist Charges",
  "Intensivist Charges",
  "Resident Doctor Charges",
  "Second Opinion Charges",

  // Nursing & Care
  "Nursing Charges",
  "Special Nursing / Private Nurse Charges",
  "Attendant Charges",
  "Night Duty Charges",

  // Operation Theatre
  "OT Charges (Major)",
  "OT Charges (Minor)",
  "OT Charges (Emergency)",
  "Endoscopy / Laparoscopy Charges",
  "C-Section / LSCS Charges",
  "Delivery Charges (Normal)",
  "Surgical Instrument Charges",
  "Surgical Disposables",

  // Investigation / Diagnostics
  "Laboratory / Lab Charges",
  "X-Ray Charges",
  "ECG Charges",
  "Echo / 2D Echo Charges",
  "Ultrasound Charges",
  "CT Scan Charges",
  "MRI Charges",
  "Doppler Charges",
  "Colour Doppler Charges",
  "Biopsy / Histopathology Charges",
  "Endoscopy Charges",

  // Pharmacy & Consumables
  "Pharmacy / Medicine Charges",
  "IV Fluids Charges",
  "Surgical Consumables",
  "Implant / Prosthesis Charges",
  "Suture / Dressing Material",

  // Procedures & Therapy
  "Procedure Charges",
  "Dressing Charges",
  "Injection Charges",
  "IV Line / Cannula Insertion",
  "Catheterisation Charges",
  "Physiotherapy Charges",
  "Respiratory Therapy Charges",
  "Dialysis Charges",
  "Chemotherapy Charges",
  "Radiation Charges",
  "Blood Transfusion Charges",
  "Plasma / Platelet Transfusion",

  // Support Services
  "Oxygen Charges",
  "Ventilator Charges",
  "Nebulisation Charges",
  "Pulse Oximetry / Monitor Charges",
  "Ambulance Charges",
  "Mortuary Charges",

  // Administrative
  "Registration / Admission Charges",
  "Medical Certificate Charges",
  "Case Sheet / Record Charges",
  "Insurance Processing Charges",
  "Discharge Summary Charges",
  "Miscellaneous Charges",
];

export default function BillForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Bill type
  const [billType, setBillType] = useState("pharmacy"); // pharmacy | lab | consultation | ip

  // Common patient info
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [patient, setPatient] = useState({
    name: "", age: "", gender: "", phone: "", address: "",
    uhid: "", ipNo: "", wardBed: "", referredBy: "",
  });
  const [status, setStatus] = useState("unpaid");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);

  // Pharmacy
  const [pharmItems, setPharmItems] = useState([emptyPharmacyItem()]);

  // Lab
  const [labItems, setLabItems] = useState([emptyLabItem()]);
  const [labSearch, setLabSearch] = useState("");
  const [labGroup, setLabGroup] = useState("All");
  const [showLabPicker, setShowLabPicker] = useState(false);

  // Consultation
  const [consultationFee, setConsultationFee] = useState(0);
  const [consultationDoctor, setConsultationDoctor] = useState("");
  const [consultationSpeciality, setConsultationSpeciality] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [consultationDate, setConsultationDate] = useState(() => new Date().toISOString().slice(0, 10));

  // IP Overall
  const [ipAdmitDate, setIpAdmitDate] = useState("");
  const [ipDischargeDate, setIpDischargeDate] = useState("");
  const [ipDiagnosis, setIpDiagnosis] = useState("");
  const [ipAttendingDoctor, setIpAttendingDoctor] = useState("");
  const [ipDepartment, setIpDepartment] = useState("");
  const [ipItems, setIpItems] = useState([{ ...emptyIPItem(), description: "General Ward Charges" }]);
  const [ipConsultFee, setIpConsultFee] = useState(0);
  const [ipPharmacyTotal, setIpPharmacyTotal] = useState(0);
  const [ipLabTotal, setIpLabTotal] = useState(0);
  const [ipDiscount, setIpDiscount] = useState(0);
  const [ipAdvancePaid, setIpAdvancePaid] = useState(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load edit data
  useEffect(() => {
    if (isEdit) {
      api.get(`/bills/${id}`).then((res) => {
        const b = res.data;
        setBillType(b.billType || "pharmacy");
        setBillNo(b.billNo);
        setBillDate(b.billDate);
        setPatient(b.patient || {});
        setStatus(b.status || "unpaid");
        setPaymentMode(b.paymentMode || "cash");
        setAmountPaid(b.amountPaid || 0);
        if (b.billType === "pharmacy") setPharmItems(b.items?.length ? b.items : [emptyPharmacyItem()]);
        if (b.billType === "lab") setLabItems(b.labItems?.length ? b.labItems : [emptyLabItem()]);
        if (b.billType === "consultation") {
          setConsultationFee(b.consultationFee || 0);
          setConsultationDoctor(b.consultationDoctor || "");
          setConsultationSpeciality(b.consultationSpeciality || "");
          setConsultationNotes(b.consultationNotes || "");
          setConsultationDate(b.consultationDate || b.billDate);
        }
        if (b.billType === "ip") {
          setIpAdmitDate(b.ipAdmitDate || "");
          setIpDischargeDate(b.ipDischargeDate || "");
          setIpDiagnosis(b.ipDiagnosis || "");
          setIpAttendingDoctor(b.ipAttendingDoctor || "");
          setIpDepartment(b.ipDepartment || "");
          setIpItems(b.ipItems?.length ? b.ipItems : [{ ...emptyIPItem(), description: "Room Charges" }]);
          setIpConsultFee(b.ipConsultFee || 0);
          setIpPharmacyTotal(b.ipPharmacyTotal || 0);
          setIpLabTotal(b.ipLabTotal || 0);
          setIpDiscount(b.ipDiscount || 0);
          setIpAdvancePaid(b.ipAdvancePaid || 0);
        }
      });
    } else {
      api.get("/bills/next-number").then((res) => setBillNo(res.data.billNo));
    }
  }, [id, isEdit]);

  // ── Pharmacy helpers ──────────────────────────────────────────────────────
  const updatePharm = (idx, key, val) =>
    setPharmItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  const addPharm = () => setPharmItems((p) => [...p, emptyPharmacyItem()]);
  const removePharm = (idx) => setPharmItems((p) => p.filter((_, i) => i !== idx));

  const calcPharmTaxable = (item) => {
    const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const disc = (gross * (Number(item.discountPercent) || 0)) / 100;
    return Math.round((gross - disc) * 100) / 100;
  };
  const pharmSubtotal = pharmItems.reduce((s, it) => s + calcPharmTaxable(it), 0);
  const pharmIgst = pharmItems.reduce((s, it) => {
    const tax = calcPharmTaxable(it);
    return s + Math.round((tax * (Number(it.igstPercent) || 12)) / 100 * 100) / 100;
  }, 0);
  const pharmTotal = Math.round((pharmSubtotal + pharmIgst) * 100) / 100;

  // ── Lab helpers ───────────────────────────────────────────────────────────
  const updateLab = (idx, key, val) =>
    setLabItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  const addLab = () => setLabItems((p) => [...p, emptyLabItem()]);
  const removeLab = (idx) => setLabItems((p) => p.filter((_, i) => i !== idx));
  const addTestFromPicker = (test) => {
    setLabItems((p) => [...p.filter((x) => x.testName !== ""), { testName: test.name, qty: 1, rate: test.rate, discountPercent: 0 }]);
  };
  const calcLabLine = (item) => {
    const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const disc = (gross * (Number(item.discountPercent) || 0)) / 100;
    return Math.round((gross - disc) * 100) / 100;
  };
  const labTotal = labItems.reduce((s, it) => s + calcLabLine(it), 0);

  const filteredTests = LAB_TESTS.filter((t) => {
    const matchGroup = labGroup === "All" || t.group === labGroup;
    const matchSearch = t.name.toLowerCase().includes(labSearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  // ── IP helpers ────────────────────────────────────────────────────────────
  const updateIP = (idx, key, val) =>
    setIpItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  const addIP = () => setIpItems((p) => [...p, emptyIPItem()]);
  const removeIP = (idx) => setIpItems((p) => p.filter((_, i) => i !== idx));
  const calcIPLine = (item) => {
    const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const disc = (gross * (Number(item.discountPercent) || 0)) / 100;
    return Math.round((gross - disc) * 100) / 100;
  };
  const ipChargesSubtotal = ipItems.reduce((s, it) => s + calcIPLine(it), 0);
  const ipGrandTotal = Math.max(0, Math.round(
    (ipChargesSubtotal + Number(ipConsultFee || 0) + Number(ipPharmacyTotal || 0) + Number(ipLabTotal || 0)
      - Number(ipDiscount || 0) - Number(ipAdvancePaid || 0)) * 100) / 100);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const common = { billType, billNo, billDate, patient, status, paymentMode, amountPaid: Number(amountPaid || 0) };
      let payload = { ...common };

      if (billType === "pharmacy") {
        payload = { ...payload, items: pharmItems };
      } else if (billType === "lab") {
        payload = { ...payload, labItems };
      } else if (billType === "consultation") {
        payload = { ...payload, consultationFee: Number(consultationFee || 0), consultationDoctor, consultationSpeciality, consultationNotes, consultationDate };
      } else if (billType === "ip") {
        payload = { ...payload, ipAdmitDate, ipDischargeDate, ipDiagnosis, ipAttendingDoctor, ipDepartment, ipItems, ipConsultFee: Number(ipConsultFee || 0), ipPharmacyTotal: Number(ipPharmacyTotal || 0), ipLabTotal: Number(ipLabTotal || 0), ipDiscount: Number(ipDiscount || 0), ipAdvancePaid: Number(ipAdvancePaid || 0) };
      }

      let res;
      if (isEdit) {
        res = await api.put(`/bills/${id}`, payload);
      } else {
        res = await api.post("/bills", payload);
      }
      navigate(`/bills/${res.data._id}/print`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save bill");
    } finally {
      setSaving(false);
    }
  };

  // ── Patient Info (common for all) ────────────────────────────────────────
  const PatientInfo = () => (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="section-header">Patient Information</div>
      <div className="grid grid-2" style={{ marginBottom: 0 }}>
        <div className="form-group">
          <label>Patient Name <span className="req">*</span></label>
          <input className="form-control" value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} placeholder="Enter patient name" required />
        </div>
        <div className="form-group">
          <label>UHID / Patient ID</label>
          <input className="form-control" value={patient.uhid} onChange={(e) => setPatient({ ...patient, uhid: e.target.value })} placeholder="e.g. KVS-00123" />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input className="form-control" value={patient.age} onChange={(e) => setPatient({ ...patient, age: e.target.value })} placeholder="e.g. 45 Yrs" />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select className="form-control" value={patient.gender} onChange={(e) => setPatient({ ...patient, gender: e.target.value })}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Mobile Number</label>
          <input className="form-control" value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} placeholder="Enter mobile" />
        </div>
        <div className="form-group">
          <label>Referred By Doctor</label>
          <input className="form-control" value={patient.referredBy} onChange={(e) => setPatient({ ...patient, referredBy: e.target.value })} placeholder="Referring doctor name" />
        </div>
        <div className="form-group" style={{ gridColumn: "1 / 3" }}>
          <label>Address</label>
          <input className="form-control" value={patient.address} onChange={(e) => setPatient({ ...patient, address: e.target.value })} placeholder="Patient address" />
        </div>
      </div>
    </div>
  );

  const BillMeta = () => (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="section-header">Bill Details</div>
      <div className="grid grid-2">
        <div className="form-group">
          <label>Bill Date <span className="req">*</span></label>
          <input type="date" className="form-control" value={billDate} onChange={(e) => setBillDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Payment Status</label>
          <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        <div className="form-group">
          <label>Payment Mode</label>
          <select className="form-control" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="cheque">Cheque</option>
            <option value="insurance">Insurance</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount Paid (₹)</label>
          <input type="number" className="form-control" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} min="0" step="0.01" placeholder="0.00" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Dashboard / Bills / {isEdit ? "Edit" : "New"}</div>
          <h2 style={{ margin: 0 }}>{isEdit ? "Edit Bill" : "New Bill"}</h2>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      {/* Bill Type Selector */}
      {!isEdit && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-header">Select Bill Type</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { key: "pharmacy", label: "Pharmacy Bill" },
              { key: "lab", label: "Lab Bill" },
              { key: "consultation", label: "Consultation Bill" },
              { key: "ip", label: "IP Overall Bill" },
            ].map((bt) => (
              <button
                key={bt.key}
                type="button"
                onClick={() => setBillType(bt.key)}
                style={{
                  padding: "10px 22px",
                  borderRadius: 8,
                  border: billType === bt.key ? "2px solid var(--primary)" : "2px solid var(--border)",
                  background: billType === bt.key ? "var(--primary)" : "#fff",
                  color: billType === bt.key ? "#fff" : "var(--text-dark)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {bt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <PatientInfo />

        {/* ═══ PHARMACY ═══ */}
        {billType === "pharmacy" && (
          <>
            <BillMeta />
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="section-header" style={{ margin: 0, border: "none", padding: 0 }}>Pharmacy Items</div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addPharm}>+ Add Item</button>
              </div>
              <div className="table-wrap">
                <table className="data-table items-table" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 32 }}>#</th>
                      <th>Product / Medicine</th>
                      <th>Batch No</th>
                      <th>Mfg Date</th>
                      <th>Expiry Date</th>
                      <th>HSN/SAC</th>
                      <th style={{ width: 56 }}>Qty</th>
                      <th style={{ width: 70 }}>MRP</th>
                      <th style={{ width: 70 }}>Rate</th>
                      <th style={{ width: 60 }}>Disc %</th>
                      <th style={{ width: 60 }}>IGST %</th>
                      <th style={{ textAlign: "right" }}>Taxable</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmItems.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "center", fontWeight: 600 }}>{idx + 1}</td>
                        <td><input value={item.productName} onChange={(e) => updatePharm(idx, "productName", e.target.value)} placeholder="Medicine name" required /></td>
                        <td><input value={item.batchNo} onChange={(e) => updatePharm(idx, "batchNo", e.target.value)} /></td>
                        <td><input value={item.mfgDate} placeholder="MMM YYYY" onChange={(e) => updatePharm(idx, "mfgDate", e.target.value)} /></td>
                        <td><input value={item.expiryDate} placeholder="MMM YYYY" onChange={(e) => updatePharm(idx, "expiryDate", e.target.value)} /></td>
                        <td><input value={item.hsnSac} onChange={(e) => updatePharm(idx, "hsnSac", e.target.value)} /></td>
                        <td><input type="number" value={item.qty} onChange={(e) => updatePharm(idx, "qty", e.target.value)} min="1" /></td>
                        <td><input type="number" value={item.mrp} onChange={(e) => updatePharm(idx, "mrp", e.target.value)} min="0" /></td>
                        <td><input type="number" value={item.rate} onChange={(e) => updatePharm(idx, "rate", e.target.value)} min="0" /></td>
                        <td><input type="number" value={item.discountPercent} onChange={(e) => updatePharm(idx, "discountPercent", e.target.value)} min="0" max="100" /></td>
                        <td><input type="number" value={item.igstPercent} onChange={(e) => updatePharm(idx, "igstPercent", e.target.value)} min="0" /></td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>₹{calcPharmTaxable(item).toFixed(2)}</td>
                        <td><button type="button" className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} onClick={() => removePharm(idx)}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <div className="totals-box">
                  <div className="totals-row"><span>Subtotal</span><span>₹{pharmSubtotal.toFixed(2)}</span></div>
                  <div className="totals-row"><span>IGST</span><span>₹{pharmIgst.toFixed(2)}</span></div>
                  <div className="totals-row grand"><span>Grand Total</span><span>₹{pharmTotal.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ LAB ═══ */}
        {billType === "lab" && (
          <>
            <BillMeta />
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="section-header" style={{ margin: 0, border: "none", padding: 0 }}>Lab Tests</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowLabPicker(!showLabPicker)}>
                    {showLabPicker ? "Close Test Picker" : "Select from Test List"}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addLab}>+ Add Manual</button>
                </div>
              </div>

              {/* Test Picker */}
              {showLabPicker && (
                <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <input
                      className="form-control"
                      style={{ maxWidth: 280 }}
                      placeholder="Search test name..."
                      value={labSearch}
                      onChange={(e) => setLabSearch(e.target.value)}
                    />
                    <select className="form-control" style={{ maxWidth: 200 }} value={labGroup} onChange={(e) => setLabGroup(e.target.value)}>
                      <option value="All">All Groups</option>
                      {LAB_GROUPS.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 6, maxHeight: 320, overflowY: "auto" }}>
                    {filteredTests.map((t, i) => {
                      const already = labItems.some((x) => x.testName === t.name);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => !already && addTestFromPicker(t)}
                          style={{
                            textAlign: "left", padding: "7px 12px", borderRadius: 6,
                            border: already ? "1px solid var(--accent)" : "1px solid var(--border)",
                            background: already ? "#f0fdf4" : "#fff",
                            color: already ? "var(--accent)" : "var(--text-dark)",
                            fontSize: 12.5, cursor: already ? "default" : "pointer",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{t.name}</span>
                          <span style={{ color: "#6b7280", fontSize: 11.5 }}>₹{t.rate}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="table-wrap">
                <table className="data-table items-table" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 32 }}>#</th>
                      <th>Test Name</th>
                      <th style={{ width: 56 }}>Qty</th>
                      <th style={{ width: 90 }}>Rate (₹)</th>
                      <th style={{ width: 80 }}>Disc %</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {labItems.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "center", fontWeight: 600 }}>{idx + 1}</td>
                        <td><input value={item.testName} onChange={(e) => updateLab(idx, "testName", e.target.value)} placeholder="Test name" required /></td>
                        <td><input type="number" value={item.qty} onChange={(e) => updateLab(idx, "qty", e.target.value)} min="1" /></td>
                        <td><input type="number" value={item.rate} onChange={(e) => updateLab(idx, "rate", e.target.value)} min="0" /></td>
                        <td><input type="number" value={item.discountPercent} onChange={(e) => updateLab(idx, "discountPercent", e.target.value)} min="0" max="100" /></td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>₹{calcLabLine(item).toFixed(2)}</td>
                        <td><button type="button" className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeLab(idx)}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <div className="totals-box">
                  <div className="totals-row grand"><span>Total</span><span>₹{labTotal.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ CONSULTATION ═══ */}
        {billType === "consultation" && (
          <>
            <BillMeta />
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="section-header">Consultation Details</div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Consultation Date <span className="req">*</span></label>
                  <input type="date" className="form-control" value={consultationDate} onChange={(e) => setConsultationDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Consultation Fee (₹) <span className="req">*</span></label>
                  <input type="number" className="form-control" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} min="0" step="0.01" placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label>Doctor Name <span className="req">*</span></label>
                  <input className="form-control" value={consultationDoctor} onChange={(e) => setConsultationDoctor(e.target.value)} placeholder="Dr. Name" required />
                </div>
                <div className="form-group">
                  <label>Speciality / Department</label>
                  <input className="form-control" value={consultationSpeciality} onChange={(e) => setConsultationSpeciality(e.target.value)} placeholder="e.g. General Medicine, Cardiology" />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / 3" }}>
                  <label>Visit Type / Notes</label>
                  <input className="form-control" value={consultationNotes} onChange={(e) => setConsultationNotes(e.target.value)} placeholder="e.g. New Consultation, Follow-up, OPD, Review Visit..." />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <div className="totals-box">
                  <div className="totals-row grand"><span>Consultation Fee</span><span>₹{Number(consultationFee || 0).toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ IP OVERALL ═══ */}
        {billType === "ip" && (
          <>
            {/* IP Specific Patient Fields */}
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="section-header">Admission Details</div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>IP Number</label>
                  <input className="form-control" value={patient.ipNo} onChange={(e) => setPatient({ ...patient, ipNo: e.target.value })} placeholder="e.g. IP-2024-001" />
                </div>
                <div className="form-group">
                  <label>Ward / Bed Number</label>
                  <input className="form-control" value={patient.wardBed} onChange={(e) => setPatient({ ...patient, wardBed: e.target.value })} placeholder="e.g. Ward 2 / Bed 5" />
                </div>
                <div className="form-group">
                  <label>Date of Admission <span className="req">*</span></label>
                  <input type="date" className="form-control" value={ipAdmitDate} onChange={(e) => setIpAdmitDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Date of Discharge <span className="req">*</span></label>
                  <input type="date" className="form-control" value={ipDischargeDate} onChange={(e) => setIpDischargeDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Attending Doctor <span className="req">*</span></label>
                  <input className="form-control" value={ipAttendingDoctor} onChange={(e) => setIpAttendingDoctor(e.target.value)} placeholder="Dr. Name" required />
                </div>
                <div className="form-group">
                  <label>Department / Speciality</label>
                  <input className="form-control" value={ipDepartment} onChange={(e) => setIpDepartment(e.target.value)} placeholder="e.g. Orthopaedics, Medicine" />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / 3" }}>
                  <label>Diagnosis / Procedure</label>
                  <input className="form-control" value={ipDiagnosis} onChange={(e) => setIpDiagnosis(e.target.value)} placeholder="Primary diagnosis or surgical procedure" />
                </div>
              </div>
            </div>

            <BillMeta />

            {/* IP Charges */}
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="section-header" style={{ margin: 0, border: "none", padding: 0 }}>Hospital Charges</div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addIP}>+ Add Charge</button>
              </div>
              <div className="table-wrap">
                <table className="data-table items-table" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 32 }}>#</th>
                      <th>Description / Charge Type</th>
                      <th style={{ width: 56 }}>Qty / Days</th>
                      <th style={{ width: 90 }}>Rate (₹)</th>
                      <th style={{ width: 80 }}>Disc %</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipItems.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "center", fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <select value={item.description} onChange={(e) => updateIP(idx, "description", e.target.value)} style={{ width: "100%", border: "none", background: "transparent", fontSize: 12.5 }}>
                            <optgroup label="Room / Accommodation">
                              <option>General Ward Charges</option>
                              <option>Semi-Private Room Charges</option>
                              <option>Private Room Charges</option>
                              <option>Deluxe Room Charges</option>
                              <option>Suite Room Charges</option>
                              <option>ICU Charges</option>
                              <option>NICU Charges</option>
                              <option>PICU Charges</option>
                              <option>HDU (High Dependency Unit) Charges</option>
                              <option>Isolation Room Charges</option>
                            </optgroup>
                            <optgroup label="Doctor / Consultant">
                              <option>Consultant Visit Charges</option>
                              <option>Specialist Consultation Charges</option>
                              <option>Surgeon Charges</option>
                              <option>Anaesthetist Charges</option>
                              <option>Intensivist Charges</option>
                              <option>Resident Doctor Charges</option>
                              <option>Second Opinion Charges</option>
                            </optgroup>
                            <optgroup label="Nursing & Care">
                              <option>Nursing Charges</option>
                              <option>Special Nursing / Private Nurse Charges</option>
                              <option>Attendant Charges</option>
                              <option>Night Duty Charges</option>
                            </optgroup>
                            <optgroup label="Operation Theatre">
                              <option>OT Charges (Major)</option>
                              <option>OT Charges (Minor)</option>
                              <option>OT Charges (Emergency)</option>
                              <option>Endoscopy / Laparoscopy Charges</option>
                              <option>C-Section / LSCS Charges</option>
                              <option>Delivery Charges (Normal)</option>
                              <option>Surgical Instrument Charges</option>
                              <option>Surgical Disposables</option>
                            </optgroup>
                            <optgroup label="Investigation / Diagnostics">
                              <option>Laboratory / Lab Charges</option>
                              <option>X-Ray Charges</option>
                              <option>ECG Charges</option>
                              <option>Echo / 2D Echo Charges</option>
                              <option>Ultrasound Charges</option>
                              <option>CT Scan Charges</option>
                              <option>MRI Charges</option>
                              <option>Doppler Charges</option>
                              <option>Colour Doppler Charges</option>
                              <option>Biopsy / Histopathology Charges</option>
                              <option>Endoscopy Charges</option>
                            </optgroup>
                            <optgroup label="Pharmacy & Consumables">
                              <option>Pharmacy / Medicine Charges</option>
                              <option>IV Fluids Charges</option>
                              <option>Surgical Consumables</option>
                              <option>Implant / Prosthesis Charges</option>
                              <option>Suture / Dressing Material</option>
                            </optgroup>
                            <optgroup label="Procedures & Therapy">
                              <option>Procedure Charges</option>
                              <option>Dressing Charges</option>
                              <option>Injection Charges</option>
                              <option>IV Line / Cannula Insertion</option>
                              <option>Catheterisation Charges</option>
                              <option>Physiotherapy Charges</option>
                              <option>Respiratory Therapy Charges</option>
                              <option>Dialysis Charges</option>
                              <option>Chemotherapy Charges</option>
                              <option>Radiation Charges</option>
                              <option>Blood Transfusion Charges</option>
                              <option>Plasma / Platelet Transfusion</option>
                            </optgroup>
                            <optgroup label="Support Services">
                              <option>Oxygen Charges</option>
                              <option>Ventilator Charges</option>
                              <option>Nebulisation Charges</option>
                              <option>Pulse Oximetry / Monitor Charges</option>
                              <option>Ambulance Charges</option>
                              <option>Mortuary Charges</option>
                            </optgroup>
                            <optgroup label="Administrative">
                              <option>Registration / Admission Charges</option>
                              <option>Medical Certificate Charges</option>
                              <option>Case Sheet / Record Charges</option>
                              <option>Insurance Processing Charges</option>
                              <option>Discharge Summary Charges</option>
                              <option>Miscellaneous Charges</option>
                            </optgroup>
                          </select>
                        </td>
                        <td><input type="number" value={item.qty} onChange={(e) => updateIP(idx, "qty", e.target.value)} min="1" /></td>
                        <td><input type="number" value={item.rate} onChange={(e) => updateIP(idx, "rate", e.target.value)} min="0" /></td>
                        <td><input type="number" value={item.discountPercent} onChange={(e) => updateIP(idx, "discountPercent", e.target.value)} min="0" max="100" /></td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>₹{calcIPLine(item).toFixed(2)}</td>
                        <td><button type="button" className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeIP(idx)}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Additional totals for IP */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20, padding: "0 4px" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10 }}>Additional Charges Summary</div>
                  <div className="grid grid-2" style={{ gap: 10 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: 12 }}>Consultation Fee (₹)</label>
                      <input type="number" className="form-control" value={ipConsultFee} onChange={(e) => setIpConsultFee(e.target.value)} min="0" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: 12 }}>Pharmacy Total (₹)</label>
                      <input type="number" className="form-control" value={ipPharmacyTotal} onChange={(e) => setIpPharmacyTotal(e.target.value)} min="0" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: 12 }}>Lab / Investigation Total (₹)</label>
                      <input type="number" className="form-control" value={ipLabTotal} onChange={(e) => setIpLabTotal(e.target.value)} min="0" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: 12 }}>Discount (₹)</label>
                      <input type="number" className="form-control" value={ipDiscount} onChange={(e) => setIpDiscount(e.target.value)} min="0" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: 12 }}>Advance Paid (₹)</label>
                      <input type="number" className="form-control" value={ipAdvancePaid} onChange={(e) => setIpAdvancePaid(e.target.value)} min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
                  <div className="totals-box" style={{ minWidth: 260 }}>
                    <div className="totals-row"><span>Hospital Charges</span><span>₹{ipChargesSubtotal.toFixed(2)}</span></div>
                    {Number(ipConsultFee) > 0 && <div className="totals-row"><span>Consultation Fee</span><span>₹{Number(ipConsultFee).toFixed(2)}</span></div>}
                    {Number(ipPharmacyTotal) > 0 && <div className="totals-row"><span>Pharmacy</span><span>₹{Number(ipPharmacyTotal).toFixed(2)}</span></div>}
                    {Number(ipLabTotal) > 0 && <div className="totals-row"><span>Lab / Investigation</span><span>₹{Number(ipLabTotal).toFixed(2)}</span></div>}
                    {Number(ipDiscount) > 0 && <div className="totals-row" style={{ color: "var(--danger)" }}><span>Discount</span><span>- ₹{Number(ipDiscount).toFixed(2)}</span></div>}
                    {Number(ipAdvancePaid) > 0 && <div className="totals-row" style={{ color: "var(--accent)" }}><span>Advance Paid</span><span>- ₹{Number(ipAdvancePaid).toFixed(2)}</span></div>}
                    <div className="totals-row grand"><span>Net Payable</span><span>₹{ipGrandTotal.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Bill" : "Save & Print"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/bills")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}