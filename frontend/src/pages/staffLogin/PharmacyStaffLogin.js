import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/login.css";
import { showAlert } from "../../components/common/Alert";

export default function PharmacyStaffLogin() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        role: "ROLE_PHARMACY"
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const login = async () => {
        if (!form.username || !form.password) {
            showAlert("warning", "Please enter username and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await axios.post("/api/auth/login", form);
            
            localStorage.setItem("user", JSON.stringify(res.data));
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            showAlert("success", "Pharmacy login successful!");
            nav("/pharmacyStaff/account"); 

        } catch (e) {
            let msg = e.response?.data?.message || "Invalid Pharmacy Credentials";
            setError(msg);
            showAlert("error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container pharmacy-theme">
            <h2>Pharmacy Services Login</h2>
            {error && <p className="error-text">❌ {error}</p>}
            <input name="username" placeholder="Pharmacy Username" value={form.username} onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <button onClick={login} disabled={loading}>
                {loading ? "Verifying..." : "Login"}
            </button>
        </div>
    );
}