import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./Doctors.css";

function Doctors({ onBack, onBookAppointment }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("doctors")
        .select("id, full_name, specialization, hospital_name, phone")
        .order("full_name");

      if (error) {
        setMessage("Doctors load nahi hue: " + error.message);
      } else {
        setDoctors(data || []);
      }

      setLoading(false);
    }

    loadDoctors();
  }, []);

  return (
    <div className="doctors-page">
      <button
        type="button"
        className="doctors-back-button"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <header className="doctors-header">
        <span className="doctors-eyebrow">HEALTHCONNECT CARE</span>
        <h1>Find Your Doctor</h1>
        <p>
          Explore doctor profiles and continue to appointment booking.
        </p>
      </header>

      {loading ? (
        <p className="doctors-message">Loading doctors...</p>
      ) : message ? (
        <p className="doctors-error">{message}</p>
      ) : doctors.length === 0 ? (
        <p className="doctors-message">
          Abhi koi doctor available nahi hai.
        </p>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <article className="doctor-card" key={doctor.id}>
              <div className="doctor-avatar">👨‍⚕️</div>

              <span className="doctor-specialization">
                {doctor.specialization}
              </span>

              <h2>{doctor.full_name}</h2>

              <p className="doctor-hospital">
                🏥 {doctor.hospital_name || "Hospital not listed"}
              </p>

              <p className="doctor-phone">
                ☎ {doctor.phone || "Contact not listed"}
              </p>

              <button
                type="button"
                className="doctor-book-button"
                onClick={() => onBookAppointment(doctor)}
              >
                Book Appointment →
              </button>
            </article>
          ))}
        </div>
      )}

      <p className="doctors-demo-note">
        Demo directory: doctor details are sample data and are not verified.
      </p>
    </div>
  );
}

export default Doctors;