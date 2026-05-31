import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/login.css";
import { showAlert } from "../../components/common/Alert";

export default function AppointmentStaffLogin() {

    const [form, setForm] = useState({
        username: "",
        password: "",
        role: "ROLE_APPOINTMENT"
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const login = async () => {

        if (!form.username.trim() || !form.password.trim()) {
            showAlert("warning", "Please enter username and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await axios.post(
                "/api/auth/login",
                form
            );

            // Save user data
            localStorage.setItem("user", JSON.stringify(res.data));
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            showAlert("success", "Appointment Desk login successful!");

            // ✅ Redirect to common account page
            navigate("/appointmentStaff/account");

        } catch (e) {
            const msg =
                e.response?.data?.message ||
                "Invalid Appointment Credentials";

            setError(msg);
            showAlert("error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container appointment-theme">
            <h2>Appointment Desk Login</h2>

            {error && <p className="error-text">❌ {error}</p>}

            <input
                name="username"
                placeholder="Desk Username"
                value={form.username}
                onChange={handleChange}
            />

            <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
            />

            <button onClick={login} disabled={loading}>
                {loading ? "Verifying..." : "Login"}
            </button>
        </div>
    );
}