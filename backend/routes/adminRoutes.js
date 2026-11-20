const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  createUser,
  getAllRatings,
  deleteUser
} = require("../controllers/adminController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

router.post(
  "/users",
  protect,
  authorizeRoles("admin"),
  createUser
);

router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);

router.get(
  "/ratings",
  protect,
  authorizeRoles("admin"),
  getAllRatings
);

module.exports = router;