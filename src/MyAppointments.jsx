import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./MyAppointments.css";

function MyAppointments({ user, onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  async function loadAppointments() {
    if (!user?.id) {
      setMessage("Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        reason,
        status,
        doctors (
          full_name,
          specialization,
          hospital_name
        )
      `)
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: false });

    if (error) {
      setMessage("Appointments load nahi hui: " + error.message);
    } else {
      setAppointments(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, [user?.id]);

  async function cancelAppointment(appointmentId) {
    const confirmed = window.confirm(
      "Kya tum sach mein ye appointment cancel karna chahte ho?"
    );

    if (!confirmed) return;

    setCancellingId(appointmentId);
    setMessage("");

    const { error } = await supabase
      .from("appointments")
      .update({ status: "Cancelled" })
      .eq("id", appointmentId)
      .eq("patient_id", user.id)
      .eq("status", "Booked");

    if (error) {
      setMessage("Appointment cancel nahi hui: " + error.message);
    } else {
      setMessage("Appointment cancel request process ho gayi.");
      await loadAppointments();
    }

    setCancellingId(null);
  }

  function formatDate(date) {
    if (!date) return "Date not available";

    return new Date(date + "T00:00:00").toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(time) {
    if (!time) return "Time not available";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="my-appointments-page">
      <button
        type="button"
        className="my-appointments-back"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <header className="my-appointments-header">
        <span>HEALTHCONNECT CARE</span>
        <h1>My Appointments</h1>
        <p>Apni booked appointments yahan check karo.</p>
      </header>

      {message && (
        <p className="my-appointments-message">{message}</p>
      )}

      {loading ? (
        <p className="my-appointments-empty">Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <div className="my-appointments-empty">
          <div className="my-appointments-empty-icon">📅</div>
          <h2>No appointments yet</h2>
          <p>Jab tum appointment book karoge, woh yahan dikhegi.</p>
        </div>
      ) : (
        <div className="my-appointments-list">
          {appointments.map((appointment) => (
            <article
              className="my-appointment-card"
              key={appointment.id}
            >
              <div className="my-appointment-top">
                <div>
                  <h2>
                    {appointment.doctors?.full_name ||
                      "Doctor details unavailable"}
                  </h2>
                  <p className="my-appointment-specialization">
                    {appointment.doctors?.specialization ||
                      "Specialization not listed"}
                  </p>
                </div>

                <span
                  className={`my-appointment-status ${
                    appointment.status === "Cancelled"
                      ? "cancelled"
                      : "booked"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <p className="my-appointment-detail">
                🏥 {appointment.doctors?.hospital_name ||
                  "Hospital not listed"}
              </p>

              <p className="my-appointment-detail">
                📅 {formatDate(appointment.appointment_date)}
              </p>

              <p className="my-appointment-detail">
                🕒 {formatTime(appointment.appointment_time)}
              </p>

              {appointment.reason && (
                <p className="my-appointment-reason">
                  <strong>Reason:</strong> {appointment.reason}
                </p>
              )}

              {appointment.status === "Booked" && (
                <button
                  type="button"
                  className="my-appointment-cancel"
                  disabled={cancellingId === appointment.id}
                  onClick={() => cancelAppointment(appointment.id)}
                >
                  {cancellingId === appointment.id
                    ? "Cancelling..."
                    : "Cancel Appointment"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;