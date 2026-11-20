
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(form.newPassword)) {
      setError(
        "Password must be 8–16 characters and include an uppercase letter and a special character."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/auth/change-password", form);

      setSuccess(
        response.data.message || "Password changed successfully."
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setVisible({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const homePath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "store_owner"
        ? "/owner"
        : "/user";

  const renderPasswordField = (field, label) => (
    <div className="change-password-field">
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
    <div className="change-password-page">
      <div className="change-password-card">
        <div className="change-password-icon">
          <LockKeyhole size={30} />
        </div>

        <span className="change-password-eyebrow">
          ACCOUNT SECURITY
        </span>

        <h1>Change Password</h1>

        <p className="change-password-description">
          Update your password regularly to keep your account secure.
        </p>

        <form onSubmit={handleSubmit}>
          {renderPasswordField(
            "currentPassword",
            "Current Password"
          )}

          {renderPasswordField(
            "newPassword",
            "New Password"
          )}

          {renderPasswordField(
            "confirmPassword",
            "Confirm New Password"
          )}

          <div className="change-password-hint">
            <ShieldCheck size={17} />
            <span>
              8–16 characters, at least one uppercase letter
              and one special character.
            </span>
          </div>

          {error && (
            <div className="change-password-error">
              {error}
            </div>
          )}

          {success && (
            <div className="change-password-success">
              {success}
            </div>
          )}

          <button
            className="change-password-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <button
          type="button"
          className="change-password-back"
          onClick={() => navigate(homePath)}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
