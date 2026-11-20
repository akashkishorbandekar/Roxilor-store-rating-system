
const { db: pool } = require("../config/db");

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.query(
      `SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id`,
      [ownerId]
    );

    const [ratings] = await pool.query(
      `SELECT
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        s.id AS store_id,
        s.name AS store_name,
        r.rating,
        r.created_at,
        r.updated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = ?
      ORDER BY r.updated_at DESC`,
      [ownerId]
    );

    res.status(200).json({
      success: true,
      message: "Owner dashboard retrieved successfully",
      stores,
      ratings
    });
  } catch (error) {
    console.error("Get Owner Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve owner dashboard"
    });
  }
};

module.exports = {
  getOwnerDashboard
};
