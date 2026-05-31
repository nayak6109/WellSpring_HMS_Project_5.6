import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/login.css";
import { showAlert } from "../../components/common/Alert";

export default function BillingStaffLogin() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        role: "ROLE_BILLING"
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
            showAlert("warning", "Please fill all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await axios.post("/api/auth/login", form);
            
            localStorage.setItem("user", JSON.stringify(res.data));
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            showAlert("success", "Billing Department login successful!");
            nav("/billingStaff/account");

        } catch (e) {
            let msg = e.response?.data?.message || "Invalid Billing Credentials";
            setError(msg);
            showAlert("error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container billing-theme">
            <h2>Billing Department Login</h2>
            {error && <p className="error-text">❌ {error}</p>}
            <input name="username" placeholder="Billing Username" value={form.username} onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <button onClick={login} disabled={loading}>
                {loading ? "Verifying..." : "Login"}
            </button>
        </div>
    );
}