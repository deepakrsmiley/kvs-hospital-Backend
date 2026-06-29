import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function DischargeList() {
  const [summaries, setSummaries] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/discharge-summaries", { params: { search, page } });
      setSummaries(res.data.summaries);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/discharge-summaries/${deleteId}`);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Discharge Summaries</h2>
        <Link to="/discharge-summaries/new" className="btn btn-primary">+ New Discharge Summary</Link>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          className="form-control"
          placeholder="Search by patient name or MRN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : summaries.length === 0 ? (
          <div className="empty-state">No discharge summaries found. Create your first one.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>MRN</th>
                  <th>Admission Date</th>
                  <th>Discharge Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((ds) => (
                  <tr key={ds._id}>
                    <td>{ds.patientName}</td>
                    <td>{ds.mrn}</td>
                    <td>{ds.admissionDate}</td>
                    <td>{ds.dischargeDate}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/discharge-summaries/${ds._id}/print`)}>Print</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/discharge-summaries/${ds._id}/edit`)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(ds._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Delete discharge summary?</h3>
            <p style={{ fontSize: 13.5, color: "#5c7184" }}>This action cannot be undone.</p>
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
