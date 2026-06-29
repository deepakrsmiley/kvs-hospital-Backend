import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";

// ─── Stable unique ID generator ──────────────────────────────────────────────
let _uid = 0;
const uid = () => String(++_uid);

const emptyMed = () => ({ _key: uid(), name: "", dosage: "", frequency: "", duration: "", instructions: "" });

const emptyForm = {
  patientName: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  mrn: "",
  admissionDate: "",
  dischargeDate: "",
  clinicalIntroduction: "",
  clinicalCourse: "",
  medications: [emptyMed()],
  followUp: {
    followUpDoctor: "",
    reviewDate: "",
    continuingMedications: "",
    referralInfo: "",
    futureCareInstructions: "",
  },
  patientEducation: "",
  dischargeCondition: "",
  prognosis: "",
  recoveryAdvice: "",
  doctorName: "",
  doctorDesignation: "",
  doctorRegistrationNumber: "",
};

// When loading from DB, medications won't have _key — assign one
const withKeys = (meds = []) => meds.map((m) => ({ _key: uid(), ...m }));

export default function DischargeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/discharge-summaries/${id}`).then((res) => {
        setForm({
          ...emptyForm,
          ...res.data,
          medications: withKeys(res.data.medications),
          followUp: { ...emptyForm.followUp, ...res.data.followUp },
        });
      });
    } else {
      // prefill doctor details from hospital settings
      api.get("/settings").then((res) => {
        setForm((f) => ({
          ...f,
          doctorName: res.data.doctorName || "",
          doctorDesignation: res.data.doctorDesignation || "",
          doctorRegistrationNumber: res.data.doctorRegistrationNumber || "",
        }));
      });
    }
  }, [id, isEdit]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateFollowUp = (key, value) => setForm((f) => ({ ...f, followUp: { ...f.followUp, [key]: value } }));

  const updateMed = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      medications: f.medications.map((m, i) => (i === idx ? { ...m, [key]: value } : m)),
    }));
  const addMed = () => setForm((f) => ({ ...f, medications: [...f.medications, emptyMed()] }));
  const removeMed = (idx) => setForm((f) => ({ ...f, medications: f.medications.filter((_, i) => i !== idx) }));

  const generateIntro = () => {
    const { patientName, age, gender, admissionDate } = form;
    const g = gender === "Male" ? "male" : gender === "Female" ? "female" : "patient";
    const text = `${patientName || "[Patient Name]"}, a ${age || "[age]"}-year-old ${g}, was admitted on ${admissionDate || "[admission date]"}. The patient presented with the chief complaints noted at admission. On admission, the patient was assessed and management was initiated as per clinical findings.`;
    update("clinicalIntroduction", text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Strip _key before sending to backend
      const payload = {
        ...form,
        medications: form.medications.map(({ _key, ...rest }) => rest),
      };
      let res;
      if (isEdit) {
        res = await api.put(`/discharge-summaries/${id}`, payload);
      } else {
        res = await api.post("/discharge-summaries", payload);
      }
      navigate(`/discharge-summaries/${res.data._id}/print`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save discharge summary");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{isEdit ? "Edit Discharge Summary" : "New Discharge Summary"}</h2>
      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 18 }}>
          <h3 className="card-title">Section 1 — Patient Information and Admission Details</h3>
          <div className="grid grid-3">
            <div className="form-group">
              <label>Patient Name</label>
              <input className="form-control" value={form.patientName} onChange={(e) => update("patientName", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" className="form-control" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input className="form-control" value={form.age} onChange={(e) => update("age", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Medical Record Number (MRN/UHID)</label>
              <input className="form-control" value={form.mrn} onChange={(e) => update("mrn", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Admission Date</label>
              <input type="date" className="form-control" value={form.admissionDate} onChange={(e) => update("admissionDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Discharge Date</label>
              <input type="date" className="form-control" value={form.dischargeDate} onChange={(e) => update("dischargeDate", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ margin: 0 }}>Clinical Introduction Paragraph</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={generateIntro}>✨ Auto-generate</button>
            </div>
            <textarea className="form-control" rows={3} value={form.clinicalIntroduction} onChange={(e) => update("clinicalIntroduction", e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <h3 className="card-title">Section 2 — Summary of Clinical Course</h3>
          <div className="form-group">
            <textarea className="form-control" rows={8} placeholder="Initial findings, investigations, treatment given, progress notes, procedures, hospital course, clinical improvement..." value={form.clinicalCourse} onChange={(e) => update("clinicalCourse", e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="toolbar" style={{ marginBottom: 10 }}>
            <h3 className="card-title" style={{ margin: 0 }}>Section 3 — Discharge Medications</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addMed}>+ Add Medicine</button>
          </div>
          {form.medications.map((med, idx) => (
            // FIX: use stable _key instead of idx — prevents input remount on add/remove
            <div key={med._key} className="grid grid-4" style={{ marginBottom: 10, alignItems: "end" }}>
              <div className="form-group">
                <label>Medicine Name</label>
                <input className="form-control" value={med.name} onChange={(e) => updateMed(idx, "name", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input className="form-control" value={med.dosage} onChange={(e) => updateMed(idx, "dosage", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <input className="form-control" value={med.frequency} onChange={(e) => updateMed(idx, "frequency", e.target.value)} />
              </div>
              <div className="form-group" style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <label>Duration</label>
                  <input className="form-control" value={med.duration} onChange={(e) => updateMed(idx, "duration", e.target.value)} />
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeMed(idx)}>✕</button>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Instructions</label>
                <input className="form-control" value={med.instructions} onChange={(e) => updateMed(idx, "instructions", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <h3 className="card-title">Section 4 — Follow-Up Plan and Continuing Care</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Follow-Up Doctor</label>
              <input className="form-control" value={form.followUp.followUpDoctor} onChange={(e) => updateFollowUp("followUpDoctor", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Review Date</label>
              <input type="date" className="form-control" value={form.followUp.reviewDate} onChange={(e) => updateFollowUp("reviewDate", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Continuing Medications</label>
            <input className="form-control" value={form.followUp.continuingMedications} onChange={(e) => updateFollowUp("continuingMedications", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Referral Information</label>
            <input className="form-control" value={form.followUp.referralInfo} onChange={(e) => updateFollowUp("referralInfo", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Future Care Instructions</label>
            <textarea className="form-control" rows={2} value={form.followUp.futureCareInstructions} onChange={(e) => updateFollowUp("futureCareInstructions", e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <h3 className="card-title">Section 5 — Patient Education and Lifestyle Recommendations</h3>
          <div className="form-group">
            <textarea className="form-control" rows={6} placeholder="Diet advice, activity advice, hydration advice, lifestyle changes, emergency warning signs..." value={form.patientEducation} onChange={(e) => update("patientEducation", e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <h3 className="card-title">Section 6 — Prognosis and Overall Status At Discharge</h3>
          <div className="form-group">
            <label>Discharge Condition</label>
            <input className="form-control" value={form.dischargeCondition} onChange={(e) => update("dischargeCondition", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Prognosis</label>
            <input className="form-control" value={form.prognosis} onChange={(e) => update("prognosis", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Recovery Advice</label>
            <textarea className="form-control" rows={2} value={form.recoveryAdvice} onChange={(e) => update("recoveryAdvice", e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <h3 className="card-title">Footer — Doctor Details</h3>
          <div className="grid grid-3">
            <div className="form-group">
              <label>Doctor Name</label>
              <input className="form-control" value={form.doctorName} onChange={(e) => update("doctorName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input className="form-control" value={form.doctorDesignation} onChange={(e) => update("doctorDesignation", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Registration Number</label>
              <input className="form-control" value={form.doctorRegistrationNumber} onChange={(e) => update("doctorRegistrationNumber", e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Summary" : "Save & Continue to Print"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/discharge-summaries")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}