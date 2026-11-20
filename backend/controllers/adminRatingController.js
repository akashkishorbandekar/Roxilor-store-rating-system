
const { db: pool } = require("../config/db");

const getAllRatings = async (req, res) => {
  try {
    const [ratings] = await pool.query(`
      SELECT
        r.id,
        u.name AS user_name,
        u.email AS user_email,
        s.name AS store_name,
        r.rating,
        r.created_at,
        r.updated_at
      FROM ratings r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    console.error("Get ratings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch ratings."
    });
  }
};

module.exports = { getAllRatings };
