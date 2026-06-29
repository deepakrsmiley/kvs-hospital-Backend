import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import "../styles/invoicePrint.css";

export default function InvoicePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/invoices/${id}`), api.get("/settings")]).then(
      ([invRes, setRes]) => {
        setInvoice(invRes.data);
        setSettings(setRes.data);
      },
    );
  }, [id]);

  if (!invoice || !settings)
    return <div style={{ padding: 40 }}>Loading invoice...</div>;

  const itemRowCount = invoice.items.length;
  const fillerRows = Math.max(0, 8 - itemRowCount);
  const hasConsultFee = Number(invoice.consultationFee) > 0;

  return (
    <div className="invoice-page-wrap">
      <div className="invoice-toolbar no-print">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="invoice-sheet">
        {/* Header */}
        <div className="inv-header">
          <div className="logo-col">
            <img
              src={settings.logoUrl}
              alt="logo"
            />
          </div>
          <div className="name-col">
            <div className="hospital-name">
              {settings.hospitalName || "Hospital Name"}
            </div>
            <div className="hospital-meta">
              <div>{settings.address}</div>
              <div>📞 {settings.phone}</div>
            </div>
          </div>
          <div className="ad-col">
            {settings.adImageUrl && <img src={settings.adImageUrl} alt="ad" />}
          </div>
        </div>

        {settings.tagline && (
          <div className="inv-tagline">{settings.tagline}</div>
        )}

        <div className="inv-gst-row">
          <div className="gst-left">GSTIN : {settings.gstNumber}</div>
          <div className="tax-invoice-title">TAX INVOICE</div>
          <div className="original-recipient">ORIGINAL FOR RECIPIENT</div>
        </div>

        <div className="inv-cust-inv-row">
          <div className="inv-cust-box">
            <div className="cust-detail-title">Customer Detail</div>
            <div className="cust-row">
              <div className="label">M/S</div>
              <div>{invoice.customer?.name}</div>
            </div>
            {invoice.customer?.contactPerson && (
              <div className="cust-row">
                <div className="label">C.Person</div>
                <div>{invoice.customer.contactPerson}</div>
              </div>
            )}
            <div className="cust-row">
              <div className="label">Address</div>
              <div>{invoice.customer?.address}</div>
            </div>
            <div className="cust-row">
              <div className="label">Phone</div>
              <div>{invoice.customer?.phone}</div>
            </div>
            <div className="cust-row">
              <div className="label">GSTIN</div>
              <div>{invoice.customer?.gstin}</div>
            </div>
            <div className="cust-row">
              <div className="label">Place of Supply</div>
              <div>{invoice.customer?.placeOfSupply}</div>
            </div>
          </div>
          <div className="inv-inv-box">
            <div className="cust-row">
              <div className="label">Invoice No.</div>
              <div style={{ fontWeight: 700 }}>{invoice.invoiceNo}</div>
            </div>
            <div className="cust-row">
              <div className="label">Invoice Date</div>
              <div style={{ fontWeight: 700 }}>{invoice.invoiceDate}</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="inv-items-table">
          <thead>
            <tr>
              <th rowSpan={2}>
                Sr
                <br />
                No.
              </th>
              <th rowSpan={2} className="text-left">
                Name of Product / Service
              </th>
              <th rowSpan={2}>Batch No</th>
              <th rowSpan={2}>MFG Date</th>
              <th rowSpan={2}>Expiry Date</th>
              <th rowSpan={2}>HSN / SAC</th>
              <th rowSpan={2}>Qty</th>
              <th rowSpan={2}>MRP</th>
              <th rowSpan={2}>Rate</th>
              <th>Disc.</th>
              <th rowSpan={2}>Taxable Value</th>
            </tr>
            <tr>
              <th>(%)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td className="text-left" style={{ fontWeight: 600 }}>
                  {item.productName}
                </td>
                <td>{item.batchNo}</td>
                <td>{item.mfgDate}</td>
                <td>{item.expiryDate}</td>
                <td>{item.hsnSac}</td>
                <td>{item.qty}</td>
                <td>{Number(item.mrp).toFixed(2)}</td>
                <td>{Number(item.rate).toFixed(2)}</td>
                <td>{Number(item.discountPercent).toFixed(2)}</td>
                <td className="text-right">
                  {Number(item.taxableValue).toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Consultation Fee row if applicable */}
            {hasConsultFee && (
              <tr style={{ background: "#f0fdf4" }}>
                <td style={{ fontWeight: 600, color: "#166534" }}>*</td>
                <td
                  className="text-left"
                  style={{ fontWeight: 700, color: "#166534" }}
                >
                  Consultation Fee
                  {invoice.consultationDoctor
                    ? ` — Dr. ${invoice.consultationDoctor}`
                    : ""}
                  {invoice.consultationNotes ? (
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: "0.9em",
                        opacity: 0.8,
                      }}
                    >
                      {invoice.consultationNotes}
                    </div>
                  ) : null}
                </td>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "#166534",
                    fontStyle: "italic",
                    fontSize: "0.9em",
                  }}
                >
                  Consultation / Professional Fee
                </td>
                <td
                  className="text-right"
                  style={{ fontWeight: 700, color: "#166534" }}
                >
                  {Number(invoice.consultationFee).toFixed(2)}
                </td>
              </tr>
            )}

            {Array.from({ length: fillerRows }).map((_, i) => (
              <tr className="filler-row" key={`filler-${i}`}>
                <td colSpan={11}>&nbsp;</td>
              </tr>
            ))}
            <tr className="igst-row">
              <td colSpan={9} className="text-right">
                {invoice.hsnSummary
                  ?.map((h) => `IGST (${h.igstPercent.toFixed(2)} %)`)
                  .join(", ")}
              </td>
              <td></td>
              <td className="text-right">
                {invoice.totalIgstAmount?.toFixed(2)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="text-right">
                Total
              </td>
              <td>{invoice.totalQty}</td>
              <td colSpan={2}></td>
              <td className="text-right">₹ {invoice.grandTotal?.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="inv-words-row">
          <div>Total in words</div>
          <div>(E &amp; O.E.)</div>
        </div>
        <div className="inv-words-row" style={{ marginTop: -10 }}>
          <div className="words-text">{invoice.amountInWords}</div>
        </div>

        {/* HSN Summary */}
        <table className="hsn-summary-table">
          <thead>
            <tr>
              <th rowSpan={2}>HSN / SAC</th>
              <th rowSpan={2}>Taxable Value</th>
              <th colSpan={2}>IGST</th>
              <th rowSpan={2}>Total</th>
            </tr>
            <tr>
              <th>%</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.hsnSummary?.map((h, idx) => (
              <tr key={idx}>
                <td>{h.hsnSac}</td>
                <td>{h.taxableValue.toFixed(2)}</td>
                <td>{h.igstPercent.toFixed(2)}</td>
                <td>{h.igstAmount.toFixed(2)}</td>
                <td>{h.total.toFixed(2)}</td>
              </tr>
            ))}
            {hasConsultFee && (
              <tr style={{ color: "#166534", background: "#f0fdf4" }}>
                <td>Consultation Fee</td>
                <td>{Number(invoice.consultationFee).toFixed(2)}</td>
                <td>—</td>
                <td>—</td>
                <td>{Number(invoice.consultationFee).toFixed(2)}</td>
              </tr>
            )}
            <tr style={{ fontWeight: 700 }}>
              <td>Total</td>
              <td>{invoice.totalTaxableValue?.toFixed(2)}</td>
              <td></td>
              <td>{invoice.totalIgstAmount?.toFixed(2)}</td>
              <td>{invoice.grandTotal?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="tax-words-row">
          Total Tax in words: {invoice.taxAmountInWords}
        </div>

        {/* Bank + Certified */}
        <div className="bank-cert-row">
          <div className="bank-box">
            <div className="bank-title">Bank Details</div>
            <div className="bank-detail-rows">
              <div className="bd-fields">
                <div className="bd-row">
                  <div className="label">Name</div>
                  <div>{settings.bankDetails?.name}</div>
                </div>
                <div className="bd-row">
                  <div className="label">Branch</div>
                  <div>{settings.bankDetails?.branch}</div>
                </div>
                <div className="bd-row">
                  <div className="label">Acc. Number</div>
                  <div>{settings.bankDetails?.accountNumber}</div>
                </div>
                <div className="bd-row">
                  <div className="label">IFSC</div>
                  <div>{settings.bankDetails?.ifsc}</div>
                </div>
                <div className="bd-row">
                  <div className="label">UPI ID</div>
                  <div>{settings.bankDetails?.upiId}</div>
                </div>
              </div>
              <div className="bank-qr">
                {settings.bankDetails?.qrCodeUrl && (
                  <img
                    src={settings.bankDetails.qrCodeUrl}
                    alt="QR Code"
                  />
                )}
                <div className="qr-caption">Pay using UPI</div>
              </div>
            </div>
          </div>
          <div className="cert-box">
            <div>
              Certified that the particulars given above are
              <br />
              true and correct.
            </div>
            <div style={{ fontWeight: 700, marginTop: 10 }}>
              For {settings.hospitalName}
            </div>
          </div>
        </div>

        <div className="terms-box">
          <div className="terms-title">Terms and Conditions</div>
          <div className="terms-content">{settings.termsAndConditions}</div>
        </div>

        <div className="sig-row">
          <div className="sig-box">Customer Signature</div>
          <div className="sig-box right">
            {settings.doctorSignatureUrl && (
              <img
                src={settings.doctorSignatureUrl}
                alt="sig"
                style={{
                  width: 90,
                  height: 36,
                  objectFit: "contain",
                  display: "block",
                  marginLeft: "auto",
                }}
              />
            )}
            Authorised Signatory
          </div>
        </div>

        <div className="thanks-line">
          Thanks for your order! We look forward to working with you again soon.
        </div>
      </div>
    </div>
  );
}