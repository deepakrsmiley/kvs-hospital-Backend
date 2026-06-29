import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { Receipt, ClipboardList, Wallet, Users } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-label">Total Bills</div>
            <div className="stat-icon blue"><Receipt /></div>
          </div>
          <div className="stat-value">{data.totalBills}</div>
          <div className="stat-sub">This Month</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-label">Total Discharge Summaries</div>
            <div className="stat-icon green"><ClipboardList /></div>
          </div>
          <div className="stat-value">{data.totalDischargeSummaries}</div>
          <div className="stat-sub">This Month</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-icon purple"><Wallet /></div>
          </div>
          <div className="stat-value">₹{data.totalRevenue.toLocaleString("en-IN")}</div>
          <div className="stat-sub">This Month</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-label">Records</div>
            <div className="stat-icon orange"><Users /></div>
          </div>
          <div className="stat-value">{data.totalBills + data.totalDischargeSummaries}</div>
          <div className="stat-sub">All Time</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-title">Recent Invoices</h3>
          {data.recentInvoices.length === 0 && <div className="empty-state">No invoices yet</div>}
          {data.recentInvoices.map((inv) => (
            <div key={inv._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eef2f7", fontSize: 13.5 }}>
              <span>#{inv.invoiceNo} — {inv.customer?.name}</span>
              <Link to={`/invoices/${inv._id}/print`} style={{ color: "var(--primary)", fontWeight: 600 }}>View →</Link>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="card-title">Recent Discharge Summaries</h3>
          {data.recentSummaries.length === 0 && <div className="empty-state">No discharge summaries yet</div>}
          {data.recentSummaries.map((ds) => (
            <div key={ds._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eef2f7", fontSize: 13.5 }}>
              <span>{ds.patientName} — MRN {ds.mrn}</span>
              <Link to={`/discharge-summaries/${ds._id}/print`} style={{ color: "var(--primary)", fontWeight: 600 }}>View →</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}