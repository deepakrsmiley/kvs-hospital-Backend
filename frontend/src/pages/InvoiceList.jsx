import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices", { params: { search, page } });
      setInvoices(res.data.invoices);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${deleteId}`);
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
          <div className="breadcrumb">Dashboard / Billing</div>
          <h2>Billing / Invoices</h2>
        </div>
        <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <form className="search-bar" style={{ margin: 0, flex: 1 }} onSubmit={handleSearch}>
          <input
            className="form-control"
            placeholder="Search by invoice no, customer name, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 380 }}
          />
          <button type="submit" className="btn btn-secondary">
            🔍 Search
          </button>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            No invoices found. <Link to="/invoices/new" style={{ color: "var(--primary)", fontWeight: 600 }}>Create your first invoice</Link>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 12 }}>
              Showing {invoices.length} of {total} results
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th style={{ textAlign: "right" }}>Grand Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td style={{ fontWeight: 700, color: "var(--primary-dark)" }}>#{inv.invoiceNo}</td>
                      <td style={{ color: "#6b7280" }}>{inv.invoiceDate}</td>
                      <td style={{ fontWeight: 600 }}>{inv.customer?.name}</td>
                      <td style={{ color: "#6b7280" }}>{inv.customer?.phone}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>₹{inv.grandTotal?.toLocaleString("en-IN")}</td>
                      <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/invoices/${inv._id}/print`)}>🖨 Print</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/invoices/${inv._id}/edit`)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(inv._id)}>🗑</button>
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
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
              const p = i + 1;
              return <button key={i} className={page === p ? "active" : ""} onClick={() => setPage(p)}>{p}</button>;
            })}
            {pages > 5 && <span style={{ padding: "6px 4px", color: "#6b7280" }}>...</span>}
            {pages > 5 && <button className={page === pages ? "active" : ""} onClick={() => setPage(pages)}>{pages}</button>}
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}>›</button>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗑️</div>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Delete Invoice?</h3>
            <p style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 20px" }}>This action cannot be undone. The invoice will be permanently deleted.</p>
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
