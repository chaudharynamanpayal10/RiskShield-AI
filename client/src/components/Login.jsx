import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save JWT token
      localStorage.setItem("token", token);

      // Save user information
      localStorage.setItem("user", JSON.stringify(user));

      // Tell App.jsx that login was successful
      onLogin(user);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>RiskShield AI</h1>

        <p className="auth-subtitle">
          Secure Transaction Risk Management
        </p>

        <h2>Login</h2>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={onSwitchToSignup}
          >
            Sign Up
          </button>
        </p>

      </div>
    </div>
  );
}

export default Login;