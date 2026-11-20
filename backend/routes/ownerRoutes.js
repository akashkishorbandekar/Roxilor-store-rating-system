
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const { getOwnerDashboard } = require("../controllers/ownerController");

router.get("/dashboard", protect, authorizeRoles("store_owner"), getOwnerDashboard);

module.exports = router;
