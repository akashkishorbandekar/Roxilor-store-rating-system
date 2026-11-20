
const { db: pool } = require("../config/db");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof address !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and address must be valid text values"
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanAddress = address.trim();

    if (cleanName.length < 20 || cleanName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Store name must contain 20 to 60 characters"
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

    let normalizedOwnerId = null;

    if (owner_id !== undefined && owner_id !== null && owner_id !== "") {
      normalizedOwnerId = Number(owner_id);

      if (
        !Number.isSafeInteger(normalizedOwnerId) ||
        normalizedOwnerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid store owner ID"
        });
      }

      const [owners] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND role = 'store_owner'",
        [normalizedOwnerId]
      );

      if (owners.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid store owner. Select an existing store owner."
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO stores
        (name, email, address, owner_id)
       VALUES (?, ?, ?, ?)`,
      [
        cleanName,
        cleanEmail,
        cleanAddress,
        normalizedOwnerId
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      store: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        address: cleanAddress,
        owner_id: normalizedOwnerId
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A store with this email or unique information already exists"
      });
    }

    console.error("Create store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create store"
    });
  }
};

const getAllStores = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      sortBy = "name",
      order = "ASC"
    } = req.query;

    const allowedSortFields = {
      name: "s.name",
      email: "s.email",
      address: "s.address",
      average_rating: "average_rating"
    };

    const sortField =
      typeof sortBy === "string" && allowedSortFields[sortBy]
        ? allowedSortFields[sortBy]
        : "s.name";

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

    let sql = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1 = 1
    `;

    const values = [];

    if (name && name.trim()) {
      sql += " AND s.name LIKE ?";
      values.push(`%${name.trim()}%`);
    }

    if (email && email.trim()) {
      sql += " AND s.email LIKE ?";
      values.push(`%${email.trim()}%`);
    }

    if (address && address.trim()) {
      sql += " AND s.address LIKE ?";
      values.push(`%${address.trim()}%`);
    }

    sql += `
      GROUP BY
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id
      ORDER BY ${sortField} ${sortOrder}, s.id ASC
    `;

    const [stores] = await pool.query(sql, values);

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error("Get stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve stores"
    });
  }
};

const deleteStore = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const storeId = Number(req.params.id);

    if (!Number.isSafeInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID"
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    const [stores] = await connection.query(
      "SELECT id FROM stores WHERE id = ? FOR UPDATE",
      [storeId]
    );

    if (stores.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    await connection.query(
      "DELETE FROM ratings WHERE store_id = ?",
      [storeId]
    );

    await connection.query(
      "DELETE FROM stores WHERE id = ?",
      [storeId]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Store and its ratings deleted successfully"
    });
  } catch (error) {
    console.error("Delete store error:", error);

    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Store deletion rollback error:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete store"
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createStore,
  getAllStores,
  deleteStore
};
