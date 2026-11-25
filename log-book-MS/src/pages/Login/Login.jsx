import { Link, useNavigate } from "react-router";
import "../Auth.css";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useAppContext } from "../../app/useAppContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [school, setSchool] = useState("");
  const { login, loginLoading, token, user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate(user?.role === "supervisor" ? "/admin" : "/dashboard");
    }
  }, [navigate, token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const credentials = {
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      department: String(formData.get("department") || "").trim(),
      school: String(formData.get("school") || "").trim(),
    };
    const fieldLabels = {
      email: "email",
      password: "password",
      department: "department",
      school: "school",
    };
    const missingFields = Object.entries(credentials)
      .filter(([, value]) => !value)
      .map(([field]) => fieldLabels[field]);

    if (missingFields.length > 0) {
      return toast.error(`Please fill in: ${missingFields.join(", ")}`);
    }

    try {
      const loggedInUser = await login(credentials);
      toast.success(
        "Login successful, you will be redirected to the dashboard shortly"
      );
      setEmail("");
      setPassword("");
      setDepartment("");
      setSchool("");
      setTimeout(() => {
        navigate(loggedInUser.role === "supervisor" ? "/admin" : "/dashboard");
      }, 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={department}
              required
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="" defaultValue={true}>
                ---Select a department---
              </option>
              <option value="infrastructure">Infrastructure</option>
              <option value="knoc">Knoc</option>
              <option value="support">Support</option>
              <option value="cybersecurity">Cybersecurity</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="school">School</label>
            <select
              id="school"
              name="school"
              value={school}
              required
              onChange={(e) => setSchool(e.target.value)}
            >
              <option value="" defaultValue={true}>
                --Select a School--
              </option>
              <option value="kca">KCA</option>
              <option value="daystar">Daystar</option>
              <option value="usiu">USIU</option>
              <option value="zetech">Zetech</option>
            </select>
          </div>
          <button type="submit" className="auth-button" disabled={loginLoading}>
            {loginLoading ? "Logging in..." : "Login"}
          </button>
          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/sign-up">SignUp</Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
