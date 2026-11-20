
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send, Store } from "lucide-react";
import api from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email
      });

      setSuccess(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-page">
      <div className="recovery-card">
        <div className="recovery-brand">
          <Store size={25} />
          <span>Roxilor Ratings</span>
        </div>

        <div className="recovery-icon">
          <Mail size={29} />
        </div>

        <span className="recovery-eyebrow">
          ACCOUNT RECOVERY
        </span>

        <h1>Forgot Password?</h1>

        <p className="recovery-description">
          Enter your registered email address. If an account
          exists, we'll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="recovery-email">
            Email address
          </label>

          <input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            required
          />

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
            {loading ? "Sending..." : "Send Reset Link"}
            <Send size={17} />
          </button>
        </form>

        <Link to="/login" className="recovery-back">
          <ArrowLeft size={17} />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
