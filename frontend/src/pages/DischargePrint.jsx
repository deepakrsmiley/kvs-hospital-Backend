import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import "../styles/dischargePrint.css";

export default function DischargePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ds, setDs] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/discharge-summaries/${id}`),
      api.get("/settings"),
    ]).then(([dsRes, setRes]) => {
      setDs(dsRes.data);
      setSettings(setRes.data);
    });
  }, [id]);

  if (!ds || !settings)
    return <div style={{ padding: 40 }}>Loading discharge summary...</div>;

  return (
    <div className="ds-page-wrap">
      <div className="ds-toolbar no-print">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* PAGE 1 */}
      <div className="ds-sheet">
        <div className="ds-header-band">
          <div className="brand-left">
            {settings.doctorSignatureUrl && (
              <img
                className="sig-img"
                src={settings.doctorSignatureUrl}
                alt="signature"
              />
            )}
            <div className="hosp-name">
              {settings.hospitalName || "Hospital Name"}
            </div>
          </div>
          <div className="hosp-meta">
            <div>{settings.address}</div>
            <div>
              {settings.phone} {settings.email ? `• ${settings.email}` : ""}
            </div>
          </div>
        </div>

        <div className="ds-page">
          <div className="ds-title">Discharge Summary</div>

          <div className="ds-section-title">
            Patient Information and Admission Details
          </div>
          <div className="ds-field-block">
            <div className="ds-field-row">
              <div className="f-label">Patient Name:</div>
              <div className="f-value">{ds.patientName}</div>
            </div>
            <div className="ds-field-row">
              <div className="f-label">Date of Birth:</div>
              <div className="f-value">{ds.dateOfBirth}</div>
            </div>
            <div className="ds-field-row">
              <div className="f-label">Medical Record Number:</div>
              <div className="f-value">{ds.mrn}</div>
            </div>
            <div className="ds-field-row">
              <div className="f-label">Admission Date:</div>
              <div className="f-value">{ds.admissionDate}</div>
            </div>
            <div className="ds-field-row">
              <div className="f-label">Discharge Date:</div>
              <div className="f-value">{ds.dischargeDate}</div>
            </div>
          </div>

          <div className="ds-paragraph">{ds.clinicalIntroduction}</div>

          <div className="ds-section-title">Summary of Clinical Course</div>
          <div className="ds-paragraph">{ds.clinicalCourse}</div>

          <div className="ds-section-title">Discharge Medications</div>
          <div style={{ fontSize: 13 }}>
            At discharge, the patient was prescribed:
          </div>
          <ol className="ds-med-list">
            {ds.medications?.map((m, i) => (
              <li key={i}>
                <span className="med-name">{m.name}</span>
                {m.dosage ? ` – ${m.dosage}` : ""}
                {m.frequency ? `, ${m.frequency}` : ""}
                {m.duration ? `, ${m.duration}` : ""}
                {m.instructions ? `. ${m.instructions}` : ""}
              </li>
            ))}
          </ol>

          <div className="ds-page-number">Page 1</div>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="ds-sheet">
        <div className="ds-header-band">
          <div className="brand-left">
            {settings.logoUrl && (
              <img
                className="hosp-logo"
                src={settings.logoUrl}
                alt="logo"
              />
            )}
            <div className="hosp-name">
              {settings.hospitalName || "Hospital Name"}
            </div>
          </div>
          <div className="hosp-meta">
            <div>{settings.address}</div>
            <div>
              {settings.phone} {settings.email ? `• ${settings.email}` : ""}
            </div>
          </div>
        </div>

        <div className="ds-page">
          <div className="ds-section-title" style={{ marginTop: 6 }}>
            Follow-up Plan and Continuing Care
          </div>
          <div className="ds-field-block">
            <div className="ds-field-row">
              <div className="f-label">Follow-Up Doctor:</div>
              <div className="f-value">{ds.followUp?.followUpDoctor}</div>
            </div>
            <div className="ds-field-row">
              <div className="f-label">Review Date:</div>
              <div className="f-value">{ds.followUp?.reviewDate}</div>
            </div>
            <div className="ds-field-row">
              <div className="f-label">Continuing Medications:</div>
              <div className="f-value">
                {ds.followUp?.continuingMedications}
              </div>
            </div>
            <div className="ds-field-row">
              <div className="f-label">Referral Information:</div>
              <div className="f-value">{ds.followUp?.referralInfo}</div>
            </div>
          </div>
          <div className="ds-paragraph">
            {ds.followUp?.futureCareInstructions}
          </div>

          <div className="ds-section-title">
            Patient Education and Lifestyle Recommendations
          </div>
          <div className="ds-paragraph">{ds.patientEducation}</div>

          <div className="ds-section-title">
            Prognosis and Overall Status at Discharge
          </div>
          <div className="ds-field-block">
            <div className="ds-field-row">
              <div className="f-label">Discharge Condition:</div>
              <div className="f-value">{ds.dischargeCondition}</div>
            </div>
            <div className="ds-field-row">
              <div className="f-label">Prognosis:</div>
              <div className="f-value">{ds.prognosis}</div>
            </div>
          </div>
          <div className="ds-paragraph">{ds.recoveryAdvice}</div>

          <div className="ds-footer-section">
            <div className="ds-footer-fields">
              <div className="f-row">
                <div className="label">Physician Name:</div>
                <div>{ds.doctorName}</div>
              </div>
              <div className="f-row">
                <div className="label">Designation:</div>
                <div>{ds.doctorDesignation}</div>
              </div>
              <div className="f-row">
                <div className="label">Registration No:</div>
                <div>{ds.doctorRegistrationNumber}</div>
              </div>
            </div>
            <div className="ds-sig-block">
              {settings.doctorSignatureUrl && (
                <img
                  className="sig-img"
                  src={settings.doctorSignatureUrl}
                  alt="signature"
                />
              )}
              <div className="sig-line"></div>
              <div>Doctor Signature</div>
              {settings.sealUrl && (
                <img
                  className="seal-img"
                  src={settings.sealUrl}
                  alt="seal"
                  style={{ marginTop: 10 }}
                />
              )}
              <div>Hospital Seal</div>
            </div>
          </div>

          <div className="ds-page-number">Page 2</div>
        </div>
      </div>
    </div>
  );
}