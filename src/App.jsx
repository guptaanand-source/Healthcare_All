
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import PatientDashboard from "./PatientDashboard";
import MedicalRecords from "./MedicalRecords";
import "./App.css";

function App() {
  const [mode, setMode] = useState("home");
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleRegister(e) {
  e.preventDefault();
  setMessage("");
  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    });

    if (error) throw error;

    // Save profile only when a session exists
    if (data.session && data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: data.user.id,
            full_name: name,
            role: "patient",
          },
          { onConflict: "id" }
        );

      if (profileError) throw profileError;

      setMessage("Account and patient profile created successfully!");
    } else {
      setMessage(
        "Registration submitted! Please confirm your email, then log in."
      );
    }
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
}

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage("Login successful!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }
  async function handleGoogleLogin() {
  setMessage("");
  setLoading(true);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    setMessage(error.message);
    setLoading(false);
  }
}

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("You have logged out.");
    setMode("home");
  }

  function openAuth(nextMode) {
    setMessage("");
    setMode(nextMode);
  }

  const userRole = user?.user_metadata?.role;
  const displayName =
    user?.user_metadata?.full_name || user?.email || "User";

  return (
    <div className="app">
      <nav className="navbar">
        <a
          href="#home"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            setMode("home");
            setMessage("");
          }}
        >
          <span className="logo-icon">✚</span>
          HealthConnect
        </a>

        <div className="nav-links">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setMode("home");
            }}
          >
            Home
          </a>

          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              setMode("home");
              setTimeout(() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 0);
            }}
          >
            Features
          </a>

          {user ? (
            <button className="nav-login" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button
              className="nav-login"
              onClick={() => openAuth("login")}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {user ? (
        <PatientDashboard user={user} onLogout={handleLogout} />
      ) : mode === "login" || mode === "register" ? (
        <main className="auth-section">
          <div className="auth-info">
            <span className="eyebrow">WELCOME TO HEALTHCONNECT</span>
            <h1>Your healthcare journey, connected.</h1>
            <p>
              A simple platform designed to help patients organize
              medical information and support continuity of care.
            </p>

            <div className="auth-benefit">
              <span>✓</span> Organized health information
            </div>
            <div className="auth-benefit">
              <span>✓</span> Patient-focused experience
            </div>
            <div className="auth-benefit">
              <span>✓</span> Privacy-conscious design
            </div>
          </div>

          <div className="auth-card">
            <button
              className="back-button"
              onClick={() => {
                setMode("home");
                setMessage("");
              }}
            >
              ← Back to Home
            </button>

            <h2>
              {mode === "register" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="auth-subtitle">
              {mode === "register"
                ? "Join HealthConnect in a few simple steps."
                : "Log in to your HealthConnect account."}
            </p>

            <div className="auth-switch">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => openAuth("login")}
              >
                Login
              </button>
              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => openAuth("register")}
              >
                Register
              </button>
            </div>

            <form
              onSubmit={mode === "register" ? handleRegister : handleLogin}
            >
              {mode === "register" && (
                <>
                  <label htmlFor="full-name">Full name</label>
                  <input
                    id="full-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />

                  <label>Register as</label>
                  <div className="role-options">
                    <button
                      type="button"
                      className={role === "patient" ? "selected" : ""}
                      onClick={() => setRole("patient")}
                    >
                      <span>♡</span>
                      Patient
                    </button>

                    <button
                      type="button"
                      className={role === "doctor" ? "selected" : ""}
                      onClick={() => setRole("doctor")}
                    >
                      <span>⚕</span>
                      Doctor
                    </button>
                  </div>
                </>
              )}

              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password (minimum 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                minLength={6}
                required
              />

              <button
                type="submit"
                className="btn-primary full-button"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : mode === "register"
                    ? "Create Account →"
                    : "Login →"}
              </button>
            </form>
            <button
  type="button"
  className="btn-secondary full-button"
  onClick={handleGoogleLogin}
  disabled={loading}
  style={{ marginTop: "12px", width: "100%" }}
>
  {loading ? "Please wait..." : "🌐 Continue with Google"}
</button>

            {message && (
              <div className="auth-message" role="status">
                {message}
              </div>
            )}

            <p className="privacy-caption">
              Never share your password with anyone.
            </p>
          </div>
        </main>
      ) : (
        <main>
          <section className="hero" id="home">
            <div className="hero-content">
              <span className="eyebrow">
                YOUR HEALTH, ONE CONNECTED PLACE
              </span>
              <h1>
                Your Health Records,
                <span> Always Connected.</span>
              </h1>
              <p>
                Keep your medical history organized in one place.
                Connect your healthcare journey with a simple,
                patient-focused digital experience.
              </p>

              <div className="hero-buttons">
                <button
                  className="btn-primary"
                  onClick={() => openAuth("register")}
                >
                  Get Started →
                </button>
                <a href="#features" className="btn-secondary">
                  Explore Features
                </a>
              </div>

              <div className="trust-line">
                <span>✓ Organized records</span>
                <span>✓ Patient-focused</span>
                <span>✓ Privacy-conscious design</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="medical-card">
                <div className="card-top">
                  <div className="medical-icon">✚</div>
                  <div>
                    <strong>HealthConnect</strong>
                    <p>Your health overview</p>
                  </div>
                  <span className="status-dot"></span>
                </div>

                <div className="welcome-box">
                  <span className="welcome-icon">♡</span>
                  <div>
                    <strong>Your health matters.</strong>
                    <p>Your records, organized in one place.</p>
                  </div>
                </div>

                <h3>My Health Records</h3>

                <div className="record-row">
                  <span className="record-icon blue">▤</span>
                  <div>
                    <strong>Medical Reports</strong>
                    <p>Reports and test results</p>
                  </div>
                  <span className="record-arrow">→</span>
                </div>

                <div className="record-row">
                  <span className="record-icon green">＋</span>
                  <div>
                    <strong>Prescriptions</strong>
                    <p>Medication history</p>
                  </div>
                  <span className="record-arrow">→</span>
                </div>

                <div className="record-row">
                  <span className="record-icon purple">♡</span>
                  <div>
                    <strong>Health History</strong>
                    <p>Visits and diagnoses</p>
                  </div>
                  <span className="record-arrow">→</span>
                </div>

                <div className="privacy-note">
                  🔒 Your health information deserves privacy.
                </div>
              </div>
              <div className="floating-badge">✚ Healthcare, connected</div>
            </div>
          </section>

          <section className="features-section" id="features">
            <div className="section-heading">
              <span className="eyebrow">WHAT WE OFFER</span>
              <h2>Healthcare made simpler.</h2>
              <p>One platform to help manage your healthcare journey.</p>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon blue">▤</div>
                <h3>Medical Records</h3>
                <p>Keep reports, prescriptions and medical history organized.</p>
              </article>

              <article className="feature-card">
                <div className="feature-icon green">♧</div>
                <h3>Patient Dashboard</h3>
                <p>Access your health information through one simple dashboard.</p>
              </article>

              <article className="feature-card">
                <div className="feature-icon purple">⚕</div>
                <h3>Doctor Access</h3>
                <p>Support authorized healthcare professionals in reviewing records.</p>
              </article>

              <article className="feature-card">
                <div className="feature-icon orange">🔒</div>
                <h3>Privacy First</h3>
                <p>Build around permission-based sharing and protected health data.</p>
              </article>
            </div>
          </section>

          <section className="about-section" id="about">
            <div className="about-symbol">✚</div>
            <div>
              <span className="eyebrow">OUR MISSION</span>
              <h2>Better continuity of care starts with connected records.</h2>
              <p>
                HealthConnect aims to help patients organize medical
                information and share it with authorized healthcare providers.
              </p>
            </div>
          </section>

          <section className="cta-section">
            <h2>Take a step towards organized healthcare.</h2>
            <p>Your healthcare journey deserves a connected experience.</p>
            <button
              className="btn-white"
              onClick={() => openAuth("register")}
            >
              Create Your Account →
            </button>
          </section>
        </main>
      )}

      <footer id="contact">
        <a
          href="#home"
          className="logo footer-logo"
          onClick={(e) => {
            e.preventDefault();
            setMode("home");
          }}
        >
          <span className="logo-icon">✚</span>
          HealthConnect
        </a>
        <p>Connecting healthcare journeys, one record at a time.</p>
        <span>© 2026 HealthConnect · Academic Project Demo</span>
      </footer>
    </div>
  );
}

export default App;