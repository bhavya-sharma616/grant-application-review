const express = require("express");

const { declareConflict,getConflicts, getApplicationConflicts } = require("../controllers/conflictController");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/application/:applicationId",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  getApplicationConflicts
);
router.get("/",protect,allowRoles("REVIEWER"),getConflicts);

router.post(
  "/:applicationId",
  protect,
  allowRoles("REVIEWER"),
  declareConflict
);

module.exports = router;