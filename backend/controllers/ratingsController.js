
const { db: pool } = require("../config/db");

const submitRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = Number(req.user?.id);

    if (!Number.isSafeInteger(user_id) || user_id <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user"
      });
    }

    if (store_id === undefined || store_id === null || store_id === "") {
      return res.status(400).json({
        success: false,
        message: "Store ID is required"
      });
    }

    if (rating === undefined || rating === null || rating === "") {
      return res.status(400).json({
        success: false,
        message: "Rating is required"
      });
    }

    const storeId = Number(store_id);
    const ratingValue = Number(rating);

    if (!Number.isSafeInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID"
      });
    }

    if (
      !Number.isInteger(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    const [stores] = await pool.query(
      "SELECT id FROM stores WHERE id = ?",
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rating = ?,
         updated_at = CURRENT_TIMESTAMP`,
      [user_id, storeId, ratingValue, ratingValue]
    );

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully"
    });
  } catch (error) {
    console.error("Submit rating error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit rating"
    });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user"
      });
    }

    const [ratings] = await pool.query(
      `SELECT
         r.id,
         r.store_id,
         s.name AS store_name,
         r.rating,
         r.created_at,
         r.updated_at
       FROM ratings r
       INNER JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.updated_at DESC, r.id DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    console.error("Get user ratings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ratings"
    });
  }
};

module.exports = {
  submitRating,
  getUserRatings
};
