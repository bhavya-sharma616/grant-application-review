const express = require("express");
const { updateApplicationStatus } = require("../controllers/statusController");

const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  archiveApplication,
  restoreApplication,
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Program Officer only
router.post(
  "/",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  createApplication
);

router.patch(
  "/:id/status",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  updateApplicationStatus
);

router.get("/", protect, getApplications);


router.get(
  "/:id",
  protect,
  getApplicationById
);

router.patch(
  "/:id",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  updateApplication
);

router.patch(
  "/:id/archive",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  archiveApplication
);

router.patch(
  "/:id/restore",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  restoreApplication
);

module.exports = router;