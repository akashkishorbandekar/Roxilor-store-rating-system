
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  submitRating,
  getUserRatings
} = require("../controllers/ratingsController");

router.post("/", protect, authorizeRoles("user"), submitRating);

router.get("/my-ratings", protect, authorizeRoles("user"), getUserRatings);

module.exports = router;
