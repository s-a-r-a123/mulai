import React, { useState } from "react";
import "./Login.css"; // scoped login styles only

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [dark, setDark] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!/^[^ ]+@[^ ]+\.[a-z]{2,}$/i.test(email)) {
      newErrors.email = "Enter a valid email (e.g. user@example.com)";
    }
    if (password.length < 8) {
      newErrors.password = "Password should be at least 8 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // fake login success
      setTimeout(() => {
        onLogin();
      }, 1000);
    }
  };

  return (
    <div className={`login-page ${dark ? "dark" : ""}`}>
      {/* 🌙 Dark Mode Toggle */}
      <label className="switch">
        <input
          type="checkbox"
          checked={dark}
          onChange={() => setDark(!dark)}
        />
        <span className="slider"></span>
      </label>

      {/* 🧾 Login Card */}
      <div className="login-wrapper">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Sign In</h2>

          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
            />
            <label>Email Address</label>
            {errors.email && <small className="error">{errors.email}</small>}
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label>Password</label>
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
              title="Show/Hide Password"
            >
              👁
            </span>
            {errors.password && (
              <small className="error">{errors.password}</small>
            )}
          </div>

          <button type="submit">Login</button>

          <div className="forgot-link">
            <a href="#">Forgot password?</a>
          </div>
        </form>
      </div>

      {/* 🎉 Success Toast */}
      {showToast && <div className="toast show">Login successful!</div>}
    </div>
  );
}

export default Login;
