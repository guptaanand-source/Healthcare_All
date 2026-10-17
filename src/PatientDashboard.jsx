import { useEffect, useState } from "react";
import "./PatientDashboard.css";
import MedicalRecords from "./MedicalRecords";
import { supabase } from "./supabase";
import Prescriptions from "./Prescriptions";
import HealthHistory from "./HealthHistory";
import Doctors from "./Doctors";
import AppointmentBooking from "./AppointmentBooking";
import MyAppointments from "./MyAppointments";

function PatientDashboard({ user, onLogout }) {
    async function loadProfile() {
  if (!user?.id) return;

  setProfileLoading(true);
  setProfileMessage("");

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone, date_of_birth")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    setProfileMessage("Profile load nahi hui: " + error.message);
  } else if (data) {
    setProfilePhone(data.phone || "");
    setProfileDob(data.date_of_birth || "");
  }

  setProfileLoading(false);
}

async function saveProfile(e) {
  e.preventDefault();

  if (!user?.id) {
    setProfileMessage("Please login again.");
    return;
  }

  setProfileLoading(true);
  setProfileMessage("");

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        role: "patient",
        phone: profilePhone.trim(),
        date_of_birth: profileDob || null,
      },
      { onConflict: "id" }
    );

  if (error) {
    setProfileMessage("Profile save nahi hui: " + error.message);
  } else {
    setProfileMessage("Profile successfully save ho gayi!");
  }

  setProfileLoading(false);
}
  const [showHealthHistory, setShowHealthHistory] = useState(false);
  const [showDoctors, setShowDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [profilePhone, setProfilePhone] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [showReports, setShowReports] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [reportCount, setReportCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  useEffect(() => {
  async function loadReportCount() {
    const { data: { user: currentUser } } =
      await supabase.auth.getUser();

    if (!currentUser) return;

    const { count, error } = await supabase
      .from("medical_reports")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", currentUser.id);

    if (!error) {
      setReportCount(count ?? 0);
    } else {
      console.error("Report count error:", error.message);
    }
  }

  loadReportCount();
}, []);
useEffect(() => {
  async function loadPrescriptionCount() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return;

    const { count, error } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id);
      console.log("Logged-in user ID:", user.id);
console.log("Prescription count:", count);
console.log("Prescription count error:", error);

    if (!error) {
      setPrescriptionCount(count ?? 0);
    } else {
      console.error("Prescription count error:", error.message);
    }
  }

  loadPrescriptionCount();
}, []);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Patient";

  const records = [
    {
      icon: "📄",
      title: "Medical Reports",
      description: "Keep your test reports organized.",
      color: "blue",
      status: "Open reports",
    },
    {
      icon: "💊",
      title: "Prescriptions",
      description: "Your medication information in one place.",
      color: "green",
      status: "Coming soon",
    },
    {
      icon: "❤️",
      title: "Health History",
      description: "Build a timeline of your health history.",
      color: "pink",
      status: "Coming soon",
    },
    {
      icon: "👤",
      title: "My Profile",
      description: "View your account information.",
      color: "purple",
      status: "Account details",
    },
    {
  icon: "👨‍⚕️",
  title: "Find a Doctor",
  description: "Explore doctors and book an appointment.",
  color: "blue",
  status: "Browse doctors",
},
{
  icon: "📅",
  title: "My Appointments",
  description: "View and manage your booked appointments.",
  color: "green",
  status: "View appointments",
},
  ];
  useEffect(() => {
    if (showProfile) {
        loadProfile();
    }
}, [showProfile, user?.id]);
if (selectedDoctor) {
  return (
    <AppointmentBooking
      doctor={selectedDoctor}
      user={user}
      onBack={() => setSelectedDoctor(null)}
    />
  );
}
if (showMyAppointments) {
  return (
    <MyAppointments
      user={user}
      onBack={() => setShowMyAppointments(false)}
    />
  );
}
if (showDoctors) {
  return (
    <Doctors
      onBack={() => setShowDoctors(false)}
      onBookAppointment={(doctor) => {
        setSelectedDoctor(doctor);
        setShowDoctors(false);
      }}
    />
  );
}

  if (showReports) {
    return (
      <MedicalRecords
        onBack={() => setShowReports(false)}
      />
    );
  }
  if (showPrescriptions) {
  return (
    <Prescriptions
      onBack={() => setShowPrescriptions(false)}
    />
  );
}
if (showHealthHistory) {
  return (
    <HealthHistory
      user={user}
      onBack={() => setShowHealthHistory(false)}
    />
  );
}


