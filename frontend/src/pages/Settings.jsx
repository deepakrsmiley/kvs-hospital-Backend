import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useSettings } from "../context/SettingsContext.jsx";

const emptyForm = {
  hospitalName: "",
  tagline: "",
  address: "",
  phone: "",
  email: "",
  gstNumber: "",
  termsAndConditions: "",
  doctorName: "",
  doctorDesignation: "",
  doctorRegistrationNumber: "",
  bankDetails: { name: "", branch: "", accountNumber: "", ifsc: "", upiId: "" },
};

export default function Settings() {
  const { settings, refreshSettings } = useSettings();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (settings) {
      setForm({
        hospitalName: settings.hospitalName || "",
        tagline: settings.tagline || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        gstNumber: settings.gstNumber || "",
        termsAndConditions: settings.termsAndConditions || "",
        doctorName: settings.doctorName || "",
        doctorDesignation: settings.doctorDesignation || "",
        doctorRegistrationNumber: settings.doctorRegistrationNumber || "",
        bankDetails: settings.bankDetails || emptyForm.bankDetails,
      });
    }
  }, [settings]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateBank = (key, value) =>
    setForm((f) => ({ ...f, bankDetails: { ...f.bankDetails, [key]: value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put("/settings", form);
      await refreshSettings();
      setMessage("Settings saved successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (field, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      await api.post(`/settings/upload/${field}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshSettings();
      setMessage("Image uploaded successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Hospital Branding Settings</h2>
      {message && (
        <div
          style={{
            background: "#e6f6ea",
            color: "#267d40",
            padding: "8px 14px",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13.5,
          }}
        >
          {message}
        </div>
      )}

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <h3 className="card-title">Branding Images</h3>

          <div className="upload-box">
            <div className="upload-preview">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="logo"
                />
              ) : (
                "Logo"
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                Hospital Logo
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload("logoUrl", e.target.files[0])}
              />
            </div>
          </div>

          <div className="upload-box">
            <div className="upload-preview">
              {settings?.doctorSignatureUrl ? (
                <img src={settings.doctorSignatureUrl} alt="sig" />
              ) : (
                "Sign"
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                Doctor Signature
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleUpload("doctorSignatureUrl", e.target.files[0])
                }
              />
            </div>
          </div>

          <div className="upload-box">
            <div className="upload-preview">
              {settings?.sealUrl ? (
                <img src={settings.sealUrl} alt="seal" />
              ) : (
                "Seal"
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                Hospital Seal
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload("sealUrl", e.target.files[0])}
              />
            </div>
          </div>

          <div className="upload-box">
            <div className="upload-preview">
              {settings?.adImageUrl ? (
                <img src={settings.adImageUrl} alt="ad" />
              ) : (
                "Ad Banner"
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                Invoice Header Ad / Product Banner
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload("adImageUrl", e.target.files[0])}
              />
            </div>
          </div>

          <div className="upload-box">
            <div className="upload-preview">
              {settings?.bankDetails?.qrCodeUrl ? (
                <img src={settings.bankDetails.qrCodeUrl} alt="qr" />
              ) : (
                "QR"
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                Payment QR Code
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload("qrCodeUrl", e.target.files[0])}
              />
            </div>
          </div>
        </div>

        <form className="card" onSubmit={handleSave}>
          <h3 className="card-title">Hospital Details</h3>
          <div className="form-group">
            <label>Hospital Name</label>
            <input
              className="form-control"
              value={form.hospitalName}
              onChange={(e) => update("hospitalName", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Tagline</label>
            <input
              className="form-control"
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              className="form-control"
              rows={2}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Phone</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>GST Number</label>
            <input
              className="form-control"
              value={form.gstNumber}
              onChange={(e) => update("gstNumber", e.target.value)}
            />
          </div>

          <h3 className="card-title" style={{ marginTop: 18 }}>
            Doctor Details (Discharge Summary)
          </h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Doctor Name</label>
              <input
                className="form-control"
                value={form.doctorName}
                onChange={(e) => update("doctorName", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input
                className="form-control"
                value={form.doctorDesignation}
                onChange={(e) => update("doctorDesignation", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Registration Number</label>
            <input
              className="form-control"
              value={form.doctorRegistrationNumber}
              onChange={(e) =>
                update("doctorRegistrationNumber", e.target.value)
              }
            />
          </div>

          <h3 className="card-title" style={{ marginTop: 18 }}>
            Bank Details
          </h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Bank Name</label>
              <input
                className="form-control"
                value={form.bankDetails.name}
                onChange={(e) => updateBank("name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Branch</label>
              <input
                className="form-control"
                value={form.bankDetails.branch}
                onChange={(e) => updateBank("branch", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                className="form-control"
                value={form.bankDetails.accountNumber}
                onChange={(e) => updateBank("accountNumber", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>IFSC</label>
              <input
                className="form-control"
                value={form.bankDetails.ifsc}
                onChange={(e) => updateBank("ifsc", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>UPI ID</label>
            <input
              className="form-control"
              value={form.bankDetails.upiId}
              onChange={(e) => updateBank("upiId", e.target.value)}
            />
          </div>

          <h3 className="card-title" style={{ marginTop: 18 }}>
            Terms & Conditions (Invoice)
          </h3>
          <div className="form-group">
            <textarea
              className="form-control"
              rows={4}
              value={form.termsAndConditions}
              onChange={(e) => update("termsAndConditions", e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}