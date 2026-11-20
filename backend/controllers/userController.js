
const { db: pool } = require("../config/db");

const getStoresForUser = async (req, res) => {
  try {
    const { search = "", sortBy = "name", order = "ASC" } = req.query;

    const allowedSortFields = ["name", "address", "average_rating"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const [stores] = await pool.query(
      `SELECT
        s.id,
        s.name,
        s.address,
        COALESCE(AVG(allRatings.rating), 0) AS average_rating,
        COUNT(allRatings.id) AS total_ratings,
        userRating.rating AS user_rating
      FROM stores s
      LEFT JOIN ratings allRatings ON s.id = allRatings.store_id
      LEFT JOIN ratings userRating
        ON s.id = userRating.store_id AND userRating.user_id = ?
      WHERE s.name LIKE ? OR s.address LIKE ?
      GROUP BY s.id, userRating.rating
      ORDER BY ${sortField === "average_rating" ? "average_rating" : `s.${sortField}`} ${sortOrder}`,
      [req.user.id, `%${search}%`, `%${search}%`]
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error("Get Stores For User Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve stores"
    });
  }
};

module.exports = {
  getStoresForUser
};
