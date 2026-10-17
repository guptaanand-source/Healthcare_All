import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./HealthHistory.css";

function HealthHistory({ user, onBack }) {
  const [records, setRecords] = useState([]);
  const [recordType, setRecordType] = useState("Medical Condition");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadHistory() {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("health_history")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("History load nahi hui: " + error.message);
    } else {
      setRecords(data || []);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  async function addRecord(e) {
    e.preventDefault();

    if (!user?.id) {
      setMessage("Please login again.");
      return;
    }

    if (!title.trim()) {
      setMessage("Please record ka title enter karo.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("health_history").insert({
      patient_id: user.id,
      record_type: recordType,
      title: title.trim(),
      description: description.trim(),
      record_date: recordDate || null,
    });

    if (error) {
      setMessage("Record save nahi hua: " + error.message);
    } else {
      setTitle("");
      setDescription("");
      setRecordDate("");
      setMessage("Health history successfully save ho gayi!");
      await loadHistory();
    }

    setLoading(false);
  }

  async function deleteRecord(id) {
    const confirmed = window.confirm(
      "Kya tum ye health history record delete karna chahte ho?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("health_history")
      .delete()
      .eq("id", id)
      .eq("patient_id", user.id);

    if (error) {
      setMessage("Record delete nahi hua: " + error.message);
    } else {
      setRecords((previous) =>
        previous.filter((record) => record.id !== id)
      );
      setMessage("Record delete ho gaya.");
    }
  }

  return (
    <div className="health-history-page">
      <button className="history-back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <header className="history-header">
        <span className="history-eyebrow">YOUR HEALTH JOURNEY</span>
        <h1>Health History</h1>
        <p>
          Keep your past medical conditions, allergies and surgeries
          organized in one place.
        </p>
      </header>

      <section className="history-form-card">
        <h2>Add Health Record</h2>

        <form onSubmit={addRecord} className="history-form">
          <label>
            Record Type
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
            >
              <option>Medical Condition</option>
              <option>Allergy</option>
              <option>Surgery</option>
            </select>
          </label>

          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter record title"
              maxLength={120}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows={4}
              maxLength={3000}
            />
          </label>

          <label>
            Record Date
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="history-save-button"
            disabled={loading}
          >
            {loading ? "Saving..." : "+ Save Health Record"}
          </button>

          {message && (
            <p className="history-message" role="status">
              {message}
            </p>
          )}
        </form>
      </section>

      <section className="history-records-section">
        <h2>Previous Records ({records.length})</h2>

        {records.length === 0 ? (
          <div className="history-empty">
            <h3>No health records yet</h3>
            <p>Your saved records will appear here.</p>
          </div>
        ) : (
          <div className="history-records-list">
            {records.map((record) => (
              <article className="history-record-card" key={record.id}>
                <div className="history-record-top">
                  <span className="history-type-badge">
                    {record.record_type}
                  </span>
                  {record.record_date && (
                    <span className="history-record-date">
                      {record.record_date}
                    </span>
                  )}
                </div>

                <h3>{record.title}</h3>

                {record.description && <p>{record.description}</p>}

                <button
                  className="history-delete-button"
                  onClick={() => deleteRecord(record.id)}
                >
                  Delete Record
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HealthHistory;