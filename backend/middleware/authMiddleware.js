
const jwt = require("jsonwebtoken");
const { db: pool } = require("../config/db");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                success: false,
                message: "Authentication service is not configured."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
            !Number.isSafeInteger(decoded.id) ||
            decoded.id <= 0 ||
            !["admin", "user", "store_owner"].includes(decoded.role)
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        const [users] = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = ?",
            [decoded.id]
        );

        if (users.length === 0 || users[0].role !== decoded.role) {
            return res.status(401).json({
                success: false,
                message: "Your account is no longer valid. Please log in again."
            });
        }

        req.user = users[0];

        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        console.error("Authentication middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again."
        });
    }
};


const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource."
            });
        }

        next();
    };
};


module.exports = {
    protect,
    authorizeRoles
};
