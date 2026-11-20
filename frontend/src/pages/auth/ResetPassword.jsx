
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import api from "../../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [visible, setVisible] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const toggleVisibility = (field) => {
    setVisible((previous) => ({
      ...previous,
      [field]: !previous[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(form.newPassword)) {
      setError(
        "Password must be 8–16 characters and contain an uppercase letter and a special character."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });

      setSuccess(response.data.message);

      setForm({
        newPassword: "",
        confirmPassword: ""
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to reset password. Please request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (field, label) => (
    <div className="recovery-field">
      <label htmlFor={field}>{label}</label>

      <div className="password-input-wrapper">
        <input
          id={field}
          name={field}
          type={visible[field] ? "text" : "password"}
          value={form[field]}
          onChange={handleChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          required
          minLength={8}
          maxLength={16}
          autoComplete="new-password"
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => toggleVisibility(field)}
          aria-label={visible[field] ? "Hide password" : "Show password"}
        >
          {visible[field] ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="recovery-page">
      <div className="recovery-card">
        <div className="recovery-brand">
          <LockKeyhole size={25} />
          <span>Roxilor Ratings</span>
        </div>

        <div className="recovery-icon">
          <CheckCircle size={29} />
        </div>

        <span className="recovery-eyebrow">
          ACCOUNT SECURITY
        </span>

        <h1>Reset Password</h1>

        <p className="recovery-description">
          Create a new password for your Roxilor Ratings account.
        </p>

        {!token ? (
          <div className="recovery-error">
            Invalid or missing reset token. Please request a
            new password reset link.
            <Link to="/forgot-password">
              Request another link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {renderPasswordField(
              "newPassword",
              "New Password"
            )}

            {renderPasswordField(
              "confirmPassword",
              "Confirm New Password"
            )}

            <div className="recovery-hint">
              Use 8–16 characters, at least one uppercase
              letter and one special character.
            </div>

            {error && (
              <div className="recovery-error">
                {error}
              </div>
            )}

            {success && (
              <div className="recovery-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="recovery-submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        <Link to="/login" className="recovery-back">
          <ArrowLeft size={17} />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
