import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";
import logo from "../../public/assets/GSDC1.png";
import { GSDC_AccountsService } from "../generated/services/GSDC_AccountsService";
import type { GSDC_AccountsRead } from "../generated/models/GSDC_AccountsModel";

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    try {
      // Get all accounts from SharePoint
      const response = await GSDC_AccountsService.getAll({ top: 10000});
      const accounts: GSDC_AccountsRead[] = response.data;

      // Find matching user (case-insensitive username)
      const user = accounts.find(
        (u: GSDC_AccountsRead) =>
          u.UserName?.toLowerCase() === username.toLowerCase() &&
          u.PassWord === password
      );

      if (!user) {
        setError("Invalid username or password.");
        return;
      }

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to dashboard
      navigate("/dashboard1");
    } catch (err) {
      console.error(err);
      setError("An error occurred while logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
           <img src={logo} alt="logo"
            style={{
              width: "150px",
              height: "150px",
              display: "block"
            }}
          />
          <h2>Welcome</h2>
          <p>Source & Destination App</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error">{error}</p>}

          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">&copy; 2026 IT-DEV App</div>
      </div>
    </div>
  );
}

export default Login;