if (showProfile) {
  return (
    <div className="profile-page">
      <button
        className="profile-back-button"
        onClick={() => setShowProfile(false)}
      >
        ← Back to Dashboard
      </button>

      <div className="profile-card">
        <div className="profile-large-avatar">👤</div>

        <h1>My Profile</h1>

        <p className="profile-field-label">Full Name</p>
        <p className="profile-field-value">
          {user?.user_metadata?.full_name || "Not provided"}
        </p>

        <p className="profile-field-label">Email Address</p>
        <form className="profile-edit-form" onSubmit={saveProfile}>
  <label className="profile-field-label">
    Phone Number
    <input
      type="tel"
      value={profilePhone}
      onChange={(e) => setProfilePhone(e.target.value)}
      placeholder="Enter phone number"
      maxLength={20}
    />
  </label>

  <label className="profile-field-label">
    Date of Birth
    <input
      type="date"
      value={profileDob}
      onChange={(e) => setProfileDob(e.target.value)}
    />
  </label>

  <button
    type="submit"
    className="profile-save-button"
    disabled={profileLoading}
  >
    {profileLoading ? "Saving..." : "Save Profile"}
  </button>

  {profileMessage && (
    <p className="profile-save-message" role="status">
      {profileMessage}
    </p>
  )}
</form>
        <p className="profile-field-value">
          {user?.email || "Not available"}
        </p>

        <p className="profile-field-label">Account ID</p>
        <p className="profile-field-value profile-account-id">
          {user?.id || "Not available"}
        </p>

        <span className="profile-role-badge">Patient Account</span>
      </div>
    </div>
  );
}

  return (
    <div className="patient-dashboard">
      <header className="dashboard-navbar">
        <a href="#dashboard" className="dashboard-logo">
          <span>✚</span> HealthConnect
        </a>

        <button
          className="dashboard-logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-main" id="dashboard">
        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">
              PATIENT DASHBOARD
            </span>

            <h1>Welcome, {displayName}!</h1>

            <p>
              Your healthcare journey, organized in one place.
            </p>
          </div>

          <div className="dashboard-welcome-icon">✚</div>
        </section>

        <section className="dashboard-notice">
          <span>🔒</span>

          <div>
            <strong>Your health matters.</strong>
            <p>
              Your dashboard is ready. Medical records and
              prescriptions will be connected in upcoming steps.
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Your Health Space</h2>
              <div className="report-count-summary">
                <div className="prescription-count-summary">
  <span className="prescription-count-icon">💊</span>
  <div>
    <p>Total Prescriptions</p>
    <h3>{prescriptionCount}</h3>
  </div>
</div>
  <span className="report-count-icon">📄</span>
  <div>
    <p>Total Medical Reports</p>
    <h3>{reportCount}</h3>
  </div>
</div>
              <p>Access your healthcare tools below.</p>
            </div>
          </div>

          <div className="dashboard-grid">
            {records.map((record) => (
              <article
                className="dashboard-card"
                key={record.title}
              >
                <div
                  className={`dashboard-card-icon ${record.color}`}
                >
                  {record.icon}
                </div>

                <h3>{record.title}</h3>
                <p>{record.description}</p>

                {record.title === "Medical Reports" ? (
                  <button
                    className="dashboard-card-action"
                    type="button"
                    onClick={() => setShowReports(true)}
                  >
                    {record.status} →
                  </button>
                ) : record.title === "Prescriptions" ? (
                    <button
                      className="dashboard-card-action"
                      type="button"
                      onClick={() => setShowPrescriptions(true)}
                    >
                        Open prescriptions →
                        </button>
                    ) : record.title === "Health History" ? (
  <button
    className="dashboard-card-action"
    type="button"
    onClick={() => setShowHealthHistory(true)}
  >
    Open health history →
  </button>
  ) : record.title === "Find a Doctor" ? (
  <button
    className="dashboard-card-action"
    type="button"
    onClick={() => setShowDoctors(true)}
  >
    Browse doctors →
  </button>
  ) : record.title === "My Appointments" ? (
  <button
    className="dashboard-card-action"
    type="button"
    onClick={() => setShowMyAppointments(true)}
  >
    View appointments →
  </button>
) : record.title === "My Profile" ? (
  <button
    className="dashboard-card-action"
    type="button"
    onClick={() => setShowProfile(true)}
  >
    View profile →
  </button>
) : (
  <span className="dashboard-status">
    {record.status}
  </span>
)}
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-profile">
          <div className="profile-avatar">👤</div>

          <div className="profile-info">
            <span>YOUR ACCOUNT</span>
            <h2>{displayName}</h2>
            <p>{user?.email || "No email available"}</p>
          </div>

          <span className="profile-badge">Patient</span>
        </section>

        <p className="dashboard-disclaimer">
          Academic project demo. Medical reports currently contain
          sample data only.
        </p>
      </main>
    </div>
  );
}

export default PatientDashboard;