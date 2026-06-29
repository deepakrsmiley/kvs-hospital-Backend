import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";
import InvoiceList from "./pages/InvoiceList.jsx";
import InvoiceForm from "./pages/InvoiceForm.jsx";
import InvoicePrint from "./pages/InvoicePrint.jsx";
import DischargeList from "./pages/DischargeList.jsx";
import DischargeForm from "./pages/DischargeForm.jsx";
import DischargePrint from "./pages/DischargePrint.jsx";
import BillList from "./pages/BillList.jsx";
import BillForm from "./pages/BillForm.jsx";
import BillPrint from "./pages/BillPrint.jsx";
import OPBillForm from "./components/OPBillForm.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/invoices/:id/print"
        element={<ProtectedRoute><InvoicePrint /></ProtectedRoute>}
      />
      <Route
        path="/discharge-summaries/:id/print"
        element={<ProtectedRoute><DischargePrint /></ProtectedRoute>}
      />
      <Route
        path="/bills/:id/print"
        element={<ProtectedRoute><BillPrint /></ProtectedRoute>}
      />

      <Route
        path="/"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="discharge-summaries" element={<DischargeList />} />
        <Route path="discharge-summaries/new" element={<DischargeForm />} />
        <Route path="discharge-summaries/:id/edit" element={<DischargeForm />} />
        <Route path="bills" element={<BillList />} />
        <Route path="bills/new" element={<BillForm />} />
        <Route path="bills/:id/edit" element={<BillForm />} />
        <Route
          path="op-bill/new"
          element={
            <OPBillForm
              onSave={async (payload) => {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/bills", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Save failed");
              }}
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}