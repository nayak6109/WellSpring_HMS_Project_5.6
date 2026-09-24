import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./wellspringhome.css";
import { getAvailableDoctors } from "../../services/doctorService";
import { showAlert } from "../common/Alert.js";

export default function WellSpringHome() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState(null);

  // Load hospital location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem("myLocation");
    if (savedLocation) {
      setHospitalLocation(JSON.parse(savedLocation));
    }
  }, []);

  // Function to get user's GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert("error", "Geolocation not supported ❌");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => showAlert("error", "Location access denied ❌")
    );
  };

  // Fetch doctors with Silent Retry (handles Render server cold start)
  useEffect(() => {
    let isMounted = true;

    const fetchDoctorsWithRetry = async (retries = 3, delay = 3000) => {
      try {
        const res = await getAvailableDoctors();
        if (isMounted) {
          setDoctors(res.data.slice(0, 3));
          setLoadingDoctors(false);
        }
      } catch (err) {
        console.error(`Error fetching doctors (Attempts left: ${retries})`, err);
        if (retries > 0) {
          setTimeout(() => {
            fetchDoctorsWithRetry(retries - 1, delay);
          }, delay);
        } else {
          if (isMounted) {
            setLoadingDoctors(false);
            showAlert("error", "Unable to load doctors. Please try again later.");
          }
        }
      }
    };

    fetchDoctorsWithRetry();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBook = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const normalizedRole = role
      ? role.startsWith("ROLE_")
        ? role
        : "ROLE_" + role
      : null;

    if (!token) {
      showAlert("info", "🔐 Please login to book an appointment");
      navigate("/login");
      return;
    }

    if (normalizedRole === "ROLE_DOCTOR") {
      showAlert("warning", "Doctors cannot book appointments");
      return;
    }

    if (normalizedRole === "ROLE_ADMIN") {
      navigate("/admin/account");
      return;
    }

    if (normalizedRole === "ROLE_PATIENT") {
      navigate("/online_book_appointment");
    }
  };

  return (
    <div className="wellspring-hero" role="banner">
      {/* BACKGROUND & OVERLAY */}
      <div className="wellspring-bg" aria-hidden="true"></div>
      <div className="wellspring-overlay" aria-hidden="true"></div>

      <div className="container">
        {/* MAIN HERO CARD */}
        <div className="hero-card">
          <div className="brand">
            <div className="logo-bubble">WS</div>
            <div>
              <h1>WellSpring Hospital</h1>
              <p>Trusted care • 24/7 Emergency • Multispeciality</p>
            </div>
          </div>

          <div className="headline">
            Where every visit brings you closer to full health.
          </div>

          <div className="sub">
            World-class specialists, compassionate nursing and a calm environment — everything aligned to make recovery fast and comfortable.
          </div>

          <div className="cta-row">
            <button className="btn-cta" onClick={handleBook}>
              Book Appointment
            </button>
            <button
              className="btn-transparent"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </button>
          </div>

          <div className="quick-info">
            <div className="info-pill">
              <div style={{ fontWeight: 800 }}>24/7</div>
              <div>Emergency Care</div>
            </div>
            <div className="info-pill">
              <div style={{ fontWeight: 800 }}>200+</div>
              <div>Doctors & Staff</div>
            </div>
            <div className="info-pill">
              <div style={{ fontWeight: 800 }}>₹ -</div>
              <div>Insurance Friendly</div>
            </div>
          </div>

          <div className="features">
            <div className="feature">
              <h5>Advanced ICU & Critical Care</h5>
              <p>Real-time monitoring and expert intensivists ensure better outcomes.</p>
            </div>
            <div className="feature">
              <h5>Minimally Invasive Surgery</h5>
              <p>Faster recovery and shorter hospital stays using latest techniques.</p>
            </div>
            <div className="feature">
              <h5>Compassionate Nursing</h5>
              <p>Patient-first approach with dedicated care coordinators.</p>
            </div>
          </div>

          <div className="testimonials">
            <div className="test">
              <strong>"Fast, friendly and professional — my father recovered quickly."</strong>
              <p style={{ marginTop: 8, color: "rgba(0,0,0,0.7)" }}>— Meera K.</p>
            </div>
            <div className="test">
              <strong>"State-of-the-art facilities and calm atmosphere. Highly recommended."</strong>
              <p style={{ marginTop: 8, color: "rgba(0,0,0,0.7)" }}>— Arjun S.</p>
            </div>
          </div>

          <div className="footer-cta">
            <button
              className="btn-cta"
              style={{ marginTop: 18 }}
              onClick={() => showAlert("info", "Call us: +91 00000 00000")}
            >
              Call: +91 00000 00000
            </button>

            {/* ===== Directions Button ===== */}
            {hospitalLocation ? (
              currentLocation ? (
                <button
                  className="btn-transparent"
                  style={{ marginTop: 18 }}
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${hospitalLocation.lat},${hospitalLocation.lng}`,
                      "_blank"
                    )
                  }
                >
                  🚗 Get Directions
                </button>
              ) : (
                <button
                  className="btn-transparent"
                  style={{ marginTop: 18 }}
                  onClick={getCurrentLocation}
                >
                  📡 Get My Location First
                </button>
              )
            ) : (
              <button
                className="btn-transparent"
                style={{ marginTop: 18 }}
                onClick={() => showAlert("info", "Hospital location not set yet")}
              >
                🏥 Hospital location not set
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR DOCTOR LIST */}
        <aside className="side-card" aria-labelledby="doctors-heading">
          <h3 id="doctors-heading">Available Now</h3>
          <div className="doctor-list">
            {loadingDoctors ? (
              <p style={{ padding: "10px", color: "rgba(0,0,0,0.6)" }}>Loading available doctors...</p>
            ) : doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="doctor"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                >
                  <div className="doc-avatar">
                    {doctor.name ? doctor.name.split(" ").map((n) => n[0]).join("") : "DOC"}
                  </div>
                  <div className="doc-meta">
                    <h4>{doctor.name}</h4>
                    <p>{doctor.specialization} • {doctor.experience} yrs</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: "10px", color: "rgba(0,0,0,0.6)" }}>No doctors available right now.</p>
            )}

            <div className="doctor see-all" onClick={() => navigate("/doctors")}>
              <button className="btn-transparent">See all doctors</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}