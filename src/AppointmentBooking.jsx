import { useState } from "react";
import { supabase } from "./supabase";
import "./AppointmentBooking.css";

function AppointmentBooking({ doctor, user, onBack }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toLocaleDateString("en-CA");

  async function handleBooking(e) {
    e.preventDefault();
    setMessage("");

    if (!user?.id) {
      setMessage("Please login again.");
      return;
    }

    if (date < today) {
      setMessage("Past date select nahi kar sakte.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("appointments")
      .insert({
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_date: date,
        appointment_time: time,
        reason: reason.trim(),
      });

    if (error) {
      setMessage("Booking failed: " + error.message);
    } else {
      setMessage("Appointment successfully book ho gayi!");
      setDate("");
      setTime("");
      setReason("");
    }

    setLoading(false);
  }

  return (
    <div className="appointment-page">
      <button
        type="button"
        className="appointment-back"
        onClick={onBack}
      >
        ← Back
      </button>

      <div className="appointment-card">
        <span className="appointment-eyebrow">HEALTHCONNECT CARE</span>
        <h1>Book Appointment</h1>

        <div className="appointment-doctor">
          <h2>{doctor.full_name}</h2>
          <p>{doctor.specialization}</p>
          <p>{doctor.hospital_name || "Hospital not listed"}</p>
        </div>

        <form onSubmit={handleBooking}>
          <label htmlFor="appointment-date">Appointment Date</label>
          <input
            id="appointment-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label htmlFor="appointment-time">Appointment Time</label>
          <input
            id="appointment-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <label htmlFor="appointment-reason">
            Reason for Visit
          </label>
          <textarea
            id="appointment-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe the reason (optional)"
            rows="3"
          />

          {message && (
            <p className="appointment-message">{message}</p>
          )}

          <button
            type="submit"
            className="appointment-submit"
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentBooking;