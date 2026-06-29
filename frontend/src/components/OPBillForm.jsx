import { useState } from "react";

// ── Section templates ─────────────────────────────────────────────────────────
const SECTION_TEMPLATES = [
  { sectionType: "consultation", sectionLabel: "Consultation Fees" },
  { sectionType: "pharmacy",     sectionLabel: "Pharmacy / Medicines" },
  { sectionType: "lab",          sectionLabel: "Lab / Investigations" },
  { sectionType: "procedure",    sectionLabel: "Procedure Charges" },
  { sectionType: "dressing",     sectionLabel: "Dressing Charges" },
  { sectionType: "machine",      sectionLabel: "Equipment / Machine Use" },
  { sectionType: "custom",       sectionLabel: "Other Charges" },
];

const emptyItem = () => ({
  description: "",
  qty: 1,
  rate: "",
  discountPercent: 0,
  amount: 0,
});

const emptySection = (template) => ({
  sectionType:  template.sectionType,
  sectionLabel: template.sectionLabel,
  items:        [emptyItem()],
  sectionTotal: 0,
  _open:        true,
});

function calcItem(item) {
  const qty  = parseFloat(item.qty)  || 0;
  const rate = parseFloat(item.rate) || 0;
  const disc = parseFloat(item.discountPercent) || 0;
  const gross = qty * rate;
  return Math.round((gross - (gross * disc) / 100) * 100) / 100;
}

