
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getStoresForUser } = require("../controllers/userController");

router.get("/stores", protect, authorizeRoles("user"), getStoresForUser);

module.exports = router;
