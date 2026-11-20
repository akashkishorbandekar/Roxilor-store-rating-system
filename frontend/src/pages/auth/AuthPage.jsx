
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Store,
  Star,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Quote,
  Users,
  Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (form.name.trim().length < 20 || form.name.trim().length > 60) {
          throw new Error("Name must be between 20 and 60 characters.");
        }

        if (form.address.trim().length > 400) {
          throw new Error("Address cannot exceed 400 characters.");
        }

        const passwordRegex =
          /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(form.password)) {
          throw new Error(
            "Password must be 8–16 characters and include an uppercase letter and a special character."
          );
        }

        await register(form);

        setIsRegister(false);
        setShowPassword(false);
        setSelectedRole("user");

        setForm({
          name: "",
          email: form.email,
          password: "",
          address: ""
        });

        setError("Account created successfully. Please sign in.");
      } else {
        const user = await login(form.email, form.password);

        if (user.role !== selectedRole) {
          logout();

          const roleNames = {
            user: "Customer",
            store_owner: "Store Owner",
            admin: "Admin"
          };

          throw new Error(
            `Your account is registered as ${roleNames[user.role] || user.role}. Please select the correct account type.`
          );
        }

        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "store_owner") {
          navigate("/owner");
        } else if (user.role === "user") {
          navigate("/user");
        } else {
          logout();
          throw new Error("Invalid account role.");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsRegister(!isRegister);
    setShowPassword(false);
    setError("");
    setSelectedRole("user");
  };

  const roles = [
    { value: "user", label: "Customer" },
    { value: "store_owner", label: "Store Owner" },
    { value: "admin", label: "Admin" }
  ];

  return (
    <div className="rox-auth-page">
      <header className="rox-auth-header">
        <Link to="/login" className="rox-auth-brand">
          <span className="rox-auth-brand-mark">
            <Store size={21} strokeWidth={2.2} />
          </span>
          <span className="rox-auth-brand-name">
            roxilor<span>ratings</span>
          </span>
        </Link>

        <div className="rox-auth-header-note">
          <span className="rox-auth-live-dot" />
          A platform built on real experiences
        </div>
      </header>

      <main className="rox-auth-main">
        <section className="rox-auth-story">
          <div className="rox-auth-story-top">
            <span className="rox-auth-kicker">
              <Sparkles size={14} />
              THE POWER OF CUSTOMER VOICE
            </span>

            <div className="rox-auth-edition">
              EXPERIENCE / 001
            </div>
          </div>

          <h1>
            Good experiences
            <br />
            deserve <em>recognition.</em>
          </h1>

          <p className="rox-auth-story-copy">
            A place where honest feedback meets better experiences.
            Discover trusted stores, share your voice and help
            businesses grow.
          </p>

          <div className="rox-auth-rating-art">
            <div className="rox-auth-rating-orbit rox-auth-orbit-one" />
            <div className="rox-auth-rating-orbit rox-auth-orbit-two" />

            <div className="rox-auth-rating-center">
              <span>THE COMMUNITY SCORE</span>
              <strong>4.9</strong>
              <div className="rox-auth-art-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} fill="currentColor" />
                ))}
              </div>
            </div>

            <div className="rox-auth-floating-card rox-auth-floating-top">
              <span className="rox-auth-floating-icon">
                <ShieldCheck size={17} />
              </span>
              <span>
                <strong>Genuine voices</strong>
                <small>Trusted feedback</small>
              </span>
              <Check size={16} className="rox-auth-check" />
            </div>

            <div className="rox-auth-floating-card rox-auth-floating-bottom">
              <span className="rox-auth-floating-icon rox-auth-users-icon">
                <Users size={17} />
              </span>
              <span>
                <strong>One community</strong>
                <small>Three account types</small>
              </span>
            </div>
          </div>

          <div className="rox-auth-quote">
            <Quote size={19} />
            <p>
              Every rating is an opportunity to make the next
              experience better.
            </p>
          </div>

          <div className="rox-auth-story-footer">
            <span>DISCOVER. RATE. SHARE.</span>
            <span>ROXILOR RATINGS © 2026</span>
          </div>
        </section>

        <section className="rox-auth-form-side">
          <div className="rox-auth-form-card">
            <div className="rox-auth-form-topline">
              <span>{isRegister ? "NEW MEMBERSHIP" : "MEMBER ACCESS"}</span>
              <span className="rox-auth-form-index">
                0{isRegister ? "2" : "1"} / 02
              </span>
            </div>

            <div className="rox-auth-heading">
              <span className="rox-auth-heading-label">
                {isRegister ? "YOUR JOURNEY STARTS HERE" : "WELCOME BACK"}
              </span>

              <h2>
                {isRegister ? (
                  <>Become part of <em>the story.</em></>
                ) : (
                  <>Good to see <em>you again.</em></>
                )}
              </h2>

              <p>
                {isRegister
                  ? "Create an account and make your experiences count."
                  : "Sign in to continue to your Roxilor workspace."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rox-auth-form">
              {isRegister && (
                <>
                  <div className="rox-auth-field">
                    <label htmlFor="name">FULL NAME</label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      minLength={20}
                      maxLength={60}
                      disabled={loading}
                    />
                    <small>Use between 20 and 60 characters.</small>
                  </div>

                  <div className="rox-auth-field">
                    <label htmlFor="address">ADDRESS</label>
                    <textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      required
                      maxLength={400}
                      rows={2}
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {!isRegister && (
                <div className="rox-auth-field">
                  <label>CONTINUE AS</label>

                  <div className="rox-auth-role-options">
                    {roles.map((role) => (
                      <button
                        type="button"
                        key={role.value}
                        className={
                          selectedRole === role.value
                            ? "rox-auth-role active"
                            : "rox-auth-role"
                        }
                        onClick={() => {
                          setSelectedRole(role.value);
                          setError("");
                        }}
                        disabled={loading}
                      >
                        {role.label}
                        {selectedRole === role.value && (
                          <Check size={14} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rox-auth-field">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="rox-auth-field">
                <div className="rox-auth-password-label">
                  <label htmlFor="password">PASSWORD</label>
                  {!isRegister && (
                    <Link to="/forgot-password">
                      Forgot password?
                    </Link>
                  )}
                </div>

                <div className="rox-auth-password">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    minLength={8}
                    maxLength={16}
                    disabled={loading}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {isRegister && (
                  <small>
                    8–16 characters, with an uppercase letter and
                    a special character.
                  </small>
                )}
              </div>

              {error && (
                <div
                  className={
                    error.toLowerCase().includes("successfully")
                      ? "rox-auth-message success"
                      : "rox-auth-message"
                  }
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                className="rox-auth-submit"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Please wait..."
                    : isRegister
                      ? "Create my account"
                      : "Enter my workspace"}
                </span>
                <span className="rox-auth-submit-icon">
                  <ArrowRight size={19} />
                </span>
              </button>
            </form>

            <div className="rox-auth-switch">
              <span>
                {isRegister
                  ? "Already part of Roxilor?"
                  : "New to Roxilor Ratings?"}
              </span>

              <button type="button" onClick={toggleForm}>
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </div>

            <div className="rox-auth-security">
              <ShieldCheck size={16} />
              <span>Your account and information are protected.</span>
            </div>
          </div>

          <div className="rox-auth-bottom-note">
            <span>BUILT FOR BETTER EXPERIENCES</span>
            <span>MADE FOR EVERY VOICE.</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AuthPage;
