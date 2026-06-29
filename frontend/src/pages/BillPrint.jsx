import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import "../styles/invoicePrint.css";

function toWords(n) {
  // Simple rupees in words using existing backend field
  return "";
}

export default function BillPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/bills/${id}`), api.get("/settings")]).then(
      ([bRes, sRes]) => { setBill(bRes.data); setSettings(sRes.data); }
    );
  }, [id]);

  if (!bill || !settings) return <div style={{ padding: 40 }}>Loading...</div>;

  const type = bill.billType || "pharmacy";

  const HospitalHeader = () => (
    <div className="inv-header">
      <div className="logo-col">
        {settings.logoUrl && <img src={settings.logoUrl} alt="logo" />}
      </div>
      <div className="name-col">
        <div className="hospital-name">{settings.hospitalName || "Hospital Name"}</div>
        <div className="hospital-meta">
          <div>{settings.address}</div>
          <div>Ph: {settings.phone}</div>
        </div>
      </div>
      <div className="ad-col">
        {settings.adImageUrl && <img src={settings.adImageUrl} alt="ad" />}
      </div>
    </div>
  );

  const PatientBox = () => (
    <div className="inv-cust-inv-row">
      <div className="inv-cust-box">
        <div className="cust-detail-title">Patient Details</div>
        <div className="cust-row"><div className="label">Name</div><div style={{ fontWeight: 600 }}>{bill.patient?.name}</div></div>
        {bill.patient?.uhid && <div className="cust-row"><div className="label">UHID</div><div>{bill.patient.uhid}</div></div>}
        {bill.patient?.age && <div className="cust-row"><div className="label">Age / Gender</div><div>{bill.patient.age}{bill.patient?.gender ? ` / ${bill.patient.gender}` : ""}</div></div>}
        {bill.patient?.phone && <div className="cust-row"><div className="label">Phone</div><div>{bill.patient.phone}</div></div>}
        {bill.patient?.address && <div className="cust-row"><div className="label">Address</div><div>{bill.patient.address}</div></div>}
        {bill.patient?.referredBy && <div className="cust-row"><div className="label">Ref. Doctor</div><div>{bill.patient.referredBy}</div></div>}
        {bill.patient?.ipNo && <div className="cust-row"><div className="label">IP No.</div><div>{bill.patient.ipNo}</div></div>}
        {bill.patient?.wardBed && <div className="cust-row"><div className="label">Ward / Bed</div><div>{bill.patient.wardBed}</div></div>}
      </div>
      <div className="inv-inv-box">
        <div className="cust-row"><div className="label">Bill No.</div><div style={{ fontWeight: 700 }}>{bill.billNo}</div></div>
        <div className="cust-row"><div className="label">Bill Date</div><div style={{ fontWeight: 700 }}>{bill.billDate}</div></div>
        <div className="cust-row"><div className="label">Bill Type</div><div style={{ fontWeight: 600, textTransform: "capitalize" }}>{
          type === "pharmacy" ? "Pharmacy" : type === "lab" ? "Lab / Investigation" : type === "consultation" ? "Consultation" : "IP Overall"
        }</div></div>
        <div className="cust-row"><div className="label">Payment</div><div style={{ fontWeight: 600, textTransform: "capitalize" }}>{bill.paymentMode || "Cash"}</div></div>
        <div className="cust-row"><div className="label">Status</div>
          <div style={{ fontWeight: 700, color: bill.status === "paid" ? "#166534" : bill.status === "partial" ? "#92400e" : "#b91c1c" }}>
            {bill.status?.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );

  const SignRow = () => (
    <>
      <div className="sig-row">
        <div className="sig-box">Patient / Attender Signature</div>
        <div className="sig-box right">
          {settings.doctorSignatureUrl && (
            <img src={settings.doctorSignatureUrl} alt="sig" style={{ width: 90, height: 36, objectFit: "contain", display: "block", marginLeft: "auto" }} />
          )}
          Authorised Signatory
        </div>
      </div>
      <div className="thanks-line">Thank you for choosing {settings.hospitalName}. Wishing you good health!</div>
    </>
  );

  // ── PHARMACY PRINT ───────────────────────────────────────────────────────
  if (type === "pharmacy") {
    return (
      <div className="invoice-page-wrap">
        <div className="invoice-toolbar no-print">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
        <div className="invoice-sheet">
          <HospitalHeader />
          {settings.tagline && <div className="inv-tagline">{settings.tagline}</div>}
          <div className="inv-gst-row">
            <div className="gst-left">GSTIN: {settings.gstNumber}</div>
            <div className="tax-invoice-title">PHARMACY BILL</div>
            <div className="original-recipient">ORIGINAL FOR RECIPIENT</div>
          </div>
          <PatientBox />

          <table className="inv-items-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th className="text-left">Product / Medicine</th>
                <th>Batch No</th>
                <th>Mfg Date</th>
                <th>Expiry</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>Rate</th>
                <th>Disc %</th>
                <th>IGST %</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td className="text-left" style={{ fontWeight: 600 }}>{item.productName}</td>
                  <td>{item.batchNo}</td>
                  <td>{item.mfgDate}</td>
                  <td>{item.expiryDate}</td>
                  <td>{item.hsnSac}</td>
                  <td>{item.qty}</td>
                  <td>{Number(item.mrp).toFixed(2)}</td>
                  <td>{Number(item.rate).toFixed(2)}</td>
                  <td>{Number(item.discountPercent).toFixed(2)}</td>
                  <td>{Number(item.igstPercent || 12).toFixed(2)}</td>
                  <td className="text-right">{Number(item.taxableValue).toFixed(2)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 8 - (bill.items?.length || 0)) }).map((_, i) => (
                <tr className="filler-row" key={`f-${i}`}><td colSpan={12}>&nbsp;</td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="text-right">Total</td>
                <td>{bill.totalQty}</td>
                <td colSpan={3}></td>
                <td colSpan={2} className="text-right" style={{ fontWeight: 800 }}>₹ {bill.grandTotal?.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="inv-words-row"><div>Amount in Words: <strong>{bill.amountInWords}</strong></div><div>(E &amp; O.E.)</div></div>

          <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 260 }}>
              <tbody>
                <tr><td style={{ padding: "4px 16px 4px 4px", color: "#6b7280" }}>Subtotal</td><td style={{ textAlign: "right", fontWeight: 600 }}>₹ {bill.totalTaxableValue?.toFixed(2)}</td></tr>
                <tr><td style={{ padding: "4px 16px 4px 4px", color: "#6b7280" }}>IGST</td><td style={{ textAlign: "right", fontWeight: 600 }}>₹ {bill.totalIgstAmount?.toFixed(2)}</td></tr>
                {bill.amountPaid > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#166534" }}>Amount Paid</td><td style={{ textAlign: "right", fontWeight: 600, color: "#166534" }}>₹ {Number(bill.amountPaid).toFixed(2)}</td></tr>}
                <tr style={{ borderTop: "2px solid #1a2b3c" }}>
                  <td style={{ padding: "6px 16px 4px 4px", fontWeight: 800, fontSize: 15 }}>Grand Total</td>
                  <td style={{ textAlign: "right", fontWeight: 800, fontSize: 15 }}>₹ {bill.grandTotal?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {settings.termsAndConditions && (
            <div className="terms-box"><div className="terms-title">Terms and Conditions</div><div className="terms-content">{settings.termsAndConditions}</div></div>
          )}
          <SignRow />
        </div>
      </div>
    );
  }

  // ── LAB PRINT ─────────────────────────────────────────────────────────────
  if (type === "lab") {
    return (
      <div className="invoice-page-wrap">
        <div className="invoice-toolbar no-print">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
        <div className="invoice-sheet">
          <HospitalHeader />
          {settings.tagline && <div className="inv-tagline">{settings.tagline}</div>}
          <div className="inv-gst-row">
            <div className="gst-left">GSTIN: {settings.gstNumber}</div>
            <div className="tax-invoice-title">LAB / INVESTIGATION BILL</div>
            <div className="original-recipient">ORIGINAL FOR RECIPIENT</div>
          </div>
          <PatientBox />

          <table className="inv-items-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th className="text-left">Test Name</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Disc %</th>
                <th className="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.labItems?.map((item, idx) => {
                const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                const disc = (gross * (Number(item.discountPercent) || 0)) / 100;
                const amt = gross - disc;
                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td className="text-left" style={{ fontWeight: 600 }}>{item.testName}</td>
                    <td>{item.qty}</td>
                    <td>{Number(item.rate).toFixed(2)}</td>
                    <td>{Number(item.discountPercent).toFixed(2)}</td>
                    <td className="text-right">{amt.toFixed(2)}</td>
                  </tr>
                );
              })}
              {Array.from({ length: Math.max(0, 8 - (bill.labItems?.length || 0)) }).map((_, i) => (
                <tr className="filler-row" key={`f-${i}`}><td colSpan={6}>&nbsp;</td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="text-right">Total</td>
                <td className="text-right" style={{ fontWeight: 800 }}>₹ {bill.grandTotal?.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="inv-words-row"><div>Amount in Words: <strong>{bill.amountInWords}</strong></div><div>(E &amp; O.E.)</div></div>

          <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 240 }}>
              <tbody>
                {bill.amountPaid > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#166534" }}>Amount Paid</td><td style={{ textAlign: "right", fontWeight: 600, color: "#166534" }}>₹ {Number(bill.amountPaid).toFixed(2)}</td></tr>}
                <tr style={{ borderTop: "2px solid #1a2b3c" }}>
                  <td style={{ padding: "6px 16px 4px 4px", fontWeight: 800, fontSize: 15 }}>Total</td>
                  <td style={{ textAlign: "right", fontWeight: 800, fontSize: 15 }}>₹ {bill.grandTotal?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {settings.termsAndConditions && (
            <div className="terms-box"><div className="terms-title">Terms and Conditions</div><div className="terms-content">{settings.termsAndConditions}</div></div>
          )}
          <SignRow />
        </div>
      </div>
    );
  }

  // ── CONSULTATION PRINT ───────────────────────────────────────────────────
  if (type === "consultation") {
    return (
      <div className="invoice-page-wrap">
        <div className="invoice-toolbar no-print">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
        <div className="invoice-sheet">
          <HospitalHeader />
          {settings.tagline && <div className="inv-tagline">{settings.tagline}</div>}
          <div className="inv-gst-row">
            <div className="gst-left">GSTIN: {settings.gstNumber}</div>
            <div className="tax-invoice-title">CONSULTATION BILL</div>
            <div className="original-recipient">ORIGINAL FOR RECIPIENT</div>
          </div>
          <PatientBox />

          <table className="inv-items-table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Sr.</th>
                <th className="text-left">Description</th>
                <th className="text-left">Doctor</th>
                <th className="text-left">Speciality</th>
                <th className="text-left">Date</th>
                <th className="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td className="text-left" style={{ fontWeight: 600 }}>
                  Consultation Fee
                  {bill.consultationNotes ? <div style={{ fontWeight: 400, fontSize: "0.88em", color: "#6b7280" }}>{bill.consultationNotes}</div> : null}
                </td>
                <td className="text-left">Dr. {bill.consultationDoctor}</td>
                <td className="text-left">{bill.consultationSpeciality}</td>
                <td className="text-left">{bill.consultationDate || bill.billDate}</td>
                <td className="text-right" style={{ fontWeight: 700 }}>{Number(bill.consultationFee).toFixed(2)}</td>
              </tr>
              {Array.from({ length: 7 }).map((_, i) => (
                <tr className="filler-row" key={`f-${i}`}><td colSpan={6}>&nbsp;</td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="text-right">Total</td>
                <td className="text-right" style={{ fontWeight: 800 }}>₹ {bill.grandTotal?.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="inv-words-row"><div>Amount in Words: <strong>{bill.amountInWords}</strong></div><div>(E &amp; O.E.)</div></div>

          <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 240 }}>
              <tbody>
                {bill.amountPaid > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#166534" }}>Amount Paid</td><td style={{ textAlign: "right", fontWeight: 600, color: "#166534" }}>₹ {Number(bill.amountPaid).toFixed(2)}</td></tr>}
                <tr style={{ borderTop: "2px solid #1a2b3c" }}>
                  <td style={{ padding: "6px 16px 4px 4px", fontWeight: 800, fontSize: 15 }}>Consultation Fee</td>
                  <td style={{ textAlign: "right", fontWeight: 800, fontSize: 15 }}>₹ {bill.grandTotal?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {settings.termsAndConditions && (
            <div className="terms-box"><div className="terms-title">Terms and Conditions</div><div className="terms-content">{settings.termsAndConditions}</div></div>
          )}
          <SignRow />
        </div>
      </div>
    );
  }

  // ── IP OVERALL PRINT ─────────────────────────────────────────────────────
  return (
    <div className="invoice-page-wrap">
      <div className="invoice-toolbar no-print">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
        <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
      </div>
      <div className="invoice-sheet">
        <HospitalHeader />
        {settings.tagline && <div className="inv-tagline">{settings.tagline}</div>}
        <div className="inv-gst-row">
          <div className="gst-left">GSTIN: {settings.gstNumber}</div>
          <div className="tax-invoice-title">INPATIENT FINAL BILL</div>
          <div className="original-recipient">ORIGINAL FOR RECIPIENT</div>
        </div>
        <PatientBox />

        {/* Admission Summary */}
        <div style={{ display: "flex", gap: 0, borderTop: "1.5px solid #1a2b3c", borderBottom: "1.5px solid #1a2b3c", padding: "8px 10px", fontSize: 12.5, flexWrap: "wrap", gap: 24, margin: "0 0 0 0" }}>
          {bill.ipAdmitDate && <div><span style={{ color: "#6b7280" }}>Admitted: </span><strong>{bill.ipAdmitDate}</strong></div>}
          {bill.ipDischargeDate && <div><span style={{ color: "#6b7280" }}>Discharged: </span><strong>{bill.ipDischargeDate}</strong></div>}
          {bill.ipAttendingDoctor && <div><span style={{ color: "#6b7280" }}>Doctor: </span><strong>Dr. {bill.ipAttendingDoctor}</strong></div>}
          {bill.ipDepartment && <div><span style={{ color: "#6b7280" }}>Dept: </span><strong>{bill.ipDepartment}</strong></div>}
          {bill.ipDiagnosis && <div><span style={{ color: "#6b7280" }}>Diagnosis: </span><strong>{bill.ipDiagnosis}</strong></div>}
        </div>

        {/* Charges Table */}
        <table className="inv-items-table">
          <thead>
            <tr>
              <th>Sr.</th>
              <th className="text-left">Charge Description</th>
              <th>Qty / Days</th>
              <th>Rate (₹)</th>
              <th>Disc %</th>
              <th className="text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bill.ipItems?.map((item, idx) => {
              const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);
              const disc = (gross * (Number(item.discountPercent) || 0)) / 100;
              const amt = gross - disc;
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td className="text-left" style={{ fontWeight: 600 }}>{item.description}</td>
                  <td>{item.qty}</td>
                  <td>{Number(item.rate).toFixed(2)}</td>
                  <td>{Number(item.discountPercent).toFixed(2)}</td>
                  <td className="text-right">{amt.toFixed(2)}</td>
                </tr>
              );
            })}

            {/* Additional summary lines */}
            {Number(bill.ipConsultFee) > 0 && (
              <tr style={{ background: "#f0fdf4" }}>
                <td style={{ color: "#166534" }}>*</td>
                <td className="text-left" style={{ fontWeight: 600, color: "#166534" }}>Consultation Fee</td>
                <td>1</td><td>{Number(bill.ipConsultFee).toFixed(2)}</td><td>—</td>
                <td className="text-right" style={{ fontWeight: 700, color: "#166534" }}>{Number(bill.ipConsultFee).toFixed(2)}</td>
              </tr>
            )}
            {Number(bill.ipPharmacyTotal) > 0 && (
              <tr style={{ background: "#eff6ff" }}>
                <td style={{ color: "#1565c0" }}>*</td>
                <td className="text-left" style={{ fontWeight: 600, color: "#1565c0" }}>Pharmacy / Medicines</td>
                <td>—</td><td>—</td><td>—</td>
                <td className="text-right" style={{ fontWeight: 700, color: "#1565c0" }}>{Number(bill.ipPharmacyTotal).toFixed(2)}</td>
              </tr>
            )}
            {Number(bill.ipLabTotal) > 0 && (
              <tr style={{ background: "#fefce8" }}>
                <td style={{ color: "#92400e" }}>*</td>
                <td className="text-left" style={{ fontWeight: 600, color: "#92400e" }}>Lab / Investigation Charges</td>
                <td>—</td><td>—</td><td>—</td>
                <td className="text-right" style={{ fontWeight: 700, color: "#92400e" }}>{Number(bill.ipLabTotal).toFixed(2)}</td>
              </tr>
            )}

            {Array.from({ length: Math.max(0, 5 - (bill.ipItems?.length || 0)) }).map((_, i) => (
              <tr className="filler-row" key={`f-${i}`}><td colSpan={6}>&nbsp;</td></tr>
            ))}
          </tbody>
        </table>

        <div className="inv-words-row"><div>Amount in Words: <strong>{bill.amountInWords}</strong></div><div>(E &amp; O.E.)</div></div>

        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 280 }}>
            <tbody>
              <tr><td style={{ padding: "4px 16px 4px 4px", color: "#6b7280" }}>Hospital Charges</td><td style={{ textAlign: "right", fontWeight: 600 }}>₹ {(bill.ipItems?.reduce((s, it) => s + Math.max(0, (Number(it.qty) || 0) * (Number(it.rate) || 0) - ((Number(it.qty) || 0) * (Number(it.rate) || 0) * (Number(it.discountPercent) || 0) / 100)), 0)).toFixed(2)}</td></tr>
              {Number(bill.ipConsultFee) > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#6b7280" }}>Consultation Fee</td><td style={{ textAlign: "right", fontWeight: 600 }}>₹ {Number(bill.ipConsultFee).toFixed(2)}</td></tr>}
              {Number(bill.ipPharmacyTotal) > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#6b7280" }}>Pharmacy</td><td style={{ textAlign: "right", fontWeight: 600 }}>₹ {Number(bill.ipPharmacyTotal).toFixed(2)}</td></tr>}
              {Number(bill.ipLabTotal) > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#6b7280" }}>Lab / Investigation</td><td style={{ textAlign: "right", fontWeight: 600 }}>₹ {Number(bill.ipLabTotal).toFixed(2)}</td></tr>}
              {Number(bill.ipDiscount) > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#b91c1c" }}>Discount</td><td style={{ textAlign: "right", fontWeight: 600, color: "#b91c1c" }}>- ₹ {Number(bill.ipDiscount).toFixed(2)}</td></tr>}
              {Number(bill.ipAdvancePaid) > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#166534" }}>Advance Paid</td><td style={{ textAlign: "right", fontWeight: 600, color: "#166534" }}>- ₹ {Number(bill.ipAdvancePaid).toFixed(2)}</td></tr>}
              {bill.amountPaid > 0 && <tr><td style={{ padding: "4px 16px 4px 4px", color: "#166534" }}>Amount Paid</td><td style={{ textAlign: "right", fontWeight: 600, color: "#166534" }}>₹ {Number(bill.amountPaid).toFixed(2)}</td></tr>}
              <tr style={{ borderTop: "2px solid #1a2b3c" }}>
                <td style={{ padding: "6px 16px 4px 4px", fontWeight: 800, fontSize: 15 }}>Net Payable</td>
                <td style={{ textAlign: "right", fontWeight: 800, fontSize: 15 }}>₹ {bill.grandTotal?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {settings.termsAndConditions && (
          <div className="terms-box"><div className="terms-title">Terms and Conditions</div><div className="terms-content">{settings.termsAndConditions}</div></div>
        )}
        <SignRow />
      </div>
    </div>
  );
}