function calcSectionTotal(items) {
  return items.reduce((s, i) => s + calcItem(i), 0);
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OPBillForm({ onSave, initialBill = null, billNoDefault = "" }) {
  const [patient, setPatient] = useState({
    name: "", uhid: "", age: "", gender: "", phone: "", address: "", referredBy: "",
    ...(initialBill?.patient || {}),
  });

  const [billNo,       setBillNo]       = useState(initialBill?.billNo       || billNoDefault);
  const [billDate,     setBillDate]     = useState(initialBill?.billDate     || new Date().toISOString().slice(0, 10));
  const [paymentMode,  setPaymentMode]  = useState(initialBill?.paymentMode  || "cash");
  const [amountPaid,   setAmountPaid]   = useState(initialBill?.amountPaid   ?? "");
  const [opDiscount,   setOpDiscount]   = useState(initialBill?.opDiscount   ?? 0);
  const [opNotes,      setOpNotes]      = useState(initialBill?.opNotes      || "");
  const [status,       setStatus]       = useState(initialBill?.status       || "unpaid");

  const [sections, setSections] = useState(() => {
    if (initialBill?.opSections?.length) {
      return initialBill.opSections.map((s) => ({ ...s, _open: true }));
    }
    return [emptySection(SECTION_TEMPLATES[0])];
  });

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");

  // Totals
  const sectionTotals = sections.map((s) => calcSectionTotal(s.items));
  const subtotal      = sectionTotals.reduce((a, b) => a + b, 0);
  const discount      = parseFloat(opDiscount) || 0;
  const grandTotal    = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  const balance       = Math.max(0, grandTotal - (parseFloat(amountPaid) || 0));

  // Section helpers
  const addSection = (template) => {
    setSections((prev) => [...prev, emptySection(template)]);
    setShowAddPanel(false);
  };
  const removeSection = (si) => setSections((prev) => prev.filter((_, i) => i !== si));
  const toggleSection = (si) =>
    setSections((prev) => prev.map((s, i) => (i === si ? { ...s, _open: !s._open } : s)));
  const updateSectionLabel = (si, val) =>
    setSections((prev) => prev.map((s, i) => (i === si ? { ...s, sectionLabel: val } : s)));

  // Item helpers
  const addItem = (si) =>
    setSections((prev) =>
      prev.map((s, i) => (i === si ? { ...s, items: [...s.items, emptyItem()] } : s))
    );
  const removeItem = (si, ii) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s
      )
    );
  const updateItem = (si, ii, field, value) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i !== si
          ? s
          : { ...s, items: s.items.map((item, j) => (j !== ii ? item : { ...item, [field]: value })) }
      )
    );

  // Save
  const handleSave = async () => {
    if (!billNo.trim())        return setError("Bill number is required.");
    if (!patient.name.trim())  return setError("Patient name is required.");
    if (sections.length === 0) return setError("Add at least one billing section.");

    setError("");
    setSaving(true);

    const paid = parseFloat(amountPaid) || 0;
    const finalStatus = paid >= grandTotal ? "paid" : paid > 0 ? "partial" : "unpaid";

    const payload = {
      billNo: billNo.trim(),
      billDate,
      billType: "op",
      patient,
      paymentMode,
      amountPaid: paid,
      status: finalStatus,
      opDiscount: discount,
      opNotes,
      opSections: sections.map(({ _open, ...s }) => s),
    };

    try {
      await onSave(payload);
    } catch (e) {
      setError(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={S.title}>OP Consolidated Bill</h2>
          <p style={S.subtitle}>Outpatient — all charges in one bill</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ ...S.btn, ...S.btnPrimary }}>
          {saving ? "Saving..." : "Save Bill"}
        </button>
      </div>

      {error && <div style={S.errorBanner}>{error}</div>}

      {/* Patient + Bill Info */}
      <div style={S.row}>
        <div style={{ ...S.card, flex: 2 }}>
          <div style={S.cardTitle}>Patient Details</div>
          <div style={S.grid2}>
            <Field label="Patient Name *" value={patient.name}       onChange={(v) => setPatient((p) => ({ ...p, name: v }))}       placeholder="Full name" />
            <Field label="UHID"           value={patient.uhid}       onChange={(v) => setPatient((p) => ({ ...p, uhid: v }))}       placeholder="UHID" />
            <Field label="Age"            value={patient.age}        onChange={(v) => setPatient((p) => ({ ...p, age: v }))}        placeholder="e.g. 35Y" />
            <SelectField label="Gender"   value={patient.gender}     onChange={(v) => setPatient((p) => ({ ...p, gender: v }))}
              options={[{ v: "", l: "Select" }, { v: "Male", l: "Male" }, { v: "Female", l: "Female" }, { v: "Other", l: "Other" }]} />
            <Field label="Phone"          value={patient.phone}      onChange={(v) => setPatient((p) => ({ ...p, phone: v }))}      placeholder="Mobile" />
            <Field label="Referred By"    value={patient.referredBy} onChange={(v) => setPatient((p) => ({ ...p, referredBy: v }))} placeholder="Doctor / source" />
          </div>
          <Field label="Address" value={patient.address} onChange={(v) => setPatient((p) => ({ ...p, address: v }))} placeholder="Address" />
        </div>

        <div style={{ ...S.card, flex: 1 }}>
          <div style={S.cardTitle}>Bill Info</div>
          <Field label="Bill No *"       value={billNo}      onChange={setBillNo}      placeholder="e.g. OP-001" />
          <Field label="Date" type="date" value={billDate}   onChange={setBillDate} />
          <SelectField label="Payment Mode" value={paymentMode} onChange={setPaymentMode}
            options={[{ v: "cash", l: "Cash" }, { v: "card", l: "Card" }, { v: "upi", l: "UPI" }, { v: "bank", l: "Bank Transfer" }]} />
          <Field label="Amount Paid (Rs)" type="number" value={amountPaid} onChange={setAmountPaid} placeholder="0.00" />
          <SelectField label="Status" value={status} onChange={setStatus}
            options={[{ v: "unpaid", l: "Unpaid" }, { v: "partial", l: "Partial" }, { v: "paid", l: "Paid" }]} />
        </div>
      </div>

      {/* Billing Sections */}
      <div style={S.card}>
        <div style={{ ...S.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Billing Sections</span>
          <button onClick={() => setShowAddPanel((v) => !v)} style={{ ...S.btn, ...S.btnOutline, fontSize: 12 }}>
            {showAddPanel ? "Close" : "+ Add Section"}
          </button>
        </div>

        {showAddPanel && (
          <div style={S.addPanel}>
            <div style={S.addPanelTitle}>Select a charge category:</div>
            <div style={S.templateGrid}>
              {SECTION_TEMPLATES.map((t) => (
                <button key={t.sectionType} onClick={() => addSection(t)} style={S.templateBtn}>
                  {t.sectionLabel}
                </button>
              ))}
            </div>
          </div>
        )}

        {sections.length === 0 && (
          <div style={S.emptyMsg}>No sections yet. Click "+ Add Section" to start.</div>
        )}

        {sections.map((section, si) => {
          const secTotal = sectionTotals[si];
          return (
            <div key={si} style={S.section}>
              {/* Section header */}
              <div style={S.sectionHead}>
                <button onClick={() => toggleSection(si)} style={S.toggleBtn}>
                  {section._open ? "v" : ">"}
                </button>
                <input
                  value={section.sectionLabel}
                  onChange={(e) => updateSectionLabel(si, e.target.value)}
                  style={S.sectionLabelInput}
                />
                <span style={S.sectionAmt}>Rs. {secTotal.toFixed(2)}</span>
                <button onClick={() => removeSection(si)} style={S.removeBtn} title="Remove section">
                  Remove
                </button>
              </div>

              {section._open && (
                <div style={{ padding: "8px 12px 12px" }}>
                  {/* Column headers */}
                  <div style={S.itemHeader}>
                    <span style={{ flex: 4 }}>Description</span>
                    <span style={{ flex: 1, textAlign: "right" }}>Qty</span>
                    <span style={{ flex: 1.5, textAlign: "right" }}>Rate (Rs)</span>
                    <span style={{ flex: 1.5, textAlign: "right" }}>Disc %</span>
                    <span style={{ flex: 1.5, textAlign: "right" }}>Amount (Rs)</span>
                    <span style={{ width: 56 }}></span>
                  </div>

                  {section.items.map((item, ii) => {
                    const amt = calcItem(item);
                    return (
                      <div key={ii} style={S.itemRow}>
                        <input
                          style={{ ...S.input, flex: 4 }}
                          placeholder="e.g. Paracetamol 500mg / ECG / Dressing"
                          value={item.description}
                          onChange={(e) => updateItem(si, ii, "description", e.target.value)}
                        />
                        <input
                          style={{ ...S.input, flex: 1, textAlign: "right" }}
                          type="number" min="0"
                          value={item.qty}
                          onChange={(e) => updateItem(si, ii, "qty", e.target.value)}
                        />
                        <input
                          style={{ ...S.input, flex: 1.5, textAlign: "right" }}
                          type="number" min="0" step="0.01"
                          placeholder="0.00"
                          value={item.rate}
                          onChange={(e) => updateItem(si, ii, "rate", e.target.value)}
                        />
                        <input
                          style={{ ...S.input, flex: 1.5, textAlign: "right" }}
                          type="number" min="0" max="100"
                          value={item.discountPercent}
                          onChange={(e) => updateItem(si, ii, "discountPercent", e.target.value)}
                        />
                        <div style={{ flex: 1.5, textAlign: "right", padding: "0 6px", fontWeight: 600, color: "#1a6b3c", fontSize: 13 }}>
                          {amt.toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeItem(si, ii)}
                          disabled={section.items.length === 1}
                          style={{ ...S.removeBtn, width: 50 }}
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}

                  <button onClick={() => addItem(si)} style={{ ...S.btn, ...S.btnGhost, marginTop: 6, fontSize: 12 }}>
                    + Add Row
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes + Summary */}
      <div style={S.row}>
        <div style={{ ...S.card, flex: 2 }}>
          <div style={S.cardTitle}>Notes</div>
          <textarea
            style={{ ...S.input, minHeight: 80, resize: "vertical" }}
            placeholder="Diagnosis, doctor instructions, remarks..."
            value={opNotes}
            onChange={(e) => setOpNotes(e.target.value)}
          />
        </div>

        <div style={{ ...S.card, flex: 1, minWidth: 240 }}>
          <div style={S.cardTitle}>Bill Summary</div>
          <div style={S.summaryTable}>
            {sections.map((s, si) =>
              sectionTotals[si] > 0 ? (
                <SummaryRow key={si} label={s.sectionLabel} value={sectionTotals[si].toFixed(2)} />
              ) : null
            )}
            <div style={S.summaryDivider} />
            <SummaryRow label="Subtotal" value={subtotal.toFixed(2)} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <span style={{ flex: 1, fontSize: 13, color: "#555" }}>Discount (Rs)</span>
              <input
                type="number" min="0"
                value={opDiscount}
                onChange={(e) => setOpDiscount(e.target.value)}
                style={{ ...S.input, width: 90, textAlign: "right", padding: "3px 6px" }}
              />
            </div>
            <div style={S.summaryDivider} />
            <SummaryRow label="Grand Total" value={grandTotal.toFixed(2)} bold />
            <SummaryRow label="Amount Paid" value={(parseFloat(amountPaid) || 0).toFixed(2)} />
            <SummaryRow label="Balance Due"  value={balance.toFixed(2)} color={balance > 0 ? "#c0392b" : "#1a6b3c"} bold />
          </div>
        </div>
      </div>

      {/* Bottom save */}
      <div style={{ textAlign: "right", marginTop: 8 }}>
        {error && <span style={{ color: "#c0392b", marginRight: 16 }}>{error}</span>}
        <button onClick={handleSave} disabled={saving} style={{ ...S.btn, ...S.btnPrimary, padding: "10px 32px" }}>
          {saving ? "Saving..." : "Save Bill"}
        </button>
      </div>
    </div>
  );
}

// ── Reusable field components ─────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={S.label}>{label}</label>
      <input
        type={type}
        style={S.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={S.label}>{label}</label>
      <select style={S.input} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </div>
  );
}

function SummaryRow({ label, value, bold, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
      <span style={{ color: "#555" }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: color || "#1a1a2e" }}>Rs. {value}</span>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px 16px",
    color: "#1a1a2e",
    background: "#f4f6f9",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title:    { margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e" },
  subtitle: { margin: "4px 0 0", fontSize: 13, color: "#666" },
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: "1px solid #e8eaf0",
  },
  row:   { display: "flex", gap: 16, flexWrap: "wrap" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dde1ea",
    borderRadius: 6,
    padding: "7px 10px",
    fontSize: 13,
    background: "#fafafa",
    outline: "none",
    color: "#1a1a2e",
  },
  btn: {
    cursor: "pointer",
    border: "none",
    borderRadius: 7,
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
  },
  btnPrimary: { background: "#2563eb", color: "#fff" },
  btnOutline: { background: "#fff", color: "#2563eb", border: "1.5px solid #2563eb" },
  btnGhost:   { background: "#f0f4ff", color: "#2563eb", border: "none" },
  addPanel: {
    background: "#f0f4ff",
    borderRadius: 8,
    padding: "14px 12px",
    marginBottom: 12,
    border: "1px dashed #93c5fd",
  },
  addPanelTitle: { fontSize: 12, fontWeight: 600, color: "#2563eb", marginBottom: 10 },
  templateGrid:  { display: "flex", flexWrap: "wrap", gap: 8 },
  templateBtn: {
    background: "#fff",
    border: "1.5px solid #dde1ea",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
    color: "#333",
    fontFamily: "inherit",
  },
  section: {
    border: "1px solid #e8eaf0",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f8f9fc",
    padding: "8px 12px",
    borderBottom: "1px solid #e8eaf0",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#2563eb",
    padding: "0 4px",
    lineHeight: 1,
    fontFamily: "inherit",
  },
  sectionLabelInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a2e",
    outline: "none",
    fontFamily: "inherit",
  },
  sectionAmt: { fontSize: 13, fontWeight: 700, color: "#1a6b3c", minWidth: 100, textAlign: "right" },
  removeBtn: {
    background: "none",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    color: "#c0392b",
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 4,
    fontFamily: "inherit",
  },
  itemHeader: {
    display: "flex",
    gap: 6,
    padding: "4px 0",
    fontSize: 11,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderBottom: "1px solid #f0f0f0",
    marginBottom: 4,
  },
  itemRow: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    marginBottom: 4,
  },
  summaryTable:   { fontSize: 13 },
  summaryDivider: { borderTop: "1px solid #e8eaf0", margin: "6px 0" },
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
    borderRadius: 7,
    padding: "10px 14px",
    marginBottom: 14,
    fontSize: 13,
  },
  emptyMsg: {
    textAlign: "center",
    color: "#aaa",
    padding: "24px 0",
    fontSize: 13,
  },
};