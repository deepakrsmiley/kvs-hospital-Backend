import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const BILL_TYPE_LABELS = {
  pharmacy: "Pharmacy",
  lab: "Lab",
  consultation: "Consultation",
  ip: "IP Overall",
};

export default function BillList() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { search, page };
      if (typeFilter !== "all") params.billType = typeFilter;
      const res = await api.get("/bills", { params });
      setBills(res.data.bills);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/bills/${deleteId}`);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <div className="breadcrumb">Dashboard / Bills</div>
          <h2>Hospital Bills</h2>
        </div>
        <Link to="/bills/new" className="btn btn-primary">+ New Bill</Link>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <form className="search-bar" style={{ margin: 0, flex: 1 }} onSubmit={handleSearch}>
          <input
            className="form-control"
            placeholder="Search by bill no, patient name, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "pharmacy", "lab", "consultation", "ip"].map((t) => (
            <button
              key={t}
              type="button"
              className={typeFilter === t ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
              onClick={() => { setTypeFilter(t); setPage(1); }}
            >
              {t === "all" ? "All" : BILL_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading bills...</div>
        ) : bills.length === 0 ? (
          <div className="empty-state">
            No bills found. <Link to="/bills/new" style={{ color: "var(--primary)", fontWeight: 600 }}>Create your first bill</Link>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 12 }}>
              Showing {bills.length} of {total} results
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bill No</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Mobile</th>
                    <th style={{ textAlign: "right" }}>Grand Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill._id}>
                      <td style={{ fontWeight: 700, color: "var(--primary-dark)" }}>#{bill.billNo}</td>
                      <td>
                        <span style={{
                          display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 11.5, fontWeight: 600,
                          background: bill.billType === "pharmacy" ? "#e3f0fc" : bill.billType === "lab" ? "#fef9c3" : bill.billType === "consultation" ? "#f0fdf4" : "#fdf4ff",
                          color: bill.billType === "pharmacy" ? "#1565c0" : bill.billType === "lab" ? "#92400e" : bill.billType === "consultation" ? "#166534" : "#7e22ce",
                        }}>
                          {BILL_TYPE_LABELS[bill.billType] || bill.billType}
                        </span>
                      </td>
                      <td style={{ color: "#6b7280" }}>{bill.billDate}</td>
                      <td style={{ fontWeight: 600 }}>{bill.patient?.name}</td>
                      <td style={{ color: "#6b7280" }}>{bill.patient?.phone}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>₹{bill.grandTotal?.toLocaleString("en-IN")}</td>
                      <td><span className={`badge badge-${bill.status}`}>{bill.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/bills/${bill._id}/print`)}>Print</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/bills/${bill._id}/edit`)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(bill._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
              const p = i + 1;
              return <button key={i} className={page === p ? "active" : ""} onClick={() => setPage(p)}>{p}</button>;
            })}
            {pages > 5 && <span style={{ padding: "6px 4px", color: "#6b7280" }}>...</span>}
            {pages > 5 && <button className={page === pages ? "active" : ""} onClick={() => setPage(pages)}>{pages}</button>}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</button>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Delete Bill?</h3>
            <p style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 20px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}