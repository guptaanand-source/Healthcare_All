import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./MedicalRecords.css";

function MedicalRecords({ onBack }) {
  const [reports, setReports] = useState([]);
  const [reportName, setReportName] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [editingReportId, setEditingReportId] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setReports([]);
        setMessage("Please log in to view your reports.");
        setMessageType("error");
        return;
      }

      const { data, error } = await supabase
        .from("medical_reports")
        .select("*")
        .eq("patient_id", user.id)
        .order("report_date", { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      setMessage(error.message || "Could not load reports.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function addReport(e) {
    e.preventDefault();
    setMessage("");

    if (!reportName.trim() || !reportDate) {
      setMessage("Please enter the report name and date.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setMessage("Please log in first.");
        setMessageType("error");
        return;
      }

      if (editingReportId) {
  const { error } = await supabase
    .from("medical_reports")
    .update({
      report_name: reportName.trim(),
      report_date: reportDate,
      details: details.trim(),
    })
    .eq("id", editingReportId)
    .eq("patient_id", user.id);

  if (error) throw error;
} else {
  const { error } = await supabase
    .from("medical_reports")
    .insert({
      patient_id: user.id,
      report_name: reportName.trim(),
      report_date: reportDate,
      details: details.trim(),
    });

  if (error) throw error;
}

      setReportName("");
      setReportDate("");
      setDetails("");
      setEditingReportId(null);

      setMessage(
  editingReportId
    ? "Report updated successfully!"
    : "Medical report saved successfully!"
);
setMessageType("success");

      await loadReports();
    } catch (error) {
      setMessage(error.message || "Could not save the report.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }
  async function deleteReport(reportId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("medical_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      setReports((previousReports) =>
        previousReports.filter((report) => report.id !== reportId)
      );

      setMessage("Report deleted successfully!");
setMessageType("success");

setTimeout(() => {
  setMessage("");
}, 3000);
    } catch (error) {
      setMessage(error.message || "Could not delete report.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="medical-records-page">
      <header className="records-header">
        <div>
          <span className="records-eyebrow">HEALTHCONNECT</span>
          <h1>Medical Reports</h1>
          <p>Keep your healthcare records organized.</p>
        </div>

        <button
          className="records-back"
          type="button"
          onClick={onBack}
        >
          ← Dashboard
        </button>
      </header>

      <section className="records-notice">
        <span>🔒</span>
        <p>
          <strong>Privacy reminder:</strong> Only add demo or
          non-sensitive information while developing this project.
        </p>
      </section>

      <section className="add-report-section">
        <h2>＋ Add New Medical Report</h2>
        <p>Enter the report details below.</p>

        <form
          onSubmit={addReport}
          className="add-report-form"
        >
          <label htmlFor="reportName">Report Name</label>
          <input
            id="reportName"
            type="text"
            placeholder="e.g. Blood Test"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            required
          />

          <label htmlFor="reportDate">Report Date</label>
          <input
            id="reportDate"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            required
          />

          <label htmlFor="reportDetails">Report Details</label>
          <textarea
            id="reportDetails"
            placeholder="Enter report details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
          />

          {message && (
            <p
              className={`report-message ${messageType}`}
              role="status"
            >
              {message}
            </p>
          )}

          <button
            className="save-report-button"
            type="submit"
            disabled={loading}
          >
            {loading
  ? "Please wait..."
  : editingReportId
    ? "Update Report"
    : "Save Report"}
          </button>
        </form>
      </section>
      <section className="reports-list-section">
        <div className="reports-heading">
          <div>
            <h2>Your Reports</h2>
            <p>Your saved reports will appear here.</p>
          </div>

          <button
            className="records-back"
            type="button"
            onClick={loadReports}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading && <p>Loading reports...</p>}

        {!loading && reports.length === 0 && (
          <div className="empty-reports">
            <span>📂</span>
            <h3>No reports yet</h3>
            <p>Add your first report using the form above.</p>
          </div>
        )}

        <div className="reports-grid">
          {reports.map((report) => (
            <article
              className="report-card"
              key={report.id}
            >
              <div className="report-icon blue">📄</div>

              <span className="report-status">Saved</span>

              <h3>{report.report_name}</h3>

              <p className="report-category">
                {report.details || "No additional details"}
              </p>

              <div className="report-divider" />

              <div className="report-date">
                <span>📅</span>
                <span>{report.report_date}</span>
              </div>
              <button
  className="edit-report-button"
  type="button"
  onClick={() => {
    setEditingReportId(report.id);
    setReportName(report.report_name);
    setReportDate(report.report_date);
    setDetails(report.details || "");
    setMessage("Report details loaded for editing.");
    setMessageType("info");
  }}
>
  ✏️ Edit Report
</button>
              <button
                
                className="delete-report-button"
                type="button"
                disabled={loading}
                onClick={() => deleteReport(report.id)}
              >
                🗑️ Delete Report
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default MedicalRecords;