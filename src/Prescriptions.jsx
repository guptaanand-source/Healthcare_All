import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./Prescriptions.css";

function Prescriptions({ onBack }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  async function loadPrescriptions() {
    setLoading(true);

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please log in to view prescriptions.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load prescriptions: " + error.message);
    } else {
      setPrescriptions(data || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setMedicineName("");
    setDosage("");
    setFrequency("");
    setDoctorName("");
    setStartDate("");
    setEndDate("");
    setInstructions("");
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please log in first.");
      setSaving(false);
      return;
    }

    const record = {
      medicine_name: medicineName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      doctor_name: doctorName.trim(),
      start_date: startDate || null,
      end_date: endDate || null,
      instructions: instructions.trim(),
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("prescriptions")
        .update(record)
        .eq("id", editingId)
        .eq("patient_id", user.id);
    } else {
      result = await supabase
        .from("prescriptions")
        .insert({
          ...record,
          patient_id: user.id,
        });
    }

    if (result.error) {
      setMessage("Error: " + result.error.message);
    } else {
      setMessage(
        editingId
          ? "Prescription updated successfully!"
          : "Prescription saved successfully!"
      );

      resetForm();
      await loadPrescriptions();
    }

    setSaving(false);
  }

  function editPrescription(item) {
    setMedicineName(item.medicine_name || "");
    setDosage(item.dosage || "");
    setFrequency(item.frequency || "");
    setDoctorName(item.doctor_name || "");
    setStartDate(item.start_date || "");
    setEndDate(item.end_date || "");
    setInstructions(item.instructions || "");
    setEditingId(item.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletePrescription(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmed) return;

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please log in first.");
      return;
    }

    const { error } = await supabase
      .from("prescriptions")
      .delete()
      .eq("id", id)
      .eq("patient_id", user.id);

    if (error) {
      setMessage("Could not delete: " + error.message);
    } else {
      setPrescriptions((current) =>
        current.filter((item) => item.id !== id)
      );
      setMessage("Prescription deleted successfully!");
    }
  }

  return (
    <main className="prescriptions-page">
      <header className="prescriptions-header">
        <button
          type="button"
          className="prescriptions-back"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <h1>💊 My Prescriptions</h1>
        <p>Keep your prescription information organized.</p>
      </header>

      <section className="prescription-form-section">
        <h2>
          {editingId ? "Edit Prescription" : "Add Prescription"}
        </h2>

        <form
          className="prescription-form"
          onSubmit={handleSubmit}
        >
          <label>
            Medicine Name *
            <input
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. Medicine name"
              required
            />
          </label>

          <label>
            Dosage *
            <input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. As prescribed"
              required
            />
          </label>

          <label>
            Frequency
            <input
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g. As directed by doctor"
            />
          </label>

          <label>
            Doctor Name
            <input
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Doctor's name"
            />
          </label>

          <label>
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>

          <label className="prescription-instructions">
            Instructions
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Optional notes from the prescription"
              rows={3}
            />
          </label>

          <div className="prescription-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Prescription"
                  : "Save Prescription"}
            </button>

            {editingId && (
              <button
                type="button"
                className="prescription-cancel"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="prescription-message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="prescription-list-section">
        <h2>Saved Prescriptions</h2>

        {loading ? (
          <p>Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <p className="prescription-empty">
            No prescriptions saved yet. Add your first record above.
          </p>
        ) : (
          <div className="prescription-grid">
            {prescriptions.map((item) => (
              <article
                className="prescription-card"
                key={item.id}
              >
                <h3>💊 {item.medicine_name}</h3>

                <p><strong>Dosage:</strong> {item.dosage}</p>

                {item.frequency && (
                  <p><strong>Frequency:</strong> {item.frequency}</p>
                )}

                {item.doctor_name && (
                  <p><strong>Doctor:</strong> {item.doctor_name}</p>
                )}

                {item.start_date && (
                  <p><strong>Start:</strong> {item.start_date}</p>
                )}

                {item.end_date && (
                  <p><strong>End:</strong> {item.end_date}</p>
                )}

                {item.instructions && (
                  <p><strong>Instructions:</strong> {item.instructions}</p>
                )}

                <div className="prescription-card-actions">
                  <button
                    type="button"
                    onClick={() => editPrescription(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="prescription-delete"
                    onClick={() => deletePrescription(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Prescriptions;