const express = require("express");
const router = express.Router();

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

const {
  createStore,
  getAllStores,
  deleteStore
} = require("../controllers/storeController");

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createStore
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllStores
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteStore
);

module.exports = router;