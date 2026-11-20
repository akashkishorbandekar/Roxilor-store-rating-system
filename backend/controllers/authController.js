
require("dotenv").config();

const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { db } = require("../config/db");

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerUser = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof address !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !address.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required and must be valid text"
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const cleanAddress = address.trim();

    if (cleanName.length < 20 || cleanName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 20 and 60 characters"
      });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    if (cleanAddress.length > 400) {
      return res.status(400).json({
        success: false,
        message: "Address cannot exceed 400 characters"
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8–16 characters and include at least one uppercase letter and one special character"
      });
    }

    const [existingUser] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [cleanName, normalizedEmail, hashedPassword, cleanAddress, "user"]
    );

    const token = jwt.sign(
      {
        id: result.insertId,
        email: normalizedEmail,
        role: "user"
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: result.insertId,
        name: cleanName,
        email: normalizedEmail,
        role: "user"
      }
    });
  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, name, email, address, role, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: users[0]
    });
  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match"
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8–16 characters and include an uppercase letter and special character"
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password"
      });
    }

    const [users] = await db.execute(
      "SELECT id, password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password"
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASS;
    const senderEmail = process.env.EMAIL_FROM;
    const frontendUrl = process.env.FRONTEND_URL;

    console.log("BREVO SMTP CONFIGURATION CHECK");
    console.log("SMTP Host:", smtpHost || "NOT CONFIGURED");
    console.log("SMTP Port:", smtpPort);
    console.log("SMTP Login:", smtpUser || "NOT CONFIGURED");
    console.log("SMTP Password Length:", (smtpPassword || "").length);
    console.log("Sender Email:", senderEmail || "NOT CONFIGURED");
    console.log("Frontend URL:", frontendUrl || "NOT CONFIGURED");

    if (
      !smtpHost ||
      !smtpUser ||
      !smtpPassword ||
      !senderEmail ||
      !frontendUrl
    ) {
      return res.status(500).json({
        success: false,
        message: "Email configuration is incomplete"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await db.execute(
      "SELECT id, email FROM users WHERE email = ?",
      [normalizedEmail]
    );

    const genericMessage =
      "If an account exists with this email, a password reset link has been sent.";

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: genericMessage
      });
    }

    const user = users[0];

    const resetToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetUrl =
    `${frontendUrl.replace(/\/+$/, "")}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    await transporter.verify();

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        "DELETE FROM password_reset_tokens WHERE user_id = ?",
        [user.id]
      );

      await connection.execute(
        `INSERT INTO password_reset_tokens
         (user_id, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
        [user.id, tokenHash]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    try {
      await transporter.sendMail({
        from: senderEmail,
        to: user.email,
        subject: "Reset Your Roxilor Ratings Password",
        text: `You requested a password reset. Open this link within 15 minutes: ${resetUrl}. If you did not request this, ignore this email.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:30px;color:#1c2940">
            <h2 style="color:#285fa9">Roxilor Ratings</h2>
            <h3>Password Reset Request</h3>
            <p>We received a request to reset your password.</p>
            <p>Click below to choose a new password. This link expires in 15 minutes.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#285fa9;color:white;padding:13px 22px;border-radius:7px;text-decoration:none;font-weight:bold">
              Reset Password
            </a>
            <p style="margin-top:25px;font-size:13px;color:#68778d">
              If you did not request this reset, ignore this email.
            </p>
          </div>
        `
      });
    } catch (error) {
      await db.execute(
        "DELETE FROM password_reset_tokens WHERE user_id = ?",
        [user.id]
      );

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: genericMessage
    });
  } catch (error) {
    console.error("Password Reset Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send password reset email. Please check your email configuration and try again."
    });
  }
};

const resetPassword = async (req, res) => {
  let connection;

  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (
      typeof token !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !token ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8–16 characters and include an uppercase letter and special character"
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    connection = await db.getConnection();

    await connection.beginTransaction();

    const [records] = await connection.execute(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = ?
       AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    );

    if (records.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Please request a new one."
      });
    }

    const record = records[0];

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await connection.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, record.user_id]
    );

    await connection.execute(
      "DELETE FROM password_reset_tokens WHERE user_id = ?",
      [record.user_id]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in."
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Password Reset Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again."
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
};
