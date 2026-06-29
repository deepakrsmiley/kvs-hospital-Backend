import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";

// ─── Stable unique ID generator ──────────────────────────────────────────────
let _uid = 0;
const uid = () => String(++_uid);

const emptyItem = () => ({
  _key: uid(),
  productName: "",
  batchNo: "",
  mfgDate: "",
  expiryDate: "",
  hsnSac: "",
  qty: 1,
  mrp: 0,
  rate: 0,
  discountPercent: 0,
  igstPercent: 12,
});

// When loading from DB, items won't have _key — assign one
const withKeys = (items = []) => items.map((it) => ({ _key: uid(), ...it }));

export default function InvoiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customer, setCustomer] = useState({
    name: "", contactPerson: "", address: "", phone: "", gstin: "", placeOfSupply: "",
  });
  const [items, setItems] = useState([emptyItem()]);
  const [consultationFee, setConsultationFee] = useState(0);
  const [consultationDoctor, setConsultationDoctor] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [status, setStatus] = useState("unpaid");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/invoices/${id}`).then((res) => {
        const inv = res.data;
        setInvoiceNo(inv.invoiceNo);
        setInvoiceDate(inv.invoiceDate);
        setCustomer(inv.customer || {});
        // FIX: assign stable _key when loading from DB
        setItems(inv.items?.length ? withKeys(inv.items) : [emptyItem()]);
        setConsultationFee(inv.consultationFee || 0);
        setConsultationDoctor(inv.consultationDoctor || "");
        setConsultationNotes(inv.consultationNotes || "");
        setStatus(inv.status || "unpaid");
      });
    } else {
      api.get("/invoices/next-number").then((res) => setInvoiceNo(res.data.invoiceNo));
    }
  }, [id, isEdit]);

  const updateItem = (idx, key, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const calcTaxable = (item) => {
    const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const disc = (gross * (Number(item.discountPercent) || 0)) / 100;
    return Math.round((gross - disc) * 100) / 100;
  };

  const totalTaxable = items.reduce((sum, it) => sum + calcTaxable(it), 0);
  const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const totalIgst = items.reduce((sum, it) => {
    const taxable = calcTaxable(it);
    return sum + Math.round((taxable * (Number(it.igstPercent) || 12)) / 100 * 100) / 100;
  }, 0);
  const grandTotal = Math.round((totalTaxable + totalIgst + Number(consultationFee || 0)) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Strip _key before sending to backend
      const payload = {
        invoiceNo, invoiceDate, customer,
        items: items.map(({ _key, ...rest }) => rest),
        status,
        consultationFee: Number(consultationFee || 0),
        consultationDoctor,
        consultationNotes,
      };
      let res;
      if (isEdit) {
        res = await api.put(`/invoices/${id}`, payload);
      } else {
        res = await api.post("/invoices", payload);
      }
      navigate(`/invoices/${res.data._id}/print`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Dashboard / Invoices / {isEdit ? "Edit" : "New"}</div>
          <h2 style={{ margin: 0 }}>{isEdit ? "Edit Invoice" : "New Invoice"}</h2>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-header">Customer Information</div>
          <div className="grid grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label>Customer Name <span className="req">*</span></label>
              <input className="form-control" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Enter customer name" required />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input className="form-control" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="Enter mobile number" />
            </div>
            <div className="form-group">
              <label>Invoice Date <span className="req">*</span></label>
              <input type="date" className="form-control" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>GSTIN</label>
              <input className="form-control" value={customer.gstin} onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })} placeholder="Enter GSTIN (optional)" />
            </div>
          </div>
          <div className="grid grid-3">
            <div className="form-group" style={{ gridColumn: "1 / 3" }}>
              <label>Address</label>
              <input className="form-control" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Enter address" />
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consultation Fees */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-header">💊 Consultation Fees</div>
          <div className="consult-fee-row">
            <div>
              <div className="consult-fee-label">Consultation Fee (₹)</div>
              <input
                type="number"
                className="form-control"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <div className="consult-fee-label">Doctor Name</div>
              <input
                className="form-control"
                value={consultationDoctor}
                onChange={(e) => setConsultationDoctor(e.target.value)}
                placeholder="Consulting doctor name"
              />
            </div>
            <div>
              <div className="consult-fee-label">Notes</div>
              <input
                className="form-control"
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                placeholder="e.g. Follow-up, OPD visit..."
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div className="section-header" style={{ margin: 0, border: "none", padding: 0 }}>🧾 Invoice Items</div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
          </div>
          <div className="table-wrap">
            <table className="data-table items-table" style={{ fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ width: 32 }}>#</th>
                  <th>Product / Service</th>
                  <th>Batch No</th>
                  <th>MFG Date</th>
                  <th>Expiry Date</th>
                  <th>HSN/SAC</th>
                  <th style={{ width: 56 }}>Qty</th>
                  <th style={{ width: 70 }}>MRP</th>
                  <th style={{ width: 70 }}>Rate</th>
                  <th style={{ width: 60 }}>Disc %</th>
                  <th style={{ width: 60 }}>IGST %</th>
                  <th style={{ textAlign: "right" }}>Taxable Value</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  // FIX: use stable _key instead of idx — prevents input remount on add/remove
                  <tr key={item._key}>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{idx + 1}</td>
                    <td><input value={item.productName} onChange={(e) => updateItem(idx, "productName", e.target.value)} placeholder="Enter product" required /></td>
                    <td><input value={item.batchNo} onChange={(e) => updateItem(idx, "batchNo", e.target.value)} /></td>
                    <td><input value={item.mfgDate} placeholder="MMM YYYY" onChange={(e) => updateItem(idx, "mfgDate", e.target.value)} /></td>
                    <td><input value={item.expiryDate} placeholder="MMM YYYY" onChange={(e) => updateItem(idx, "expiryDate", e.target.value)} /></td>
                    <td><input value={item.hsnSac} onChange={(e) => updateItem(idx, "hsnSac", e.target.value)} /></td>
                    <td><input type="number" value={item.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} min="1" /></td>
                    <td><input type="number" value={item.mrp} onChange={(e) => updateItem(idx, "mrp", e.target.value)} min="0" /></td>
                    <td><input type="number" value={item.rate} onChange={(e) => updateItem(idx, "rate", e.target.value)} min="0" /></td>
                    <td><input type="number" value={item.discountPercent} onChange={(e) => updateItem(idx, "discountPercent", e.target.value)} min="0" max="100" /></td>
                    <td><input type="number" value={item.igstPercent} onChange={(e) => updateItem(idx, "igstPercent", e.target.value)} min="0" /></td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "#1a2b3c" }}>₹{calcTaxable(item).toFixed(2)}</td>
                    <td><button type="button" className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeItem(idx)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} style={{ textAlign: "right", fontWeight: 700, color: "#6b7280", fontSize: 12 }}>TOTALS</td>
                  <td style={{ fontWeight: 700 }}>{totalQty}</td>
                  <td colSpan={3}></td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "var(--primary-dark)" }}>₹{totalTaxable.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <div className="totals-box">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>₹{totalTaxable.toFixed(2)}</span>
              </div>
              {Number(consultationFee) > 0 && (
                <div className="totals-row" style={{ color: "#166534" }}>
                  <span>Consultation Fee</span>
                  <span>₹{Number(consultationFee).toFixed(2)}</span>
                </div>
              )}
              <div className="totals-row">
                <span>IGST</span>
                <span>₹{totalIgst.toFixed(2)}</span>
              </div>
              <div className="totals-row grand">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Invoice" : "Save Invoice"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/invoices")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}