
const bcrypt = require("bcryptjs");
const { db: pool } = require("../config/db");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const allowedRoles = ["admin", "user", "store_owner"];

const getDashboardStats = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    const [stores] = await pool.query(
      "SELECT COUNT(*) AS totalStores FROM stores"
    );

    const [ratings] = await pool.query(
      "SELECT COUNT(*) AS totalRatings FROM ratings"
    );

    const [admins] = await pool.query(
      "SELECT COUNT(*) AS totalAdmins FROM users WHERE role = 'admin'"
    );

    const [normalUsers] = await pool.query(
      "SELECT COUNT(*) AS totalNormalUsers FROM users WHERE role = 'user'"
    );

    const [owners] = await pool.query(
      "SELECT COUNT(*) AS totalStoreOwners FROM users WHERE role = 'store_owner'"
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      statistics: {
        totalUsers: users[0].totalUsers,
        totalStores: stores[0].totalStores,
        totalRatings: ratings[0].totalRatings,
        totalAdmins: admins[0].totalAdmins,
        totalNormalUsers: normalUsers[0].totalNormalUsers,
        totalStoreOwners: owners[0].totalStoreOwners
      }
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics"
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = "name",
      order = "ASC"
    } = req.query;

    const allowedSortFields = {
      name: "u.name",
      email: "u.email",
      address: "u.address",
      role: "u.role",
      created_at: "u.created_at",
      average_rating: "owner_stats.average_rating",
      total_ratings: "owner_stats.total_ratings"
    };

    const sortField =
      typeof sortBy === "string" && allowedSortFields[sortBy]
        ? allowedSortFields[sortBy]
        : "u.name";

    const sortOrder =
      typeof order === "string" && order.toUpperCase() === "DESC"
        ? "DESC"
        : "ASC";

    const filters = { name, email, address };

    for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined && typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field} filter`
        });
      }
    }

    if (role !== undefined && typeof role !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid role filter"
      });
    }

    let sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        COALESCE(owner_stats.store_count, 0) AS store_count,
        COALESCE(owner_stats.store_names, '') AS store_names,
        COALESCE(owner_stats.average_rating, 0) AS average_rating,
        COALESCE(owner_stats.total_ratings, 0) AS total_ratings
      FROM users u
      LEFT JOIN (
        SELECT
          s.owner_id,
          COUNT(DISTINCT s.id) AS store_count,
          GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS store_names,
          COUNT(r.id) AS total_ratings,
          COALESCE(AVG(r.rating), 0) AS average_rating
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        WHERE s.owner_id IS NOT NULL
        GROUP BY s.owner_id
      ) owner_stats ON owner_stats.owner_id = u.id
      WHERE 1 = 1
    `;

    const values = [];

    if (name && name.trim()) {
      sql += " AND u.name LIKE ?";
      values.push(`%${name.trim()}%`);
    }

    if (email && email.trim()) {
      sql += " AND u.email LIKE ?";
      values.push(`%${email.trim()}%`);
    }

    if (address && address.trim()) {
      sql += " AND u.address LIKE ?";
      values.push(`%${address.trim()}%`);
    }

    if (role && role.trim()) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role filter"
        });
      }

      sql += " AND u.role = ?";
      values.push(role);
    }

    sql += ` ORDER BY ${sortField} ${sortOrder}, u.id ASC`;

    const [users] = await pool.query(sql, values);

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users"
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof address !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields must contain valid values"
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanAddress = address.trim();

    if (cleanName.length < 20 || cleanName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 20 to 60 characters"
      });
    }

    if (cleanAddress.length === 0 || cleanAddress.length > 400) {
      return res.status(400).json({
        success: false,
        message: "Address is required and cannot exceed 400 characters"
      });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address"
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8 to 16 characters with at least one uppercase letter and one special character"
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role"
      });
    }

    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users
        (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        cleanName,
        cleanEmail,
        hashedPassword,
        cleanAddress,
        role
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        address: cleanAddress,
        role
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user"
    });
  }
};

const getAllRatings = async (req, res) => {
  try {
    const [ratings] = await pool.query(`
      SELECT
        r.id,
        r.rating,
        r.created_at AS ratingDate,
        u.name AS customerName,
        u.email AS customerEmail,
        s.name AS storeName
      FROM ratings r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC, r.id DESC
    `);

    return res.status(200).json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    console.error("Get ratings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ratings"
    });
  }
};

const deleteUser = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    if (userId === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own account"
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    const [admins] = await connection.query(
      "SELECT id FROM users WHERE role = 'admin' ORDER BY id FOR UPDATE"
    );

    const [users] = await connection.query(
      "SELECT id, role FROM users WHERE id = ? FOR UPDATE",
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (users[0].role === "admin" && admins.length <= 1) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "The last administrator cannot be removed"
      });
    }

    await connection.query(
      "DELETE FROM ratings WHERE user_id = ?",
      [userId]
    );

    await connection.query(
      "UPDATE stores SET owner_id = NULL WHERE owner_id = ?",
      [userId]
    );

    await connection.query(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "User removed successfully"
    });
  } catch (error) {
    console.error("Remove user error:", error);

    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Transaction rollback error:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to remove user"
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  createUser,
  getAllRatings,
  deleteUser
};
